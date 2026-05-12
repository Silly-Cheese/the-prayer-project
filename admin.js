import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = { apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0", authDomain:"prayer-projec.firebaseapp.com", projectId:"prayer-projec", storageBucket:"prayer-projec.firebasestorage.app", messagingSenderId:"47966669764", appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const adminRequests = document.getElementById("adminRequests");
const requestCount = document.getElementById("requestCount");
const prayerCount = document.getElementById("prayerCount");
const urgentCount = document.getElementById("urgentCount");
const emailCount = document.getElementById("emailCount");
const statusFilter = document.getElementById("statusFilter");
const adminSearch = document.getElementById("adminSearch");
const adminEmail = document.getElementById("adminEmail");
const logoutBtn = document.getElementById("logoutBtn");
const dailyVerse = document.getElementById("dailyVerse");
const dailyVerseReference = document.getElementById("dailyVerseReference");
const homepageAnnouncement = document.getElementById("homepageAnnouncement");
const submissionsOpen = document.getElementById("submissionsOpen");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const settingsNotice = document.getElementById("settingsNotice");

let requests = [];
let reports = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  adminEmail.textContent = user.email || "Admin";
  await Promise.all([loadDashboard(), loadSettings()]);
});

logoutBtn?.addEventListener("click", async () => { await signOut(auth); window.location.href = "login.html"; });
statusFilter?.addEventListener("change", renderRequests);
adminSearch?.addEventListener("input", renderRequests);
saveSettingsBtn?.addEventListener("click", saveSettings);

async function loadDashboard(){
  try {
    adminRequests.innerHTML = '<div class="empty">Loading prayer requests...</div>';
    await Promise.all([loadRequests(), loadReports()]);
    renderRequests();
    updateStatistics();
  } catch (error) {
    console.error(error);
    adminRequests.innerHTML = '<div class="empty">Failed to load admin dashboard. Check Firestore rules and login permissions.</div>';
  }
}

async function loadRequests(){
  const snap = await getDocs(query(collection(db,"prayer_requests"), orderBy("createdAt","desc")));
  requests=[];
  snap.forEach(d=>requests.push({id:d.id,...d.data()}));
}

async function loadReports(){
  const snap = await getDocs(query(collection(db,"reports"), orderBy("createdAt","desc")));
  reports=[];
  snap.forEach(d=>reports.push({id:d.id,...d.data()}));
}

function renderRequests(){
  const filter = statusFilter?.value || "all";
  const term = (adminSearch?.value || "").toLowerCase().trim();

  let visible = filter === "all" ? requests : requests.filter(r => (r.status || "approved") === filter);

  if (term) {
    visible = visible.filter(r =>
      String(r.title || "").toLowerCase().includes(term) ||
      String(r.message || "").toLowerCase().includes(term) ||
      String(r.category || "").toLowerCase().includes(term) ||
      String(r.email || "").toLowerCase().includes(term) ||
      String(r.answeredTestimony || "").toLowerCase().includes(term) ||
      (r.answered && "answered".includes(term))
    );
  }

  if(!visible.length){
    adminRequests.innerHTML='<div class="empty">No prayer requests found for this filter.</div>';
    return;
  }

  adminRequests.innerHTML = visible.map(r=>{
    const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : "Recently";
    const answeredDate = r.answeredAt?.toDate ? r.answeredAt.toDate().toLocaleString() : "Not answered";
    const matchingReports = reports.filter(x=>x.requestId===r.id);
    const status = r.status || "approved";
    return `<article class="request ${r.answered ? 'answered-admin' : ''}">
      <h3>${esc(r.title)} ${r.answered ? '<span class="answered-pill">Answered!</span>' : ''}</h3>
      <p>${esc(r.message)}</p>
      <div class="meta">
        <span>Status: ${esc(status)}</span>
        <span>Category: ${esc(r.category)}</span>
        <span>Prayers: ${r.prayerCount||0}</span>
        <span>Reports: ${matchingReports.length}</span>
        <span>Submitted: ${date}</span>
        ${r.urgent?'<span>Urgent</span>':''}
      </div>
      <div class="meta"><span>Email: ${esc(r.email || "No email saved")}</span><span>Answered: ${r.answered ? answeredDate : 'No'}</span><span>Answer Code: ${r.answerCodeHash ? 'Enabled' : 'Legacy email-only'}</span></div>
      ${r.answeredTestimony?`<div class="reportbox answered-box"><strong>Answered Testimony</strong><p>${esc(r.answeredTestimony)}</p></div>`:""}
      ${matchingReports.length?`<div class="reportbox"><strong>Reports</strong>${matchingReports.map(x=>`<p>${esc(x.reason)}</p>`).join("")}</div>`:""}
      <div class="toolbar">
        <button class="btn approve" data-action="approved" data-id="${r.id}">Return to Wall</button>
        <button class="btn warn" data-action="reported" data-id="${r.id}">Keep Reported</button>
        <button class="btn delete" data-action="removed" data-id="${r.id}">Remove</button>
        ${r.answered ? `<button class="btn neutral undo-answered" data-id="${r.id}">Undo Answered</button>` : `<button class="btn approve mark-answered" data-id="${r.id}">Mark Answered</button>`}
        <button class="btn delete hard-delete" data-id="${r.id}">Delete</button>
      </div>
    </article>`;
  }).join("");

  document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>setStatus(b.dataset.id,b.dataset.action)));
  document.querySelectorAll(".hard-delete").forEach(b=>b.addEventListener("click",()=>hardDelete(b.dataset.id)));
  document.querySelectorAll(".undo-answered").forEach(b=>b.addEventListener("click",()=>setAnswered(b.dataset.id,false)));
  document.querySelectorAll(".mark-answered").forEach(b=>b.addEventListener("click",()=>setAnswered(b.dataset.id,true)));
}

async function setStatus(id,status){
  await updateDoc(doc(db,"prayer_requests",id),{status,updatedAt:serverTimestamp()});
  await loadDashboard();
}

async function setAnswered(id,answered){
  const update = answered ? {answered:true,answeredAt:serverTimestamp(),updatedAt:serverTimestamp()} : {answered:false,answeredTestimony:"",updatedAt:serverTimestamp()};
  await updateDoc(doc(db,"prayer_requests",id),update);
  await loadDashboard();
}

async function hardDelete(id){
  if(!confirm("Permanently delete this request? This cannot be undone.")) return;
  await deleteDoc(doc(db,"prayer_requests",id));
  await loadDashboard();
}

function updateStatistics(){
  requestCount.textContent=requests.length;
  prayerCount.textContent=requests.reduce((s,r)=>s+(r.prayerCount||0),0);
  urgentCount.textContent=requests.filter(r=>r.urgent).length;
  emailCount.textContent=requests.filter(r=>r.answered).length;
}

async function loadSettings(){
  try {
    const settingsDoc = await getDoc(doc(db,"settings","site"));
    if(!settingsDoc.exists()) return;
    const data = settingsDoc.data();
    if(dailyVerse) dailyVerse.value = data.dailyVerse || "";
    if(dailyVerseReference) dailyVerseReference.value = data.dailyVerseReference || "";
    if(homepageAnnouncement) homepageAnnouncement.value = data.homepageAnnouncement || "";
    if(submissionsOpen) submissionsOpen.value = String(data.submissionsOpen ?? true);
  } catch (error) {
    console.error(error);
    if(settingsNotice) settingsNotice.textContent = "Failed to load settings.";
  }
}

async function saveSettings(){
  try {
    saveSettingsBtn.disabled = true;
    saveSettingsBtn.textContent = "Saving...";

    await setDoc(doc(db,"settings","site"),{
      dailyVerse: dailyVerse?.value.trim() || "",
      dailyVerseReference: dailyVerseReference?.value.trim() || "",
      homepageAnnouncement: homepageAnnouncement?.value.trim() || "",
      submissionsOpen: submissionsOpen?.value === "true",
      updatedAt: serverTimestamp()
    },{merge:true});

    settingsNotice.textContent = "Settings saved successfully.";
  } catch (error) {
    console.error(error);
    settingsNotice.textContent = "Failed to save settings. Check Firestore rules.";
  } finally {
    saveSettingsBtn.disabled = false;
    saveSettingsBtn.textContent = "Save Settings";
  }
}

function esc(t=""){ return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }