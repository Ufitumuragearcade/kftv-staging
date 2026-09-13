// Shared configuration for the KFTV admissions & payment flow.

// Flutterwave (public — safe for the browser)
export const FLW_PUBLIC_KEY = "FLWPUBK-f88f5a025045973de54a8566cada6393-X";

// Apps Script that sends letters AND handles sign-in OTP.
// Both are deployed here so emails come from the same account.
export const LETTER_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxTauoq9IRVsvTukTHsucDDtTlI1q_WChwdBYr5b5epaJE7B4MXYmd5doglFQYjDWs/exec";
export const APP_SCRIPT_TOKEN = "kftv_admission_9f2c7b1e";
export const OTP_TOKEN = "kftv_otp_5Xr7Pb2wQn";

// OTP runs on the same deployment as letters so both come from the same account.
export const OTP_WEB_APP_URL = LETTER_WEB_APP_URL;

// Fees (RWF)
export const REG_FEE = 13500; // one-time registration fee

export const TUITION = {
  "1 Month": 150000,
  "3 Months": 450000,
  "6 Months": 750000,
  "1 Year": 1050000
};

// Tuition period label -> webhook key used inside the tx_ref
export const DURATION_KEYS = {
  "1 Month": "1m",
  "3 Months": "3m",
  "6 Months": "6m",
  "1 Year": "1y"
};

// Study modes offered in the application form & paid programmes
export const STUDY_MODES = ["Online", "In-Person", "Hybrid", "Weekend", "Evening"];

export const COURSES = [
  "Filmmaking and Television Production",
  "Graphic Design and Photography",
  "Animation and Visual Effects",
  "Music Audio Production",
  "Acting for Film and Television",
  "Programming and Software Development",
  "Digital Marketing"
];

export function formatRwf(amount) {
  return Number(amount || 0).toLocaleString("en-US") + " RWF";
}