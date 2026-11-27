import {db,selected,color,ink,el,safeLink,builtins,isBuiltin,seasonTitle} from "./campaign-common.js?v=season-2";
import {collection,getDocs,query,where,doc,getDoc} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
export async function mountCampaigns(){
 const page=location.pathname.split("/").pop()||"index.html",home=page==="index.html";
 if(!home&&!document.body.classList.contains("public-page"))return false;
 if(page==="crisis.html"||page==="login.html"||page.startsWith("admin"))return false;
 const snap=await getDocs(query(collection(db,"site_campaigns"),where("enabled","==",true)));
 const seasonal=await Promise.all(builtins.map(async c=>{const d=await getDoc(doc(db,"site_campaigns",c.id));return d.exists()?{...d.data(),id:d.id}:c;}));
 const all=[...snap.docs.filter(d=>!isBuiltin(d.id)).map(d=>({...d.data(),id:d.id})),...seasonal];
 const rows=selected(all.filter(c=>home||(c.scope==="public"&&(c.banner||c.popup)))).map(c=>({...c,title:seasonTitle(c)}));
 if(!rows.length)return false;
 const style=el("style");style.textContent=`
 .managed-campaign{box-sizing:border-box;background:var(--campaign-bg);color:var(--campaign-ink);padding:18px 22px;overflow-wrap:anywhere}
 .managed-campaign-inner{width:min(1160px,100%);margin:auto;display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap}
 .managed-campaign h2{font-family:"Playfair Display",Georgia,serif;font-size:clamp(26px,4vw,48px);line-height:1.12;margin:8px 0 16px;color:inherit}
 .managed-campaign p{white-space:pre-wrap;line-height:1.65;color:inherit;margin:10px 0}
 .managed-campaign button,.managed-campaign a{display:inline-flex;border:1px solid currentColor;background:transparent;color:inherit;border-radius:999px;padding:10px 16px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none;min-height:44px;align-items:center}
 .managed-campaign :focus-visible{outline:3px solid currentColor;outline-offset:4px}
 .managed-campaign-feature{padding:clamp(28px,6vw,72px) 22px}
 .managed-campaign-dialog{width:min(740px,calc(100% - 28px));max-height:calc(100% - 28px);overflow:auto;border:1px solid currentColor;border-radius:24px;padding:clamp(22px,5vw,48px)}
 .managed-campaign-dialog::backdrop{background:#000b}.managed-campaign-close{float:right}.managed-campaign-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
 `;document.head.append(style);
 const apply=(node,c)=>{node.style.setProperty("--campaign-bg",color(c.color));node.style.setProperty("--campaign-ink",ink(c.color));};
 const action=(node,c)=>{if(c.id==="season-spm"){for(const [label,href] of [["Call 988","tel:988"],["Text 988","sms:988"]]){const a=el("a",label);a.href=href;node.append(a);}}const href=safeLink(c.link);if(href&&c.linkLabel){const a=el("a",c.linkLabel);a.href=href;node.append(a);}};
 let bannerAnchor=document.querySelector(".nav"),featureAnchor=document.querySelector(".home-hero"),queue=[];
 for(const c of rows){
  const dialog=el("dialog",null,"managed-campaign managed-campaign-dialog");apply(dialog,c);
  const h=el("h2",c.title);h.id="campaign-title-"+c.id;dialog.setAttribute("aria-labelledby",h.id);
  const close=el("button","×","managed-campaign-close");close.type="button";close.setAttribute("aria-label","Close announcement");close.onclick=()=>dialog.close();
  const actions=el("div",null,"managed-campaign-actions");const done=el("button","Continue to website");done.type="button";done.onclick=()=>dialog.close();actions.append(done);action(actions,c);
  dialog.append(close,h,el("p",c.message),actions);document.body.append(dialog);
  const open=()=>{if(!document.querySelector("dialog[open]")&&!document.getElementById("tppSuicidePreventionModal"))dialog.showModal();};
  const key="tpp-campaign-"+c.id+"-"+c.cycle;let seen=false;
  try{seen=c.frequency==="once"?localStorage.getItem(key)==="1":c.frequency==="session"?sessionStorage.getItem(key)==="1":false;}catch{}
  dialog.addEventListener("close",()=>{try{if(c.frequency==="once")localStorage.setItem(key,"1");if(c.frequency==="session")sessionStorage.setItem(key,"1");}catch{}if(queue.length)queue.shift()();});
  if(c.banner){const b=el("section",null,"managed-campaign");apply(b,c);const inner=el("div",null,"managed-campaign-inner");const copy=el("div");copy.append(el("strong",c.title),el("p",c.summary||c.message.slice(0,180)));const button=el("button","Read announcement");button.type="button";button.onclick=open;inner.append(copy,button);action(inner,c);b.append(inner);if(bannerAnchor)bannerAnchor.after(b);else document.body.prepend(b);bannerAnchor=b;}
  if(home&&c.feature){const f=el("section",null,"managed-campaign managed-campaign-feature");apply(f,c);const inner=el("div",null,"managed-campaign-inner"),copy=el("div");copy.append(el("h2",c.title),el("p",c.message));action(copy,c);inner.append(copy);f.append(inner);if(featureAnchor)featureAnchor.after(f);else document.querySelector("main")?.prepend(f);featureAnchor=f;}
  if(c.popup&&!seen)queue.push(open);
 }
 if(queue.length&&!document.getElementById("tppSuicidePreventionModal"))queue.shift()();
 return rows.some(c=>!c.overlap);
}
