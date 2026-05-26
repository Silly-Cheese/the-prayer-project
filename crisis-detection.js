import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0",
  authDomain: "prayer-projec.firebaseapp.com",
  projectId: "prayer-projec",
  storageBucket: "prayer-projec.firebasestorage.app",
  messagingSenderId: "47966669764",
  appId: "1:47966669764:web:b875d2ea5bf75e3b7b3291"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("prayerForm");
const submitBtn = document.getElementById("submitBtn");
const notice = document.getElementById("formNotice");
let pendingCrisisRequest = null;

const crisisPatterns = [
  /\bsuicid(?:e|al)\b/i,
  /\bself[-\s]?harm\b/i,
  /\bharm(?:ing)? myself\b/i,
  /\bhurt(?:ing)? myself\b/i,
  /\bkill myself\b/i,
  /\bend my life\b/i,
  /\btake my life\b/i,
  /\bwant to die\b/i,
  /\bi don['’]?t want to live\b/i,
  /\bno reason to live\b/i,
  /\bcut(?:ting)? myself\b/i,
  /\boverdose\b/i,
  /\btake pills\b/i,
  /\bi might hurt someone\b/i,
  /\bhurt someone\b/i,
  /\bkill someone\b/i,
  /\bkill them\b/i,
  /\bshoot myself\b/i,
  /\bshoot someone\b/i,
  /\bshoot up\b/i,
  /\bbring a gun\b/i,
  /\buse a gun\b/i,
  /\bbomb\b/i
];

injectCrisisModal();

form?.addEventListener("submit", event => {
  const request = readRequest();
  const detection = detectCrisis(request);
  if (!detection.detected) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  pendingCrisisRequest = { ...request, crisisMatches: detection.matches };
  openCrisisModal(detection.matches);
}, true);

function readRequest() {
  return {
    title: document.getElementById("title")?.value.trim() || "",
    category: document.getElementById("category")?.value || "Other",
    message: document.getElementById("message")?.value.trim() || "",
    email: normalizeEmail(document.getElementById("email")?.value || ""),
    urgent: document.getElementById("urgent")?.value === "true"
  };
}

function detectCrisis(request) {
  const combined = `${request.title}\n${request.message}`;
  const matches = crisisPatterns
    .filter(pattern => pattern.test(combined))
    .map(pattern => pattern.source.replace(/\\b/g, "").replace(/\\/g, ""))
    .slice(0, 8);
  return { detected: matches.length > 0, matches };
}

function injectCrisisModal() {
  if (document.getElementById("crisisDetectionModal")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div id="crisisDetectionModal" class="crisis-detection-modal" aria-hidden="true">
      <div class="crisis-detection-backdrop" data-crisis-close></div>
      <section class="crisis-detection-card" role="dialog" aria-modal="true" aria-labelledby="crisisDetectionTitle">
        <button class="crisis-detection-close" type="button" data-crisis-close>×</button>
        <p class="eyebrow">Crisis Message Detected</p>
        <h2 id="crisisDetectionTitle">This request was marked as a crisis message.</h2>
        <p class="crisis-detection-copy">Your words matter, and we want this handled carefully. You can go directly to crisis resources now, or you can continue submitting this request. If you proceed, it will be hidden from the public prayer wall and sent to admins for review.</p>
        <div class="crisis-detection-note"><strong>Immediate danger?</strong><br>If you or someone else may be in immediate danger, contact emergency services now. The Prayer Project is not an emergency service.</div>
        <div class="crisis-detection-actions">
          <a class="btn btn-primary" href="crisis.html">Go to Crisis Resources</a>
          <button class="btn btn-secondary" type="button" id="proceedCrisisSubmitBtn">Proceed and Submit for Review</button>
          <button class="btn btn-secondary" type="button" data-crisis-close>Go Back and Edit</button>
        </div>
        <div class="crisis-detection-status" id="crisisDetectionStatus"></div>
      </section>
    </div>
  `);

  const style = document.createElement("style");
  style.id = "crisisDetectionStyles";
  style.textContent = `
    .crisis-detection-modal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:22px}.crisis-detection-modal.show{display:flex}.crisis-detection-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.86);backdrop-filter:blur(12px)}.crisis-detection-card{position:relative;width:min(680px,100%);max-height:calc(100vh - 44px);overflow:auto;padding:32px;border-radius:34px;background:linear-gradient(180deg,rgba(18,16,14,.99),rgba(5,5,5,.99));border:1px solid rgba(245,183,183,.34);box-shadow:0 35px 120px rgba(0,0,0,.82);color:var(--text,#f7f2ea)}.crisis-detection-card h2{font-family:"Playfair Display",Georgia,serif;font-size:42px;line-height:1.02;margin:14px 0 12px;color:#fff1f1}.crisis-detection-copy{color:var(--muted,#c9beb0);line-height:1.75}.crisis-detection-note{margin:18px 0;padding:16px 18px;border-radius:20px;background:rgba(245,183,183,.10);border:1px solid rgba(245,183,183,.24);color:#ffd1d1;line-height:1.65}.crisis-detection-actions{display:grid;gap:10px;margin-top:18px}.crisis-detection-close{position:absolute;right:18px;top:18px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:var(--text,#f7f2ea);font-size:24px;cursor:pointer}.crisis-detection-status{min-height:22px;margin-top:14px;color:var(--soft,#91877b);font-size:14px}.crisis-detection-status.error{color:var(--danger,#ffd1d1)}.crisis-detection-status.success{color:var(--success,#9ff2b3)}body.crisis-modal-open{overflow:hidden}@media(max-width:760px){.crisis-detection-card{padding:24px}.crisis-detection-card h2{font-size:34px}}
  `;
  document.head.appendChild(style);

  document.querySelectorAll("[data-crisis-close]").forEach(button => button.addEventListener("click", closeCrisisModal));
  document.getElementById("proceedCrisisSubmitBtn")?.addEventListener("click", submitCrisisRequest);
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeCrisisModal(); });
}

function openCrisisModal() {
  const modal = document.getElementById("crisisDetectionModal");
  const status = document.getElementById("crisisDetectionStatus");
  if (status) { status.textContent = ""; status.className = "crisis-detection-status"; }
  modal?.classList.add("show");
  modal?.setAttribute("aria-hidden", "false");
  document.body.classList.add("crisis-modal-open");
}

function closeCrisisModal() {
  const modal = document.getElementById("crisisDetectionModal");
  modal?.classList.remove("show");
  modal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("crisis-modal-open");
}

async function submitCrisisRequest() {
  if (!pendingCrisisRequest) return;
  const button = document.getElementById("proceedCrisisSubmitBtn");
  const status = document.getElementById("crisisDetectionStatus");
  try {
    button.disabled = true;
    button.textContent = "Submitting for Review...";
    setModalStatus("Submitting your request for private review...", "");

    const docRef = await addDoc(collection(db, "prayer_requests"), {
      title: pendingCrisisRequest.title,
      category: pendingCrisisRequest.category,
      message: pendingCrisisRequest.message,
      email: pendingCrisisRequest.email,
      urgent: true,
      prayerCount: 0,
      reportCount: 1,
      answered: false,
      status: "reported",
      crisisAutoFlag: true,
      crisisReviewNeeded: true,
      crisisMatchedTerms: pendingCrisisRequest.crisisMatches || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    try {
      await addDoc(collection(db, "reports"), {
        requestId: docRef.id,
        email: pendingCrisisRequest.email || "crisis-auto-flag@ask4prayers.com",
        emailKey: emailKey(pendingCrisisRequest.email || "crisis-auto-flag@ask4prayers.com"),
        category: "Crisis Auto-Flag",
        reason: "This request was automatically marked for review because it appears to mention self-harm, harm, or crisis-related language.",
        status: "open",
        autoGenerated: true,
        createdAt: serverTimestamp()
      });
    } catch (reportError) {
      console.warn("Crisis request was submitted, but the report record could not be created.", reportError);
    }

    setModalStatus("Your request was submitted privately for review. It will not appear on the public prayer wall unless an admin approves it.", "success");
    showFormNotice("Your request was submitted privately for review because it was marked as a crisis message.", "success");
    form?.reset();
    pendingCrisisRequest = null;
    setTimeout(closeCrisisModal, 1200);
  } catch (error) {
    console.error(error);
    setModalStatus("This could not be submitted for review. Please check the Firestore rules or use the Crisis Resources page now.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "Proceed and Submit for Review";
  }
}

function setModalStatus(message, type) {
  const status = document.getElementById("crisisDetectionStatus");
  if (!status) return;
  status.textContent = message;
  status.className = type ? `crisis-detection-status ${type}` : "crisis-detection-status";
}

function showFormNotice(message, type = "success") {
  if (!notice) return;
  notice.textContent = message;
  notice.className = `notice show ${type}`;
}

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function emailKey(email = "") {
  return normalizeEmail(email).replace(/[.#$/\[\]]/g, "_");
}
