/* Mon dresseur (0.27) : pseudo, apparence du dresseur (avatar SVG : peau, coiffure, couleurs, tenue, accessoire, décor),
   nom de l'île, compagnon (un dino de la collection, affiché sur l'accueil), emote de victoire, carte de profil et photo de
   groupe exportées en image PNG. Certaines pièces se débloquent en progressant (PL_LOCK). État : S.player.
   Le pseudo remplace « survivant » dans les dialogues et « Toi » dans le classement de l'Arène. */
const PL_SKIN=["#ffe0c2","#f3c79f","#d9a273","#b57a4d","#8a5634","#5c3a24"];
const PL_HCOL=["#2b1d14","#5a3a22","#a0642c","#e3b55b","#f2e6c8","#c23b2e","#3d6fd8","#8a4fd8"];
const PL_OCOL=["#3f6b3a","#7a5a32","#2f5d8a","#8a2f3f","#4a4f5c","#c58a1c","#5b3a8a","#1f7a74"];
const PL_HAIR=[["court","Courts"],["long","Longs"],["queue","Queue"],["pique","Hérissés"],["tresse","Tresses"],["rase","Rasé"]];
const PL_OUT=[["gilet","Gilet d'explorateur"],["veste","Veste de pluie"],["os","Armure d'os"],["cape","Cape d'ombre"],["fourrure","Manteau de fourrure"],["plongee","Combinaison de plongée"]];
const PL_ACC=[["aucun","Aucun"],["chapeau","Chapeau d'explorateur"],["bandeau","Bandeau"],["lunettes","Lunettes"],["plume","Plume"],["casque","Casque de l'arène"],["couronne","Couronne de la Graine"]];
const PL_BG=[["jungle","Jungle"],["volcan","Volcan"],["glace","Glacier"],["abysses","Abysses"],["nuit","Nuit étoilée"],["aurore","Aurore boréale"]];
const PL_EMO=[["👍","Bien joué !"],["🦖","RAAAWR !"],["😎","Trop facile."],["🎉","Victoire !"],["💪","On est les plus forts !"],["🔥","Ça chauffe !"],["🌟","Légendaire !"],["🦴","Un os de plus pour la collection."]];
/* pièces à débloquer : clé → [condition, texte] */
const PL_LOCK={os:[()=>(S.stage||0)>=30,"niveau 30 de l'histoire"],cape:[()=>!!(S.nm&&S.nm.stage>=10),"Cauchemar 10"],fourrure:[()=>!!(S.far&&S.far.stage>=10),"Grand Nord 10"],
 plongee:[()=>!!(S.far&&S.far.stage>=21),"Grand Nord 21"],casque:[()=>((S.cnt||{}).arena||0)>=10,"10 victoires d'Arène"],couronne:[()=>(S.stage||0)>=100,"niveau 100 de l'histoire"],
 plume:[()=>!!(S.nest&&S.nest.hatched>=1),"un œuf éclos au Nid"],aurore:[()=>!!(S.far&&S.far.stage>=40),"Grand Nord 40"],
 "🌟":[()=>Object.keys((S.ach&&S.ach.got)||{}).length>=20,"20 succès"],"🦴":[()=>((S.cnt||{}).bosses||0)>=10,"10 boss vaincus"]};
const plFree=k=>!PL_LOCK[k]||PL_LOCK[k][0]();
const PL_DEF={name:"",island:"",skin:1,hair:"court",hcol:1,out:"gilet",ocol:0,acc:"chapeau",bg:"jungle",emo:"👍",pet:0};
const _ensPl=ens;ens=function(){_ensPl();let P=S.player;if(!P||typeof P!=="object")P=S.player={};for(const k in PL_DEF)if(P[k]===undefined)P[k]=PL_DEF[k]};
const plClean=(s,max)=>String(s||"").replace(/[<>&"'`\\{}\[\]]/g,"").replace(/\s+/g," ").trim().slice(0,max);
const plName=()=>{try{ens();return S.player.name||"Survivant"}catch(e){return "Survivant"}};
const plIsland=()=>{try{ens();return S.player.island||"l'île"}catch(e){return "l'île"}};
/* ---- avatar (SVG 100×100) ---- */
function plAvatar(P,id){P=P||S.player;id=id||"pa"+Math.random().toString(36).slice(2,7);const sk=PL_SKIN[P.skin]||PL_SKIN[1],hc=PL_HCOL[P.hcol]||PL_HCOL[1],oc=PL_OCOL[P.ocol]||PL_OCOL[0];
 const BG={jungle:["#1d5a3a","#0b2a1c"],volcan:["#a8401e","#2a0d08"],glace:["#8fd6ff","#2a5f8a"],abysses:["#0e4e7a","#020c1c"],nuit:["#2a2f6e","#070818"],aurore:["#1b6b5c","#1a1240"]}[P.bg]||["#1d5a3a","#0b2a1c"];
 let bgx="";if(P.bg==="nuit")bgx=[[18,20],[80,14],[70,34],[28,40],[88,48]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.2" fill="#fff" opacity=".8"/>`).join("");
 if(P.bg==="aurore")bgx=`<path d="M0 28 Q30 10 55 26 T100 18 L100 34 Q70 40 50 32 T0 40Z" fill="#7dffcf" opacity=".35"/><path d="M0 40 Q35 26 60 40 T100 34 L100 44 Q70 50 50 44 T0 50Z" fill="#c58bff" opacity=".3"/>`;
 if(P.bg==="jungle")bgx=`<path d="M0 70 Q10 50 22 66 Q30 46 42 64 L42 100 L0 100Z" fill="#0f3d26" opacity=".8"/><path d="M100 66 Q88 48 76 64 Q70 50 60 66 L60 100 L100 100Z" fill="#0f3d26" opacity=".8"/>`;
 if(P.bg==="volcan")bgx=`<path d="M20 100 L44 52 L56 52 L80 100Z" fill="#3a140c"/><path d="M44 52 Q50 40 56 52Z" fill="#ffb04d"/>`;
 if(P.bg==="glace")bgx=`<path d="M0 100 L18 62 L30 80 L46 56 L62 84 L80 60 L100 100Z" fill="#e3f4ff" opacity=".7"/>`;
 if(P.bg==="abysses")bgx=[[16,70,3],[84,40,2.4],[74,78,2],[24,30,1.6]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#bff8ff" stroke-width=".8" opacity=".7"/>`).join("");
 const out={gilet:`<path d="M18 100 Q20 76 50 72 Q80 76 82 100Z" fill="${oc}"/><path d="M42 74 L50 92 L58 74" fill="none" stroke="#f1e2c0" stroke-width="3"/><rect x="26" y="86" width="9" height="7" rx="1.5" fill="#00000033"/><rect x="65" y="86" width="9" height="7" rx="1.5" fill="#00000033"/>`,
  veste:`<path d="M16 100 Q18 74 50 71 Q82 74 84 100Z" fill="${oc}"/><path d="M50 72 L50 100" stroke="#00000044" stroke-width="2"/><path d="M38 72 Q50 82 62 72" fill="#00000022"/>`,
  os:`<path d="M18 100 Q20 76 50 72 Q80 76 82 100Z" fill="${oc}"/><path d="M28 80 Q50 88 72 80" stroke="#efe6d2" stroke-width="4" fill="none"/><path d="M30 90 Q50 98 70 90" stroke="#efe6d2" stroke-width="4" fill="none"/><circle cx="22" cy="80" r="5" fill="#efe6d2"/><circle cx="78" cy="80" r="5" fill="#efe6d2"/>`,
  cape:`<path d="M10 100 Q14 70 50 68 Q86 70 90 100Z" fill="#1a1028"/><path d="M24 100 Q26 78 50 74 Q74 78 76 100Z" fill="${oc}"/><circle cx="50" cy="76" r="3" fill="#c58bff"/>`,
  fourrure:`<path d="M16 100 Q18 74 50 71 Q82 74 84 100Z" fill="${oc}"/><path d="M26 76 Q30 70 36 75 Q40 68 46 74 Q50 67 54 74 Q60 68 64 75 Q70 70 74 76 Q66 82 50 82 Q34 82 26 76Z" fill="#eadbc4"/>`,
  plongee:`<path d="M18 100 Q20 76 50 72 Q80 76 82 100Z" fill="#1d2430"/><path d="M30 78 L30 100 M70 78 L70 100" stroke="${oc}" stroke-width="5"/><circle cx="50" cy="86" r="5" fill="#67e5ff"/>`}[P.out]||"";
 const hairBack={long:`<path d="M27 40 Q24 70 32 76 L68 76 Q76 70 73 40Z" fill="${hc}"/>`,tresse:`<path d="M29 44 L27 78 M71 44 L73 78" stroke="${hc}" stroke-width="6" stroke-linecap="round"/>`,queue:`<path d="M66 40 Q86 46 80 66 Q76 54 66 52Z" fill="${hc}"/>`}[P.hair]||"";
 const hairTop={court:`<path d="M29 42 Q30 22 50 21 Q70 22 71 42 Q64 32 50 31 Q36 32 29 42Z" fill="${hc}"/>`,long:`<path d="M28 44 Q28 20 50 20 Q72 20 72 44 Q66 30 50 30 Q34 30 28 44Z" fill="${hc}"/>`,
  queue:`<path d="M29 42 Q30 22 50 21 Q70 22 71 42 Q62 30 50 30 Q38 30 29 42Z" fill="${hc}"/>`,pique:`<path d="M29 40 L30 22 L37 30 L41 16 L47 28 L52 14 L56 28 L63 17 L65 30 L71 22 L71 40 Q60 31 50 31 Q40 31 29 40Z" fill="${hc}"/>`,
  tresse:`<path d="M29 42 Q30 22 50 21 Q70 22 71 42 Q64 30 50 32 Q36 30 29 42Z" fill="${hc}"/>`,rase:`<path d="M31 36 Q34 23 50 23 Q66 23 69 36 Q60 29 50 29 Q40 29 31 36Z" fill="${hc}" opacity=".45"/>`}[P.hair]||"";
 const acc={chapeau:`<ellipse cx="50" cy="28" rx="30" ry="6" fill="#8a6a3a"/><path d="M34 28 Q36 12 50 12 Q64 12 66 28Z" fill="#a8824a"/><path d="M35 24 L65 24" stroke="#5a3a22" stroke-width="3"/>`,
  bandeau:`<path d="M29 34 Q50 28 71 34 L71 39 Q50 33 29 39Z" fill="#d83a3a"/><path d="M71 36 L80 32 L78 42Z" fill="#d83a3a"/>`,lunettes:`<rect x="35" y="41" width="12" height="9" rx="3" fill="#67e5ff55" stroke="#222" stroke-width="2"/><rect x="53" y="41" width="12" height="9" rx="3" fill="#67e5ff55" stroke="#222" stroke-width="2"/><path d="M47 45 L53 45" stroke="#222" stroke-width="2"/>`,
  plume:`<path d="M66 30 Q80 8 84 6 Q80 20 70 32Z" fill="#ff7aa8"/><path d="M67 30 Q76 18 82 9" stroke="#fff" stroke-width=".8" fill="none"/>`,casque:`<path d="M28 40 Q28 16 50 16 Q72 16 72 40 L66 40 Q66 24 50 24 Q34 24 34 40Z" fill="#b8c2d0"/><path d="M50 16 L50 6" stroke="#d83a3a" stroke-width="5" stroke-linecap="round"/>`,
  couronne:`<path d="M32 30 L35 14 L43 24 L50 10 L57 24 L65 14 L68 30Z" fill="#ffd15c" stroke="#b8860b" stroke-width="1"/><circle cx="50" cy="20" r="2.4" fill="#67e5ff"/>`}[P.acc]||"";
 return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(plName())}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG[0]}"/><stop offset="1" stop-color="${BG[1]}"/></linearGradient></defs>
  <rect width="100" height="100" fill="url(#${id})"/>${bgx}${hairBack}${out}<rect x="44" y="60" width="12" height="14" fill="${sk}"/><ellipse cx="50" cy="46" rx="21" ry="23" fill="${sk}"/>
  <circle cx="29" cy="47" r="4" fill="${sk}"/><circle cx="71" cy="47" r="4" fill="${sk}"/><circle cx="42" cy="47" r="2.6" fill="#1b1410"/><circle cx="58" cy="47" r="2.6" fill="#1b1410"/><circle cx="42.8" cy="46.2" r=".8" fill="#fff"/><circle cx="58.8" cy="46.2" r=".8" fill="#fff"/>
  <path d="M38 41 Q42 38.5 46 40.5 M54 40.5 Q58 38.5 62 41" stroke="${hc}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M44 57 Q50 61 56 57" stroke="#7a3a2a" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="37" cy="54" r="3" fill="#ff8a8a" opacity=".25"/><circle cx="63" cy="54" r="3" fill="#ff8a8a" opacity=".25"/>
  ${hairTop}${acc}</svg>`}
/* ---- éditeur ---- */
let plDraft=null;
function plEdit(){ens();plDraft={...S.player};plEditRender()}
function plEditRender(){const P=plDraft,opt=(k,arr,lab)=>`<div class="pled"><b>${lab}</b><div class="plopts">${arr.map(([v,n])=>{const free=plFree(v);return `<button class="${P[k]===v?"on":""} ${free?"":"lock"}" ${free?"":"disabled"} title="${esc(free?n:"🔒 "+n+" : "+PL_LOCK[v][1])}" onclick="plSet('${k}','${v}')">${free?esc(n):"🔒 "+esc(n)}</button>`}).join("")}</div></div>`,
  col=(k,arr,lab)=>`<div class="pled"><b>${lab}</b><div class="plcols">${arr.map((c,i)=>`<button class="plc ${P[k]===i?"on":""}" style="background:${c}" aria-label="${lab} ${i+1}" onclick="plSet('${k}',${i})"></button>`).join("")}</div></div>`;
 openModal(`<div class="pledit"><h2 style="margin:0 0 6px">🧑‍🚀 Mon dresseur</h2><div class="plhead"><div class="plprev">${plAvatar(P,"pprev")}</div><div class="grow">
  <label class="tiny muted">Pseudo (3 à 16 caractères)</label><input id="plName" maxlength="16" value="${esc(P.name)}" placeholder="Ton pseudo" oninput="plDraft.name=this.value">
  <label class="tiny muted">Nom de ton île</label><input id="plIsland" maxlength="20" value="${esc(P.island)}" placeholder="Île de …" oninput="plDraft.island=this.value">
  <div class="tiny muted" style="margin-top:4px">Les pièces 🔒 se débloquent en progressant.</div></div></div>
  <div class="plgrid">${col("skin",PL_SKIN,"Peau")}${opt("hair",PL_HAIR,"Coiffure")}${col("hcol",PL_HCOL,"Couleur des cheveux")}${opt("out",PL_OUT,"Tenue")}${col("ocol",PL_OCOL,"Couleur de la tenue")}${opt("acc",PL_ACC,"Accessoire")}${opt("bg",PL_BG,"Décor")}
  <div class="pled"><b>Emote de victoire</b><div class="plopts">${PL_EMO.map(([e,t])=>{const free=plFree(e);return `<button class="${P.emo===e?"on":""} ${free?"":"lock"}" ${free?"":"disabled"} title="${esc(free?t:"🔒 "+PL_LOCK[e][1])}" onclick="plSet('emo','${e}')">${free?e+" "+esc(t):"🔒 "+e}</button>`}).join("")}</div></div></div>
  <div class="btns"><button class="secondary" onclick="plRandom()">🎲 AU HASARD</button><button class="secondary" onclick="plDraft=null;closeModal()">ANNULER</button><button class="blue" onclick="plSave()">ENREGISTRER</button></div></div>`)}
function plSet(k,v){if(!plDraft)return;const n=$$("plName"),i=$$("plIsland");if(n)plDraft.name=n.value;if(i)plDraft.island=i.value;if(typeof v==="string"&&!plFree(v))return;plDraft[k]=v;plEditRender()}
function plRandom(){if(!plDraft)return;const pick=a=>a[rnd(a.length)],free=a=>a.filter(x=>plFree(x[0]));Object.assign(plDraft,{skin:rnd(PL_SKIN.length),hcol:rnd(PL_HCOL.length),ocol:rnd(PL_OCOL.length),hair:pick(PL_HAIR)[0],out:pick(free(PL_OUT))[0],acc:pick(free(PL_ACC))[0],bg:pick(free(PL_BG))[0]});plSet("x",0)}
function plSave(){if(!plDraft)return;const n=$$("plName"),i=$$("plIsland");const name=plClean(n?n.value:plDraft.name,16),island=plClean(i?i.value:plDraft.island,20);
 if(name&&name.length<3){toast("Le pseudo doit faire au moins 3 caractères.");return}
 ens();Object.assign(S.player,plDraft,{name,island});for(const k of ["hair","out","acc","bg","emo"])if(!plFree(S.player[k]))S.player[k]=PL_DEF[k];plDraft=null;save();closeModal();toast("🧑‍🚀 Dresseur enregistré"+(name?" : "+name:""));render()}
/* ---- compagnon (idée 485) ---- */
function plPetPick(){ens();const L=[...S.team].sort((a,b)=>RAR5.indexOf(sp(b).r)-RAR5.indexOf(sp(a).r)||b.level-a.level).slice(0,60);
 openModal(`<h3 style="margin:0 0 6px">🐾 Choisir un compagnon</h3><div class="tiny muted">Il t'accompagne sur l'accueil et sur ta carte de dresseur.</div><div class="nestlist">${L.map(d=>`<button class="nprow" onclick="plPet(${d.id})"><span class="a">${art(sp(d).e)}</span><span class="grow"><b>${esc((SPEC[d.type]||sp(d)).name)}</b><span class="tiny muted"> niv. ${d.level}</span></span></button>`).join("")}</div><div class="btns"><button class="secondary" onclick="plPet(0)">AUCUN</button><button class="secondary" onclick="closeModal()">FERMER</button></div>`)}
function plPet(id){ens();S.player.pet=id||0;save();closeModal();render()}
const plPetDino=()=>{ens();return S.player.pet?S.team.find(d=>d.id===S.player.pet)||null:null};
/* ---- carte de dresseur / photo de groupe en PNG (idées 478 et 498) ---- */
const plEmb=(svg,x,y,w,h)=>String(svg).replace(/^<svg /,`<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const plTxt=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function plCardSVG(kind,extra){ens();const P=S.player,t=S.team.slice(0,3),W=640,H=360,title=S.ach&&S.ach.title?S.ach.title:"",c=S.cnt||{};
 let h=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1630"/><stop offset="1" stop-color="#2a0f3a"/></linearGradient></defs>
  <rect width="${W}" height="${H}" rx="22" fill="url(#cg)"/><rect x="6" y="6" width="${W-12}" height="${H-12}" rx="18" fill="none" stroke="#67e5ff" stroke-opacity=".55" stroke-width="2"/>
  <text x="${W-24}" y="36" text-anchor="end" font-family="Verdana,sans-serif" font-size="14" font-weight="bold" fill="#67e5ff" letter-spacing="2">ARK: PRIMAL WORLD</text>`;
 if(kind==="photo"){h+=`<text x="24" y="40" font-family="Verdana,sans-serif" font-size="22" font-weight="bold" fill="#ffd15c">📸 ${plTxt(extra||"Victoire")}</text>`;
  h+=plEmb(plAvatar(P,"cpa"),24,80,170,170);t.forEach((d,i)=>{h+=plEmb(portrait(d.type),210+i*138,96,130,130)+`<text x="${275+i*138}" y="250" text-anchor="middle" font-family="Verdana,sans-serif" font-size="13" fill="#fff">${plTxt((SPEC[d.type]||sp(d)).name)}</text><text x="${275+i*138}" y="268" text-anchor="middle" font-family="Verdana,sans-serif" font-size="11" fill="#aab6d1">niv. ${d.level}</text>`});
  h+=`<text x="24" y="${H-58}" font-family="Verdana,sans-serif" font-size="20" font-weight="bold" fill="#fff">${plTxt(plName())}</text><text x="24" y="${H-34}" font-family="Verdana,sans-serif" font-size="13" fill="#aab6d1">${plTxt(new Date().toLocaleDateString("fr-FR"))} · ${plTxt(plIsland())}</text></svg>`;return h}
 h+=plEmb(plAvatar(P,"cpa"),26,26,190,190);
 h+=`<text x="236" y="76" font-family="Verdana,sans-serif" font-size="30" font-weight="bold" fill="#fff">${plTxt(plName())}</text>`;
 if(title)h+=`<text x="236" y="104" font-family="Verdana,sans-serif" font-size="15" fill="#ffd15c">👑 ${plTxt(title)}</text>`;
 h+=`<text x="236" y="${title?130:104}" font-family="Verdana,sans-serif" font-size="14" fill="#aab6d1">🏝️ ${plTxt(S.player.island||"Île sans nom")} · rang ${S.level||1}</text>`;
 [["📜 Histoire",S.stage||0],["⚔️ Victoires",c.wins||0],["🦖 Dinos",S.team.length],["🏅 Succès",Object.keys((S.ach&&S.ach.got)||{}).length]].forEach(([l,v],i)=>{const x=236+i*98;h+=`<rect x="${x}" y="146" width="90" height="56" rx="10" fill="#ffffff12" stroke="#ffffff22"/><text x="${x+45}" y="172" text-anchor="middle" font-family="Verdana,sans-serif" font-size="18" font-weight="bold" fill="#fff">${v}</text><text x="${x+45}" y="192" text-anchor="middle" font-family="Verdana,sans-serif" font-size="10" fill="#aab6d1">${plTxt(l)}</text>`});
 h+=`<text x="26" y="246" font-family="Verdana,sans-serif" font-size="13" font-weight="bold" fill="#67e5ff" letter-spacing="1">MON ÉQUIPE</text>`;
 t.forEach((d,i)=>{const x=26+i*150;h+=plEmb(portrait(d.type),x,256,80,80)+`<text x="${x+86}" y="290" font-family="Verdana,sans-serif" font-size="13" fill="#fff">${plTxt((SPEC[d.type]||sp(d)).name).slice(0,14)}</text><text x="${x+86}" y="308" font-family="Verdana,sans-serif" font-size="11" fill="#aab6d1">niv. ${d.level}${d.star?" · "+"★".repeat(d.star):""}</text>`});
 const pet=plPetDino();if(pet)h+=plEmb(portrait(pet.type),W-130,230,104,104)+`<text x="${W-78}" y="${H-14}" text-anchor="middle" font-family="Verdana,sans-serif" font-size="10" fill="#aab6d1">compagnon</text>`;
 return h+`</svg>`}
function plExport(kind,extra){const svg=plCardSVG(kind,extra),img=new Image(),url="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
 img.onload=()=>{const c=document.createElement("canvas");c.width=1280;c.height=720;const x=c.getContext("2d");x.drawImage(img,0,0,1280,720);
  let png;try{png=c.toDataURL("image/png")}catch(e){toast("Impossible de créer l'image.");return}const a=document.createElement("a");a.href=png;
  a.download=(kind==="photo"?"photo-de-groupe-":"carte-dresseur-")+plClean(plName(),16).replace(/[^\p{L}\p{N}_-]+/gu,"_")+".png";document.body.appendChild(a);a.click();a.remove();window.__plLast=png.length;toast("🖼️ Image créée : "+a.download)};
 img.onerror=()=>toast("Impossible de créer l'image.");img.src=url}
/* ---- affichage : barre du haut, accueil, profil, dialogues, Arène, victoire ---- */
function plChip(){const m=document.querySelector("header.top .meters");if(!m)return;ens();let b=document.getElementById("plChip");
 if(!b){m.insertAdjacentHTML("afterbegin",`<button class="meter plchip" id="plChip" onclick="plEdit()" title="Personnaliser mon dresseur"></button>`);b=document.getElementById("plChip")}
 const named=!!S.player.name,sig=JSON.stringify(S.player);if(b.dataset.sig===sig)return;b.dataset.sig=sig;b.classList.toggle("new",!named);b.innerHTML=`<span class="plmini">${plAvatar(S.player,"pchip")}</span><b>${esc(named?S.player.name:"Choisir un pseudo")}</b>`}
function renderPlayerBox(){const el=$$("playerBox");if(!el)return;ens();const P=S.player,pet=plPetDino();
 el.innerHTML=`<div class="plcard"><div class="plbig">${plAvatar(P,"pbig")}</div><div class="grow"><div class="eyebrow">MON DRESSEUR</div><h2 style="margin:2px 0">${esc(plName())}</h2>${S.ach&&S.ach.title?`<div class="tiny" style="color:#ffd15c">👑 ${esc(S.ach.title)}</div>`:""}
  <div class="tiny muted">🏝️ ${esc(P.island||"Île sans nom")} · emote de victoire : ${esc(P.emo)}</div><div class="tiny muted">🐾 Compagnon : ${pet?esc((SPEC[pet.type]||sp(pet)).name):"aucun"}</div>
  <div class="btns" style="margin-top:8px"><button class="blue" onclick="plEdit()">✏️ PERSONNALISER</button><button class="secondary" onclick="plPetPick()">🐾 COMPAGNON</button><button class="secondary" onclick="plExport('card')">🖼️ EXPORTER MA CARTE</button></div></div></div>`}
$$("profileBox").insertAdjacentHTML("beforebegin",'<div class="panel" id="playerBox"></div>');
if(typeof SUBSEL!=="undefined"&&SUBSEL.home)SUBSEL.home.ids.playerBox="profile";
function plHome(){const b=document.querySelector("#home .banner");if(!b)return;ens();let w=b.querySelector(".plwel");const pet=plPetDino();
 const h=`<span class="plwav">${plAvatar(S.player,"phome")}</span><span>Bienvenue, <b>${esc(plName())}</b>${S.player.island?` · 🏝️ ${esc(S.player.island)}`:""}</span>${pet?`<span class="plpet" title="${esc((SPEC[pet.type]||sp(pet)).name)}">${portrait(pet.type)}</span>`:""}`;
 if(!w){b.insertAdjacentHTML("beforeend",`<div class="plwel"></div>`);w=b.querySelector(".plwel")}if(w.dataset.h!==h){w.dataset.h=h;w.innerHTML=h}}
const _rPl=render;render=function(){_rPl();try{plChip();plHome();if(screen==="home")renderPlayerBox()}catch(e){}};
const _lsPl=loreShow;loreShow=function(n,cb){_lsPl(n,cb);try{ens();if(S.player.name&&loreCur){loreCur.lines=loreCur.lines.map(s=>s.replace(/\bsurvivant\b/g,S.player.name));loreType()}}catch(e){}};
if(typeof board==="function"){const _bdPl=board;board=function(){return _bdPl().map(r=>r.me?{...r,n:plName()+" (toi)"}:r)}}
const _rbPl=renderBattle;renderBattle=function(){_rbPl();const f=fight;if(!f||f.over!=="win")return;const rar=document.querySelector("#battleArea .result > .rarity"),res=rar&&rar.parentElement;if(!rar||res.querySelector(".pemote"))return;ens();const e=PL_EMO.find(x=>x[0]===S.player.emo)||PL_EMO[0],boss=f.enemies&&f.enemies[2]&&f.enemies[2].boss,ord=getComputedStyle(rar).order;
 rar.insertAdjacentHTML("afterend",`<div class="pemote" style="order:${ord}"><span class="plwav">${plAvatar(S.player,"pemo")}</span><span class="bubble"><b>${esc(plName())}</b> : ${e[0]} ${esc(e[1])}</span></div>`);
 const last=[...res.querySelectorAll(":scope > button.wide")].pop()||rar;if(boss)last.insertAdjacentHTML("afterend",`<button class="wide secondary plphoto" style="order:${getComputedStyle(last).order}" onclick="plExport('photo',${JSON.stringify(plTxt((f.enemies[2].name||"Boss").replace(/^.*·\s*/,"")+" vaincu !")).replace(/"/g,"&quot;")})">📸 PHOTO DE GROUPE</button>`)};
const _tdPl=todoItems;todoItems=function(){const L=_tdPl();try{ens();if(!S.player.name)L.unshift({i:"🧑‍🚀",t:"Choisis ton pseudo et l'apparence de ton dresseur",js:"plEdit()"})}catch(e){}return L};
ACH.push(["pl1","Un nom pour l'histoire","Choisir un pseudo",()=>S.player&&S.player.name?1:0,1,{tickets:1,essence:10}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Mon dresseur","Clique sur ton avatar en haut à gauche (ou Accueil > Profil) : pseudo, nom de l'île, peau, coiffure, couleurs, tenue, accessoire, décor et emote de victoire. Certaines pièces se débloquent en progressant. Choisis un compagnon parmi tes dinos, exporte ta carte de dresseur en image, et prends une photo de groupe après chaque boss."]);
