import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = { apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0", authDomain:"prayer-projec.firebaseapp.com", projectId:"prayer-projec", storageBucket:"prayer-projec.firebasestorage.app", messagingSenderId:"47966669764", appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const EMAIL_ENDPOINT = "https://script.google.com/macros/s/AKfycbybp0fuEfyalVu-PHDWeJW6Z2Zbqyqi7huKbCiRjIDRWg5IFBOSU7ciB9b7_4QJ3dLuBg/exec";

const prayerForm = document.getElementById("prayerForm"), prayerGrid = document.getElementById("prayerGrid"), formNotice = document.getElementById("formNotice"), submitBtn = document.getElementById("submitBtn"), searchInput = document.getElementById("searchInput"), categoryFilter = document.getElementById("categoryFilter"), totalRequestsElement = document.getElementById("totalRequests"), totalPrayersElement = document.getElementById("totalPrayers"), urgentRequestsElement = document.getElementById("urgentRequests");
let allRequests = [];

prayerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    submitBtn.disabled = true; submitBtn.textContent = "Submitting Prayer Request...";
    const email = document.getElementById("email").value.trim();
    const publicRequest = { title: document.getElementById("title").value.trim(), category: document.getElementById("category").value, message: document.getElementById("message").value.trim(), email, urgent: document.getElementById("urgent").value === "true", prayerCount: 0, reportCount: 0, status: "approved", createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    await addDoc(collection(db, "prayer_requests"), publicRequest);
    showNotice("Your prayer request has been posted. People can now pray for you.", "success");
    prayerForm.reset(); await loadPrayerRequests();
  } catch (error) { console.error(error); showNotice("Something went wrong while submitting your prayer request. Please check the Firestore rules.", "error"); }
  finally { submitBtn.disabled = false; submitBtn.textContent = "Submit Prayer Request"; }
});

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
  if (!requests.length) { prayerGrid.innerHTML = `<div class="empty">No prayer requests are currently posted. When someone submits a request, it will appear here.</div>`; return; }
  prayerGrid.innerHTML = requests.map((request) => {
    const createdDate = request.createdAt?.toDate ? request.createdAt.toDate().toLocaleDateString() : "Recently";
    return `<article class="prayer-card"><div class="tag-row"><div class="tag">🙏 ${escapeHtml(request.category)}</div>${request.urgent ? '<div class="tag urgent">Urgent</div>' : ''}</div><h3>${escapeHtml(request.title)}</h3><p>${escapeHtml(request.message)}</p><div class="card-footer"><div class="meta"><span>${createdDate}</span><span>${request.prayerCount || 0} prayed</span></div><button class="btn btn-primary btn-block pray-button" data-id="${request.id}">Pray For This Request</button><button class="btn btn-secondary btn-block report-button" data-id="${request.id}">Report Request</button></div></article>`;
  }).join("");
  attachPrayButtons(); attachReportButtons();
}

function attachPrayButtons(){
  document.querySelectorAll(".pray-button").forEach((button)=>{
    button.addEventListener("click",async()=>{
      const requestId=button.dataset.id;
      const prayerRequest=allRequests.find((request)=>request.id===requestId);
      if(!prayerRequest)return;
      try{
        button.disabled=true; button.textContent="Sending Prayer...";
        await updateDoc(doc(db,"prayer_requests",requestId),{prayerCount:increment(1),updatedAt:serverTimestamp()});
        const emailResponse = await fetch(EMAIL_ENDPOINT,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({email:prayerRequest.email,requestTitle:prayerRequest.title,requestMessage:prayerRequest.message,prayerCount:(prayerRequest.prayerCount||0)+1})});
        const emailResult = await emailResponse.json().catch(()=>({success:false}));
        button.textContent = emailResult.success ? "Prayer Sent" : "Prayer Counted";
        setTimeout(()=>{button.textContent="Pray For This Request";button.disabled=false;},2600);
        await loadPrayerRequests();
      }catch(error){
        console.error(error);
        button.textContent="Prayer Counted";
        setTimeout(()=>{button.textContent="Pray For This Request";button.disabled=false;},2600);
        await loadPrayerRequests();
      }
    });
  });
}

function attachReportButtons(){ document.querySelectorAll(".report-button").forEach((button)=>{ button.addEventListener("click",async()=>{ const requestId=button.dataset.id; const reason=prompt("Why are you reporting this request?"); if(!reason||!reason.trim())return; try{ button.disabled=true; button.textContent="Reporting..."; await addDoc(collection(db,"reports"),{requestId,reason:reason.trim(),createdAt:serverTimestamp(),status:"open"}); await updateDoc(doc(db,"prayer_requests",requestId),{reportCount:increment(1),status:"reported",updatedAt:serverTimestamp()}); button.textContent="Reported and Hidden"; await loadPrayerRequests(); }catch(error){ console.error(error); button.textContent="Report Failed"; setTimeout(()=>{button.textContent="Report Request";button.disabled=false;},2200); } }); }); }
searchInput?.addEventListener("input", filterRequests); categoryFilter?.addEventListener("change", filterRequests);
function filterRequests(){ const searchValue=searchInput.value.toLowerCase().trim(); const categoryValue=categoryFilter.value; const filteredRequests=allRequests.filter((request)=>{ const matchesSearch=request.title.toLowerCase().includes(searchValue)||request.message.toLowerCase().includes(searchValue); const matchesCategory=categoryValue==="all"||request.category===categoryValue; return matchesSearch&&matchesCategory;}); renderPrayerRequests(filteredRequests); }
function updateStatistics(){ totalRequestsElement.textContent=allRequests.length; totalPrayersElement.textContent=allRequests.reduce((sum,request)=>sum+(request.prayerCount||0),0); urgentRequestsElement.textContent=allRequests.filter((request)=>request.urgent).length; }
function showNotice(message,type="success"){ formNotice.textContent=message; formNotice.className=`notice show ${type}`; setTimeout(()=>{formNotice.className="notice";},7000); }
function escapeHtml(text=""){ return String(text).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }
function getTime(timestamp){ return timestamp?.toDate ? timestamp.toDate().getTime() : 0; }
loadPrayerRequests();