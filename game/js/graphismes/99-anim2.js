/* Animations II (0.39) : zoom sur les critiques, traînées de charge, particules d'élément, recul selon la force du coup,
   désintégration des ennemis vaincus, entrée de l'équipe, pose de victoire, repli au camp après une défaite, orbes qui
   éclatent, chute d'orbes avec rebond, lumière des orbes boostées, nombres colorés et empilés, « CRITIQUE ! » façon BD,
   transition de vague, soins (feuilles), bouclier (dôme hexagonal), poison (bulles), rugissement des boss, ralenti du coup
   final d'un boss, éclosion et mutation au Nid, silhouette d'évolution, intensité réglable (faible / normale / forte) et
   réduction automatique si l'ordinateur ralentit. Tout est visuel : rien ne change dans le combat.
   Réglages : PREFS.fxLv (0 faible, 1 normale, 2 forte), PREFS.fxAuto (réduction automatique). */
if(PREFS.fxLv===undefined)PREFS.fxLv=matchMedia("(prefers-reduced-motion: reduce)").matches?0:1;
if(PREFS.fxAuto===undefined)PREFS.fxAuto=true;
const a2Lv=()=>PREFS.anim?(PREFS.fxLv>=0&&PREFS.fxLv<=2?PREFS.fxLv:1):-1;
const a2On=(m)=>a2Lv()>=(m||0);
const A2EL={redorb:["#ff8a3c","#ffd15c","•"],blueorb:["#5fb8ff","#bfe6ff","💧"],greenorb:["#7dff9b","#3ccf6a","🍃"],purpleorb:["#bd8aff","#fff3a0","⚡"],goldorb:["#ffd15c","#fff","✨"]};
const a2Stage=()=>document.querySelector("#battleArea .battlestage");
function a2Div(cls,x,y,html,ms){const d=document.createElement("div");d.className=cls;d.style.left=x+"px";d.style.top=y+"px";if(html)d.innerHTML=html;fxAdd(d,ms||900);return d}
function a2Anim(el,kf,ms,id,o){if(!el||!el.animate)return null;try{const a=el.animate(kf,Object.assign({duration:fxd(ms),easing:"ease-out"},o||{}));a.id=id||"a2";return a}catch(e){return null}}
const a2N=n=>Math.max(1,Math.round(n*[.4,1,1.7][Math.max(0,a2Lv())]));
/* ---- particules d'élément, nombres colorés et empilés, « CRITIQUE ! », zoom, recul ---- */
let a2Stack=[];
function a2Parts(x,y,el,n){const E=A2EL[el]||A2EL.goldorb;for(let i=0;i<a2N(n);i++){const a=Math.random()*Math.PI*2,r=30+Math.random()*60,p=a2Div("a2pt",x,y,E[2]==="•"?"":E[2],800);p.style.setProperty("--c",E[i%2]);
  if(E[2]==="•")p.classList.add("dot");a2Anim(p,[{translate:"0 0",opacity:1,scale:1},{translate:`${Math.cos(a)*r}px ${Math.sin(a)*r-30}px`,opacity:0,scale:.4}],700+Math.random()*300,"a2pt")}}
const _fnA2=floatNum;floatNum=function(txt,x,y,cls,sub){_fnA2(txt,x,y,cls,sub);try{if(!a2On()||screen!=="battle"||!fight)return;cls=cls||"";const s=String(txt),dmg=/^-\d/.test(s),L=$$("fxLayer"),d=L&&[...L.querySelectorAll(".dmgnum")].pop();
  if(/foe/.test(cls)||!dmg)return;const el=fight.last||"goldorb",now=performance.now();a2Stack=a2Stack.filter(t=>now-t<650);const k=a2Stack.length;a2Stack.push(now);
  if(d&&d.classList.contains("dmgnum")){d.classList.add("a2el-"+el.replace("orb",""));if(k)d.style.top=(y-22*Math.min(4,k))+"px"}
  const crit=/crit/.test(cls),big=/big/.test(cls);if(a2On(1))a2Parts(x,y+20,el,crit?14:big?10:7);
  if(crit){a2Div("a2crit",x,y-40,"CRITIQUE !",900);const st=a2Stage();if(st&&a2On(1)){const r=st.getBoundingClientRect();st.style.transformOrigin=`${Math.round(x-r.left)}px ${Math.round(y-r.top)}px`;a2Anim(st,[{scale:1},{scale:1.07,offset:.3},{scale:1}],420,"a2zoom")}}
  const e=fight.enemies&&fight.enemies[fight.wave],v=+s.replace(/[^\d]/g,"")||0,q=e&&e.max?Math.min(1,v/e.max*4):.2,art=document.querySelector("#battleArea .sEnemy .sEart");
  a2Anim(art,[{translate:"0 0",rotate:"0deg"},{translate:`${Math.round(6+28*q)}px 0`,rotate:`${(3+9*q).toFixed(1)}deg`,offset:.25},{translate:`${Math.round(-3*q)}px 0`,rotate:`${(-2*q).toFixed(1)}deg`,offset:.6},{translate:"0 0",rotate:"0deg"}],360+300*q,"a2kb")}catch(x){}};
/* ---- orbes : éclats, lumière des orbes boostées, traînée du dino qui charge ---- */
const _toA2=tapOrb;tapOrb=function(i){const f=fight;let info=null;try{if(f&&!f.over&&a2On()&&screen==="battle"){const o=document.querySelectorAll("#battleArea .orbboard .orb")[i],c=f.orbs&&f.orbs[i];if(o&&c){const r=o.getBoundingClientRect();info={x:r.left+r.width/2,y:r.top+r.height/2,c,n:f.orbs.filter(x=>x===c).length}}}}catch(e){}
 const res=_toA2(i);try{if(info&&!(typeof CUT!=="undefined"&&CUT)){const col=ELC[info.c]||"#fff";
  if(a2On(1))for(let j=0;j<a2N(7);j++){const a=j/7*Math.PI*2+Math.random()*.5,r=26+Math.random()*30,s=a2Div("a2shard",info.x,info.y,"",600);s.style.setProperty("--c",col);a2Anim(s,[{translate:"0 0",rotate:"0deg",opacity:1},{translate:`${Math.cos(a)*r}px ${Math.sin(a)*r}px`,rotate:`${rnd(360)}deg`,opacity:0}],520,"a2shard")}
  if(info.n>=2){const b=a2Div("a2boost",info.x,info.y,"",700);b.style.setProperty("--c",col);b.style.setProperty("--s",Math.min(3,1+info.n*.25))}
  if(a2On(1))document.querySelectorAll("#battleArea .sTeam .sFig").forEach(fg=>{const k=+fg.dataset.k,d=S.team[k];if(!d||!f.hp||f.hp[k]<=0||sp(d).element!==info.c)return;fg.classList.add("a2trail");setTimeout(()=>fg.classList.remove("a2trail"),fxd(420));
   a2Anim(fg.querySelector(".sfa"),[{translate:"0 0"},{translate:"26px -6px",offset:.35},{translate:"0 0"}],420,"a2dash")})}}catch(e){}return res};
/* ---- ennemi vaincu : désintégration ; coup final d'un boss : ralenti ---- */
function a2Slow(ms){const A=document.getAnimations().filter(a=>{const t=a.effect&&a.effect.target;return a.playState==="running"&&t&&t.closest&&t.closest("#battleArea,#fxLayer")});A.forEach(a=>{try{a.playbackRate=.3}catch(e){}});
 const st=a2Stage();if(st)st.classList.add("a2slow");setTimeout(()=>{A.forEach(a=>{try{a.playbackRate=1}catch(e){}});const s=a2Stage();if(s)s.classList.remove("a2slow")},fxd(ms))}
const _keA2=killEnemy;killEnemy=function(){const f=fight;let R=null,e=null,last=false;try{if(f&&a2On()&&screen==="battle"){e=f.enemies[f.wave];last=f.wave>=f.enemies.length-1;const a=document.querySelector("#battleArea .sEnemy .sEart");if(a)R=a.getBoundingClientRect()}}catch(x){}
 const res=_keA2.apply(this,arguments);try{if(R&&e&&f.over!=="win"){const col=ELC[e.el]||"#ff647b";for(let j=0;j<a2N(22);j++){const px=a2Div("a2px",R.left+R.width*(.2+Math.random()*.6),R.top+R.height*(.2+Math.random()*.6),"",1100);px.style.setProperty("--c",j%3?col:"#fff");
   a2Anim(px,[{translate:"0 0",opacity:1},{translate:`${Math.round((Math.random()-.3)*90)}px ${Math.round(-40-Math.random()*90)}px`,opacity:0}],800+Math.random()*400,"a2px",{delay:fxd(j*14)})}
  if(e.boss&&last){a2Slow(750);a2Div("a2fin",R.left+R.width/2,R.top+R.height/2,"",900)}}}catch(x){}return res};
function a2Rect(){const a=document.querySelector("#battleArea .sEnemy .sEart");return a?a.getBoundingClientRect():null}
const _wnA2=win;win=function(){const f=fight;let R=null,e=null;try{if(f&&!f.a2Ko&&a2On()&&screen==="battle"){e=f.enemies[f.wave];R=a2Rect()}}catch(x){}const res=_wnA2.apply(this,arguments);
 try{if(R&&e&&f.over==="win"){f.a2Ko=1;const col=ELC[e.el]||"#ff647b";for(let j=0;j<a2N(22);j++){const px=a2Div("a2px",R.left+R.width*(.2+Math.random()*.6),R.top+R.height*(.2+Math.random()*.6),"",1100);px.style.setProperty("--c",j%3?col:"#fff");
  a2Anim(px,[{translate:"0 0",opacity:1},{translate:`${Math.round((Math.random()-.3)*90)}px ${Math.round(-40-Math.random()*90)}px`,opacity:0}],800+Math.random()*400,"a2px",{delay:fxd(j*14)})}
  if(e.boss){a2Slow(750);a2Div("a2fin",R.left+R.width/2,R.top+R.height/2,"",900)}}}catch(x){}return res};
/* un effet posé dans la scène est reconstruit à chaque rendu : on le reprend là où il en était */
function a2Keep(f,k,ms,fn){const t=performance.now(),T=f["a2t_"+k];if(T===undefined||t-T>fxd(ms))return;const L=fn()||[];L.forEach(a=>{if(a)try{a.currentTime=t-T}catch(e){}})}
function a2Fx(cls,ms){const st=a2Stage();if(!st)return;const R=st.getBoundingClientRect(),d=document.createElement("div");d.className=cls;Object.assign(d.style,{left:R.left+"px",top:R.top+"px",width:R.width+"px",height:R.height+"px"});fxAdd(d,fxd(ms));return d}
/* ---- au rendu : entrée, vague, rugissement, soins, bouclier, poison, victoire, défaite ---- */
const _rbA2=renderBattle;renderBattle=function(){_rbA2();try{const f=fight,st=a2Stage();if(!f||!st||!f.enemies)return;
 const tm=st.querySelector(".sTeam");if(tm)tm.classList.toggle("a2dome",!!(f.guard||(f.shield>0))&&!f.over);
 st.querySelectorAll(".sTeam .sFig").forEach(fg=>{const k=+fg.dataset.k,on=!!(f.pz&&f.pz[k]>0&&f.hp[k]>0);let b=fg.querySelector(".a2bub");if(on&&!b)fg.insertAdjacentHTML("beforeend",'<i class="a2bub"><b></b><b></b><b></b></i>');else if(!on&&b)b.remove()});
 if(!a2On())return;
 if(f.a2t_in===undefined&&!f.over)f.a2t_in=performance.now();
 a2Keep(f,"in",900,()=>[...[...st.querySelectorAll(".sTeam .sfa")].map((a,j)=>a2Anim(a,[{translate:"-160px 0",opacity:0},{translate:"-40px -26px",opacity:1,offset:.6},{translate:"0 0"}],560,"a2in",{delay:fxd(j*110),fill:"backwards"})),
  a2Anim(st.querySelector(".sEnemy .sEart"),[{translate:"140px 0",opacity:0},{translate:"0 0",opacity:1}],520,"a2in",{delay:fxd(200),fill:"backwards"})]);
 if(f.a2W!==undefined&&f.a2W!==f.wave&&!f.over)a2Fx("a2sweep",800);
 f.a2W=f.wave;const e=f.enemies[f.wave];
 if(e&&e.boss&&f.a2Roar!==f.wave&&!f.over&&e.hp>0){f.a2Roar=f.wave;a2Fx("a2roar",1000);if(typeof addTrauma==="function")addTrauma(.55);try{tone(70,.5,"sawtooth",.18,0,40)}catch(x){}}
 const H=f.hp.slice();if(f.a2hp&&a2On(1))H.forEach((h,k)=>{if(h>(f.a2hp[k]||0)&&(f.a2hp[k]||0)>0){const fg=st.querySelector(`.sTeam .sFig[data-k="${k}"]`);if(!fg)return;const R=fg.getBoundingClientRect();
  for(let j=0;j<a2N(6);j++){const l=a2Div("a2leaf",R.left+R.width/2,R.top+R.height*.6,"🍃",1100);l.style.setProperty("--a",(j*60)+"deg");l.style.animationDelay=fxd(j*60)+"ms"}}});f.a2hp=H;
 if(f.over==="win"){const a=st.querySelector(".sTeam .sFig:not(.dead)");if(a)a.classList.add("a2pose");if(!f.a2End){f.a2End=1;const R=st.getBoundingClientRect();if(typeof sparkBurst==="function")sparkBurst(R.left+R.width*.3,R.top+R.height*.4,"#ffd15c",30,1.2)}}
 if(f.over==="lose"){if(!f.a2End)f.a2End=performance.now();if(!st.querySelector(".a2camp")){const c=document.createElement("div");c.className="a2camp";c.style.animationDelay=-Math.min(5000,performance.now()-f.a2End)+"ms";c.innerHTML="🏕️ La meute se replie… et se relève au camp.";st.appendChild(c)}}}catch(x){}};
/* ---- Nid : éclosion plus longue (fissures, lumière), mutation (ADN qui tourne) ---- */
function a2Hatch(d,mut){if(!a2On()||!d)return;const o=document.createElement("div");o.id="a2hatch";o.innerHTML=`<div class="a2egg"><i class="a2crk"></i><i class="a2crk b"></i><i class="a2glow"></i></div>${mut?'<div class="a2dna">🧬</div>':""}<div class="a2htx">${mut?"Une mutation !":"Ça éclot…"}</div>`;
 o.style.setProperty("--spd",FX_SPEED);document.body.appendChild(o);const end=()=>{o.classList.add("out");setTimeout(()=>o.remove(),fxd(300))};o.addEventListener("pointerdown",end);setTimeout(end,fxd(mut?2200:1700))}
const _nhA2=nestHatch;nestHatch=function(i){let mut=false;try{const e=S.nest.slots[i];mut=!!(e&&e.mut)}catch(x){}const n0=S.team.length;const r=_nhA2(i);try{if(S.team.length>n0)a2Hatch(S.team[S.team.length-1],mut)}catch(x){}return r};
/* ---- évolution : la silhouette grandit avant d'être révélée ---- */
const _efA2=evoFx;evoFx=function(a,b){_efA2(a,b);try{const o=document.getElementById("evoFx");if(o&&a2On())o.classList.add("a2sil")}catch(x){}};
/* ---- intensité : particules et secousses selon le réglage (enveloppes posées quand tous les scripts sont chargés) ---- */
function a2Late(){if(typeof sparkBurst==="function"&&!sparkBurst.a2){sparkBurst.a2=1}
 if(typeof addTrauma==="function"&&!addTrauma.a2){addTrauma.a2=1}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",a2Late);else setTimeout(a2Late,0);
/* ---- réduction automatique : si le combat tourne sous 28 images/s pendant 2 mesures de suite, l'intensité passe à « faible » ---- */
const A2P={low:0,raf:0,n:0,t0:0};
function a2PerfFeed(fps){if(!PREFS.fxAuto||!(PREFS.fxLv>0))return false;if(fps<28)A2P.low++;else A2P.low=0;if(A2P.low>=2){A2P.low=0;PREFS.fxLv=0;savePrefs();toast("🐢 L'ordinateur ralentit : animations réduites (Réglages > Affichage).",3600);return true}return false}
function a2PerfStep(t){if(screen!=="battle"||!PREFS.anim){A2P.raf=0;A2P.t0=0;return}if(!A2P.t0){A2P.t0=t;A2P.n=0}A2P.n++;if(t-A2P.t0>=2000){if(!document.hidden)a2PerfFeed(A2P.n*1000/(t-A2P.t0));A2P.t0=t;A2P.n=0}A2P.raf=requestAnimationFrame(a2PerfStep)}
const _goA2=go;go=function(s){const r=_goA2(s);try{if(s==="battle"&&!A2P.raf&&!(navigator.webdriver&&!window.__forcePerf))A2P.raf=requestAnimationFrame(a2PerfStep)}catch(e){}return r};
/* ---- réglages ---- */
const _srA2=setRender;setRender=function(){_srA2();const box=$$("setBody");if(!box||box.querySelector("#a2Opts"))return;const af=[...box.querySelectorAll(".panel")].find(p=>(p.querySelector("b")||{}).textContent==="Affichage");if(!af)return;
 const lv=PREFS.fxLv;af.insertAdjacentHTML("beforeend",`<div id="a2Opts"><div class="row" style="padding:6px 0"><div class="grow"><b>Intensité des animations</b><div class="muted tiny">Particules, éclats, zoom et secousses du combat</div></div><div class="eltabs a2lv">${["Faible","Normale","Forte"].map((n,i)=>`<button class="${lv===i?"on":""}" onclick="setPref('fxLv',${i})">${n}</button>`).join("")}</div></div>
  <div class="row" style="padding:6px 0"><div class="grow"><b>Réduire si l'ordinateur ralentit</b><div class="muted tiny">Passe en « Faible » si le combat tourne sous 28 images par seconde</div></div><button class="${PREFS.fxAuto?"":"secondary"} a2auto" style="min-width:70px" onclick="setPref('fxAuto',${!PREFS.fxAuto})">${PREFS.fxAuto?"OUI":"NON"}</button></div></div>`)};
if(typeof GUIDE!=="undefined")GUIDE.push(["Animations du combat","Les orbes éclatent, les coups font reculer l'ennemi selon leur force, les critiques zooment, les ennemis vaincus se désintègrent et le coup final d'un boss passe au ralenti. Réglages > Affichage : intensité (faible, normale, forte) et réduction automatique si l'ordinateur ralentit."]);
