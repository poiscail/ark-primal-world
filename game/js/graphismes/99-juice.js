/* Sensations de combat (0.19, d'après la recherche « game feel ») : gel à l'impact, secousse « trauma », flash et écrasement de
   l'ennemi touché, images d'impact, coupure de super attaque façon Dokkan, parallaxe à la souris, invocation « couleur avant
   identité » (la couleur du cercle peut monter d'un cran). Tout est purement visuel et désactivé si les animations sont coupées.
   Réglages : PREFS.shake (secousses), PREFS.flash (flashs), PREFS.cutin (animation de super attaque). */
(function(){const calm=matchMedia("(prefers-reduced-motion: reduce)").matches;["shake","flash","cutin"].forEach(k=>{if(PREFS[k]===undefined)PREFS[k]=!calm})})();
const jOn=()=>!!PREFS.anim;
/* sons : envolée de la super attaque, choc sourd des gros impacts */
SFX.cutin=()=>{tone(170,.42,"sawtooth",.1,0,1500);tone(880,.22,"triangle",.08,.3,1760)};
SFX.thud=()=>tone(105,.17,"sine",.32,0,42);
/* ---- secousse « trauma » (Eiserloh) : amplitude = trauma², bruit continu, décroissance ---- */
let trauma=0,shRaf=0,shLast=0;const shSeed=Math.random()*100;
function addTrauma(v){if(!jOn()||PREFS.shake===false)return;trauma=Math.min(1,trauma+v);if(!shRaf)shRaf=requestAnimationFrame(shStep)}
function shStep(t){const st=document.querySelector("#battleArea .battlestage"),dt=shLast?Math.min(.05,(t-shLast)/1000):.016;shLast=t;
 trauma=PREFS.shake===false||!PREFS.anim?0:Math.max(0,trauma-1.6*dt*FX_SPEED);const k=trauma*trauma,ts=t/1000*21,n=s=>Math.sin(ts+s)*.6+Math.sin(ts*2.3+s*1.7)*.3+Math.sin(ts*4.1+s*2.9)*.1;
 if(st){st.style.translate=`${(13*k*n(shSeed)).toFixed(1)}px ${(9*k*n(shSeed+40)).toFixed(1)}px`;st.style.rotate=`${(2.4*k*n(shSeed+80)).toFixed(2)}deg`}
 if(trauma>0)shRaf=requestAnimationFrame(shStep);else{shRaf=0;shLast=0;if(st){st.style.translate="";st.style.rotate=""}}}
/* l'ancienne secousse du combat passe par le trauma */
const _shJ=shake;shake=function(){if(screen==="battle"&&jOn()&&PREFS.shake!==false){addTrauma(.28);return}if(PREFS.shake!==false)_shJ()};
/* ---- gel à l'impact : les animations du combat s'arrêtent un instant ---- */
let hsUntil=0;
function hitStop(ms){if(!jOn())return;ms=fxd(ms);const now=performance.now();if(now<hsUntil)return;hsUntil=now+ms;
 const A=document.getAnimations().filter(a=>{const t=a.effect&&a.effect.target;return a.playState==="running"&&t&&t.closest&&t.closest("#battleArea,#fxLayer")});
 A.forEach(a=>{try{a.pause()}catch(e){}});setTimeout(()=>A.forEach(a=>{try{if(a.playState==="paused")a.play()}catch(e){}}),ms)}
/* ---- flash de l'ennemi touché, flash rouge d'un dino blessé, image d'impact ---- */
function pulseCls(el,c,ms){if(!el)return;el.classList.remove(c);void el.offsetWidth;el.classList.add(c);setTimeout(()=>el.classList.remove(c),ms)}
let ifLast=[];
function impactFrame(){if(!jOn()||PREFS.flash===false)return;const now=performance.now();ifLast=ifLast.filter(t=>now-t<1000);if(ifLast.length>=3)return;ifLast.push(now);/* au plus 3 flashs par seconde (WCAG) */
 const st=document.querySelector("#battleArea .battlestage");if(st)pulseCls(st,"impactfr",fxd(55))}
/* ---- étincelles : un seul canvas en mélange additif, traînées qui suivent leur vitesse, gravité légère ---- */
let SPK=null,spkLast=0;
function spkInit(){if(SPK)return SPK;const c=document.createElement("canvas");c.id="sparkFx";document.body.appendChild(c);const g=c.getContext("2d");SPK={c,g,p:[],raf:0};
 const fit=()=>{const d=Math.min(2,devicePixelRatio||1);c.width=Math.round(innerWidth*d);c.height=Math.round(innerHeight*d);g.setTransform(d,0,0,d,0,0)};fit();addEventListener("resize",fit);return SPK}
function sparkBurst(x,y,col,n,pow){if(!jOn())return;const K=spkInit();for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(2+Math.random()*5.5)*(pow||1);K.p.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2.2,life:0,max:280+Math.random()*380,col,w:1.1+Math.random()*1.9})}
 if(K.p.length>600)K.p.splice(0,K.p.length-600);if(!K.raf)K.raf=requestAnimationFrame(spkStep)}
function spkStep(t){const K=SPK,g=K.g,dt=spkLast?Math.min(40,t-spkLast):16,k=dt/16*FX_SPEED;spkLast=t;g.clearRect(0,0,innerWidth,innerHeight);g.globalCompositeOperation="lighter";g.lineCap="round";
 K.p=K.p.filter(q=>{q.life+=dt*FX_SPEED;if(q.life>=q.max||!PREFS.anim)return false;q.vy+=.17*k;q.vx*=.985;q.x+=q.vx*k;q.y+=q.vy*k;g.globalAlpha=1-q.life/q.max;g.strokeStyle=q.col;g.lineWidth=q.w;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x-q.vx*2.4,q.y-q.vy*2.4);g.stroke();return true});
 g.globalAlpha=1;if(K.p.length)K.raf=requestAnimationFrame(spkStep);else{K.raf=0;spkLast=0;g.clearRect(0,0,innerWidth,innerHeight)}}
const J={sup:false,kill:false};
const _fnJ=floatNum;floatNum=function(txt,x,y,cls,sub){_fnJ(txt,x,y,cls,sub);if(!jOn()||screen!=="battle")return;cls=cls||"";const dmg=/^-\d/.test(String(txt));
 if(/foe/.test(cls)){if(!dmg)return;addTrauma(.3);let best=null,bd=1e9;document.querySelectorAll("#battleArea .battlestage .sFig").forEach(f=>{const r=f.getBoundingClientRect(),d=Math.hypot(r.left+r.width/2-x,r.top+r.height/2-y);if(d<bd){bd=d;best=f}});pulseCls(best,"hurtfx",340);sparkBurst(x,y+16,"#ff5470",12,.8);return}
 if(!dmg)return;const big=/big|crit/.test(cls),crit=/crit/.test(cls),col=(fight&&ELC[fight.last])||"#ffe9a8";pulseCls(document.querySelector("#battleArea .battlestage .sEnemy"),"hitfx",300);
 if(J.sup){J.sup=false;J.kill=false;impactFrame();addTrauma(.72);hitStop(150);sfx("thud");sparkBurst(x,y+24,"#ffd15c",70,1.7);sparkBurst(x,y+24,col,40,1.2);return}
 if(J.kill){J.kill=false;impactFrame();addTrauma(.52);hitStop(170);sfx("thud");sparkBurst(x,y+24,col,55,1.5);return}
 addTrauma(.22+(big?.18:0)+(crit?.2:0));hitStop(crit?95:big?70:42);sparkBurst(x,y+24,col,crit?44:big?30:20,crit?1.35:1.05)};
const _keJ=killEnemy;killEnemy=function(){J.kill=true;return _keJ.apply(this,arguments)};
/* ---- coupure de super attaque (Dokkan) : bandes noires, bandeau incliné, lignes de vitesse, portrait du dino de tête ---- */
const SUPER_NAME={redorb:"Brasier primordial",blueorb:"Raz-de-marée abyssal",greenorb:"Sève ancestrale",purpleorb:"Orage fossile",goldorb:"Aube solaire"};
let CUT=null;
const cutinOK=()=>jOn()&&PREFS.cutin!==false&&!(navigator.webdriver&&!window.__forceCutin)&&screen==="battle"&&fight&&!fight.over&&fight.sp>=100;
function cutinEnd(){if(!CUT)return;const c=CUT;CUT=null;clearTimeout(c.t);c.el.classList.add("out");setTimeout(()=>c.el.remove(),fxd(220));J.sup=true;c.go()}
const _spJ=special;special=function(){if(CUT)return;if(!cutinOK()){if(fight&&!fight.over&&fight.sp>=100)J.sup=jOn();return _spJ()}
 const t=S.team.slice(0,3),k=Math.max(0,t.findIndex((d,i)=>fight.hp[i]>0)),d=t[k]||t[0],s=sp(d),el=s.element,col=ELC[el]||"#ffd15c";
 const o=document.createElement("div");o.id="cutin";o.style.setProperty("--c",col);o.style.setProperty("--spd",FX_SPEED);
 o.innerHTML=`<i class="ciBar t"></i><i class="ciBar b"></i><div class="ciBand"><i class="ciLines"></i><div class="ciArt">${PREFS.art==="svg"?`<span class="pt">${portrait(d.type,true)}</span>`:`<span class="emo">${esc(s.e)}</span>`}</div><div class="ciTxt"><small>${esc(s.name)} · SUPER ATTAQUE</small><b>${esc(SUPER_NAME[el]||"Super attaque")}</b></div></div><div class="ciSkip">Clic ou Espace : passer</div>`;
 document.body.appendChild(o);sfx("cutin");o.addEventListener("pointerdown",e=>{e.preventDefault();cutinEnd()});
 CUT={el:o,go:()=>_spJ(),t:setTimeout(cutinEnd,fxd(1250))}};
/* pas d'autre action pendant la coupure ; Espace / Entrée / Échap la passent */
const _toJ=tapOrb;tapOrb=function(i){if(CUT)return;return _toJ(i)};
const _usJ=useSkill;useSkill=function(k){if(CUT)return;return _usJ(k)};
document.addEventListener("keydown",e=>{if(!CUT)return;if(e.key===" "||e.key==="Enter"||e.key==="Escape"){e.preventDefault();cutinEnd()}e.stopImmediatePropagation()},true);
const _goJ=go;go=function(s){if(CUT&&s!=="battle"){const c=CUT;CUT=null;clearTimeout(c.t);c.el.remove();c.go()}return _goJ(s)};
/* ---- parallaxe à la souris : décor de combat et bannières ---- */
let pxRaf=0,pxEv=null;
document.addEventListener("pointermove",e=>{if(!jOn()||e.pointerType==="touch")return;pxEv=e;if(!pxRaf)pxRaf=requestAnimationFrame(()=>{pxRaf=0;const ev=pxEv;
 document.querySelectorAll("#battleArea .battlestage,.screen.active .banner.hasScene").forEach(el=>{const r=el.getBoundingClientRect();if(!r.width)return;
  const x=Math.max(-1,Math.min(1,(ev.clientX-r.left)/r.width*2-1)),y=Math.max(-1,Math.min(1,(ev.clientY-r.top)/r.height*2-1));el.style.setProperty("--px",x.toFixed(3));el.style.setProperty("--py",y.toFixed(3))})})},{passive:true});
/* ---- invocation : la couleur arrive avant l'identité, et peut monter d'un cran pendant l'incantation ---- */
const _sgJ=showGacha;showGacha=function(got,news,title){_sgJ(got,news,title);if(!jOn())return;const L=$$("gfxLayer"),c=L&&L.querySelector(".circle");if(!c)return;
 const best=Math.min(3,got.reduce((m,d)=>Math.max(m,RAR5.indexOf(sp(d).r)),0));if(best<2||Math.random()>(best===3?.4:.3))return;
 c.style.setProperty("--c",GCOL[best-1]);c.classList.add("tease");const intro=best===3?1700:1300;
 gTimers.push(setTimeout(()=>{if(!L.isConnected||L.dataset.rv)return;c.style.setProperty("--c",GCOL[best]);c.classList.remove("tease");pulseCls(c,"upgrade",900);
  const fl=document.createElement("div");fl.className="gflash";fl.style.background=GCOL[best];L.appendChild(fl);gTimers.push(setTimeout(()=>fl.remove(),420));
  if(PREFS.shake!==false){document.body.classList.remove("bigshake");void document.body.offsetWidth;document.body.classList.add("bigshake");gTimers.push(setTimeout(()=>document.body.classList.remove("bigshake"),500))}sfx("legend")},intro*.55))};
/* ---- cadres légendaires holographiques : le reflet suit la souris ---- */
document.addEventListener("pointermove",e=>{const c=e.target.closest&&e.target.closest(".dcard.rar-l,.gc.gl-l");if(!c)return;const r=c.getBoundingClientRect();
 c.style.setProperty("--hx",((e.clientX-r.left)/r.width*100).toFixed(1)+"%");c.style.setProperty("--hy",((e.clientY-r.top)/r.height*100).toFixed(1)+"%")},{passive:true});
/* ---- réglages : secousses, flashs, animation de super attaque ---- */
const _srJ=setRender;setRender=function(){_srJ();const box=$$("setBody");if(!box)return;const af=[...box.querySelectorAll(".panel")].find(p=>(p.querySelector("b")||{}).textContent==="Affichage");if(!af||af.querySelector("#jxOpts"))return;
 const row=(k,l,d)=>`<div class="row" style="padding:6px 0"><div class="grow"><b>${l}</b><div class="muted tiny">${d}</div></div><button class="${PREFS[k]?"":"secondary"}" style="min-width:70px" onclick="setPref('${k}',${!PREFS[k]})">${PREFS[k]?"OUI":"NON"}</button></div>`;
 af.insertAdjacentHTML("beforeend",`<div id="jxOpts">${row("shake","Secousses d'écran","Impacts, critiques, super attaque")}${row("flash","Flashs d'impact","Images d'impact (au plus 3 par seconde)")}${row("cutin","Animation de super attaque","Portrait et nom de l'attaque avant le coup")}</div>`)};
if(typeof GUIDE!=="undefined")GUIDE.push(["Sensations de combat","Les gros coups figent l'action un instant et secouent l'écran ; la super attaque montre le dino de tête et le nom de l'attaque (clic ou Espace pour passer). Réglages > Affichage : secousses, flashs et animation de super attaque désactivables."]);
