/* Labyrinthe des reliques (0.21) : mode rogue-lite rejouable à l'infini (idées de Slay the Spire et de Hades).
   Une course = 3 actes (Jungle, Volcan, Obélisque). Chaque acte est une carte de 6 rangées à embranchements puis un gardien :
   combats, élites, mystères (événements à choix), campements, marchands, trésors. Les PV de l'équipe sont conservés par place
   (1, 2, 3) d'un combat à l'autre ; les reliques ramassées changent les règles du combat jusqu'à la fin de la course.
   Monnaie de course : crocs 🦷 (perdus à la fin). Fin de course : pierres, essences, fragments, tickets (victoire) et
   marques 🌀 (boutique permanente). Profondeurs 0 à 10 : chaque victoire débloque la suivante.
   Les combats passent par MODES.maze (80-modes) ; les effets des reliques sont des wrappers gardés par mzOn(fight). */
const MZ_UNLOCK=10,MZ_MAXD=10;
const MZ_ACTS=[{z:"Jungle",el:"greenorb"},{z:"Volcan",el:"redorb"},{z:"Obélisque",el:"purpleorb"}];
const MZT={f:{n:"Combat",i:"⚔️"},e:{n:"Élite",i:"💀"},q:{n:"Mystère",i:"❓"},c:{n:"Campement",i:"🏕️"},s:{n:"Marchand",i:"🛒"},t:{n:"Trésor",i:"💎"},b:{n:"Gardien",i:"👑"}};
/* r : c commune, r rare, l légendaire, x malédiction ; e : effets additionnés par mzStats() */
const RELICS={
 braise:{n:"Croc de braise",i:"🔥",r:"c",d:"Orbes 🔥 +20 % de dégâts.",e:{o_redorb:.2}},
 maree:{n:"Écaille de marée",i:"💧",r:"c",d:"Orbes 💧 +20 % de dégâts.",e:{o_blueorb:.2}},
 seve:{n:"Sève ancienne",i:"🌿",r:"c",d:"Orbes 🌿 +20 % de dégâts.",e:{o_greenorb:.2}},
 orage:{n:"Plume d'orage",i:"⚡",r:"c",d:"Orbes ⚡ +20 % de dégâts.",e:{o_purpleorb:.2}},
 solaire:{n:"Ambre solaire",i:"☀️",r:"c",d:"Orbes ☀️ +25 % de dégâts.",e:{o_goldorb:.25}},
 osdur:{n:"Os durci",i:"🦴",r:"c",d:"Dégâts subis −8 %.",e:{taken:-.08}},
 viande:{n:"Viande séchée",i:"🍖",r:"c",d:"Après chaque combat, l'équipe récupère 10 % de ses PV.",e:{post:.1}},
 corne:{n:"Corne de guerre",i:"📯",r:"c",d:"Chaque combat commence avec 25 % de super attaque.",e:{sp0:25}},
 griffe:{n:"Griffe affûtée",i:"🗡️",r:"c",d:"Attaque +8 %.",e:{atk:.08}},
 bourse:{n:"Bourse de crocs",i:"👛",r:"c",d:"Crocs gagnés +25 %.",e:{crocs:.25}},
 ecaille:{n:"Fragment de carapace",i:"🛡️",r:"c",d:"Chaque combat commence sous carapace : la 1re attaque ennemie fait −50 %.",e:{shield0:1}},
 totem:{n:"Totem du chasseur",i:"🎯",r:"c",d:"La première orbe de chaque combat frappe ×2.",e:{first:1}},
 coeur:{n:"Cœur de titan",i:"❤️",r:"r",d:"PV max +15 %.",e:{hp:.15}},
 sang:{n:"Pierre de sang",i:"🩸",r:"r",d:"Chaque ennemi vaincu soigne l'équipe de 8 %.",e:{kill:.08}},
 sablier:{n:"Sablier fossile",i:"⏳",r:"r",d:"Les compétences sont prêtes dès le début de chaque combat.",e:{cd0:1}},
 prisme:{n:"Prisme d'orbes",i:"🔮",r:"r",d:"Chaque plateau contient au moins 3 orbes de l'élément du chef.",e:{bias:3}},
 echo:{n:"Écho du rugissement",i:"📣",r:"r",d:"Chaque combat commence avec +30 % d'attaque pendant 2 tours.",e:{roar0:2}},
 chaine:{n:"Chaîne de combo",i:"⛓️",r:"r",d:"Chaque palier de combo donne +25 % au lieu de +15 %.",e:{combo:.1}},
 epines:{n:"Épines venimeuses",i:"🌵",r:"r",d:"Renvoie 20 % des dégâts subis à l'ennemi.",e:{thorns:.2}},
 trophee:{n:"Trophée de chasseur",i:"🏹",r:"r",d:"+25 % de dégâts contre les élites et les gardiens.",e:{big:.25}},
 lune:{n:"Larme de lune",i:"🌙",r:"r",d:"L'équipe récupère 3 % de ses PV à chaque tour.",e:{regen:.03}},
 noyau:{n:"Noyau d'orage",i:"🌩️",r:"r",d:"Super attaque +35 % de dégâts.",e:{sup:.35}},
 survie:{n:"Instinct de survie",i:"😤",r:"r",d:"+30 % d'attaque pour un dino sous 50 % de PV.",e:{low:.3}},
 sacoche:{n:"Sacoche du voyageur",i:"🎒",r:"r",d:"+1 objet de sacoche par combat, et une herbe de soin offerte.",e:{bag:1},get:()=>{ens();if(S.pouch)S.pouch.heal=Math.min(POUCH_MAX,(S.pouch.heal||0)+1)}},
 phenix:{n:"Œuf de phénix",i:"🐣",r:"l",d:"Une fois par course, un dino mis KO revient aussitôt avec 40 % de ses PV.",e:{phoenix:1}},
 couronne:{n:"Couronne de l'Alpha",i:"👑",r:"l",d:"Attaque +20 % et PV max +10 %.",e:{atk:.2,hp:.1}},
 eclat:{n:"Éclat de l'Obélisque",i:"🗿",r:"l",d:"L'avantage d'élément passe de ×1,3 à ×1,6.",e:{adv:.3}},
 meteore:{n:"Météorite",i:"☄️",r:"l",d:"Chaque combat commence avec la super attaque prête.",e:{sp0:100}},
 ambrevie:{n:"Ambre de vie",i:"🟠",r:"l",d:"Après chaque combat : +25 % de PV, et les dinos KO reviennent à 20 %.",e:{post:.25,revive:.2}},
 fossile:{n:"Fossile du temps",i:"⏱️",r:"l",d:"Chaque ennemi perd son premier tour.",e:{stun0:1}},
 fievre:{n:"Fièvre des marais",i:"🤒",r:"x",d:"Malédiction : PV max −10 %.",e:{hp:-.1}},
 fragile:{n:"Os fragiles",i:"💔",r:"x",d:"Malédiction : dégâts subis +12 %.",e:{taken:.12}},
 faim:{n:"Faim dévorante",i:"🍂",r:"x",d:"Malédiction : crocs gagnés −30 %.",e:{crocs:-.3}},
 lourd:{n:"Brume lourde",i:"🌫️",r:"x",d:"Malédiction : chaque combat commence avec 1 tour de recharge de plus sur les compétences.",e:{cdx:1}},
 oeil:{n:"Œil maudit",i:"👁️",r:"x",d:"Malédiction : les ennemis ont +10 % d'attaque.",e:{eatk:.1}}};
const MZ_RAR={c:"Commune",r:"Rare",l:"Légendaire",x:"Malédiction"};
/* tirage des reliques proposées : poids commune / rare / légendaire selon la source */
const MZ_W={start:[1,0,0],fight:[70,27,3],elite:[40,50,10],treasure:[50,44,6],boss:[0,60,40],rare:[0,85,15]};
/* profondeurs : modificateurs cumulés */
/* en plus de son modificateur, chaque profondeur renforce tous les ennemis de 2 % (PV et ATQ) */
const MZ_DTXT=["Aucun modificateur","Ennemis +10 % PV","Ennemis +10 % ATQ","Une élite de plus par acte","Campements : 10 % de soin en moins","Gardiens +20 % PV","Crocs −20 %","Départ avec une malédiction","Ennemis +15 % PV de plus","Élites et gardiens +15 % ATQ","Gardien final +25 % PV"];
function mzDepth(d){const g=.02*d;return{ehp:g+(d>=1?.1:0)+(d>=8?.15:0),eatk:g+(d>=2?.1:0),elite:d>=3,camp:d>=4?.1:0,bhp:d>=5?.2:0,crocs:d>=6?-.2:0,curse:d>=7,batk:d>=9?.15:0,fhp:d>=10?.25:0}}
const mzDepthList=d=>d?MZ_DTXT.slice(1,d+1).join(" · ")+" · tous les ennemis +"+2*d+" %":MZ_DTXT[0];
/* niveau de référence des ennemis : progression dans l'histoire, ou niveau de l'équipe s'il est plus élevé (une équipe surentraînée ne rend pas le labyrinthe trivial) */
function mzN0(){const t=S.team.slice(0,3),L=t.reduce((a,d)=>a+(d.level||1),0)/Math.max(1,t.length);return Math.max(8,Math.min(150,Math.round(Math.max(S.stage||0,2*(L-1)))))}
/* boutique permanente des marques */
const MZ_UP=[{k:"hp",i:"❤️",n:"Vigueur ancestrale",d:"PV max +5 % dans le labyrinthe (par niveau).",max:4,c:[40,80,120,160]},
 {k:"purse",i:"👛",n:"Bourse héritée",d:"+20 🦷 au départ de chaque course (par niveau).",max:3,c:[30,60,90]},
 {k:"camp",i:"🔥",n:"Feu de camp",d:"Le campement soigne +10 % (par niveau).",max:2,c:[60,120]},
 {k:"deal",i:"🤝",n:"Ami des marchands",d:"Prix du marchand −15 % (par niveau).",max:2,c:[50,100]},
 {k:"eye",i:"🔭",n:"Œil du pisteur",d:"Les choix de reliques proposent 4 reliques au lieu de 3.",max:1,c:[150]},
 {k:"rare",i:"🎁",n:"Héritage",d:"La relique de départ est choisie parmi des reliques rares.",max:1,c:[200]}];
/* objets : limite par semaine (le labyrinthe se rejoue sans fin, les tickets ne doivent pas devenir illimités) */
const MZ_SHOP=[{k:"tix",i:"🎟️",n:"2 tickets d'invocation",c:50,lim:5,fx:()=>give({tickets:2})},{k:"shd",i:"🧩",n:"15 fragments",c:30,lim:5,fx:()=>give({shards:15})},
 {k:"egg",i:"🌟",n:"Œuf épique",c:110,lim:2,fx:()=>addEgg("epic")},{k:"leg",i:"⚔️",n:"Objet d'équipement légendaire",c:150,lim:1,fx:()=>addItem(newItem(["w","a","c"][rnd(3)],3))}];
const _ensMz=ens;ens=function(){_ensMz();let M=S.maze;if(!M||typeof M!=="object")M=S.maze={};if(M.run===undefined)M.run=null;if(!M.codex)M.codex={};if(!M.up)M.up={};
 if(M.top===undefined)M.top=-1;for(const k of ["runs","wins","asc","marks","fights","bestAct"])if(!(M[k]>=0))M[k]=0;
 const w=wkNow();if(M.wk!==w){M.wk=w;M.bought={}}if(!M.bought)M.bought={}};
const mzRun=()=>{ens();return S.maze.run};
const mzUp=k=>(S.maze&&S.maze.up&&S.maze.up[k])||0;
const mzOn=f=>!!(f&&f.mzOn&&f.o&&f.o.mode==="maze");
const mzCodexN=()=>{ens();return Object.keys(S.maze.codex).filter(k=>RELICS[k]).length};
let mzSelD=null;
function mzStats(run){run=run||mzRun();const s={};if(!run)return s;run.relics.forEach(k=>{const R=RELICS[k];if(R)for(const [x,v] of Object.entries(R.e))s[x]=(s[x]||0)+v});
 s.atk=(s.atk||0)+(run.buf.atk||0);s.hp=(s.hp||0)+(run.buf.hp||0)+.05*mzUp("hp");s.sp0=Math.min(100,s.sp0||0);return s}
/* ---- PV de la course (rapport 0..1 par place) ---- */
function mzHeal(run,x){run.hp=run.hp.map(r=>r>0?Math.min(1,r+x):r)}
function mzRevive(run,x){run.hp=run.hp.map(r=>r>0?r:x)}
function mzHurt(run,x){run.hp=run.hp.map(r=>r>0?Math.max(.05,r-x):r)}
function mzGain(run,base,flat){const s=mzStats(run),g=Math.max(0,Math.round(base*(flat?1:1+(s.crocs||0)+mzDepth(run.depth).crocs)));run.crocs+=g;return g}
function mzAddRelic(run,k){const R=RELICS[k];if(!R||run.relics.includes(k))return null;run.relics.push(k);S.maze.codex[k]=1;if(R.get)try{R.get()}catch(e){}return R}
function mzCurse(run){const p=Object.keys(RELICS).filter(k=>RELICS[k].r==="x"&&!run.relics.includes(k));if(!p.length)return null;const k=p[rnd(p.length)];mzAddRelic(run,k);return k}
function mzChoices(run,src,nOpt){const w=MZ_W[src]||MZ_W.fight,n=nOpt||(3+(mzUp("eye")?1:0)),own=new Set(run.relics),out=[];
 for(let i=0;i<n*8&&out.length<n;i++){let ri=rollW(w);if(src==="start"&&mzUp("rare"))ri=1;const pool=Object.keys(RELICS).filter(k=>RELICS[k].r===["c","r","l"][ri]&&!own.has(k)&&!out.includes(k));if(pool.length)out.push(pool[rnd(pool.length)])}
 return out}
/* ---- carte d'un acte : 6 rangées de 3 cases + le gardien ; on peut toujours aller tout droit, les diagonales existent 55 % du temps ---- */
function mzPick(r){const T=["f","e","q","t","s","c"],w=[44,r>=2?10:0,24,6,r>=2?8:0,r>=2?8:0];return T[rollW(w)]}
function mzMap(act,depth){const rows=[];
 for(let r=0;r<6;r++){const row=[];for(let c=0;c<3;c++){const t=r===0?(c===1&&act>0?"q":"f"):r===5?["c","s","c"][c]:mzPick(r);row.push({t,n:[]})}rows.push(row)}
 const want=1+(mzDepth(depth).elite?1:0);let have=rows.slice(2,5).flat().filter(x=>x.t==="e").length,guard=0;
 while(have<want&&guard++<50){const r=2+rnd(3),c=rnd(3);if(rows[r][c].t!=="e"){rows[r][c].t="e";have++}}
 if(!rows[3].some(x=>x.t==="t"))rows[3][rnd(3)].t="t";
 for(let r=0;r<5;r++)for(let c=0;c<3;c++){const nd=rows[r][c];nd.n=[c];if(c>0&&Math.random()<.55)nd.n.push(c-1);if(c<2&&Math.random()<.55)nd.n.push(c+1);nd.n.sort()}
 rows[5].forEach(nd=>nd.n=[1]);rows.push([null,{t:"b",n:[]},null]);return rows}
function mzReach(run){if(!run||run.cur||run.pend)return[];const m=run.map;if(run.pos.r<0)return m[0].map((x,c)=>x?[0,c]:null).filter(Boolean);
 const nd=m[run.pos.r]&&m[run.pos.r][run.pos.c];if(!nd)return[];return nd.n.map(c=>[run.pos.r+1,c]).filter(([r,c])=>m[r]&&m[r][c])}
function mzClear(run,r,c){if(r===undefined){r=run.cur.r;c=run.cur.c}run.pos={r,c};const L=run.path[run.path.length-1];if(!L||L[0]!==r||L[1]!==c)run.path.push([r,c]);run.cur=null}
/* ---- démarrer, avancer ---- */
function mzStart(){ens();const M=S.maze;if(M.run){go("maze");return}
 if(S.stage<MZ_UNLOCK){toast("Le Labyrinthe se débloque au niveau "+MZ_UNLOCK+" de l'histoire.");return}if(S.team.length<3){toast("Il faut 3 dinos dans l'équipe.");return}
 const d=Math.max(0,Math.min(M.asc,mzSelD===null?M.asc:mzSelD));
 const run={id:Date.now().toString(36),depth:d,act:0,map:mzMap(0,d),pos:{r:-1,c:1},cur:null,path:[],hp:[1,1,1],relics:[],crocs:20*mzUp("purse"),buf:{atk:0,hp:0},pend:null,
  n0:mzN0(),st:{},phx:0,nextSp:0,ev:[],t0:Date.now()};
 if(mzDepth(d).curse)mzCurse(run);run.pend={t:"start",ch:mzChoices(run,"start")};M.run=run;save();sfx&&sfx("legend");go("maze")}
function mzEnter(r,c){const run=mzRun();if(!run||!mzReach(run).some(([a,b])=>a===r&&b===c))return;const t=run.map[r][c].t;
 if("feb".includes(t)){run.cur={r,c,t};save();mzFight();return}
 mzClear(run,r,c);
 if(t==="q"){const p=MZ_EV.filter(e=>!run.ev.includes(e.id)),E=(p.length?p:MZ_EV)[rnd((p.length?p:MZ_EV).length)];run.ev.push(E.id);run.pend={t:"event",id:E.id}}
 else if(t==="c")run.pend={t:"camp"};
 else if(t==="s")run.pend={t:"shop",items:mzStock(run),svc:{}};
 else if(t==="t"){const g=mzGain(run,20);run.pend={t:"relic",ch:mzChoices(run,"treasure"),src:"💎 Trésor : +"+g+" 🦷 et une relique au choix"}}
 save();sfx&&sfx("tap");renderMaze()}
const mzKey=run=>run&&run.cur?run.id+":"+run.act+":"+run.cur.r+":"+run.cur.c+":"+run.cur.t:"";
function mzFight(){const run=mzRun();if(!run||!run.cur)return;startBattle({mode:"maze",key:mzKey(run),kind:run.cur.t,row:run.cur.r})}
function mzNextAct(run){run.act++;run.map=mzMap(run.act,run.depth);run.pos={r:-1,c:1};run.path=[];mzHeal(run,.3);mzRevive(run,.2);
 toast("🌀 Acte "+(run.act+1)+" : "+MZ_ACTS[run.act].z+" · l'équipe récupère 30 % de PV",3600)}
function mzFx(el,col){if(!el||!PREFS.anim||typeof sparkBurst!=="function")return;const r=el.getBoundingClientRect();sparkBurst(r.left+r.width/2,r.top+r.height/2,col||"#ffd15c",44,1.2)}
function mzTake(k,el){const run=mzRun(),p=run&&run.pend;if(!p||!(p.t==="relic"||p.t==="start")||!p.ch.includes(k))return;const R=mzAddRelic(run,k);if(!R)return;
 mzFx(el,R.r==="l"?"#ffd15c":R.r==="r"?"#4cc9ff":"#cfe3ff");const nx=p.next;run.pend=null;if(nx)mzNextAct(run);save();sfx&&sfx(R.r==="l"?"legend":"buy");toast(R.i+" "+R.n+" : "+R.d,3200);renderMaze()}
function mzSkip(){const run=mzRun(),p=run&&run.pend;if(!p||p.t!=="relic")return;mzGain(run,8,true);const nx=p.next;run.pend=null;if(nx)mzNextAct(run);save();renderMaze()}
function mzOk(){const run=mzRun();if(!run||!run.pend||run.pend.t!=="note")return;run.pend=null;save();renderMaze()}
/* ---- mystères ---- */
function mzEvFight(run,t,x){run.cur={r:run.pos.r,c:run.pos.c,t,x:x||{}};run.pend=null}
const mzHasCurse=r=>r.relics.some(k=>RELICS[k]&&RELICS[k].r==="x");
const MZ_EV=[
 {id:"source",i:"♨️",n:"Source chaude",d:"Une source fumante jaillit entre les fougères. L'eau sent le soufre… et la vie.",o:[
  ["Se baigner","Soigne 30 % des PV de l'équipe.",r=>{mzHeal(r,.3);return"L'eau chaude apaise tes dinos : +30 % de PV."}],
  ["Boire à la source","PV max +8 % jusqu'à la fin de la course.",r=>{r.buf.hp+=.08;return"Une vigueur ancienne coule dans leurs veines : PV max +8 %."}]]},
 {id:"nid",i:"🪺",n:"Nid abandonné",d:"Des œufs encore tièdes reposent au pied d'un arbre géant. La mère ne doit pas être loin…",o:[
  ["Voler un œuf","Un œuf commun pour ton incubateur (définitif) ; la mère attaque : −15 % de PV.",r=>{mzHurt(r,.15);return addEgg("common")!==false?"Tu files avec un œuf 🥚 ! La mère te griffe au passage : −15 % de PV.":"Ton incubateur est plein… et la mère t'attaque quand même : −15 % de PV."}],
  ["Passer son chemin","Il ne se passe rien.",()=>"Tu laisses le nid tranquille."]]},
 {id:"autel",i:"🩸",n:"Autel de sang",d:"Un autel couvert de griffures exige un tribut. Une lueur pourpre pulse sous la pierre.",o:[
  ["Offrir du sang","−20 % de PV, puis une relique rare au choix.",r=>{mzHurt(r,.2);r.pend={t:"relic",ch:mzChoices(r,"rare"),src:"🩸 L'autel accepte ton offrande : choisis une relique"};return""}],
  ["Refuser","Il ne se passe rien.",()=>"Tu t'éloignes de l'autel."]]},
 {id:"carcasse",i:"🦴",n:"Carcasse géante",d:"Le squelette d'un titan, encore couvert de lambeaux. Des crocs brillent entre ses côtes.",o:[
  ["Fouiller","+45 🦷 ; une chance sur deux de te piquer à un dard caché : −10 % de PV.",r=>{const g=mzGain(r,45);if(Math.random()<.5){mzHurt(r,.1);return"+"+g+" 🦷… mais un dard caché te pique : −10 % de PV."}return"+"+g+" 🦷 récupérés sans encombre."}],
  ["Ignorer","Il ne se passe rien.",()=>"Mieux vaut ne pas déranger les morts."]]},
 {id:"ambre",i:"🟠",n:"Ambre ancien",d:"Un insecte figé dans l'ambre brille d'un éclat étrange.",o:[
  ["Briser l'ambre","Une relique au hasard ; 30 % de risque de malédiction.",r=>{const k=mzChoices(r,"fight",1)[0];let t=k?"Tu obtiens "+RELICS[k].i+" "+RELICS[k].n+" !":"L'ambre était vide.";if(k)mzAddRelic(r,k);if(Math.random()<.3){const c=mzCurse(r);if(c)t+=" Mais une malédiction s'échappe : "+RELICS[c].i+" "+RELICS[c].n+"."}return t}],
  ["Le laisser","Il ne se passe rien.",()=>"L'ambre garde son secret."]]},
 {id:"meute",i:"🐺",n:"Meute errante",d:"Des yeux luisent dans les fourrés. Une meute affamée te barre la route.",o:[
  ["Combattre","Un combat ; crocs doublés en cas de victoire.",r=>{mzEvFight(r,"f",{dbl:1});return"La meute attaque !"}],
  ["Se cacher","−10 % de PV en fuyant à travers les ronces.",r=>{mzHurt(r,.1);return"Tu t'échappes à travers les ronces : −10 % de PV."}]]},
 {id:"totem",i:"🗿",n:"Totem de l'Obélisque",d:"Un totem gravé de trois symboles s'illumine à ton approche.",o:[
  ["Symbole de force","Attaque +10 % jusqu'à la fin de la course.",r=>{r.buf.atk+=.1;return"Tes dinos se sentent plus forts : ATQ +10 %."}],
  ["Symbole de vigueur","PV max +12 % jusqu'à la fin de la course.",r=>{r.buf.hp+=.12;return"Tes dinos se sentent plus résistants : PV max +12 %."}],
  ["Symbole de fortune","+50 🦷.",r=>"+"+mzGain(r,50)+" 🦷 tombent du totem."]]},
 {id:"eboul",i:"🪨",n:"Éboulement",d:"Le passage est à moitié effondré. Un guide propose de te montrer un détour.",o:[
  ["Passer en force","−12 % de PV.",r=>{mzHurt(r,.12);return"Les rochers t'écorchent : −12 % de PV."}],
  ["Payer le guide","−30 🦷.",r=>{r.crocs-=30;return"Le guide te fait passer par un tunnel sûr."},r=>r.crocs>=30]]},
 {id:"ermite",i:"🧙",n:"L'ermite des cavernes",d:"Un vieil homme couvert de peintures tribales médite près d'un feu.",o:[
  ["Demander une purification","Retire une malédiction.",r=>{const c=r.relics.filter(k=>RELICS[k]&&RELICS[k].r==="x"),k=c[rnd(c.length)];r.relics.splice(r.relics.indexOf(k),1);return"L'ermite chasse "+RELICS[k].i+" "+RELICS[k].n+"."},mzHasCurse],
  ["Méditer avec lui","Soigne 20 % des PV.",r=>{mzHeal(r,.2);return"La méditation apaise ton équipe : +20 % de PV."}]]},
 {id:"fontaine",i:"🌈",n:"Fontaine prismatique",d:"L'eau change de couleur à chaque reflet. On y jette des crocs pour faire un vœu.",o:[
  ["Jeter 25 🦷","Une relique commune au hasard.",r=>{r.crocs-=25;const k=mzChoices(r,"start",1)[0];if(!k)return"La fontaine reste muette.";mzAddRelic(r,k);return"La fontaine t'offre "+RELICS[k].i+" "+RELICS[k].n+" !"},r=>r.crocs>=25],
  ["Boire","Soigne 15 % des PV.",r=>{mzHeal(r,.15);return"L'eau fraîche redonne des forces : +15 % de PV."}]]},
 {id:"oeufdor",i:"🥚",n:"Œuf doré",d:"Un œuf d'or pur repose sur un piédestal, entouré de symboles de mise en garde.",o:[
  ["Le prendre","Un œuf rare pour ton incubateur (définitif), mais une malédiction.",r=>{const ok=addEgg("rare")!==false,c=mzCurse(r);return(ok?"Tu emportes l'œuf 🪺 !":"Ton incubateur est plein…")+(c?" Malédiction : "+RELICS[c].i+" "+RELICS[c].n+".":"")}],
  ["Le laisser","Il ne se passe rien.",()=>"Certains trésors sont mieux là où ils sont."]]},
 {id:"embus",i:"🦖",n:"Embuscade",d:"Un prédateur corrompu surgit des hautes herbes, les yeux luisants.",o:[
  ["Affronter l'élite","Un combat d'élite ; une relique en cas de victoire.",r=>{mzEvFight(r,"e");return"Le prédateur charge !"}],
  ["Fuir","−8 % de PV.",r=>{mzHurt(r,.08);return"Tu t'enfuis de justesse : −8 % de PV."}]]},
 {id:"etoile",i:"🌠",n:"Étoile filante",d:"Une étoile traverse le ciel au-dessus de l'île. Fais un vœu !",o:[
  ["Vœu de force","Le prochain combat commence avec la super attaque prête.",r=>{r.nextSp=1;return"Une énergie brûlante t'envahit : super attaque prête au prochain combat."}],
  ["Vœu de santé","Soigne 25 % des PV.",r=>{mzHeal(r,.25);return"Une douce lumière soigne ton équipe : +25 % de PV."}]]},
 {id:"pisteur",i:"🧓",n:"Le vieux pisteur",d:"Un pisteur édenté collectionne les reliques. Il t'en propose un bon prix.",o:[
  ["Vendre ta dernière relique","+60 🦷.",r=>{const own=r.relics.filter(k=>RELICS[k]&&RELICS[k].r!=="x"),k=own[own.length-1];r.relics.splice(r.relics.lastIndexOf(k),1);return"Tu cèdes "+RELICS[k].i+" "+RELICS[k].n+" : +"+mzGain(r,60,true)+" 🦷."},r=>r.relics.some(k=>RELICS[k]&&RELICS[k].r!=="x")],
  ["Partir","Il ne se passe rien.",()=>"Le pisteur hausse les épaules."]]}];
function mzEvOpt(i){const run=mzRun(),p=run&&run.pend;if(!p||p.t!=="event")return;const E=MZ_EV.find(x=>x.id===p.id),o=E&&E.o[i];if(!o||(o[3]&&!o[3](run)))return;
 const txt=o[2](run);
 if(run.cur&&!run.pend){save();toast(E.i+" "+txt,2600);mzFight();return}
 if(run.pend===p)run.pend={t:"note",i:E.i,n:E.n,txt};else if(txt)toast(E.i+" "+txt,3200);save();sfx&&sfx("tap");renderMaze()}
/* ---- campement ---- */
const mzCampHeal=run=>.35-mzDepth(run.depth).camp+.1*mzUp("camp");
function mzCamp(i){const run=mzRun();if(!run||!run.pend||run.pend.t!=="camp")return;let txt="";
 if(i===0){const h=mzCampHeal(run);mzHeal(run,h);mzRevive(run,.25);txt="Ton équipe se repose : +"+pc(h)+" de PV, les dinos KO se relèvent."}
 else if(i===1){run.buf.atk+=.08;txt="Griffes aiguisées : attaque +8 % jusqu'à la fin de la course."}
 else txt="+"+mzGain(run,30)+" 🦷 trouvés dans les braises.";
 run.pend={t:"note",i:"🏕️",n:"Campement",txt};save();sfx&&sfx("buy");renderMaze()}
/* ---- marchand ---- */
const mzPrice=r=>Math.round(({c:42,r:72,l:125}[r]||50)*(1-.15*mzUp("deal")));
function mzStock(run){const own=new Set(run.relics),out=[],pick=r=>{const p=Object.keys(RELICS).filter(k=>RELICS[k].r===r&&!own.has(k)&&!out.includes(k));if(p.length)out.push(p[rnd(p.length)])};
 pick("c");pick("c");pick("r");pick(Math.random()<.5?"r":"l");return out.map(k=>({k,p:mzPrice(RELICS[k].r)}))}
const MZ_SVC=[{k:"heal",i:"🩹",n:"Soins : +25 % de PV",c:30,ok:r=>r.hp.some(x=>x>0&&x<1),fx:r=>mzHeal(r,.25)},
 {k:"purge",i:"✨",n:"Purification : retire une malédiction",c:55,ok:mzHasCurse,fx:r=>{const c=r.relics.filter(k=>RELICS[k]&&RELICS[k].r==="x");r.relics.splice(r.relics.indexOf(c[rnd(c.length)]),1)}},
 {k:"herb",i:"🌿",n:"Herbe de soin pour ta sacoche (définitive)",c:35,ok:()=>true,fx:()=>{ens();if(S.pouch)S.pouch.heal=Math.min(POUCH_MAX,(S.pouch.heal||0)+1)}}];
function mzBuy(i,el){const run=mzRun(),p=run&&run.pend;if(!p||p.t!=="shop")return;const it=p.items[i];if(!it||it.sold)return;if(run.crocs<it.p){toast("Il faut "+it.p+" 🦷.");return}
 run.crocs-=it.p;it.sold=1;const R=mzAddRelic(run,it.k);mzFx(el);save();sfx&&sfx("buy");if(R)toast(R.i+" "+R.n+" : "+R.d,3200);renderMaze()}
function mzSvc(k){const run=mzRun(),p=run&&run.pend;if(!p||p.t!=="shop")return;const s=MZ_SVC.find(x=>x.k===k);if(!s||p.svc[k]||!s.ok(run))return;const c=Math.round(s.c*(1-.15*mzUp("deal")));
 if(run.crocs<c){toast("Il faut "+c+" 🦷.");return}run.crocs-=c;p.svc[k]=1;s.fx(run);save();sfx&&sfx("buy");toast(s.i+" "+s.n,2200);renderMaze()}
function mzLeave(){const run=mzRun();if(!run||!run.pend||run.pend.t!=="shop")return;run.pend=null;save();renderMaze()}
/* ---- fin de course ---- */
function mzFinish(win){const run=mzRun();if(!run)return null;const M=S.maze,d=run.depth,st=run.st,fe=(st.f||0)+(st.e||0),b=st.b||0,m=1+.15*d;
 const mk=Math.round(((st.f||0)+3*(st.e||0)+8*b+(win?12:0))*(1+.25*d)),R={stone:Math.round((fe*25+b*150)*m),essence:Math.round((fe*2+b*10)*m)};
 if(b)R.shards=Math.round(b*4*m);if(win)R.tickets=1+Math.floor(d/3);
 give(R);M.marks+=mk;M.runs++;M.bestAct=Math.max(M.bestAct,run.act+(win?1:0));
 if(win){M.wins++;M.top=Math.max(M.top,d);if(d>=M.asc&&M.asc<MZ_MAXD)M.asc=d+1;mzSelD=null}
 M.last={win:!!win,d,act:run.act,R,mk,rel:run.relics.slice(),st:{...st},at:Date.now()};M.run=null;bump("mazeRuns");save();return M.last}
function mzSumInner(L){return `<div class="todohead"><b>${L.win?"🏆 Labyrinthe vaincu !":"💀 Course terminée à l'acte "+(L.act+1)+"/3"}</b><span class="chip">Profondeur ${L.d}</span></div>
 <div class="tiny muted">${L.st.f||0} combat(s), ${L.st.e||0} élite(s), ${L.st.b||0} gardien(s) vaincus${L.win&&L.d+1<=MZ_MAXD&&S.maze.asc>L.d?" · profondeur "+(L.d+1)+" débloquée !":""}</div>
 <div style="margin-top:6px;font-size:15px">${fmt(L.R)} <b class="mzmk">🌀 +${L.mk}</b></div>${L.rel.length?`<div class="mzrelmini">${L.rel.map(k=>RELICS[k]?`<span title="${esc(RELICS[k].n)}">${RELICS[k].i}</span>`:"").join("")}</div>`:""}`}
function mzAbandon(){const run=mzRun();if(!run)return;if(!confirm("Abandonner la course ? Tu gardes les récompenses déjà méritées (combats et gardiens vaincus)."))return;
 if(fight&&fight.o&&fight.o.mode==="maze"&&!fight.over)fight=null;mzFinish(false);toast("Course abandonnée.");renderMaze()}
/* ---- combats : MODES.maze construit les ennemis, mzSetup applique PV conservés et reliques ---- */
function mzLevel(run,row,kind){const fr=kind==="b"?[.84,.98,1.12][run.act]:[.7,.84,.96][run.act]+(row||0)*.02;return Math.max(3,Math.round(run.n0*fr))}
MODES.maze=function(o){const run=mzRun(),act=run?run.act:0,A0=MZ_ACTS[act],kind=o.kind||"f",dp=mzDepth(run?run.depth:0),st=mzStats(run),boss=kind==="b",elite=kind==="e";
 const n=mzLevel(run||{n0:10,act:0},o.row,kind),z=ZONES.find(x=>x[0]===A0.z)||ZONES[0],em=z[1];
 const hp=(1+dp.ehp)*(elite?1.15:1)*(boss?1+dp.bhp+(act===2?dp.fhp:0):1),atk=(1+dp.eatk+(st.eatk||0))*(elite||boss?1+dp.batk:1);
 const emo=[em[rnd(3)],em[rnd(3)],boss?"👹":elite?"🦖":em[rnd(3)]],els=[EL[rnd(3)],EL[rnd(3)],boss||elite?A0.el:EL[rnd(3)]];
 const en=mkEnemies(n,{emo,names:["Labyrinthe · Ennemi","Labyrinthe · Ennemi",boss?"Gardien du labyrinthe · "+A0.z:"Labyrinthe · "+(elite?"Élite":"Ennemi")],hp,atk,boss,els});
 en.forEach(e=>{e.tr=""});
 if(elite||boss){const e=en[2];if(elite){e.mzElite=1;e.hp=e.max=Math.round(e.max*1.25);e.tr=TKEYS[rnd(TKEYS.length)];if(e.tr==="shield")e.sh=Math.round(e.max*.2);if(e.tr==="berserk")e.a0=e.atk}
  if(typeof ES_TOWER!=="undefined"){e.esk=ES_TOWER[rnd(ES_TOWER.length)];e.skcd=ES_FIRST}}
 return{eq:n,label:"Labyrinthe · Acte "+(act+1)+" · "+A0.z+" · "+MZT[kind].n,enemies:en}};
function mzSetup(f){const run=mzRun();if(!run)return;const st=mzStats(run);f.mzSt=st;f.mzOn=true;
 const hm=Math.max(.3,1+(st.hp||0));f.mx=f.mx.map(v=>Math.max(1,Math.round(v*hm)));
 f.hp=f.mx.map((v,k)=>{const r=run.hp[k]===undefined?1:run.hp[k];return r>0?Math.max(1,Math.round(v*Math.min(1,r))):0});if(f.hp.every(h=>h<=0))f.hp[0]=1;
 if(f.o.kind==="f"){f.wave=1;f.mzW0=1}
 if(st.sp0)f.sp=Math.max(f.sp,st.sp0);if(run.nextSp){f.sp=100;run.nextSp=0}
 if(st.shield0)f.buff.shield=Math.max(f.buff.shield||0,st.shield0);if(st.roar0)f.buff.atk=Math.max(f.buff.atk||0,st.roar0);
 if(st.cd0)f.cd=f.cd.map(()=>0);if(st.cdx)f.cd=f.cd.map(v=>v+st.cdx);if(st.stun0)f.stun=Math.max(f.stun||0,1);f.mzFirst=!!st.first;
 const ko=f.hp.filter(h=>h<=0).length;
 f.log="🌀 "+MZT[f.o.kind].n+" du labyrinthe"+(run.relics.length?" · "+run.relics.length+" relique"+(run.relics.length>1?"s":"")+" active"+(run.relics.length>1?"s":""):"")+(ko?" · "+ko+" dino KO (soigne-le au campement)":"");
 save();document.querySelectorAll("#fxLayer .wavebn").forEach(x=>x.remove());f._lw=undefined;renderBattle();
 const bn=[...document.querySelectorAll("#fxLayer .wavebn")].pop(),s=bn&&bn.querySelector("small");if(s)s.textContent=MZT[f.o.kind].i+" "+MZT[f.o.kind].n+" · "+(3-f.wave)+" ennemi"+(3-f.wave>1?"s":"")}
function mzKeepHp(f){const run=mzRun();if(!run||!f||!f.mx)return;run.hp=f.hp.map((h,k)=>h>0?+(h/f.mx[k]).toFixed(4):0);save()}
const _sbMz=startBattle;startBattle=function(o){const t=o||lastB;
 if(t&&t.mode==="maze"){const run=mzRun();
  if(!run||!run.cur||t.key!==mzKey(run)){if(!o){lastB=null;return _sbMz({mode:"story",n:Math.min(100,S.stage+1)})}toast("Choisis une case sur la carte du labyrinthe.");go("maze");return}
  if(fight&&fight.o&&fight.o.key===t.key&&fight.mzOn&&!fight.over){go("battle");return}}
 else if(mzOn(fight)&&!fight.over)mzKeepHp(fight);
 const r=_sbMz(o),f=fight;if(f&&f.o&&f.o.mode==="maze"&&!f.mzOn)mzSetup(f);return r};
/* victoire d'un combat : appelée par 80-modes (win → eventWin) */
function mzFightWin(f,n){const run=mzRun();if(!run||!run.cur)return{R:{},extra:"",loot:[]};const st=mzStats(run),kind=run.cur.t,x=run.cur.x||{};
 run.hp=f.hp.map((h,k)=>{let r=h>0?h/f.mx[k]:0;if(r>0)r=Math.min(1,r+(st.post||0));else if(st.revive)r=st.revive;return +r.toFixed(4)});
 const g=mzGain(run,({f:12+rnd(8),e:26+rnd(10),b:55}[kind]||12)*(x.dbl?2:1));run.st[kind]=(run.st[kind]||0)+1;S.maze.fights++;bump("mazef");mzClear(run);
 let extra=`🦷 +${g} crocs`,sum="";
 if(kind==="b"){if(run.act>=2){const L=mzFinish(true);sum=`<div class="panel mzsum win">${mzSumInner(L)}</div>`;extra+=" · 🏆 LABYRINTHE VAINCU !"}
  else{run.pend={t:"relic",ch:mzChoices(run,"boss"),src:"👑 Gardien vaincu ! Choisis une relique avant l'acte suivant",next:1};extra+=" · 👑 relique de gardien à choisir"}}
 else if(kind==="e"||Math.random()<.3){run.pend={t:"relic",ch:mzChoices(run,kind==="e"?"elite":"fight"),src:kind==="e"?"💀 Élite vaincue : choisis une relique":"⚔️ Butin du combat : choisis une relique"};extra+=" · 🎁 relique à choisir"}
 save();return{R:{stone:Math.round((10+2*n)*(kind==="b"?3:kind==="e"?1.5:1))},extra:`<div class="tiny ok" style="margin-top:4px">${extra}</div>`+sum,loot:[]}}
const _ewMz=eventWin;eventWin=function(f,n){return f&&f.o&&f.o.mode==="maze"?mzFightWin(f,n):_ewMz(f,n)};
const _slMz=settleLose;settleLose=function(){const f=fight;_slMz();if(f&&f.o&&f.o.mode==="maze"&&mzRun()){const L=mzFinish(false);f.report=`<div class="panel mzsum lose">${mzSumInner(L)}</div>`+missHTML(f.snap);save()}};
const _efMz=escapeFight;escapeFight=function(){const f=fight,mz=f&&f.o&&f.o.mode==="maze";if(mz&&f.mzOn&&!f.over)mzKeepHp(f);const r=_efMz.apply(this,arguments);if(mz)go("maze");return r};
if(typeof balKey==="function"){const _bkMz=balKey;balKey=function(f){return f&&f.o&&f.o.mode==="maze"?"labyrinthe acte "+(((mzRun()||{}).act||0)+1)+" "+(MZT[f.o.kind]||MZT.f).n:_bkMz(f)}}
/* ---- effets des reliques pendant les combats ---- */
function mzBias(f){const n=(f.mzSt&&f.mzSt.bias)||0;if(!n)return;const el=sp(T3()[0]).element,idx=f.orbs.map((c,i)=>c===el?-1:i).filter(i=>i>=0);let need=n-(9-idx.length);
 while(need>0&&idx.length){f.orbs[idx.splice(rnd(idx.length),1)[0]]=el;need--}}
const mzComboMul=(st,nc)=>st.combo?(1+nc*(.15+st.combo))/(1+nc*.15):1;
const _atMz=atkOf;atkOf=function(k){const v=_atMz(k),f=fight;if(!mzOn(f))return v;const st=f.mzSt,d=T3()[k],e=f.enemies[f.wave];let m=1+(st.atk||0);
 if(st.low&&f.hp[k]>0&&f.hp[k]<f.mx[k]*.5)m*=1+st.low;if(e&&st.big&&(e.boss||e.mzElite))m*=1+st.big;
 if(e&&st.adv&&d&&BEAT[sp(d).element]===e.el)m*=(1.3+st.adv)/1.3;if(f.mzSup)m*=1+(st.sup||0);if(f.mzOrbMul)m*=f.mzOrbMul;return v*m};
const _opMz=orbPreview;orbPreview=function(c){const v=_opMz(c),f=fight;if(!mzOn(f))return v;const st=f.mzSt,nc=c===f.last?f.combo+1:0;
 return Math.round(v*(1+(st["o_"+c]||0))*(f.mzFirst?2:1)*mzComboMul(st,nc))};
const _toMz=tapOrb;tapOrb=function(i){const f=fight;if(!mzOn(f)||f.over||!f.orbs)return _toMz(i);const st=f.mzSt,c=f.orbs[i],nc=c===f.last?f.combo+1:0;
 f.mzOrbMul=(1+(st["o_"+c]||0))*(f.mzFirst?2:1)*mzComboMul(st,nc);f.mzFirst=false;try{return _toMz(i)}finally{f.mzOrbMul=0}};
const _spMz=special;special=function(){const f=fight;if(!mzOn(f))return _spMz();f.mzSup=true;try{return _spMz()}finally{f.mzSup=false}};
const _hdMz=hitDino;hitDino=function(k,raw,e){const f=fight;if(!mzOn(f))return _hdMz(k,raw,e);const st=f.mzSt,b=f.hp[k],r=_hdMz(k,raw*Math.max(.3,1+(st.taken||0)),e),dm=Math.max(0,b-f.hp[k]);
 if(st.thorns&&dm>0&&e&&e.hp>0){const t=Math.round(dm*st.thorns);e.hp-=t;f.log+=" (🌵 "+t+")"}
 const run=mzRun();if(b>0&&f.hp[k]<=0&&st.phoenix&&run&&!run.phx){run.phx=1;f.hp[k]=Math.max(1,Math.round(f.mx[k]*.4));const nm=sp(T3()[k]).name;f.log+=" · 🐣 "+nm+" renaît de ses cendres !";if(typeof banner==="function")banner("🐣 PHÉNIX",esc(nm)+" revient au combat","")}
 return r};
const _keMz=killEnemy;killEnemy=function(){const f=fight;if(!mzOn(f))return _keMz();const st=f.mzSt,w=f.wave;
 if(st.kill)f.hp=f.hp.map((h,k)=>h>0?Math.min(f.mx[k],h+Math.round(f.mx[k]*st.kill)):h);const r=_keMz();if(st.stun0&&!f.over&&f.wave!==w)f.stun=Math.max(f.stun||0,1);return r};
const _etMz=enemyTurn;enemyTurn=function(){const f=fight;if(mzOn(f)&&!f.over&&f.mzSt.regen)f.hp=f.hp.map((h,k)=>h>0?Math.min(f.mx[k],h+Math.round(f.mx[k]*f.mzSt.regen)):h);return _etMz()};
if(typeof pouchUse==="function"){const bagWrap=fn=>function(){const b=POUCH_PER_FIGHT;if(mzOn(fight))POUCH_PER_FIGHT=b+(fight.mzSt.bag||0);try{return fn.apply(this,arguments)}finally{POUCH_PER_FIGHT=b}};pouchUse=bagWrap(pouchUse);pouchOpen=bagWrap(pouchOpen)}
const _rbMz=renderBattle;renderBattle=function(){const f=fight;if(mzOn(f)&&!f.over&&f.orbs&&f.orbs!==f._mzOb){f._mzOb=f.orbs;mzBias(f)}
 _rbMz();if(!f||!f.o||f.o.mode!=="maze"||!f.mx||!f.mzOn)return;const run=mzRun(),box=$$("battleArea");if(!box)return;
 if(!f.over&&run&&run.cur)run.hp=f.hp.map((h,k)=>h>0?+(h/f.mx[k]).toFixed(4):0);
 if(f.mzW0){const t=$$("battleTitle");if(t)t.textContent=f.zone+" · Ennemi "+(f.wave-f.mzW0+1)+"/"+(3-f.mzW0);
  document.querySelectorAll("#fxLayer .wavebn b").forEach(b=>{const m=/^VAGUE (\d)$/.exec(b.textContent);if(m&&!b.dataset.mz){b.dataset.mz=1;b.textContent="VAGUE "+(m[1]-f.mzW0)}})}
 if(!f.over&&run&&run.relics.length){const ch=box.querySelector(".sHud .fchips");if(ch&&!ch.querySelector(".mzchip"))ch.insertAdjacentHTML("beforeend",`<span class="chip mzchip" title="${esc(run.relics.map(k=>RELICS[k]?RELICS[k].n:"").join(", "))}">🌀 ${run.relics.slice(-6).map(k=>RELICS[k]?RELICS[k].i:"").join("")}${run.relics.length>6?" +"+(run.relics.length-6):""}</span>`)}
 if(f.over){const res=box.querySelector(".result:not(.tiny)");if(res&&!res.querySelector(".mzgo")){res.querySelectorAll("button").forEach(b=>b.remove());
  res.insertAdjacentHTML("beforeend",`<button class="wide mzgo" onclick="go('maze')">🌀 ${f.over==="win"&&run?"CONTINUER LE LABYRINTHE":"BILAN DE LA COURSE"}</button>`)}}};
/* ---- écran du labyrinthe ---- */
const mzPort=d=>PREFS.art==="svg"?`<span class="pt">${portrait(d.type,true)}</span>`:art(sp(d).e);
function mzRelCard(k,act,extra,off){const R=RELICS[k];if(!R)return"";return `<button class="mzrel r-${R.r}" ${off||!act?"disabled":`onclick="${act}"`}><span class="ri">${R.i}</span><b>${esc(R.n)}</b><small>${MZ_RAR[R.r]}</small><span>${esc(R.d)}</span>${extra||""}</button>`}
function mzPendHTML(run){const p=run.pend;
 if(!p){if(run.cur){const T=MZT[run.cur.t];return `<div class="panel mzpend"><div class="row"><div class="evi">${T.i}</div><div class="grow"><b>${T.n} en cours</b><div class="muted tiny">Ton équipe garde ses PV actuels. Gagne pour avancer sur la carte.</div></div></div><button class="wide red" onclick="mzFight()">⚔ COMBATTRE</button></div>`}
  return `<div class="panel mzhint tiny muted">${run.pos.r<0?"Choisis ta première case, à gauche de la carte.":"Choisis la case suivante (cases qui clignotent). Le gardien 👑 attend tout à droite."}</div>`}
 if(p.t==="start"||p.t==="relic")return `<div class="panel mzpend"><b>${p.t==="start"?"🎒 Choisis ta relique de départ":esc(p.src||"🎁 Choisis une relique")}</b><div class="muted tiny">Les reliques restent actives jusqu'à la fin de la course.</div><div class="mzrels">${p.ch.map(k=>mzRelCard(k,`mzTake('${k}',this)`)).join("")}</div>${p.t==="relic"?`<button class="wide secondary" onclick="mzSkip()">PASSER (+8 🦷)</button>`:""}</div>`;
 if(p.t==="event"){const E=MZ_EV.find(x=>x.id===p.id);if(!E)return"";return `<div class="panel mzpend mzev"><div class="row"><div class="evi">${E.i}</div><div class="grow"><b>${esc(E.n)}</b><div class="muted">${esc(E.d)}</div></div></div><div class="mzopts">${E.o.map((o,i)=>{const ok=!o[3]||o[3](run);return `<button class="${ok?"":"secondary"}" ${ok?`onclick="mzEvOpt(${i})"`:"disabled"}><b>${esc(o[0])}</b><small>${esc(o[1])}</small></button>`}).join("")}</div></div>`}
 if(p.t==="note")return `<div class="panel mzpend"><div class="row"><div class="evi">${p.i||"🌀"}</div><div class="grow"><b>${esc(p.n||"")}</b><div>${esc(p.txt||"")}</div></div></div><button class="wide" onclick="mzOk()">CONTINUER</button></div>`;
 if(p.t==="camp"){const h=mzCampHeal(run),O=[["🛌","Se reposer","+"+pc(h)+" de PV ; les dinos KO se relèvent à 25 %."],["🗡️","Aiguiser les griffes","Attaque +8 % jusqu'à la fin de la course."],["🔥","Fouiller les braises","+30 🦷 (crocs)."]];
  return `<div class="panel mzpend"><div class="row"><div class="evi">🏕️</div><div class="grow"><b>Campement</b><div class="muted">Un feu crépite à l'abri des rochers. Que fait ton équipe ?</div></div></div><div class="mzopts">${O.map((o,i)=>`<button onclick="mzCamp(${i})"><b>${o[0]} ${o[1]}</b><small>${o[2]}</small></button>`).join("")}</div></div>`}
 if(p.t==="shop"){const dl=1-.15*mzUp("deal");return `<div class="panel mzpend"><div class="row"><div class="evi">🛒</div><div class="grow"><b>Marchand nomade</b><div class="muted tiny">Tu as <b>${run.crocs} 🦷</b>. Les crocs disparaissent à la fin de la course : dépense-les !</div></div></div>
  <div class="mzrels">${p.items.map((it,i)=>mzRelCard(it.k,`mzBuy(${i},this)`,`<em class="mzprice ${it.sold?"sold":run.crocs>=it.p?"":"no"}">${it.sold?"VENDU":it.p+" 🦷"}</em>`,it.sold||run.crocs<it.p)).join("")}</div>
  <div class="mzopts">${MZ_SVC.map(s=>{const c=Math.round(s.c*dl),ok=!p.svc[s.k]&&s.ok(run)&&run.crocs>=c;return `<button class="${ok?"":"secondary"}" ${ok?`onclick="mzSvc('${s.k}')"`:"disabled"}><b>${s.i} ${esc(s.n)}</b><small>${p.svc[s.k]?"déjà pris":c+" 🦷"}</small></button>`}).join("")}</div>
  <button class="wide secondary" onclick="mzLeave()">QUITTER LE MARCHAND</button></div>`}
 return""}
function mzMapHTML(run){const m=run.map,z=stageZone(MZ_ACTS[run.act].z),X=r=>7+r*14.3,Y=c=>[20,50,80][c],reach=mzReach(run),isR=(r,c)=>reach.some(([a,b])=>a===r&&b===c),inP=(r,c)=>run.path.some(([a,b])=>a===r&&b===c),isCur=(r,c)=>!!(run.cur&&run.cur.r===r&&run.cur.c===c);
 let ln="";for(let r=0;r<6;r++)m[r].forEach((nd,c)=>{if(!nd)return;nd.n.forEach(c2=>{if(!m[r+1]||!m[r+1][c2])return;const on=inP(r,c)&&(inP(r+1,c2)||isCur(r+1,c2)),nx=run.pos.r===r&&run.pos.c===c&&isR(r+1,c2);ln+=`<path d="M${X(r)} ${Y(c)} L${X(r+1)} ${Y(c2)}" class="${on?"on":nx?"nx":""}"/>`})});
 const nodes=m.map((row,r)=>row.map((nd,c)=>{if(!nd)return"";const ok=isR(r,c),cls=["mznode","t-"+nd.t,inP(r,c)?"done":"",run.pos.r===r&&run.pos.c===c?"here":"",isCur(r,c)?"cur":"",ok?"reach":""].filter(Boolean).join(" ");
  return `<button class="${cls}" style="left:${X(r)}%;top:${Y(c)}%" ${ok?`onclick="mzEnter(${r},${c})"`:"disabled"} title="${MZT[nd.t].n}" data-r="${r}" data-c="${c}">${MZT[nd.t].i}</button>`}).join("")).join("");
 return `<div class="mzmap z-${z}">${sceneHTML(z)}<svg class="mzlines" viewBox="0 0 100 100" preserveAspectRatio="none">${ln}</svg>${nodes}</div>`}
function mzSideHTML(run){const t=S.team.slice(0,3);
 const team=t.map((d,k)=>{const r=run.hp[k]===undefined?1:run.hp[k],col=r>.5?"#62e7a0,#d4ff80":r>.25?"#ffd15c,#ff9d3c":"#ff536c,#ff9d3c";
  return `<div class="mzt ${r>0?"":"ko"}"><span class="mzp">${mzPort(d)}</span><div class="grow"><b class="tiny">${k+1}. ${esc(sp(d).name)}</b><div class="progress"><i style="width:${Math.round(r*100)}%;background:linear-gradient(90deg,${col})"></i></div><div class="tiny muted">${r>0?Math.round(r*100)+" % des PV":"KO"}</div></div></div>`}).join("");
 const bufs=[run.buf.atk?"🗡️ ATQ +"+pc(run.buf.atk):"",run.buf.hp?"❤️ PV max +"+pc(run.buf.hp):"",mzUp("hp")?"❤️ Vigueur +"+pc(.05*mzUp("hp")):""].filter(Boolean);
 const rel=run.relics.map(k=>{const R=RELICS[k];return R?`<div class="mzrl r-${R.r}"><span class="ri">${R.i}</span><div><b class="tiny">${esc(R.n)}</b><div class="tiny muted">${esc(R.d)}</div></div></div>`:""}).join("")||`<div class="tiny muted">Aucune relique pour l'instant.</div>`;
 return `<div class="panel mzteam"><div class="todohead"><b>🦖 Équipe</b><span class="chip mzcrocs">🦷 ${run.crocs}</span></div>${team}<div class="tiny muted" style="margin-top:4px">Les PV sont conservés par place (1, 2, 3) entre les combats.</div>${bufs.length?`<div class="fchips">${bufs.map(b=>`<span class="chip good">${b}</span>`).join("")}</div>`:""}</div>
 <div class="panel mzrelbox"><b>🌀 Reliques (${run.relics.length})</b>${rel}</div>
 <div class="panel tiny"><b>Profondeur ${run.depth}</b><div class="muted">${mzDepthList(run.depth)}</div><button class="wide secondary" style="margin-top:8px" onclick="mzAbandon()">ABANDONNER LA COURSE</button></div>`}
function mzIntroHTML(){const M=S.maze,d=mzSelD===null?M.asc:Math.min(mzSelD,M.asc),n0=mzN0(),rs={n0,act:0};
 return `<div class="panel mzintro"><b>Comment ça marche</b><ul class="mzhow"><li>3 actes (Jungle, Volcan, Obélisque) : à chaque rangée, choisis ta route parmi ⚔️ combats, 💀 élites, ❓ mystères, 🏕️ campements, 🛒 marchands et 💎 trésors, jusqu'au gardien 👑.</li><li>Les PV de ton équipe sont <b>conservés d'un combat à l'autre</b> : soigne-toi aux campements.</li><li>Les <b>reliques</b> s'accumulent pendant la course et changent les règles du combat. Les crocs 🦷 se dépensent chez le marchand.</li><li>Fin de course : pierres, essences, fragments, tickets (si tu gagnes) et <b>marques 🌀</b> pour la boutique permanente. Chaque victoire débloque une profondeur plus difficile et plus rentable.</li></ul>
 <div class="muted tiny">Niveau des ennemis d'après ta progression dans l'histoire (ou le niveau de ton équipe s'il est plus élevé) : ${mzLevel(rs,0,"f")} au début, gardien final ${mzLevel({n0,act:2},0,"b")}.</div>
 <div style="margin-top:8px"><b>Profondeur</b></div><div class="eltabs mzdepth">${[...Array(M.asc+1).keys()].map(i=>`<button class="${i===d?"on":""}" onclick="mzSelD=${i};renderMaze()">${i}</button>`).join("")}${M.asc<MZ_MAXD?`<button disabled title="Gagne une course en profondeur ${M.asc} pour la débloquer">🔒 ${M.asc+1}</button>`:""}</div>
 <div class="tiny muted">${esc(mzDepthList(d))} · marques ×${fmtB(+(1+.25*d).toFixed(2))}</div>
 <div class="mzteamp">${S.team.slice(0,3).map(x=>`<span class="mzp">${mzPort(x)}</span>`).join("")}<div class="tiny muted">Ton équipe actuelle part dans le labyrinthe (tu peux la changer dans Équipe).</div></div>
 <button class="wide red mzstart" onclick="mzStart()">🌀 ENTRER DANS LE LABYRINTHE</button></div>`}
function mzMetaHTML(){const M=S.maze;
 const up=MZ_UP.map(u=>{const lv=mzUp(u.k),mx=lv>=u.max,c=u.c[lv];return `<div class="pprow"><span class="ppi">${u.i}</span><div class="grow"><b>${esc(u.n)}</b> <span class="chip">${lv}/${u.max}</span><div class="muted tiny">${esc(u.d)}</div></div><button class="${!mx&&M.marks>=c?"":"secondary"}" ${mx?"disabled":""} onclick="mzUpBuy('${u.k}')">${mx?"MAX":c+" 🌀"}</button></div>`}).join("");
 const it=MZ_SHOP.map(x=>{const b=M.bought[x.k]||0,full=b>=x.lim;return `<div class="pprow"><span class="ppi">${x.i}</span><div class="grow"><b>${esc(x.n)}</b><div class="muted tiny">${b}/${x.lim} cette semaine</div></div><button class="${!full&&M.marks>=x.c?"":"secondary"}" ${full?"disabled":""} onclick="mzShopBuy('${x.k}')">${full?"ÉPUISÉ":x.c+" 🌀"}</button></div>`}).join("");
 const cx=Object.keys(RELICS).map(k=>{const R=RELICS[k],h=M.codex[k];return `<div class="mzcx r-${R.r} ${h?"":"no"}" title="${h?esc(R.n+" — "+R.d):"???"}">${h?R.i:"❓"}</div>`}).join("");
 return (M.last?`<div class="panel mzsum ${M.last.win?"win":"lose"}">${mzSumInner(M.last)}</div>`:"")+
 `<div class="panel"><div class="todohead"><b>📊 Tes courses</b><span class="chip">🌀 ${M.marks} marques</span></div><div class="fchips"><span class="chip">Courses ${M.runs}</span><span class="chip good">Victoires ${M.wins}</span><span class="chip">Meilleure profondeur gagnée : ${M.top>=0?M.top:"—"}</span><span class="chip">Combats gagnés ${M.fights}</span></div></div>
 <div class="sectionhead"><h2>Boutique des marques</h2><span class="tag">🌀 ${M.marks}</span></div><div class="panel mzshopbox"><b>Améliorations permanentes du labyrinthe</b>${up}</div><div class="panel"><b>Objets</b>${it}</div>
 <div class="sectionhead"><h2>Codex des reliques</h2><span class="muted tiny">${mzCodexN()} / ${Object.keys(RELICS).length} découvertes</span></div><div class="panel"><div class="mzcodex">${cx}</div></div>`}
function mzUpBuy(k){ens();const u=MZ_UP.find(x=>x.k===k),lv=mzUp(k);if(!u||lv>=u.max)return;const c=u.c[lv];if(S.maze.marks<c){toast("Il faut "+c+" 🌀");return}
 S.maze.marks-=c;S.maze.up[k]=lv+1;save();sfx&&sfx("buy");toast(u.i+" "+u.n+" : niveau "+(lv+1),2400);renderMaze()}
function mzShopBuy(k){ens();const it=MZ_SHOP.find(x=>x.k===k);if(!it)return;if((S.maze.bought[k]||0)>=it.lim){toast("Limite de la semaine atteinte.");return}if(S.maze.marks<it.c){toast("Il faut "+it.c+" 🌀");return}
 if(it.fx()===false){toast("Impossible pour l'instant (incubateur ou sac plein).");return}S.maze.marks-=it.c;S.maze.bought[k]=(S.maze.bought[k]||0)+1;save();sfx&&sfx("buy");toast(it.i+" "+it.n,2400);renderMaze()}
function renderMaze(){const el=$$("maze");if(!el)return;ens();const M=S.maze,run=M.run;
 let h=`<div class="banner"><div class="eyebrow">LABYRINTHE DES RELIQUES${run?" · PROFONDEUR "+run.depth:""}</div><h1>${run?"Acte "+(run.act+1)+" / 3 · "+esc(MZ_ACTS[run.act].z):"Le Labyrinthe des reliques"}</h1><p>${run?"Choisis ton chemin. Tes PV sont conservés d'un combat à l'autre.":"Une course rejouable à l'infini : une carte à embranchements, des reliques qui changent les règles, trois actes et leurs gardiens."}</p><div class="heroDino">🌀</div></div>`;
 if(S.stage<MZ_UNLOCK||S.team.length<3)h+=`<div class="panel"><b>🔒 Labyrinthe verrouillé</b><div class="muted tiny">Termine le niveau ${MZ_UNLOCK} de l'histoire et réunis 3 dinos pour y entrer.</div></div>`+mzMetaHTML();
 else if(!run)h+=mzIntroHTML()+mzMetaHTML();
 else h+=`<div class="mzrun"><div class="mzmain">${mzPendHTML(run)}<div class="panel mzmapbox"><div class="todohead"><b>🗺️ Acte ${run.act+1} · ${esc(MZ_ACTS[run.act].z)}</b><span class="chip">étape ${Math.max(0,run.pos.r+1)}/7</span></div>${mzMapHTML(run)}<div class="tiny muted mzlegend">${Object.values(MZT).map(t=>t.i+" "+t.n).join(" · ")}</div></div></div><aside class="mzside">${mzSideHTML(run)}</aside></div>`;
 el.innerHTML=h;if(screen==="maze"){try{bannerScenes()}catch(e){}if(typeof tipShow==="function")tipShow(el)}}
/* ---- intégration : onglet Aventure > Labyrinthe, pastille, « À faire », guide, succès, missions ---- */
document.querySelector("main").insertAdjacentHTML("beforeend",'<section id="maze" class="screen"></section>');
GRP.adv.screens.push(["maze","🌀","Labyrinthe"]);SCR2G.maze="adv";SUBS.push(["maze","🌀","Labyrinthe"]);ADV.add("maze");
BZONE.maze=()=>{const r=S.maze&&S.maze.run;return stageZone(r?MZ_ACTS[r.act].z:"Obélisque")};
const _rMz=render;render=function(){_rMz();if(screen==="maze")renderMaze()};
const _bdMz=badge;badge=function(k){if(k==="maze"){try{ens();const r=S.maze.run;return r&&(r.pend||r.cur)?1:0}catch(e){return 0}}return _bdMz(k)};
const _tdMz=todoItems;todoItems=function(){const L=_tdMz();try{ens();const M=S.maze;if(M.run)L.unshift({i:"🌀",t:"Course du Labyrinthe en cours (acte "+(M.run.act+1)+"/3)",js:"go('maze')"});else if(S.stage>=MZ_UNLOCK&&!M.runs)L.push({i:"🌀",t:"Nouveau : le Labyrinthe des reliques",js:"go('maze')"})}catch(e){}return L};
DAILY.push({id:"d_maze",t:"mazef",g:3,n:"Gagner 3 combats du Labyrinthe",r:{essence:3,stone:120}});
[20,100,300].forEach((g,i)=>PERM.push({id:"p_mazef"+g,t:"mazef",g,n:g+" combats du Labyrinthe gagnés",r:{tickets:i+1,crystal:i+1,stone:100*(i+1)}}));
ACH.push(["mz1","Explorateur du labyrinthe","Gagner une course du Labyrinthe",()=>S.maze.wins,1,{tickets:3,essence:30}],
 ["mz2","Seigneur des profondeurs","Gagner une course en profondeur 5",()=>Math.max(0,S.maze.top),5,{tickets:5,shards:30},"Seigneur du Labyrinthe"],
 ["mz3","Archiviste des reliques","Découvrir 20 reliques",()=>mzCodexN(),20,{essence:40,shards:20}],
 ["mz4","Coureur des couloirs","Gagner 60 combats dans le Labyrinthe",()=>S.maze.fights,60,{tickets:2,essence:30}]);
if(typeof TIPS!=="undefined")TIPS.maze={t:"🌀 Labyrinthe des reliques",d:"Avance de gauche à droite : chaque case est un combat ⚔️, une élite 💀, un mystère ❓, un campement 🏕️, un marchand 🛒 ou un trésor 💎. Tes PV restent d'un combat à l'autre : passe par les campements quand ton équipe est blessée. Les reliques ramassées durent jusqu'à la fin de la course.",on:()=>screen==="maze"&&!!(S.maze&&S.maze.run)};
if(typeof GUIDE!=="undefined")GUIDE.push(["Labyrinthe des reliques","Aventure > Labyrinthe (dès le niveau "+MZ_UNLOCK+" de l'histoire) : une course en 3 actes sur une carte à embranchements. Les PV sont conservés entre les combats (soigne-toi aux campements 🏕️) ; les reliques ramassées (combats, élites 💀, trésors 💎, marchand 🛒, mystères ❓) changent les règles jusqu'à la fin de la course. Les crocs 🦷 ne servent que pendant la course. À la fin : pierres, essences, fragments, tickets en cas de victoire, et marques 🌀 pour des améliorations permanentes. Chaque victoire débloque une profondeur plus difficile."]);
