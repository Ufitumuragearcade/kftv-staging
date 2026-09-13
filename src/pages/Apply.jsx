import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilm, FaCamera, FaPaintBrush, FaMusic, FaTheaterMasks, FaCode, FaChartLine } from "react-icons/fa";
import {
  getUserApplication,
  maybeAdmin,
  onAuthStateChanged,
  saveApplication,
  signOutUser
} from "../lib/firebase";
import { COURSES, formatRwf, STUDY_MODES, TUITION } from "../lib/config";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-[#d92332] focus:ring-4 focus:ring-[#d9233214]";
const selectCls = inputCls + " cursor-pointer";

const STEP_NAMES = ["Personal details", "Study programme", "Review & submit"];

const EDUCATION_OPTIONS = [
  "Primary School",
  "Secondary School (O-Level)",
  "Secondary School (A-Level)",
  "Vocational Training",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Other"
];

const SEX_OPTIONS = ["Male", "Female", "Other"];
const REFERRAL_OPTIONS = [
  "Social Media",
  "Friend / Family",
  "Website",
  "TV / Radio",
  "School Event",
  "Other"
];

const COURSE_ICONS = {
  [COURSES[0]]: <FaFilm />,
  [COURSES[1]]: <FaCamera />,
  [COURSES[2]]: <FaPaintBrush />,
  [COURSES[3]]: <FaMusic />,
  [COURSES[4]]: <FaTheaterMasks />,
  [COURSES[5]]: <FaCode />,
  [COURSES[6]]: <FaChartLine />
};

const Apply = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    names: "",
    email: "",
    phone: "",
    phone2: "",
    residence: "",
    education: "",
    course: "",
    delivery: "",
    duration: "",
    sex: "",
    referral: ""
  });
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      if (await maybeAdmin()) {
        navigate("/admin");
        return;
      }
      setCurrentUser(user);
      if (user.email) setForm((f) => ({ ...f, email: user.email }));

      const app = await getUserApplication(user.uid);
      if (app) {
        // Already applied -> the automated admission flow continues on the profile.
        navigate("/profile");
      }
    });
    return () => unsub();
  }, [navigate]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const pick = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  function nextStep() {
    if (step === 0) {
      if (!form.names.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !form.phone.trim() || !form.residence.trim() || !form.education || !form.sex) {
        setMsg("Please complete the required personal details.");
        return;
      }
    }
    if (step === 1) {
      if (!form.course || !form.delivery || !form.duration) {
        setMsg("Please choose your course, study mode and duration.");
        return;
      }
    }
    setMsg("");
    setStep((s) => Math.min(s + 1, 2));
  }

  function backStep() {
    setMsg("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!acknowledged) {
      setMsg("Please acknowledge the fees statement before submitting.");
      return;
    }
    setSubmitting(true);
    setMsg("");
    try {
      await saveApplication({
        userId: currentUser.uid,
        names: form.names.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        phone2: form.phone2.trim() || "",
        residence: form.residence.trim(),
        education: form.education,
        course: form.course,
        delivery: form.delivery,
        duration: form.duration,
        sex: form.sex,
        referral: form.referral,
        acknowledged: true
      });
      navigate("/profile");
    } catch (err) {
      setMsg("Error: " + err.message);
      setSubmitting(false);
    }
  }

  function handleSignOut() {
    signOutUser().then(() => navigate("/login"));
  }

  return (
    <div className="min-h-screen bg-[#f2f3f7] text-gray-900">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2.5 bg-white px-6 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.08)]">
        <Link to="/" className="flex items-center gap-3 text-gray-900 no-underline">
          <img
            src="logo1.png"
            alt="KFTV"
            className="h-[42px] w-[42px] rounded-lg object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="text-base font-bold">Kigali Film and Television School</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-sm font-medium text-gray-900 no-underline hover:text-[#d92332]">
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-lg bg-[#d92332] px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[820px] px-5 py-8">
        {/* Hero panel */}
        <div className="relative mb-6 overflow-hidden rounded-[22px] bg-[#d92332] p-7 text-white shadow-[0_14px_40px_rgba(217,35,50,0.35)] sm:p-9">
          <div className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <h1 className="relative text-2xl font-extrabold sm:text-3xl">Application Form</h1>
          <p className="relative mt-1.5 max-w-md text-sm text-white/85">
            Apply in under 3 minutes. Submit — then pay your registration fee and
            tuition online to receive your admission letters instantly.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-6 flex items-center gap-2">
          {STEP_NAMES.map((name, i) => (
            <React.Fragment key={name}>
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i < step || (i === step)
                      ? "bg-[#d92332] text-white shadow-[0_4px_12px_rgba(217,35,50,0.35)]"
                      : "bg-white text-gray-400 ring-1 ring-gray-200"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`hidden text-xs font-semibold sm:block ${
                    i === step ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {name}
                </span>
              </div>
              {i < STEP_NAMES.length - 1 && (
                <div className={`h-px flex-1 ${i < step ? "bg-[#d92332]" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mb-6 rounded-[20px] bg-white p-[22px] shadow-[0_10px_40px_rgba(20,20,40,0.07)] sm:p-[30px]">
          <form ref={formRef} onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="mb-5 text-lg font-extrabold text-gray-900">Tell us about you</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormGroup label="Full Names">
                      <input type="text" value={form.names} onChange={set("names")} placeholder="e.g. Jean Mugabo" className={inputCls} />
                    </FormGroup>
                    <FormGroup label="Email Address">
                      <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputCls} />
                    </FormGroup>
                    <FormGroup label="Telephone Line">
                      <input type="tel" value={form.phone} onChange={set("phone")} placeholder="07XXXXXXXX" className={inputCls} />
                    </FormGroup>
                    <FormGroup label="2nd Telephone (WhatsApp)" optional>
                      <input type="tel" value={form.phone2} onChange={set("phone2")} placeholder="Optional" className={inputCls} />
                    </FormGroup>
                  </div>
                  <FormGroup label="Residence (Province / District / Sector / Cell)">
                    <input type="text" value={form.residence} onChange={set("residence")} placeholder="e.g. Kigali, Gasabo, Kimironko" className={inputCls} />
                  </FormGroup>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormGroup label="Highest Level of Education">
                      <select value={form.education} onChange={set("education")} className={selectCls}>
                        <option value="">Select...</option>
                        {EDUCATION_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </FormGroup>
                    <FormGroup label="Sex">
                      <div className="flex flex-wrap gap-2.5">
                        {SEX_OPTIONS.map((o) => (
                          <Chip key={o} active={form.sex === o} onClick={() => pick("sex")(o)}>
                            {o}
                          </Chip>
                        ))}
                      </div>
                    </FormGroup>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="mb-5 text-lg font-extrabold text-gray-900">Your study programme</h2>

                  <FormGroup label="Which course are you applying to KFTV?">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {COURSES.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => pick("course")(c)}
                          className={`flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-200 ${
                            form.course === c
                              ? "border-[#d92332] bg-[#fff4f5] shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <span className="text-xl text-[#d92332]">{COURSE_ICONS[c]}</span>
                          <span className="text-sm font-semibold text-gray-800">{c}</span>
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
                            {form.course === c ? (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d92332]">✓</span>
                            ) : (
                              <span className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </FormGroup>

                  <FormGroup label="How would you like to study?">
                    <div className="flex flex-wrap gap-2.5">
                      {STUDY_MODES.map((m) => (
                        <Chip key={m} active={form.delivery === m} onClick={() => pick("delivery")(m)} large>
                          {m}
                        </Chip>
                      ))}
                    </div>
                  </FormGroup>

                  <FormGroup label="Study period & tuition" sub="Tuition is paid once after your registration is confirmed.">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                      {Object.entries(TUITION).map(([dur, amount]) => (
                        <button
                          type="button"
                          key={dur}
                          onClick={() => pick("duration")(dur)}
                          className={`group rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                            form.duration === dur
                              ? "border-[#d92332] bg-[#fff4f5] shadow-md"
                              : "border-gray-200 bg-white hover:border-[#d9233288] hover:shadow-sm"
                          }`}
                        >
                          <span className={`block text-sm font-extrabold ${form.duration === dur ? "text-[#d92332]" : "text-gray-900"}`}>
                            {dur}
                          </span>
                          <span className="mt-1 block text-xs font-semibold text-[#d92332]">
                            {formatRwf(amount)}
                          </span>
                          <span className="mt-1 block text-[10px] text-gray-400">full tuition</span>
                        </button>
                      ))}
                    </div>
                  </FormGroup>

                  <FormGroup label="How did you hear about us?" optional>
                    <select value={form.referral} onChange={set("referral")} className={selectCls}>
                      <option value="">Select...</option>
                      {REFERRAL_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </FormGroup>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="mb-5 text-lg font-extrabold text-gray-900">Review your application</h2>
                  <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200">
                    {[
                      ["Full Names", form.names],
                      ["Email", form.email],
                      ["Telephone", form.phone],
                      ["WhatsApp", form.phone2 || "—"],
                      ["Residence", form.residence],
                      ["Education", form.education],
                      ["Sex", form.sex],
                      ["Course", form.course],
                      ["Study mode", form.delivery],
                      ["Study period", form.duration],
                      ["Tuition", form.duration ? formatRwf(TUITION[form.duration]) : "—"],
                      ["Referral", form.referral || "—"]
                    ].map(([label, value], i) => (
                      <div key={label} className={`flex items-center justify-between gap-4 px-5 py-3 text-sm ${i % 2 ? "bg-[#fafafa]" : "bg-white"}`}>
                        <span className="text-gray-500">{label}</span>
                        <span className="font-semibold capitalize text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-600">
                    <input
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                      className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#d92332]"
                    />
                    By applying to Kigali Film and Television School, I acknowledge that I will be
                    required to pay the registration fee and tuition for my chosen study period.
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={backStep}
                disabled={step === 0 || submitting}
                className="cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Back
              </button>
              {step < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="cursor-pointer rounded-lg bg-[#d92332] px-8 py-3 text-sm font-bold text-white shadow-[0_6px_18px_rgba(217,35,50,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer rounded-lg bg-[#d92332] px-8 py-3 text-sm font-bold text-white shadow-[0_6px_18px_rgba(217,35,50,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
            <p className={`mt-4 min-h-[20px] text-center text-sm ${msg && msg.startsWith("Error") ? "text-[#d92332]" : msg ? "text-[#16a34a]" : ""}`}>
              {msg}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

function FormGroup({ label, children, optional, sub }) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-semibold text-gray-600">
        {label} {optional ? <span className="font-normal text-gray-400">(optional)</span> : <span className="text-[#d92332]">*</span>}
      </label>
      {sub && <p className="mb-1.5 text-xs text-gray-400">{sub}</p>}
      {children}
    </div>
  );
}

function Chip({ active, onClick, children, large }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full border-2 px-5 py-2 text-sm font-semibold transition-all duration-200 ${
        large ? "px-6 py-2.5 text-[15px]" : ""
      } ${
        active
          ? "border-[#d92332] bg-[#d92332] text-white shadow-[0_4px_14px_rgba(217,35,50,0.3)]"
          : "border-gray-200 bg-white text-gray-700 hover:border-[#d9233288] hover:text-[#d92332]"
      }`}
    >
      {children}
    </button>
  );
}

export default Apply;