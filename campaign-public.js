import {db,selected,color,ink,el,safeLink,builtins,isBuiltin,seasonTitle,appearance} from "./campaign-common.js?v=design-3";
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

 .managed-campaign{box-sizing:border-box;background:var(--campaign-bg);color:var(--campaign-ink);overflow-wrap:anywhere;border:1px solid color-mix(in srgb,var(--campaign-accent) 35%,transparent)}
 .managed-campaign-banner{margin:16px auto;width:min(1160px,calc(100% - 40px));border-radius:18px;padding:17px 24px;box-shadow:0 16px 50px #0005}
 .managed-campaign-inner{width:min(1160px,100%);margin:auto;display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap}
 .managed-campaign-copy{flex:1;min-width:min(260px,100%)}
 .managed-campaign-kicker{display:block;font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:inherit;opacity:.85;margin-bottom:7px}
 .managed-campaign-banner strong{display:block;font:700 clamp(21px,2.5vw,29px)/1.15 "Playfair Display",Georgia,serif;color:inherit}
 .managed-campaign h2{font-family:"Playfair Display",Georgia,serif;font-size:clamp(34px,5vw,62px);line-height:1.05;letter-spacing:-.035em;margin:10px 0 20px;color:inherit}
 .managed-campaign p{white-space:pre-wrap;line-height:1.7;color:inherit;margin:8px 0}
 .managed-campaign-banner p{font-size:14px;margin:5px 0 0;opacity:.9}
 .managed-campaign button,.managed-campaign a{box-sizing:border-box;display:inline-flex;border:1px solid currentColor;background:transparent;color:inherit;border-radius:999px;padding:10px 16px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;text-decoration:none;min-height:42px;align-items:center;justify-content:center;transition:transform .18s ease}
 .managed-campaign button:hover,.managed-campaign a:hover{transform:translateY(-2px)}
 .managed-campaign .managed-primary{background:var(--campaign-accent);color:var(--campaign-accent-ink);border-color:transparent}
 .managed-campaign :focus-visible{outline:3px solid currentColor;outline-offset:4px}
 .managed-campaign-feature{width:min(1160px,calc(100% - 40px));margin:32px auto;border-radius:28px;padding:clamp(26px,5vw,64px);box-shadow:0 25px 80px #0006}
 .managed-campaign-feature p,.managed-campaign-dialog p{max-width:72ch}
 .managed-campaign-dialog{width:min(790px,calc(100% - 28px));max-height:calc(100% - 28px);overflow:auto;border-radius:28px;padding:clamp(26px,5vw,52px);box-shadow:0 40px 130px #000b}
 .managed-campaign-dialog::backdrop{background:#000c;backdrop-filter:blur(10px)}.managed-campaign-close{float:right;min-width:44px}.managed-campaign-actions{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin-top:20px}.managed-campaign-banner .managed-campaign-actions{margin:0}
 @media(max-width:650px){.managed-campaign-banner{padding:17px}.managed-campaign-inner{gap:12px}.managed-campaign-banner .managed-campaign-actions{width:100%}}
 @media(prefers-reduced-motion:reduce){.managed-campaign button,.managed-campaign a{transition:none}}
 `;document.head.append(style);
 const apply=(node,c)=>{const a=appearance(c);node.style.setProperty("--campaign-bg",a.scrim+a.background);node.style.setProperty("--campaign-ink",a.foreground);node.style.setProperty("--campaign-accent",a.accent);node.style.setProperty("--campaign-accent-ink",ink(a.accent));};
 const action=(node,c)=>{if(c.id==="season-spm"){for(const [label,href] of [["Call 988","tel:988"],["Text 988","sms:988"]]){const a=el("a",label);a.href=href;node.append(a);}}const href=safeLink(c.link);if(href&&c.linkLabel){const a=el("a",c.linkLabel);a.href=href;node.append(a);}};
 let bannerAnchor=document.querySelector(".nav"),featureAnchor=document.querySelector(".home-hero"),queue=[];
 for(const c of rows){
  const dialog=el("dialog",null,"managed-campaign managed-campaign-dialog");apply(dialog,c);
  const h=el("h2",c.title);h.id="campaign-title-"+c.id;dialog.setAttribute("aria-labelledby",h.id);
  const close=el("button","×","managed-campaign-close");close.type="button";close.setAttribute("aria-label","Close announcement");close.onclick=()=>dialog.close();
  const actions=el("div",null,"managed-campaign-actions");const done=el("button","Continue to website");done.type="button";done.onclick=()=>dialog.close();actions.append(done);action(actions,c);
  dialog.append(close,el("small","THE PRAYER PROJECT • "+(isBuiltin(c.id)?"SEASONAL CAMPAIGN":"ANNOUNCEMENT"),"managed-campaign-kicker"),h,el("p",c.message),actions);done.classList.add("managed-primary");document.body.append(dialog);
  const open=()=>{if(!document.querySelector("dialog[open]")&&!document.getElementById("tppSuicidePreventionModal"))dialog.showModal();};
  const key="tpp-campaign-"+c.id+"-"+c.cycle;let seen=false;
  try{seen=c.frequency==="once"?localStorage.getItem(key)==="1":c.frequency==="session"?sessionStorage.getItem(key)==="1":false;}catch{}
  dialog.addEventListener("close",()=>{try{if(c.frequency==="once")localStorage.setItem(key,"1");if(c.frequency==="session")sessionStorage.setItem(key,"1");}catch{}if(queue.length)queue.shift()();});
  if(c.banner){const b=el("section",null,"managed-campaign managed-campaign-banner");apply(b,c);const inner=el("div",null,"managed-campaign-inner");const copy=el("div",null,"managed-campaign-copy");copy.append(el("small",isBuiltin(c.id)?"✦  SEASONAL CAMPAIGN":"✦  THE PRAYER PROJECT","managed-campaign-kicker"),el("strong",c.title),el("p",c.summary||c.message.slice(0,180)));const button=el("button","Read announcement");button.type="button";button.onclick=open;const buttons=el("div",null,"managed-campaign-actions");button.classList.add("managed-primary");buttons.append(button);action(buttons,c);inner.append(copy,buttons);b.append(inner);if(bannerAnchor)bannerAnchor.after(b);else document.body.prepend(b);bannerAnchor=b;}
  if(home&&c.feature){const f=el("section",null,"managed-campaign managed-campaign-feature");apply(f,c);const inner=el("div",null,"managed-campaign-inner"),copy=el("div");copy.append(el("small","✦  THE PRAYER PROJECT • "+(isBuiltin(c.id)?"SEASONAL CAMPAIGN":"ANNOUNCEMENT"),"managed-campaign-kicker"),el("h2",c.title),el("p",c.message));action(copy,c);inner.append(copy);f.append(inner);if(featureAnchor)featureAnchor.after(f);else document.querySelector("main")?.prepend(f);featureAnchor=f;}
  if(c.popup&&!seen)queue.push(open);
 }
 if(queue.length&&!document.getElementById("tppSuicidePreventionModal"))queue.shift()();
 return rows.some(c=>!c.overlap);
}
