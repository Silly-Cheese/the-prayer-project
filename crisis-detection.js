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
const notice = document.getElementById("formNotice");
let pendingCrisisRequest = null;
let lastFocusedElement = null;
let activeTrapHandler = null;

const selfHarmPatterns = [
  { label: "thinking about suicide", pattern: /\b(?:thinking|thoughts?)\s+(?:about|of)\s+suicid(?:e|ing)\b/i },
  { label: "suicidal", pattern: /\bsuicidal\b/i },
  { label: "kill myself", pattern: /\bkill myself\b/i },
  { label: "end my life", pattern: /\bend my life\b/i },
  { label: "take my life", pattern: /\btake my life\b/i },
  { label: "want to die", pattern: /\bwant to die\b/i },
  { label: "do not want to live", pattern: /\bi (?:do not|don['’]?t) want to live\b/i },
  { label: "no reason to live", pattern: /\bno reason to live\b/i },
  { label: "hurt myself", pattern: /\bhurt(?:ing)? myself\b/i },
  { label: "harm myself", pattern: /\bharm(?:ing)? myself\b/i },
  { label: "self-harm", pattern: /\bself[-\s]?harm(?:ing)?\b/i },
  { label: "cut myself", pattern: /\bcut(?:ting)? myself\b/i },
  { label: "overdose", pattern: /\b(?:overdose|overdosing)(?:\s+on)?\b/i },
  { label: "take pills to die", pattern: /\btake pills? (?:to|so i) (?:die|overdose|kill myself)\b/i },
  { label: "not safe alone", pattern: /\b(?:i am|i['’]?m) not safe (?:by myself|alone|right now)\b/i },
  { label: "cannot keep myself safe", pattern: /\b(?:can(?:not|'t)|might not|may not) keep myself safe\b/i },
  { label: "suicide plan", pattern: /\b(?:made|have|got|wrote|planned) (?:a )?(?:suicide|suicidal)?\s*plan\b/i },
  { label: "someone may be suicidal", pattern: /\b(?:my\s+)?(?:friend|brother|sister|mom|mother|dad|father|parent|child|son|daughter|student|coworker|co-worker|partner|boyfriend|girlfriend|he|she|they)\s+(?:is|are|seems?|feels?)\s+suicidal\b/i },
  { label: "someone wants to die", pattern: /\b(?:he|she|they|my\s+(?:friend|brother|sister|parent|child|student|partner))\s+(?:wants?|keeps? saying (?:he|she|they) wants?)\s+to die\b/i },
  { label: "someone may kill themselves", pattern: /\b(?:he|she|they)\s+(?:might|may|will|wants? to|is going to)\s+kill (?:himself|herself|themselves)\b/i }
];

const threatPatterns = [
  { label: "might hurt someone", pattern: /\b(?:i|we) (?:might|may|will|am going to|plan to|want to) hurt someone\b/i },
  { label: "kill someone", pattern: /\b(?:i|we) (?:might|may|will|am going to|plan to|want to) kill someone\b/i },
  { label: "kill them", pattern: /\b(?:i|we) (?:might|may|will|am going to|plan to|want to) kill (?:him|her|them)\b/i },
  { label: "shoot someone", pattern: /\b(?:i|we) (?:might|may|will|am going to|plan to|want to) shoot (?:someone|him|her|them)\b/i },
  { label: "shooting threat", pattern: /\b(?:shoot up|school shooting|church shooting|workplace shooting)\b/i },
  { label: "bring a gun to a location", pattern: /\bbring(?:ing)? (?:a|the) gun to (?:school|church|work|the office|their house|his house|her house)\b/i },
  { label: "use a gun on someone", pattern: /\buse (?:a|the) gun (?:on|against) (?:someone|him|her|them|people)\b/i },
  { label: "bomb threat", pattern: /\b(?:bomb|blow up) (?:the )?(?:school|church|building|office|house|store|event)\b/i }
];

injectCrisisModal();
injectPermanentCrisisHelp();

form?.addEventListener("submit", event => {
  const request = readRequest();
  const detection = detectCrisis(request);
  if (!detection.detected) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  pendingCrisisRequest = { ...request, crisisMatches: detection.matches, crisisType: detection.type };
  openCrisisModal(detection);
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
  const selfMatches = selfHarmPatterns.filter(item => item.pattern.test(combined)).map(item => item.label);
  const threatMatches = threatPatterns.filter(item => item.pattern.test(combined)).map(item => item.label);

  const negatedSuicidal = /\b(?:not|isn['’]?t|aren['’]?t|wasn['’]?t|never)\s+(?:feeling\s+)?suicidal\b/i.test(combined);
  const filteredSelf = negatedSuicidal ? selfMatches.filter(label => label !== "suicidal") : selfMatches;

  const type = filteredSelf.length && threatMatches.length ? "both" : threatMatches.length ? "threat" : filteredSelf.length ? "self-harm" : "none";
  const matches = [
    ...filteredSelf.map(label => `self-harm: ${label}`),
    ...threatMatches.map(label => `threat: ${label}`)
  ].slice(0, 10);

  return { detected: type !== "none", type, matches };
}

function injectPermanentCrisisHelp() {
  if (!form || document.getElementById("permanentCrisisHelp")) return;
  const panel = document.createElement("aside");
  panel.id = "permanentCrisisHelp";
  panel.className = "permanent-crisis-help";
  panel.setAttribute("aria-label", "Immediate crisis help");
  panel.innerHTML = `
    <div>
      <span class="permanent-crisis-kicker">Need help right now?</span>
      <strong>You do not have to finish a prayer request before getting help.</strong>
      <p>If you are thinking about suicide, in emotional crisis, or worried you may not stay safe, call or text 988. For immediate physical danger, call 911.</p>
    </div>
    <div class="permanent-crisis-actions">
      <a href="tel:988">Call 988</a>
      <a href="sms:988">Text 988</a>
      <a href="crisis.html">Crisis Resources</a>
    </div>`;
  form.insertAdjacentElement("afterend", panel);
}

function injectCrisisModal() {
  if (document.getElementById("crisisDetectionModal")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div id="crisisDetectionModal" class="crisis-detection-modal" aria-hidden="true">
      <div class="crisis-detection-backdrop" data-crisis-close></div>
      <section class="crisis-detection-card" role="dialog" aria-modal="true" aria-labelledby="crisisDetectionTitle" aria-describedby="crisisDetectionCopy">
        <button class="crisis-detection-close" type="button" data-crisis-close aria-label="Close crisis message">×</button>
        <p class="eyebrow" id="crisisDetectionEyebrow">Safety Concern</p>
        <h2 id="crisisDetectionTitle">Your message may describe a crisis.</h2>
        <p class="crisis-detection-priority">You do not need to finish submitting this prayer request before getting help.</p>
        <p class="crisis-detection-copy" id="crisisDetectionCopy"></p>
        <div class="crisis-detection-emergency" id="crisisDetectionEmergency"></div>
        <div class="crisis-detection-note"><strong>Important:</strong> The Prayer Project is not an emergency service and this site is not monitored for immediate intervention. Submitting a request does <strong>not</strong> contact 988, 911, law enforcement, EMS, or a mental-health professional, and an administrator may not see your request immediately.</div>
        <div class="crisis-detection-actions" id="crisisDetectionImmediateActions"></div>
        <div class="crisis-detection-divider"></div>
        <p class="crisis-detection-review-copy">If you still want prayer support, you may submit the request privately for administrator review. It will stay off the public prayer wall unless an administrator later approves it.</p>
        <div class="crisis-detection-actions secondary-actions">
          <button class="btn btn-secondary" type="button" id="proceedCrisisSubmitBtn">Submit Privately for Review</button>
          <button class="btn btn-secondary" type="button" data-crisis-close>Go Back and Edit</button>
        </div>
        <div class="crisis-detection-status" id="crisisDetectionStatus" aria-live="polite"></div>
      </section>
    </div>
  `);

  const style = document.createElement("style");
  style.id = "crisisDetectionStyles";
  style.textContent = `
    .permanent-crisis-help{margin-top:18px;padding:20px;border-radius:24px;background:linear-gradient(135deg,rgba(245,183,183,.10),rgba(216,195,165,.055));border:1px solid rgba(245,183,183,.25);display:grid;gap:16px}.permanent-crisis-help strong{display:block;color:#fff1f1;font-size:18px;line-height:1.4}.permanent-crisis-help p{margin:8px 0 0;color:var(--muted,#c9beb0);line-height:1.65;font-size:13px}.permanent-crisis-kicker{display:block;color:#ffd1d1;font-size:11px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;margin-bottom:7px}.permanent-crisis-actions{display:flex;gap:9px;flex-wrap:wrap}.permanent-crisis-actions a{display:inline-flex;justify-content:center;align-items:center;min-height:42px;padding:10px 15px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:12px;font-weight:900}.permanent-crisis-actions a:first-child{background:linear-gradient(135deg,var(--warm2,#fff0d2),var(--warm,#d8c3a5));color:#000;border-color:transparent}
    .crisis-detection-modal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:22px}.crisis-detection-modal.show{display:flex}.crisis-detection-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(12px)}.crisis-detection-card{position:relative;width:min(720px,100%);max-height:calc(100vh - 44px);overflow:auto;padding:32px;border-radius:34px;background:linear-gradient(180deg,rgba(18,16,14,.99),rgba(5,5,5,.99));border:1px solid rgba(245,183,183,.34);box-shadow:0 35px 120px rgba(0,0,0,.82);color:var(--text,#f7f2ea);outline:none}.crisis-detection-card h2{font-family:"Playfair Display",Georgia,serif;font-size:42px;line-height:1.02;margin:14px 0 12px;color:#fff1f1}.crisis-detection-priority{font-size:18px;font-weight:900;color:#fff;line-height:1.55;margin:0 0 12px}.crisis-detection-copy,.crisis-detection-review-copy{color:var(--muted,#c9beb0);line-height:1.75}.crisis-detection-emergency{margin:18px 0;padding:18px;border-radius:22px;background:rgba(245,183,183,.11);border:1px solid rgba(245,183,183,.27);color:#ffdede;line-height:1.65}.crisis-detection-emergency strong{display:block;color:#fff;font-size:17px;margin-bottom:6px}.crisis-detection-note{margin:18px 0;padding:16px 18px;border-radius:20px;background:rgba(255,255,255,.045);border:1px solid rgba(216,195,165,.18);color:var(--muted,#c9beb0);line-height:1.65}.crisis-detection-note strong{color:#fff}.crisis-detection-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}.crisis-detection-actions.secondary-actions{grid-template-columns:1fr 1fr}.crisis-detection-actions a{display:flex;align-items:center;justify-content:center;text-align:center;min-height:48px;border-radius:999px;padding:13px 16px;font-size:13px;font-weight:900;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#fff}.crisis-detection-actions a.primary{background:linear-gradient(135deg,var(--warm2,#fff0d2),var(--warm,#d8c3a5));color:#000;border-color:transparent}.crisis-detection-actions a.danger{background:rgba(245,183,183,.16);border-color:rgba(245,183,183,.32);color:#fff1f1}.crisis-detection-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(216,195,165,.22),transparent);margin:24px 0}.crisis-detection-close{position:absolute;right:18px;top:18px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:var(--text,#f7f2ea);font-size:24px;cursor:pointer}.crisis-detection-status{min-height:22px;margin-top:14px;color:var(--soft,#91877b);font-size:14px}.crisis-detection-status.error{color:var(--danger,#ffd1d1)}.crisis-detection-status.success{color:var(--success,#9ff2b3)}body.crisis-modal-open{overflow:hidden}@media(max-width:760px){.crisis-detection-card{padding:24px}.crisis-detection-card h2{font-size:34px}.crisis-detection-actions,.crisis-detection-actions.secondary-actions{grid-template-columns:1fr}.permanent-crisis-actions{display:grid;grid-template-columns:1fr 1fr}.permanent-crisis-actions a:last-child{grid-column:1/-1}}
  `;
  document.head.appendChild(style);

  document.querySelectorAll("[data-crisis-close]").forEach(button => button.addEventListener("click", closeCrisisModal));
  document.getElementById("proceedCrisisSubmitBtn")?.addEventListener("click", submitCrisisRequest);
  document.addEventListener("keydown", event => { if (event.key === "Escape" && document.getElementById("crisisDetectionModal")?.classList.contains("show")) closeCrisisModal(); });
}

function openCrisisModal(detection) {
  const modal = document.getElementById("crisisDetectionModal");
  const title = document.getElementById("crisisDetectionTitle");
  const eyebrow = document.getElementById("crisisDetectionEyebrow");
  const copy = document.getElementById("crisisDetectionCopy");
  const emergency = document.getElementById("crisisDetectionEmergency");
  const actions = document.getElementById("crisisDetectionImmediateActions");
  const status = document.getElementById("crisisDetectionStatus");
  if (!modal || !title || !eyebrow || !copy || !emergency || !actions) return;

  if (status) { status.textContent = ""; status.className = "crisis-detection-status"; }

  if (detection.type === "threat") {
    eyebrow.textContent = "Immediate Safety Concern";
    title.textContent = "Your message may describe a threat to someone’s safety.";
    copy.textContent = "If there is an immediate threat of violence, a weapon, or physical danger, move to a safe place if you can and contact emergency services. Do not rely on this prayer submission to get emergency help.";
    emergency.innerHTML = `<strong>Immediate physical danger or threat of violence?</strong> In the United States, call 911 now. If you are outside the U.S., contact your local emergency number.`;
    actions.innerHTML = `<a class="danger" href="tel:911">Call 911</a><a href="crisis.html">Safety & Crisis Resources</a>`;
  } else if (detection.type === "both") {
    eyebrow.textContent = "Immediate Safety Concern";
    title.textContent = "Your message may describe more than one immediate safety crisis.";
    copy.textContent = "Your message appears to include both suicide or self-harm concerns and a possible threat to someone else. Get immediate help rather than waiting for an administrator to review this request.";
    emergency.innerHTML = `<strong>If anyone may be in immediate physical danger, call 911 now.</strong> For suicide, self-harm, or emotional crisis support in the United States, call or text 988.`;
    actions.innerHTML = `<a class="danger" href="tel:911">Call 911</a><a class="primary" href="tel:988">Call 988</a><a href="sms:988">Text 988</a>`;
  } else {
    eyebrow.textContent = "Suicide / Self-Harm Concern";
    title.textContent = "Your message may describe a suicide or self-harm crisis.";
    copy.textContent = "If you are thinking about suicide, worried you may hurt yourself, or are afraid you may not stay safe, connect with a trained crisis counselor now. You can also use 988 if you are worried about someone else.";
    emergency.innerHTML = `<strong>You do not need to wait until things feel “bad enough.”</strong> In the United States, call or text 988 for 24/7 suicide, mental-health, or emotional-crisis support. If there is immediate life-threatening physical danger, call 911.`;
    actions.innerHTML = `<a class="primary" href="tel:988">Call 988</a><a href="sms:988">Text 988</a><a href="crisis.html">Crisis Resources</a>`;
  }

  lastFocusedElement = document.activeElement;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("crisis-modal-open");
  const card = modal.querySelector(".crisis-detection-card");
  card?.setAttribute("tabindex", "-1");
  requestAnimationFrame(() => card?.focus());
  enableFocusTrap(modal);
}

function closeCrisisModal() {
  const modal = document.getElementById("crisisDetectionModal");
  modal?.classList.remove("show");
  modal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("crisis-modal-open");
  disableFocusTrap();
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
}

function enableFocusTrap(modal) {
  disableFocusTrap();
  activeTrapHandler = event => {
    if (event.key !== "Tab" || !modal.classList.contains("show")) return;
    const focusable = [...modal.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el => !el.hidden && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  document.addEventListener("keydown", activeTrapHandler);
}

function disableFocusTrap() {
  if (!activeTrapHandler) return;
  document.removeEventListener("keydown", activeTrapHandler);
  activeTrapHandler = null;
}

async function submitCrisisRequest() {
  if (!pendingCrisisRequest) return;
  const button = document.getElementById("proceedCrisisSubmitBtn");
  try {
    button.disabled = true;
    button.textContent = "Submitting Privately...";
    setModalStatus("Submitting your request for private administrator review...", "");

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
      const typeText = pendingCrisisRequest.crisisType === "threat" ? "possible threat to others" : pendingCrisisRequest.crisisType === "both" ? "possible self-harm and threat-to-others concerns" : "possible suicide or self-harm concern";
      await addDoc(collection(db, "reports"), {
        requestId: docRef.id,
        email: pendingCrisisRequest.email || "crisis-auto-flag@ask4prayers.com",
        emailKey: emailKey(pendingCrisisRequest.email || "crisis-auto-flag@ask4prayers.com"),
        category: "Crisis Auto-Flag",
        reason: `Automatically marked for private review because the message may describe a ${typeText}. This report is not an emergency dispatch or clinical assessment.`,
        status: "open",
        autoGenerated: true,
        createdAt: serverTimestamp()
      });
    } catch (reportError) {
      console.warn("Crisis request was submitted, but the report record could not be created.", reportError);
    }

    setModalStatus("Your request was submitted privately for administrator review. This does not contact emergency or crisis services, and the request will not appear publicly unless an administrator approves it.", "success");
    showFormNotice("Your request was submitted privately for review because it may describe a safety crisis.", "success");
    form?.reset();
    pendingCrisisRequest = null;
    setTimeout(closeCrisisModal, 1800);
  } catch (error) {
    console.error(error);
    setModalStatus("The prayer request could not be submitted. If you need immediate help, use 988, 911 for immediate physical danger, or the Crisis Resources page now.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "Submit Privately for Review";
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
