/* Animations de combat : projectiles, chiffres flottants, barres de PV avec traînée, bannières, écran de résultat, ambiance */
const ELC={redorb:"#ff647b",blueorb:"#5fb8ff",greenorb:"#7dff9b",purpleorb:"#bd8aff",goldorb:"#ffd15c"};
const BQ={dmg:null,hurt:[],atk:false};
/* vitesse des animations de combat (×1/×2/×3, réglée par js/99-auto.js) : les délais d'enchaînement passent par fxd() */
let FX_SPEED=1;const fxd=ms=>ms/FX_SPEED;
function vib(p){try{if(PREFS.vib!==false&&navigator.vibrate)navigator.vibrate(p)}catch(e){}}
function fxAdd(el,ms){const L=$$("fxLayer");if(!L)return;L.appendChild(el);setTimeout(()=>el.remove(),ms)}
function floatNum(txt,x,y,cls,sub){if(!PREFS.anim)return;const d=document.createElement("div");d.className="dmgnum "+(cls||"");d.style.left=x+"px";d.style.top=y+"px";d.innerHTML=txt+(sub?`<small>${sub}</small>`:"");fxAdd(d,1100);d.animate([{transform:"translate(-50%,0) scale(.4)",opacity:0},{transform:"translate(-50%,-14px) scale(1.25)",opacity:1,offset:.2},{transform:"translate(-50%,-34px) scale(1)",opacity:1,offset:.6},{transform:"translate(-50%,-64px) scale(.9)",opacity:0}],{duration:1050,easing:"ease-out"})}
function banner(t,sub,cls){if(!PREFS.anim)return;const d=document.createElement("div");d.className="wavebn "+(cls||"");d.innerHTML=`<b>${t}</b>${sub?`<small>${sub}</small>`:""}`;fxAdd(d,1900)}
function projectile(from,to,col,delay){if(!PREFS.anim||!from||!to)return;const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),p=document.createElement("i");p.className="proj";p.style.background=`radial-gradient(circle,#fff 0 25%,${col} 55%,transparent 72%)`;p.style.boxShadow=`0 0 14px 4px ${col}`;fxAdd(p,900);
 const x0=a.left+a.width/2,y0=a.top+a.height/2,x1=b.left+b.width/2,y1=b.top+b.height/2;
 p.animate([{transform:`translate(${x0-9}px,${y0-9}px) scale(.6)`,opacity:0},{transform:`translate(${x0-9}px,${y0-9}px) scale(1.2)`,opacity:1,offset:.15},{transform:`translate(${x1-9}px,${y1-9}px) scale(1)`,opacity:1,offset:.9},{transform:`translate(${x1-9}px,${y1-9}px) scale(2.4)`,opacity:0}],{duration:420,delay:delay||0,easing:"cubic-bezier(.4,0,.8,.6)",fill:"both"})}
/* collecte des événements (avant le rendu) */
const _aa94=afterAction;afterAction=function(dmg,msg,endTurn){const f=fight;if(f&&!f.over){const e=f.enemies[f.wave];BQ.dmg={v:dmg,msg,adv:f.last&&endTurn&&BEAT[f.last]===e.el,big:dmg>=e.max*.22};BQ.atk=true}return _aa94(dmg,msg,endTurn)};
const _us94=useSkill;useSkill=function(k){BQ.sk=k;try{return _us94(k)}finally{BQ.sk=undefined}};
const _hd94=hitDino;hitDino=function(k,raw,e){const b=fight.hp[k];_hd94(k,raw,e);const d=b-fight.hp[k];if(d>0)BQ.hurt.push({k,d})};
/* rendu */
function stageZone(z){return/jungle/i.test(z)?"jungle":/ruine/i.test(z)?"ruines":/volcan/i.test(z)?"volcan":/ob[ée]lisque/i.test(z)?"obelisque":"neutre"}
const _rb94=renderBattle;renderBattle=function(){_rb94();const f=fight;if(!f||!f.mx)return;const box=$$("battleArea"),first=box.querySelector(".panel");
 if(typeof stageBuild==="function")stageBuild();if(typeof orbGlass==="function")orbGlass();
 const eIcon=box.querySelector(".bigicon.hit"),rows=box.querySelector(".sFig")?[...box.querySelectorAll(".sFig")]:[...box.querySelectorAll(".row .bigicon:not(.hit)")];
 /* barres animées */
 const bars=[...box.querySelectorAll(".progress:not(.gauge)")],now=bars.map(b=>b.firstElementChild?parseFloat(b.firstElementChild.style.width)||0:0),pv=f._pv,late=BQ.atk&&BQ.hurt.length?480:0;let delay=BQ.atk?340:BQ.hurt.length?120:0;
 if(PREFS.anim&&pv&&pv.v.length===now.length){now.forEach((n,i)=>{let p=pv.v[i];if(i===0&&pv.w!==f.wave)p=n;if(Math.abs(p-n)<.5)return;const bar=bars[i],fill=bar.firstElementChild,dl=i>0&&late?late+260:delay;bar.classList.add("hasTrail");
  if(p>n){const t=document.createElement("u");t.className="trail";t.style.width=p+"%";bar.insertBefore(t,fill);setTimeout(()=>{t.style.width=n+"%"},fxd(dl+380))}
  fill.style.transition="none";fill.style.width=p+"%";void fill.offsetWidth;setTimeout(()=>{fill.style.transition="";fill.style.width=n+"%"},fxd(dl+30))})}
 f._pv={v:now,w:f.wave};f._hlate=late?fxd(late+260):0;
 const live=()=>document.querySelector("#battleArea .bigicon.hit")||eIcon,figs=()=>document.querySelector("#battleArea .sFig")?[...document.querySelectorAll("#battleArea .sFig")]:[...document.querySelectorAll("#battleArea .row .bigicon:not(.hit)")];
 /* attaque alliée */
 if(BQ.atk&&BQ.dmg&&eIcon&&PREFS.anim){const q=BQ.dmg,t=S.team.slice(0,3);if(BQ.sk!==undefined){if(typeof castFx==="function")castFx(rows[BQ.sk],t[BQ.sk])}else rows.forEach((el,k)=>{if(!t[k]||f.hp[k]<=0)return;if(typeof atkFx==="function"&&atkFx(el,eIcon,t[k],k))return;el.classList.add("lunge");el.style.animationDelay=k*60+"ms";projectile(el,eIcon,ELC[sp(t[k]).element]||"#fff",k*60)});
  const r=eIcon.getBoundingClientRect(),crit=/CRITIQUE/.test(q.msg),cb=(q.msg.match(/combo x(\d+)/)||[])[1];
  if(q.v>0)setTimeout(()=>{const R=live().getBoundingClientRect();floatNum("-"+q.v,R.left+R.width/2,R.top+R.height*.3,(q.big||crit?"big ":"")+(crit?"crit":""),(q.adv?"EFFICACE !":"")+(crit?" CRITIQUE !":"")+(cb&&!q.adv&&!crit?"COMBO ×"+cb:""));ring(R.left+R.width/2,R.top+R.height/2,"#fff");vib(q.big||crit?[25,30,40]:18)},fxd(380+rows.length*40));
  else if(/absorbé/.test(q.msg))setTimeout(()=>{const R=live().getBoundingClientRect();floatNum("🛡️",R.left+R.width/2,R.top+R.height*.3,"","ABSORBÉ")},fxd(380+rows.length*40))}
 /* attaque ennemie */
 if(BQ.hurt.length&&PREFS.anim){const hurt=BQ.hurt.slice();setTimeout(()=>{const E=live(),R=figs();if(E&&E.isConnected){E.classList.remove("elunge");void E.offsetWidth;E.classList.add("elunge")}
  const d=document.createElement("div");d.className="hurtflash";fxAdd(d,600);if(typeof foeFx==="function")foeFx(E,R,hurt,f);
  hurt.forEach(({k,d:dm},j)=>{const el=R[k];if(!el)return;el.classList.remove("shk");void el.offsetWidth;el.classList.add("shk");setTimeout(()=>{const X=(figs()[k]||el).getBoundingClientRect();floatNum("-"+dm,X.left+X.width/2,X.top+4,"foe")},fxd(220+j*90))});vib([40,40,60])},fxd(late))}
 else if(BQ.hurt.length)vib([40,40,60]);
 BQ.atk=false;BQ.dmg=null;BQ.hurt=[];
 /* bannières de vague / boss / rage */
 const e=f.enemies[f.wave];
 if(!f.over){if(f._lw!==f.wave){const first=f._lw===undefined;f._lw=f.wave;if(e.boss&&f.wave===2){banner("⚠ ALERTE ⚠",esc(e.name),"boss");document.body.classList.remove("bigshake");void document.body.offsetWidth;document.body.classList.add("bigshake");setTimeout(()=>document.body.classList.remove("bigshake"),500);vib([80,50,120])}else banner(first?esc(f.zone||"Combat"):"VAGUE "+(f.wave+1),first?"Vague 1 / 3":esc(e.name))}
  if(e.boss&&e.hp<e.max*.3&&!f._enr94){f._enr94=1;banner("😡 ENRAGÉ !",esc(e.name)+" attaque plus fort","boss")}}
 /* écran de résultat */
 if(f.over){const res=box.querySelector(".result:not(.tiny)");if(res&&!res.dataset.fx){res.dataset.fx=1;res.classList.add("resultfx",f.over);
  if(f.over==="win"){const t=S.team.slice(0,3),alv=t.filter((d,k)=>f.hp[k]>0).length,ratio=t.reduce((a,d,k)=>a+f.hp[k]/f.mx[k],0)/(t.length||1),st=alv<t.length?1:ratio>.6?3:2;res.insertAdjacentHTML("afterbegin",`<div class="stars">${[1,2,3].map(i=>`<span class="${i<=st?"on":""}" style="animation-delay:${.5+i*.28}s">★</span>`).join("")}</div>`);f.stars=st;if(PREFS.anim)setTimeout(()=>{try{res.scrollIntoView({behavior:"smooth",block:"center"})}catch(e){}},900)}
  res.parentElement?box.querySelectorAll(".result:not(.tiny)~.panel"):[].forEach((p,i)=>{p.classList.add("rise");p.style.animationDelay=(.4+i*.18)+"s"})}}};
/* décor ambiant (particules flottantes) */
function ambient(){if(document.getElementById("ambient"))return;const a=document.createElement("div");a.id="ambient";let h="";for(let i=0;i<16;i++)h+=`<i style="left:${Math.random()*100}%;animation-duration:${9+Math.random()*12}s;animation-delay:${-Math.random()*20}s;--s:${(.5+Math.random()*1.4).toFixed(2)}"></i>`;a.innerHTML=h;document.body.prepend(a)}
ambient();
