import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0",authDomain:"prayer-projec.firebaseapp.com",projectId:"prayer-projec",storageBucket:"prayer-projec.firebasestorage.app",messagingSenderId:"47966669764",appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291"};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const list=document.getElementById('partnerApplicationList'),notice=document.getElementById('partnerNotice'),search=document.getElementById('partnerSearch'),statusFilter=document.getElementById('partnerStatus'),typeFilter=document.getElementById('partnerType');
let applications=[];

onAuthStateChanged(auth,async user=>{if(!user){window.location.href='login.html';return;}await load();});
search?.addEventListener('input',render);statusFilter?.addEventListener('change',render);typeFilter?.addEventListener('change',render);

async function load(){
  try{
    const snap=await getDocs(query(collection(db,'bwr_partner_applications'),orderBy('createdAt','desc')));
    applications=[];snap.forEach(d=>applications.push({id:d.id,...d.data()}));
    updateCounts();render();notice.textContent=`${applications.length} partnership application${applications.length===1?'':'s'} loaded.`;
  }catch(error){console.error(error);notice.textContent='Partner applications could not load. Check Firestore rules and deployment.';list.innerHTML='<div class="empty">No application data is available.</div>';}
}

function updateCounts(){
  const count=status=>applications.filter(a=>(a.status||'submitted')===status).length;
  set('submittedCount',count('submitted'));set('reviewCount',count('review'));set('approvedCount',count('approved'));set('declinedCount',count('declined'));
}

function render(){
  const term=(search?.value||'').toLowerCase().trim(),status=statusFilter?.value||'all',type=typeFilter?.value||'all';
  const visible=applications.filter(a=>{
    const haystack=[a.organizationName,a.organizationType,a.contactName,a.contactEmail,a.contactRole,a.city,a.state,a.serviceArea,a.organizationSummary,a.peopleServed,a.whyPartner,(a.partnershipTypes||[]).join(' ')].join(' ').toLowerCase();
    return (status==='all'||(a.status||'submitted')===status)&&(type==='all'||(a.partnershipTypes||[]).includes(type))&&haystack.includes(term);
  });
  list.innerHTML=visible.length?visible.map(card).join(''):'<div class="empty">No partnership applications match these filters.</div>';
  list.querySelectorAll('[data-status]').forEach(button=>button.addEventListener('click',()=>changeStatus(button.dataset.id,button.dataset.status)));
  list.querySelectorAll('[data-save-note]').forEach(button=>button.addEventListener('click',()=>saveNote(button.dataset.saveNote)));
}

function card(a){
  const current=a.status||'submitted',roles=(a.partnershipTypes||[]).map(labelRole).join(', ')||'Not specified';
  return `<article class="item">
    <span class="pill status-${esc(current)}">${esc(statusLabel(current))}</span>
    <h3>${esc(a.organizationName||'Unnamed organization')}</h3>
    <p>${esc(a.organizationType||'Organization')} • ${esc(a.city||'')} ${esc(a.state||'')}</p>
    <div class="meta"><span>Contact: ${esc(a.contactName||'—')} (${esc(a.contactRole||'—')})</span><span>${esc(a.contactEmail||'No email')}</span><span>${date(a.createdAt)}</span></div>
    <div class="meta"><span>Interested in: ${esc(roles)}</span><span>Estimated Bible need: ${esc(a.estimatedBibleNeed||'Not sure')}</span></div>
    <details class="application-details"><summary>View full application</summary><div class="application-grid">
      ${block('Organization',`${a.organizationName||''}\n${a.organizationType||''}\n${a.website||'No website'}`)}
      ${block('Primary contact',`${a.contactName||''}\n${a.contactRole||''}\n${a.contactEmail||''}\n${a.contactPhone||'No phone'}`)}
      ${block('Location & service area',`${a.city||''}, ${a.state||''}\n${a.serviceArea||''}`)}
      ${block('Partnership roles',roles)}
      ${block('About the organization',a.organizationSummary,'full')}
      ${block('Who they serve',a.peopleServed,'full')}
      ${block('Why BWR',a.whyPartner,'full')}
      ${block('Distribution experience',a.distributionExperience||'None provided','full')}
      ${block('Additional notes',a.additionalNotes||'None provided','full')}
      ${block('Standards acknowledged',`Dignity: ${yes(a.dignityAcknowledged)}\nStewardship: ${yes(a.stewardshipAcknowledged)}\nReporting: ${yes(a.reportingAcknowledged)}\nAccuracy: ${yes(a.accuracyAcknowledged)}`,'full')}
    </div></details>
    <div class="admin-note"><label for="note-${a.id}">Internal admin note</label><textarea id="note-${a.id}" placeholder="Add review notes, follow-up details, or decision context…">${esc(a.adminNote||'')}</textarea><div class="toolbar"><button class="btn neutral" data-save-note="${a.id}">Save Note</button></div></div>
    <div class="toolbar">
      ${current!=='review'?`<button class="btn warn" data-id="${a.id}" data-status="review">Under Review</button>`:''}
      ${current!=='approved'?`<button class="btn approve" data-id="${a.id}" data-status="approved">Approve</button>`:''}
      ${current!=='declined'?`<button class="btn delete" data-id="${a.id}" data-status="declined">Decline</button>`:''}
      ${current!=='submitted'?`<button class="btn neutral" data-id="${a.id}" data-status="submitted">Return to Submitted</button>`:''}
      ${a.contactEmail?`<a class="btn neutral" href="mailto:${encodeURIComponent(a.contactEmail)}?subject=${encodeURIComponent('Bibles Within Reach Partnership Application')}">Email Applicant</a>`:''}
      ${safeUrl(a.website)?`<a class="btn neutral" href="${esc(safeUrl(a.website))}" target="_blank" rel="noopener">Organization Website</a>`:''}
    </div>
  </article>`;
}

async function changeStatus(id,newStatus){
  const app=applications.find(a=>a.id===id);if(!app)return;
  if(newStatus==='declined'&&!confirm(`Decline the partnership application from ${app.organizationName||'this organization'}?`))return;
  try{await updateDoc(doc(db,'bwr_partner_applications',id),{status:newStatus,reviewedAt:serverTimestamp(),reviewedBy:auth.currentUser?.email||'Admin',updatedAt:serverTimestamp()});await audit(`bwr_partner_application_${newStatus}`,id,app.organizationName);await load();}catch(error){console.error(error);notice.textContent='Could not update application status.';}
}

async function saveNote(id){
  const note=document.getElementById(`note-${id}`)?.value?.trim()||'';
  try{await updateDoc(doc(db,'bwr_partner_applications',id),{adminNote:note,adminNoteUpdatedAt:serverTimestamp(),adminNoteUpdatedBy:auth.currentUser?.email||'Admin',updatedAt:serverTimestamp()});await audit('bwr_partner_application_note',id,applications.find(a=>a.id===id)?.organizationName);notice.textContent='Internal note saved.';await load();}catch(error){console.error(error);notice.textContent='Could not save the admin note.';}
}

async function audit(action,target,organizationName=''){try{await addDoc(collection(db,'audit_logs'),{action,requestId:target,organizationName:organizationName||'',adminEmail:auth.currentUser?.email||'Admin',createdAt:serverTimestamp()});}catch(error){console.warn('Audit log failed',error)}}
function block(title,text,extra=''){return `<div class="application-block ${extra}"><strong>${esc(title)}</strong><p>${nl(text||'—')}</p></div>`}
function nl(value){return esc(value).replace(/\n/g,'<br>')}
function yes(value){return value?'Yes':'No'}
function statusLabel(value){return ({submitted:'Submitted',review:'Under Review',approved:'Approved',declined:'Declined'})[value]||value}
function labelRole(value){return ({distribution:'Distribution',referral:'Community / Referral',outreach:'Outreach / Event',business:'Business Support',supplier:'Supplier / Vendor',logistics:'Logistics',other:'Other'})[value]||value}
function safeUrl(value=''){if(!value)return'';try{const u=new URL(/^https?:\/\//i.test(value)?value:`https://${value}`);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return''}}
function date(t){return t?.toDate?t.toDate().toLocaleString():'Recently'}
function set(id,value){const node=document.getElementById(id);if(node)node.textContent=value}
function esc(value=''){return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
