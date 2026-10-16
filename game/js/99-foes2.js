/* Ennemis II (0.33) : 10 nouvelles créatures préhistoriques dessinées (idée 61), ennemis dorés rares (54), meneurs qui
   appellent des renforts (55), traits combinés au-delà du niveau 80 (65), élites avec aura et surnom (73), récompense à la
   première victoire contre chaque créature (74).
   Les nouvelles créatures remplacent parfois (F2.newP) un des deux premiers ennemis d'un combat d'histoire de leur zone
   (FOES2), décidé au premier rendu pour le vrai mode du combat. */
const F2={newP:.35,goldP:.01,callP:.1,comboP:.5};
Object.assign(BEAST,{
 arthro(c){let s="";for(let i=0;i<8;i++){const x=7+i*6.4,y=46-Math.sin(i*.7)*3;s+=S_(`M${x} ${y+2} l-2 7 M${x+2} ${y+2} l2 7`,c.dark,1.3)+EL_(x,y,4.4,3.8,i%2?c.main:c.light)+S_(`M${x-2} ${y-3} q2 3 0 6`,c.dark,1,.7)}
  return{b:s+C(58,41,5,c.dark)+S_("M60 37 Q67 30 65 25",c.dark,1.3)+S_("M58 37 Q61 29 58 25",c.dark,1.3)+P("M60 44 l4 2 l-4 1z",c.tooth),g:GEYE(60,40,1.1,c.eye)}},
 meganeura(c){return{b:EL_(40,22,16,5,c.light,-12,.55)+EL_(40,32,16,5,c.light,12,.55)+EL_(26,22,13,4,c.light,12,.45)+EL_(26,32,13,4,c.light,-12,.45)
  +EL_(30,27,22,2.8,c.main)+[0,1,2,3,4].map(i=>S_(`M${14+i*6} 25 v4`,c.dark,1,.7)).join("")+C(53,27,4,c.dark)+S_("M48 30 l-2 8 M51 30 l1 8",c.dark,1),g:GEYE(55,26,1.4,c.eye)}},
 quetzal(c){return{b:P("M30 30 L4 18 L10 30 L2 36 Z",c.dark)+P("M30 30 L58 14 L52 28 L62 32 Z",c.main)+S_("M30 30 L4 18",c.light,1,.6)+S_("M30 30 L58 14",c.light,1,.6)
  +EL_(30,32,8,5,c.main)+S_("M30 36 l-2 18 M32 36 l2 18",c.dark,1.6)+P("M36 26 Q42 14 46 12 Q44 18 40 26Z",c.main)+P("M44 10 L63 14 L45 15Z",c.tooth)+P("M42 8 Q36 2 32 6 Q38 8 43 11Z",c.glow,' opacity=".8"'),g:GEYE(45,12,1.2,c.eye)}},
 ammonite(c){return{b:C(28,36,17,c.main)+C(28,36,12,c.light,.6)+C(28,36,7.5,c.main)+C(28,36,3.5,c.dark)+[0,45,90,135,180,225,270,315].map(a=>S_(`M28 36 L${28+Math.cos(a/57.3)*17} ${36+Math.sin(a/57.3)*17}`,c.dark,1,.5)).join("")
  +P("M42 28 Q52 26 54 34 Q52 42 42 42Z",c.dark)+[0,1,2,3].map(i=>S_(`M52 ${32+i*2.5} Q60 ${30+i*4} 63 ${36+i*5}`,c.main,2)).join(""),g:GEYE(48,32,1.3,c.eye)}},
 trilobite(c){return{b:EL_(32,42,24,12,c.dark)+EL_(32,41,21,10,c.main)+[0,1,2,3,4,5,6].map(i=>S_(`M${16+i*5} 32 v18`,c.dark,1.2,.6)).join("")+EL_(32,41,4,9,c.light,0,.7)
  +P("M52 34 Q60 36 60 42 Q60 48 52 50Z",c.dark)+S_("M12 34 L4 28 M12 50 L4 56 M52 34 L58 26 M52 50 L60 56",c.dark,1.6),g:GEYE(55,38,1.1,c.eye)+GEYE(55,46,1.1,c.eye)}},
 eurypt(c){let s="";for(let i=0;i<6;i++)s+=EL_(14+i*6,44-i*.6,5,4.4-i*.2,i%2?c.main:c.light);
  return{b:S_("M10 44 Q2 40 4 32",c.dark,2.6)+P("M4 32 l-2 -6 l5 4z",c.tooth)+s+EL_(48,40,8,6,c.main)+S_("M52 36 Q60 30 62 24",c.dark,2)+P("M60 22 l4 -3 l-1 5 M62 24 l3 2",c.dark)+P("M59 21 l5 -1 l-3 4z",c.dark)
  +S_("M40 46 l-3 9 M46 46 l0 10 M52 44 l4 10",c.dark,1.6),g:GEYE(52,37,1.2,c.eye)}},
 gorgon(c){return{b:P("M12 40 Q4 38 3 32 Q8 36 14 37Z",c.dark)+P("M16 46 l-3 10 h5 l2 -9z",c.dark)+P("M38 46 l-1 10 h5 l1 -9z",c.dark)+EL_(28,40,16,8,c.main)+P("M16 44 Q28 50 42 44 Q28 48 16 44Z",c.light,' opacity=".5"')
  +P("M22 47 l-2 10 h5 l2 -9z",c.main)+P("M42 45 l0 12 h5 l-1 -11z",c.main)+P("M40 34 Q46 26 56 28 Q63 31 62 37 Q60 42 52 42 L44 42Z",c.main)+P("M50 39 L61 38 Q60 41 55 41Z",c.dark)+P("M52 40 l1.4 9 l1.6 -9z M57 40 l1 7 l1.3 -7z",c.tooth)+C(61,33,1,"#140a12"),g:GEYE(53,32,1.3,c.eye)}},
 andrew(c){return{b:P("M10 40 Q6 34 8 30 Q11 36 14 37Z",c.dark)+P("M16 46 l-3 10 h6 l1 -9z",c.dark)+P("M36 46 l-1 10 h6 l0 -9z",c.dark)+EL_(26,40,15,9,c.main)+[0,1,2].map(i=>S_(`M${18+i*6} 32 q2 4 0 8`,c.dark,1.4,.7)).join("")
  +P("M21 47 l-2 10 h6 l1 -9z",c.main)+P("M40 46 l0 11 h6 l-1 -10z",c.main)+P("M38 30 Q48 24 60 30 Q64 34 62 40 L42 44Z",c.main)+P("M44 40 L62 39 Q61 43 52 44Z",c.dark)+P("M50 40 l1 4 l1 -4z M54 40 l1 3.5 l1 -3.5z M58 40 l.8 3 l.8 -3z",c.tooth)+C(61,33,1.2,"#140a12"),g:GEYE(50,31,1.4,c.eye)}},
 dunkle(c){return{b:P("M4 36 L12 30 L12 42Z",c.dark)+P("M10 36 Q24 24 42 26 L42 46 Q24 48 10 36Z",c.main)+P("M14 37 Q26 44 40 42 Q26 40 14 37Z",c.light,' opacity=".6"')
  +P("M38 24 Q54 20 62 30 L62 40 Q54 48 38 46Z",c.rock)+P("M40 26 Q52 24 58 30 L44 32Z",c.rockL,' opacity=".7"')+P("M48 38 L63 36 L62 42 Q54 46 48 42Z",c.rockD)+P("M54 38 l2 5 l2 -5z M58 38 l1.6 4 l1.6 -4z",c.tooth)
  +P("M26 26 L30 16 L34 26Z",c.dark)+P("M24 46 L28 54 L34 46Z",c.dark),g:GEYE(52,31,1.5,c.eye)}},
 platy(c){return{b:P("M10 34 Q4 36 4 42",c.dark)+S_("M8 34 Q3 38 5 44",c.dark,2)+P("M14 46 l-1 10 h7 l1 -9z",c.dark)+P("M34 46 l0 10 h7 l0 -9z",c.dark)+P("M8 36 Q10 22 28 22 Q44 22 46 34 L46 46 Q26 50 10 46Z",c.main)
  +P("M18 46 l-1 10 h7 l1 -9z",c.main)+P("M38 46 l0 11 h7 l0 -10z",c.main)+C(50,32,9,c.main)+EL_(46,30,4,6,c.dark,0,.6)+P("M54 36 Q60 44 64 52 L56 52 Q54 46 52 40Z",c.main)+P("M54 50 L64 49 L64 53 L54 54Z",c.bone)+C(54,29,1.2,"#140a12"),g:GEYE(54,29,1.2,c.eye)}}});
Object.assign(BNAME,{arthro:"Arthropleura",meganeura:"Meganeura",quetzal:"Quetzalcoatlus sauvage",ammonite:"Ammonite géante",trilobite:"Trilobite géant",eurypt:"Scorpion de mer",gorgon:"Gorgonopsien",andrew:"Andrewsarchus",dunkle:"Dunkleosteus",platy:"Platybelodon"});
Object.assign(EN_SPR,{"🐛":"arthro","🦟":"meganeura","🦅":"quetzal","🐚":"ammonite","🦐":"trilobite","🦞":"eurypt","🐆":"gorgon","🐷":"andrew","🐟":"dunkle","🐘":"platy"});
Object.assign(BSC,{arthro:1.08,platy:1.12,andrew:1.08});
Object.assign(BHOME,{arthro:["Jungle","greenorb"],meganeura:["Jungle","greenorb"],quetzal:["Jungle","greenorb"],ammonite:["Ruines","blueorb"],trilobite:["Ruines","blueorb"],eurypt:["Ruines","blueorb"],
 gorgon:["Volcan","redorb"],andrew:["Volcan","redorb"],dunkle:["Obélisque","purpleorb"],platy:["Obélisque","purpleorb"]});
const FOES2={jungle:["🐛","🦟","🦅"],ruines:["🐚","🦐","🦞"],volcan:["🐆","🐷"],obelisque:["🐟","🐘"]};
const ELITE_T=["Croc-de-Fer","Grondeur","Œil-Rouge","Brise-Os","Griffe-Noire","Sang-Vif","Vieux-Roc","Fléau","Écaille-d'Or","Ombre-Lente"];
const f2On=f=>!!(f&&f.mx&&!f.over);
/* ---- au premier rendu : nouvelles créatures, dorés, meneurs, traits combinés, élites ---- */
function f2Setup(f){if(f.f2O===f.o)return;f.f2O=f.o;const m=f.o&&f.o.mode||"story",z=stageZone(f.zone||""),n=f.n||(f.o&&f.o.n)||0;if(f.raid||(f.o&&(f.o.raid||f.o.daily))||m==="arena"||m==="trial")return;
 f.enemies.forEach((e,i)=>{if(!e||e.f2)return;e.f2=1;if(e.hp!==e.max)return;
  if(m==="story"&&i<2&&!e.boss&&FOES2[z]&&Math.random()<F2.newP){e.e=FOES2[z][rnd(FOES2[z].length)];e.name=String(e.name||"").split(" · ")[0]+" · Ennemi"}
  if(!e.boss&&/^(story|dungeon|event|far|nightmare)$/.test(m)&&Math.random()<F2.goldP){e.gold=1;e.max=Math.round(e.max*2.5);e.hp=e.max}
  if(!e.boss&&n>=15&&!e.gold&&Math.random()<F2.callP)e.caller=1;
  if(!e.boss&&n>=80&&e.tr&&e.tr!=="shield"&&Math.random()<F2.comboP){e.tr2="shield";e.sh=Math.round(e.max*.2)}
  if(i===2&&!e.boss&&m==="story"&&!e.elite){e.elite=ELITE_T[(hashS(String(f.zone)+n)+i)%ELITE_T.length]}})}
/* ---- renforts ---- */
const _etF2=enemyTurn;enemyTurn=function(){const f=fight;if(!f2On(f))return _etF2();const e=f.enemies[f.wave];
 if(e&&e.caller&&!e.called&&e.hp<=e.max*.5&&e.hp>0){e.called=1;f.reinf=3;f.log+=" · 🐺 "+String(e.name).split(" · ").pop()+" appelle des renforts !"}
 const r=_etF2();if(f.over||!f.reinf)return r;
 const al=T3().map((d,j)=>f.hp[j]>0?j:-1).filter(j=>j>=0);if(al.length&&e&&e.hp>0){const k=al[rnd(al.length)];hitDino(k,e.atk*.35,e);f.log+=" · 🐺 renfort";f.reinf--;if(f.hp.every(h=>h<=0)){f.over="lose";save()}}return r};
/* ---- dorés et première victoire ---- */
const _keF2=killEnemy;killEnemy=function(){const f=fight;if(!f||!f.enemies)return _keF2();const e=f.enemies[f.wave];let k="",was=1;try{k=cxKey(e,f);ens();was=k?(S.foes[k]||0):1}catch(x){}
 if(e&&e.gold&&!e.goldPaid){e.goldPaid=1;give({stone:300,essence:30,tickets:1});f.log+=" · 💰 Ennemi doré : +300 🪨 +30 🔮 +1 🎟️";bump("golds")}
 const r=_keF2();try{if(k&&!was&&S.foes[k]&&f.o&&f.o.mode!=="arena"){give({essence:10});const nm=BNAME[k]||(k.startsWith("c:")&&SPEC[k.slice(2)]?SPEC[k.slice(2)].name+" corrompu":k);toast("🐾 Nouvelle créature : "+nm+" (+10 🔮)",2600);save()}}catch(x){}return r};
/* ---- affichage ---- */
const _rbF2=renderBattle;renderBattle=function(){const f0=fight;if(f0&&f0.mx&&!f0.over&&f0.enemies)f2Setup(f0);_rbF2();const f=fight,box=$$("battleArea");if(!box||!f2On(f))return;const e=f.enemies[f.wave],se=box.querySelector(".sEnemy");
 if(se&&e){se.classList.toggle("gold",!!e.gold);se.classList.toggle("elite",!!e.elite)}
 const nb=box.querySelector(".sHud .grow>b");if(nb&&e&&(e.elite||e.gold)&&!nb.dataset.f2){nb.dataset.f2=1;nb.textContent=(e.gold?"💰 Doré · ":"")+(e.elite?"« "+e.elite+" » ":"")+nb.textContent}
 const ch=box.querySelector(".sHud .fchips");if(ch&&e&&!ch.querySelector(".f2chip")){const a=[];if(e.tr2)a.push('<span class="chip hot f2chip" title="Carapace en plus de son trait">🛡️ + trait</span>');if(e.caller&&!e.called)a.push('<span class="chip hot f2chip" title="À moitié de ses PV, il appelle des renforts (3 attaques en plus)">🐺 Meneur</span>');
  if(f.reinf>0)a.push(`<span class="chip hot f2chip">🐺 Renforts (${f.reinf})</span>`);if(e.gold)a.push('<span class="chip good f2chip" title="Rare : gros butin">💰 Doré</span>');ch.insertAdjacentHTML("beforeend",a.join("")||'<span class="f2chip"></span>')}};
ACH.push(["f2a","Chercheur d'or","Vaincre un ennemi doré",()=>(S.cnt||{}).golds||0,1,{tickets:3,essence:30}]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Nouvelles créatures et ennemis rares","10 créatures préhistoriques rôdent dans l'histoire (Arthropleura, Meganeura, Quetzalcoatlus, ammonite et trilobite géants, scorpion de mer, Gorgonopsien, Andrewsarchus, Dunkleosteus, Platybelodon). Chaque nouvelle créature vaincue rapporte 10 🔮. Très rarement, un ennemi doré apparaît : plus résistant, il rapporte un gros butin. Les meneurs appellent des renforts à mi-vie ; dès le niveau 80, certains ennemis cumulent carapace et trait ; les élites portent un surnom."]);
