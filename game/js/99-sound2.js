/* Son II (0.40) : thème musical par zone, boss plus intense en phase 3, Arène qui accélère, musique douce du Nid, musique
   d'événement saisonnière, mode « musique calme », bruitages par famille d'attaque, cris à l'invocation, ambiance par décor,
   volumes séparés (musique, effets, ambiance, voix) et égaliseur (graves, aigus), combo qui monte en tonalité, jingle selon
   les étoiles, sons de menu plus discrets, son de mutation, battement de cœur à faibles PV, leitmotiv de la Graine pendant
   l'histoire, silence quand la fenêtre n'est pas au premier plan, jukebox, pas sur la carte, son des orbes boostées,
   narration vocale (synthèse du système), alerte d'attaque puissante, sons atténués pendant les dialogues, sons « 8 bits ».
   Tout passe par un graphe Web Audio : bus (music, sfx, amb, voice) → égaliseur → volume général. État : S.snd. */
for(const[k,v]of [["vMus",.8],["vSfx",1],["vAmb",.6],["vVoice",.9],["eqLo",0],["eqHi",0]])if(typeof PREFS[k]!=="number")PREFS[k]=v;
for(const[k,v]of [["calm",false],["retro",false],["voice",false],["bgMute",true],["amb",true],["heart",true]])if(typeof PREFS[k]!=="boolean")PREFS[k]=v;
const _ensS2=ens;ens=function(){_ensS2();let N=S.snd;if(!N||typeof N!=="object")N=S.snd={};if(!N.heard||typeof N.heard!=="object")N.heard={}};
/* ---- graphe audio ---- */
const SND={bus:null,master:null,lo:null,hi:null,duck:1,away:false,jbx:null};
function sndGraph(){const c=ac();if(!c)return null;if(SND.bus&&SND.ctx===c)return SND;SND.ctx=c;SND.master=c.createGain();SND.lo=c.createBiquadFilter();SND.lo.type="lowshelf";SND.lo.frequency.value=250;
 SND.hi=c.createBiquadFilter();SND.hi.type="highshelf";SND.hi.frequency.value=3500;SND.lo.connect(SND.hi);SND.hi.connect(SND.master);SND.master.connect(c.destination);SND.bus={};
 for(const k of ["music","sfx","amb","voice"]){const g=c.createGain();g.connect(SND.lo);SND.bus[k]=g}sndLevels();return SND}
function sndLevels(){if(!SND.bus)return;const t=SND.ctx.currentTime,set=(p,v)=>{try{p.setTargetAtTime(v,t,.05)}catch(e){p.value=v}};
 set(SND.bus.music.gain,PREFS.vMus*SND.duck*(PREFS.calm?.6:1));set(SND.bus.sfx.gain,PREFS.vSfx);set(SND.bus.amb.gain,PREFS.vAmb*SND.duck);set(SND.bus.voice.gain,PREFS.vVoice);
 set(SND.lo.gain,PREFS.eqLo);set(SND.hi.gain,PREFS.eqHi);set(SND.master.gain,SND.away&&PREFS.bgMute?0:1)}
let SND_BUS="sfx",SND_Q=1;
const SEMI=f=>440*Math.pow(2,Math.round(12*Math.log2(f/440))/12);
tone=function(f,d,type,v,t0,slide){const G=sndGraph();if(!G)return;const c=G.ctx,t=c.currentTime+(t0||0),o=c.createOscillator(),g=c.createGain();
 if(PREFS.retro){type="square";f=SEMI(f);if(slide)slide=SEMI(slide)}o.type=type||"sine";o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),t+d);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime((v||.2)*PREFS.vol*SND_Q*(PREFS.retro?.6:1),t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(G.bus[SND_BUS]||G.bus.sfx);o.start(t);o.stop(t+d+.02);window.__snd=(window.__snd||0)+1;(window.__sndBus=window.__sndBus||{})[SND_BUS]=(window.__sndBus[SND_BUS]||0)+1};
function onBus(b,fn){const p=SND_BUS;SND_BUS=b;try{fn()}finally{SND_BUS=p}}
function noise(d,v,fq,q,t0){const G=sndGraph();if(!G||PREFS.sound===false)return;const c=G.ctx,t=c.currentTime+(t0||0),n=Math.floor(c.sampleRate*d),bf=c.createBuffer(1,n,c.sampleRate),a=bf.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
 const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=bf;fl.type="bandpass";fl.frequency.value=fq||800;fl.Q.value=q||1;g.gain.setValueAtTime((v||.1)*PREFS.vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(G.bus[SND_BUS]||G.bus.sfx);s.start(t);s.stop(t+d+.02);window.__snd=(window.__snd||0)+1}
/* ---- musique : thème par zone, phase 3 du boss, Arène, Nid, événements, mode calme, jukebox ---- */
const MZ=(ms,root,seq,lead,lv,bass,perc,dark)=>({ms,root,seq,lead,lv,bass,perc,dark});
Object.assign(MSC,{
 jungle:MZ(290,[196,220,262,294,330,392,440,524],[0,2,4,5,4,2,0,4,1,3,5,6,5,3,1,7],"triangle",.09,2,true),
 ruines:MZ(330,[208,233,262,277,311,349,370,415],[0,3,5,3,0,2,4,6,7,6,4,2,1,3,5,3],"sine",.09,1,true),
 volcan:MZ(260,[174,185,220,233,262,277,311,349],[0,0,2,0,3,0,2,1,0,0,4,3,5,3,2,1],"sawtooth",.06,2,true,true),
 obelisque:MZ(340,[220,247,277,311,330,370,415,440],[0,4,2,6,1,5,3,7,0,4,2,6,5,3,1,7],"sine",.08,1,true),
 toundra:MZ(380,[262,294,330,392,440,524,588,660],[0,4,7,4,2,5,7,5,1,4,6,4,0,3,5,3],"sine",.07,1,false),
 abysses:MZ(420,[131,147,165,196,220,262,294,330],[0,2,4,2,1,3,5,3,0,4,6,4,2,5,7,5],"sine",.08,1,false,true),
 boss3:MZ(190,[174,185,220,233,262,277,330,349],[0,1,0,1,3,2,0,1,5,4,5,4,6,7,6,4],"sawtooth",.07,2,true,true),
 arena1:MZ(300,[220,262,294,330,392,440,524,588],[0,2,4,5,4,2,0,3,0,2,4,6,5,4,2,1],"square",.05,2,true),
 arena2:MZ(250,[220,262,294,330,392,440,524,588],[0,2,4,5,4,2,0,3,0,2,4,6,5,4,2,1],"square",.055,2,true),
 arena3:MZ(205,[220,262,294,330,392,440,524,588],[0,2,4,5,4,2,0,3,0,2,4,6,5,4,2,1],"square",.06,2,true,true),
 nest:MZ(700,[262,294,330,392,440,524,588,660],[0,2,4,7,4,2,5,4,0,3,5,7,5,3,1,2],"sine",.05,0,false),
 calm:MZ(820,[220,247,262,294,330,392,440,494],[0,4,2,5,4,7,5,2,0,3,1,4,2,5,3,6],"sine",.05,0,false),
 halloween:MZ(360,[220,233,262,277,311,330,370,392],[0,1,0,4,3,1,0,6,5,4,1,0,7,6,4,1],"triangle",.07,1,false,true),
 noel:MZ(400,[262,294,330,349,392,440,494,524],[4,4,4,0,4,4,4,0,4,6,2,3,4,0,5,5],"sine",.08,1,false)});
const JUKE=[["menu","🏠 Accueil"],["battle","⚔️ Combat"],["boss","👹 Boss"],["boss3","🔥 Boss — phase 3"],["jungle","🌿 Jungle"],["ruines","🏛️ Ruines"],["volcan","🌋 Volcan"],["obelisque","🔮 Obélisque"],["toundra","❄️ Toundra"],["abysses","🌊 Abysses"],["arena3","🏟️ Arène"],["nest","🥚 Nid"],["calm","🍃 Musique calme"],["halloween","🎃 Halloween"],["noel","🎄 Noël"]];
const _mmS2=musicMode;musicMode=function(){if(SND.jbx&&MSC[SND.jbx])return SND.jbx;const base=_mmS2();let m=base;try{const f=fight;
 if(base==="menu"){if(screen==="nest")m="nest";else if(typeof evAct==="function"&&evAct("halloween"))m="halloween";else if(typeof evAct==="function"&&evAct("noel"))m="noel";else if(PREFS.calm)m="calm"}
 else if(base==="boss"){const e=f.enemies[f.wave];if(e&&e.hp/e.max<1/3)m="boss3"}
 else{const md=f.o&&f.o.mode;if(md==="arena")m="arena"+(f.turn>=16?3:f.turn>=8?2:1);else{const z=stageZone(f.zone||"");if(MSC[z])m=z}if(PREFS.calm&&!/^arena/.test(m))m="calm"}}catch(e){}
 try{if(S.snd&&!S.snd.heard[m]){S.snd.heard[m]=1}}catch(e){}return m};
const _mtS2=musicTick;musicTick=function(){onBus("music",()=>_mtS2())};
function jukePlay(k){SND.jbx=k||null;if(k&&!PREFS.music)setPref("music",true);if(musicT){clearInterval(musicT);musicT=null}startMusic();jukeOpen()}
function jukeOpen(){ens();const H=S.snd.heard;openModal(`<h3 style="margin:0 0 6px">🎵 Jukebox</h3><div class="tiny muted">Les musiques se débloquent en les entendant en jeu.</div><div class="s2juke">${JUKE.map(([k,n])=>H[k]||k==="menu"?`<button class="${SND.jbx===k?"":"secondary"}" onclick="jukePlay('${k}')">${SND.jbx===k?"▶ ":""}${n}</button>`:`<button class="secondary" disabled>🔒 ???</button>`).join("")}</div><div class="btns"><button class="secondary" onclick="jukePlay(null)">⏹ REVENIR À LA MUSIQUE DU JEU</button><button onclick="closeModal()">OK</button></div>`)}
/* ---- bruitages par famille, orbes boostées, combo ---- */
const FAMSND={T:()=>{tone(150,.16,"sawtooth",.18,0,70);noise(.08,.12,1800,2)},S:()=>{tone(70,.35,"sine",.3,0,40);noise(.25,.08,200,.7)},C:()=>{noise(.18,.14,600,1.2);tone(120,.2,"square",.12,0,60)},A:()=>{tone(95,.18,"triangle",.3,0,50);noise(.06,.15,400,3)},
 G:()=>{noise(.12,.12,2400,4);tone(320,.1,"square",.08,0,180)},F:()=>{tone(1200,.18,"sine",.1,0,1900);noise(.1,.06,4000,1)},H:()=>{tone(300,.25,"triangle",.14,0,480)},M:()=>{noise(.3,.12,900,.6);tone(180,.25,"sine",.12,0,90)},
 W:()=>{tone(130,.3,"sawtooth",.16,0,80);noise(.2,.08,500,1)},I:()=>{tone(1600,.2,"square",.04,0,2200);tone(1650,.2,"square",.04,.02,2100)}};
function famSnd(fam){if(PREFS.sound===false)return;(FAMSND[fam]||FAMSND.T)()}
const _toS2=tapOrb;tapOrb=function(i){const f=fight;let c=null,n=0,cb=0;try{if(f&&!f.over&&f.orbs){c=f.orbs[i];n=f.orbs.filter(x=>x===c).length;cb=f.combo||0}}catch(e){}const r=_toS2(i);
 try{if(c&&f&&PREFS.sound!==false){const d=S.team.slice(0,3).find((x,k)=>f.hp[k]>0&&sp(x).element===c);if(d)famSnd(msFam(d));
  if(n>=2)[0,1,2].slice(0,Math.min(3,n-1)).forEach(j=>tone(880*Math.pow(1.26,j)*(1+n*.05),.14,"sine",.07,.04+j*.05));
  const k=(f.combo||0);if(k>cb&&k>=2)tone(523*Math.pow(2,Math.min(12,k)/12),.12,"triangle",.1,.02)}}catch(e){}return r};
/* ---- jingle selon les étoiles, sons de menu plus discrets ---- */
const _winS2=SFX.win;SFX.win=function(){let st=2;try{st=fight&&typeof starsOf==="function"?starsOf(fight):2}catch(e){}window.__jingle=st;
 if(st>=3){[523,659,784,1047,1319].forEach((f,i)=>tone(f,.28,"triangle",.22,i*.1));tone(1568,.6,"sine",.12,.55)}else if(st===2)_winS2();else[523,587,659].forEach((f,i)=>tone(f,.25,"triangle",.18,i*.13))};
for(const k of ["ping","buy","tap"]){const o=SFX[k];if(o)SFX[k]=function(){const q=SND_Q;SND_Q=q*.55;try{o()}finally{SND_Q=q}}}
/* ---- cris à l'invocation, son de mutation ---- */
const _sgS2=showGacha;showGacha=function(got,news,title){_sgS2(got,news,title);try{if(PREFS.sound===false||!got||!got.length)return;const best=got.reduce((a,d)=>RAR5.indexOf(sp(d).r)>RAR5.indexOf(sp(a).r)?d:a,got[0]);
 setTimeout(()=>{try{if(typeof c2Cry==="function"&&S.team.some(x=>x.id===best.id))c2Cry(best.id);else famSnd(msFam(best))}catch(e){}},PREFS.anim?1400:50)}catch(e){}};
function mutSnd(){[392,494,587,740,988].forEach((f,i)=>tone(f,.4,"sine",.12,i*.08,f*1.06));noise(.5,.05,3000,6,.1)}
if(typeof nestHatch==="function"){const _nhS2=nestHatch;nestHatch=function(i){let mut=false;try{mut=!!(S.nest.slots[i]&&S.nest.slots[i].mut)}catch(e){}const r=_nhS2(i);if(mut&&PREFS.sound!==false){window.__mut=(window.__mut||0)+1;mutSnd()}return r}}
/* ---- ambiance par décor ---- */
const AMB={jungle:()=>{tone(2400+Math.random()*900,.08,"sine",.05,0,3400);tone(2600+Math.random()*700,.08,"sine",.04,.12,3600)},volcan:()=>{noise(1.2,.06,90,.8);if(Math.random()<.3)tone(60,.6,"sine",.08,0,40)},
 toundra:()=>noise(1.4,.05,1400,.5),abysses:()=>{tone(300+Math.random()*200,.12,"sine",.05,0,700);if(Math.random()<.2)tone(110,1.2,"sine",.05,0,80)},ruines:()=>{if(Math.random()<.4)tone(1800,.5,"sine",.025,0,1700)},obelisque:()=>tone(660+Math.random()*60,.9,"sine",.025,0,700)};
let ambT=0;function ambTick(){if(!PREFS.amb||PREFS.sound===false||screen!=="battle"||!fight||fight.over||document.hidden)return;const z=stageZone(fight.zone||"");if(AMB[z])onBus("amb",AMB[z])}
setInterval(()=>{try{ambTick()}catch(e){}},1700);
/* ---- battement de cœur, alerte d'attaque puissante ---- */
let heartOn=false;setInterval(()=>{try{const f=fight;heartOn=!!(PREFS.heart&&PREFS.sound!==false&&screen==="battle"&&f&&!f.over&&f.hp&&f.mx&&f.hp.some((h,k)=>h>0&&h/f.mx[k]<.25));if(heartOn){window.__heart=(window.__heart||0)+1;tone(55,.12,"sine",.3,0,40);tone(52,.12,"sine",.24,.22,38)}}catch(e){}},900);
const _rbS2=renderBattle;renderBattle=function(){_rbS2();try{const f=fight;if(!f||f.over||!f.enemies)return;const n=3-(f.turn||0)%3;if(n===1&&f.s2Al!==f.turn){f.s2Al=f.turn;if(PREFS.sound!==false){window.__alert=(window.__alert||0)+1;[0,.16].forEach(t=>tone(988,.11,"square",.1,t,880))}}}catch(e){}};
/* ---- dialogues : leitmotiv de la Graine, sons atténués, narration vocale ---- */
const SEED_MOTIF=[[392,.3],[523,.3],[494,.3],[659,.7]];
function seedMotif(){if(PREFS.sound===false)return;window.__motif=(window.__motif||0)+1;onBus("music",()=>SEED_MOTIF.reduce((t,[f,d])=>{tone(f,d+.2,"sine",.09,t);tone(f/2,d+.2,"triangle",.05,t);return t+d},0))}
function sayLine(txt){try{if(!PREFS.voice||!window.speechSynthesis||!txt)return false;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(txt).replace(/<[^>]*>/g,"").slice(0,400));u.lang="fr-FR";u.volume=Math.min(1,PREFS.vVoice*PREFS.vol);u.rate=1.02;speechSynthesis.speak(u);return true}catch(e){return false}}
const _lsS2=loreShow;loreShow=function(n,cb){const had=!!(typeof LORE!=="undefined"&&LORE[n]);_lsS2(n,cb);try{if(!had)return;SND.duck=.35;sndLevels();if(typeof n==="number"||/^end|^epi|seed|graine/i.test(String(n)))seedMotif();
 const L=typeof loreCur!=="undefined"&&loreCur&&loreCur.lines;if(L&&L[0])sayLine(L[0])}catch(e){}};
setInterval(()=>{try{const v=document.getElementById("loreVeil"),open=!!(v&&!v.classList.contains("hide")&&v.offsetParent!==null);if(!open&&SND.duck!==1){SND.duck=1;sndLevels();try{speechSynthesis.cancel()}catch(e){}}}catch(e){}},500);
/* ---- pas sur la carte d'histoire ---- */
function stepSnd(){if(PREFS.sound===false)return;[0,.14].forEach((t,i)=>noise(.06,.12,i?500:380,2,t))}
if(typeof mapSet==="function"){const _msS2=mapSet;mapSet=function(c){const p=typeof mapCh!=="undefined"?mapCh:c;const r=_msS2(c);if(typeof mapCh!=="undefined"&&mapCh!==p){window.__step=(window.__step||0)+1;stepSnd()}return r}}
document.addEventListener("pointerover",e=>{const n=e.target.closest&&e.target.closest("#chapters .smap .mnode");if(!n||n===SND.lastNode)return;SND.lastNode=n;if(PREFS.sound!==false)noise(.05,.05,450,2)},{passive:true});
/* ---- silence quand la fenêtre n'est pas au premier plan ---- */
function sndAway(v){SND.away=v;sndLevels()}
addEventListener("blur",()=>sndAway(true));addEventListener("focus",()=>sndAway(false));document.addEventListener("visibilitychange",()=>sndAway(document.hidden));
/* ---- réglages ---- */
function s2Set(k,v){PREFS[k]=v;savePrefs();sndLevels()}
const _srS2=setRender;setRender=function(){_srS2();const box=$$("setBody");if(!box||box.querySelector("#s2Opts"))return;const ps=[...box.querySelectorAll(".panel")];const sp0=ps.find(p=>/Audio/.test((p.querySelector("b")||{}).textContent||""))||ps[0];if(!sp0)return;
 const sl=(k,n,min,max,step)=>`<div class="row s2sl" style="padding:4px 0"><div class="grow"><b>${n}</b></div><input type="range" class="s2${k}" min="${min}" max="${max}" step="${step}" value="${PREFS[k]}" oninput="s2Set('${k}',+this.value)"></div>`;
 const tg=(k,n,d)=>`<div class="row" style="padding:4px 0"><div class="grow"><b>${n}</b>${d?`<div class="muted tiny">${d}</div>`:""}</div><button class="${PREFS[k]?"":"secondary"} s2t-${k}" style="min-width:70px" onclick="setPref('${k}',${!PREFS[k]})">${PREFS[k]?"OUI":"NON"}</button></div>`;
 sp0.insertAdjacentHTML("beforeend",`<div id="s2Opts">${sl("vMus","🎵 Musique",0,1,.05)}${sl("vSfx","💥 Effets",0,1,.05)}${sl("vAmb","🌿 Ambiance",0,1,.05)}${sl("vVoice","🗣️ Voix",0,1,.05)}${sl("eqLo","Graves",-12,12,1)}${sl("eqHi","Aigus",-12,12,1)}
  ${tg("calm","Musique calme","Pour les longues parties")}${tg("retro","Sons « 8 bits »")}${tg("amb","Sons d'ambiance des décors")}${tg("heart","Battement de cœur à faibles PV")}${tg("voice","Narration vocale","Lit les dialogues avec la voix de l'ordinateur")}${tg("bgMute","Silence hors de la fenêtre","Coupe le son quand le jeu n'est pas au premier plan")}
  <div class="row" style="padding:4px 0"><div class="grow"><b>🎵 Jukebox</b></div><button class="secondary" onclick="jukeOpen()">OUVRIR</button></div></div>`)};
const _spS2=setPref;setPref=function(k,v){_spS2(k,v);if(["calm","retro"].includes(k)){if(musicT){clearInterval(musicT);musicT=null;startMusic()}}sndLevels()};
if(typeof GUIDE!=="undefined")GUIDE.push(["Son et musique","Chaque zone a son thème, les boss s'emballent en phase 3, l'Arène accélère, le Nid est apaisant. Réglages > Son : volumes séparés (musique, effets, ambiance, voix), graves/aigus, musique calme, sons 8 bits, narration vocale, jukebox des musiques entendues."]);
