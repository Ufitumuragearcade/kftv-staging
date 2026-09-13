# KFTV Admissions + Payment System — Handoff & Testing Guide

Everything is built and verified working. This document tells the creator how the
system fits together, how to test it, and how to host it.

---

## 1. What the system does

- Students apply, the school approves, then students pay a **registration fee** and
  **tuition** via Flutterwave (live keys, real money).
- When Flutterwave confirms a payment it fires a **webhook** that records the
  payment in **Cloud Firestore** (Firebase project `kftv-31d71`).
- After the payment is recorded, the app emails an **acceptance letter** (after
  registration) and an **admission letter** (after tuition) from
  `Admission@kftv.org`, with the branded PDF attached.

## 2. How the payment moves (the chain)

```
Student pays in Flutterwave checkout
   -> Flutterwave sends webhook to: https://kftv-webhook.pulsegadgets012.workers.dev/
      (Cloudflare Worker — free, public, always on; follows redirects Flutterwave won't)
   -> Worker forwards payload to the Google Apps Script webhook recorder
      (runs on arcadecena@gmail.com — the account that owns the Firebase project)
   -> Apps Script writes the payment into Firestore:
      applications/<appId>.payments[]  (+ admissionNo on tuition)
   -> Student's profile page polls Firestore, sees the payment, shows "Paid",
      and emails the acceptance/admission letter via a second Apps Script
      (runs on the school's account so it can send as Admission@kftv.org).
```

## 3. Components & where they live (all under the `KFTV/` folder)

| Component | File | Owner account | Purpose |
| --- | --- | --- | --- |
| React app (the website) | `src/`, `public/`, `dist/` | n/a | Apply, pay, profile, admin |
| Firestore security rules | `KFTV/firestore.rules` | n/a | Paste into Firebase console → Rules |
| Webhook recorder (Apps Script) | `KFTV/scripts/webhook.gs` | `arcadecena@gmail.com` | Receives webhook → writes payment to Firestore |
| Letter sender (Apps Script) | `KFTV/scripts/letter-sender.gs` | client account (`Admission@kftv.org`) | Sends PDF acceptance/admission emails |
| Webhook relay (Cloudflare Worker) | `KFTV/scripts/cloudflare-worker.js` | whoever owns the worker | Public endpoint Flutterwave can reach |
| Optional PHP relay (only if hosting self) | `api/webhook.php` | hosting account | Alternative to the worker (not needed if worker is used) |

## 4. Credentials & URLs

| Item | Value / location |
| --- | --- |
| Firebase project | `kftv-31d71` |
| Firebase web API key | `AIzaSyDq3jajU4rC3WRQQ5gV1__R5lc-H3-a3aw` (public, in `src/lib/firebase.js`) |
| Flutterwave public key | `FLWPUBK-f88f5a025045973de54a8566cada6393-X` (in `src/pages/Profile.jsx`) |
| Flutterwave webhook URL (save in dashboard) | `https://kftv-webhook.pulsegadgets012.workers.dev/` |
| Flutterwave webhook secret hash | `kftv_webhook_7x3Q9mZ2pL` (same value in the Worker and Apps Script) |
| Webhook Apps Script URL | `https://script.google.com/macros/s/AKfycbzTMLiuyPeyTafP470szzAsrVR8gg6WvQoz7UkXHNwQNSYuI6C_0vAFD2Vfd0l9WwPx/exec` (internal, called by the worker) |
| Letter-sender Apps Script URL | `https://script.google.com/macros/s/AKfycbyRPrZTlLRRb8Ped-aGFvVjlbuAKwQPHhDzx7ifmncxuhsClXM_1LjJ6jxp6JuE2IaDaw/exec` (built into `Profile.jsx` / `Admin.jsx`) |
| Apps Script letter token | `kftv_admission_9f2c7b1e` (built into the frontend) |
| Admin emails allowed by rules | `kftv@admin.com`, `kftv.admin@kftv.com`, `Admission@kftv.org`, `arcadecena@gmail.com` |

Fees currently in code (temporary low values for testing — change before real launch):
registration **100 RWF**; tuition **110 / 120 / 120 RWF** (3M / 6M / 1Y).
They live in `src/pages/Profile.jsx` (`REG_FEE`, `TUITION`) and the price table in
`src/pages/Programs.jsx` — keep them in sync.

## 5. Apps Script requirements (both scripts)

- **Webhook recorder** (`webhook.gs`): runs as **Me** = `arcadecena@gmail.com`,
  access **Anyone**. It must be **linked to the `kftv-31d71` GCP project**
  (Project Settings → Google Cloud Platform project → the project's *number*).
  Manifest scopes (`appsscript.json`): `datastore`, `script.external_request`,
  `userinfo.email`.
- **Letter sender** (`letter-sender.gs`): runs as the school account so Gmail
  sends as `Admission@kftv.org`, access **Anyone**, token-protected.
- After any code change, redeploy the **same deployment → New version** (never
  "New deployment" — a new deployment makes a new URL and breaks the webhook).

## 6. Test checklist (prove it works before hosting)

1. **Rules**: Firebase console → Firestore → Rules → paste `firestore.rules` →
   **Publish**. Confirm `arcadecena@gmail.com` is in the `isAdmin()` list.
2. **Worker**: open `https://kftv-webhook.pulsegadgets012.workers.dev/` in a
   browser → expect `{"status":"error","message":"Method not allowed"}`.
3. **Webhook delivery probe**: POST to the worker URL with header
   `verif-hash: kftv_webhook_7x3Q9mZ2pL` and `?test=1` → expect `200` with
   `"probe"` JSON (shows Firestore connectivity).
4. **Write test**: temporarily create Firestore doc `applications/probe-write-test`
   (field `userId` = `probe`), then POST a webhook:
   ```json
   {"event":{"type":"charge.completed"},"data":{"status":"successful","tx_ref":"kftv-reg-probe-write-test-1234","id":"111111","amount":100,"currency":"RWF"}}
   ```
   Expect `{"status":"success"}` and a `payments` array appearing on the doc.
   Delete the doc afterwards.
5. **Flutterwave dashboard** → Settings → Webhooks → **Live webhook URL** =
   the worker URL, secret hash as above, toggles on. Save. Click **"Send test webhook"**
   → expect 200.
6. **End-to-end**: student applies → approved → pays 100 RWF → receipt → within
   seconds Firestore `payments` fills → profile shows ✅ Paid → acceptance email
   arrives from `Admission@kftv.org`.

> Tip: for payments charged *before* the webhook was fixed, use Flutterwave
> Transactions → the charge → **Resend webhook** to backfill Firestore.

## 7. Go-live / hosting (creator)

1. `npm install` then `npm run build` in the `KFTV/` folder → upload everything in
   `KFTV/dist/` to `public_html/` on the host.
2. The site needs a real HTTPS domain; HTTPS is already fine on most hosts.
3. The Cloudflare worker can stay as the permanent webhook endpoint (it is public
   and always on) — no PHP needed. (Alternative: host `api/webhook.php` on the
   server and point Flutterwave at `https://<domain>/api/webhook.php` instead.)
4. Before real launch, change the **fees** to the real amounts (see section 4) and
   rebuild.
5. Replace the placeholder admin emails in the rules with the real school staff
   emails, and publish the rules update.
6. Delete leftover test data (the `John Doe` test application, `probe-write-test`
   doc, and any old test intakes) from Firestore, and reset
   `counters/admissionNumber.current` if needed.

## 8. Security notes

- The Flutterwave **secret key** (`FLWSECK-…`) is only for the Flutterwave
  dashboard — never put it in the website.
- Only the **public** Flutterwave key and Firebase API key live in the frontend.
- The webhook hash / letter token are credentials — keep them out of anything
  public except where they already are by design (the token is in the frontend
  because the browser calls the letter sender).
- Security rules (not the API key) are the real gate on Firestore data.

---

## 9. UPDATE — Automated admission flow + OTP sign-in (implemented)

The application flow is now fully **automated** (no admin approve/reject step):

- **Student flow:** submit application (status `submitted`) → pay registration fee
  online → acceptance letter changes are recorded → pay full tuition for the period
  they chose → tuition payment automatically generates an admission number and the
  student is done. The student dashboard (`/profile`) drives all of this; the admin
  no longer approves/rejects applications (Admin now just views, assigns intake,
  sends letters, closes applications).
- **Sign-in is OTP-based** (`/login`): Email tab (6-digit code emailed),
  Phone tab (SMS via Firebase, needs the reCAPTCHA widget), or Google.

### 9a. Tuition / registration fees (live in `src/lib/config.js`)

| Item | Amount |
| --- | --- |
| Registration fee (`REG_FEE`) | **100 RWF — PLACEHOLDER, set the real amount** |
| Tuition — 1 Month | 150,000 RWF |
| Tuition — 3 Months | 450,000 RWF |
| Tuition — 6 Months | 750,000 RWF |
| Tuition — 1 Year | 1,050,000 RWF |

Study modes offered in the application: Online, In-Person, Hybrid, Weekend, Evening.

### 9b. MANDATORY redeploy steps (creator) — same Apps Script project

The OTP sending lives in the **same webhook script** (`scripts/webhook.gs`). Before
this goes live the creator MUST:

1. Open `scripts/webhook.gs` (the OTP-linked project) → Project Settings →
   **Scopes**: verify `https://www.googleapis.com/auth/gmail.send` is in the
   manifest (it is listed in the file header). If not, add it.
2. **Deploy as a NEW VERSION** of the existing Web App deployment (same URL), so the
   `/exec` link keeps working. The OTP token `kftv_otp_5Xr7Pb2wQn` is constant.
3. Note: OTP emails are sent from **the script owner's account** (`arcadecena@gmail.com`),
   not `Admission@kftv.org` — the letter sender (client account) still uses the school
   sender. Best practice is to send OTPs from a generic no-reply sender you control.
4. **Publish the updated `firestore.rules`**: new collections `otps` (admin only) and
   `doorkeys` (write allowed when the signed-in user's email matches) are added. The
   admin placeholders must be replaced with the real staff emails first.

### 9c. Cleanup before go-live

- Delete the `probe-write-test` Firebase doc if still present (it verified the write
  path during development).
- Old applications with status `pending` will still show in Admin as legacy rows;
  new applications all start at `submitted`.