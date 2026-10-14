/* Réglages, sons (Web Audio synthétisé, aucun fichier), animations, difficulté, mesure d'équilibrage */
const PREF_KEY="arkPrimalPrefs",DEF_PREFS={sound:true,vol:.6,music:false,anim:true,vib:true,diff:"normal",art:"svg",theme:"dark"};
let PREFS={...DEF_PREFS};try{PREFS={...DEF_PREFS,...JSON.parse(localStorage.getItem(PREF_KEY)||"{}")}}catch(e){}
function savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify(PREFS))}catch(e){}}
const DIFFS={easy:{n:"Facile",h:.75,a:.75,r:.85},normal:{n:"Normal",h:1,a:1,r:1},hard:{n:"Difficile",h:1.3,a:1.25,r:1.3}};
const dm=()=>DIFFS[PREFS.diff]||DIFFS.normal;
/* difficulté : ennemis plus ou moins solides, récompenses de combat en proportion */
const _H8=H,_A8=A;H=n=>Math.round(_H8(n)*dm().h);A=n=>_A8(n)*dm().a;
let inWin9=false;const _give9=give;give=function(r){if(inWin9&&dm().r!==1){const m=dm().r;for(const k of ["stone","essence","bone","hide","crystal","amber"])if(r[k])r[k]=Math.max(1,Math.round(r[k]*m))}return _give9(r)};
/* ---- sons ---- */
let AC=null;const ac=()=>{if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==="suspended")AC.resume().catch(()=>{});return AC};
function tone(f,d,type,v,t0,slide){const c=ac();if(!c)return;const t=c.currentTime+(t0||0),o=c.createOscillator(),g=c.createGain();o.type=type||"sine";o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime((v||.2)*PREFS.vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02)}
const SFX={tap:()=>tone(520,.07,"square",.12,0,760),hit:()=>{tone(180,.12,"sawtooth",.2,0,60)},hurt:()=>tone(140,.2,"sawtooth",.22,0,50),skill:()=>{tone(420,.1,"triangle",.2,0,900);tone(630,.12,"triangle",.15,.07)},special:()=>{[330,440,660,880].forEach((f,i)=>tone(f,.18,"square",.15,i*.06))},
 win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.25,"triangle",.22,i*.11)),lose:()=>[392,330,262,196].forEach((f,i)=>tone(f,.3,"sawtooth",.15,i*.16)),ping:()=>tone(880,.1,"sine",.15),gacha:()=>[392,494,587].forEach((f,i)=>tone(f,.2,"triangle",.16,i*.08)),legend:()=>[523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.35,"triangle",.2,i*.09)),buy:()=>{tone(660,.08,"square",.12);tone(990,.12,"square",.12,.07)}};
function sfx(n){if(!PREFS.sound||!SFX[n])return;try{SFX[n]()}catch(e){}}
let musicT=null,mStep=0;const PENTA=[220,262,294,330,392,440,524,588];
function musicTick(){if(!PREFS.music||!PREFS.sound){stopMusic();return}const seq=[0,2,4,2,5,4,2,1,0,3,4,6,5,4,2,3];tone(PENTA[seq[mStep%16]]/2,.9,"sine",.08,0);if(mStep%4===0)tone(PENTA[seq[mStep%16]]/4,1.6,"triangle",.06,0);mStep++}
function startMusic(){if(musicT||!PREFS.music||!PREFS.sound)return;ac();musicT=setInterval(musicTick,520)}
function stopMusic(){clearInterval(musicT);musicT=null}
document.addEventListener("pointerdown",()=>{ac();if(PREFS.music)startMusic()},{once:true});
/* ---- branchement sur le jeu ---- */
const _tap9=tapOrb;tapOrb=function(i){const o=fight&&fight.over;_tap9(i);if(!o){sfx("tap")}};
const _hit9=hitDino;hitDino=function(k,dm2,e){const before=fight.hp[k];_hit9(k,dm2,e);if(fight.hp[k]<before){sfx("hurt");shake()}};
const _use9=useSkill;useSkill=function(k){const cd=fight&&fight.cd[k];_use9(k);if(fight&&fight.cd[k]>0&&cd<=0)sfx("skill")};
const _sp9=special;special=function(){const ok=fight&&!fight.over&&fight.sp>=100;_sp9();if(ok){sfx("special");flash()}};
const _win9=win;win=function(){const was=fight&&fight.over;inWin9=true;try{_win9()}finally{inWin9=false}if(fight&&fight.over==="win"&&!was){sfx("win");confetti();track(true)}};
const _et9=enemyTurn;enemyTurn=function(){const f=fight,was=f&&f.over;_et9();if(f&&f.over==="lose"&&!was){sfx("lose");track(false)}};
const _toast9=toast;toast=function(m,ms){sfx("ping");return _toast9(m,ms)};
const _sg9=showGacha;showGacha=function(got,news,title){_sg9(got,news,title);try{sfx(got.some(d=>(SPEC[d.type]||{}).r==="Légendaire")?"legend":"gacha")}catch(e){}};
const _eq9=upgradeItem;upgradeItem=function(id){_eq9(id);sfx("buy")};
/* ---- animations ---- */
function shake(){if(!PREFS.anim)return;const b=$$("battleArea");if(!b)return;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake")}
function flash(){if(!PREFS.anim)return;const d=document.createElement("div");d.className="fxflash";document.body.appendChild(d);setTimeout(()=>d.remove(),500)}
function confetti(){if(!PREFS.anim)return;const box=document.createElement("div");box.className="confetti";const cols=["#ffd15c","#ff647b","#67e5ff","#8cffb0","#bd8aff"];for(let i=0;i<36;i++){const s=document.createElement("i");s.style.cssText=`left:${Math.random()*100}%;background:${cols[i%5]};animation-delay:${Math.random()*.4}s;animation-duration:${1.1+Math.random()*.9}s`;box.appendChild(s)}document.body.appendChild(box);setTimeout(()=>box.remove(),2400)}
function applyTheme(){let t=PREFS.theme||"dark";if(t==="auto")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.setAttribute("data-theme",t);const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==="light"?"#f6f9ff":"#04060d"}
try{window.__mql=matchMedia("(prefers-color-scheme: light)");window.__mql.addEventListener("change",()=>{if(PREFS.theme==="auto")applyTheme()})}catch(e){}
function applyPrefs(){applyTheme();document.body.classList.toggle("noanim",!PREFS.anim);if(PREFS.music&&PREFS.sound)startMusic();else stopMusic();if(typeof render==="function")try{render()}catch(e){}}
/* ---- mesure d'équilibrage (local, sur cet appareil) ---- */
function balKey(f){const o=f.o||{};if(o.mode==="story")return"histoire n"+f.n;if(o.mode==="dungeon")return"donjon "+DUN[o.d].n+" "+TIERS[o.tier-1][0];if(o.mode==="tower")return"tour étages "+(Math.floor((S.tower.floor-(f.over==="win"?1:0)-1)/10)*10+1)+"+";if(o.mode==="arena")return"arène "+ARENA_D[o.d][0];if(o.mode==="event")return"événement "+EVT[o.t][0];return"autre"}
function track(win){const f=fight;if(!f||f.balDone)return;f.balDone=true;ens();S.bal=S.bal||{};const k=balKey(f)+" ["+dm().n+"]",b=S.bal[k]=S.bal[k]||{w:0,l:0,turns:0,hp:0};
 win?b.w++:b.l++;b.turns+=f.turn||0;b.hp+=Math.round(100*f.hp.reduce((s,h)=>s+Math.max(0,h),0)/Math.max(1,f.mx.reduce((s,h)=>s+h,0)));save()}
function balReport(){const B=S.bal||{},rows=Object.entries(B).sort((a,b)=>a[0].localeCompare(b[0],"fr",{numeric:true}));
 if(!rows.length)return"Aucune donnée : joue quelques combats d'abord.";return"Équilibrage ARK Primal World ("+new Date().toISOString().slice(0,10)+")\nmode [difficulté] : victoires/défaites · taux · PV restants moyens (victoires+défaites)\n"+rows.map(([k,b])=>{const n=b.w+b.l;return k+" : "+b.w+"/"+b.l+" · "+Math.round(100*b.w/n)+" % · "+Math.round(b.hp/n)+" % PV"}).join("\n")}
/* ---- fenêtre de réglages ---- */
document.querySelector(".meters").insertAdjacentHTML("beforeend",'<button id="setFab" class="meter setbtn" onclick="openSettings()" aria-label="Réglages">⚙️ Réglages</button>');document.body.insertAdjacentHTML("beforeend",'<div id="setVeil" class="authveil hide"><div class="authbox" id="setBody"></div></div>');
function openSettings(){setRender();$$("setVeil").classList.remove("hide")}
function closeSettings(){$$("setVeil").classList.add("hide")}
function setPref(k,v){PREFS[k]=v;savePrefs();applyPrefs();setRender();if(k==="sound"&&v||k==="vol")sfx("ping")}
function setRender(){const sw=(k,l)=>`<div class="row" style="padding:6px 0"><div class="grow"><b>${l}</b></div><button class="${PREFS[k]?"":"secondary"}" style="min-width:70px" onclick="setPref('${k}',${!PREFS[k]})">${PREFS[k]?"OUI":"NON"}</button></div>`;
 $$("setBody").innerHTML=`<div class="row"><div class="grow"><h2 style="margin:0">Réglages</h2><div class="muted tiny">Enregistrés sur cet appareil.</div></div><button class="secondary" onclick="closeSettings()">FERMER</button></div>
 <div class="panel"><b>Audio</b>${sw("sound","Effets sonores")}<div class="row" style="padding:6px 0"><div class="grow"><b>Volume</b></div><input type="range" min="0" max="100" value="${Math.round(PREFS.vol*100)}" onchange="setPref('vol',this.value/100)"></div>${sw("music","Musique d'ambiance")}</div>
 <div class="panel"><b>Thème</b><div class="eltabs">${[["dark","🌙 Sombre"],["light","☀️ Clair"],["auto","🖥️ Auto"]].map(([k,l])=>`<button class="${PREFS.theme===k?"on":""}" style="font-size:12px" onclick="setPref('theme','${k}')">${l}</button>`).join("")}</div><div class="muted tiny">Style futuriste dans les deux cas. « Auto » suit le réglage de ton appareil.</div></div>
 <div class="panel"><b>Affichage</b>${sw("anim","Animations (secousses, confettis)")}${sw("vib","Vibrations (téléphone)")}<div class="row" style="padding:6px 0"><div class="grow"><b>Dinosaures</b><div class="muted tiny">Illustrations ou emojis</div></div><button class="secondary" onclick="setPref('art','${PREFS.art==="svg"?"emoji":"svg"}')">${PREFS.art==="svg"?"ILLUSTRATIONS":"EMOJIS"}</button></div></div>
 <div class="panel"><b>Difficulté</b><div class="muted tiny">Ennemis plus ou moins solides ; récompenses de combat en proportion (facile ×0,85 · difficile ×1,3). Concerne les prochains combats.</div><div class="eltabs">${Object.entries(DIFFS).map(([k,d])=>`<button class="${PREFS.diff===k?"on":""}" style="font-size:12px" onclick="setPref('diff','${k}')">${d.n}</button>`).join("")}</div></div>
 <div class="panel"><b>Mesure d'équilibrage</b><div class="muted tiny">Chaque combat est enregistré sur cet appareil (victoires, défaites, PV restants) pour savoir où le jeu est trop facile ou trop dur. Rien n'est envoyé.</div><pre id="balTxt" class="balpre">${esc(balReport())}</pre><div class="btns"><button class="blue" onclick="copyBal()">COPIER LE RAPPORT</button><button class="secondary" onclick="if(confirm('Effacer les mesures ?')){S.bal={};save();setRender()}">EFFACER</button></div></div>
 <div class="panel"><b>Données</b><div class="btns"><button class="red" onclick="resetProgress()">RÉINITIALISER LA PROGRESSION</button></div><div class="muted tiny" style="margin-top:6px">Efface la partie sur cet appareil (les réglages restent). Pense à ton code de sauvegarde avant.</div></div>`}
function copyBal(){const t=balReport();try{navigator.clipboard.writeText(t).then(()=>toast("Rapport copié."),()=>selBal())}catch(e){selBal()}}
function selBal(){const el=$$("balTxt");if(!el)return;const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);toast("Sélectionné : copie-le à la main.")}
function resetProgress(){if(!confirm("Effacer toute la progression de cet appareil ? Cette action est définitive."))return;if(!confirm("Vraiment tout effacer ?"))return;try{localStorage.removeItem("arkPrimalMobile")}catch(e){}location.reload()}
applyPrefs();
