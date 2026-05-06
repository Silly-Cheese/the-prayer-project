import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

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
const adminEmail = document.getElementById("adminEmail");
const logoutBtn = document.getElementById("logoutBtn");

let requests = [];
let reports = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  adminEmail.textContent = user.email || "Admin";
  await loadDashboard();
});

logoutBtn?.addEventListener("click", async () => { await signOut(auth); window.location.href = "login.html"; });
statusFilter?.addEventListener("change", renderRequests);

async function loadDashboard(){ await Promise.all([loadRequests(), loadReports()]); renderRequests(); updateStatistics(); }

async function loadRequests(){ const snap = await getDocs(query(collection(db,"prayer_requests"), orderBy("createdAt","desc"))); requests=[]; snap.forEach(d=>requests.push({id:d.id,...d.data()})); }
async function loadReports(){ const snap = await getDocs(query(collection(db,"reports"), orderBy("createdAt","desc"))); reports=[]; snap.forEach(d=>reports.push({id:d.id,...d.data()})); }

function renderRequests(){
 const filter = statusFilter?.value || "all";
 const visible = filter === "all" ? requests : requests.filter(r => (r.status || "pending") === filter);
 if(!visible.length){ adminRequests.innerHTML='<div class="empty">No prayer requests found for this filter.</div>'; return; }
 adminRequests.innerHTML = visible.map(r=>{
  const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : "Recently";
  const matchingReports = reports.filter(x=>x.requestId===r.id);
  return `<article class="request"><h3>${esc(r.title)}</h3><p>${esc(r.message)}</p><div class="meta"><span>Status: ${esc(r.status||"pending")}</span><span>Category: ${esc(r.category)}</span><span>Prayers: ${r.prayerCount||0}</span><span>Reports: ${matchingReports.length}</span><span>${date}</span>${r.urgent?'<span>Urgent</span>':''}</div>${matchingReports.length?`<div class="reportbox"><strong>Reports</strong>${matchingReports.map(x=>`<p>${esc(x.reason)}</p>`).join("")}</div>`:""}<div class="toolbar"><button class="btn approve" data-action="approved" data-id="${r.id}">Approve</button><button class="btn warn" data-action="pending" data-id="${r.id}">Pending</button><button class="btn warn" data-action="reported" data-id="${r.id}">Mark Reported</button><button class="btn delete" data-action="removed" data-id="${r.id}">Remove</button><button class="btn delete hard-delete" data-id="${r.id}">Delete</button></div></article>`;
 }).join("");
 document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>setStatus(b.dataset.id,b.dataset.action)));
 document.querySelectorAll(".hard-delete").forEach(b=>b.addEventListener("click",()=>hardDelete(b.dataset.id)));
}

async function setStatus(id,status){ await updateDoc(doc(db,"prayer_requests",id),{status,updatedAt:serverTimestamp()}); await loadDashboard(); }
async function hardDelete(id){ if(!confirm("Permanently delete this request?")) return; await deleteDoc(doc(db,"prayer_requests",id)); await loadDashboard(); }
function updateStatistics(){ requestCount.textContent=requests.length; prayerCount.textContent=requests.reduce((s,r)=>s+(r.prayerCount||0),0); urgentCount.textContent=requests.filter(r=>r.urgent).length; emailCount.textContent=requests.reduce((s,r)=>s+(r.prayerCount||0),0); }
function esc(t=""){ return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }