import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, query, where, serverTimestamp, updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = { apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0", authDomain:"prayer-projec.firebaseapp.com", projectId:"prayer-projec", storageBucket:"prayer-projec.firebasestorage.app", messagingSenderId:"47966669764", appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const EMAIL_ENDPOINT = "https://script.google.com/macros/s/AKfycbxdmttZIR8nCYr_613OEpsH7p1OFO19sHOyW04tacpRHC05VUthelEPRCr9KcUQdE5xxw/exec";
const PRAYER_EMAIL = "pray@ask4prayers.com";

const prayerForm = document.getElementById("prayerForm");
const prayerGrid = document.getElementById("prayerGrid");
const formNotice = document.getElementById("formNotice");
const submitBtn = document.getElementById("submitBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const totalRequestsElement = document.getElementById("totalRequests");
const totalPrayersElement = document.getElementById("totalPrayers");
const urgentRequestsElement = document.getElementById("urgentRequests");

let allRequests = [];
let submissionsOpen = true;
let selectedAnsweredRequest = null;
let wallFilter = "all";

window.PRAYER_PROJECT_DEBUG = { EMAIL_ENDPOINT, PRAYER_EMAIL, sendTestPrayerEmail };

injectAnsweredModalStyles();
createAnsweredModal();
createWallFilterButtons();

prayerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!submissionsOpen) {
    showNotice(`Online prayer request submissions are currently closed. Please email your request to ${PRAYER_EMAIL}.`, "error", 20000);
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting Prayer Request...";

    const publicRequest = {
      title: document.getElementById("title").value.trim(),
      category: document.getElementById("category").value,
      message: document.getElementById("message").value.trim(),
      email: document.getElementById("email").value.trim(),
      urgent: document.getElementById("urgent").value === "true",
      prayerCount: 0,
      reportCount: 0,
      answered: false,
      status: "approved",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, "prayer_requests"), publicRequest);
    showNotice("Your prayer request has been posted. People can now pray for you.", "success");
    prayerForm.reset();
    await loadPrayerRequests();
  } catch (error) {
    console.error(error);
    showNotice("Something went wrong while submitting your prayer request. Please check the Firestore rules.", "error");
  } finally {
    submitBtn.disabled = !submissionsOpen;
    submitBtn.textContent = submissionsOpen ? "Submit Prayer Request" : "Submissions Closed";
  }
});

async function loadSubmissionSettings() {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    if (settingsDoc.exists()) submissionsOpen = settingsDoc.data().submissionsOpen !== false;
  } catch (error) {
    console.error("Could not load submission settings:", error);
    submissionsOpen = true;
  }
  applySubmissionState();
}

function applySubmissionState() {
  if (!prayerForm || !submitBtn) return;
  prayerForm.querySelectorAll("input, select, textarea").forEach((field) => { field.disabled = !submissionsOpen; });
  submitBtn.disabled = !submissionsOpen;
  submitBtn.textContent = submissionsOpen ? "Submit Prayer Request" : "Submissions Closed";
  if (!submissionsOpen) showNotice(`Online prayer request submissions are currently closed. Please email your request to ${PRAYER_EMAIL}.`, "error", 20000);
}

async function loadPrayerRequests() {
  try {
    const snapshot = await getDocs(query(collection(db, "prayer_requests"), where("status", "==", "approved")));
    allRequests = [];
    snapshot.forEach((documentSnapshot) => allRequests.push({ id: documentSnapshot.id, ...documentSnapshot.data() }));
    allRequests.sort((a,b) => getTime(b.createdAt) - getTime(a.createdAt));
    filterRequests();
    updateStatistics();
  } catch (error) {
    console.error(error);
    prayerGrid.innerHTML = `<div class="empty">The prayer wall could not load yet. Please make sure your Firestore rules are published.</div>`;
  }
}

function renderPrayerRequests(requests) {
  if (!requests.length) {
    const message = wallFilter === "answered" ? "No answered prayers are shown yet. When someone marks a request answered, it will appear here." : wallFilter === "open" ? "No open prayer requests are currently shown." : `No prayer requests are currently posted. When online submissions reopen, new requests will appear here. You may also email ${PRAYER_EMAIL}.`;
    prayerGrid.innerHTML = `<div class="empty">${message}</div>`;
    return;
  }

  prayerGrid.innerHTML = requests.map((request) => {
    const createdDate = request.createdAt?.toDate ? request.createdAt.toDate().toLocaleDateString() : "Recently";
    const answeredClass = request.answered ? " answered" : "";
    const answeredTag = request.answered ? '<div class="tag answered-tag">Answered!</div>' : '';
    const urgentTag = request.urgent ? '<div class="tag urgent">Urgent</div>' : '';
    const testimony = request.answered && request.answeredTestimony ? `<div class="answered-testimony"><strong>Answered Update</strong><p>${escapeHtml(request.answeredTestimony)}</p></div>` : "";
    const answeredAction = request.answered ? `<div class="answered-praise">Praise God. This prayer has been marked answered.</div>` : `<button class="answered-link" data-id="${request.id}">Is this your request? Mark it answered</button>`;

    return `<article class="prayer-card${answeredClass}" data-card-id="${request.id}" tabindex="0">
      <div class="tag-row"><div class="tag">🙏 ${escapeHtml(request.category)}</div>${urgentTag}${answeredTag}</div>
      <h3>${escapeHtml(request.title)}</h3>
      <p>${escapeHtml(request.message)}</p>
      ${testimony}
      <div class="card-footer">
        <div class="meta"><span>${createdDate}</span><span>${request.prayerCount || 0} prayed</span></div>
        <button class="btn btn-primary btn-block pray-button" data-id="${request.id}">Pray For This Request</button>
        ${answeredAction}
        <button class="report-link report-button" data-id="${request.id}">Report</button>
      </div>
    </article>`;
  }).join("");

  attachCardAnswerHandlers();
  attachPrayButtons();
  attachReportButtons();
}

function attachCardAnswerHandlers(){
  document.querySelectorAll(".answered-link[data-id]").forEach((button)=>{
    button.addEventListener("click",(event)=>{
      event.stopPropagation();
      openAnsweredModal(button.dataset.id);
    });
  });

  document.querySelectorAll(".prayer-card[data-card-id]").forEach((card)=>{
    const openFromCard = (event) => {
      if(event.target.closest("button")) return;
      const request = allRequests.find((item)=>item.id === card.dataset.cardId);
      if(request && !request.answered) openAnsweredModal(card.dataset.cardId);
    };

    card.addEventListener("click", openFromCard);
    card.addEventListener("keydown",(event)=>{
      if(event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openFromCard(event);
    });
  });
}

function createWallFilterButtons(){
  const toolbar = document.querySelector(".toolbar");
  if(!toolbar || document.getElementById("wallAnsweredFilters")) return;
  const filterWrap = document.createElement("div");
  filterWrap.id = "wallAnsweredFilters";
  filterWrap.className = "wall-filter-tabs";
  filterWrap.innerHTML = `<button class="wall-filter active" data-wall-filter="all">All Requests</button><button class="wall-filter" data-wall-filter="open">Open Requests</button><button class="wall-filter" data-wall-filter="answered">Answered Prayers</button>`;
  toolbar.prepend(filterWrap);
  filterWrap.querySelectorAll("[data-wall-filter]").forEach((button)=>{
    button.addEventListener("click",()=>{
      wallFilter = button.dataset.wallFilter;
      filterWrap.querySelectorAll(".wall-filter").forEach((item)=>item.classList.remove("active"));
      button.classList.add("active");
      filterRequests();
    });
  });
}

function createAnsweredModal(){
  if(document.getElementById("answeredModal")) return;
  const modal = document.createElement("div");
  modal.id = "answeredModal";
  modal.className = "answered-modal";
  modal.style.display = "none";
  modal.innerHTML = `
    <div class="answered-modal-backdrop" data-close-answered></div>
    <section class="answered-modal-card" role="dialog" aria-modal="true" aria-labelledby="answeredModalTitle">
      <button class="answered-modal-close" type="button" data-close-answered aria-label="Close">×</button>
      <div class="eyebrow">Answered Prayer</div>
      <h2 id="answeredModalTitle">Mark this prayer as answered.</h2>
      <p>Enter the same email you used when submitting this prayer request. This helps make sure only the requester can mark it answered.</p>
      <div class="answered-modal-request" id="answeredModalRequest"></div>
      <label class="answered-modal-label" for="answeredEmailInput">Requester Email</label>
      <input id="answeredEmailInput" type="email" placeholder="you@example.com" autocomplete="email">
      <label class="answered-modal-label" for="answeredTestimonyInput">How was this prayer answered? Optional</label>
      <textarea id="answeredTestimonyInput" rows="4" maxlength="500" placeholder="Example: God gave me peace, opened a door, or helped the situation begin to change."></textarea>
      <div class="answered-modal-notice" id="answeredModalNotice"></div>
      <button class="btn btn-primary btn-block" id="confirmAnsweredBtn" type="button">Mark Answered</button>
    </section>
  `;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-close-answered]").forEach((item)=>item.addEventListener("click", closeAnsweredModal));
  document.getElementById("confirmAnsweredBtn")?.addEventListener("click", confirmAnsweredPrayer);
  document.getElementById("answeredEmailInput")?.addEventListener("keydown",(event)=>{ if(event.key === "Enter") confirmAnsweredPrayer(); });
  document.addEventListener("keydown",(event)=>{ if(event.key === "Escape") closeAnsweredModal(); });
}

function injectAnsweredModalStyles(){
  if(document.getElementById("answeredModalRuntimeStyles")) return;
  const style = document.createElement("style");
  style.id = "answeredModalRuntimeStyles";
  style.textContent = `
    .wall-filter-tabs{display:flex;gap:8px;flex-wrap:wrap;width:100%;margin-bottom:2px}.wall-filter{border:1px solid rgba(216,195,165,.18);background:rgba(255,255,255,.045);color:var(--muted,#c9beb0);border-radius:999px;padding:12px 15px;font-weight:900;cursor:pointer}.wall-filter.active{background:linear-gradient(135deg,var(--warm2,#fff0d2),var(--warm,#d8c3a5));color:#000}.answered{border-color:rgba(159,242,179,.42)!important;background:linear-gradient(180deg,rgba(35,128,61,.24),rgba(255,255,255,.04))!important;box-shadow:0 30px 90px rgba(31,122,58,.18)!important}.answered-tag{background:rgba(159,242,179,.14)!important;color:var(--green,#9ff2b3)!important;border-color:rgba(159,242,179,.28)!important}.answered-link,.report-link{border:0;background:transparent;color:var(--soft,#91877b);font-weight:900;cursor:pointer;text-align:center;padding:4px 8px}.answered-link{color:var(--warm2,#fff0d2)}.answered-link:hover,.report-link:hover{text-decoration:underline}.answered-praise{padding:12px 14px;border-radius:18px;background:rgba(159,242,179,.1);border:1px solid rgba(159,242,179,.18);color:var(--green,#9ff2b3);font-size:13px;font-weight:900;text-align:center}.answered-testimony{margin-top:2px;padding:16px;border-radius:20px;background:rgba(159,242,179,.08);border:1px solid rgba(159,242,179,.16)}.answered-testimony strong{color:var(--green,#9ff2b3);font-size:13px}.answered-testimony p{margin:8px 0 0!important}.answered-modal{position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;padding:24px}.answered-modal.show{display:flex!important}.answered-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(12px)}.answered-modal-card{position:relative;width:min(600px,100%);max-height:calc(100vh - 48px);overflow:auto;padding:30px;border-radius:34px;background:linear-gradient(180deg,rgba(18,16,14,.98),rgba(5,5,5,.98));border:1px solid rgba(216,195,165,.2);box-shadow:0 35px 120px rgba(0,0,0,.82);color:var(--text,#f7f2ea)}.answered-modal-card h2{font-family:"Playfair Display",Georgia,serif;font-size:42px;line-height:1;letter-spacing:-.04em;margin:18px 0 12px}.answered-modal-card p{color:var(--muted,#c9beb0);line-height:1.75}.answered-modal-close{position:absolute;right:18px;top:18px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:var(--text,#f7f2ea);font-size:24px;cursor:pointer}.answered-modal-request{display:grid;gap:8px;margin:18px 0;padding:18px;border-radius:20px;background:rgba(216,195,165,.06);border:1px solid rgba(216,195,165,.14)}.answered-modal-request strong{color:var(--warm2,#fff0d2)}.answered-modal-request span{color:var(--muted,#c9beb0);line-height:1.65}.answered-modal-label{display:block;margin:14px 0 8px;color:var(--muted,#c9beb0);font-size:13px;font-weight:900}.answered-modal-notice{min-height:22px;margin:14px 0;color:var(--soft,#91877b);font-size:14px;line-height:1.55}.answered-modal-notice.error{color:var(--danger,#ffd1d1)}.answered-modal-notice.success{color:var(--green,#9ff2b3)}body.answered-modal-open{overflow:hidden}@media(max-width:760px){.answered-modal-card{padding:24px}.answered-modal-card h2{font-size:34px}}
  `;
  document.head.appendChild(style);
}

function openAnsweredModal(requestId){
  const prayerRequest = allRequests.find((request)=>request.id===requestId);
  if(!prayerRequest || prayerRequest.answered) return;
  selectedAnsweredRequest = prayerRequest;
  document.getElementById("answeredModalRequest").innerHTML = `<strong>${escapeHtml(prayerRequest.title)}</strong><span>${escapeHtml(prayerRequest.message)}</span>`;
  document.getElementById("answeredEmailInput").value = "";
  document.getElementById("answeredTestimonyInput").value = "";
  showAnsweredNotice("", "");
  const modal = document.getElementById("answeredModal");
  modal.style.display = "flex";
  modal.classList.add("show");
  document.body.classList.add("answered-modal-open");
  setTimeout(()=>document.getElementById("answeredEmailInput").focus(),50);
}

function closeAnsweredModal(){
  const modal = document.getElementById("answeredModal");
  if(!modal) return;
  modal.classList.remove("show");
  modal.style.display = "none";
  document.body.classList.remove("answered-modal-open");
  selectedAnsweredRequest = null;
}

async function confirmAnsweredPrayer(){
  if(!selectedAnsweredRequest) return;
  const button = document.getElementById("confirmAnsweredBtn");
  const enteredEmail = normalizeEmail(document.getElementById("answeredEmailInput").value);
  const savedEmail = normalizeEmail(selectedAnsweredRequest.email);
  const testimony = document.getElementById("answeredTestimonyInput").value.trim().slice(0,500);

  if(!enteredEmail) return showAnsweredNotice("Please enter the email used on this request.", "error");
  if(enteredEmail !== savedEmail) return showAnsweredNotice("That email does not match this prayer request.", "error");

  try{
    button.disabled = true;
    button.textContent = "Marking Answered...";
    await updateDoc(doc(db,"prayer_requests",selectedAnsweredRequest.id),{answered:true,answeredAt:serverTimestamp(),answeredTestimony:testimony,updatedAt:serverTimestamp()});
    showAnsweredNotice("Praise God. This prayer has been marked answered.", "success");
    await loadPrayerRequests();
    setTimeout(closeAnsweredModal,1000);
  }catch(error){
    console.error("Answered update failed:", error);
    showAnsweredNotice("This could not be marked answered. Check Firestore rules for answered updates.", "error");
  }finally{
    button.disabled = false;
    button.textContent = "Mark Answered";
  }
}

function showAnsweredNotice(message,type){
  const notice = document.getElementById("answeredModalNotice");
  notice.textContent = message;
  notice.className = type ? `answered-modal-notice ${type}` : "answered-modal-notice";
}

function sendPrayerEmail(prayerRequest) {
  const payload = {
    email: prayerRequest.email,
    requestTitle: prayerRequest.title,
    requestMessage: prayerRequest.message,
    prayerCount: (prayerRequest.prayerCount || 0) + 1
  };

  return fetch(EMAIL_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    keepalive: true,
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
}

function sendTestPrayerEmail(email) {
  return sendPrayerEmail({
    email,
    title: "Test Prayer Request",
    message: "This is a test email from The Prayer Project.",
    prayerCount: 0
  });
}

function attachPrayButtons(){
  document.querySelectorAll(".pray-button").forEach((button)=>{
    button.addEventListener("click",async()=>{
      const requestId=button.dataset.id;
      const prayerRequest=allRequests.find((request)=>request.id===requestId);
      if(!prayerRequest)return;
      if(!prayerRequest.email){ button.textContent="No Email Found"; setTimeout(()=>button.textContent="Pray For This Request",2600); return; }

      try{
        button.disabled=true;
        button.textContent="Sending Prayer...";

        await sendPrayerEmail(prayerRequest);
        await updateDoc(doc(db,"prayer_requests",requestId),{prayerCount:increment(1),updatedAt:serverTimestamp()});

        button.textContent = "Prayer Sent";
        setTimeout(()=>{button.textContent="Pray For This Request";button.disabled=false;},2600);
        await loadPrayerRequests();
      }catch(error){
        console.error("Prayer/email send failed:", error);
        try { await updateDoc(doc(db,"prayer_requests",requestId),{prayerCount:increment(1),updatedAt:serverTimestamp()}); } catch(updateError){ console.error(updateError); }
        button.textContent="Prayer Counted";
        setTimeout(()=>{button.textContent="Pray For This Request";button.disabled=false;},2600);
        await loadPrayerRequests();
      }
    });
  });
}

function attachReportButtons(){ document.querySelectorAll(".report-button").forEach((button)=>{ button.addEventListener("click",async()=>{ const requestId=button.dataset.id; const reason=prompt("Why are you reporting this request?"); if(!reason||!reason.trim())return; try{ button.disabled=true; button.textContent="Reporting..."; await addDoc(collection(db,"reports"),{requestId,reason:reason.trim(),createdAt:serverTimestamp(),status:"open"}); await updateDoc(doc(db,"prayer_requests",requestId),{reportCount:increment(1),status:"reported",updatedAt:serverTimestamp()}); button.textContent="Reported"; await loadPrayerRequests(); }catch(error){ console.error(error); button.textContent="Report Failed"; setTimeout(()=>{button.textContent="Report";button.disabled=false;},2200); } }); }); }
searchInput?.addEventListener("input", filterRequests); categoryFilter?.addEventListener("change", filterRequests);
function filterRequests(){
  const searchValue=(searchInput?.value||"").toLowerCase().trim();
  const categoryValue=categoryFilter?.value||"all";
  const filteredRequests=allRequests.filter((request)=>{
    const matchesSearch=String(request.title||"").toLowerCase().includes(searchValue)||String(request.message||"").toLowerCase().includes(searchValue)||String(request.answeredTestimony||"").toLowerCase().includes(searchValue)||(request.answered&&"answered".includes(searchValue));
    const matchesCategory=categoryValue==="all"||request.category===categoryValue;
    const matchesWallFilter=wallFilter==="all"||(wallFilter==="open"&&!request.answered)||(wallFilter==="answered"&&request.answered);
    return matchesSearch&&matchesCategory&&matchesWallFilter;
  });
  renderPrayerRequests(filteredRequests);
}
function updateStatistics(){ totalRequestsElement.textContent=allRequests.length; totalPrayersElement.textContent=allRequests.reduce((sum,request)=>sum+(request.prayerCount||0),0); urgentRequestsElement.textContent=allRequests.filter((request)=>request.urgent).length; }
function showNotice(message,type="success",duration=7000){ formNotice.textContent=message; formNotice.className=`notice show ${type}`; setTimeout(()=>{ if(submissionsOpen || type !== "error") formNotice.className="notice"; },duration); }
function escapeHtml(text=""){ return String(text).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }
function normalizeEmail(email=""){ return String(email).trim().toLowerCase(); }
function getTime(timestamp){ return timestamp?.toDate ? timestamp.toDate().getTime() : 0; }

await loadSubmissionSettings();
loadPrayerRequests();