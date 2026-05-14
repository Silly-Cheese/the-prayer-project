import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0",authDomain:"prayer-projec.firebaseapp.com",projectId:"prayer-projec",storageBucket:"prayer-projec.firebasestorage.app",messagingSenderId:"47966669764",appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291"};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const $=id=>document.getElementById(id);
const adminRequests=$('adminRequests'),statusFilter=$('statusFilter'),sortFilter=$('sortFilter'),adminSearch=$('adminSearch'),quickFilters=$('quickFilters'),notice=$('dashboardNotice');
let requests=[],reports=[],notes=[],activeQuickFilter='all';

onAuthStateChanged(auth,async user=>{if(!user){window.location.href='login.html';return;}await loadDashboard();});
statusFilter?.addEventListener('change',renderRequests);
sortFilter?.addEventListener('change',renderRequests);
adminSearch?.addEventListener('input',renderRequests);
quickFilters?.addEventListener('click',e=>{const b=e.target.closest('.quick-filter');if(!b)return;activeQuickFilter=b.dataset.quick||'all';quickFilters.querySelectorAll('.quick-filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderRequests();});

async function loadDashboard(){
  try{setNotice('Loading requests...');if(adminRequests)adminRequests.innerHTML='<div class="empty">Loading prayer requests...</div>';await Promise.all([loadRequests(),loadReports(),loadNotes()]);renderRequests();setNotice(`Loaded ${requests.length} request${requests.length===1?'':'s'}.`);}catch(e){console.error(e);if(adminRequests)adminRequests.innerHTML='<div class="empty">Requests could not load. Check Firestore rules and indexes.</div>';setNotice('Requests could not load.');}
}
async function loadRequests(){const s=await getDocs(query(collection(db,'prayer_requests'),orderBy('createdAt','desc')));requests=[];s.forEach(d=>requests.push({id:d.id,...d.data()}));}
async function loadReports(){try{const s=await getDocs(query(collection(db,'reports'),orderBy('createdAt','desc')));reports=[];s.forEach(d=>reports.push({id:d.id,...d.data()}));}catch{reports=[];}}
async function loadNotes(){try{const s=await getDocs(query(collection(db,'admin_notes'),orderBy('createdAt','desc')));notes=[];s.forEach(d=>notes.push({id:d.id,...d.data()}));}catch{notes=[];}}

function renderRequests(){
  if(!adminRequests)return;
  const filter=statusFilter?.value||'all',term=(adminSearch?.value||'').toLowerCase().trim(),sort=sortFilter?.value||'newest';
  let visible=filter==='all'?[...requests]:requests.filter(r=>(r.status||'approved')===filter);
  visible=visible.filter(r=>activeQuickFilter==='urgent'?!!r.urgent:activeQuickFilter==='reported'?(r.status||'approved')==='reported'||getReportCount(r.id)>0:activeQuickFilter==='answered'?!!r.answered:activeQuickFilter==='unanswered'?!r.answered:activeQuickFilter==='no-email'?!r.email:true);
  if(term)visible=visible.filter(r=>`${r.title||''} ${r.message||''} ${r.category||''} ${r.email||''} ${r.answeredTestimony||''} ${getNotes(r.id).map(n=>n.note).join(' ')}`.toLowerCase().includes(term));
  visible.sort((a,b)=>sort==='oldest'?time(a.createdAt)-time(b.createdAt):sort==='mostPrayed'?(b.prayerCount||0)-(a.prayerCount||0):sort==='mostReported'?getReportCount(b.id)-getReportCount(a.id):sort==='urgentFirst'?Number(!!b.urgent)-Number(!!a.urgent)||time(b.createdAt)-time(a.createdAt):sort==='answeredFirst'?Number(!!b.answered)-Number(!!a.answered)||time(b.createdAt)-time(a.createdAt):time(b.createdAt)-time(a.createdAt));
  if(!visible.length){adminRequests.innerHTML='<div class="empty">No prayer requests found for this filter.</div>';return;}
  adminRequests.innerHTML=visible.map(card).join('');
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>setStatus(b.dataset.id,b.dataset.action));
  document.querySelectorAll('.mark-answered').forEach(b=>b.onclick=()=>setAnswered(b.dataset.id,true));
  document.querySelectorAll('.undo-answered').forEach(b=>b.onclick=()=>setAnswered(b.dataset.id,false));
  document.querySelectorAll('.add-note').forEach(b=>b.onclick=()=>addAdminNote(b.dataset.id));
  document.querySelectorAll('.edit-request').forEach(b=>b.onclick=()=>editRequest(b.dataset.id));
  document.querySelectorAll('.resolve-reports').forEach(b=>b.onclick=()=>resolveReports(b.dataset.id));
}
function card(r){const reps=reports.filter(x=>x.requestId===r.id),ns=getNotes(r.id),status=r.status||'approved',date=r.createdAt?.toDate?r.createdAt.toDate().toLocaleString():'Recently';return `<article class="item"><span class="pill ${status==='reported'?'warn':status==='approved'?'ok':''}">${esc(status)}</span><h3>${esc(r.title)} ${r.answered?'<span class="pill ok">Answered</span>':''}</h3><p>${esc(r.message)}</p><div class="meta"><span>Category: ${esc(r.category)}</span><span>Prayers: ${r.prayerCount||0}</span><span>Reports: ${reps.length}</span><span>Notes: ${ns.length}</span><span>${date}</span>${r.urgent?'<span>Urgent</span>':''}</div><div class="meta"><span>Email: ${esc(r.email||'No email saved')}</span></div>${r.answeredTestimony?`<div class="notice"><strong>Answered Update</strong><br>${esc(r.answeredTestimony)}</div>`:''}${reps.length?`<div class="notice"><strong>Reports</strong>${reps.map(x=>`<p>${esc(x.reason)} — ${esc(x.status||'open')}</p>`).join('')}</div>`:''}${ns.length?`<div class="notice"><strong>Admin Notes</strong>${ns.map(n=>`<p>${esc(n.note)}</p>`).join('')}</div>`:''}<div class="toolbar"><button class="btn approve" data-action="approved" data-id="${r.id}">Return</button><button class="btn warn" data-action="reported" data-id="${r.id}">Report</button><button class="btn delete" data-action="removed" data-id="${r.id}">Remove</button>${r.answered?`<button class="btn neutral undo-answered" data-id="${r.id}">Undo Answered</button>`:`<button class="btn approve mark-answered" data-id="${r.id}">Mark Answered</button>`}<button class="btn neutral add-note" data-id="${r.id}">Add Note</button><button class="btn neutral edit-request" data-id="${r.id}">Edit</button><button class="btn neutral resolve-reports" data-id="${r.id}">Resolve Reports</button></div></article>`;}
async function setStatus(id,status){await updateDoc(doc(db,'prayer_requests',id),{status,updatedAt:serverTimestamp()});await audit('status_'+status,id);await loadDashboard();}
async function setAnswered(id,answered){await updateDoc(doc(db,'prayer_requests',id),answered?{answered:true,answeredAt:serverTimestamp(),updatedAt:serverTimestamp()}:{answered:false,answeredTestimony:'',updatedAt:serverTimestamp()});await audit(answered?'marked_answered':'undid_answered',id);await loadDashboard();}
async function addAdminNote(id){const note=prompt('Private admin note:');if(!note?.trim())return;await addDoc(collection(db,'admin_notes'),{requestId:id,note:note.trim(),adminEmail:auth.currentUser?.email||'Admin',createdAt:serverTimestamp()});await audit('added_note',id);await loadDashboard();}
async function editRequest(id){const r=requests.find(x=>x.id===id);if(!r)return;const title=prompt('Edit title:',r.title||'');if(title===null)return;const message=prompt('Edit message:',r.message||'');if(message===null)return;await updateDoc(doc(db,'prayer_requests',id),{title:title.trim(),message:message.trim(),updatedAt:serverTimestamp()});await audit('edited_request',id);await loadDashboard();}
async function resolveReports(id){for(const rep of reports.filter(r=>r.requestId===id))await updateDoc(doc(db,'reports',rep.id),{status:'resolved',resolvedAt:serverTimestamp(),resolvedBy:auth.currentUser?.email||'Admin'});await audit('resolved_reports',id);await loadDashboard();}
async function audit(action,requestId){try{await addDoc(collection(db,'audit_logs'),{action,requestId,adminEmail:auth.currentUser?.email||'Admin',createdAt:serverTimestamp()});}catch(e){console.warn(e);}}
function getReportCount(id){return reports.filter(x=>x.requestId===id).length}function getNotes(id){return notes.filter(x=>x.requestId===id)}function time(t){return t?.toDate?t.toDate().getTime():0}function setNotice(t){if(notice)notice.textContent=t}function esc(t=''){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;')}