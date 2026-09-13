var WEBHOOK_HASH = "kftv_webhook_7x3Q9mZ2pL";
var OTP_TOKEN = "kftv_otp_5Xr7Pb2wQn";
var FIRESTORE_PROJECT = "kftv-31d71";
var FIRESTORE_ROOT =
  "https://firestore.googleapis.com/v1/projects/" +
  FIRESTORE_PROJECT +
  "/databases/(default)/documents";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var whKey = (e.parameter && e.parameter.whkey) || "";
    var req = (e.parameter && e.parameter.req) || "";

    // ---- 0) Sign-in OTP (same sender account as letters) ----
    if (req === "sendotp") return sendOtp(data);
    if (req === "verifyotp") return verifyOtp(data);

    // ---- 1) Flutterwave payment webhook ----
    // Apps Script web apps cannot read custom headers, so Flutterwave calls
    // <url>?whkey=... and we compare it here.
    if (whKey === WEBHOOK_HASH) {
      handleWebhook(data);
      return ok();
    }

    // ---- 2) Letter sending (unchanged) ----
    if (data.token !== "kftv_admission_9f2c7b1e") {
      return jsonOut({ status: "error", message: "Unauthorized" });
    }

    var cleanBase64 = data.pdfBase64.replace(/^data:application\/pdf;base64,/, "");
    var decoded = Utilities.base64Decode(cleanBase64);
    var pdfBlob = Utilities.newBlob(decoded, "application/pdf", data.fileName);

    GmailApp.sendEmail(data.to_email, data.subject, data.message, {
      from: data.fromEmail || "Admission@kftv.org",
      name: "Kigali Film and Television School",
      replyTo: "Admission@kftv.org",
      attachments: [pdfBlob]
    });

    return ok();
  } catch (error) {
    return jsonOut({ status: "error", message: error.toString() });
  }
}

// ---------------------------------------------------------------- OTP -------
// Codes are stored in the script cache (NOT Firestore — anonymous web-app
// tokens cannot use the Firestore "datastore" scope, 403).

function sendOtp(body) {
  if ((body.token || "") !== OTP_TOKEN)
    return jsonOut({ status: "error", message: "Unauthorized" });
  var email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return jsonOut({ status: "error", message: "Invalid email address" });

  var code = String(Math.floor(100000 + Math.random() * 900000));
  var exp = Date.now() + 10 * 60 * 1000; // 10 minutes
  CacheService.getScriptCache().put("kftv_otp:" + email, JSON.stringify({ code: code, exp: exp }), 600);

  try {
    GmailApp.sendEmail(
      email,
      "Your KFTV sign-in code",
      "Your Kigali Film and Television School sign-in code is: " + code + ".\n\n" +
      "This code expires in 10 minutes. If you did not request it, you can ignore this email.\n\n" +
      "Kigali Film and Television School",
      {
        from: "Admission@kftv.org",
        name: "Kigali Film and Television School",
        replyTo: "Admission@kftv.org"
      }
    );
  } catch (err) {
    return jsonOut({ status: "error", message: "Failed to send code: " + err.toString() });
  }
  return jsonOut({ status: "success", message: "Code sent" });
}

function verifyOtp(body) {
  if ((body.token || "") !== OTP_TOKEN)
    return jsonOut({ status: "error", message: "Unauthorized" });
  var email = String(body.email || "").trim().toLowerCase();
  var code = String(body.code || "").trim();
  if (!email || !code)
    return jsonOut({ status: "error", message: "Email and code are required" });

  var cached = CacheService.getScriptCache().get("kftv_otp:" + email);
  if (!cached)
    return jsonOut({ status: "error", message: "No code was sent to this email" });
  var parsed = {};
  try { parsed = JSON.parse(cached); } catch (err) {}
  if (parsed.code !== code || Date.now() > (parsed.exp || 0))
    return jsonOut({ status: "error", message: "Incorrect or expired code" });

  CacheService.getScriptCache().remove("kftv_otp:" + email);

  return jsonOut({ status: "success", email: email });
}

// ---------------------------------------------------------------- webhook --

function handleWebhook(data) {
  var d = (data && data.data) || {};
  var status = String(d.status || "").toLowerCase();
  var txRef = String(d.tx_ref || "");
  if (status !== "successful") return;
  if (txRef.indexOf("kftv-reg-") === 0) recordRegistration(d);
  else if (txRef.indexOf("kftv-tuition-") === 0) recordTuition(d);
}

function recordRegistration(d) {
  var m = /^kftv-reg-(.+)-(\d+)$/.exec(d.tx_ref);
  if (!m) return;
  var appId = m[1];
  if (paymentExists(appId, d.id)) return;
  appendPayment(appId, {
    type: "registration",
    amount: Number(d.amount) || 0,
    currency: d.currency || "RWF",
    status: "successful",
    flutterwave_ref: String(d.id),
    paidAt: new Date().toISOString()
  });
}

function recordTuition(d) {
  var m = /^kftv-tuition-(.+)-(3m|6m|1y)-(\d+)$/.exec(d.tx_ref);
  if (!m) return;
  var appId = m[1];
  var durKey = m[2];
  if (paymentExists(appId, d.id)) return;
  var label = durKey === "3m" ? "3 Months" : durKey === "6m" ? "6 Months" : "1 Year";
  appendPayment(appId, {
    type: "tuition",
    amount: Number(d.amount) || 0,
    currency: d.currency || "RWF",
    duration: label,
    status: "successful",
    flutterwave_ref: String(d.id),
    paidAt: new Date().toISOString()
  });
  ensureAdmissionNumber(appId);
}

function paymentExists(appId, txId) {
  var doc = fsGet("applications/" + appId);
  if (!doc) return false;
  var arr = (doc.fields || {}).payments;
  if (!arr || !arr.arrayValue) return false;
  return (arr.arrayValue.values || []).some(function (v) {
    var p = (v.mapValue && v.mapValue.fields) || {};
    return p.flutterwave_ref && p.flutterwave_ref.stringValue === String(txId);
  });
}

function appendPayment(appId, paymentObj) {
  var doc = fsGet("applications/" + appId);
  if (!doc) return;
  var existing = [];
  var arr = (doc.fields || {}).payments;
  if (arr && arr.arrayValue && arr.arrayValue.values) existing = arr.arrayValue.values;

  var dup = existing.some(function (v) {
    var p = (v.mapValue && v.mapValue.fields) || {};
    return p.flutterwave_ref && p.flutterwave_ref.stringValue === String(paymentObj.flutterwave_ref);
  });
  if (dup) return;

  existing.push({ mapValue: { fields: toFirestoreFields(paymentObj) } });
  fsPatch("applications/" + appId, {
    fields: {
      payments: { arrayValue: { values: existing } }
    },
    updateMask: { fieldPaths: ["payments"] }
  });
}

function toFirestoreFields(obj) {
  var out = {};
  Object.keys(obj).forEach(function (k) {
    var v = obj[k];
    if (typeof v === "number") out[k] = { integerValue: String(Math.round(v)) };
    else out[k] = { stringValue: String(v) };
  });
  return out;
}

function ensureAdmissionNumber(appId) {
  var doc = fsGet("applications/" + appId);
  if (!doc) return;
  if ((doc.fields || {}).admissionNo && (doc.fields || {}).admissionNo.stringValue) return;
  var num = nextAdmissionNumber();
  fsPatch("applications/" + appId, {
    fields: { admissionNo: { stringValue: num } },
    updateMask: { fieldPaths: ["admissionNo"] }
  });
}

function nextAdmissionNumber() {
  var path = "counters/admissionNumber";
  var c = fsGet(path);
  var current = 0;
  if (c && (c.fields || {}).current) {
    current = parseInt((c.fields || {}).current.integerValue || "0", 10);
  }
  var next = current + 1;
  if (c) {
    fsPatch(path, {
      fields: { current: { integerValue: String(next) } },
      updateMask: { fieldPaths: ["current"] }
    });
  } else {
    fsCreateCountersDoc(next);
  }
  var yr = new Date().getFullYear().toString().slice(-2);
  var seq = ("0000" + next).slice(-4);
  return "KFTV" + yr + seq;
}

function fsCreateCountersDoc(value) {
  var url =
    FIRESTORE_ROOT + "/counters?documentId=admissionNumber";
  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: authHeaders(),
    payload: JSON.stringify({ fields: { current: { integerValue: String(value) } } }),
    muteHttpExceptions: true
  });
}

// --------------------------------------------------------------- firestore --

function fsGet(docPath) {
  var url = FIRESTORE_ROOT + "/" + encodePath(docPath);
  var res = UrlFetchApp.fetch(url, {
    method: "get",
    headers: authHeaders(),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() === 404) return null;
  return JSON.parse(res.getContentText());
}

function fsPatch(docPath, body) {
  var url = FIRESTORE_ROOT + "/" + encodePath(docPath);
  UrlFetchApp.fetch(url, {
    method: "patch",
    contentType: "application/json",
    headers: authHeaders(),
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });
}

function encodePath(p) {
  return p.split("/").map(encodeURIComponent).join("/");
}

function authHeaders() {
  return { Authorization: "Bearer " + ScriptApp.getOAuthToken() };
}

// ------------------------------------------------------------------ helpers --

function ok() {
  return jsonOut({ status: "success" });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}