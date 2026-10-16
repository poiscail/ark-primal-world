/* Le Grand Nord (0.25) : une nouvelle région de 40 niveaux au-delà de la mer, ouverte au niveau 50 de l'histoire.
   Toundra glacée (niveaux 1-20) puis Abysses sous la banquise (21-40) : décors propres (sceneLayer « ice » et « reef »),
   8 créatures dessinées, 4 gardiens, dialogues. Chaque gardien vaincu pour la première fois rejoint la meute : 4 espèces
   introuvables ailleurs (SPEC[k].ex, exclues des invocations, de la boutique de fragments et des appels au choix).
   Combats via MODES.far (80-modes) ; victoire via eventWin remplacé. */
const FAR_UNLOCK=50,FAR_N=40,FAR_STEP=30;
const FAR_EQ=n=>50+Math.round(n*1.5);
const FAR_Z=[{k:"toundra",z:"Toundra",n:"Toundra glacée",em:["⛄","🐯","🐻","🐥"],el:"blueorb",mats:["hide","bone"]},{k:"abysses",z:"Abysses",n:"Abysses",em:["🦑","🔦","🎐","⚓"],el:"purpleorb",mats:["crystal","amber"]}];
const farZone=n=>FAR_Z[n>20?1:0];
const FAR_BOSS={10:{e:"⛄",n:"Mammouth ancestral",sp:"cryostego"},20:{e:"🐯",n:"Smilodon roi",sp:"boreal"},30:{e:"🦑",n:"Calmar colossal",sp:"abyssal"},40:{e:"⚓",n:"Mégalodon abyssal",sp:"megathal"}};
/* ---- 4 espèces exclusives ---- */
const FARSP=[["cryostego","Cryostégosaure","🌨️","Épique","blueorb",205,36,26,"fortify","armor",["G",{sc:1.1,fx:"ice"}]],
 ["boreal","Tyran boréal","🌬️","Légendaire","blueorb",238,50,22,"multi","pack",["T",{fe:2,hs:1.3,fx:"ice"}]],
 ["abyssal","Abyssaure","🔱","Épique","purpleorb",196,41,17,"pierce","ambush",["M",{k:"ichthyo",fx:"fish"}]],
 ["megathal","Mégathalassa","🌐","Légendaire","purpleorb",268,49,23,"weaken","scavenger",["M",{k:"levia",fx:"wave"}]]];
FARSP.forEach(a=>{const k=a[0],o={name:a[1],e:a[2],r:a[3],element:a[4],hp:a[5],atk:a[6],def:a[7],sk:a[8],pa:a[9],ex:1};if(!SPEC_DEFAULT[k])SPEC_DEFAULT[k]={...o};if(!SPEC[k])SPEC[k]={...o};SPEC[k].ex=1;PORT[k]=a[10]});
Object.keys(PCACHE).forEach(k=>delete PCACHE[k]);try{e2t()}catch(e){}
const isEx=k=>!!(SPEC[k]&&SPEC[k].ex);
/* exclusives : jamais dans les invocations ni les boutiques */
const _ptFar=pickType;pickType=function(r){for(let i=0;i<40;i++){const k=_ptFar(r);if(!isEx(k))return k}return _ptFar(r)};
const _ftFar=featured;featured=function(){const f=_ftFar(),d=Math.floor(Date.now()/864e5);[["leg","Légendaire",1],["epic","Épique",3],["rare","Rare",5]].forEach(([s,R,o])=>{if(isEx(f[s])){const p=Object.keys(SPEC).filter(k=>SPEC[k].r===R&&!isEx(k)).sort();f[s]=p.length?p[(d*7+o)%p.length]:null}});return f};
const _peFar=pullEl;pullEl=function(el,m){const p0=S.pity;for(let i=0;i<40;i++){const k=_peFar(el,m);if(!isEx(k))return k;S.pity=p0}return _peFar(el,m)};
const _sbFar=shopBuy;shopBuy=function(k){if(isEx(k)){toast("Cette espèce ne se trouve que dans le Grand Nord.");return}return _sbFar(k)};
if(typeof offerBuy==="function"){const _obFar=offerBuy;offerBuy=function(k){const r=_obFar(k),O=S.offer;if(O&&O.keys.some(isEx)){const R=OFFERS[O.k].r,p=Object.keys(SPEC).filter(x=>SPEC[x].r===R&&!isEx(x)&&!O.keys.includes(x));O.keys=O.keys.map(x=>isEx(x)?p.splice(rnd(p.length),1)[0]:x).filter(Boolean);save();openOffer()}return r}}
/* ---- décors ---- */
Object.assign(SCN,{toundra:{sky:["#0a1c33","#3d7db3","#d9f2ff"],far:"#6e9cc4",mid:"#2c5b84",gnd:["#e3f1ff","#7da8cc"],glow:"#ffffff",kind:"ice"},
 abysses:{sky:["#01060f","#062b52","#127aa1"],far:"#05213b",mid:"#031528",gnd:["#06263f","#010810"],glow:"#7fe8ff",kind:"reef"}});
const _slFar=sceneLayer;sceneLayer=function(kind,layer,col,R){if(kind!=="ice"&&kind!=="reef")return _slFar(kind,layer,col,R);const W=390,tile=fn=>{let a="";for(let k=0;k<2;k++)a+=`<g transform="translate(${k*W} 0)">${fn}</g>`;return a};let t="";
 if(kind==="ice"){
  if(layer==="far"){let p="M0 220 L0 160";for(let x=0;x<=W;x+=30)p+=` L${x+15} ${70+R()*60} L${x+30} ${130+R()*30}`;p+=` L${W} 220Z`;t=`<path d="${p}" fill="${col}"/>`;for(let x=15;x<=W;x+=30)t+=`<path d="M${x-6} ${110+R()*10} L${x} ${92+R()*8} L${x+6} ${110+R()*10}Z" fill="#f4fbff" opacity=".85"/>`}
  else if(layer==="mid"){for(let i=0;i<10;i++){const x=i*40+R()*16,h=60+R()*70,w=14+R()*8;t+=`<rect x="${x+w/2-2}" y="${220-h*.25}" width="4" height="${h*.25}" fill="#3a2a22"/>`;for(let j=0;j<3;j++){const y=220-h*.25-j*h*.25,ww=w*(1-j*.22);t+=`<path d="M${x+w/2-ww} ${y} L${x+w/2} ${y-h*.38} L${x+w/2+ww} ${y}Z" fill="${col}"/><path d="M${x+w/2-ww*.55} ${y-h*.17} L${x+w/2} ${y-h*.38} L${x+w/2+ww*.55} ${y-h*.17}Z" fill="#eef8ff" opacity=".85"/>`}}}
  else for(let i=0;i<14;i++){const x=i*30+R()*12;t+=`<ellipse cx="${x}" cy="${216+R()*4}" rx="${22+R()*16}" ry="${8+R()*8}" fill="${col}"/>`}}
 else{
  if(layer==="far"){for(let i=0;i<6;i++){const x=i*70+R()*20,h=60+R()*80,w=40+R()*30;t+=`<path d="M${x} 220 Q${x+4} ${220-h} ${x+w*.5} ${220-h-10} Q${x+w-4} ${220-h} ${x+w} 220Z" fill="${col}"/>`}t+=`<path d="M120 220 Q125 120 175 110 Q225 120 230 220 L210 220 Q205 150 175 145 Q145 150 140 220Z" fill="${col}"/>`}
  else if(layer==="mid"){for(let i=0;i<14;i++){const x=i*28+R()*12,h=50+R()*110,sw=6+R()*10;t+=`<path d="M${x} 220 Q${x-sw} ${220-h*.35} ${x+sw*.5} ${220-h*.6} Q${x+sw} ${220-h*.8} ${x+2} ${220-h}" fill="none" stroke="${R()>.5?"#0f5a4a":col}" stroke-width="${3+R()*2}" stroke-linecap="round"/>`}
   for(let i=0;i<6;i++){const x=i*66+R()*30,c=["#ff7aa8","#ffb04d","#c58bff"][i%3];t+=`<path d="M${x} 220 L${x} 200 M${x} 208 L${x-8} 196 M${x} 204 L${x+9} 192 M${x-8} 196 L${x-12} 188 M${x+9} 192 L${x+12} 184" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`}}
  else for(let i=0;i<20;i++){const x=i*20+R()*10;t+=`<ellipse cx="${x}" cy="${218+R()*3}" rx="${10+R()*12}" ry="${5+R()*6}" fill="${col}"/>`}}
 return tile(t)};
const _sbsFar=sceneBase;sceneBase=function(z){if(z!=="toundra"&&z!=="abysses")return _sbsFar(z);if(SC_CACHE[z])return SC_CACHE[z];const c=SCN[z],R=rng(hashS(z)),W=390,id="sc"+z+"__U__";
 const extra=z==="toundra"?`<path d="M0 40 Q100 10 200 35 T390 25 L390 60 Q290 70 200 55 T0 70Z" fill="#7dffcf" opacity=".16"/><path d="M0 55 Q120 30 220 52 T390 45 L390 70 Q280 80 200 68 T0 80Z" fill="#c58bff" opacity=".12"/><circle cx="300" cy="70" r="20" fill="#fff8e6" opacity=".85"/>`
  :[0,1,2,3,4].map(i=>`<path d="M${60+i*70} 0 L${30+i*70} 220 L${80+i*70} 220 L${95+i*70} 0Z" fill="#9ff3ff" opacity=".06"/>`).join("")+[...Array(18)].map(()=>`<circle cx="${R()*W}" cy="${R()*200}" r="${.6+R()*1.4}" fill="#bff8ff" opacity="${.25+R()*.5}"/>`).join("");
 const h=`<div class="scene"><svg class="sc-sky" viewBox="0 0 390 220" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset=".6" stop-color="${c.sky[1]}"/><stop offset="1" stop-color="${c.sky[2]}"/></linearGradient><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.gnd[0]}"/><stop offset="1" stop-color="${c.gnd[1]}"/></linearGradient></defs><rect width="390" height="220" fill="url(#${id}s)"/>${extra}</svg>
 <div class="sc-layer l1"><svg viewBox="0 0 780 220" preserveAspectRatio="none">${sceneLayer(c.kind,"far",c.far,rng(11+hashS(z)))}</svg></div>
 <div class="sc-layer l2"><svg viewBox="0 0 780 220" preserveAspectRatio="none">${sceneLayer(c.kind,"mid",c.mid,rng(22+hashS(z)))}</svg></div>
 <svg class="sc-gnd" viewBox="0 0 390 60" preserveAspectRatio="none"><rect width="390" height="60" fill="url(#${id}g)"/><ellipse cx="195" cy="0" rx="260" ry="14" fill="${c.gnd[0]}"/></svg>
 <div class="sc-layer l3"><svg viewBox="0 0 780 220" preserveAspectRatio="none">${sceneLayer(c.kind,"fore",c.gnd[1],rng(33+hashS(z)))}</svg></div>
 <div class="sc-fog"></div><i class="sc-snow"></i></div>`;return SC_CACHE[z]=h};
const _szFar=stageZone;stageZone=function(z){return/abysse/i.test(z||"")?"abysses":/toundra|glac/i.test(z||"")?"toundra":_szFar(z)};
/* ---- 8 créatures (même grille 64×64 que le bestiaire, tournées vers la droite) ---- */
Object.assign(BEAST,{
 mammoth(c){const wool=[0,1,2,3,4,5,6].map(i=>P(`M${12+i*5.5} ${26+Math.abs(i-3)*1.3} q2.6 -5.5 5 0z`,c.dark)).join("");
  return{b:P("M17 44 l-2 12 h6 l1 -11z",c.dark)+P("M39 44 l-1 12 h6 l0 -11z",c.dark)+P("M8 36 Q6 26 14 24 Q26 15 40 19 Q51 22 52 32 L50 46 Q30 51 12 47 Q6 43 8 36Z",c.main)+wool
   +P("M12 45 Q30 51 48 46 Q30 49 12 45Z",c.light,' opacity=".55"')+P("M23 46 l-1 11 h6 l1 -10z",c.main)+P("M44 45 l0 12 h6 l-1 -11z",c.main)
   +P("M45 21 Q56 17 60 25 Q62 31 58 37 Q60 45 56 53 Q54 56 52 53 Q55 45 53 40 Q47 40 45 33Z",c.main)+P("M49 21 Q45 13 51 11 Q50 15 54 19Z",c.dark)+P("M44 25 Q39 30 43 36 Q46 30 44 25Z",c.dark,' opacity=".7"')
   +S_("M54 36 Q63 40 61 48 Q59 54 50 52",c.bone,2.8)+S_("M52 38 Q58 44 55 50",c.boneD,1.6,.8),
   g:GEYE(55,28,1.3,c.eye)}},
 smilodon(c){return{b:P("M12 36 Q4 34 2 27 Q6 31 12 32Z",c.dark)+P("M16 44 l-3 12 h5 l3 -11z",c.dark)+P("M38 44 l-2 12 h5 l1 -11z",c.dark)+EL_(28,38,15,8,c.main)
   +[0,1,2].map(i=>S_(`M${20+i*7} 31 q2.5 4 0 8`,c.dark,1.6)).join("")+P("M15 42 Q28 48 41 42 Q28 46 15 42Z",c.light,' opacity=".6"')+P("M23 45 l-2 11 h5 l2 -10z",c.main)+P("M43 43 l0 13 h5 l-1 -12z",c.main)
   +P("M40 32 Q44 24 52 24 Q60 26 62 32 Q62 38 56 40 L46 41Z",c.main)+P("M47 25 l1 -5 l4 4z",c.main)+P("M48 25 l1.4 -3 l2 3z",c.deep)
   +P("M50 37 L62 36 Q61 39 56 39.5Z",c.dark)+P("M52 38 L56 38 L55.3 48Z",c.tooth)+P("M57 38 L60 38 L59 46Z",c.tooth)+C(61.6,33.6,1.1,"#140a12"),
   g:GEYE(55,30,1.3,c.eye)}},
 cavebear(c){return{b:P("M14 46 l-2 10 h7 l1 -9z",c.dark)+P("M36 46 l-1 10 h7 l0 -9z",c.dark)+P("M8 40 Q8 26 22 24 Q34 18 44 26 Q50 30 50 40 L48 48 Q28 52 12 48Z",c.main)
   +P("M22 25 Q30 20 38 22 Q30 27 22 28Z",c.dark,' opacity=".6"')+P("M12 46 Q28 52 46 47 Q28 50 12 46Z",c.light,' opacity=".5"')+P("M20 47 l-1 10 h7 l1 -9z",c.main)+P("M42 46 l0 11 h7 l-1 -10z",c.main)
   +C(53,34,9,c.main)+C(49,26,3.2,c.main)+C(49,26,1.6,c.deep)+P("M57 33 Q64 34 63 39 Q60 41 55 39Z",c.light)+C(62,35.6,1.3,"#140a12")+P("M56.5 40 l1 2.4 l1 -2.4z M59.5 40 l.9 2 l.9 -2z",c.tooth),
   g:GEYE(54,31,1.3,c.eye)}},
 terrorbird(c){return{b:S_("M26 40 L22 50 L25 58",c.boneD,2.6)+S_("M32 40 L35 50 L31 58",c.boneD,2.6)+S_("M21 58 h7 M28 58 h7",c.boneD,2)+P("M10 30 Q3 24 6 17 Q10 23 16 26Z",c.dark)
   +EL_(26,33,14,9,c.main,-10)+P("M14 31 Q24 24 34 30 Q24 35 14 31Z",c.light,' opacity=".6"')+P("M36 28 Q40 18 44 12 L50 14 Q46 22 44 32Z",c.main)+EL_(50,12,7,6,c.main)
   +P("M54 8 Q64 9 63 16 Q62 21 58 18 Q60 14 54 14Z",c.bone)+P("M48 6 l-3 -4 l5 2z M51 6 l0 -5 l3 4z",c.dark),
   g:GEYE(50,10,1.2,c.eye)}},
 squid(c){const arms=[0,1,2,3,4].map(i=>S_(`M38 ${30+i*3} Q50 ${22+i*6} 58 ${26+i*7} Q62 ${30+i*7} 60 ${36+i*6}`,i%2?c.main:c.dark,2.6)).join("");
  return{b:arms+S_("M38 34 Q54 40 62 56",c.light,1.6)+S_("M38 32 Q56 30 63 20",c.light,1.6)+P("M4 24 Q2 18 10 16 L34 24 Q42 30 38 38 L12 42 Q4 40 4 34Z",c.main)
   +P("M2 22 L10 14 L12 22Z M2 38 L10 42 L6 47Z",c.dark)+EL_(20,30,10,6,c.light,0,.35)+C(34,31,4.6,"#f2ecdc")+C(34.6,31,2.6,c.dark),
   g:C(34,31,6.5,c.glow,.25)+C(33,30,1,"#fff")}},
 angler(c){return{b:P("M6 34 L0 25 L2 43Z",c.dark)+C(26,34,18,c.main)+P("M14 22 Q26 14 38 22 Q26 20 14 22Z",c.dark,' opacity=".6"')+P("M30 36 Q44 30 52 34 Q48 50 32 48Z",c.deep)
   +[0,1,2,3,4].map(i=>P(`M${34+i*3.8} ${36-i*.4} l1.4 5 l1.4 -5z`,c.tooth)).join("")+[0,1,2,3].map(i=>P(`M${35+i*3.8} ${47-i*.6} l1.3 -4.4 l1.3 4.4z`,c.tooth)).join("")
   +S_("M30 18 Q34 4 48 6 Q54 8 54 13",c.dark,1.6)+P("M24 51 L18 60 L28 55Z",c.dark),
   g:C(54,15,4.8,c.glow,.5)+C(54,15,2.2,"#fff")+GEYE(36,28,1.6,c.eye)}},
 jelly(c){const t=[0,1,2,3,4,5].map(i=>S_(`M${18+i*5.5} 36 Q${15+i*5.5} 46 ${19+i*5.5} 54 Q${22+i*5.5} 60 ${18+i*5.5} 63`,i%2?c.light:c.main,1.6,.85)).join("");
  return{b:t+P("M12 36 Q12 12 32 10 Q52 12 52 36 Q44 32 38 36 Q32 32 26 36 Q20 32 12 36Z",c.main,' opacity=".9"')+P("M18 30 Q20 16 32 15 Q44 16 46 30 Q32 26 18 30Z",c.light,' opacity=".35"'),
   g:C(32,24,8.5,c.glow,.35)+C(26,20,1.5,"#fff",.8)+C(38,26,1,"#fff",.6)}},
 megalodon(c){return{b:P("M2 26 L10 34 L2 44 L8 34Z",c.dark)+P("M8 34 Q20 22 40 22 Q56 24 63 32 Q56 42 40 44 Q20 46 8 34Z",c.main)+P("M26 22 L32 10 L38 23Z",c.dark)+P("M30 42 L26 52 L38 44Z",c.dark)
   +P("M12 36 Q30 46 56 38 Q30 42 12 36Z",c.light,' opacity=".75"')+P("M50 36 L63 33 Q60 40 52 41Z",c.deep)+[0,1,2,3].map(i=>P(`M${52+i*2.6} ${35.2-i*.5} l1 2.4 l1 -2.4z`,c.tooth)).join("")+S_("M40 28 l0 6 M43 28 l0 6 M46 29 l0 5",c.dark,1,.7),
   g:GEYE(54,30,1.3,c.eye)}}});
Object.assign(BNAME,{mammoth:"Mammouth laineux",smilodon:"Smilodon",cavebear:"Ours des cavernes",terrorbird:"Oiseau-terreur",squid:"Calmar géant",angler:"Baudroie des abysses",jelly:"Méduse spectrale",megalodon:"Mégalodon"});
Object.assign(EN_SPR,{"⛄":"mammoth","🐯":"smilodon","🐻":"cavebear","🐥":"terrorbird","🦑":"squid","🔦":"angler","🎐":"jelly","⚓":"megalodon"});
Object.assign(BSC,{mammoth:1.08,cavebear:1.08,megalodon:1.1});
Object.assign(ELITE_BY,{toundra:"cryolo",abysses:"bary"});Object.assign(GUARD_BY,{toundra:"cryolo",abysses:"levia"});
Object.assign(BHOME,{mammoth:["Grand Nord : toundra","blueorb"],smilodon:["Grand Nord : toundra","blueorb"],cavebear:["Grand Nord : toundra","blueorb"],terrorbird:["Grand Nord : toundra","blueorb"],
 squid:["Grand Nord : abysses","purpleorb"],angler:["Grand Nord : abysses","purpleorb"],jelly:["Grand Nord : abysses","purpleorb"],megalodon:["Grand Nord : abysses","purpleorb"]});
/* ---- dialogues ---- */
Object.assign(LORE,{
 far1:["🧑‍🔬","Dr Elara","Regarde ce que la marée a rapporté : un éclat de glace qui pulse comme la Graine. Il vient du nord, au-delà de la mer.","J'ai réparé un vieux radeau. Si d'autres éclats existent, ils réveillent peut-être d'autres créatures… En route pour le Grand Nord !"],
 far10:["❄️","Mammouth ancestral","BRRROOOOM ! Les glaces m'ont gardé endormi dix mille ans. Qui ose fouler ma toundra ?","Si ta meute supporte le froid, l'un des miens te suivra."],
 far11:["🧑‍🔬","Dr Elara","Le Cryostégosaure s'est attaché à toi ! Ses plaques gardent le froid de la toundra.","Plus loin, des traces de griffes géantes dans la neige… Un prédateur règne sur ces terres."],
 far20:["🐯","Smilodon roi","Hhhhh… Mes crocs perçaient la glace avant que tes ancêtres ne marchent debout.","Les dinosaures du sud sont tendres. Montre-moi qu'ils savent mordre."],
 far21:["🧑‍🔬","Dr Elara","L'éclat nous guide sous la banquise : une fosse immense, éclairée par des créatures luminescentes.","J'ai fabriqué des bulles d'air pour la meute. Ne t'éloigne pas des lumières."],
 far30:["🦑","Calmar colossal","…Lumière… intrus… Les profondeurs ne rendent jamais ce qu'elles avalent.","Mes bras sont plus nombreux que tes dinosaures."],
 far40:["🦈","Mégalodon abyssal","Je suis la mâchoire de l'océan. La Graine de glace dort dans mon antre.","Prends-la… si tu survis à ma morsure."],
 farEnd:["🌟","La Graine de glace","…Deux graines, un même cœur. Le froid et la mer s'apaisent.","Le Grand Nord t'est ouvert, survivant. Ses gardiens se relèveront toujours pour qui voudra les défier."]});
/* journal : celui de l'île ne compte que ses pages (clés numériques) ; les pages du Grand Nord ont leur propre journal (vues dans S.far.lore) */
const farLoreLbl=k=>k==="farEnd"?"Épilogue":"Niv. "+k.slice(3);
loreJournal=function(){ens();const isl=Object.keys(LORE).filter(k=>/^\d+$/.test(k)),seen=isl.filter(n=>S.lore[n]).map(Number),fk=Object.keys(LORE).filter(k=>/^far/.test(k)),fs=fk.filter(k=>S.far.lore[k]);
 return `<div class="panel"><b>📖 Journal de l'île</b><div class="muted tiny">${seen.length} / ${isl.length} pages découvertes</div>${seen.map(n=>`<button class="secondary" style="margin-top:4px" onclick="loreShow(${n})">${LORE[n][0]} Niv. ${n} — ${esc(LORE[n][1])}</button>`).join("")||'<div class="tiny muted">Avance dans l\'histoire pour découvrir des pages.</div>'}</div>`
  +((S.stage||0)>=FAR_UNLOCK||fs.length?`<div class="panel farjournal"><b>🧊 Journal du Grand Nord</b><div class="muted tiny">${fs.length} / ${fk.length} pages découvertes</div>${fs.map(k=>`<button class="secondary" style="margin-top:4px" onclick="loreShow('${k}')">${LORE[k][0]} ${farLoreLbl(k)} — ${esc(LORE[k][1])}</button>`).join("")||'<div class="tiny muted">Embarque pour le Grand Nord pour découvrir des pages.</div>'}</div>`:"")};
/* ---- progression ---- */
const _ensFar=ens;ens=function(){_ensFar();let F=S.far;if(!F||typeof F!=="object")F=S.far={};if(!F.stars||typeof F.stars!=="object")F.stars={};if(!F.lore||typeof F.lore!=="object")F.lore={};for(const k of ["stage","starCl"])if(!(F[k]>=0))F[k]=0};
const farOpen=n=>{ens();return(S.stage||0)>=FAR_UNLOCK&&n>=1&&n<=FAR_N&&n<=S.far.stage+1};
const farStars=()=>{ens();return Object.values(S.far.stars).reduce((a,b)=>a+b,0)};
let farCh=null;
MODES.far=function(o){const n=Math.max(1,Math.min(FAR_N,o.n||1)),eq=FAR_EQ(n),Z=farZone(n),boss=n%10===0,B=FAR_BOSS[n],em=Z.em;
 const en=mkEnemies(eq,{emo:[em[rnd(4)],em[rnd(4)],boss?B.e:"🦖"],names:[Z.z+" · Ennemi",Z.z+" · Ennemi",boss?"Gardien · "+B.n:Z.z+" · Élite"],boss,els:[EL[rnd(3)],EL[rnd(3)],Z.el]});
 en.forEach(e=>{e.tr="";if(!e.boss&&Math.random()<.45){e.tr=TKEYS[rnd(TKEYS.length)];if(e.tr==="shield")e.sh=Math.round(e.max*.2);if(e.tr==="berserk")e.a0=e.atk}});
 if(boss&&typeof ES_TOWER!=="undefined"){en[2].esk=ES_TOWER[rnd(ES_TOWER.length)];en[2].skcd=ES_FIRST}
 return{eq,label:"Grand Nord · Niv. "+n+" · "+Z.z,enemies:en}};
const farLoreOk=()=>PREFS.lore!==false&&!(navigator.webdriver&&!window.__forceLore);
const _sbFar2=startBattle;startBattle=function(o){const t=o||lastB;if(t&&t.mode==="far"){if(!farOpen(t.n)){toast((S.stage||0)<FAR_UNLOCK?"Le Grand Nord s'ouvre au niveau "+FAR_UNLOCK+" de l'histoire.":"Ce niveau du Grand Nord est encore verrouillé.");go("far");return}
  const key="far"+t.n;if(LORE[key]&&!S.far.lore[key]&&farLoreOk()){S.far.lore[key]=1;save();return loreShow(key,()=>_sbFar2(o))}}return _sbFar2(o)};
function farWin(f){ens();const F=S.far,lv=f.o.n,boss=lv%10===0,first=lv>F.stage,Z=farZone(lv),R={stone:40+4*lv,essence:2+Math.floor(lv/5)};R[Z.mats[0]]=2+rnd(3);R[Z.mats[1]]=1+rnd(2);
 if(boss){R.crystal=(R.crystal||0)+2;R.amber=(R.amber||0)+2}let extra="";
 if(first){F.stage=lv;R.tickets=boss?3:(lv%5===0?1:0);R.essence+=boss?20:5;extra+=`<div class="tiny ok">Première victoire !</div>`;
  if(boss&&FAR_BOSS[lv]){const k=FAR_BOSS[lv].sp;S.team.push({id:S.nextId++,type:k,level:15,xp:0,v:"normal"});log(SPEC[k].name+" rejoint ta meute (Grand Nord) !");extra+=`<div class="farjoin">${art(SPEC[k].e)}<div><b>${esc(SPEC[k].name)} rejoint ta meute !</b><div class="tiny muted">${esc(SPEC[k].r)} · introuvable ailleurs</div></div></div>`;if(lv===FAR_N)F.endPending=1}}
 const st=starsOf(f);if(st>(F.stars[lv]||0))F.stars[lv]=st;bump("far");if(boss)bump("bosses");
 if(lv<FAR_N&&farOpen(lv+1))extra+=`<button class="wide blue" onclick="startBattle({mode:'far',n:${lv+1}})">NIVEAU SUIVANT (${lv+1})</button>`;
 return{R,extra,loot:boss&&Math.random()<.6?[rollItem(f.n,1)]:[]}}
const _ewFar=eventWin;eventWin=function(f,n){return f&&f.o&&f.o.mode==="far"?farWin(f):_ewFar(f,n)};
if(typeof chainNext==="function"){const _cnFar=chainNext;chainNext=function(f){if(f&&f.o&&f.o.mode==="far"){const n=f.o.n+1;return farOpen(n)?{mode:"far",n}:null}return _cnFar(f)}}
if(typeof balKey==="function"){const _bkFar=balKey;balKey=function(f){return f&&f.o&&f.o.mode==="far"?"grand nord n"+f.o.n:_bkFar(f)}}
function farStarClaim(){ens();const F=S.far,t=farStars();if(t<(F.starCl+1)*FAR_STEP)return;F.starCl++;give({tickets:3,essence:30,shards:10});save();toast("🧊 Palier "+F.starCl*FAR_STEP+" étoiles du Grand Nord : +3 🎟️ +30 🔮 +10 🧩",3800);sfx&&sfx("win");render()}
/* ---- écran ---- */
function renderFar(){const el=$$("far");if(!el)return;ens();const F=S.far,cur=Math.min(FAR_N,F.stage+1);if(farCh===null)farCh=Math.floor((cur-1)/10);const c0=farCh*10+1,Z=farZone(c0),z=Z.k,tot=farStars(),next=(F.starCl+1)*FAR_STEP;
 let h=`<div class="banner"><div class="eyebrow">LE GRAND NORD · AU-DELÀ DE LA MER</div><h1>${esc(Z.n)}</h1><p>40 niveaux sur des terres gelées puis sous la banquise. Chaque gardien vaincu rejoint ta meute : 4 dinos introuvables ailleurs.</p><div class="heroDino">🧊</div></div>`;
 if((S.stage||0)<FAR_UNLOCK){el.innerHTML=h+`<div class="panel"><b>🔒 Le Grand Nord est encore inaccessible</b><div class="muted tiny">Termine le niveau ${FAR_UNLOCK} de l'histoire pour embarquer.</div></div>`+farGuardHTML();try{bannerScenes()}catch(e){}return}
 const pos=i=>{const xs=[50,24,44,74,56,26,42,72,66,42];return{x:xs[i],y:92-i*9.2}};let path="";for(let i=0;i<10;i++){const p=pos(i);path+=(i?" L":"M")+p.x+" "+p.y}
 const nodes=[...Array(10)].map((_,i)=>{const n=c0+i,p=pos(i),boss=n%10===0,done=n<=F.stage,isCur=n===cur&&F.stage<FAR_N,lock=!farOpen(n),st=F.stars[n]||0;
  return `<button class="mnode ${boss?"boss":""} ${done?"done":""} ${isCur?"cur":""} ${lock?"lock":""}" style="left:${p.x}%;top:${p.y}%" ${lock?"disabled":""} onclick="startBattle({mode:'far',n:${n}})"><span class="mn">${boss?FAR_BOSS[n].e:n}</span>${done?`<span class="mst">${[1,2,3].map(k=>`<i class="${k<=st?"on":""}">★</i>`).join("")}</span>`:""}${boss?`<span class="mbl">${esc(FAR_BOSS[n].n.toUpperCase())}</span>`:""}</button>`}).join("");
 h+=`<div class="panel farhead"><div class="todohead"><b>🧊 Grand Nord : ${F.stage}/${FAR_N}</b><span class="chip">ennemis niv. ${FAR_EQ(c0)}–${FAR_EQ(c0+9)}</span></div><div class="progress"><i style="width:${F.stage/FAR_N*100}%;background:linear-gradient(90deg,#7fe8ff,#c58bff)"></i></div>
  ${F.stage<FAR_N?`<button class="wide blue" onclick="startBattle({mode:'far',n:${cur}})">🧊 JOUER LE NIVEAU ${cur}</button>`:'<div class="ok">Grand Nord conquis ! Les gardiens se relèvent pour qui veut les défier à nouveau.</div>'}
  <div class="starbar"><span>⭐ ${tot} étoiles</span><div class="progress"><i style="width:${Math.min(100,(tot-F.starCl*FAR_STEP)/FAR_STEP*100)}%;background:linear-gradient(90deg,#7fe8ff,#ffd15c)"></i></div><button ${tot>=next?"":"disabled"} onclick="farStarClaim()">${tot>=next?"🎁 Palier "+next:"Palier "+next}</button></div></div>
  <div class="panel mapwrap"><div class="maphead"><button class="secondary" ${farCh?"":"disabled"} onclick="farCh=${farCh-1};render()">‹</button><div><b>Chapitre ${farCh+1} · ${esc(Z.n)}</b><div class="muted tiny">Niveaux ${c0}–${c0+9} · ★ ${[...Array(10)].reduce((a,_,i)=>a+(F.stars[c0+i]||0),0)}/30</div></div><button class="secondary" ${farCh<3?"":"disabled"} onclick="farCh=${farCh+1};render()">›</button></div>
  <div class="smap farmap z-${z}">${sceneHTML(z)}<svg class="mpath" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${path}" class="mp1"/><path d="${path}" class="mp2"/></svg>${nodes}</div></div>`+farGuardHTML();
 el.innerHTML=h;try{bannerScenes()}catch(e){}
 if(F.endPending&&farLoreOk()){F.endPending=0;F.lore.farEnd=1;save();setTimeout(()=>loreShow("farEnd"),300)}}
function farGuardHTML(){const own=new Set(S.team.map(d=>d.type));return `<div class="sectionhead"><h2>Gardiens à rallier</h2><span class="muted tiny">${Object.values(FAR_BOSS).filter(b=>own.has(b.sp)).length} / 4</span></div><div class="panel"><div class="farguards">${Object.entries(FAR_BOSS).map(([n,b])=>{const has=own.has(b.sp),s=SPEC[b.sp];
 return `<div class="farg ${has?"":"no"}"><div class="a">${has?art(s.e):PREFS.art==="svg"?`<span class="sil"><span class="pt">${portrait(b.sp,true)}</span></span>`:"❓"}</div><b>${has?esc(s.name):"???"}</b><small>${esc(s.r)} · niveau ${n} : ${esc(b.n)}</small></div>`}).join("")}</div></div>`}
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="far" class="screen"></section>');
GRP.adv.screens.push(["far","🧊","Grand Nord"]);SCR2G.far="adv";SUBS.push(["far","🧊","Grand Nord"]);ADV.add("far");BZONE.far=()=>farZone(Math.min(FAR_N,(S.far&&S.far.stage||0)+1)).k;
const _rFar=render;render=function(){_rFar();if(screen==="far")renderFar();
 if(screen==="summon")document.querySelectorAll('#gachaY [onclick^="shopBuy("]').forEach(b=>{const m=/shopBuy\('([^']+)'/.exec(b.getAttribute("onclick")||"");if(m&&isEx(m[1])){const row=b.closest(".row");if(row)row.remove()}})};
/* ---- missions, succès, guide, « À faire » ---- */
DAILY.push({id:"d_far",t:"far",g:2,n:"Réussir 2 niveaux du Grand Nord",r:{essence:4,crystal:1}});
[10,40,120].forEach((g,i)=>PERM.push({id:"p_far"+g,t:"far",g,n:g+" niveaux du Grand Nord réussis",r:{tickets:i+1,crystal:i+1,stone:100*(i+1)}}));
ACH.push(["far1","Pionnier du Nord","Réussir le niveau 10 du Grand Nord",()=>S.far.stage,10,{tickets:3,essence:40}],
 ["far2","Plongeur des abysses","Réussir le niveau 30 du Grand Nord",()=>S.far.stage,30,{tickets:5,shards:30}],
 ["far3","Conquérant du Nord","Réussir le niveau 40 du Grand Nord",()=>S.far.stage,40,{tickets:10,shards:60},"Conquérant du Nord"],
 ["far4","Gardiens ralliés","Posséder les 4 dinos du Grand Nord",()=>{const o=new Set(S.team.map(d=>d.type));return Object.values(FAR_BOSS).filter(b=>o.has(b.sp)).length},4,{tickets:5,essence:60}]);
const _tdFar=todoItems;todoItems=function(){const L=_tdFar();try{ens();if((S.stage||0)>=FAR_UNLOCK&&S.far.stage===0)L.push({i:"🧊",t:"Nouveau : le Grand Nord t'attend",js:"go('far')"})}catch(e){}return L};
if(typeof GUIDE!=="undefined")GUIDE.push(["Le Grand Nord","Aventure > Grand Nord (dès le niveau "+FAR_UNLOCK+" de l'histoire) : 40 niveaux dans la Toundra glacée puis les Abysses, avec leurs créatures (mammouths, smilodons, calmars géants, mégalodons…). Les gardiens des niveaux 10, 20, 30 et 40 rejoignent ta meute à la première victoire : Cryostégosaure, Tyran boréal, Abyssaure et Mégathalassa, introuvables ailleurs. Étoiles et paliers propres au Grand Nord."]);
