// Firebase Config & Shared Helpers
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { OTP_WEB_APP_URL, OTP_TOKEN } from "./config";

const firebaseConfig = {
  apiKey: "AIzaSyDq3jajU4rC3WRQQ5gV1__R5lc-H3-a3aw",
  authDomain: "kftv-31d71.firebaseapp.com",
  projectId: "kftv-31d71",
  storageBucket: "kftv-31d71.firebasestorage.app",
  messagingSenderId: "997317613738",
  appId: "1:997317613738:web:536e04d069992948e5d8d3",
  measurementId: "G-MNC2NBMSTG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// Admin recognition.
const ADMIN_EMAILS = [
  "kftv.admin@kftv.com",
  "kftv@admin.com"
];

let __adminCache = null;

async function maybeAdmin() {
  const user = auth.currentUser;
  if (!user) return false;
  if (__adminCache && __adminCache.uid === user.uid) return __adminCache.value;
  const value = (user.email || "").toLowerCase() in
    Object.fromEntries(ADMIN_EMAILS.map(e => [e.toLowerCase(), true]));
  __adminCache = { uid: user.uid, value };
  return value;
}

function clearAdminCache() {
  __adminCache = null;
}

function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
}

function signInWithGoogle() {
  return auth.signInWithPopup(provider);
}

function signInAdminWithEmail(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

async function fetchSignInMethods(email) {
  return auth.fetchSignInMethodsForEmail(String(email || "").trim().toLowerCase());
}

// Detect whether an email already has an account.
//
// Two signals are used:
//   1) Firebase sign-in methods (works when the project's "email enumeration
//      protection" is turned off in the console).
//   2) Our own public "emails" registry (collection /emails), written on every
//      sign-up/login, which lets the sign-up form know an email is taken even
//      though the project keeps Firebase's enumeration protection ON.
//
// Returns { exists: true|false|null, methods } — null means "not detectable"
// yet, in which case the OTP flow proceeds and the verify step guards account
// creation.
async function checkAccountExists(email) {
  const clean = String(email || "").trim().toLowerCase();
  try {
    const methods = await auth.fetchSignInMethodsForEmail(clean) || [];
    if (methods.length > 0) return { exists: true, methods };
  } catch {
    // Ignore — try the registry below.
  }
  try {
    const doc = await db.collection("emails").doc(clean).get();
    if (doc.exists) return { exists: true, methods: ["password"] };
  } catch {
    // Registry unreadable (e.g. rules not deployed yet) — fall through.
  }
  return { exists: null, methods: [] };
}

// Best-effort index that remembers an email the moment that account is used,
// so a later sign-up attempt for the same email can be blocked before any OTP
// is sent. Requires the /emails rule from firestore.rules to be deployed.
async function registerKnownEmail(email) {
  const clean = String(email || "").trim().toLowerCase();
  try {
    await db.collection("emails").doc(clean).set({ email: clean }, { merge: true });
  } catch {
    // Non-fatal — the account still works; only early duplicate detection is lost.
  }
}

async function sendPasswordReset(email) {
  return auth.sendPasswordResetEmail(String(email || "").trim().toLowerCase());
}

function signOutUser() {
  clearAdminCache();
  return auth.signOut();
}

// ---------------------------------------------------------------------------
// Email OTP via Apps Script (sends 6-digit code to verify email)
// ---------------------------------------------------------------------------

async function postAppsScript(req, payload, attempts = 3) {
  const url = OTP_WEB_APP_URL + (OTP_WEB_APP_URL.includes("?") ? "&" : "?") + "req=" + req + "&t=" + Date.now();
  let lastErr = {
    status: "error",
    transport: true,
    message: "The verification service is having trouble. Try again in a moment."
  };
  for (let i = 0; i < attempts; i++) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ token: OTP_TOKEN, ...payload }),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      });
      const raw = await resp.text();
      try {
        return JSON.parse(raw);
      } catch {
        // Google's Apps Script relay intermittently answers with an error page
        // (e.g. a Drive "page not found") instead of the JSON the script
        // returned. The script may still have run, so treat this as a
        // transport glitch and retry.
        lastErr = {
          status: "error",
          transport: true,
          message: "The verification service is having trouble. Try again in a moment."
        };
      }
    } catch (err) {
      lastErr = {
        status: "error",
        transport: true,
        message: err.message || "Network error. Check your connection and try again."
      };
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 700 * (i + 1)));
  }
  return lastErr;
}

// Sends a 6-digit code to the given email via Apps Script.
async function sendEmailOtp(email) {
  return postAppsScript("sendotp", { email: String(email || "").trim().toLowerCase() });
}

// Verifies the emailed code. Returns { status, email }.
async function verifyEmailOtp(email, code) {
  return postAppsScript("verifyotp", {
    email: String(email || "").trim().toLowerCase(),
    code: String(code || "").trim()
  });
}

// After OTP is verified: sign in if the account already exists, otherwise
// create it using the password the applicant chose.
async function signInAfterOtp(email, password) {
  const trimmedEmail = String(email || "").trim().toLowerCase();
  try {
    const cred = await auth.signInWithEmailAndPassword(trimmedEmail, password);
    return cred.user;
  } catch {
    // Sign-in failed (no account yet, or wrong password). Creating the account
    // succeeds for brand-new emails; for an existing email it throws
    // email-already-in-use (wrong password, or a Google-only account).
    try {
      const cred = await auth.createUserWithEmailAndPassword(trimmedEmail, password);
      return cred.user;
    } catch (err2) {
      if (err2 && err2.code === "auth/email-already-in-use") {
        const custom = new Error(
          "An account already exists for this email. Check your password, or sign in with Google."
        );
        custom.code = "EMAIL_EXISTS";
        throw custom;
      }
      throw err2;
    }
  }
}

function requireAuth(redirectUrl) {
  return new Promise((resolve) => {
    onAuthStateChanged((user) => {
      if (!user) {
        window.location.href = redirectUrl || "/login";
      } else {
        resolve(user);
      }
    });
  });
}

function requireAdmin(redirectUrl) {
  return new Promise((resolve) => {
    onAuthStateChanged((user) => {
      if (!user) {
        window.location.href = redirectUrl || "/login";
        return;
      }
      maybeAdmin().then((isAdmin) => {
        if (!isAdmin) {
          window.location.href = "/profile";
        } else {
          resolve(user);
        }
      });
    });
  });
}

// Firestore helpers — applicant (student) only
async function saveUserDoc(user) {
  // Create or update the applicant's own record in the "users" (applicants) collection.
  await db.collection("users").doc(user.uid).set({
    name: user.displayName,
    email: user.email,
    photo: user.photoURL,
    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  // Remember this email in the public known-emails registry so the sign-up form
  // can detect an existing account before sending a verification code.
  await registerKnownEmail(user && user.email);
}

async function saveAdminDoc(_user) {
  // Admin recognition is email-based (see ADMIN_EMAILS in maybeAdmin),
  // so no Firestore write is required here.
}

async function getUserDoc(uid) {
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? doc.data() : null;
}

async function saveApplication(data) {
  const ref = await db.collection("applications").add({
    ...data,
    status: "submitted", // automated flow — no admin review step
    payments: [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  // Link the application back to the applicant's user record so the applicant
  // is always tracked as a user, not just as a raw application.
  if (data.userId) {
    await db.collection("users").doc(data.userId).set(
      { applicationId: ref.id },
      { merge: true }
    );
  }
  return ref;
}

async function getUserApplication(uid) {
  const snap = await db.collection("applications").where("userId", "==", uid).limit(1).get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

async function updateApplication(appId, data) {
  return db.collection("applications").doc(appId).update(data);
}

async function getAllApplications(filters = {}) {
  let query = db.collection("applications").orderBy("createdAt", "desc");
  if (filters.status) query = query.where("status", "==", filters.status);
  if (filters.course) query = query.where("course", "==", filters.course);
  const snap = await query.get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getIntake(category) {
  const doc = await db.collection("intakes").doc(category).get();
  return doc.exists ? doc.data() : null;
}

async function getNextIntake(category) {
  const snap = await db.collection("intakes")
    .where("category", "==", category)
    .where("status", "!=", "closed")
    .orderBy("status")
    .orderBy("currentPeriod")
    .limit(1)
    .get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

async function updatePayment(appId, paymentData) {
  return db.collection("applications").doc(appId).update({
    payments: firebase.firestore.FieldValue.arrayUnion(paymentData)
  });
}

export {
  firebase,
  auth,
  db,
  provider,
  ADMIN_EMAILS,
  maybeAdmin,
  clearAdminCache,
  onAuthStateChanged,
  signInWithGoogle,
  signInAdminWithEmail,
  signOutUser,
  fetchSignInMethods,
  checkAccountExists,
  registerKnownEmail,
  sendPasswordReset,
  sendEmailOtp,
  verifyEmailOtp,
  signInAfterOtp,
  requireAuth,
  requireAdmin,
  saveUserDoc,
  saveAdminDoc,
  getUserDoc,
  saveApplication,
  getUserApplication,
  updateApplication,
  getAllApplications,
  getIntake,
  getNextIntake,
  updatePayment
};