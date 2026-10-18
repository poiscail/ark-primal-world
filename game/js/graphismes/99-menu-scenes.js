/* Décors de menu (complète 99-polish, qui pose le décor de zone des bannières via BZONE) : choix du décor des modes
   d'aventure et vedette de la bannière = gardien de la zone (Histoire), créature du mode (Donjons, Tour, Événements)
   ou ton dino de tête (Arène). */
const zKey=n=>stageZone(zoneOf(Math.max(1,Math.min(100,n)))[0]);
const EV_ZONE={redorb:"volcan",blueorb:"ruines",purpleorb:"obelisque",greenorb:"jungle",goldorb:"neutre"};
const ZEL={jungle:"greenorb",ruines:"blueorb",volcan:"redorb",obelisque:"purpleorb",neutre:"goldorb"};
const evNow=()=>typeof EVENTS!=="undefined"?EVENTS[wkNow()%EVENTS.length]:null;
BZONE.tower=()=>"neutre";BZONE.arena=()=>"volcan";BZONE.events=()=>{const ev=evNow();return ev&&EV_ZONE[ev.el]||"neutre"};
function bannerHero(id,hero){const sec=$$(id),bn=sec&&sec.querySelector(".banner");if(!bn||!hero||PREFS.art!=="svg")return;
 const h=bn.querySelector(".heroDino");if(h&&h.dataset.hero!==hero.k){h.dataset.hero=hero.k;h.innerHTML=`<span class="pt${hero.flip?" flip":""}">${hero.svg}</span>`;h.classList.add("sceneHero")}}
function menuScenes(){const z=zKey((S.stage||0)+1),beast=(k,el,flip)=>typeof beastSVG==="function"&&BEAST[k]?{k:k+el,svg:beastSVG(k,el,false),flip}:null;
 const g=typeof GUARD_BY!=="undefined"&&GUARD_BY[z];if(screen==="story"&&g&&typeof corruptSVG==="function")bannerHero("story",{k:"g:"+g+z,svg:corruptSVG(g,ZEL[z],{boss:true}),flip:1});
 if(screen==="dungeon")bannerHero("dungeon",beast("bones","purpleorb",1));
 if(screen==="tower")bannerHero("tower",beast("wyvern","goldorb",1));
 if(screen==="arena"&&S.team[0])bannerHero("arena",{k:"lead"+S.team[0].type,svg:portrait(S.team[0].type,true)});
 if(screen==="events"){const ev=evNow();if(ev)bannerHero("events",beast(EN_SPR[ev.en[2]],ev.el,1))}}
const _rMS=render;render=function(){_rMS();menuScenes()};
const _goMS=go;go=function(s){_goMS(s);menuScenes()};
menuScenes();
