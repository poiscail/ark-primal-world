/* Chef d'équipe, liens entre voisins et météo de zone (0.20, idées tirées de Dokkan Battle et de Pokémon).
   - Chef : le 1er dino de l'équipe donne +PV/+ATQ aux dinos de sa famille OU de son élément (un tiers aux autres) ; le bonus dépend de sa rareté.
   - Liens : deux voisins (places 1-2 et 2-3) de même famille gagnent +5 % ATQ, de même élément +5 % PV.
   - Météo : chaque jour, chaque zone de l'histoire et des donjons a sa météo, qui renforce (+20 %) ou affaiblit (−15 %) certaines orbes.
   Les bonus sont appliqués au premier rendu du combat (fight._tm), y compris quand le combat démarre après un dialogue d'histoire. */
const FAMNAME={T:"Théropodes",C:"Cératopsiens",A:"Ankylosaures",G:"Stégosaures",F:"Ptérosaures",S:"Sauropodes",H:"Hadrosaures",M:"Reptiles marins"};
const LINKNAME={T:"Meute",C:"Troupeau",A:"Carapaces",G:"Épines",F:"Escadrille",S:"Colosses",H:"Harde",M:"Banc"};
const famKey=d=>(PORT[d.type]||["T"])[0];
let LEAD_PCT={Commun:.06,Rare:.09,"Épique":.12,"Légendaire":.15},LINK_PCT=.05;
function leaderInfo(t){t=t||S.team.slice(0,3);const L=t[0];if(!L)return null;const s=sp(L),fam=famKey(L),pct=LEAD_PCT[s.r]||.06;
 return{d:L,s,fam,el:s.element,pct,per:t.map(d=>famKey(d)===fam||sp(d).element===s.element?pct:pct/3)}}
function linksOf(t){t=t||S.team.slice(0,3);const out=[];
 for(let i=0;i<t.length-1;i++){const a=t[i],b=t[i+1];if(famKey(a)===famKey(b))out.push({i,k:"fam",n:LINKNAME[famKey(a)]||"Lien",atk:LINK_PCT,hp:0});
  if(sp(a).element===sp(b).element)out.push({i,k:"el",n:"Harmonie "+(ICO[sp(a).element]||""),atk:0,hp:LINK_PCT})}return out}
function teamMods(t){const li=leaderInfo(t),m=t.map(()=>({hp:1,atk:1}));if(li)m.forEach((x,k)=>{x.hp*=1+li.per[k];x.atk*=1+li.per[k]});
 linksOf(t).forEach(l=>[l.i,l.i+1].forEach(k=>{m[k].atk*=1+l.atk;m[k].hp*=1+l.hp}));return m}
const pc=x=>Math.round(x*100)+" %";
/* ---- météo ---- */
const WX={clair:{n:"Ciel clair",i:"☀️",m:{}},pluie:{n:"Pluie tropicale",i:"🌧️",m:{blueorb:1.2,redorb:.85}},brume:{n:"Brume de spores",i:"🌫️",m:{greenorb:1.2,purpleorb:.85}},
 sable:{n:"Vent de sable",i:"🌪️",m:{goldorb:1.2,blueorb:.85}},cendres:{n:"Pluie de cendres",i:"🌋",m:{redorb:1.2,greenorb:.85}},orage:{n:"Orage magnétique",i:"⛈️",m:{purpleorb:1.2,blueorb:.85}},
 aurore:{n:"Aurore boréale",i:"🌌",m:{goldorb:1.15,purpleorb:1.15}}};
const ZWX={jungle:["clair","pluie","brume"],ruines:["clair","sable","pluie"],volcan:["clair","cendres","orage"],obelisque:["clair","orage","aurore"]};
let WX_ON=true,WX_FORCE=null;/* WX_ON : les simulations d'équilibrage le coupent pour des mesures stables ; WX_FORCE : météo imposée (tests) */
const wxToday=z=>{const L=ZWX[z];return L?L[hashS(todayK()+z)%L.length]:null};
function wxFor(f){if(!WX_ON||!f||!f.o||f.daily||f.raid||!["story","dungeon"].includes(f.o.mode))return null;const w=WX_FORCE||wxToday(stageZone(f.zone||""));return w==="clair"?null:w}
/* calcul paresseux : les modes (Tour, Arène…) transforment un combat d'histoire après sa création, la météo suit le mode et la zone actuels */
function wxOf(f){if(!f)return null;const key=(f.o&&f.o.mode)+"|"+(f.zone||"")+"|"+WX_ON+"|"+(WX_FORCE||"")+"|"+!!(f.daily||f.raid);if(f._wxK!==key){f._wxK=key;f._wx=wxFor(f)}return f._wx}
const wxMul=(f,c)=>{const w=wxOf(f);return w?(WX[w].m[c]||1):1};
function wxTxt(k){const w=WX[k];const e=Object.entries(w.m);return w.i+" "+w.n+(e.length?" : "+e.map(([c,v])=>ICO[c]+" "+(v>1?"+":"−")+Math.round(Math.abs(v-1)*100)+" %").join(" · "):" (aucun effet)")}
/* ---- application au combat ---- */
const _atLead=atkOf;atkOf=function(k){const f=fight;return _atLead(k)*(f&&f._tm&&f._tm[k]?f._tm[k].atk:1)*((f&&f.wxNow)||1)};
const _opLead=orbPreview;orbPreview=function(c){return Math.round(_opLead(c)*wxMul(fight,c))};
const _toLead=tapOrb;tapOrb=function(i){const f=fight;if(f&&!f.over&&f.orbs)f.wxNow=wxMul(f,f.orbs[i]);try{return _toLead(i)}finally{if(f)f.wxNow=1}};
function tmApply(f){if(!f||!f.mx||f._tm)return;const t=S.team.slice(0,3);f._tm=teamMods(t);
 f.mx=f.mx.map((v,k)=>Math.round(v*(f._tm[k]?f._tm[k].hp:1)));f.hp=f.hp.map((v,k)=>Math.min(f.mx[k],Math.round(v*(f._tm[k]?f._tm[k].hp:1))))}
const _rbLead=renderBattle;renderBattle=function(){const f=fight;if(f&&f.mx&&!f._tm&&!f.over&&(f.turn||0)===0)tmApply(f);_rbLead();if(!f||!f.mx||!f._tm)return;
 const box=$$("battleArea");if(!box||box.querySelector(".ldchips"))return;const t=S.team.slice(0,3),li=leaderInfo(t),lk=linksOf(t),ch=[];
 if(li)ch.push(`<span class="chip good" title="Le 1er dino de l'équipe est le chef : ${esc(FAMNAME[li.fam])} et ${ICO[li.el]} +${pc(li.pct)}, les autres +${pc(li.pct/3)}">🚩 Chef ${esc(li.s.name)} : ${esc(FAMNAME[li.fam])} / ${ICO[li.el]} +${pc(li.pct)}</span>`);
 lk.forEach(l=>ch.push(`<span class="chip" title="Lien entre les places ${l.i+1} et ${l.i+2}">🔗 ${esc(l.n)} (${l.i+1}-${l.i+2}) +${pc(l.atk||l.hp)} ${l.atk?"ATQ":"PV"}</span>`));
 const wx=wxOf(f);if(wx)ch.push(`<span class="chip wxchip">${esc(wxTxt(wx))}</span>`);if(!ch.length)return;
 const row=box.querySelector(":scope>.fchips");if(row)row.insertAdjacentHTML("beforeend",`<span class="ldchips">${ch.join("")}</span>`);
 else{const lg=box.querySelector(":scope>.result.tiny");if(lg)lg.insertAdjacentHTML("afterend",`<div class="fchips"><span class="ldchips">${ch.join("")}</span></div>`)}
 const st=box.querySelector(".battlestage");if(st&&wx&&!st.querySelector(".sWx")){st.classList.add("wx-"+wx);st.insertAdjacentHTML("beforeend",`<i class="sWx" aria-hidden="true"></i>`)}};
/* ---- écran Équipe : chef et liens de l'équipe actuelle ---- */
if(typeof SUBSEL!=="undefined"&&SUBSEL.team)SUBSEL.team.ids.leadBox="pack";
function leadBoxHTML(){const t=S.team.slice(0,3);if(!t.length)return"";const li=leaderInfo(t),lk=linksOf(t);
 const per=t.map((d,k)=>`<span class="chip ${li&&li.per[k]===li.pct?"good":""}">${esc(sp(d).name)} +${pc(li?li.per[k]:0)}</span>`).join("");
 return `<b>🚩 Chef et liens de l'équipe</b><div class="muted tiny" style="margin:3px 0 6px">Le 1er dino est le chef : il renforce (PV et ATQ) les dinos de sa famille ou de son élément selon sa rareté (Commun 6 %, Rare 9 %, Épique 12 %, Légendaire 15 % ; un tiers pour les autres). Deux voisins de même famille : +5 % ATQ ; de même élément : +5 % PV.</div>
  <div class="fchips">${li?`<span class="chip good">🚩 ${esc(li.s.name)} : ${esc(FAMNAME[li.fam])} / ${ICO[li.el]}</span>`:""}${per}</div>
  <div class="fchips" style="margin-top:4px">${lk.length?lk.map(l=>`<span class="chip">🔗 ${esc(l.n)} (${l.i+1}-${l.i+2}) +${pc(l.atk||l.hp)} ${l.atk?"ATQ":"PV"}</span>`).join(""):'<span class="tiny muted">Aucun lien : place côte à côte deux dinos de même famille ou de même élément.</span>'}</div>`}
const _rLead=render;render=function(){_rLead();const tm=$$("team");if(!tm)return;let b=$$("leadBox");if(!b){const ref=$$("presetBox")||$$("colTools");if(!ref)return;ref.insertAdjacentHTML("beforebegin",'<div class="panel" id="leadBox"></div>');b=$$("leadBox")}
 b.innerHTML=leadBoxHTML();if(typeof markSubs==="function"&&screen==="team")markSubs("team")};
if(typeof GUIDE!=="undefined")GUIDE.push(["Chef, liens et météo","Le 1er dino de l'équipe est le chef : il renforce les dinos de sa famille (théropodes, cératopsiens…) ou de son élément, d'autant plus qu'il est rare. Deux voisins de même famille gagnent +5 % ATQ, de même élément +5 % PV. En Histoire et en Donjon, la météo du jour (affichée en combat) renforce certaines orbes de 20 % et en affaiblit d'autres de 15 %."]);
/* victoires avec au moins 2 liens actifs (succès « Stratège ») */
const _winLead=win;win=function(){const f=fight,was=f&&f.over;_winLead();if(f&&f.over==="win"&&!was&&f._tm){if(linksOf(S.team.slice(0,3)).length>=2){ens();S.cnt.linkWins=(S.cnt.linkWins||0)+1;save()}}};
if(typeof ACH!=="undefined")ACH.push(["ld1","Stratège","Gagner 10 combats avec au moins 2 liens actifs",()=>(S.cnt&&S.cnt.linkWins)||0,10,{essence:30,tickets:2},"Stratège"]);
/* équilibrage : l'adversaire d'Arène a aussi son chef et ses liens (mêmes règles) ; la Tour se renforce un peu (mesuré par simulation) */
let TOWER_LEAD_TUNE={hp:1.1,atk:1.06};
const _maLead=MODES.arena;MODES.arena=function(o){const r=_maLead(o);try{const m=teamMods((o.sp||[]).map(k=>({type:k,level:1,xp:0})));r.enemies.forEach((e,i)=>{const x=m[i];if(!x)return;e.hp=e.max=Math.round(e.max*x.hp);e.atk=Math.round(e.atk*x.atk)})}catch(err){}return r};
const _mtLead=MODES.tower;MODES.tower=function(o){const r=_mtLead(o);r.enemies.forEach(e=>{e.hp=e.max=Math.round(e.max*TOWER_LEAD_TUNE.hp);e.atk=Math.round(e.atk*TOWER_LEAD_TUNE.atk)});return r};
