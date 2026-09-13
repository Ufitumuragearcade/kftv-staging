import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import {
  checkAccountExists,
  getUserApplication,
  maybeAdmin,
  onAuthStateChanged,
  saveUserDoc,
  sendEmailOtp,
  sendPasswordReset,
  signInAdminWithEmail,
  signInAfterOtp,
  signInWithGoogle,
  verifyEmailOtp
} from "../lib/firebase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Turn Firebase/technical errors into plain, human-readable messages.
function friendlyError(err) {
  if (!err) return "Something went wrong. Please try again.";
  const code = err.code;
  switch (code) {
    case "auth/invalid-email":
    case "auth/missing-email":
      return "Please enter a valid email address.";
    case "auth/email-already-in-use":
    case "EMAIL_EXISTS":
      return "This email already has an account. Use the Sign In tab with your password, or use 'Forgot password?' to reset it.";
    case "auth/user-not-found":
      return "No account was found for this email. Use the Sign Up tab to create one.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Incorrect email or password. Check your details, or use 'Forgot password?' to reset it.";
    case "auth/weak-password":
      return "That password is too weak. Please use at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a minute or two, then try again.";
    case "auth/network-request-failed":
    case "auth/internal-error":
      return "Network problem — please check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled. You can try again when you're ready.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google pop-up. Please allow pop-ups for this page and try again.";
    case "auth/account-exists-with-different-credential":
      return "This email is linked to another sign-in method. Please sign in using that method instead.";
    case "auth/operation-not-allowed":
      return "This sign-in option is unavailable right now. Please try another method.";
    case "auth/expired-action-code":
    case "auth/invalid-action-code":
      return "This link is no longer valid. Please request a new one.";
    default:
      break;
  }
  const m = typeof err.message === "string" ? err.message : "";
  if (m && m.length < 160 && !/firebase|error|error:|\{[^}]*\}/i.test(m)) return m;
  return "Something went wrong. Please try again.";
}

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [step, setStep] = useState("input"); // input | code
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("signup"); // "signup" | "signin"
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "error" | "ok", text }
  const [acctType, setAcctType] = useState(null); // null | "new" | "existing" | "google"

  useEffect(() => {
    const unsub = onAuthStateChanged((user) => {
      if (!user) return;
      postLogin(user);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function postLogin(user) {
    setLoginSuccess(true);
    let dest = "/apply";
    try {
      await saveUserDoc(user);
      if (await maybeAdmin()) {
        dest = "/admin";
      } else {
        const app = await getUserApplication(user.uid);
        dest = app ? "/profile" : "/apply";
      }
    } catch {
      dest = "/apply";
    }
    navigate(dest);
  }

  // Detect whether this email already has an account (used to label the form).
  async function checkAccountType(cleanEmail) {
    if (!EMAIL_RE.test(cleanEmail)) return;
    try {
      const { exists, methods } = await checkAccountExists(cleanEmail);
      const isGoogle = methods.includes("google.com");
      const isPw = methods.includes("password");
      if (exists === true && isGoogle && !isPw) setAcctType("google");
      else if (exists === true && isPw) setAcctType("existing");
      else if (exists === false) setAcctType("new");
      else setAcctType(null);
    } catch {
      // handleSendCode re-checks; nothing to show here.
    }
  }

  async function handleForgot() {
    setMsg(null);
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setMsg({ type: "error", text: "Enter a valid email address." });
      return;
    }
    setBusy(true);
    try {
      await sendPasswordReset(clean);
      setMsg({
        type: "ok",
        text: `A password reset link was sent to ${clean} from noreply@kftv-31d71.firebaseapp.com. If you don't see it within a few minutes, check your spam/junk folder.`
      });
    } catch (err) {
      setMsg({ type: "error", text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  }

  // Direct sign-in with the password the user already created.
  async function handleSignIn() {
    setMsg(null);
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setMsg({ type: "error", text: "Enter a valid email address." });
      return;
    }
    if (!password) {
      setMsg({ type: "error", text: "Enter your password." });
      return;
    }
    setBusy(true);
    try {
      const user = await signInAdminWithEmail(clean, password);
      await postLogin(user);
    } catch (err) {
      setMsg({ type: "error", text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  }

  // Step 1 (Sign Up): Send OTP to email
  async function handleSendCode() {
    setMsg(null);
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setMsg({ type: "error", text: "Please enter your email address." });
      return;
    }
    if (!password) {
      setMsg({ type: "error", text: "Please choose a password." });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: "error", text: "Please choose a password with at least 6 characters." });
      return;
    }
    if (!agreed) {
      setMsg({
        type: "error",
        text: "You need to accept KFTV's terms and privacy policy before signing up — tick the box above to continue."
      });
      return;
    }
    setBusy(true);
    try {
      const { exists, methods } = await checkAccountExists(clean);
      const isGoogle = methods.includes("google.com");
      const isPw = methods.includes("password");
      if (exists === true && isGoogle && !isPw) {
        setAcctType("google");
        setMsg({
          type: "error",
          text: "An account already exists for this email with Google — use 'Continue with Google' below."
        });
        return;
      }
      if (exists === true) {
        setAcctType("existing");
        setMsg({
          type: "error",
          text: "An account already exists for this email, so you can't sign up again. Sign in with your password, tap 'Continue with Google' if you used Google, or use 'Forgot password?' to reset it."
        });
        return;
      }
setAcctType(exists === false ? "new" : null);

      const r = await sendEmailOtp(clean);
      if (r.status === "success") {
        setMsg({ type: "ok", text: `A 6-digit code was sent to ${clean}.` });
        setStep("code");
        setResendIn(60);
      } else if (r.transport) {
        // The code may already be in the inbox even though Google's relay
        // failed to return the response — let the applicant enter it.
        setMsg({
          type: "ok",
          text: `A 6-digit code should already be in ${clean}'s inbox. Check spam, then enter it below.`
        });
        setStep("code");
        setResendIn(60);
      } else {
        setMsg({ type: "error", text: friendlyError(r.message ? { message: r.message } : null) });
      }
    } catch (err) {
      setMsg({ type: "error", text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  }

  // Step 2 (Sign Up): Verify OTP, then create account or sign in
  async function handleVerify() {
    setMsg(null);
    const clean = email.trim().toLowerCase();
    if (!/^\d{6}$/.test(code.trim())) {
      setMsg({ type: "error", text: "Please enter the 6-digit code from your email." });
      return;
    }
    setBusy(true);
    try {
      const v = await verifyEmailOtp(clean, code.trim());
      if (v.status !== "success") {
        setMsg({ type: "error", text: friendlyError({ message: v.message }) || "The code was not accepted." });
        return;
      }
      const user = await signInAfterOtp(clean, password);
      await postLogin(user);
    } catch (err) {
      if (err && (err.code === "EMAIL_EXISTS" || err.code === "auth/email-already-in-use")) {
        setAcctType("existing");
        setMsg({
          type: "error",
          text: "This email already has an account, so it can't be used to sign up again. Go back to the first step and use the Sign In tab with your password, tap 'Continue with Google' if you used Google, or choose 'Forgot password?' to reset it."
        });
      } else {
        setMsg({ type: "error", text: friendlyError(err) });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      await postLogin(result.user);
    } catch (err) {
      setLoading(false);
      setError(friendlyError(err));
    }
  }

  function switchTab(next) {
    if (next === tab) return;
    setTab(next);
    setStep("input");
    setCode("");
    setMsg(null);
    setError("");
  }

  function goBack() {
    setStep("input");
    setCode("");
    setMsg(null);
  }

  return (
    <div className="relative min-h-screen text-gray-900">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('D5.webp')",
          filter: "blur(8px)",
          transform: "scale(1.08)"
        }}
      />
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-black/40" />

      <header className="sticky top-0 z-50 w-full bg-transparent px-7 py-4">
        <Link to="/" className="flex items-center gap-3 text-white">
          <img
            src="logo1.png"
            alt="Kigali Film and Television School Logo"
            className="h-14 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </Link>
      </header>

      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-[440px] rounded-[20px] bg-white/95 p-8 text-center text-gray-900 shadow-[0_15px_45px_rgba(0,0,0,0.4)] sm:p-9">
          {loginSuccess ? (
              <div className="py-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7] text-[32px]">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[#16a34a]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <p className="font-semibold text-gray-700">
                Welcome to Kigali Film and Television School!
              </p>
            </div>
          ) : (
            <>
              {step === "input" && (
                <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-xl bg-gray-100 p-1.5">
                  <button
                    type="button"
                    onClick={() => switchTab("signup")}
                    className={
                      (tab === "signup"
                        ? "bg-[#d92332] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800") +
                      " cursor-pointer rounded-lg px-4 py-2 text-[14px] font-bold transition-colors"
                    }
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab("signin")}
                    className={
                      (tab === "signin"
                        ? "bg-[#d92332] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800") +
                      " cursor-pointer rounded-lg px-4 py-2 text-[14px] font-bold transition-colors"
                    }
                  >
                    Sign In
                  </button>
                </div>
              )}
              <h1 className="mb-1 text-[24px] font-extrabold text-gray-900">
                {tab === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                {tab === "signin"
                  ? "Enter your email and password to access your application."
                  : "Apply for a program, pay your fees and track your admission all in one place."}
              </p>

              {tab === "signin" ? (
                /* -------- Sign In tab: email + password -------- */
                <div className="text-left">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    Email address
                  </label>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                    placeholder="you@example.com"
                    disabled={busy}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors focus:border-[#d92332]"
                  />
                  <label className="mb-1.5 mt-4 block text-xs font-semibold text-gray-500">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                      placeholder="Your password"
                      disabled={busy}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-[15px] text-gray-900 outline-none transition-colors focus:border-[#d92332]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={busy || !email.trim() || !password.trim()}
                    className="mt-4 w-full cursor-pointer rounded-xl bg-[#d92332] px-5 py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Signing in..." : "Sign In"}
                  </button>
                  <button
                    type="button"
                    onClick={handleForgot}
                    disabled={busy}
                    className="mt-2 cursor-pointer text-[13px] font-semibold text-[#d92332] hover:underline disabled:opacity-60"
                  >
                    Forgot password?
                  </button>
                  <p className="mt-2.5 min-h-[18px] text-center text-[13px]">
                    {msg && (
                      <span className={msg.type === "error" ? "text-[#d92332]" : "text-[#16a34a]"}>
                        {msg.text}
                      </span>
                    )}
                  </p>
                </div>
              ) : step === "code" ? (
                /* -------- Step 2 (Sign Up): Enter 6-digit code -------- */
                <div className="text-left">
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <button
                      type="button"
                      onClick={goBack}
                      className="cursor-pointer font-semibold text-[#d92332] hover:underline"
                    >
                      ← Change
                    </button>
                    <span className="truncate">
                      Code sent to {email.trim().toLowerCase()}
                    </span>
                  </div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    Enter the 6-digit code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    placeholder="••••••"
                    disabled={busy}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-xl tracking-[0.5em] text-gray-900 outline-none transition-colors focus:border-[#d92332]"
                  />
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={busy || code.length < 6}
                    className="mt-4 w-full cursor-pointer rounded-xl bg-[#d92332] px-5 py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Verifying..." : "Verify & Sign In"}
                  </button>
                  <p className="mt-3 min-h-[18px] text-center text-[13px]">
                    {msg && (
                      <span className={msg.type === "error" ? "text-[#d92332]" : "text-[#16a34a]"}>
                        {msg.text}
                      </span>
                    )}
                  </p>
                  <p className="mt-4 text-center text-[13px] text-gray-500">
                    {resendIn > 0 ? (
                      <>Resend code in {resendIn}s</>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={busy}
                        className="cursor-pointer font-semibold text-[#d92332] hover:underline disabled:opacity-60"
                      >
                        Resend code
                      </button>
                    )}
                  </p>
                  {acctType === "existing" && (
                    <p className="mt-1 text-center">
                      <button
                        type="button"
                        onClick={handleForgot}
                        disabled={busy}
                        className="cursor-pointer text-[13px] font-semibold text-gray-500 hover:text-[#d92332] hover:underline disabled:opacity-60"
                      >
                        Forgot password?
                      </button>
                    </p>
                  )}
                </div>
              ) : (
                /* -------- Step 1 (Sign Up): email + password + OTP send -------- */
                <div className="text-left">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    Email address
                  </label>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAcctType(null);
                    }}
                    onBlur={() => checkAccountType(email.trim().toLowerCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    placeholder="you@example.com"
                    disabled={busy}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors focus:border-[#d92332]"
                  />
                  {acctType === "existing" && (
                    <p className="mt-1.5 text-[12px] text-[#d92332]">
                      You already have an account — use the Sign In tab with your password.
                    </p>
                  )}
                  {acctType === "new" && (
                    <p className="mt-1.5 text-[12px] text-gray-400">
                      New email — your account will be created after you verify the code.
                    </p>
                  )}
                  {acctType === "google" && (
                    <p className="mt-1.5 text-[12px] text-[#d92332]">
                      Registered with Google — use 'Continue with Google' below.
                    </p>
                  )}
                  <label className="mb-1.5 mt-4 block text-xs font-semibold text-gray-500">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete={acctType === "existing" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                      placeholder={
                        acctType === "existing"
                          ? "Your password"
                          : "Create a password (min 6 chars)"
                      }
                      disabled={busy}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-[15px] text-gray-900 outline-none transition-colors focus:border-[#d92332]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <input
                      id="agree-terms"
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#d92332]"
                    />
                    <label
                      htmlFor="agree-terms"
                      className="cursor-pointer text-left text-[13px] leading-snug text-gray-600"
                    >
                      By signing up you agree to KFTV's{" "}
                      <Link to="/terms-and-conditions" className="underline hover:text-[#d92332]">
                        terms&conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy-policy" className="underline hover:text-[#d92332]">
                        privacy policy
                      </Link>
                      .
                    </label>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={busy}
                      className="flex-1 cursor-pointer rounded-xl bg-[#d92332] px-5 py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy ? "Sending code..." : "Send verification code"}
                    </button>
                  </div>
                  {acctType === "existing" && (
                    <button
                      type="button"
                      onClick={handleForgot}
                      disabled={busy}
                      className="mt-2 cursor-pointer text-[13px] font-semibold text-[#d92332] hover:underline disabled:opacity-60"
                    >
                      Forgot password?
                    </button>
                  )}
                  <p className="mt-2.5 min-h-[18px] text-center text-[13px]">
                    {msg && (
                      <span className={msg.type === "error" ? "text-[#d92332]" : "text-[#16a34a]"}>
                        {msg.text}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {tab === "signup" && step === "code" ? null : (
                <>
                  <div className="my-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <span className="h-px flex-1 bg-gray-200" />
                  </div>
                  <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-[15px] font-semibold text-gray-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d92332] hover:shadow-[0_4px_16px_rgba(217,35,50,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                  {loading && (
                    <div className="mt-4 flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#d92332]" />
                    </div>
                  )}
                  <p className="mt-3 min-h-[18px] text-[13px] font-medium text-[#d92332]">
                    {error}
                  </p>
                </>
              )}

              <p className="mt-6 text-xs text-gray-400">
                By signing in you agree to KFTV's <Link to="/terms-and-conditions" className="underline hover:text-[#d92332]">terms & conditions</Link> and{" "}
                <Link to="/privacy-policy" className="underline hover:text-[#d92332]">privacy policy</Link>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;