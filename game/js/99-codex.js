/* Bestiaire des créatures : chaque ennemi vaincu (hors Arène) est noté ; écran Succès > Bestiaire des créatures (silhouettes
   pour celles pas encore vaincues, habitat) et 2 succès. Variété : la 2e vague alterne entre deux créatures de la zone. */
const _ensCX=ens;ens=function(){_ensCX();S.foes=S.foes&&typeof S.foes==="object"?S.foes:{}};
const BHOME={croc:["Jungle","greenorb"],snake:["Jungle","greenorb"],skull:["Ruines","blueorb"],bones:["Ruines, Crypte des Os","blueorb"],beetle:["Ruines","blueorb"],
 scorpion:["Volcan, Nid d'Ambre","redorb"],salamander:["Volcan","redorb"],wyvern:["Volcan, Tour, Temple","redorb"],void:["Obélisque","purpleorb"],golem:["Obélisque, Tour, Temple","purpleorb"],eye:["Obélisque, Temple","goldorb"],
 wolf:["Crypte des Os","redorb"],boar:["Antre du Cuir, Tour","greenorb"],bison:["Antre du Cuir","greenorb"],rhino:["Antre du Cuir","greenorb"],crystal:["Caverne de Cristal","blueorb"],
 bat:["Caverne de Cristal, Tour","blueorb"],kraken:["Caverne de Cristal, Tour","blueorb"],wasp:["Nid d'Ambre","purpleorb"],spider:["Nid d'Ambre","purpleorb"]};
const CX_COR=["dilopho","carnota","allo","cerato","utah","rex","giga","spino","carcharo","tyranno"],CX_CORH={dilopho:["Jungle","greenorb"],carnota:["Jungle (élite)","greenorb"],allo:["Ruines, Tour (élite)","blueorb"],cerato:["Volcan (élite)","redorb"],utah:["Obélisque (élite)","purpleorb"],rex:["Gardien de la Tour","goldorb"],giga:["Gardien de la Jungle","greenorb"],spino:["Gardien des Ruines","blueorb"],carcharo:["Gardien du Volcan","redorb"],tyranno:["Gardien de l'Obélisque","purpleorb"]};
const CX_ALL=()=>[...Object.keys(BEAST).map(k=>({id:k,beast:1})),...CX_COR.map(k=>({id:"c:"+k,cor:k}))];
EN_SPR["⚡"]="eye";
/* 2e vague : 3e créature de la zone (histoire) ou du donjon une fois sur deux */
function cxVary(e,f){if(!f||!f.o||e._vy)return;e._vy=1;if(f.wave!==1||f.enemies[1]!==e)return;
 if(f.o.mode==="story"&&f.n%2===1){const z=zoneOf(f.n);if(z&&z[1][2])e.e=z[1][2]}
 else if(f.o.mode==="dungeon"&&f.o.tier%2===1){const d=DUN[f.o.d];if(d&&d.en[2])e.e=d.en[2]}}
const _bnCX=bnName;bnName=function(e,f){if(e&&!e._nm)cxVary(e,f);return _bnCX(e,f)};
function cxKey(e,f){const L=enemyLook(e,f);return L?(L.k||"c:"+L.cor):""}
const _keCX=killEnemy;killEnemy=function(){const f=fight;if(f&&f.enemies&&f.o&&f.o.mode!=="arena"){const e=f.enemies[f.wave];cxVary(e,f);const k=cxKey(e,f);if(k){ens();S.foes[k]=(S.foes[k]||0)+1;save()}}return _keCX()};
function cxSeen(){ens();return CX_ALL().filter(x=>S.foes[x.id]).length}
let cxOpen=false;function cxToggle(){cxOpen=!cxOpen;renderAch()}
function cxPanel(){ens();const all=CX_ALL(),n=cxSeen();
 return `<div class="panel" id="codexBox"><div class="row"><div class="grow"><b>🐾 Bestiaire des créatures</b><div class="muted tiny">${n} / ${all.length} créatures vaincues · les silhouettes restent à découvrir</div><div class="progress"><i style="width:${n/all.length*100}%"></i></div></div><button class="secondary" style="padding:8px" onclick="cxToggle()">${cxOpen?"MASQUER":"VOIR"}</button></div>
 ${cxOpen?`<div class="cxgrid">${all.map(x=>{const got=S.foes[x.id]||0,h=x.beast?BHOME[x.id]:CX_CORH[x.cor],svg=x.beast?beastSVG(x.id,h[1],false):corruptSVG(x.cor,h[1],{boss:/Gardien/.test(h[0])}),nm=x.beast?BNAME[x.id]:SPEC[x.cor].name+" corrompu";
  return `<div class="cx ${got?"":"no"}"><div class="cxa">${PREFS.art==="svg"?`<span class="pt">${svg}</span>`:"❓"}</div><b>${got?esc(nm):"???"}</b><small>${esc(h[0])}</small>${got?`<i>×${got}</i>`:""}</div>`}).join("")}</div>`:""}</div>`}
const _raCX=renderAch;renderAch=function(){_raCX();const el=$$("achs");if(!el)return;const old=$$("codexBox");if(old)old.remove();el.insertAdjacentHTML("beforeend",cxPanel())};
ACH.push(["cx1","Naturaliste","Vaincre 8 créatures différentes",()=>cxSeen(),8,{essence:25,tickets:1}],["cx2","Encyclopédie vivante","Vaincre 25 créatures différentes",()=>cxSeen(),25,{tickets:4,shards:25},"Naturaliste de l'île"]);
if(typeof GUIDE!=="undefined")GUIDE.push(["Bestiaires","Le bestiaire des dinosaures (écran Équipe) montre les espèces que tu possèdes. Le bestiaire des créatures (Aventure > Succès) garde la trace des ennemis vaincus : 20 créatures et 10 dinosaures corrompus, avec leur habitat."]);
