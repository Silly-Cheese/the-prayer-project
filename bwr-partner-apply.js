import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0",authDomain:"prayer-projec.firebaseapp.com",projectId:"prayer-projec",storageBucket:"prayer-projec.firebasestorage.app",messagingSenderId:"47966669764",appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291"};
const app=initializeApp(firebaseConfig),db=getFirestore(app);
const form=document.getElementById('bwrPartnerApplication'),status=document.getElementById('bwrApplicationStatus'),submit=document.getElementById('bwrApplicationSubmit');

form?.addEventListener('submit',async event=>{
  event.preventDefault();
  status.className='bwr-form-status';
  status.textContent='';
  const honeypot=form.elements.website_confirm?.value?.trim();
  if(honeypot){showSuccess('Application received.');form.reset();return;}
  const partnershipTypes=[...form.querySelectorAll('input[name="partnershipType"]:checked')].map(input=>input.value);
  if(!partnershipTypes.length){showError('Choose at least one way your organization may want to partner.');return;}
  if(!form.reportValidity())return;
  const value=name=>String(form.elements[name]?.value||'').trim();
  const data={
    organizationName:value('organizationName'),
    organizationType:value('organizationType'),
    website:value('website'),
    city:value('city'),
    state:value('state'),
    serviceArea:value('serviceArea'),
    contactName:value('contactName'),
    contactRole:value('contactRole'),
    contactEmail:value('contactEmail').toLowerCase(),
    contactPhone:value('contactPhone'),
    partnershipTypes,
    organizationSummary:value('organizationSummary'),
    peopleServed:value('peopleServed'),
    estimatedBibleNeed:value('estimatedBibleNeed'),
    distributionExperience:value('distributionExperience'),
    whyPartner:value('whyPartner'),
    additionalNotes:value('additionalNotes'),
    dignityAcknowledged:Boolean(form.elements.dignityAcknowledged?.checked),
    stewardshipAcknowledged:Boolean(form.elements.stewardshipAcknowledged?.checked),
    reportingAcknowledged:Boolean(form.elements.reportingAcknowledged?.checked),
    accuracyAcknowledged:Boolean(form.elements.accuracyAcknowledged?.checked),
    status:'submitted',
    source:'bwr-partners-page',
    schemaVersion:1,
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  };
  if(!data.dignityAcknowledged||!data.stewardshipAcknowledged||!data.reportingAcknowledged||!data.accuracyAcknowledged){showError('Please acknowledge all partnership standards before submitting.');return;}
  submit.disabled=true;submit.textContent='Submitting…';status.textContent='Sending your application securely…';
  try{
    const ref=await addDoc(collection(db,'bwr_partner_applications'),data);
    const shortRef=`BWR-${ref.id.slice(0,8).toUpperCase()}`;
    form.reset();
    showSuccess(`Application received. Your reference is ${shortRef}. The Prayer Project will review your submission and contact the person listed on the application if follow-up is needed.`);
    status.scrollIntoView({behavior:'smooth',block:'center'});
  }catch(error){
    console.error(error);
    const permissionIssue=String(error?.code||'').includes('permission-denied');
    showError(permissionIssue?'Online partnership applications are temporarily finishing activation. Please email pray@ask4prayers.com with the subject “Bibles Within Reach Partnership Interest” if you need to apply right now.':'Your application could not be submitted. Please check your connection and try again.');
  }finally{submit.disabled=false;submit.textContent='Submit Partnership Application';}
});

function showError(message){status.className='bwr-form-status error';status.textContent=message;}
function showSuccess(message){status.className='bwr-form-status success';status.textContent=message;}
