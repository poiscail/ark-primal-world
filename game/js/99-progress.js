/* Progression I (0.36) : niveau maximum 100 (120 avec l'éveil ★★★★★★), 6e étoile, entraînement passif des dinos hors équipe,
   objets d'XP (baies, viande), partage d'XP réglable, rattrapage des dinos en retard, coup de pouce entre les niveaux 40 et 60,
   récompenses de rang, arbre du dresseur (bonus globaux), prestige (rejouer l'histoire contre des bonus permanents), auras
   d'éveil, plafond de puissance contre les cumuls absurdes, défense lisible, niveau d'équipe au lieu de « ⚔ puissance ». */
const LV_CAP=100,LV_CAP6=120;
const lvCap=d=>(d&&(d.star||0)>=6)?LV_CAP6:LV_CAP;
const _ensPg=ens;ens=function(){_ensPg();let P=S.prog;if(!P||typeof P!=="object")P=S.prog={};if(!P.rk||typeof P.rk!=="object")P.rk={};if(!P.tree||typeof P.tree!=="object")P.tree={};
 if(!(P.prest>=0))P.prest=0;if(!["equal","weak","lead"].includes(P.share))P.share="equal";if(!P.xpi||typeof P.xpi!=="object")P.xpi={berry:0,meat:0}};
/* ---- niveau maximum ---- */
const _needPg=need;need=l=>l>=LV_CAP6?Infinity:_needPg(l);
function pgClamp(){try{S.team.forEach(d=>{const c=lvCap(d);if(d.level>c){d.level=c;d.xp=0}if(d.level>=c&&d.xp>0)d.xp=0})}catch(e){}}
const _saveP=save;save=function(){pgClamp();return _saveP.apply(this,arguments)};
function pgLvUp(d){const c=lvCap(d);while(d.level<c&&d.xp>=need(d.level)){d.xp-=need(d.level);d.level++;log(sp(d).name+" passe niveau "+d.level+".")}if(d.level>=c)d.xp=0}
/* ---- 6e étoile ---- */
const AW6={amber:25,crystal:25,essence:200,bone:60};
const _awPg=awaken;awaken=function(id){ens();const d=S.team.find(x=>x.id===id);if(!d)return;if((d.star||0)!==5)return _awPg(id);
 const ok=Object.entries(AW6).every(([k,v])=>(MATS[k]?S.mat[k]:S[k]||0)>=v);if(!ok){toast("Éveil ★★★★★★ : il faut "+fmt(AW6)+".");return}
 Object.entries(AW6).forEach(([k,v])=>{if(MATS[k])S.mat[k]-=v;else S[k]-=v});d.star=6;bump("awaken");log(sp(d).name+" : éveil ★★★★★★ ! Niveau maximum 120.");save();toast("🌟 Éveil ultime : "+sp(d).name+" peut monter jusqu'au niveau 120 !",3200);render()};
const _cardPg=card;card=function(d,a){let h=_cardPg(d,a);if(!d||!S.team.some(x=>x.id===d.id))return h;const k=d.star||0;
 h=h.replace(/<div class="bigicon([^"]*)"/,`<div class="bigicon$1 aw aw${k}"`);
 if(k>=5&&a!==false)h=h.replace(/<button class="purple" disabled>ÉVEIL MAX ★★★★★<\/button>/,k>=6?'<button class="purple" disabled>★★★★★★ ÉVEIL ULTIME</button>':`<button class="purple pgaw6" onclick="awaken(${d.id})">ÉVEIL ULTIME ★★★★★★ · ${fmt(AW6)}</button>`).replace(/<div class="tiny muted" style="margin-top:8px">★★★★★ éveil maximum<\/div>/,k>=6?'<div class="tiny ok" style="margin-top:8px">★★★★★★ éveil ultime · niveau max 120</div>':`<button class="wide purple pgaw6" onclick="awaken(${d.id})">ÉVEIL ULTIME ★★★★★★ → niveau max 120 · ${fmt(AW6)}</button>`);
 const v=stats(d),red=Math.round(v.def/2);h=h.replace(/<span>DÉFENSE<\/span>/,`<span title="Chaque coup reçu est réduit de ${red} dégâts">DÉFENSE · −${red}/coup</span>`);
 if(d.level>=lvCap(d))h=h.replace(/Niveau (\d+) · XP \d+\/\d+/,`Niveau $1 (max) · XP —`);return h};
/* ---- XP : partage, rattrapage, courbe 40-60, entraînement passif, prestige et arbre ---- */
const TREE={vig:{i:"❤️",n:"Vigueur",d:"+1 % de PV pour toute la meute"},fer:{i:"⚔️",n:"Férocité",d:"+1 % d'attaque pour toute la meute"},pro:{i:"🪨",n:"Prospection",d:"+4 % de pierres gagnées en combat"},sav:{i:"📚",n:"Savoir",d:"+4 % d'XP pour les dinos"}};
const treeLv=k=>{try{return(S.prog.tree[k])||0}catch(e){return 0}};
const treePts=()=>{ens();return Math.floor((S.level||1)/5)+2*S.prog.prest};
const treeUsed=()=>Object.values(S.prog.tree).reduce((a,b)=>a+b,0);
function treeUp(k){ens();if(!TREE[k]||treeLv(k)>=10||treeUsed()>=treePts())return;S.prog.tree[k]=treeLv(k)+1;save();pgOpen()}
function treeReset(){ens();S.prog.tree={};save();pgOpen()}
const pgPrestMul=()=>1+.1*Math.min(5,(S.prog&&S.prog.prest)||0);
let PG_WIN=false;
/* le bonus est appliqué sur l'objet lui-même (comme les autres enveloppes de give) : le rapport de victoire affiche alors ce qui est vraiment reçu */
const _giveP=give;give=function(r){if(PG_WIN&&r&&r.stone>0){const m=(1+.04*treeLv("pro"))*pgPrestMul();if(m!==1)r.stone=Math.round(r.stone*m)}return _giveP(r)};
const _stPg=stats;stats=function(d){const v=_stPg(d),a=treeLv("vig"),b=treeLv("fer");let o=v;if(a||b)o={...v,hp:Math.round(v.hp*(1+.01*a)),atk:Math.round(v.atk*(1+.01*b))};return pgCap(d,o)};
/* plafond de puissance : au-delà de ×4 (PV) et ×3,5 (attaque) des stats de base du niveau, l'excédent ne compte qu'au tiers */
const PG_CAP={hp:4,atk:3.5};
function pgCore(d){const p=SPEC[d.type]||sp(d),g=S.gear||0;return{hp:p.hp+(d.level-1)*p.hp*.13+g*8,atk:p.atk+(d.level-1)*p.atk*.12+g*2}}
function pgCap(d,v){if(!d||!d.type)return v;const c=pgCore(d),soft=(x,b,k)=>{const m=b*k;return x>m?Math.round(m+(x-m)/3):x};const hp=soft(v.hp,c.hp,PG_CAP.hp),atk=soft(v.atk,c.atk,PG_CAP.atk);return hp===v.hp&&atk===v.atk?v:{...v,hp,atk}}
const _winPg=win;win=function(){const f=fight,was=f&&f.over,t=T3().slice(),lv=t.map(d=>d.level);PG_WIN=true;try{_winPg()}finally{PG_WIN=false}
 if(!f||was||f.over!=="win"||f.raid)return;try{ens();const n=f.n||1,base=20+3*n,avg=lv.reduce((a,b)=>a+b,0)/(lv.length||1),P=S.prog,sav=1+.04*treeLv("sav");
  const wk=t.reduce((m,d,i)=>m===-1||d.level<t[m].level?i:m,-1);
  t.forEach((d,i)=>{let x=base*(sav*pgPrestMul()-1);if(P.share==="weak")x+=i===wk?base*.6:-base*.3;if(P.share==="lead")x+=i===0?base*.6:-base*.3;
   if(d.level<=avg-5)x+=base;if(d.level>=40&&d.level<60)x+=base*.2;d.xp=Math.max(0,d.xp+Math.round(x));pgLvUp(d)});
  const ids=new Set(t.map(d=>d.id));S.team.filter(d=>!ids.has(d.id)).slice(0,20).forEach(d=>{d.xp+=Math.round(base*.1);pgLvUp(d)});
  if(Math.random()<.25){const k=Math.random()<.7?"berry":"meat";P.xpi[k]++;f.log+=" · "+(k==="berry"?"🫐 baies":"🍖 viande")+" trouvée(s)"}save()}catch(e){}};
/* ---- objets d'XP ---- */
const XPI={berry:{i:"🫐",n:"Baies",xp:60},meat:{i:"🍖",n:"Viande",xp:250}};
function pgFeed(id,k){ens();const d=S.team.find(x=>x.id===id),it=XPI[k];if(!d||!it)return;if(S.prog.xpi[k]<=0){toast("Plus de "+it.n.toLowerCase()+".");return}if(d.level>=lvCap(d)){toast("Niveau maximum atteint.");return}
 S.prog.xpi[k]--;d.xp+=it.xp;pgLvUp(d);bump("fed");save();toast(it.i+" "+sp(d).name+" : +"+it.xp+" XP",1800);render()}
const _cardPg2=card;card=function(d,a){let h=_cardPg2(d,a);if(a===false||!d||!S.team.some(x=>x.id===d.id))return h;ens();const X=S.prog.xpi;if(!X.berry&&!X.meat)return h;const i=h.lastIndexOf("</div>");
 return h.slice(0,i)+`<div class="btns pgfeed">${Object.keys(XPI).filter(k=>X[k]>0).map(k=>`<button class="secondary" onclick="pgFeed(${d.id},'${k}')">${XPI[k].i} NOURRIR (${X[k]}) · +${XPI[k].xp} XP</button>`).join("")}</div>`+h.slice(i)};
/* ---- rangs récompensés ---- */
const rkReward=r=>r%25===0?{tickets:10,essence:100,shards:30}:r%10===0?{tickets:4,essence:40}:{tickets:2,essence:15};
function rkClaim(r){ens();if(r%5||r>(S.level||1)||S.prog.rk[r])return;S.prog.rk[r]=1;give(rkReward(r));save();toast("🎖️ Rang "+r+" : "+fmt(rkReward(r)),2600);pgOpen();render()}
const rkOpen=()=>{ens();const L=[];for(let r=5;r<=(S.level||1);r+=5)if(!S.prog.rk[r])L.push(r);return L};
/* ---- prestige ---- */
function pgPrestige(){ens();if((S.stage||0)<100){toast("Le prestige s'ouvre après le niveau 100 de l'histoire.");return}if(S.prog.prest>=5){toast("Prestige maximum atteint.");return}
 openModal(`<h3 style="margin:0 0 6px">♾️ Prestige ${S.prog.prest+1}</h3><div class="tiny">L'histoire repart du niveau 1 : les modes qu'elle débloque se rouvriront au fil de ta progression. Tu gardes tes dinos, objets, ressources et tout le reste.</div><div class="tiny" style="margin:8px 0"><b>En échange, pour toujours :</b> +10 % d'XP et de pierres gagnées par prestige (jusqu'à 5), +2 points d'arbre du dresseur, un titre.</div>
 <div class="btns"><button class="secondary" onclick="closeModal()">ANNULER</button><button class="red" onclick="pgPrestGo()">RECOMMENCER L'HISTOIRE</button></div>`)}
function pgPrestGo(){ens();if((S.stage||0)<100)return;S.prog.prest++;S.prog.prestMax=Math.max(S.prog.prestMax||0,S.stage);S.stage=0;bump("prestige");save();closeModal();toast("♾️ Prestige "+S.prog.prest+" ! L'histoire recommence, plus forte que jamais.",4000);render()}
/* ---- écran : panneau de progression (profil) ---- */
function pgOpen(){ens();const P=S.prog,pts=treePts(),used=treeUsed(),rk=rkOpen();
 openModal(`<h3 style="margin:0 0 6px">📈 Progression du dresseur</h3>
 <div class="pgsec"><b>🎖️ Rang ${S.level||1}</b> <span class="tiny muted">une récompense tous les 5 rangs</span>${rk.length?`<div class="c2row">${rk.slice(0,8).map(r=>`<button class="blue" onclick="rkClaim(${r})">RANG ${r} : ${fmt(rkReward(r))}</button>`).join("")}</div>`:'<div class="tiny muted">Aucune récompense en attente.</div>'}</div>
 <div class="pgsec"><b>🌳 Arbre du dresseur</b> <span class="chip">${pts-used} point(s) libre(s) / ${pts}</span><div class="tiny muted">1 point tous les 5 rangs, +2 par prestige. 10 rangs par branche.</div>${Object.keys(TREE).map(k=>`<div class="s3row"><span class="s3i">${TREE[k].i}</span><div class="grow"><b>${TREE[k].n}</b> <span class="tiny muted">${TREE[k].d}</span><div class="s3pips">${[...Array(10)].map((_,i)=>`<i class="${i<treeLv(k)?"on":""}"></i>`).join("")}</div></div><button class="blue" data-tree="${k}" ${treeLv(k)>=10||used>=pts?"disabled":""} onclick="treeUp('${k}')">+</button></div>`).join("")}<button class="secondary" onclick="treeReset()">RÉINITIALISER (gratuit)</button></div>
 <div class="pgsec"><b>⚖️ Partage de l'XP</b><div class="c2row">${[["equal","Équitable"],["weak","Priorité au plus faible"],["lead","Priorité au chef"]].map(([k,n])=>`<button class="${P.share===k?"blue":"secondary"}" onclick="S.prog.share='${k}';save();pgOpen()">${n}</button>`).join("")}</div><div class="tiny muted">Le plus faible (ou le chef) gagne +60 % d'XP, les deux autres −30 %. Les dinos 5 niveaux sous la moyenne de l'équipe gagnent toujours le double, ceux entre les niveaux 40 et 60 +20 %, et ceux hors équipe 10 % (entraînement passif).</div></div>
 <div class="pgsec"><b>♾️ Prestige ${P.prest}/5</b> <span class="tiny muted">bonus actuel : +${Math.round((pgPrestMul()-1)*100)} % d'XP et de pierres</span><div><button class="${(S.stage||0)>=100&&P.prest<5?"red":"secondary"}" ${(S.stage||0)>=100&&P.prest<5?"":"disabled"} onclick="pgPrestige()">PRESTIGE (histoire 100 requise)</button></div></div>
 <div class="btns"><button class="secondary" onclick="closeModal()">FERMER</button></div>`)}
/* ---- niveau d'équipe au lieu de « ⚔ puissance » ---- */
const _rPg=render;render=function(){_rPg();try{const m=$$("powerM");if(m){const t=T3(),a=t.length?Math.round(t.reduce((s,d)=>s+d.level,0)/t.length):0,P=t.reduce((s,d)=>s+power(d),0);m.textContent="Niv. "+a;const box=m.closest(".meter");if(box){box.title="Niveau moyen de l'équipe (puissance "+P+")";box.firstChild&&box.firstChild.nodeType===3&&(box.firstChild.textContent="🦖 ")}}
 if(screen==="home"){const pb=$$("playerBox")||document.querySelector("#home .banner"),ob=document.getElementById("pgBtn");if(ob)ob.remove();if(pb)pb.insertAdjacentHTML("afterend",`<div class="panel pgbox" id="pgBtn"><div class="row"><span class="bigicon">📈</span><div class="grow"><b>Progression du dresseur</b><div class="tiny muted">Rang ${S.level||1} · arbre ${treeUsed()}/${treePts()} · prestige ${S.prog.prest}${rkOpen().length?" · 🎁 "+rkOpen().length+" récompense(s) de rang":""}</div></div><button class="blue" onclick="pgOpen()">OUVRIR</button></div></div>`)}}catch(e){}};
const _tdPg=todoItems;todoItems=function(){const L=_tdPg();try{const n=rkOpen().length;if(n)L.push({i:"🎖️",t:n+" récompense(s) de rang à réclamer",js:"pgOpen()"});ens();if(treePts()>treeUsed())L.push({i:"🌳",t:"Point(s) d'arbre du dresseur à placer",js:"pgOpen()"})}catch(e){}return L};
ACH.push(["pg1","Éveil ultime","Éveiller un dino ★★★★★★",()=>S.team.some(d=>(d.star||0)>=6)?1:0,1,{tickets:10,essence:100}],["pg2","Centenaire","Un dino au niveau 100",()=>Math.max(0,...S.team.map(d=>d.level)),100,{tickets:5}],["pg3","Éternel retour","Faire un prestige",()=>(S.prog||{}).prest||0,1,{tickets:10,shards:30}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Progression","Niveau maximum 100 ; l'éveil ultime ★★★★★★ (après ★5) le porte à 120. Les dinos hors équipe gagnent 10 % de l'XP des combats ; ceux très en retard gagnent le double. Baies et viande (trouvées en combat) donnent de l'XP directement. Accueil > Progression du dresseur : récompenses de rang (tous les 5 rangs), arbre du dresseur (PV, attaque, pierres, XP), partage de l'XP et prestige (l'histoire recommence contre des bonus permanents). Un plafond doux empêche les cumuls absurdes de bonus (au-delà de ×4 PV et ×3,5 attaque, l'excédent compte au tiers)."]);
