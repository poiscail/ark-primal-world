/* Noyau : données, configuration, état du joueur, combat de base, invocation de base */
let SPEC={
raptor:{name:"Raptor",e:"🦖",r:"Commun",hp:88,atk:20,def:9,element:"redorb"},
trike:{name:"Tricératops",e:"🦏",r:"Commun",hp:125,atk:15,def:16,element:"greenorb"},
stego:{name:"Stégosaure",e:"🦕",r:"Rare",hp:142,atk:23,def:18,element:"blueorb"},
ptera:{name:"Ptéranodon",e:"🪽",r:"Rare",hp:90,atk:29,def:9,element:"blueorb"},
rex:{name:"Tyrannosaure",e:"🐲",r:"Épique",hp:175,atk:36,def:18,element:"purpleorb"},
spino:{name:"Spinosaurus",e:"🐉",r:"Légendaire",hp:205,atk:42,def:21,element:"goldorb"}};
const DEFAULT_CONFIG={trainCost:8,summonCost1:1,summonCost5:5,exploreStoneMin:6,exploreStoneMax:12,battleStone:15,battleEssence:2,firstBattleTickets:1,chapterStone:10,chapterTickets:1,chapterXP:20,battleXP:28,commonRate:55,rareRate:28,epicRate:13,legendRate:4};
let CONFIG={...DEFAULT_CONFIG};
const initial={stone:30,essence:0,tickets:3,xp:0,level:1,chapter:0,doneBattles:0,gear:0,nextId:2,team:[{id:1,type:"raptor",level:1,xp:0}],log:["Bienvenue, survivant. Ta première mission commence." ]};
let S;try{S={...initial,...JSON.parse(localStorage.getItem("arkPrimalMobile")||"{}")}}catch(e){S={...initial}}

const SPEC_DEFAULT=JSON.parse(JSON.stringify(SPEC));
function loadGameConfig(){
 try{
  const cfg=JSON.parse(localStorage.getItem("arkPrimalConfig")||"null");
  if(cfg&&cfg.dinos){SPEC={...SPEC_DEFAULT,...cfg.dinos};CONFIG={...DEFAULT_CONFIG,...cfg.economy};}
 }catch(e){}
}
loadGameConfig();

function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
let screen="home",fight=null;
let need=l=>35+l*25, sp=d=>SPEC[d.type]||SPEC_DEFAULT.raptor, art=e=>/^https:\/\//i.test(e)?`<img src="${esc(e)}" alt="" style="max-width:100%;max-height:100%">`:esc(e),rarityClass=r=>r==="Épique"?"epic":r==="Légendaire"?"legend":"";
function save(){localStorage.setItem("arkPrimalMobile",JSON.stringify(S));topbar()}
function topbar(){["stone","essence","tickets","level"].forEach(k=>document.getElementById(k).textContent=S[k])}
function log(s){S.log.unshift(s);S.log=S.log.slice(0,8);save()}
function addXP(n){S.xp+=n;while(S.xp>=need(S.level)){S.xp-=need(S.level);S.level++;S.tickets++;log("Niveau joueur "+S.level+" : +1 ticket d'invocation.")}}
function stats(d){let p=sp(d);return {hp:Math.round(p.hp+(d.level-1)*p.hp*.13+S.gear*8),atk:Math.round(p.atk+(d.level-1)*p.atk*.12+S.gear*2),def:p.def+d.level-1+S.gear}}

function go(s){screen=s;document.querySelectorAll(".screen").forEach(e=>e.classList.toggle("active",e.id===s));document.querySelectorAll(".bottomnav button").forEach(e=>e.classList.toggle("active",e.dataset.screen===s));render()}
document.querySelector(".bottomnav").addEventListener("click",e=>{let b=e.target.closest("[data-screen]");if(b)go(b.dataset.screen)});


function train(id){let d=S.team.find(x=>x.id===id);if(S.stone<CONFIG.trainCost){alert("Il faut 8 pierres.");return}S.stone-=CONFIG.trainCost;d.xp+=30;while(d.xp>=need(d.level)){d.xp-=need(d.level);d.level++;log(sp(d).name+" passe niveau "+d.level+".")}log(sp(d).name+" gagne de l'expérience.");save();render()}



function escapeFight(){fight=null;go("home")}
