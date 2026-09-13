import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaWhatsapp, FaMapMarkerAlt, FaGraduationCap, FaBook, FaClock, FaChalkboardTeacher, FaVenusMars, FaIdCard, FaCheckCircle, FaSpinner, FaCreditCard, FaFileDownload, FaSignOutAlt, FaBars, FaTimes, FaBullhorn, FaUniversity, FaCalendarAlt, FaClipboardList, FaMoneyBillWave, FaUserPlus } from "react-icons/fa";
import {
  getUserApplication,
  maybeAdmin,
  onAuthStateChanged,
  signOutUser,
  updateApplication
} from "../lib/firebase";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  DURATION_KEYS,
  formatRwf,
  LETTER_WEB_APP_URL,
  APP_SCRIPT_TOKEN,
  FLW_PUBLIC_KEY,
  REG_FEE,
  TUITION
} from "../lib/config";

const pdfTemplateCache = {};

async function loadPdfTemplate(url) {
  if (pdfTemplateCache[url]) return pdfTemplateCache[url];
  const resp = await fetch(url);
  const bytes = await resp.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  pdfTemplateCache[url] = doc;
  return doc;
}

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [paying, setPaying] = useState(null);
  const [payMsg, setPayMsg] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const paymentCheckRef = useRef(false);
  const sendingRef = useRef({});

  useEffect(() => {
    const src = "https://checkout.flutterwave.com/v3.js";
    if (!document.querySelector('script[src*="checkout.flutterwave.com"]')) {
      const s = document.createElement("script");
      s.src = src;
      document.body.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(async (u) => {
      if (!u) {
        navigate("/login");
        return;
      }
      if (await maybeAdmin()) {
        navigate("/admin");
        return;
      }
      setUser(u);
      const app = await getUserApplication(u.uid);
      setApplication(app);
      if (app && app.duration) setSelectedDuration(app.duration);
      setLoaded(true);
      const params = new URLSearchParams(location.search);
      const txId = params.get("transaction_id");
      const txRef = params.get("tx_ref") || "";
      if (
        params.get("status") === "successful" &&
        txId &&
        !paymentCheckRef.current
      ) {
        paymentCheckRef.current = true;
        const type = txRef.startsWith("kftv-reg-") ? "registration" : "tuition";
        beginVerification(u.uid, type, txId);
        window.history.replaceState({}, "", window.location.pathname);
      }
    });
    return () => unsub();
  }, [navigate, location]);

  useEffect(() => {
    if (!application) return;
    const pays = application.payments || [];
    const regPaid = pays.some(
      (p) => p.type === "registration" && p.status === "successful"
    );
    const tuitionPaid = pays.some(
      (p) => p.type === "tuition" && p.status === "successful"
    );
    if (regPaid && !application.acceptanceEmailSent) maybeSendAcceptance(application);
    if (tuitionPaid && !application.admissionEmailSent) maybeSendAdmission(application);
  }, [application]);

  function handleSignOut() {
    signOutUser().then(() => navigate("/login"));
  }

  function payRegFee() {
    if (!application) return;
    setPaying("reg");
    const txRef = "kftv-reg-" + application.id + "-" + Date.now();
    window.FlutterwaveCheckout({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: txRef,
      amount: REG_FEE,
      currency: "RWF",
      redirect_url: window.location.origin + "/profile",
      customer: { email: user.email, name: user.displayName },
      callback: function (resp) {
        setPaying(null);
        if (resp.status === "successful") {
          beginVerification(user.uid, "registration", resp.transaction_id);
        } else {
          alert("Payment was not successful. Please try again.");
        }
      },
      onclose: function () {
        setPaying(null);
      }
    });
  }

  async function payTuition() {
    if (!selectedDuration || !application) return;
    const amount = TUITION[selectedDuration];
    const durKey = DURATION_KEYS[selectedDuration];
    setPaying("tuition");
    const txRef =
      "kftv-tuition-" + application.id + "-" + durKey + "-" + Date.now();
    window.FlutterwaveCheckout({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: txRef,
      amount: amount,
      currency: "RWF",
      redirect_url: window.location.origin + "/profile",
      customer: { email: user.email, name: user.displayName },
      callback: function (resp) {
        setPaying(null);
        if (resp.status === "successful") {
          beginVerification(user.uid, "tuition", resp.transaction_id);
        } else {
          alert("Payment was not successful. Please try again.");
        }
      },
      onclose: function () {
        setPaying(null);
      }
    });
  }

  function beginVerification(uid, type, flwRef) {
    const deadline = Date.now() + 120000;
    setPayMsg({ type, flwRef, waiting: true });
    const tick = async () => {
      if (Date.now() > deadline) {
        setPayMsg((m) => (m && m.flwRef === flwRef ? { ...m, waiting: false } : m));
        return;
      }
      const fresh = await getUserApplication(uid);
      if (!fresh) return;
      const confirmed = (fresh.payments || []).some(
        (p) =>
          p.type === type &&
          p.flutterwave_ref === String(flwRef) &&
          p.status === "successful"
      );
      if (confirmed) {
        setApplication(fresh);
        setPayMsg(null);
        if (type === "registration") maybeSendAcceptance(fresh);
        else maybeSendAdmission(fresh);
        return;
      }
      setTimeout(tick, 5000);
    };
    setTimeout(tick, 5000);
  }

  async function buildAcceptancePdf(applicant) {
    const srcDoc = await loadPdfTemplate("/letters/acceptance-template.pdf");
    const pdfBytes = await srcDoc.save();
    const doc = await PDFDocument.load(pdfBytes);
    const page = doc.getPages()[0];
    const font = await doc.embedFont(StandardFonts.TimesRomanBold);
    page.drawText(applicant.names || "Applicant", {
      x: 125,
      y: 636,
      size: 11,
      font,
      color: rgb(0, 0, 0)
    });
    const outBytes = await doc.save();
    let binary = "";
    for (let i = 0; i < outBytes.length; i++) binary += String.fromCharCode(outBytes[i]);
    return "data:application/pdf;base64," + btoa(binary);
  }

  async function maybeSendAcceptance(app) {
    if (!app || app.acceptanceEmailSent) return;
    if (sendingRef.current.acceptance) return;
    sendingRef.current.acceptance = true;
    try {
      const dataUri = await buildAcceptancePdf(app);
      const b64 = (dataUri.match(/data:[^;]+(?:;[^,]*)?;base64,(.*)$/s) || [])[1];
      const fileName = `Acceptance_Letter_${(app.names || "Student").replace(/\s+/g, "_")}.pdf`;
      const payload = {
        to_email: app.email,
        fromEmail: "Admission@kftv.org",
        token: APP_SCRIPT_TOKEN,
        subject: "Congratulations! Your Acceptance Letter - Kigali Film and Television School",
        message:
          `Dear ${app.names || "Student"},\n\n` +
          `Congratulations! We are pleased to inform you that you have been accepted into ` +
          `the ${app.course || ""} programme at the Kigali Film and Television School.\n\n` +
          `Your official acceptance letter is attached to this email. Kindly check it and ` +
          `proceed with the next steps of your admission.\n\n` +
          `For any questions, contact the Admissions Office: Admission@kftv.org\n\n` +
          `Best regards,\nThe Admissions Office`,
        pdfBase64: b64,
        fileName: fileName
      };
      const url =
        LETTER_WEB_APP_URL + (LETTER_WEB_APP_URL.includes("?") ? "&" : "?") + "req=" + Date.now();
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      });
      const raw = await response.text();
      let result;
      try {
        result = JSON.parse(raw);
      } catch {
        result = { status: "error", message: raw || "HTTP " + response.status };
      }
      if (result.status === "success") {
        await updateApplication(app.id, { acceptanceEmailSent: true });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Sending acceptance email failed:", err);
    } finally {
      sendingRef.current.acceptance = false;
    }
  }

  async function buildAdmissionPdf(applicant) {
    const srcDoc = await loadPdfTemplate("/letters/admission-template.pdf");
    const pdfBytes = await srcDoc.save();
    const doc = await PDFDocument.load(pdfBytes);
    const page = doc.getPages()[0];
    const font = await doc.embedFont(StandardFonts.TimesRomanBold);
    const today = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    page.drawText(applicant.names || "Applicant", {
      x: 150,
      y: 620,
      size: 11,
      font,
      color: rgb(0, 0, 0)
    });
    page.drawText(applicant.admissionNo || ".............................", {
      x: 195,
      y: 595,
      size: 11,
      font,
      color: rgb(0, 0, 0)
    });
    page.drawText(today, {
      x: 215,
      y: 261,
      size: 11,
      font,
      color: rgb(0, 0, 0)
    });
    const outBytes = await doc.save();
    let binary = "";
    for (let i = 0; i < outBytes.length; i++) binary += String.fromCharCode(outBytes[i]);
    return "data:application/pdf;base64," + btoa(binary);
  }

  async function maybeSendAdmission(app) {
    if (!app || app.admissionEmailSent) return;
    if (sendingRef.current.admission) return;
    sendingRef.current.admission = true;
    try {
      const admissionNo = app.admissionNo || "";
      const dataUri = await buildAdmissionPdf({ ...app, admissionNo });
      const b64 = (dataUri.match(/data:[^;]+(?:;[^,]*)?;base64,(.*)$/s) || [])[1];
      const fileName = `Admission_Letter_${(app.names || "Student").replace(/\s+/g, "_")}.pdf`;
      const payload = {
        to_email: app.email,
        fromEmail: "Admission@kftv.org",
        token: APP_SCRIPT_TOKEN,
        subject: "Your Admission Letter - Kigali Film and Television School",
        message:
          `Dear ${app.names || "Student"},\n\n` +
          `We are pleased to confirm your admission to the Kigali Film and Television School.\n\n` +
          `Your admission number is: ${admissionNo || "to be issued"}\n\n` +
          `Your official admission letter is attached to this email. Please keep it safe and ` +
          `present it when reporting to the school.\n\n` +
          `For any questions, contact the Admissions Office: Admission@kftv.org\n\n` +
          `Best regards,\nThe Admissions Office`,
        pdfBase64: b64,
        fileName: fileName
      };
      const url =
        LETTER_WEB_APP_URL + (LETTER_WEB_APP_URL.includes("?") ? "&" : "?") + "req=" + Date.now();
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      });
      const raw = await response.text();
      let result;
      try {
        result = JSON.parse(raw);
      } catch {
        result = { status: "error", message: raw || "HTTP " + response.status };
      }
      if (result.status === "success") {
        await updateApplication(app.id, { admissionEmailSent: true });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Sending admission email failed:", err);
    } finally {
      sendingRef.current.admission = false;
    }
  }

  if (!loaded) return null;

  const payments = application?.payments || [];
  const regPaid = payments.some((p) => p.type === "registration" && p.status === "successful");
  const tuitionPaid = payments.some((p) => p.type === "tuition" && p.status === "successful");

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2.5 bg-white px-6 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.1)]">
        <Link to="/" className="flex items-center gap-3 text-gray-900 no-underline">
          <img
            src="logo1.png"
            alt="KFTV"
            className="h-[42px] w-[42px] rounded-lg object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="text-base font-bold">Kigali Film and Television School</span>
        </Link>
        <button
          className="lg:hidden text-xl p-2 text-gray-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className={`${mobileMenuOpen ? "flex" : "hidden"} lg:flex items-center gap-4 flex-col lg:flex-row w-full lg:w-auto`}>
          <Link to="/apply" className="text-sm font-medium text-gray-900 no-underline hover:text-[#d92332]">
            Apply
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg bg-[#d92332] px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-5 py-8">
        {user && (
          <div className="mb-8 flex flex-col sm:flex-row items-center gap-5 rounded-[20px] bg-white p-[30px] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <div className="h-[80px] w-[80px] rounded-full bg-[#e6f4fa] flex items-center justify-center border-[3px] border-[#d92332] overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                <FaUser className="text-3xl text-[#0082c8]" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-extrabold text-gray-900">
                {user.displayName || "Student"}
              </h2>
              <p className="text-sm text-gray-500">{user.email || ""}</p>
              {application?.admissionNo && (
                <p className="mt-1 text-xs font-semibold text-[#0082c8]">
                  Admission No: {application.admissionNo}
                </p>
              )}
            </div>
            <div className="sm:ml-auto flex items-center gap-3">
              <StatusBadge status={application?.status} />
            </div>
          </div>
        )}

        {application ? (
          <>
            {/* Progress Steps */}
            <ProgressTracker
              application={application}
              regPaid={regPaid}
              tuitionPaid={tuitionPaid}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Personal Details */}
              <div className="lg:col-span-2 rounded-[20px] bg-white p-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                <h3 className="mb-5 flex items-center gap-2 text-lg font-bold">
                  <FaUser className="text-[#d92332]" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem icon={<FaUser />} label="Full Names" value={application.names} />
                  <DetailItem icon={<FaEnvelope />} label="Email Address" value={application.email} />
                  <DetailItem icon={<FaPhone />} label="Telephone" value={application.phone} />
                  <DetailItem icon={<FaWhatsapp />} label="WhatsApp" value={application.phone2} />
                  <DetailItem icon={<FaMapMarkerAlt />} label="Residence" value={application.residence} full />
                  <DetailItem icon={<FaGraduationCap />} label="Highest Education" value={application.education} />
                  <DetailItem icon={<FaVenusMars />} label="Sex" value={application.sex} />
                  <DetailItem icon={<FaBullhorn />} label="How Did You Hear About Us" value={application.referral} />
                </div>
              </div>

              {/* Program Details */}
              <div className="rounded-[20px] bg-white p-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                <h3 className="mb-5 flex items-center gap-2 text-lg font-bold">
                  <FaBook className="text-[#d92332]" /> Program Details
                </h3>
                <div className="flex flex-col gap-4">
                  <DetailItem icon={<FaBook />} label="Course" value={application.course} />
                  <DetailItem icon={<FaClock />} label="Duration" value={application.duration} />
                  <DetailItem icon={<FaChalkboardTeacher />} label="Study Mode" value={application.delivery} />
                  {application.assignedIntake && (
                    <DetailItem icon={<FaCalendarAlt />} label="Assigned Intake" value={application.assignedIntake} />
                  )}
                  {application.intakeCategory && (
                    <DetailItem icon={<FaClipboardList />} label="Intake Category" value={application.intakeCategory} />
                  )}
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <PaymentSection
              application={application}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              paying={paying}
              payMsg={payMsg}
              payRegFee={payRegFee}
              payTuition={payTuition}
              regPaid={regPaid}
              tuitionPaid={tuitionPaid}
            />
          </>
        ) : (
          <div className="rounded-[20px] bg-white p-[30px] text-center text-gray-500 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3e8ff]">
              <FaClipboardList className="text-2xl text-[#7048e8]" />
            </div>
            <h3 className="mb-2.5 text-xl text-gray-900">
              No Application Yet
            </h3>
            <p>
              You haven't submitted an application yet.
              <br />
              Fill in the application form to get started.
            </p>
            <Link
              to="/apply"
              className="mt-5 inline-block rounded-[10px] bg-[#d92332] px-7 py-3 font-semibold text-white no-underline hover:bg-gray-900"
            >
              Apply Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

function StatusBadge({ status }) {
  const active = status === "submitted" || status === "active" || status === "approved";
  const cls = active
    ? "bg-[#dcfce7] text-[#16a34a]"
    : status === "rejected" || status === "closed"
      ? "bg-[#fee2e2] text-[#d92332]"
      : "bg-[#e6f4fa] text-[#0082c8]";
  const label = status === "submitted" ? "In Progress" : status || "Pending";
  return (
    <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase ${cls}`}>
      {label}
    </span>
  );
}

function ProgressTracker({ application, regPaid, tuitionPaid }) {
  const steps = [
    { label: "Application Submitted", done: true },
    { label: "Registration Fee", done: regPaid },
    { label: "Acceptance Letter", done: regPaid },
    { label: "Tuition Paid", done: tuitionPaid },
    { label: "Admission Confirmed", done: tuitionPaid }
  ];
  return (
    <div className="mb-8 rounded-[20px] bg-white p-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
      <h3 className="mb-5 flex items-center gap-2 text-lg font-bold">
        <FaClipboardList className="text-[#d92332]" /> Application Progress
      </h3>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1 w-full sm:w-auto">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step.done
                  ? "bg-[#dcfce7] text-[#16a34a]"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {step.done ? <FaCheckCircle className="text-sm" /> : i + 1}
              </div>
              <span className={`mt-1.5 text-[11px] text-center font-medium max-w-[90px] ${
                step.done ? "text-[#16a34a]" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mt-[-20px] ${step.done ? "bg-[#16a34a]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-400">
        <span className="text-[#d92332]">{icon}</span> {label}
      </label>
      <span className="text-[15px] text-gray-900">{value || "—"}</span>
    </div>
  );
}

function PaymentSection({
  application,
  selectedDuration,
  setSelectedDuration,
  paying,
  payMsg,
  payRegFee,
  payTuition,
  regPaid,
  tuitionPaid
}) {
  const d = application;
  const blocked = d.status === "rejected" || d.status === "closed";

  if (blocked) {
    return (
      <div className="mb-6 rounded-[20px] bg-white p-[30px] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <FaCreditCard className="text-[#d92332]" /> Payment
        </h3>
        <p className="text-gray-500">
          Your application is no longer active. Please contact the school for more
          information.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-[20px] bg-white p-[30px] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
      <h3 className="mb-5 flex items-center gap-2 text-lg font-bold">
        <FaCreditCard className="text-[#d92332]" /> Payment Steps
      </h3>

      {d.status === "submitted" && (
        <div className="mb-4 rounded-[14px] border border-[#e6f4fa] bg-[#f0f8ff] p-4 text-sm text-gray-800 flex items-start gap-3">
          <FaBullhorn className="mt-0.5 text-[#0082c8] shrink-0" />
          <span>Your application was received! Pay the registration fee below and your acceptance letter is issued right away.</span>
        </div>
      )}

      {payMsg && (
        <div className="mb-4 rounded-[14px] border border-[#fef3c7] bg-[#fffbeb] p-4 text-sm text-gray-800 flex items-start gap-3">
          <FaSpinner className="mt-0.5 text-[#b45309] shrink-0 animate-spin" />
          <span>
            {payMsg.waiting
              ? "We received your payment — confirming with Flutterwave. This usually takes a few seconds."
              : "Payment received. If it does not appear within a few minutes, please contact the school."}
          </span>
        </div>
      )}

      {/* Step 1 — Registration */}
      <div className="mb-4 rounded-[14px] border border-gray-200 bg-white p-5">
        <h4 className="mb-3 flex items-center gap-2 text-[15px] font-bold">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
            regPaid ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#d92332] text-white"
          }`}>
            {regPaid ? <FaCheckCircle className="text-[10px]" /> : "1"}
          </span>
          Step 1 — Registration Fee
        </h4>
        <div className="mb-3.5 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-[#d92332]">{formatRwf(REG_FEE)}</span>
          <small className="text-[13px] font-normal text-gray-400">one-time payment</small>
        </div>
        {regPaid ? (
          <button
            disabled
            className="flex w-full items-center justify-center gap-2 cursor-default rounded-[10px] bg-[#dcfce7] py-3.5 text-[15px] font-bold text-[#16a34a]"
          >
            <FaCheckCircle /> Paid
          </button>
        ) : (
          <button
            onClick={payRegFee}
            disabled={paying === "reg" || payMsg}
            className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-[10px] bg-[#d92332] py-3.5 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaCreditCard />
            {paying === "reg"
              ? "Processing..."
              : `Pay ${formatRwf(REG_FEE)}`}
          </button>
        )}
      </div>

      {/* Step 2 — Acceptance Letter */}
      {regPaid && (
        <div className="mb-4 rounded-[14px] border border-gray-200 bg-white p-5">
          <h4 className="mb-3 flex items-center gap-2 text-[15px] font-bold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dcfce7] text-[11px] font-bold text-[#16a34a]">
              <FaCheckCircle className="text-[10px]" />
            </span>
            Step 2 — Acceptance Letter
          </h4>
          <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-center">
            <p className="flex items-center justify-center gap-2 font-semibold text-[#166534]">
              <FaCheckCircle className="text-[#16a34a]" /> Acceptance letter ready!
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert(`Your acceptance letter will be emailed to ${d.email}`);
              }}
              className="mt-1.5 flex items-center justify-center gap-1.5 font-semibold text-[#16a34a] underline"
            >
              <FaEnvelope /> Check your email
            </a>
          </div>
        </div>
      )}

      {/* Step 3 — Tuition */}
      <div
        className={`mb-4 rounded-[14px] border border-gray-200 bg-white p-5 ${
          regPaid ? "" : "opacity-50"
        }`}
      >
        <h4 className="mb-3 flex items-center gap-2 text-[15px] font-bold">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
            tuitionPaid ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#d92332] text-white"
          }`}>
            {tuitionPaid ? <FaCheckCircle className="text-[10px]" /> : "3"}
          </span>
          Step 3 — Tuition Fees
        </h4>
        {tuitionPaid ? (
          <p className="mb-1.5 flex items-center gap-2 font-semibold text-[#16a34a]">
            <FaCheckCircle /> Tuition paid for {application.duration}
          </p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(TUITION).map(([dur, amt]) => (
                <label
                  key={dur}
                  className={`cursor-pointer rounded-[10px] border-2 bg-white p-3 text-center text-sm transition-all duration-200 ${
                    selectedDuration === dur
                      ? "border-[#d92332] bg-[#fff4f5]"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="tuitionDur"
                    value={dur}
                    className="hidden"
                    checked={selectedDuration === dur}
                    onChange={() => setSelectedDuration(dur)}
                  />
                  <span className="block font-bold">{dur}</span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {formatRwf(amt)}
                  </span>
                  {d.duration === dur && (
                    <span className="mt-1 block text-[10px] font-bold text-[#d92332]">
                      your period
                    </span>
                  )}
                </label>
              ))}
            </div>
            <div className="mb-1 text-xs text-gray-400">
              {d.duration
                ? `Paying the tuition for the ${d.duration} period you applied for closes your admission automatically.`
                : "Choose the study period you want to pay for."}
            </div>
            <div className="mb-3 text-lg font-extrabold text-[#d92332]">
              {selectedDuration
                ? formatRwf(TUITION[selectedDuration])
                : "Select a duration above"}
            </div>
            <button
              onClick={payTuition}
              disabled={!selectedDuration || paying === "tuition" || payMsg}
              className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-[10px] bg-[#d92332] py-3.5 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaMoneyBillWave />
              {paying === "tuition"
                ? "Processing..."
                : selectedDuration
                  ? `Pay ${formatRwf(TUITION[selectedDuration])}`
                  : "Select duration first"}
            </button>
          </>
        )}
        {!regPaid && (
          <p className="mt-2 text-right text-[11px] text-gray-400">
            Complete previous step first
          </p>
        )}
      </div>

      {/* Step 4 — Admission Letter */}
      {tuitionPaid && (
        <div className="rounded-[14px] border border-gray-200 bg-white p-5">
          <h4 className="mb-3 flex items-center gap-2 text-[15px] font-bold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dcfce7] text-[11px] font-bold text-[#16a34a]">
              <FaCheckCircle className="text-[10px]" />
            </span>
            Step 4 — Admission Letter
          </h4>
          <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-center">
            <p className="flex items-center justify-center gap-2 font-semibold text-[#166534]">
              <FaCheckCircle className="text-[#16a34a]" /> All payments complete! Your admission is confirmed.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert(`Your admission letter will be emailed to ${d.email}`);
              }}
              className="mt-1.5 flex items-center justify-center gap-1.5 font-semibold text-[#16a34a] underline"
            >
              <FaEnvelope /> Check your email
            </a>
          </div>
        </div>
      )}

      {/* Refer and Earn */}
      {tuitionPaid && (
        <div className="mt-4 rounded-[14px] border border-[#e6f4fa] bg-[#f0f8ff] p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0082c8] text-white">
              <FaUserPlus className="text-xl" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-[15px] font-bold text-gray-900">Refer and Earn</h4>
              <p className="mt-1 text-sm text-gray-600">
                Know someone who would love to study at KFTV? Share your referral link and earn rewards when they enroll.
              </p>
            </div>
            <button
              disabled
              className="shrink-0 cursor-not-allowed rounded-[10px] border-2 border-[#0082c8] bg-white px-6 py-3 text-sm font-bold text-[#0082c8] opacity-60"
            >
              Coming Soon
            </button>
          </div>
        </div>
      )}

      {/* Payment History */}
      {(d.payments || []).length > 0 && (
        <div className="mt-6 rounded-[14px] border border-gray-200 bg-white p-5">
          <h4 className="mb-3 flex items-center gap-2 text-[15px] font-bold">
            <FaUniversity className="text-[#d92332]" /> Payment History
          </h4>
          <div className="space-y-2">
            {d.payments.map((p, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-gray-200 bg-[#fafafa] px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-1.5 capitalize text-gray-900">
                  <FaCreditCard className="text-xs text-gray-400" />
                  {p.type || "payment"}
                </span>
                <span className="font-semibold text-gray-900">
                  {(typeof p.amount === "number"
                    ? p.amount
                    : Number(p.amount || 0)
                  ).toLocaleString()}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    {p.currency || "RWF"}
                  </span>
                </span>
                <span className="text-xs text-gray-500">
                  {p.duration ? p.duration + " · " : ""}
                  {p.paidAt ? new Date(p.paidAt).toLocaleString() : "—"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    p.status === "successful"
                      ? "bg-[#dcfce7] text-[#16a34a]"
                      : "bg-[#fee2e2] text-[#d92332]"
                  }`}
                >
                  {(p.status || "unknown").toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
