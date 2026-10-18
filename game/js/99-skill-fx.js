/* Effets visuels des compétences */
function fxEmo(x,y,emo,n,o){o=o||{};if(!PREFS.anim)return;for(let i=0;i<n;i++){const s=document.createElement("span");s.className="fxemo";s.textContent=emo;s.style.left=(x+(Math.random()-.5)*(o.sp||50))+"px";s.style.top=(y+(Math.random()-.5)*20)+"px";s.style.fontSize=(o.fs||18)+"px";fxAdd(s,1300);const dy=(o.dy===undefined?-70:o.dy)-Math.random()*30,dx=(Math.random()-.5)*(o.dx||30);s.animate([{transform:"translate(-50%,0) scale(.3)",opacity:0},{transform:"translate(-50%,"+dy*.3+"px) scale(1.1)",opacity:1,offset:.25},{transform:`translate(calc(-50% + ${dx}px),${dy}px) scale(.8)`,opacity:0}],{duration:900+Math.random()*350,delay:i*(o.gap||70),easing:"ease-out",fill:"both"})}}

function fxCtr(el){const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,r}}
const _us99=useSkill;useSkill=function(k){const f=fight;if(!f||f.over||!alive(k)||f.cd[k]>0)return _us99(k);const id=SK_of(T3()[k]);const hp0=f.hp.slice();_us99(k);if(!PREFS.anim)return;
 const box=$$("battleArea"),eI=box.querySelector(".bigicon.hit"),rows=box.querySelector(".sFig")?[...box.querySelectorAll(".sFig")]:[...box.querySelectorAll(".row .bigicon:not(.hit)")],me=rows[k];if(!eI)return;const E=fxCtr(eI),M=me?fxCtr(me):E;
 const send=col=>projectile(me,eI,col,0);
 switch(id){
  case"strike":send("#ff9d3c");setTimeout(()=>fxSlash(E.r,2,"#fff"),fxd(380));break;
  case"cleave":send("#ffd15c");setTimeout(()=>{fxSlash(E.r,1,"#ffd15c",true);ring(E.x,E.y,"#ffd15c")},fxd(380));break;
  case"execute":send("#ff3c5c");setTimeout(()=>{fxSlash(E.r,2,"#ff3c5c",true);flash&&flash()},fxd(380));break;
  case"stun":send("#ffe27a");setTimeout(()=>{ring(E.x,E.y,"#ffe27a");setTimeout(()=>ring(E.x,E.y,"#fff"),fxd(140));fxEmo(E.x,E.y-20,"💫",4,{dy:-20,sp:60})},fxd(380));break;
  case"burn":send("#ff6a2a");setTimeout(()=>fxEmo(E.x,E.y+10,"🔥",7,{sp:60,fs:22}),fxd(380));break;
  case"poison":send("#7dff6a");setTimeout(()=>fxEmo(E.x,E.y+10,"🟢",8,{sp:60,fs:12,gap:90}),fxd(380));break;
  case"drain":send("#c8213c");setTimeout(()=>{for(let i=0;i<4;i++)setTimeout(()=>projectile(eI,me,"#ff3c5c",0),fxd(i*90))},fxd(380));break;
  case"heal":rows.forEach((r,j)=>{if(f.hp[j]>0){const c=fxCtr(r);fxEmo(c.x,c.y+8,"➕",4,{fs:18,dy:-50,sp:40});ring(c.x,c.y,"#8cffb0")}});break;
  case"selfheal":{let b=0,bv=9;f.hp.forEach((h,j)=>{if(h>hp0[j]||false){if(f.hp[j]-hp0[j]>=(f.hp[b]-hp0[b]))b=j}});const r=rows[b];if(r){const c=fxCtr(r);fxEmo(c.x,c.y+8,"🩹",3,{fs:20,dy:-50});ring(c.x,c.y,"#8cffb0")}break}
  case"shield":rows.forEach(r=>{const c=fxCtr(r);ring(c.x,c.y,"#67b7ff");fxEmo(c.x,c.y,"🛡️",1,{fs:26,dy:-20})});break;
  case"roar":rows.forEach((r,j)=>{const c=fxCtr(r);setTimeout(()=>ring(c.x,c.y,"#ffb04d"),fxd(j*80))});fxEmo(innerWidth/2,E.y+80,"📣",1,{fs:34,dy:-40});break;
  case"focus":{const s=document.createElement("div");s.className="crosshair";s.style.left=E.x+"px";s.style.top=E.y+"px";fxAdd(s,1100);break}
  case"charge":{const g=box.querySelector(".gauge");if(g){const c=fxCtr(g);fxEmo(c.x,c.y,"⚡",6,{sp:200,dy:-30,fs:22});g.classList.add("gaugeflash");setTimeout(()=>g.classList.remove("gaugeflash"),800)}break}
  case"reorb":box.querySelectorAll(".orbboard .orb").forEach((o,i)=>{o.style.animation="orbspin .5s ease-out";o.style.animationDelay=i*30+"ms"});break}
};
