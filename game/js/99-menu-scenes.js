/* Décors de menu : les bannières de l'accueil et des modes d'aventure montrent une zone de l'île en parallaxe (même décor
   que la scène de combat) ; la vedette de la bannière devient le gardien de la zone, la créature du mode ou ton dino de tête. */
const zKey=n=>stageZone(zoneOf(Math.max(1,Math.min(100,n)))[0]);
const EV_ZONE={redorb:"volcan",blueorb:"ruines",purpleorb:"obelisque",greenorb:"jungle",goldorb:"neutre"};
const ZEL={jungle:"greenorb",ruines:"blueorb",volcan:"redorb",obelisque:"purpleorb",neutre:"goldorb"};
function bannerScene(id,z,hero){const sec=$$(id),bn=sec&&sec.querySelector(".banner");if(!bn||typeof sceneHTML!=="function")return;
 let s=bn.querySelector(":scope>.bscene");if(!s||s.dataset.z!==z){if(s)s.remove();bn.insertAdjacentHTML("afterbegin",`<div class="bscene" data-z="${z}" aria-hidden="true">${sceneHTML(z)}</div>`)}bn.classList.add("hasScene");
 const h=bn.querySelector(".heroDino");if(h&&hero&&PREFS.art==="svg"&&h.dataset.hero!==hero.k){h.dataset.hero=hero.k;h.innerHTML=`<span class="pt${hero.flip?" flip":""}">${hero.svg}</span>`;h.classList.add("sceneHero")}}
function menuScenes(){if(typeof sceneHTML!=="function")return;const z=zKey((S.stage||0)+1);
 bannerScene("home",z);
 const g=typeof GUARD_BY!=="undefined"&&GUARD_BY[z];bannerScene("story",z,g&&typeof corruptSVG==="function"?{k:"g:"+g+z,svg:corruptSVG(g,ZEL[z],{boss:true}),flip:1}:null);
 const beast=(k,el,flip)=>typeof beastSVG==="function"&&BEAST[k]?{k:k+el,svg:beastSVG(k,el,false),flip}:null;
 if(screen==="dungeon")bannerScene("dungeon","ruines",beast("bones","purpleorb",1));
 if(screen==="tower")bannerScene("tower","neutre",beast("wyvern","goldorb",1));
 if(screen==="arena")bannerScene("arena","volcan",S.team[0]?{k:"lead"+S.team[0].type,svg:portrait(S.team[0].type,true)}:null);
 if(screen==="events"&&typeof EVENTS!=="undefined"){const ev=EVENTS[wkNow()%EVENTS.length];bannerScene("events",EV_ZONE[ev.el]||"neutre",beast(EN_SPR[ev.en[2]],ev.el,1))}}
const _rMS=render;render=function(){_rMS();menuScenes()};
const _goMS=go;go=function(s){_goMS(s);menuScenes()};
menuScenes();
