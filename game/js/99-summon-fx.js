/* Invocation spectaculaire : cercle magique, cartes face cachée retournées une à une, éclats et rayons */
const GCOL=["#9aa6c4","#67e5ff","#bd8aff","#ffd15c"];let gTimers=[];
function gClear(){gTimers.forEach(clearTimeout);gTimers=[];const o=document.getElementById("gfxLayer");if(o)o.remove()}
function gBurst(x,y,col,n){const L=document.getElementById("gfxLayer");if(!L)return;for(let i=0;i<n;i++){const p=document.createElement("i"),a=Math.random()*6.283,d=50+Math.random()*130;p.className="part";p.style.cssText=`left:${x}px;top:${y}px;color:${col};background:${col};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px`;L.appendChild(p);setTimeout(()=>p.remove(),700)}
 const r=document.createElement("i");r.className="ringfx";r.style.cssText=`left:${x}px;top:${y}px;border-color:${col}`;L.appendChild(r);setTimeout(()=>r.remove(),700)}
function gReveal(cards,veil){const done=()=>{cards.forEach(c=>c.classList.remove("facedown","flipin"));gClear();veil.classList.remove("summoning")};
 cards.forEach((c,i)=>{gTimers.push(setTimeout(()=>{c.classList.remove("facedown");void c.offsetWidth;c.classList.add("flipin");const r=c.getBoundingClientRect(),lv=c.classList.contains("gl-l")?3:c.classList.contains("gl-e")?2:c.classList.contains("gl-r")?1:0;
  if(lv>=1)gBurst(r.left+r.width/2,r.top+r.height/2,GCOL[lv],lv===3?36:lv===2?22:10);
  if(lv===3){const b=document.createElement("div");b.className="beam";b.style.left=(r.left+r.width/2)+"px";const L=document.getElementById("gfxLayer");if(L){L.appendChild(b);gTimers.push(setTimeout(()=>b.remove(),1400))}document.body.classList.remove("bigshake");void document.body.offsetWidth;document.body.classList.add("bigshake");gTimers.push(setTimeout(()=>document.body.classList.remove("bigshake"),500));vib&&vib([60,40,120])}
  else if(lv===2)vib&&vib(40)},i*(cards.length>6?170:260)))});
 gTimers.push(setTimeout(()=>{veil.classList.remove("summoning");const L=document.getElementById("gfxLayer");if(L)L.style.pointerEvents="none"},cards.length*(cards.length>6?170:260)+500))}
const _sg99=showGacha;showGacha=function(got,news,title){_sg99(got,news,title);if(!PREFS.anim)return;const veil=$$("gachaVeil"),cards=[...veil.querySelectorAll(".gres .gc")];if(!cards.length)return;gClear();
 const best=got.reduce((m,d)=>Math.max(m,RAR5.indexOf(sp(d).r)),0),lv=Math.min(3,Math.max(0,best>=3?3:best)),col=GCOL[lv];
 cards.forEach(c=>c.classList.add("facedown"));veil.classList.add("summoning");
 const L=document.createElement("div");L.id="gfxLayer";L.innerHTML=`<div class="circle" style="--c:${col}"><i></i><i></i><i></i><span>✦</span></div><div class="skiphint">Touche pour passer</div>`;veil.appendChild(L);
 const intro=lv===3?1700:lv===2?1300:1000;
 const go=()=>{L.dataset.rv=1;const c=L.querySelector(".circle");if(c)c.classList.add("burst");const fl=document.createElement("div");fl.className="gflash";fl.style.background=col;L.appendChild(fl);gTimers.push(setTimeout(()=>{fl.remove();c&&c.remove();const h=L.querySelector(".skiphint");if(h)h.remove()},450));gReveal(cards,veil)};
 const t=setTimeout(go,intro);gTimers.push(t);
 L.style.pointerEvents="auto";L.addEventListener("click",()=>{if(veil.classList.contains("summoning")&&!L.dataset.rv){clearTimeout(t);go()}else if(veil.classList.contains("summoning")){gClear();cards.forEach(c=>c.classList.remove("facedown"));veil.classList.remove("summoning")}})};
const _cg99=closeGacha;closeGacha=function(){gClear();$$("gachaVeil").classList.remove("summoning");_cg99()};
