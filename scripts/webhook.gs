var WEBHOOK_HASH = "kftv_webhook_7x3Q9mZ2pL";
var OTP_TOKEN = "kftv_otp_5Xr7Pb2wQn";
var FIRESTORE_PROJECT = "kftv-31d71";
var ROOT = "https://firestore.googleapis.com/v1/projects/" + FIRESTORE_PROJECT + "/databases/(default)/documents";

function doPost(e) {
  try {
    var body = {};
    try { body = JSON.parse(e.postData.contents); } catch (err) {}
    var req = (e.parameter && e.parameter.req) || "";

    // ---- OTP sign-in endpoints (frontend -> school email) ----
    if (req === "sendotp") {
      return sendOtp(body);
    }
    if (req === "verifyotp") {
      return verifyOtp(body);
    }

    // ---- Flutterwave payment webhook (whkey gate) ----
    if (!e.parameter || e.parameter.whkey !== WEBHOOK_HASH)
      return out({ status: "error", message: "Unauthorized" });
    if (e.parameter.test === "1")
      return out({ status: "ok", probe: probe() });
    handle(body);
    return out({ status: "success" });
  } catch (err) {
    return out({ status: "error", message: err.toString() });
  }
}

// ---------------------------------------------------------------- OTP -------

function sendOtp(body) {
  if ((body.token || "") !== OTP_TOKEN)
    return out({ status: "error", message: "Unauthorized" });
  var email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return out({ status: "error", message: "Invalid email address" });

  var code = String(Math.floor(100000 + Math.random() * 900000));
  var exp = Date.now() + 10 * 60 * 1000; // 10 minutes
  // Store in script cache, NOT Firestore: anonymous web-app tokens cannot use
  // the Firestore "datastore" scope (403 ACCESS_TOKEN_SCOPE_INSUFFICIENT).
  CacheService.getScriptCache().put("kftv_otp:" + email, JSON.stringify({ code: code, exp: exp }), 600);

  try {
    GmailApp.sendEmail(
      email,
      "Your KFTV sign-in code",
      "Your Kigali Film and Television School sign-in code is: " + code + ".\n\n" +
      "This code expires in 10 minutes. If you did not request it, you can ignore this email.\n\n" +
      "Kigali Film and Television School"
    );
  } catch (err) {
    return out({ status: "error", message: "Failed to send code: " + err.toString() });
  }
  return out({ status: "success", message: "Code sent" });
}

function verifyOtp(body) {
  if ((body.token || "") !== OTP_TOKEN)
    return out({ status: "error", message: "Unauthorized" });
  var email = String(body.email || "").trim().toLowerCase();
  var code = String(body.code || "").trim();
  if (!email || !code)
    return out({ status: "error", message: "Email and code are required" });

  var cached = CacheService.getScriptCache().get("kftv_otp:" + email);
  if (!cached)
    return out({ status: "error", message: "No code was sent to this email" });
  var parsed = {};
  try { parsed = JSON.parse(cached); } catch (err) {}
  if (parsed.code !== code || Date.now() > (parsed.exp || 0))
    return out({ status: "error", message: "Incorrect or expired code" });

  CacheService.getScriptCache().remove("kftv_otp:" + email);

  return out({ status: "success", email: email });
}

function remove(p) {
  var r = UrlFetchApp.fetch(ROOT + "/" + enc(p),
    { method: "delete", headers: auth(), muteHttpExceptions: true });
  var code = r.getResponseCode();
  if (code >= 300 && code !== 404)
    throw new Error("DELETE " + p + " -> " + code + " " + r.getContentText().slice(0, 200));
}

function handle(data) {
  var d = (data && data.data) || {};
  if (String(d.status || "").toLowerCase() !== "successful") return;
  var tx = String(d.tx_ref || "");
  if (tx.indexOf("kftv-reg-") === 0) reg(d);
  else if (tx.indexOf("kftv-tuition-") === 0) tuit(d);
}

function reg(d) {
  var m = /^kftv-reg-(.+)-(\d+)$/.exec(d.tx_ref); if (!m) return;
  addPayment(m[1], { type: "registration", amount: +d.amount || 0,
    currency: d.currency || "RWF", status: "successful",
    flutterwave_ref: String(d.id), paidAt: new Date().toISOString() });
}

function tuit(d) {
  var m = /^kftv-tuition-(.+)-(1m|3m|6m|1y)-(\d+)$/.exec(d.tx_ref); if (!m) return;
  var label = m[2] === "1m" ? "1 Month" : m[2] === "3m" ? "3 Months" : m[2] === "6m" ? "6 Months" : "1 Year";
  addPayment(m[1], { type: "tuition", amount: +d.amount || 0,
    currency: d.currency || "RWF", duration: label, status: "successful",
    flutterwave_ref: String(d.id), paidAt: new Date().toISOString() });
  admissionNo(m[1]);
}

function addPayment(appId, p) {
  var doc = get("applications/" + appId); if (!doc) return;
  var arr = (((doc.fields || {}).payments || {}).arrayValue || {}).values || [];
  if (arr.some(function (v) { var f = (v.mapValue || {}).fields || {};
    return f.flutterwave_ref && f.flutterwave_ref.stringValue === String(p.flutterwave_ref); })) return;
  arr.push({ mapValue: { fields: toFs(p) } });
  patch("applications/" + appId, { fields: { payments: { arrayValue: { values: arr } } },
    updateMask: { fieldPaths: ["payments"] } });
}

function admissionNo(appId) {
  var doc = get("applications/" + appId); if (!doc) return;
  if ((doc.fields || {}).admissionNo) return;
  var c = get("counters/admissionNumber"); var cur = 0;
  if (c && (c.fields || {}).current) cur = parseInt((c.fields || {}).current.integerValue || "0", 10);
  var n = cur + 1;
  if (c) patch("counters/admissionNumber", { fields: { current: { integerValue: String(n) } },
    updateMask: { fieldPaths: ["current"] } });
  else create("counters", "admissionNumber", { current: { integerValue: String(n) } });
  var num = "KFTV" + new Date().getFullYear().toString().slice(-2) + ("0000" + n).slice(-4);
  patch("applications/" + appId, { fields: { admissionNo: { stringValue: num } },
    updateMask: { fieldPaths: ["admissionNo"] } });
}

function toFs(o) { var r = {}; Object.keys(o).forEach(function (k) {
  r[k] = typeof o[k] === "number" ? { integerValue: String(Math.round(o[k])) } : { stringValue: String(o[k]) }; }); return r; }

function probe() {
  var r = UrlFetchApp.fetch(ROOT + "/counters/admissionNumber",
    { headers: auth(), muteHttpExceptions: true });
  var code = r.getResponseCode();
  var body = r.getContentText();
  if (code === 404) return { http: 404, found: false, note: "counters/admissionNumber does not exist yet (normal if no tuition paid)" };
  if (code !== 200) return { http: code, body: body.slice(0, 300) };
  return { http: 200, found: true, body: JSON.parse(body) };
}

function get(p) {
  var r = UrlFetchApp.fetch(ROOT + "/" + enc(p),
    { headers: auth(), muteHttpExceptions: true });
  var code = r.getResponseCode();
  if (code === 404) return null;
  if (code !== 200)
    throw new Error("GET " + p + " -> " + code + " " + r.getContentText().slice(0, 300));
  return JSON.parse(r.getContentText());
}
function patch(p, b) {
  var url = ROOT + "/" + enc(p);
  if (b && b.updateMask && b.updateMask.fieldPaths) {
    var qs = b.updateMask.fieldPaths.map(function (fp) {
      return "updateMask.fieldPaths=" + encodeURIComponent(fp);
    });
    url += "?" + qs.join("&");
  }
  var r = UrlFetchApp.fetch(url,
    { method: "patch", contentType: "application/json", headers: auth(),
      payload: JSON.stringify({ fields: b.fields }), muteHttpExceptions: true });
  var code = r.getResponseCode();
  if (code >= 300)
    throw new Error("PATCH " + p + " -> " + code + " " + r.getContentText().slice(0, 300));
}
function create(coll, id, fields) {
  var r = UrlFetchApp.fetch(ROOT + "/" + coll + "?documentId=" + id,
    { method: "post", contentType: "application/json", headers: auth(),
      payload: JSON.stringify({ fields: fields }), muteHttpExceptions: true });
  var code = r.getResponseCode();
  if (code >= 300)
    throw new Error("CREATE " + coll + "/" + id + " -> " + code + " " + r.getContentText().slice(0, 300));
}
function enc(p) { return p.split("/").map(encodeURIComponent).join("/"); }
function auth() { return { Authorization: "Bearer " + ScriptApp.getOAuthToken() }; }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
