/* Sacoche de combat (0.20, idée des objets de soutien de Dokkan Battle) : 4 objets fabriqués avec les matériaux
   (Équipe > Sac), 3 utilisations par combat au total, sans prendre le tour (comme les compétences). L'auto-combat ne les utilise pas. */
const POUCH={heal:{n:"Herbe de soin",i:"🌿",d:"Soigne toute l'équipe de 35 % de ses PV.",c:{hide:4,bone:2}},
 rage:{n:"Tonique de rage",i:"🧪",d:"+30 % d'attaque pendant 2 tours.",c:{bone:4,amber:1}},
 smoke:{n:"Pierre fumigène",i:"💨",d:"L'ennemi perd son prochain tour.",c:{crystal:3,amber:1}},
 prism:{n:"Éclat d'orbe",i:"🔮",d:"5 orbes prennent l'élément du chef.",c:{crystal:3,amber:3}}};
let POUCH_MAX=9,POUCH_PER_FIGHT=3;
const _ensPouch=ens;ens=function(){_ensPouch();if(!S.pouch)S.pouch={heal:1,rage:0,smoke:0,prism:0};/* une herbe offerte pour découvrir */Object.keys(POUCH).forEach(k=>{if(!(S.pouch[k]>=0))S.pouch[k]=0})};
function pouchCan(k){const it=POUCH[k];return!!it&&Object.entries(it.c).every(([m,v])=>(S.mat[m]||0)>=v)}
function pouchCraft(k){ens();const it=POUCH[k];if(!it)return;if((S.pouch[k]||0)>=POUCH_MAX){toast("Sacoche pleine pour cet objet ("+POUCH_MAX+").");return}
 const miss=Object.entries(it.c).filter(([m,v])=>(S.mat[m]||0)<v);if(miss.length){toast("Il manque : "+miss.map(([m,v])=>MATS[m][0]+" "+(v-(S.mat[m]||0))).join(" "));return}
 Object.entries(it.c).forEach(([m,v])=>S.mat[m]-=v);S.pouch[k]++;S.pouchMade=(S.pouchMade||0)+1;save();sfx("buy");toast(it.i+" "+it.n+" fabriqué(e).",1600);render()}
function pouchUse(k){const f=fight;ens();if(!f||f.over||!f.mx||screen!=="battle")return;const it=POUCH[k];f.bagUsed=f.bagUsed||0;
 if(!it||!(S.pouch[k]>0))return;if(f.bagUsed>=POUCH_PER_FIGHT){toast(POUCH_PER_FIGHT+" objets maximum par combat.");return}
 const t=S.team.slice(0,3);let msg="";
 if(k==="heal"){t.forEach((d,i)=>{if(f.hp[i]>0)f.hp[i]=Math.min(f.mx[i],f.hp[i]+Math.round(f.mx[i]*.35))});msg="🌿 Herbe de soin : équipe soignée de 35 %"}
 else if(k==="rage"){f.buff.atk=Math.max(f.buff.atk||0,2);msg="🧪 Tonique de rage : +30 % d'attaque pendant 2 tours"}
 else if(k==="smoke"){f.stun=Math.max(f.stun||0,1);msg="💨 Pierre fumigène : l'ennemi perd son prochain tour"}
 else if(k==="prism"){const el=sp(t[0]).element,idx=f.orbs.map((c,i)=>c===el?-1:i).filter(i=>i>=0);for(let n=0;n<5&&idx.length;n++){const j=idx.splice(Math.floor(Math.random()*idx.length),1)[0];f.orbs[j]=el}msg="🔮 Éclat d'orbe : orbes "+(ICO[el]||"")}
 S.pouch[k]--;f.bagUsed++;S.pouchUsed=(S.pouchUsed||0)+1;f.log=msg;save();pouchClose();sfx("skill");renderBattle();
 if(PREFS.anim&&typeof sparkBurst==="function"){const b=document.querySelector("#battleArea .battlestage .sTeam");if(b){const r=b.getBoundingClientRect();sparkBurst(r.left+r.width/2,r.top+r.height/2,k==="heal"?"#7dff9b":k==="rage"?"#ff8a3c":k==="smoke"?"#c8d4eb":"#c58bff",40,1.2)}}}
/* ---- fenêtre de la sacoche en combat (posée sur la page, hors de #battleArea : la mise en page du combat n'en est pas modifiée) ---- */
function pouchClose(){const p=$$("pouchPop");if(p)p.remove()}
function pouchOpen(btn){ens();const f=fight;if(!f||f.over)return;if($$("pouchPop")){pouchClose();return}const used=f.bagUsed||0,r=btn.getBoundingClientRect();
 const p=document.createElement("div");p.id="pouchPop";p.className="pouchpop";
 p.innerHTML=`<div class="row" style="gap:6px"><b class="grow">🎒 Sacoche</b><span class="chip">${used}/${POUCH_PER_FIGHT} ce combat</span></div>${Object.entries(POUCH).map(([k,it])=>{const n=S.pouch[k]||0,ok=n>0&&used<POUCH_PER_FIGHT;
  return `<div class="pprow"><span class="ppi">${it.i}</span><div class="grow"><b>${it.n}</b> <span class="muted tiny">×${n}</span><div class="muted tiny">${it.d}</div></div><button class="${ok?"":"secondary"}" ${ok?"":"disabled"} onclick="pouchUse('${k}')">UTILISER</button></div>`}).join("")}<div class="muted tiny" style="margin-top:4px">Les objets ne prennent pas ton tour. Fabrique-les dans Équipe &gt; Sac.</div>`;
 document.body.appendChild(p);const w=p.offsetWidth;p.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+"px";p.style.top=(r.bottom+6)+"px"}
document.addEventListener("pointerdown",e=>{const p=$$("pouchPop");if(p&&!p.contains(e.target)&&!(e.target.closest&&e.target.closest(".bagbtn")))pouchClose()},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape")pouchClose()});
const _goPouch=go;go=function(s){pouchClose();return _goPouch(s)};
const _rbPouch=renderBattle;renderBattle=function(){_rbPouch();const f=fight,box=$$("battleArea");if(!f||!f.mx||!box)return;if(f.over){pouchClose();return}ens();
 const a=box.querySelector(":scope>.sectionhead .actl");if(a&&!a.querySelector(".bagbtn")){const n=Object.values(S.pouch).reduce((x,y)=>x+y,0);
  a.insertAdjacentHTML("afterbegin",`<button class="bagbtn" onclick="pouchOpen(this)" title="Sacoche : objets de combat (3 par combat, ne prennent pas le tour)">🎒 ${n}</button>`)}};
/* ---- Équipe > Sac : fabrication ---- */
if(typeof SUBSEL!=="undefined"&&SUBSEL.team)SUBSEL.team.ids.pouchBox="bag";
function pouchBoxHTML(){return `<b>🎒 Sacoche de combat</b><div class="muted tiny" style="margin:3px 0 6px">Fabrique des objets avec tes matériaux (os, cuir, cristal, ambre). En combat, le bouton 🎒 en utilise jusqu'à ${POUCH_PER_FIGHT} par combat, sans prendre ton tour. ${POUCH_MAX} de chaque au maximum.</div>
 ${Object.entries(POUCH).map(([k,it])=>`<div class="pprow"><span class="ppi">${it.i}</span><div class="grow"><b>${it.n}</b> <span class="chip">×${S.pouch[k]||0}</span><div class="muted tiny">${it.d}</div><div class="fchips">${Object.entries(it.c).map(([m,v])=>`<span class="chip ${(S.mat[m]||0)>=v?"good":"hot"}">${MATS[m][0]} ${v}</span>`).join("")}</div></div><button class="${pouchCan(k)&&(S.pouch[k]||0)<POUCH_MAX?"":"secondary"}" onclick="pouchCraft('${k}')">FABRIQUER</button></div>`).join("")}`}
const _rPouch=render;render=function(){_rPouch();ens();const tm=$$("team");if(!tm)return;let b=$$("pouchBox");if(!b){const ref=$$("bagBox");if(!ref)return;ref.insertAdjacentHTML("beforebegin",'<div class="panel" id="pouchBox"></div>');b=$$("pouchBox")}
 b.innerHTML=pouchBoxHTML();if(typeof markSubs==="function"&&screen==="team")markSubs("team")};
if(typeof GUIDE!=="undefined")GUIDE.push(["Sacoche de combat","Équipe > Sac : fabrique des objets avec tes matériaux. En combat, le bouton 🎒 en utilise jusqu'à 3 par combat, sans prendre ton tour : Herbe de soin (+35 % PV à toute l'équipe), Tonique de rage (+30 % ATQ 2 tours), Pierre fumigène (l'ennemi perd un tour), Éclat d'orbe (5 orbes de l'élément du chef)."]);
if(typeof ACH!=="undefined")ACH.push(["pc1","Alchimiste","Fabriquer 10 objets de sacoche",()=>S.pouchMade||0,10,{essence:25,tickets:1}],["pc2","Trousse de survie","Utiliser 25 objets en combat",()=>S.pouchUsed||0,25,{tickets:3,shards:15},"Herboriste"]);
