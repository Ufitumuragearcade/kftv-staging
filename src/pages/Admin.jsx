import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { FaFileDownload } from "react-icons/fa";
import {
  clearAdminCache,
  db,
  firebase,
  maybeAdmin,
  onAuthStateChanged,
  saveAdminDoc,
  signInAdminWithEmail,
  signOutUser
} from "../lib/firebase";

const CATEGORIES = {
  "Filmmaking and Television Production": "filmmaking",
  "Graphic Design and Photography": "design",
  "Animation and Visual Effects": "animation",
  "Music Audio Production": "music",
  "Acting for Film and Television": "acting",
  "Programming and Software Development": "programming",
  "Digital Marketing": "marketing"
};

const COURSE_FILTER_OPTIONS = [
  { value: "Filmmaking and Television Production", label: "Filmmaking" },
  { value: "Graphic Design and Photography", label: "Graphic Design" },
  { value: "Animation and Visual Effects", label: "Animation" },
  { value: "Music Audio Production", label: "Music" },
  { value: "Acting for Film and Television", label: "Acting" },
  { value: "Programming and Software Development", label: "Programming" },
  { value: "Digital Marketing", label: "Digital Marketing" }
];

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyRPrZTlLRRb8Ped-aGFvVjlbuAKwQPHhDzx7ifmncxuhsClXM_1LjJ6jxp6JuE2IaDaw/exec";
const APP_SCRIPT_TOKEN = "kftv_admission_9f2c7b1e";

const templateCache = {};

async function loadTemplate(url) {
  if (templateCache[url]) return templateCache[url];
  const resp = await fetch(url);
  const bytes = await resp.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  templateCache[url] = doc;
  return doc;
}

async function buildLetterPdf(applicant, kind) {
  const name = applicant.names || "Applicant";
  const admissionNo = applicant.admissionNo || "";
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const templateUrl =
    kind === "admission"
      ? "/letters/admission-template.pdf"
      : "/letters/acceptance-template.pdf";

  const srcDoc = await loadTemplate(templateUrl);
  const pdfBytes = await srcDoc.save();
  const doc = await PDFDocument.load(pdfBytes);
  const page = doc.getPages()[0];
  const font = await doc.embedFont(StandardFonts.TimesRomanBold);

  if (kind === "admission") {
    page.drawText(name, { x: 150, y: 620, size: 11, font, color: rgb(0, 0, 0) });
    page.drawText(admissionNo || ".............................", {
      x: 195,
      y: 595,
      size: 11,
      font,
      color: rgb(0, 0, 0)
    });
    page.drawText(today, { x: 215, y: 261, size: 11, font, color: rgb(0, 0, 0) });
  } else {
    page.drawText(name, { x: 125, y: 636, size: 11, font, color: rgb(0, 0, 0) });
  }

  const outBytes = await doc.save();
  let binary = "";
  for (let i = 0; i < outBytes.length; i++) binary += String.fromCharCode(outBytes[i]);
  return "data:application/pdf;base64," + btoa(binary);
}

function esc(v) {
  return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function payDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const Admin = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Admin login form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [adminMsg, setAdminMsg] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);

  // Dashboard data
  const [allApps, setAllApps] = useState([]);
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [intakes, setIntakes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sending, setSending] = useState({ acceptance: false, admission: false });
  const [payTypeFilter, setPayTypeFilter] = useState("");

  useEffect(() => {
    let mounted = true;
    const unsub = onAuthStateChanged(async (u) => {
      if (!mounted) return;
      if (!u) {
        setIsAdmin(false);
        setChecked(true);
        return;
      }
      const admin = await maybeAdmin();
      if (!admin) {
        setIsAdmin(false);
        setChecked(true);
        return;
      }
      setIsAdmin(true);
      setChecked(true);
      await loadApplications();
      await loadIntakes();
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, [refresh]);

  async function loadApplications() {
    try {
      const snap = await db.collection("applications").get();
      const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const ts = (d) =>
        d && d.seconds ? d.seconds : d ? new Date(d).getTime() : 0;
      docs.sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
      setAllApps(docs);
    } catch {
      setAllApps([]);
    }
  }

  async function loadIntakes() {
    const snap = await db.collection("intakes").get();
    setIntakes(
      snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  }

  const filteredApps = useMemo(() => {
    let apps = allApps;
    if (courseFilter) apps = apps.filter((a) => (a.course || "") === courseFilter);
    if (statusFilter) apps = apps.filter((a) => (a.status || "") === statusFilter);
    return apps;
  }, [allApps, courseFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: filteredApps.length,
      submitted: filteredApps.filter((a) => a.status === "submitted").length,
      active: filteredApps.filter(
        (a) => a.status === "active" || a.status === "approved"
      ).length,
      closed: filteredApps.filter(
        (a) => a.status === "closed" || a.status === "rejected"
      ).length
    }),
    [filteredApps]
  );

  const selectedApp = useMemo(
    () => allApps.find((x) => x.id === selectedId) || null,
    [allApps, selectedId]
  );

  const paymentsLog = useMemo(() => {
    const rows = [];
    allApps.forEach((a) => {
      (a.payments || []).forEach((p, i) => {
        rows.push({
          key: `${a.id}-${i}`,
          appId: a.id,
          names: a.names || "—",
          email: a.email || "",
          type: p.type || "",
          amount: Number(p.amount || 0),
          currency: p.currency || "RWF",
          duration: p.duration || "",
          status: p.status || "",
          flutterwave_ref: p.flutterwave_ref || "",
          paidAt: p.paidAt || ""
        });
      });
    });
    rows.sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)));
    return rows;
  }, [allApps]);

  const payRows = useMemo(
    () =>
      payTypeFilter
        ? paymentsLog.filter((r) => r.type === payTypeFilter)
        : paymentsLog,
    [paymentsLog, payTypeFilter]
  );

  const totalPaid = useMemo(
    () =>
      payRows
        .filter((r) => r.status === "successful")
        .reduce((s, r) => s + (r.amount || 0), 0),
    [payRows]
  );

  function handleSignOut() {
    signOutUser().then(() => navigate("/login"));
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    setAdminMsg("");
    setAdminBusy(true);
    try {
      const cred = await signInAdminWithEmail(adminEmail.trim(), adminPass);
      await saveAdminDoc(cred.user);
      clearAdminCache();
      setRefresh((x) => x + 1);
    } catch {
      setAdminBusy(false);
      setAdminMsg("Incorrect email or password.");
    }
  }

  async function doStatus(appId, status) {
    await db.collection("applications").doc(appId).update({ status });
    await loadApplications();
  }

  async function doAssign(appId) {
    const a = allApps.find((x) => x.id === appId);
    const cat = CATEGORIES[a.course] || "general";
    try {
      const snap = await db
        .collection("intakes")
        .where("category", "==", cat)
        .where("status", "!=", "closed")
        .orderBy("status")
        .limit(1)
        .get();

      let nextIntake = "next-available";
      if (!snap.empty) {
        const doc = snap.docs[0];
        nextIntake = doc.data().currentPeriod;
        await db
          .collection("intakes")
          .doc(doc.id)
          .update({ enrolledCount: firebase.firestore.FieldValue.increment(1) });
      }
      await db
        .collection("applications")
        .doc(appId)
        .update({ intakeCategory: cat, assignedIntake: nextIntake });
      await loadApplications();
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  async function sendLetter(appId, kind) {
    const a = allApps.find((x) => x.id === appId);
    if (!a) return;

    const label = kind === "admission" ? "Admission Letter" : "Acceptance Letter";
    setSending((s) => ({ ...s, [kind]: true }));

    try {
      const dataUri = await buildLetterPdf(a, kind);
      const b64 = (dataUri.match(/data:[^;]+(?:;[^,]*)?;base64,(.*)$/s) || [])[1];
      const fileName = `${label.replace(" ", "_")}_${(a.names || "Student").replace(/\s+/g, "_")}.pdf`;

      const payload = {
        to_email: a.email,
        fromEmail: "Admission@kftv.org",
        token: APP_SCRIPT_TOKEN,
        subject: `Your ${label} - Kigali Film and Television School`,
        message: `Dear ${a.names || "Student"},\n\nPlease find your official ${label.toLowerCase()} attached to this email.\n\nFor any questions, contact the Admissions Office: Admission@kftv.org\n\nBest regards,\nThe Admissions Office`,
        pdfBase64: b64,
        fileName: fileName
      };

      const url =
        WEB_APP_URL +
        (WEB_APP_URL.includes("?") ? "&" : "?") +
        "req=" +
        Date.now();
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
        alert(`${label} sent successfully to ${a.email}.`);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      alert(`Failed to send ${label}: ${err.message}`);
    } finally {
      setSending((s) => ({ ...s, [kind]: false }));
    }
  }

  function exportReport() {
    const apps = filteredApps;
    if (!apps.length) {
      alert("No applications to export.");
      return;
    }

    const total = apps.length;
    const submitted = apps.filter((a) => a.status === "submitted").length;
    const active = apps.filter(
      (a) => a.status === "active" || a.status === "approved"
    ).length;
    const closed = apps.filter(
      (a) => a.status === "closed" || a.status === "rejected"
    ).length;

    const COURSES = COURSE_FILTER_OPTIONS.map((o) => o.value);

    const courseBreakdown = COURSES.map((c) => ({
      name: c,
      count: apps.filter((a) => a.course === c).length
    }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count);

    const payRows = [];
    apps.forEach((a) => {
      (a.payments || []).forEach((p) => {
        payRows.push({
          names: a.names || "—",
          email: a.email || "",
          type: p.type || "",
          amount: Number(p.amount || 0),
          currency: p.currency || "RWF",
          duration: p.duration || "",
          status: p.status || "",
          flutterwave_ref: p.flutterwave_ref || "",
          paidAt: p.paidAt || ""
        });
      });
    });
    payRows.sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)));
    const confirmed = payRows.filter((p) => p.status === "successful");
    const totalConfirmed = confirmed.reduce((s, p) => s + p.amount, 0);
    const regTotal = confirmed
      .filter((p) => p.type === "registration")
      .reduce((s, p) => s + p.amount, 0);
    const tuitTotal = confirmed
      .filter((p) => p.type === "tuition")
      .reduce((s, p) => s + p.amount, 0);
    const payStr = (n) => n.toLocaleString("en-US") + " RWF";

    const payLines =
      payRows
        .map(
          (p) => `<tr>
            <td class="cell-name">${esc(p.names)}</td>
            <td>${esc(p.email) || "—"}</td>
            <td class="cap">${esc(p.type)}</td>
            <td class="amt">${p.amount.toLocaleString("en-US")} <span class="cur">${esc(p.currency)}</span></td>
            <td>${esc(p.duration) || "—"}</td>
            <td><span class="${p.status === "successful" ? "st-ok" : "st-no"}">${esc((p.status || "unknown").toUpperCase())}</span></td>
            <td class="mono">${esc(p.flutterwave_ref) || "—"}</td>
            <td>${payDate(p.paidAt)}</td>
          </tr>`
        )
        .join("") ||
      `<tr><td colspan="8" class="empty">No payments in this report.</td></tr>`;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const filterLabel = [
      courseFilter ? courseFilter : "All Courses",
      statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "All Statuses"
    ].join(" · ");

    const ts = (d) => (d && d.seconds ? new Date(d.seconds * 1000) : d ? new Date(d) : null);

    const sorted = [...apps].sort((a, b) =>
      String(a.names || "").localeCompare(String(b.names || ""), undefined, { sensitivity: "base" })
    );

    const rows = sorted
      .map((a, i) => {
        const d = ts(a.createdAt);
        const dateFormatted = d
          ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "—";
        const st = a.status || "submitted";
        return `<tr>
          <td class="row-num">${i + 1}</td>
          <td class="cell-name">${esc(a.names) || "—"}</td>
          <td>${esc(a.email) || "—"}</td>
          <td>${esc(a.phone) || "—"}</td>
          <td class="cell-course">${esc(a.course) || "—"}</td>
          <td>${esc(a.duration) || "—"}</td>
          <td>${esc(a.delivery) || "—"}</td>
          <td class="cell-status"><span class="st-${st}">${esc(st.toUpperCase())}</span></td>
          <td>${esc(a.assignedIntake) || "—"}</td>
          <td>${dateFormatted}</td>
        </tr>`;
      })
      .join("");

    const courseLines = (
      courseBreakdown.length ? courseBreakdown : COURSES.map((c) => ({ name: c, count: 0 }))
    )
      .map((c) => `  <span class="course-line"><span>${esc(c.name)}</span><span>${c.count}</span></span>`)
      .join("");

    const reportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Registered Students - Kigali Film and Television School</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    color: #1a1a1a; background: #fff; line-height: 1.45;
  }
  .sheet { max-width: 1000px; margin: 0 auto; padding: 48px 40px; }

  .hdr { text-align: center; border-bottom: 2px solid #111; padding-bottom: 18px; margin-bottom: 26px; }
  .hdr .school { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
  .hdr .address { font-size: 12px; color: #555; margin-top: 2px; }
  .hdr .title { font-size: 24px; font-weight: 700; margin-top: 16px; text-transform: uppercase; letter-spacing: 1px; }
  .hdr .meta { font-size: 12px; color: #555; margin-top: 6px; }
  .hdr .filters { font-size: 12px; color: #333; margin-top: 8px; font-style: italic; }

  .tally { margin: 0 0 26px; font-size: 13px; }
  .tally b { font-weight: 700; }
  .tally .submitted, .tally .active, .tally .closed { font-weight: 700; }

  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  thead th {
    text-align: left; padding: 9px 10px; border-top: 1px solid #111; border-bottom: 1px solid #111;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px;
  }
  tbody td { padding: 9px 10px; border-bottom: 1px solid #ddd; vertical-align: top; }
  .row-num { color: #777; width: 30px; }
  .cell-name { font-weight: 700; white-space: nowrap; }
  .cell-course { max-width: 220px; }
  .cell-status { white-space: nowrap; }
  .st-submitted { color: #5a7aa7; }
  .st-active, .st-approved { color: #1c7a3d; }
  .st-closed, .st-rejected { color: #b3261e; }

  .reg { margin-top: 30px; }
  .reg h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #111; padding-bottom: 6px; margin-bottom: 10px; }
  .courses { display: block; column-count: 2; column-gap: 40px; }
  .course-line { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12.5px; break-inside: avoid; }

  .pay-summary { display: flex; flex-wrap: wrap; gap: 18px; margin: 0 0 12px; font-size: 13px; }
  .pay-summary b { font-weight: 700; }
  .cap { text-transform: capitalize; }
  .amt { text-align: right; font-weight: 700; white-space: nowrap; }
  .cur { font-weight: 400; font-size: 11px; color: #777; }
  .mono { font-family: Consolas, monospace; font-size: 11px; color: #555; }
  .st-ok { color: #1c7a3d; font-weight: 700; white-space: nowrap; }
  .st-no { color: #b3261e; font-weight: 700; white-space: nowrap; }
  .empty { color: #888; text-align: center; padding: 12px; }

  .foot { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 12px; font-size: 11px; color: #666;
    display: flex; justify-content: space-between; }

  .bar { text-align: center; padding: 16px; background: #f4f4f4; }
  .bar button { padding: 11px 30px; border: none; border-radius: 5px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .bar .print { background: #111; color: #fff; }
  .bar .close { background: #fff; color: #111; border: 1px solid #ccc; margin-left: 10px; }

  @media print {
    body { color: #000; }
    .bar { display: none !important; }
    .sheet { padding: 0; }
    thead th { border-top: 1px solid #000; }
    @page { margin: 14mm; }
  }
</style>
</head>
<body>
  <div class="bar">
    <button class="print" onclick="window.print()">Print / Save as PDF</button>
    <button class="close" onclick="window.close()">Close</button>
  </div>

  <div class="sheet">
    <div class="hdr">
      <div class="school">Kigali Film and Television School</div>
      <div class="address">Kigali, Rwanda</div>
      <div class="title">Registered Students</div>
      <div class="meta">Generated ${dateStr}, ${timeStr} &middot; ${esc(filterLabel)}</div>
    </div>

    <div class="tally">
      <b>${total}</b> student${total === 1 ? "" : "s"} registered &mdash;
      <span class="submitted">${submitted} in progress</span>,
      <span class="active">${active} active</span>,
      <span class="closed">${closed} closed</span>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Course</th>
          <th>Duration</th>
          <th>Delivery</th>
          <th>Status</th>
          <th>Intake</th>
          <th>Applied</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="reg">
      <h3>Students per Course</h3>
      <div class="courses">${courseLines}</div>
    </div>

    <div class="reg">
      <h3>Payments</h3>
      <div class="pay-summary">
        <span>Registration: <b>${payStr(regTotal)}</b></span>
        <span>Tuition: <b>${payStr(tuitTotal)}</b></span>
        <span>Total confirmed: <b>${payStr(totalConfirmed)}</b></span>
        <span>${confirmed.length} confirmed payment${confirmed.length === 1 ? "" : "s"} &middot; ${payRows.length} record${payRows.length === 1 ? "" : "s"}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Type</th>
            <th class="amt">Amount</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Flutterwave Ref</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>${payLines}</tbody>
      </table>
    </div>

    <div class="foot">
      <span>Kigali Film and Television School</span>
      <span>Confidential &mdash; Internal Use</span>
    </div>
  </div>

  <div class="bar">
    <button class="print" onclick="window.print()">Print / Save as PDF</button>
    <button class="close" onclick="window.close()">Close</button>
  </div>
</body></html>`;

    const win = window.open("", "_blank");
    win.document.write(reportHTML);
    win.document.close();
  }

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
          <span className="text-base font-bold">KFTV Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-[#e6f4fa] px-2.5 py-1 text-xs font-semibold text-[#0082c8]">
            Admin
          </span>
          <button
            onClick={handleSignOut}
            className="rounded-lg bg-[#d92332] px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
          >
            Sign Out
          </button>
        </div>
      </header>

      {!checked ? (
        <div className="px-5 py-10 text-center text-gray-400">Loading...</div>
      ) : !isAdmin ? (
        <AdminLogin
          adminEmail={adminEmail}
          setAdminEmail={setAdminEmail}
          adminPass={adminPass}
          setAdminPass={setAdminPass}
          showPass={showPass}
          setShowPass={setShowPass}
          adminMsg={adminMsg}
          adminBusy={adminBusy}
          onSubmit={handleAdminLogin}
        />
      ) : (
        <div className="mx-auto max-w-[1200px] px-5 py-10">
          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard num={stats.total} label="Total Applications" />
            <StatCard num={stats.submitted} label="In Progress" />
            <StatCard num={stats.active} label="Active Students" />
            <StatCard num={stats.closed} label="Closed" />
          </div>

          {/* Intake management */}
          {intakes.length > 0 && (
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <h3 className="mb-4 text-[17px] font-bold">Intake Management</h3>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {intakes.map((d) => {
                  const pct = d.maxStudents
                    ? Math.round((d.enrolledCount / d.maxStudents) * 100)
                    : 0;
                  const sc =
                    d.status === "open"
                      ? "bg-[#dcfce7] text-[#16a34a]"
                      : d.status === "in-progress"
                        ? "bg-[#fef3c7] text-[#b45309]"
                        : "bg-[#fee2e2] text-[#d92332]";
                  return (
                    <div
                      key={d.id}
                      className="rounded-[10px] border border-gray-200 bg-[#f8f9fa] p-4"
                    >
                      <h4 className="mb-2 text-sm font-bold capitalize">
                        {d.category || d.id}
                      </h4>
                      <div className="mb-2.5 text-xs text-gray-500">
                        Period: {d.currentPeriod || "—"} | {d.enrolledCount || 0}/
                        {d.maxStudents || 0} enrolled
                      </div>
                      <div className="mb-2.5 h-1.5 w-full overflow-hidden rounded bg-gray-200">
                        <div
                          className="h-full rounded bg-[#d92332]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span
                        className={`rounded-xl px-2 py-0.5 text-[11px] font-semibold ${sc}`}
                      >
                        {d.status || "unknown"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Applications */}
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <h3 className="mb-4 text-[17px] font-bold">Registered Students</h3>
            <div className="mb-5 flex flex-wrap items-end gap-3.5">
              <FilterGroup label="Course">
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#d92332]"
                >
                  <option value="">All Courses</option>
                  {COURSE_FILTER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FilterGroup>
              <FilterGroup label="Status">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#d92332]"
                >
                  <option value="">All Statuses</option>
                  <option value="submitted">In Progress</option>
                  <option value="active">Active</option>
                  <option value="approved">Approved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </FilterGroup>
              <button
                onClick={loadApplications}
                className="h-fit cursor-pointer rounded-lg bg-[#d92332] px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900"
              >
                Filter
              </button>
              <button
                onClick={exportReport}
                className="h-fit cursor-pointer rounded-lg border border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:border-transparent"
              >
                <FaFileDownload className="inline mr-1.5" />
                Export Report
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 className="text-base font-bold">Applications</h3>
                <span className="text-[13px] text-gray-500">
                  {filteredApps.length} students
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Names
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Email
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Phone
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Course
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Duration
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Intake
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((a) => (
                      <tr
                        key={a.id}
                        onClick={() => setSelectedId(a.id)}
                        className="cursor-pointer hover:bg-[#f0f8ff]"
                      >
                        <td className="border-b border-gray-100 px-4 py-3 text-sm">
                          {a.names || "—"}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm">
                          {a.email || "—"}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm">
                          {a.phone || "—"}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm">
                          {(a.course || "").substring(0, 20)}
                          {(a.course || "").length > 20 ? "…" : ""}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm">
                          {a.duration || "—"}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              a.status === "active" || a.status === "approved"
                                ? "bg-[#dcfce7] text-[#16a34a]"
                                : a.status === "closed" || a.status === "rejected"
                                  ? "bg-[#fee2e2] text-[#d92332]"
                                  : "bg-[#e6f4fa] text-[#0082c8]"
                            }`}
                          >
                            {(a.status === "submitted" ? "In Progress" : a.status || "submitted").toUpperCase()}
                          </span>
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm">
                          {a.assignedIntake || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredApps.length === 0 && (
                <div className="py-10 text-center text-gray-400">
                  No applications found.
                </div>
              )}
            </div>
          </div>

          {/* Payment audit log */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3.5">
              <h3 className="text-[17px] font-bold">Payment Audit Log</h3>
              <div className="flex flex-wrap items-center gap-3.5">
                <select
                  value={payTypeFilter}
                  onChange={(e) => setPayTypeFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#d92332]"
                >
                  <option value="">All Types</option>
                  <option value="registration">Registration</option>
                  <option value="tuition">Tuition</option>
                </select>
                <span className="text-sm text-gray-500">
                  {payRows.length} payment(s) ·{" "}
                  <span className="font-semibold text-[#16a34a]">
                    {totalPaid.toLocaleString()} RWF confirmed
                  </span>
                </span>
              </div>
            </div>
            {payRows.length === 0 ? (
              <p className="py-6 text-center text-gray-400">
                No payments recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Student
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Type
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Amount
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Duration
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Flutterwave Ref
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">
                        Date
                      </th>
                      <th className="bg-[#fafafa] px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500" />
                    </tr>
                  </thead>
                  <tbody>
                    {payRows.map((r) => (
                      <tr key={r.key} className="hover:bg-[#f0f8ff]">
                        <td className="border-b border-gray-100 px-4 py-3 text-sm">
                          {r.names}
                          <span className="block text-xs text-gray-400">
                            {r.email}
                          </span>
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm capitalize">
                          {r.type}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm font-semibold">
                          {r.amount.toLocaleString()}{" "}
                          <span className="text-xs font-normal text-gray-400">
                            {r.currency}
                          </span>
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm">
                          {r.duration || "—"}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              r.status === "successful"
                                ? "bg-[#dcfce7] text-[#16a34a]"
                                : "bg-[#fee2e2] text-[#d92332]"
                            }`}
                          >
                            {(r.status || "unknown").toUpperCase()}
                          </span>
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 font-mono text-xs text-gray-500">
                          {r.flutterwave_ref || "—"}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-sm whitespace-nowrap">
                          {payDate(r.paidAt)}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedId(r.appId)}
                            className="cursor-pointer rounded-md bg-[#e6f4fa] px-3 py-1.5 text-xs font-semibold text-[#0082c8] hover:bg-gray-900 hover:text-white"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedApp && (
        <DetailModal
          app={selectedApp}
          sending={sending}
          onClose={() => setSelectedId(null)}
          onCloseApp={() => doStatus(selectedApp.id, "closed")}
          onAssign={() => doAssign(selectedApp.id)}
          onSendLetter={(kind) => sendLetter(selectedApp.id, kind)}
        />
      )}
    </div>
  );
};

function StatCard({ num, label }) {
  return (
    <div className="rounded-[14px] bg-white p-5 text-center shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
      <div className="text-[34px] font-extrabold text-[#d92332]">{num}</div>
      <div className="mt-1 text-[13px] text-gray-500">{label}</div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="min-w-[160px] flex-1">
      <label className="mb-1.5 block text-xs font-semibold text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function AdminLogin({
  adminEmail,
  setAdminEmail,
  adminPass,
  setAdminPass,
  showPass,
  setShowPass,
  adminMsg,
  adminBusy,
  onSubmit
}) {
  return (
    <div className="flex justify-center px-5 py-10">
      <form
        onSubmit={onSubmit}
        className="my-10 w-full max-w-[420px] rounded-2xl bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      >
        <h3 className="text-center text-[17px] font-bold">Admin Login</h3>
        <p className="mb-5 text-center text-[13px] text-gray-500">
          Sign in with your admin credentials to access the dashboard.
        </p>
        <div className="mb-3.5">
          <label className="mb-1.5 block text-xs font-semibold text-gray-500">
            Email
          </label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@kftv.com"
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#d92332]"
          />
        </div>
        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-semibold text-gray-500">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-11 text-sm text-gray-900 outline-none focus:border-[#d92332]"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              aria-label="Show password"
              className="absolute right-1.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center bg-transparent p-1.5"
            >
              {showPass ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={adminBusy}
          className="w-full cursor-pointer rounded-lg bg-[#d92332] px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adminBusy ? "Signing in..." : "Sign In"}
        </button>
        <p className="mt-2.5 min-h-[18px] text-[13px] text-[#d92332]">{adminMsg}</p>
        <p className="mt-3.5 text-center text-xs text-gray-400">
          Or <Link to="/login" className="text-[#d92332]">sign in as a student</Link>
        </p>
      </form>
    </div>
  );
}

function DetailModal({
  app,
  sending,
  onClose,
  onCloseApp,
  onAssign,
  onSendLetter
}) {
  const appliedOn = app.createdAt
    ? new Date(app.createdAt.seconds ? app.createdAt.seconds * 1000 : app.createdAt).toLocaleString()
    : "—";

  const items = [
    { label: "Full Names", value: app.names, full: true },
    { label: "Email Address", value: app.email },
    { label: "Telephone Line", value: app.phone },
    { label: "2nd Telephone (WhatsApp)", value: app.phone2 },
    { label: "Residence", value: app.residence, full: true },
    { label: "Highest Level of Education", value: app.education },
    { label: "Course Applying To", value: app.course, full: true },
    { label: "Mode of Delivery", value: app.delivery },
    { label: "Course Duration", value: app.duration },
    { label: "Sex", value: app.sex },
    { label: "How Did You Hear About Us", value: app.referral },
    { label: "Fees Acknowledgement", value: app.acknowledged ? "Acknowledged ✓" : "Not acknowledged" },
    { label: "Status", value: (app.status === "submitted" ? "In Progress" : app.status || "submitted").toUpperCase() },
    { label: "Admission Number", value: app.admissionNo },
    { label: "Assigned Intake", value: app.assignedIntake },
    { label: "Applied On", value: appliedOn }
  ];

  const status = app.status || "submitted";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-[700px] overflow-y-auto rounded-2xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <h3 className="mb-1.5 text-lg font-extrabold text-gray-900">
          {app.names || "Applicant"}
        </h3>
        <div className="mb-6 flex flex-wrap items-center gap-2.5 text-[13px] text-gray-500">
          {app.email || ""} · Applied on {appliedOn}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              status === "submitted"
                ? "bg-[#e6f4fa] text-[#0082c8]"
                : status === "active" || status === "approved"
                  ? "bg-[#dcfce7] text-[#16a34a]"
                  : "bg-[#fee2e2] text-[#d92332]"
            }`}
          >
            {(status === "submitted" ? "In Progress" : status).toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.label} className={it.full ? "sm:col-span-2" : ""}>
              <label className="mb-0.5 block text-xs text-gray-400">
                {it.label}
              </label>
              <span className="break-words text-sm text-gray-900">
                {it.value || "—"}
              </span>
            </div>
          ))}
        </div>
        {(app.payments || []).length > 0 && (
          <div className="mt-6">
            <h4 className="mb-2.5 text-sm font-bold text-gray-900">
              Payment History
            </h4>
            <div className="space-y-2">
              {app.payments.map((p, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-gray-200 bg-[#fafafa] px-4 py-2.5 text-sm"
                >
                  <span className="capitalize text-gray-900">
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
                    {payDate(p.paidAt)}
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
        <div className="mt-7 flex flex-wrap gap-2.5">
          <button
            onClick={onAssign}
            className="cursor-pointer rounded-[10px] bg-[#0082c8] px-5 py-3 text-sm font-bold text-white hover:bg-[#0069a3]"
          >
            Assign Intake
          </button>
          <button
            onClick={() => onSendLetter("acceptance")}
            disabled={sending.acceptance}
            className="cursor-pointer rounded-[10px] bg-[#7048e8] px-5 py-3 text-sm font-bold text-white hover:bg-[#5f3dc4] disabled:opacity-60"
          >
            {sending.acceptance ? "Sending..." : "Acceptance Letter"}
          </button>
          <button
            onClick={() => onSendLetter("admission")}
            disabled={sending.admission}
            className="cursor-pointer rounded-[10px] bg-[#7048e8] px-5 py-3 text-sm font-bold text-white hover:bg-[#5f3dc4] disabled:opacity-60"
          >
            {sending.admission ? "Sending..." : "Admission Letter"}
          </button>
          {status !== "closed" && status !== "rejected" && (
            <button
              onClick={onCloseApp}
              className="cursor-pointer rounded-[10px] border border-[#d92332] bg-white px-5 py-3 text-sm font-bold text-[#d92332] hover:bg-[#d92332] hover:text-white"
            >
              Close Application
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto cursor-pointer rounded-[10px] bg-gray-100 px-5 py-3 text-sm font-bold text-gray-900 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin;