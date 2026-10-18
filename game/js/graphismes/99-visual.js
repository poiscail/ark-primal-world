/* Graphismes : volume des portraits (filtres SVG), fonds, scène de combat par zone, orbes en verre, cadres de rareté */
const rng=seed=>{let a=seed>>>0;return()=>{a=a+0x6D2B79F5>>>0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
/* --- définitions SVG globales --- */
document.body.insertAdjacentHTML("afterbegin",`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<filter id="vol" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
 <feMorphology in="SourceAlpha" operator="dilate" radius=".75" result="d"/><feFlood flood-color="#04060e" flood-opacity=".9"/><feComposite in2="d" operator="in" result="outline"/>
 <feGaussianBlur in="SourceAlpha" stdDeviation="1.7" result="b"/>
 <feSpecularLighting in="b" surfaceScale="3.2" specularConstant=".8" specularExponent="24" lighting-color="#fff" result="spec"><fePointLight x="12" y="4" z="42"/></feSpecularLighting>
 <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn"/>
 <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b2"/><feOffset in="b2" dx="-1.4" dy="-1.8" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="shade"/>
 <feFlood flood-color="#000" flood-opacity=".38"/><feComposite in2="shade" operator="in" result="shadeIn"/>
 <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3=".6" k4="0" result="lit"/>
 <feMerge><feMergeNode in="outline"/><feMergeNode in="lit"/><feMergeNode in="shadeIn"/></feMerge></filter>
</defs></svg>`);
/* --- portraits enrichis --- */
function portraitFull(type,bare){const key=type+(bare?"~":"");if(PCACHE[key])return PCACHE[key];const sp0=SPEC[type]||SPEC_DEFAULT[type];if(!sp0)return"❓";const cfg=PORT[type]||["T",{}],o=cfg[1],c=palette(type,sp0.element),sc=o.sc||1,id=hashS(type);
 const body=FAM[cfg[0]](c,o),r=sp0.r;
 const frame=r==="Légendaire"?`<rect x="1.3" y="1.3" width="61.4" height="61.4" rx="10" fill="none" stroke="url(#pl${id})" stroke-width="2.2"/>`:r==="Épique"?`<rect x="1.2" y="1.2" width="61.6" height="61.6" rx="10" fill="none" stroke="#c79bff" stroke-width="1.4" opacity=".85"/>`:r==="Rare"?`<rect x="1" y="1" width="62" height="62" rx="10.5" fill="none" stroke="#67e5ff" stroke-width="1" opacity=".6"/>`:"";
 const bg=bare?"":`<defs><radialGradient id="pg${id}" cx=".38" cy=".28" r=".95"><stop offset="0" stop-color="${c.bgl}"/><stop offset=".6" stop-color="${c.bgd}"/><stop offset="1" stop-color="#05070f"/></radialGradient><linearGradient id="pl${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#ffb02e"/><stop offset="1" stop-color="#ffe27a"/></linearGradient><linearGradient id="pf${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient></defs><rect width="64" height="64" rx="11" fill="url(#pg${id})"/><path d="M0 49 Q32 43 64 49 V64 H0Z" fill="url(#pf${id})"/><circle cx="46" cy="14" r="9" fill="${c.light}" opacity=".13"/>${decor(r,c)}${frame}<ellipse cx="32" cy="57" rx="22" ry="3.8" fill="#000" opacity=".4"/>`;
 const svg=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(sp0.name)}">${bg}<g filter="url(#vol)" transform="translate(${cfg[0]==="T"?-Math.max(0,(o.hs||1)-1)*8:0} 0) translate(32 55) scale(${sc}) translate(-32 -55)">${body}</g>${fxLayer(c,o.fx)}</svg>`;return PCACHE[key]=svg}
portrait=function(type,bare){return portraitFull(type,bare)};
Object.keys(PCACHE).forEach(k=>delete PCACHE[k]);
/* --- scène de combat --- */
const SCN={
 jungle:{sky:["#0d3b2e","#1d7a4f","#9be07a"],far:"#145a3a",mid:"#0d3f29",gnd:["#14391f","#07170e"],glow:"#d6ff8a",kind:"trees"},
 ruines:{sky:["#0f1536","#3b3f8f","#c58fd6"],far:"#2a2f6e",mid:"#171b45",gnd:["#262a55","#0a0c22"],glow:"#ffd9f2",kind:"pillars"},
 volcan:{sky:["#2a0805","#a8260f","#ffb050"],far:"#5a1608",mid:"#31090a",gnd:["#3a0f08","#120403"],glow:"#ffd070",kind:"volcano"},
 obelisque:{sky:["#0c0620","#3b1a78","#d18cff"],far:"#2b1457",mid:"#160a33",gnd:["#241047","#08031a"],glow:"#f0c8ff",kind:"obelisk"},
 neutre:{sky:["#0a1226","#1e3a72","#74c5ff"],far:"#173060",mid:"#0d1d3d",gnd:["#14284f","#060d1d"],glow:"#bfe8ff",kind:"hills"}};
function sceneLayer(kind,layer,col,R){let s="";const W=390;
 const tile=fn=>{let a="";for(let k=0;k<2;k++)a+=`<g transform="translate(${k*W} 0)">${fn}</g>`;return a};
 if(layer==="far"){let p=`M0 220 L0 ${150+R()*20}`;for(let x=0;x<=W;x+=26)p+=` L${x} ${kind==="volcano"?150+R()*30:kind==="hills"?130+R()*40:110+R()*50}`;p+=` L${W} ${150} L${W} 220Z`;
  if(kind==="volcano")p=`M0 220 L0 170 L70 150 L130 95 L150 88 L170 96 L230 150 L300 140 L390 165 L390 220Z`;
  s=tile(`<path d="${p}" fill="${col}"/>`+(kind==="volcano"?`<path d="M138 90 L150 88 L162 94 L156 104 L144 100Z" fill="#ff7a2a"/><path d="M150 96 L146 130 M152 98 L160 140" stroke="#ff7a2a" stroke-width="2" opacity=".7"/>`:""))}
 else if(layer==="mid"){
  if(kind==="trees"){let t="";for(let i=0;i<9;i++){const x=i*46+R()*20,h=90+R()*80;t+=`<rect x="${x}" y="${220-h}" width="${8+R()*6}" height="${h}" fill="${col}"/><ellipse cx="${x+6}" cy="${220-h}" rx="${26+R()*14}" ry="${18+R()*10}" fill="${col}"/>`}s=tile(t)}
  else if(kind==="pillars"){let t="";for(let i=0;i<6;i++){const x=i*66+R()*20,h=70+R()*90,w=16+R()*8,br=R()>.5;t+=`<path d="M${x} 220 V${220-h} ${br?`l${w*.4} -8 l${w*.3} 6 l${w*.3} -5`:`h${w}`} V220Z" fill="${col}"/><rect x="${x-3}" y="${220-h-(br?0:6)}" width="${w+6}" height="${br?0:6}" fill="${col}"/>`}t+=`<path d="M150 220 V120 Q185 70 220 120 V220" fill="none" stroke="${col}" stroke-width="12"/>`;s=tile(t)}
  else if(kind==="volcano"){let t="";for(let i=0;i<10;i++){const x=i*40+R()*20,h=30+R()*50;t+=`<path d="M${x} 220 L${x+10} ${220-h} L${x+22} ${220-h*.6} L${x+34} 220Z" fill="${col}"/>`}t+=`<path d="M0 205 Q60 196 120 206 T250 204 T390 207" stroke="#ff6a1a" stroke-width="2" fill="none" opacity=".8"/>`;s=tile(t)}
  else if(kind==="obelisk"){let t="";for(let i=0;i<7;i++){const x=i*58+R()*20,h=50+R()*70;t+=`<path d="M${x} 220 L${x+4} ${220-h} L${x+14} ${220-h-16} L${x+24} ${220-h} L${x+28} 220Z" fill="${col}"/>`}s=tile(t)}
  else{let t="";for(let i=0;i<8;i++)t+=`<ellipse cx="${i*55}" cy="215" rx="70" ry="${40+R()*30}" fill="${col}"/>`;s=tile(t)}}
 else if(layer==="fore"){let t="";for(let i=0;i<22;i++){const x=i*18+R()*10,h=14+R()*30;t+=kind==="volcano"||kind==="pillars"||kind==="obelisk"?`<path d="M${x} 220 L${x+6} ${220-h*.8} L${x+13} 220Z" fill="${col}"/>`:`<path d="M${x} 220 Q${x+4} ${220-h} ${x+14} ${220-h*1.2} Q${x+8} ${220-h*.4} ${x+10} 220Z" fill="${col}"/>`}s=tile(t)}
 return s}
const SC_CACHE={};
let SC_UID=0;function sceneHTML(z){const u="u"+(++SC_UID);return sceneBase(z).split("__U__").join(u)}
function sceneBase(z){if(SC_CACHE[z])return SC_CACHE[z];const c=SCN[z]||SCN.neutre,R=rng(hashS(z)),W=390,id="sc"+z+"__U__";
 let stars="";if(z==="ruines"||z==="obelisque"||z==="neutre")for(let i=0;i<40;i++)stars+=`<circle cx="${R()*W}" cy="${R()*110}" r="${.4+R()*1.1}" fill="#fff" opacity="${.3+R()*.6}"/>`;
 const sun=z==="ruines"?`<circle cx="290" cy="60" r="24" fill="#fff6e0"/><circle cx="290" cy="60" r="44" fill="#fff6e0" opacity=".12"/>`:z==="jungle"?`<circle cx="300" cy="55" r="34" fill="${c.glow}" opacity=".55"/><circle cx="300" cy="55" r="16" fill="#fffbd0"/>`:z==="volcan"?`<circle cx="200" cy="120" r="80" fill="${c.glow}" opacity=".25"/>`:z==="obelisque"?`<path d="M195 220 L190 40 L200 22 L210 40 L205 220Z" fill="#1d0d40"/><path d="M200 24 L200 200" stroke="#f0c8ff" stroke-width="1.5" opacity=".8"/><circle cx="200" cy="90" r="46" fill="${c.glow}" opacity=".18"/>`:`<circle cx="300" cy="60" r="22" fill="#fff" opacity=".7"/>`;
 const rays=z==="jungle"?[0,1,2,3].map(i=>`<path d="M300 55 L${60+i*80} 220 L${100+i*80} 220Z" fill="#fff6b0" opacity=".08"/>`).join(""):"";
 const h=`<div class="scene"><svg class="sc-sky" viewBox="0 0 390 220" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset=".6" stop-color="${c.sky[1]}"/><stop offset="1" stop-color="${c.sky[2]}"/></linearGradient><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.gnd[0]}"/><stop offset="1" stop-color="${c.gnd[1]}"/></linearGradient></defs><rect width="390" height="220" fill="url(#${id}s)"/>${stars}${sun}${rays}</svg>
 <div class="sc-layer l1"><svg viewBox="0 0 780 220" preserveAspectRatio="none">${sceneLayer(c.kind,"far",c.far,rng(11+hashS(z)))}</svg></div>
 <div class="sc-layer l2"><svg viewBox="0 0 780 220" preserveAspectRatio="none">${sceneLayer(c.kind,"mid",c.mid,rng(22+hashS(z)))}</svg></div>
 <svg class="sc-gnd" viewBox="0 0 390 60" preserveAspectRatio="none"><rect width="390" height="60" fill="url(#${id}g)"/><ellipse cx="195" cy="0" rx="260" ry="14" fill="${c.gnd[0]}"/></svg>
 <div class="sc-layer l3"><svg viewBox="0 0 780 220" preserveAspectRatio="none">${sceneLayer(c.kind,"fore",c.gnd[1],rng(33+hashS(z)))}</svg></div>
 <div class="sc-fog"></div></div>`;return SC_CACHE[z]=h}
const bareSvg=h=>h.replace(/(<svg[^>]*>)[\s\S]*?(<g filter=)/,"$1$2");
const EMO_PT={"🐊":"mosa","🦎":"dilopho","🐍":"coelo","☠️":"carcharo","🦴":"tyranno","🪲":"micro","🦂":"utah","🔥":"pyro","🐲":"dracorex","👾":"deino","🗿":"ankylo","⚡":"tonner","👹":"rex","🦖":"allo"};
function enemyPT(e){if(e.pt&&SPEC[e.pt])return e.pt;if(EMO_PT[e.e])return EMO_PT[e.e];const k=Object.keys(PORT);return k[hashS(String(e.e||e.name))%k.length]}
function figHTML(html,big){const m=/<svg/.test(html);return m?bareSvg(html):`<span class="emo">${html}</span>`}
function stageBuild(){const f=fight;if(!f||!f.mx||!f.enemies)return;const box=$$("battleArea"),pan=box.querySelector(".panel");if(!pan||box.querySelector(".battlestage"))return;
 const e=f.enemies[f.wave],z=stageZone(f.zone||""),art0=PREFS.art==="svg"?`<span class="pt">${portrait(enemyPT(e),true)}</span>`:`<span class="emo">${esc(e.e)}</span>`;
 const el=E_HUE[e.el]??200,base=E_HUE[(SPEC[enemyPT(e)]||{}).element]??200,hue=PREFS.art==="svg"?((el-base)%360):0;
 const info=pan.querySelector(".grow");const t=S.team.slice(0,3);
 const st=document.createElement("div");st.className="battlestage z-"+z;
 st.innerHTML=sceneHTML(z)+`<div class="sHud"></div><div class="sEnemy bigicon hit${e.boss&&f.wave===2?" boss":""}" style="--hue:${hue}deg"><div class="sEart">${art0}</div><i class="sShadow"></i>${f.pop?"":""}</div><div class="sTeam">${t.map((d,k)=>`<div class="sFig ${f.hp[k]>0?"":"dead"}" data-k="${k}"><div class="sfa">${PREFS.art==="svg"?figHTML(art(sp(d).e)):art(sp(d).e)}</div><i class="sShadow"></i><b class="sTag">${ICO[sp(d).element]||""}</b></div>`).join("")}</div>`;
 if(info){const h=st.querySelector(".sHud");h.appendChild(info)}
 pan.replaceWith(st);return st}
/* verre : orbes avec symboles SVG */
const OSVG={redorb:'<path d="M32 6 C40 20 52 26 50 40 C48 52 38 58 32 58 C24 58 14 52 14 40 C14 32 20 28 22 22 C26 28 28 30 30 30 C30 22 28 14 32 6Z" fill="#fff"/><path d="M32 30 C37 38 42 40 40 47 C39 52 35 54 32 54 C28 54 24 52 24 47 C24 42 30 38 32 30Z" fill="#ff9d3c"/>',
 blueorb:'<path d="M32 6 C44 22 52 32 52 41 C52 51 43 58 32 58 C21 58 12 51 12 41 C12 32 20 22 32 6Z" fill="#fff"/><path d="M22 42 Q22 50 30 52" stroke="#5fb8ff" stroke-width="4" fill="none" stroke-linecap="round"/>',
 greenorb:'<path d="M12 52 C10 28 26 10 54 10 C54 38 40 54 18 54Z" fill="#fff"/><path d="M14 52 C24 38 34 28 46 18" stroke="#3ccf6a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M26 40 L26 28 M34 34 L44 34" stroke="#3ccf6a" stroke-width="2.4" stroke-linecap="round"/>',
 purpleorb:'<path d="M36 4 L16 36 H29 L24 60 L48 26 H34Z" fill="#fff"/>',
 goldorb:'<circle cx="32" cy="32" r="12" fill="#fff"/>'+[0,1,2,3,4,5,6,7].map(i=>`<path d="M32 6 L32 14" stroke="#fff" stroke-width="4.5" stroke-linecap="round" transform="rotate(${i*45} 32 32)"/>`).join("")};
const osvg=c=>`<svg class="osym" viewBox="0 0 64 64">${OSVG[c]||""}</svg>`;
function orbGlass(){document.querySelectorAll("#battleArea .orbboard .orb").forEach((el,i)=>{if(el.dataset.gl)return;el.dataset.gl=1;const c=[...el.classList].find(x=>/^.+orb$/.test(x));if(!c||!OSVG[c])return;const sm=el.querySelector("small");el.firstChild&&el.firstChild.nodeType===3&&el.removeChild(el.firstChild);el.insertAdjacentHTML("afterbegin",osvg(c)+'<i class="gloss"></i>')})}

const _card99=card;card=function(d,a){const h=_card99(d,a),r=sp(d).r,c=r==="Légendaire"?"l":r==="Épique"?"e":r==="Rare"?"r":"c";return h.replace('<div class="panel">','<div class="panel dcard rar-'+c+'">')};
const _rc99=renderCollection;renderCollection=function(){_rc99();if(!colF.book)return;const keys=Object.keys(SPEC).sort((a,b)=>RAR5.indexOf(SPEC[a].r)-RAR5.indexOf(SPEC[b].r));document.querySelectorAll("#colTools .dx.no").forEach(el=>{const i=[...el.parentElement.children].indexOf(el),k=keys[i];if(k&&SPEC[k]&&PREFS.art==="svg")el.querySelector(".a").innerHTML=`<span class="sil"><span class="pt">${portrait(k,true)}</span></span>`})};
const _r99v=render;render=function(){_r99v();const h=document.querySelector("#home .heroDino");if(h&&PREFS.art==="svg"&&S.team[0]){const t=S.team[0].type;if(h.dataset.t!==t+PREFS.art){h.dataset.t=t+PREFS.art;h.innerHTML=`<span class="pt">${portrait(t,true)}</span>`}}};
const _sg99v=showGacha;showGacha=function(got,news,title){_sg99v(got,news,title);const g=document.querySelector("#gachaBody .gres");if(g&&got.length<=6){g.classList.add("big");g.style.gridTemplateColumns="repeat("+Math.min(3,got.length)+",minmax(0,1fr))"}};
