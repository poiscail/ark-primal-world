/* Mise en page du combat : scène en haut, orbes à gauche, équipe et super à droite, sans défiler.
   Aucun élément n'est déplacé dans le DOM (les autres modules continuent de les trouver) : chacun reçoit une classe bl-*
   et l'ordre visuel vient de css/94-layout.css. Ce module doit rester le dernier à envelopper renderBattle. */
function blKind(el,st){const c=el.classList;
 if(st.res)return"bl-rep";
 if(el.id==="tipCard")return"bl-tip";
 if(c.contains("battlestage"))return"bl-stage";
 if(c.contains("result")){if(c.contains("tiny"))return"bl-log";st.res=true;return"bl-res"}
 if(c.contains("fchips"))return"bl-buffs";
 if(c.contains("row")&&el.querySelector(".skbtn"))return"bl-team";
 if(c.contains("sectionhead"))return"bl-head";
 if(c.contains("orbboard"))return"bl-orbs";
 if(el.id==="obHint")return"bl-hint";
 if(c.contains("gauge"))return"bl-gauge";
 if(el.nextElementSibling&&el.nextElementSibling.classList.contains("gauge"))return"bl-sptxt";
 if(el.tagName==="BUTTON")return"bl-super";
 if(c.contains("btns")){st.btns=true;return"bl-btns"}
 if(c.contains("panel"))return st.btns?"bl-jr":"bl-help";
 return"bl-misc"}
function blStage(box,f){const hud=box.querySelector(".sHud");
 if(hud&&!hud.querySelector(".sZone")){const t=$$("battleTitle");hud.insertAdjacentHTML("afterbegin",`<div class="sZone">${esc(t?t.textContent:"")}</div>`)}
 const prev=f._fh||[];f._fh=[];
 box.querySelectorAll(".battlestage .sFig").forEach(el=>{const k=+el.dataset.k,d=T3()[k];if(!d)return;const r=Math.max(0,Math.min(1,f.hp[k]/(f.mx[k]||1))),p=prev[k]===undefined?r:prev[k];f._fh[k]=r;
  el.insertAdjacentHTML("afterbegin",`<i class="sHp ${r<.25?"lo":r<.5?"mid":""}"><u style="width:${p*100}%"></u></i>`);
  const u=el.querySelector(".sHp u");if(p>r&&f._hlate)u.style.transitionDelay=Math.round(f._hlate)+"ms";if(p!==r&&PREFS.anim)requestAnimationFrame(()=>requestAnimationFrame(()=>{u.style.width=r*100+"%"}));else u.style.width=r*100+"%";
  const ok=!f.over&&r>0&&f.cd[k]<=0;el.classList.toggle("skready",ok);
  if(ok){el.setAttribute("onclick","useSkill("+k+")");el.title="Compétence prête : touche pour la lancer";el.insertAdjacentHTML("beforeend",`<b class="sSk">${SK[SK_of(d)].i}</b>`)}})}
function blTag(){const box=$$("battleArea"),f=fight;if(!box)return;
 const on=!!(f&&f.mx&&box.querySelector(".battlestage"));box.classList.toggle("bl",on);box.classList.toggle("blover",on&&!!f.over);
 document.body.classList.toggle("inbattle",on&&screen==="battle");if(!on)return;
 const st={};for(const el of box.children)el.classList.add(blKind(el,st));
 box.querySelectorAll(":scope>.bl-team").forEach((el,k)=>el.dataset.k=k);
 blStage(box,f);
 /* bannières de vague centrées sur la scène (elle n'est plus au milieu de l'écran) */
 if(!PREFS.anim)return;const r=box.querySelector(".battlestage").getBoundingClientRect();document.documentElement.style.setProperty("--bnTop",Math.round(Math.min(innerHeight*.4,Math.max(30,r.top+r.height*.36)))+"px")}
const _rbL=renderBattle;renderBattle=function(){_rbL();blTag()};
const _goL=go;go=function(s){_goL(s);document.body.classList.toggle("inbattle",screen==="battle"&&!!(fight&&fight.mx))};
if(screen==="battle")renderBattle();
