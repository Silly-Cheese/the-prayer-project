import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, query, where, serverTimestamp, updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = { apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0", authDomain:"prayer-projec.firebaseapp.com", projectId:"prayer-projec", storageBucket:"prayer-projec.firebasestorage.app", messagingSenderId:"47966669764", appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const EMAIL_ENDPOINT = "https://script.google.com/macros/s/AKfycbzmdSzOGpNltJ7ssdZhTw689TL_q2NpKZXt0w9V-NFoCIJicwFnxqUi8qhqPo4qGRmYdg/exec";
const PRAYER_EMAIL = "pray@ask4prayers.com";

const prayerForm = document.getElementById("prayerForm"), prayerGrid = document.getElementById("prayerGrid"), formNotice = document.getElementById("formNotice"), submitBtn = document.getElementById("submitBtn"), searchInput = document.getElementById("searchInput"), categoryFilter = document.getElementById("categoryFilter"), totalRequestsElement = document.getElementById("totalRequests"), totalPrayersElement = document.getElementById("totalPrayers"), urgentRequestsElement = document.getElementById("urgentRequests");
let allRequests = [];
let submissionsOpen = true;

window.PRAYER_PROJECT_DEBUG = { EMAIL_ENDPOINT, PRAYER_EMAIL };

prayerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!submissionsOpen) {
    showNotice(`Online prayer request submissions are currently closed. Please email your request to ${PRAYER_EMAIL}.`, "error", 20000);
    return;
  }

  try {
    submitBtn.disabled = true; submitBtn.textContent = "Submitting Prayer Request...";
    const email = document.getElementById("email").value.trim();
    const publicRequest = { title: document.getElementById("title").value.trim(), category: document.getElementById("category").value, message: document.getElementById("message").value.trim(), email, urgent: document.getElementById("urgent").value === "true", prayerCount: 0, reportCount: 0, answered: false, status: "approved", createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    await addDoc(collection(db, "prayer_requests"), publicRequest);
    showNotice("Your prayer request has been posted. People can now pray for you.", "success");
    prayerForm.reset(); await loadPrayerRequests();
  } catch (error) { console.error(error); showNotice("Something went wrong while submitting your prayer request. Please check the Firestore rules.", "error"); }
  finally { submitBtn.disabled = !submissionsOpen; submitBtn.textContent = submissionsOpen ? "Submit Prayer Request" : "Submissions Closed"; }
});

async function loadSubmissionSettings() {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      submissionsOpen = data.submissionsOpen !== false;
    }
  } catch (error) {
    console.error("Could not load submission settings:", error);
    submissionsOpen = true;
  }

  applySubmissionState();
}

function applySubmissionState() {
  if (!prayerForm || !submitBtn) return;

  const fields = prayerForm.querySelectorAll("input, select, textarea");
  fields.forEach((field) => { field.disabled = !submissionsOpen; });

  submitBtn.disabled = !submissionsOpen;
  submitBtn.textContent = submissionsOpen ? "Submit Prayer Request" : "Submissions Closed";

  if (!submissionsOpen) {
    showNotice(`Online prayer request submissions are currently closed. Please email your request to ${PRAYER_EMAIL}.`, "error", 20000);
  }
}

async function loadPrayerRequests() {
  try {
    const snapshot = await getDocs(query(collection(db, "prayer_requests"), where("status", "==", "approved")));
    allRequests = [];
    snapshot.forEach((documentSnapshot) => allRequests.push({ id: documentSnapshot.id, ...documentSnapshot.data() }));
    allRequests.sort((a,b) => getTime(b.createdAt) - getTime(a.createdAt));
    renderPrayerRequests(allRequests); updateStatistics();
  } catch (error) {
    console.error(error);
    prayerGrid.innerHTML = `<div class="empty">The prayer wall could not load yet. Please make sure your Firestore rules are published.</div>`;
  }
}

function renderPrayerRequests(requests) {
  if (!requests.length) { prayerGrid.innerHTML = `<div class="empty">No prayer requests are currently posted. When online submissions reopen, new requests will appear here. You may also email ${PRAYER_EMAIL}.</div>`; return; }
  prayerGrid.innerHTML = requests.map((request) => {
    const createdDate = request.createdAt?.toDate ? request.createdAt.toDate().toLocaleDateString() : "Recently";
    const answeredClass = request.answered ? " answered" : "";
    const answeredTag = request.answered ? '<div class="tag answered-tag">Answered!</div>' : '';
    return `<article class="prayer-card${answeredClass}" data-card-id="${request.id}" tabindex="0" role="button" aria-label="Open answered prayer option for ${escapeHtml(request.title)}"><div class="tag-row"><div class="tag">🙏 ${escapeHtml(request.category)}</div>${request.urgent ? '<div class="tag urgent">Urgent</div>' : ''}${answeredTag}</div><h3>${escapeHtml(request.title)}</h3><p>${escapeHtml(request.message)}</p><div class="card-footer"><div class="meta"><span>${createdDate}</span><span>${request.prayerCount || 0} prayed</span></div><div class="answered-help">${request.answered ? 'This prayer has been marked answered.' : 'Requester: click the card to mark this answered.'}</div><button class="btn btn-primary btn-block pray-button" data-id="${request.id}">Pray For This Request</button><button class="btn btn-secondary btn-block report-button" data-id="${request.id}">Report Request</button></div></article>`;
  }).join("");
  attachCardAnswerHandlers(); attachPrayButtons(); attachReportButtons();
}

function attachCardAnswerHandlers(){
  document.querySelectorAll(".prayer-card[data-card-id]").forEach((card)=>{
    const openAnswerPrompt = async()=>{
      const requestId = card.dataset.cardId;
      const prayerRequest = allRequests.find((request)=>request.id===requestId);
      if(!prayerRequest || prayerRequest.answered) return;

      const enteredEmail = prompt("If this is your prayer request and God has answered it, enter the email used when submitting the request.");
      if(!enteredEmail) return;

      if(normalizeEmail(enteredEmail) !== normalizeEmail(prayerRequest.email)){
        alert("That email does not match this prayer request.");
        return;
      }

      try{
        await updateDoc(doc(db,"prayer_requests",requestId),{answered:true,answeredAt:serverTimestamp(),updatedAt:serverTimestamp()});
        alert("This prayer request has been marked answered.");
        await loadPrayerRequests();
      }catch(error){
        console.error(error);
        alert("This could not be marked answered. Please try again or contact the site administrator.");
      }
    };

    card.addEventListener("click",(event)=>{
      if(event.target.closest("button")) return;
      openAnswerPrompt();
    });

    card.addEventListener("keydown",(event)=>{
      if(event.key !== "Enter" && event.key !== " ") return;
      if(event.target.closest("button")) return;
      event.preventDefault();
      openAnswerPrompt();
    });
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
        button.disabled=true; button.textContent="Sending Prayer...";
        const emailResponse = await fetch(EMAIL_ENDPOINT,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({email:prayerRequest.email,requestTitle:prayerRequest.title,requestMessage:prayerRequest.message,prayerCount:(prayerRequest.prayerCount||0)+1})});
        const emailText = await emailResponse.text();
        let emailResult = { success:false, raw: emailText };
        try { emailResult = JSON.parse(emailText); } catch(parseError) { console.warn("Apps Script returned non-JSON:", emailText); }
        console.log("Prayer Project email response:", emailResult);
        await updateDoc(doc(db,"prayer_requests",requestId),{prayerCount:increment(1),updatedAt:serverTimestamp()});
        button.textContent = emailResult.success ? "Prayer Sent" : "Prayer Counted";
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

function attachReportButtons(){ document.querySelectorAll(".report-button").forEach((button)=>{ button.addEventListener("click",async()=>{ const requestId=button.dataset.id; const reason=prompt("Why are you reporting this request?"); if(!reason||!reason.trim())return; try{ button.disabled=true; button.textContent="Reporting..."; await addDoc(collection(db,"reports"),{requestId,reason:reason.trim(),createdAt:serverTimestamp(),status:"open"}); await updateDoc(doc(db,"prayer_requests",requestId),{reportCount:increment(1),status:"reported",updatedAt:serverTimestamp()}); button.textContent="Reported and Hidden"; await loadPrayerRequests(); }catch(error){ console.error(error); button.textContent="Report Failed"; setTimeout(()=>{button.textContent="Report Request";button.disabled=false;},2200); } }); }); }
searchInput?.addEventListener("input", filterRequests); categoryFilter?.addEventListener("change", filterRequests);
function filterRequests(){ const searchValue=searchInput.value.toLowerCase().trim(); const categoryValue=categoryFilter.value; const filteredRequests=allRequests.filter((request)=>{ const matchesSearch=request.title.toLowerCase().includes(searchValue)||request.message.toLowerCase().includes(searchValue)||(request.answered&&"answered".includes(searchValue)); const matchesCategory=categoryValue==="all"||request.category===categoryValue; return matchesSearch&&matchesCategory;}); renderPrayerRequests(filteredRequests); }
function updateStatistics(){ totalRequestsElement.textContent=allRequests.length; totalPrayersElement.textContent=allRequests.reduce((sum,request)=>sum+(request.prayerCount||0),0); urgentRequestsElement.textContent=allRequests.filter((request)=>request.urgent).length; }
function showNotice(message,type="success",duration=7000){ formNotice.textContent=message; formNotice.className=`notice show ${type}`; setTimeout(()=>{ if(submissionsOpen || type !== "error") formNotice.className="notice"; },duration); }
function escapeHtml(text=""){ return String(text).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }
function normalizeEmail(email=""){ return String(email).trim().toLowerCase(); }
function getTime(timestamp){ return timestamp?.toDate ? timestamp.toDate().getTime() : 0; }

await loadSubmissionSettings();
loadPrayerRequests();