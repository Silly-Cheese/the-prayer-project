import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
const firebaseConfig={apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0",authDomain:"prayer-projec.firebaseapp.com",projectId:"prayer-projec",storageBucket:"prayer-projec.firebasestorage.app",messagingSenderId:"47966669764",appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291"};
export const app=initializeApp(firebaseConfig), db=getFirestore(app);
export function dayNumber(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return NaN;const d=new Date(s+"T00:00:00Z");return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s?+d/86400000:NaN;}
export function today(){return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Chicago",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).reduce((a,p)=>(a[p.type]=p.value,a),{});}
export function dateKey(){const p=today();return p.year+"-"+p.month+"-"+p.day;}
const iso=n=>new Date(n*86400000).toISOString().slice(0,10);
export function occurrence(c,date=dateKey()){
 const t=dayNumber(date),s=dayNumber(c.start),e=dayNumber(c.end);
 if(!c.enabled||!Number.isFinite(s)||!Number.isFinite(e)||e<s||t<s)return null;
 const duration=e-s;
 if(c.repeat==="none")return t<=e?c.start:null;
 if(c.repeat==="weekly"){const n=s+Math.floor((t-s)/7)*7;return t<=n+duration?iso(n):null;}
 const d=new Date(t*86400000),a=new Date(s*86400000);
 for(let i=0;i<2;i++){let y=d.getUTCFullYear(),m=c.repeat==="yearly"?a.getUTCMonth():d.getUTCMonth();if(c.repeat==="yearly")y-=i;else m-=i;
 const first=new Date(Date.UTC(y,m,1)),last=new Date(Date.UTC(y,m+1,0)).getUTCDate();
 if(a.getUTCDate()>last)continue;
 const n=dayNumber(new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth(),a.getUTCDate())).toISOString().slice(0,10));
 if(n>=s&&t>=n&&t<=n+duration)return iso(n);
 }return null;
}
export function selected(rows,date=dateKey()){const active=rows.map(c=>({...c,cycle:occurrence(c,date)})).filter(c=>c.cycle).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));const result=[];for(const c of active){result.push(c);if(!c.overlap)break;}return result;}
export const color=c=>/^#[0-9a-f]{6}$/i.test(c)?c:"#8a5734";
export function ink(hex){const rgb=color(hex).slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]>.179?"#000000":"#ffffff";}
export function el(tag,txt,cls){const e=document.createElement(tag);if(txt!=null)e.textContent=txt;if(cls)e.className=cls;return e;}
export function safeLink(raw){if(!raw)return "";try{const u=new URL(raw,location.href);return ["http:","https:"].includes(u.protocol)?u.href:"";}catch{return "";}}
