import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
const firebaseConfig={apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0",authDomain:"prayer-projec.firebaseapp.com",projectId:"prayer-projec",storageBucket:"prayer-projec.firebasestorage.app",messagingSenderId:"47966669764",appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291"};
export const app=initializeApp(firebaseConfig), db=getFirestore(app);
export function dayNumber(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return NaN;const d=new Date(s+"T00:00:00Z");return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s?+d/86400000:NaN;}
export function today(){return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Chicago",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).reduce((a,p)=>(a[p.type]=p.value,a),{});}
export function dateKey(){const p=today();return p.year+"-"+p.month+"-"+p.day;}
const iso=n=>new Date(n*86400000).toISOString().slice(0,10);
function scheduledOccurrence(c,date=dateKey()){
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
export function occurrence(c,date=dateKey()){const cycle=scheduledOccurrence(c,date);return cycle&&cycle!==c.endedCycle?cycle:null;}
export function selected(rows,date=dateKey()){const active=rows.map(c=>({...c,cycle:occurrence(c,date)})).filter(c=>c.cycle).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));const result=[];for(const c of active){result.push(c);if(!c.overlap)break;}return result;}
export const color=c=>/^#[0-9a-f]{6}$/i.test(c)?c:"#8a5734";
export function ink(hex){const rgb=color(hex).slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]>.179?"#000000":"#ffffff";}
export function el(tag,txt,cls){const e=document.createElement(tag);if(txt!=null)e.textContent=txt;if(cls)e.className=cls;return e;}
export function safeLink(raw){if(!raw)return "";try{const u=new URL(raw,location.href);return ["http:","https:"].includes(u.protocol)?u.href:"";}catch{return "";}}

const defaults={repeat:"yearly",scope:"public",frequency:"once",banner:true,feature:true,popup:true,enabled:true,overlap:true,endedCycle:""};
export const builtins=[
{...defaults,id:"season-thanksgiving",title:"November — A Month of Gratitude",summary:"Give thanks. Show kindness. Appreciate the little things.",message:"In a world where we are constantly reminded of what we do not have, may we never forget to appreciate what we already do.\n\nThis November, remember the people who have stood beside you, the opportunities you have received, the memories you have made, and the quiet blessings that often go unnoticed.\n\nThankfulness does not mean pretending life is easy. If this season is difficult, you are welcome here exactly as you are. Even a small moment of comfort or kindness can be worth remembering.\n\nMay gratitude extend beyond Thanksgiving Day and become something we carry with us every day.\n\nIn every thing give thanks. — 1 Thessalonians 5:18 (KJV)",color:"#75451f",start:"2026-11-01",end:"2026-11-30",linkLabel:"Request prayer",link:"index.html#submit",priority:50},
{...defaults,id:"season-spm",title:"Suicide Prevention Awareness Month",summary:"Your life has value. Your story is not finished. If you may not be safe, call or text 988.",message:"September is a time to remember lives lost to suicide, stand beside people who have struggled, recognize warning signs, and make it easier for someone to say, ‘I need help.’\n\nIf you may hurt yourself or are afraid you may not stay safe, call or text 988 now and tell someone you trust. If there is immediate life-threatening danger, call 911 or go to the nearest emergency department.\n\nCheck on people, ask directly and listen without judgment. Take statements about suicide seriously. Help someone connect with professional support and follow up.\n\nPrayer and crisis care are not competing choices. Asking for immediate help is not a failure of faith. You do not have to carry this alone.",color:"#71343e",start:"2026-09-01",end:"2026-09-30",linkLabel:"Crisis resources",link:"crisis.html",priority:1000}
];
export const isBuiltin=id=>builtins.some(c=>c.id===id);
export function seasonTitle(c,date=dateKey()){if(c.id!=="season-thanksgiving"||c.title!==builtins[0].title)return c.title;const d=new Date(date+"T00:00:00Z"),first=new Date(Date.UTC(d.getUTCFullYear(),10,1)),th=1+(4-first.getUTCDay()+7)%7+21;if(d.getUTCMonth()===10&&d.getUTCDate()===th)return "Happy Thanksgiving!";if(d.getUTCMonth()===10&&Math.abs(d.getUTCDate()-th)<=3)return "Happy Thanksgiving Week!";return c.title;}

export function appearance(c){
 const preset=c.id==="season-thanksgiving"?["#75451f","#29190e","#f4d29b"]:c.id==="season-spm"?["#71343e","#132d2c","#ffd3d6"]:[c.color||"#8a5734","#171310","#f2d9b3"];
 const mode=c.backgroundMode|| (isBuiltin(c.id)?"gradient":"solid");
 const a=color(c.color||preset[0]),z=color(c.colorEnd||preset[1]),accent=color(c.accent||preset[2]);
 const angle=[0,45,90,135,180,225,270,315].includes(Number(c.angle))?Number(c.angle):135;
 return {background:mode==="gradient"?"linear-gradient("+angle+"deg,"+a+","+z+")":a,accent,foreground:mode==="gradient"?"#fff":ink(a),scrim:mode==="gradient"?"linear-gradient(#0009,#0009), ":"",mode};
}
