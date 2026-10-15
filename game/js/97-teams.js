/* Équipes enregistrées : jusqu'à 5 équipes de 3 dinosaures, chargeables en un clic depuis l'écran Équipe et les modes de jeu */
const PRESET_MAX=5;
const _ens97=ens;ens=function(){_ens97();S.presets=Array.isArray(S.presets)?S.presets:[]};
const presetMembers=p=>p.ids.map(id=>S.team.find(d=>d.id===id)).filter(Boolean);
function presetSave(i){ens();const t=T3();if(t.length<3){toast("Il faut 3 dinosaures.");return}
 if(i===undefined||i>=S.presets.length){if(S.presets.length>=PRESET_MAX){toast("5 équipes maximum : écrase-en une.");return}
  askText("Nom de l'équipe ?","Équipe "+(S.presets.length+1),n=>{n=n.slice(0,18);if(!n)return;ens();if(S.presets.length>=PRESET_MAX)return;S.presets.push({n,ids:t.map(d=>d.id)});save();render();toast("Équipe enregistrée.")});return}
 else{if(!confirm("Écraser « "+S.presets[i].n+" » avec l'équipe actuelle ?"))return;S.presets[i].ids=t.map(d=>d.id)}
 save();render();toast("Équipe enregistrée.")}
function presetLoad(i){ens();const p=S.presets[i];if(!p)return;const m=presetMembers(p);if(!m.length){toast("Ces dinosaures n'existent plus.");return}
 const rest=S.team.filter(d=>!m.includes(d));S.team=[...m,...rest];if(fight&&!fight.over)fight=null;save();render();toast("« "+p.n+" » chargée"+(m.length<3?" ("+(3-m.length)+" manquant(s) remplacé(s))":"")+".")}
function presetRename(i){const p=S.presets[i];if(!p)return;askText("Nouveau nom ?",p.n,n=>{n=n.slice(0,18);if(n){p.n=n;save();render()}})}
function presetDelete(i){if(!confirm("Supprimer « "+S.presets[i].n+" » ?"))return;S.presets.splice(i,1);save();render()}
const sameTeam=p=>{const t=T3().map(d=>d.id);return p.ids.length===t.length&&p.ids.every((x,k)=>x===t[k])};
function presetPanel(){ens();return `<b>👥 Équipes enregistrées (${S.presets.length}/${PRESET_MAX})</b><div class="muted tiny">Le changement est instantané et fonctionne aussi depuis Aventure.</div>${S.presets.map((p,i)=>{const m=presetMembers(p);return `<div class="it" style="${sameTeam(p)?"border-color:#ffd15c":""}"><div class="row"><div class="trio">${p.ids.map(id=>{const d=S.team.find(x=>x.id===id);return `<span>${d?art(sp(d).e):"❔"}</span>`}).join("")}</div><div class="grow"><b>${esc(p.n)}</b>${sameTeam(p)?' <span class="tag">ACTIVE</span>':""}<div class="muted tiny">${m.length?m.map(d=>esc(sp(d).name)).join(", "):"dinosaures introuvables"}</div></div></div><div class="btns"><button onclick="presetLoad(${i})">CHARGER</button><button class="secondary" onclick="presetSave(${i})">ÉCRASER</button><button class="secondary" onclick="presetRename(${i})">NOM</button><button class="red" onclick="presetDelete(${i})">✕</button></div></div>`}).join("")}<button class="wide blue" style="margin-top:6px" ${S.presets.length>=PRESET_MAX?"disabled":""} onclick="presetSave()">ENREGISTRER L'ÉQUIPE ACTUELLE</button>`}
$$("subnav").insertAdjacentHTML("afterend",'<div id="presetBar" class="presetbar hide"></div>');
$$("bagBox").insertAdjacentHTML("beforebegin",'<div class="panel" id="presetBox"></div>');
const BAR_SCREENS=new Set(["story","dungeon","tower","arena","events"]);
const _r97=render;render=function(){_r97();ens();$$("presetBox").innerHTML=presetPanel();const bar=$$("presetBar");const show=BAR_SCREENS.has(screen)&&S.presets.length>0;bar.classList.toggle("hide",!show);
 if(show)bar.innerHTML='<span class="tiny muted">Équipe :</span>'+S.presets.map((p,i)=>`<button class="${sameTeam(p)?"on":""}" onclick="presetLoad(${i})">${esc(p.n)}</button>`).join("")};
render();
