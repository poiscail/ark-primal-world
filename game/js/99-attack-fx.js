/* Animations d'attaque propres à chaque famille d'espèces (orbes et super attaque) et ripostes des ennemis selon la créature.
   Appelées par js/94-battle-anim.js (atkFx / foeFx) ; tous les délais passent par fxd() pour suivre la vitesse du combat. */
const FAMFX={T:"bite",C:"charge",A:"club",G:"spikes",F:"dive",S:"quake",H:"sonic",M:"jet"};
const FAMN={bite:"Morsure",charge:"Charge",club:"Coup de massue",spikes:"Pluie d'épines",dive:"Piqué",quake:"Séisme",sonic:"Cri sonique",jet:"Jet d'eau"};
const famOf=d=>{const c=PORT[d.type];return c?c[0]:"T"},atkKind=d=>FAMFX[famOf(d)]||"bite";
const later=(ms,fn)=>setTimeout(()=>{if(PREFS.anim)fn()},fxd(ms));
function ctrOf(el){const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,r}}
function fxNode(cls,x,y,css){const n=document.createElement("i");n.className=cls;n.style.cssText=`left:${x}px;top:${y}px;`+(css||"");return n}
function moveFig(el,kf,ms,delay){try{el.animate(kf,{duration:ms,delay:delay||0,easing:"cubic-bezier(.3,.1,.3,1)"})}catch(e){}}
function sparks(P,col,n,spread){const L=$$("fxLayer");if(!L)return;for(let i=0;i<n;i++){const a=Math.random()*6.283,d=(spread||40)*(.5+Math.random()),s=fxNode("part",P.x,P.y,`background:${col};color:${col};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-12}px`);fxAdd(s,700)}}
function jolt(E){if(E&&E.isConnected)try{E.animate([{transform:"none"},{transform:"translateX(9px)"},{transform:"translateX(-6px)"},{transform:"none"}],{duration:280})}catch(e){}}
const JAW_U="M6 40 Q50 2 94 40 L86 44 L80 35 L74 46 L67 36 L60 47 L53 38 L47 38 L40 47 L33 36 L26 46 L20 35 L14 44Z",JAW_L="M6 60 Q50 98 94 60 L86 56 L80 65 L74 54 L67 64 L60 53 L53 62 L47 62 L40 53 L33 64 L26 54 L20 65 L14 56Z";
function jawFx(B,col,big){const s=Math.min(big?170:140,B.w*(big?1:.85)),n=fxNode("jawfx",B.x-s/2,B.y-s/2,`width:${s}px;height:${s}px;filter:drop-shadow(0 0 6px ${col})`);
 n.innerHTML=`<svg viewBox="0 0 100 100"><g><path d="${JAW_U}" fill="#fff" stroke="${col}" stroke-width="3"/></g><g><path d="${JAW_L}" fill="#fff" stroke="${col}" stroke-width="3"/></g></svg>`;fxAdd(n,800);
 const [u,l]=n.querySelectorAll("g"),o={duration:430,easing:"cubic-bezier(.6,0,.9,.6)"};
 u.animate([{transform:"translateY(-28px)",opacity:0},{transform:"translateY(-20px)",opacity:1,offset:.25},{transform:"translateY(9px)",opacity:1,offset:.62},{transform:"translateY(9px)",opacity:0}],o);
 l.animate([{transform:"translateY(28px)",opacity:0},{transform:"translateY(20px)",opacity:1,offset:.25},{transform:"translateY(-9px)",opacity:1,offset:.62},{transform:"translateY(-9px)",opacity:0}],o)}
function impactStar(B,col){const s=Math.min(130,B.w*.8),n=fxNode("istar",B.x-B.w*.18,B.y,`width:${s}px;height:${s}px;margin:${-s/2}px 0 0 ${-s/2}px;background:radial-gradient(circle,#fff 0 22%,${col} 45%,transparent 72%)`);fxAdd(n,600)}
function speedLines(A,dx,dy,col){for(let i=0;i<4;i++){const n=fxNode("spdln",A.x,A.y-A.h*.3+i*A.h*.2,`width:${40+Math.random()*30}px;background:linear-gradient(90deg,transparent,${col})`);fxAdd(n,500);
 n.animate([{transform:"translateX(0) scaleX(.2)",opacity:0},{transform:`translateX(${dx*.4}px) scaleX(1)`,opacity:.9,offset:.4},{transform:`translateX(${dx*.75}px) scaleX(.4)`,opacity:0}],{duration:330,delay:i*25,easing:"ease-out",fill:"both"})}}
function swipeArc(B,col){const s=Math.min(160,B.w*1.05),n=fxNode("swipe",B.x,B.y,`width:${s}px;height:${s}px;margin:${-s/2}px 0 0 ${-s/2}px;border-top-color:${col};border-left-color:${col};filter:drop-shadow(0 0 8px ${col})`);fxAdd(n,600);
 n.animate([{transform:"rotate(-80deg) scale(.7)",opacity:0},{transform:"rotate(0deg) scale(1)",opacity:1,offset:.4},{transform:"rotate(90deg) scale(1.1)",opacity:0}],{duration:380,easing:"ease-out"})}
function spikeFx(A,B,col,i){const n=fxNode("spikefx",0,0,`background:linear-gradient(90deg,${col}00,${col} 45%,#fff);filter:drop-shadow(0 0 5px ${col})`);fxAdd(n,800);
 const x0=A.x,y0=A.y-A.h*.35,x1=B.x+(i-1)*14,y1=B.y+(i-1)*10,mx=(x0+x1)/2,my=Math.min(y0,y1)-50-i*16;
 const kf=[0,.25,.5,.75,1].map((t,j)=>{const x=(1-t)*(1-t)*x0+2*(1-t)*t*mx+t*t*x1,y=(1-t)*(1-t)*y0+2*(1-t)*t*my+t*t*y1,a=Math.atan2(2*(1-t)*(my-y0)+2*t*(y1-my),2*(1-t)*(mx-x0)+2*t*(x1-mx))*57.3;return{transform:`translate(${x}px,${y}px) rotate(${a}deg)`,opacity:j===4?.2:1}});
 n.animate(kf,{duration:360,easing:"linear",fill:"both"});later(360,()=>sparks({x:x1,y:y1},col,5,26))}
function shockwave(x0,y0,x1,y1,col,big){const n=fxNode("quakefx",0,0,`border-color:${col};box-shadow:0 0 14px ${col},inset 0 0 10px ${col}`);fxAdd(n,700);
 n.animate([{transform:`translate(${x0}px,${y0}px) scale(.3)`,opacity:1},{transform:`translate(${x1}px,${y1}px) scale(${big?2.4:1.6},1)`,opacity:.9,offset:.8},{transform:`translate(${x1}px,${y1}px) scale(${big?3:2.2},1.2)`,opacity:0}],{duration:430,easing:"ease-out",fill:"both"})}
function sonicWave(A,B,col){const x0=A.x+A.w*.3,y0=A.y-A.h*.25,a=Math.atan2(B.y-y0,B.x-x0)*57.3,n=fxNode("sonicfx",0,0,`border-right-color:${col};box-shadow:6px 0 10px -4px ${col}`);fxAdd(n,700);
 n.animate([{transform:`translate(${x0}px,${y0}px) rotate(${a}deg) scale(.4)`,opacity:1},{transform:`translate(${B.x}px,${B.y}px) rotate(${a}deg) scale(1.6)`,opacity:.1}],{duration:380,easing:"ease-out",fill:"both"})}
function beamFx(A,B,col,from){const x0=from?from.x:A.x+A.w*.3,y0=from?from.y:A.y-A.h*.1,len=Math.hypot(B.x-x0,B.y-y0),a=Math.atan2(B.y-y0,B.x-x0)*57.3,
 n=fxNode("jetfx",x0,y0,`width:${len}px;background:linear-gradient(90deg,${col}00,${col} 25%,#fff 60%,${col});box-shadow:0 0 14px ${col}`);fxAdd(n,700);
 n.animate([{transform:`rotate(${a}deg) scaleX(0)`,opacity:1},{transform:`rotate(${a}deg) scaleX(1)`,opacity:1,offset:.45},{transform:`rotate(${a}deg) scaleX(1)`,opacity:0}],{duration:420,easing:"ease-out",fill:"both"})}
/* lancement d'une compétence : aura et étincelles autour du dino qui la lance */
function castFx(el,d){if(!PREFS.anim||!el||!d)return;const col=ELC[sp(d).element]||"#fff",A=ctrOf(el);ring(A.x,A.y,col);
 for(let i=0;i<6;i++){const s=fxNode("part",A.x+(Math.random()-.5)*A.w*.6,A.y+A.h*.2,`background:${col};color:${col};--dx:${(Math.random()-.5)*20}px;--dy:${-40-Math.random()*40}px`);fxAdd(s,700)}
 try{el.animate([{filter:"none",transform:"none"},{filter:"brightness(1.8) drop-shadow(0 0 10px "+col+")",transform:"scale(1.12)",offset:.35},{filter:"none",transform:"none"}],{duration:520,easing:"ease-out"})}catch(e){}}
/* attaques alliées par famille : el = figurine sur la scène, A/B = centres (allié/ennemi) */
const ATK={
 bite(el,E,A,B,dx,dy,col,dl){moveFig(el,[{transform:"none"},{transform:`translate(${dx*.38}px,${dy*.38-12}px) scale(1.16)`,offset:.45},{transform:"none"}],460,dl);later(dl+260,()=>{jawFx(B,col);later(250,()=>sparks(B,col,6,34))})},
 charge(el,E,A,B,dx,dy,col,dl){moveFig(el,[{transform:"none"},{transform:"translate(-10px,0) scale(.94,1.06)",offset:.18},{transform:`translate(${dx*.78}px,${dy*.78}px) scale(1.08)`,offset:.52},{transform:`translate(${dx*.68}px,${dy*.68}px)`,offset:.66},{transform:"none"}],580,dl);
  later(dl+110,()=>speedLines(A,dx,dy,col));later(dl+300,()=>{impactStar(B,col);ring(B.x-B.w*.2,B.y,col);jolt(E)})},
 club(el,E,A,B,dx,dy,col,dl){moveFig(el,[{transform:"none"},{transform:`translate(${dx*.24}px,${dy*.24}px) rotate(-14deg)`,offset:.4},{transform:`translate(${dx*.3}px,${dy*.3}px) rotate(12deg)`,offset:.62},{transform:"none"}],540,dl);
  later(dl+220,()=>swipeArc(B,col));later(dl+330,()=>{ring(B.x,B.y,col);sparks(B,"#c9b48a",8,44);jolt(E)})},
 spikes(el,E,A,B,dx,dy,col,dl){moveFig(el,[{transform:"none"},{transform:"translateY(-10px) scale(1.07)",offset:.35},{transform:"none"}],420,dl);[0,1,2].forEach(i=>later(dl+40+i*85,()=>spikeFx(A,B,col,i)))},
 dive(el,E,A,B,dx,dy,col,dl){moveFig(el,[{transform:"none"},{transform:"translate(-8px,-58px) rotate(-18deg)",offset:.32},{transform:`translate(${dx*.82}px,${dy*.82}px) rotate(22deg)`,offset:.6},{transform:`translate(${dx*.55}px,${dy*.55-34}px) rotate(-10deg)`,offset:.78},{transform:"none"}],640,dl);
  later(dl+385,()=>{if(typeof fxSlash==="function")fxSlash(B.r,2,col,true);ring(B.x,B.y,col)})},
 quake(el,E,A,B,dx,dy,col,dl){moveFig(el,[{transform:"none"},{transform:"translateY(-30px) scale(1.04,.96)",offset:.38},{transform:"translateY(4px) scale(1.14,.84)",offset:.55},{transform:"none"}],520,dl);
  later(dl+285,()=>shockwave(A.x,A.y+A.h*.42,B.x,B.y+B.h*.38,col));later(dl+440,()=>{sparks({x:B.x,y:B.y+B.h*.35},"#c9b48a",10,46);jolt(E)})},
 sonic(el,E,A,B,dx,dy,col,dl){moveFig(el,[{transform:"none"},{transform:"rotate(-9deg) scale(1.08)",offset:.3},{transform:"rotate(-9deg) scale(1.08)",offset:.7},{transform:"none"}],560,dl);[0,1,2].forEach(i=>later(dl+70+i*95,()=>sonicWave(A,B,col)));later(dl+430,()=>jolt(E))},
 jet(el,E,A,B,dx,dy,col,dl){moveFig(el,[{transform:"none"},{transform:`translate(${dx*.08}px,${dy*.08}px) scale(1.06)`,offset:.3},{transform:"none"}],480,dl);later(dl+110,()=>beamFx(A,B,col));later(dl+300,()=>sparks(B,"#bfe8ff",9,40))}};
function atkFx(el,E,d,k){if(!PREFS.anim||!el||!E||!el.classList.contains("sFig"))return false;const kind=atkKind(d),col=ELC[sp(d).element]||"#fff",A=ctrOf(el),B=ctrOf(E);
 (ATK[kind]||ATK.bite)(el,E,A,B,B.x-A.x,B.y-A.y,col,k*70);return true}
/* ripostes ennemies selon la créature (js/99-bestiary.js) ; attaque de zone : onde de choc sur toute l'équipe */
const FOE_STYLE={wyvern:"breath",salamander:"breath",void:"orb",eye:"beam",crystal:"orb",skull:"orb",kraken:"orb",golem:"rock",croc:"bite",wolf:"bite",snake:"bite",boar:"bite"};
function foeFx(E,R,hurt,f){if(!PREFS.anim||!E||!E.isConnected||!f||!f.enemies)return;const e=f.enemies[f.wave];if(!e)return;const L=typeof enemyLook==="function"?enemyLook(e,f):null,
 style=L?(L.k?FOE_STYLE[L.k]||"claw":"bite"):"claw",col=ELC[e.el]||"#ff647b",B=ctrOf(E),tg=hurt.map(h=>R[h.k]).filter(Boolean);if(!tg.length)return;
 if(tg.length>1){const g=ctrOf(tg[0]);shockwave(B.x,B.y+B.h*.38,g.x-40,g.y+g.h*.4,col,true)}
 tg.forEach((el,i)=>{const A=ctrOf(el);switch(style){
  case"breath":for(let j=0;j<4;j++)projectile(E,el,j%2?"#ffb02e":col,i*60+j*45);break;
  case"orb":projectile(E,el,col,i*70);break;
  case"rock":projectile(E,el,"#8d8996",i*70);later(i*70+400,()=>sparks(A,"#8d8996",6,26));break;
  case"beam":later(i*70,()=>beamFx(null,A,col,{x:B.x-B.w*.1,y:B.y-B.h*.05}));break;
  case"bite":later(i*70+60,()=>jawFx(A,L&&L.cor?"#ff3bd4":"#ff3b5c",false));break;
  default:later(i*70+60,()=>{if(typeof fxSlash==="function")fxSlash(A.r,3,"#ff3b5c",false)})}})}
/* couper les animations efface aussi les effets encore à l'écran */
const _apAF=applyPrefs;applyPrefs=function(){_apAF();if(!PREFS.anim){const L=$$("fxLayer");if(L)L.innerHTML=""}};
