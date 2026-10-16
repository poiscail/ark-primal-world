/* Épreuves de la meute (0.23) : défis à contraintes qui font jouer toute la collection (Aventure > Épreuves, dès le niveau 10).
   18 épreuves : 8 familles (3 dinos de la famille), 5 éléments (3 dinos de l'élément, face à des ennemis de l'élément qui les bat),
   2 raretés (communs seulement, sans épique ni légendaire) et 3 règles (sans super attaque, sans compétences, 12 actions maximum).
   3 paliers par épreuve (bronze niv. 15, argent niv. 45, or niv. 80), chacun débloqué par le précédent, récompense à la première
   victoire. « Former l'équipe » place les 3 dinos éligibles les plus puissants en tête ; « Rétablir mon équipe » remet l'ancienne.
   Combats via MODES.trial (80-modes) ; victoire via eventWin remplacé. */
const TR_TIERS=[{n:"Bronze",i:"🥉",lv:15,z:"Jungle",R:{tickets:1,essence:15}},{n:"Argent",i:"🥈",lv:45,z:"Volcan",R:{tickets:2,shards:10}},{n:"Or",i:"🥇",lv:80,z:"Obélisque",R:{tickets:3,crystal:2,shards:15}}];
const TR_ELN={redorb:"Fournaise",blueorb:"Marée",greenorb:"Canopée",purpleorb:"Tempête",goldorb:"Aube"},TR_LIMITS=[12,16,20];/* « Contre la montre » : actions permises par palier (mesuré : 9 / 17 / 23 actions médianes sans compétences) */
const trLimit=f=>TR_LIMITS[(f&&f.o&&f.o.t)||0]||12;
const TRIALS=[
 ...Object.keys(FAMNAME).map(k=>({id:"fam_"+k,i:{T:"🦖",C:"🦏",A:"🐢",G:"🦕",F:"🪽",S:"🦒",H:"🦆",M:"🐋"}[k]||"🦖",n:{T:"Meute des théropodes",C:"Charge des cératopsiens",A:"Rempart des ankylosaures",G:"Épines des stégosaures",F:"Escadrille des ptérosaures",S:"Pas des colosses",H:"Harde des hadrosaures",M:"Banc des reptiles marins"}[k]||FAMNAME[k],d:"Équipe : 3 "+FAMNAME[k].toLowerCase()+".",ok:d=>famKey(d)===k})),
 ...Object.keys(TR_ELN).map(e=>({id:"el_"+e,i:ICO[e],n:TR_ELN[e],d:"Équipe : 3 dinos "+ICO[e]+"."+(Object.values(BEAT).includes(e)?" Les ennemis ont l'élément qui les bat.":""),ok:d=>sp(d).element===e,foe:Object.keys(BEAT).find(a=>BEAT[a]===e)})),
 {id:"rar_c",i:"🪨",n:"Les humbles",d:"Équipe : 3 dinos communs.",ok:d=>sp(d).r==="Commun"},
 {id:"rar_r",i:"🎖️",n:"Sans légende",d:"Équipe : aucun dino épique ni légendaire.",ok:d=>sp(d).r==="Commun"||sp(d).r==="Rare"},
 {id:"rule_sp",i:"🚫",n:"Sans super attaque",d:"N'importe quelle équipe, mais pas de super attaque.",rule:"nosuper"},
 {id:"rule_sk",i:"🤐",n:"Sans compétences",d:"N'importe quelle équipe, mais pas de compétences.",rule:"noskill"},
 {id:"rule_t",i:"⏱️",n:"Contre la montre",d:"N'importe quelle équipe : gagne en "+TR_LIMITS.join(" / ")+" actions au plus selon le palier (orbes et super ; les compétences ne comptent pas).",rule:"timed"}];
const _ensTr=ens;ens=function(){_ensTr();let T=S.trial;if(!T||typeof T!=="object")T=S.trial={};if(!T.done||typeof T.done!=="object")T.done={};if(!Array.isArray(T.prev))T.prev=null};
const trOf=id=>TRIALS.find(x=>x.id===id);
const trBest=id=>{ens();return S.trial.done[id]===undefined?-1:S.trial.done[id]};
const trTeamOk=(T,t)=>{t=t||S.team.slice(0,3);return !T.ok||(t.length>=3&&t.every(T.ok))};
const trElig=T=>T.ok?S.team.filter(T.ok):S.team.slice();
const trMedals=()=>{ens();return Object.values(S.trial.done).reduce((a,b)=>a+b+1,0)};
const trCount=t=>{ens();return Object.values(S.trial.done).filter(b=>b>=t).length};
/* ---- équipe : former / rétablir ---- */
function trForm(id){ens();const T=trOf(id);if(!T||!T.ok)return;const L=trElig(T).sort((a,b)=>power(b)-power(a)).slice(0,3);
 if(L.length<3){toast("Il te faut 3 dinos éligibles ("+L.length+" dans ta collection).");return}
 if(!S.trial.prev)S.trial.prev=S.team.slice(0,3).map(d=>d.id);S.team=[...L,...S.team.filter(d=>!L.includes(d))];if(fight&&!fight.over)fight=null;save();toast("Équipe formée : "+L.map(d=>sp(d).name).join(", "),2600);render()}
function trRestore(){ens();const p=S.trial.prev;if(!p)return;const m=p.map(id=>S.team.find(d=>d.id===id)).filter(Boolean);S.team=[...m,...S.team.filter(d=>!m.includes(d))];S.trial.prev=null;if(fight&&!fight.over)fight=null;save();toast("Ton équipe est rétablie.");render()}
/* ---- combats ---- */
MODES.trial=function(o){const T=trOf(o.id)||TRIALS[0],tier=TR_TIERS[o.t]||TR_TIERS[0],z=ZONES.find(x=>x[0]===tier.z)||ZONES[0],n=tier.lv;
 const els=[0,1,2].map(i=>T.foe||(i===2?z[2]:EL[rnd(3)]));
 const en=mkEnemies(n,{emo:[z[1][rnd(3)],z[1][rnd(3)],"👹"],names:["Épreuve · Ennemi","Épreuve · Ennemi","Gardien de l'épreuve · "+tier.n],boss:true,els});en.forEach(e=>{e.tr=""});
 return{eq:n,label:"Épreuve · "+T.n+" · "+tier.n+" · "+z[0],enemies:en}};
const _sbTr=startBattle;startBattle=function(o){const t=o||lastB;if(t&&t.mode==="trial"){const T=trOf(t.id);
  if(!T||(S.stage||0)<10){toast("Les épreuves se débloquent au niveau 10 de l'histoire.");return}
  if(t.t>trBest(t.id)+1){toast("Réussis d'abord le palier précédent.");go("trials");return}
  if(!trTeamOk(T)){toast("Équipe non conforme : "+T.d+" Utilise « Former l'équipe ».",3600);go("trials");return}}
 const r=_sbTr(o),f=fight;if(f&&f.o&&f.o.mode==="trial"&&!f.trSet){f.trSet=1;const T=trOf(f.o.id);f.trRule=T&&T.rule||"";f.trAct=0;
  if(f.trRule==="noskill")f.cd=f.cd.map(()=>99);if(f.trRule==="nosuper")f.sp=0;f.log="🏅 Épreuve : "+(T?T.d:"");renderBattle()}return r};
const trOn=f=>!!(f&&f.trSet&&f.o&&f.o.mode==="trial");
const _spTr=special;special=function(){const f=fight;if(trOn(f)&&!f.over){if(f.trRule==="nosuper"){toast("Pas de super attaque dans cette épreuve.");f.sp=0;return}if(f.sp>=100)f.trAct++}const r=_spTr();trClock(f);return r};
const _usTr=useSkill;useSkill=function(k){const f=fight;if(trOn(f)&&f.trRule==="noskill"){toast("Pas de compétences dans cette épreuve.");return}return _usTr(k)};
const _toTr=tapOrb;tapOrb=function(i){const f=fight;if(trOn(f)&&!f.over)f.trAct++;const r=_toTr(i);trClock(f);return r};
function trClock(f){if(!trOn(f)||f.over||f.trRule!=="timed"||f.trAct<trLimit(f)||fight!==f)return;f.over="lose";f.log+=" · ⏱️ Temps écoulé !";if(!f.settled)settleLose();save();renderBattle()}
const _rbTr=renderBattle;renderBattle=function(){const f=fight;if(trOn(f)&&!f.over){if(f.trRule==="nosuper")f.sp=0;if(f.trRule==="noskill")f.cd=f.cd.map(()=>99)}
 _rbTr();if(!trOn(f))return;const box=$$("battleArea");if(!box)return;
 if(f.trRule==="noskill")box.querySelectorAll(".skbtn small").forEach(s=>s.textContent="🚫");
 if(f.trRule==="nosuper"){const b=[...box.querySelectorAll("button")].find(x=>/SUPER/.test(x.textContent));if(b){b.disabled=true;b.textContent="🚫 PAS DE SUPER ATTAQUE"}}
 const ch=box.querySelector(".sHud .fchips");if(ch&&!f.over&&!ch.querySelector(".trchip")){const T=trOf(f.o.id);ch.insertAdjacentHTML("beforeend",`<span class="chip trchip">🏅 ${esc(T?T.n:"")}${f.trRule==="timed"?" · ⏱️ "+Math.max(0,trLimit(f)-f.trAct)+" actions":""}</span>`)}};
function trWin(f){ens();const id=f.o.id,t=f.o.t,T=trOf(id),tier=TR_TIERS[t],first=t>trBest(id),R={stone:30+3*tier.lv};
 if(first){S.trial.done[id]=t;Object.entries(tier.R).forEach(([k,v])=>R[k]=(R[k]||0)+v)}bump("trials");
 const nx=t<2&&trBest(id)>=t?`<button class="wide purple" onclick="startBattle({mode:'trial',id:'${id}',t:${t+1}})">PALIER ${TR_TIERS[t+1].n.toUpperCase()} ${TR_TIERS[t+1].i}</button>`:"";
 return{R,extra:`<div class="tiny ok" style="margin-top:4px">${first?tier.i+" Palier "+tier.n+" réussi : "+esc(T?T.n:"")+" !":"Épreuve déjà réussie à ce palier."}</div>`+nx,loot:[]}}
const _ewTr=eventWin;eventWin=function(f,n){return f&&f.o&&f.o.mode==="trial"?trWin(f):_ewTr(f,n)};
if(typeof balKey==="function"){const _bkTr=balKey;balKey=function(f){return f&&f.o&&f.o.mode==="trial"?"épreuve "+f.o.id+" "+(TR_TIERS[f.o.t]||{}).n:_bkTr(f)}}
/* ---- écran ---- */
function trCard(T){const b=trBest(T.id),ok=trTeamOk(T),el=trElig(T).length,lockT=t=>t>b+1;
 return `<div class="panel trc ${b>=2?"gold":b>=0?"some":""}"><div class="row"><div class="tri">${T.i}</div><div class="grow"><b>${esc(T.n)}</b><div class="muted tiny">${esc(T.d)}</div>
 ${T.ok?`<div class="tiny ${ok?"ok":"bad"}">${ok?"✅ Ton équipe est conforme":"❌ Équipe non conforme · "+el+" dino"+(el>1?"s":"")+" éligible"+(el>1?"s":"")+" dans ta collection"}</div>`:""}</div><div class="trmed">${TR_TIERS.map((x,t)=>`<span class="${b>=t?"on":""}" title="${x.n}">${x.i}</span>`).join("")}</div></div>
 ${T.ok&&!ok?`<button class="wide secondary trform" ${el>=3?"":"disabled"} onclick="trForm('${T.id}')">FORMER L'ÉQUIPE (${Math.min(3,el)}/3 éligibles)</button>`:""}<div class="trbtns">${TR_TIERS.map((x,t)=>`<button class="${lockT(t)?"secondary":t===2?"red":t===1?"blue":""}" ${lockT(t)||!ok?"disabled":""} onclick="startBattle({mode:'trial',id:'${T.id}',t:${t}})">${lockT(t)?"🔒":x.i} ${x.n.toUpperCase()} · NIV. ${x.lv}</button>`).join("")}</div></div>`}
function renderTrials(){const el=$$("trials");if(!el)return;ens();const M=trMedals(),G=[["Familles","fam_"],["Éléments","el_"],["Raretés","rar_"],["Règles spéciales","rule_"]];
 let h=`<div class="banner"><div class="eyebrow">ÉPREUVES DE LA MEUTE</div><h1>${M} / ${TRIALS.length*3} médailles</h1><p>Des défis qui font jouer toute ta collection : familles, éléments, raretés et règles spéciales. Trois paliers par épreuve.</p><div class="heroDino">🏅</div></div>`;
 if((S.stage||0)<10){el.innerHTML=h+`<div class="panel"><b>🔒 Épreuves verrouillées</b><div class="muted tiny">Termine le niveau 10 de l'histoire pour les débloquer.</div></div>`;return}
 h+=`<div class="panel trtop"><div class="todohead"><b>🏅 ${trCount(0)} en bronze · ${trCount(1)} en argent · ${trCount(2)} en or</b>${S.trial.prev?`<button class="secondary" onclick="trRestore()">↩ RÉTABLIR MON ÉQUIPE</button>`:""}</div>
 <div class="muted tiny">Première victoire à chaque palier : 🥉 ${fmt(TR_TIERS[0].R)} · 🥈 ${fmt(TR_TIERS[1].R)} · 🥇 ${fmt(TR_TIERS[2].R)}. « Former l'équipe » met en tête tes 3 dinos éligibles les plus puissants ; « Rétablir » remet ton équipe d'avant.</div>
 <div class="progress"><i style="width:${M/(TRIALS.length*3)*100}%;background:linear-gradient(90deg,#cd7f32,#ffd15c)"></i></div></div>`;
 G.forEach(([t,p])=>{h+=`<div class="sectionhead"><h2>${t}</h2></div><div class="trgrid">${TRIALS.filter(T=>T.id.startsWith(p)).map(trCard).join("")}</div>`});
 el.innerHTML=h;try{bannerScenes()}catch(e){}}
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="trials" class="screen"></section>');
GRP.adv.screens.push(["trials","🏅","Épreuves"]);SCR2G.trials="adv";SUBS.push(["trials","🏅","Épreuves"]);ADV.add("trials");BZONE.trials=()=>"ruines";
const _rTr=render;render=function(){_rTr();if(screen==="trials")renderTrials()};
/* ---- succès, missions, guide, « À faire » ---- */
[5,25,54].forEach((g,i)=>PERM.push({id:"p_trials"+g,t:"trials",g,n:g+" épreuves réussies",r:{tickets:i+1,crystal:i+1,stone:100*(i+1)}}));
ACH.push(["tr1","Polyvalent","Réussir 10 épreuves au palier bronze",()=>trCount(0),10,{tickets:2,essence:25}],
 ["tr2","Toutes familles","Réussir les 8 épreuves de famille au palier argent",()=>Object.keys(FAMNAME).filter(k=>trBest("fam_"+k)>=1).length,8,{tickets:4,shards:25}],
 ["tr3","Maître des épreuves","Réussir les 18 épreuves au palier or",()=>trCount(2),TRIALS.length,{tickets:10,shards:50},"Maître des Épreuves"]);
const _tdTr=todoItems;todoItems=function(){const L=_tdTr();try{ens();if((S.stage||0)>=10&&!Object.keys(S.trial.done).length)L.push({i:"🏅",t:"Nouveau : les Épreuves de la meute",js:"go('trials')"})}catch(e){}return L};
if(typeof GUIDE!=="undefined")GUIDE.push(["Épreuves de la meute","Aventure > Épreuves (dès le niveau 10 de l'histoire) : 18 défis à contraintes — 3 dinos d'une même famille, 3 dinos d'un même élément (face à l'élément qui les bat), communs seulement, sans épique ni légendaire, sans super attaque, sans compétences, ou gagner en peu d'actions ("+TR_LIMITS.join(" / ")+" selon le palier). Trois paliers (bronze niv. 15, argent niv. 45, or niv. 80), récompense à la première victoire de chacun. « Former l'équipe » met en tête tes meilleurs dinos éligibles ; « Rétablir mon équipe » remet l'ancienne."]);
