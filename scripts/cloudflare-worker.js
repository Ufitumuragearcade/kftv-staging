const SECRET_HASH = "kftv_webhook_7x3Q9mZ2pL";
const FIREBASE_REST =
  "https://firestore.googleapis.com/v1/projects/kftv-31d71/databases/(default)/documents";
const TOKEN_URI = "https://oauth2.googleapis.com/token";
const SCOPES = "https://www.googleapis.com/auth/datastore";

let __tokenCache = { token: "", exp: 0 };

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function b64urlEncode(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function importRsaKey(pem) {
  const b64 = pem
    .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/, "")
    .replace(/-----END (RSA )?PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
}

async function makeJwt(sa) {
  const enc = new TextEncoder();
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    scope: SCOPES,
    aud: TOKEN_URI,
    iat: now,
    exp: now + 3600
  };
  const h = b64urlEncode(enc.encode(JSON.stringify(header)));
  const p = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const key = await importRsaKey(sa.private_key);
  const sig = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    enc.encode(h + "." + p)
  );
  return h + "." + p + "." + b64urlEncode(new Uint8Array(sig));
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  if (__tokenCache.token && now < __tokenCache.exp - 60) return __tokenCache.token;
  const assertion = await makeJwt(sa);
  const res = await fetch(TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(
      "OAuth token exchange failed: " + res.status + " " + JSON.stringify(data)
    );
  }
  __tokenCache = { token: data.access_token, exp: now + (data.expires_in || 3600) };
  return __tokenCache.token;
}

async function fsCall(sa, pathAndQuery, method = "GET", body = null) {
  const token = await getAccessToken(sa);
  const headers = { Authorization: "Bearer " + token };
  const init = { method, headers };
  if (body !== null) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await fetch(FIREBASE_REST + "/" + pathAndQuery, init);
  if (res.status === 404) return null;
  const text = await res.text();
  if (!res.ok) {
    throw new Error(method + " " + pathAndQuery + " -> " + res.status + " " + text.slice(0, 300));
  }
  return text ? JSON.parse(text) : null;
}

function toFs(o) {
  const r = {};
  for (const k of Object.keys(o)) {
    r[k] =
      typeof o[k] === "number"
        ? { integerValue: String(Math.round(o[k])) }
        : { stringValue: String(o[k]) };
  }
  return r;
}

async function issueAdmissionNo(sa, appId) {
  const doc = await fsCall(sa, "applications/" + appId);
  if (!doc || (doc.fields || {}).admissionNo) return;
  const c = await fsCall(sa, "counters/admissionNumber");
  let cur = 0;
  if (c && (c.fields || {}).current)
    cur = parseInt(((c.fields || {}).current).integerValue || "0", 10);
  const n = cur + 1;
  if (c) {
    await fsCall(
      sa,
      "counters/admissionNumber?updateMask.fieldPaths=current",
      "PATCH",
      { fields: { current: { integerValue: String(n) } } }
    );
  } else {
    await fsCall(sa, "counters?documentId=admissionNumber", "POST", {
      fields: { current: { integerValue: String(n) } }
    });
  }
  const num = "KFTV" + String(new Date().getFullYear()).slice(-2) + ("0000" + n).slice(-4);
  await fsCall(
    sa,
    "applications/" + appId + "?updateMask.fieldPaths=admissionNo",
    "PATCH",
    { fields: { admissionNo: { stringValue: num } } }
  );
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return json({ status: "error", message: "Method not allowed" }, 405);
    }
    if ((request.headers.get("verif-hash") || "") !== SECRET_HASH) {
      return json({ status: "error", message: "Invalid signature" }, 401);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ status: "error", message: "Invalid JSON" }, 400);
    }

    try {
      if (!env.FIREBASE_SA) {
        throw new Error("FIREBASE_SA secret is not configured");
      }
      const sa = JSON.parse(env.FIREBASE_SA);

      const d = (body && body.data) || {};
      if (String(d.status || "").toLowerCase() !== "successful") {
        return json({ status: "ignored" });
      }

      const tx = String(d.tx_ref || "");
      let appId = null;
      const payment = {
        type: "registration",
        amount: +d.amount || 0,
        currency: d.currency || "RWF",
        status: "successful",
        flutterwave_ref: String(d.id),
        paidAt: new Date().toISOString()
      };

      if (tx.indexOf("kftv-tuition-") === 0) {
        const m = /^kftv-tuition-(.+)-(1m|3m|6m|1y)-(\d+)$/.exec(tx);
        if (!m) return json({ status: "ignored" });
        appId = m[1];
        payment.type = "tuition";
        payment.duration =
          m[2] === "1m" ? "1 Month" : m[2] === "3m" ? "3 Months" : m[2] === "6m" ? "6 Months" : "1 Year";
      } else if (tx.indexOf("kftv-reg-") === 0) {
        const m = /^kftv-reg-(.+)-(\d+)$/.exec(tx);
        if (!m) return json({ status: "ignored" });
        appId = m[1];
      } else {
        return json({ status: "ignored" });
      }

      const doc = await fsCall(sa, "applications/" + appId);
      if (!doc) return json({ status: "ignored" });

      const arr = ((((doc.fields || {}).payments || {}).arrayValue || {}).values) || [];
      const dup = arr.some((v) => {
        const f = (((v || {}).mapValue || {}).fields) || {};
        return f.flutterwave_ref && f.flutterwave_ref.stringValue === payment.flutterwave_ref;
      });
      if (!dup) {
        arr.push({ mapValue: { fields: toFs(payment) } });
        await fsCall(
          sa,
          "applications/" + appId + "?updateMask.fieldPaths=payments",
          "PATCH",
          { fields: { payments: { arrayValue: { values: arr } } } }
        );
      }

      if (payment.type === "tuition") {
        await issueAdmissionNo(sa, appId);
      }

      return json({ status: "success" });
    } catch (err) {
      return json({ status: "error", message: String((err && err.message) || err) }, 500);
    }
  }
};