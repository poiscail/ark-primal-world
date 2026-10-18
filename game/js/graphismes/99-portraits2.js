// 0.44 · Portraits II : des dinos dessinés par le code mais bien plus différents les uns des autres.
// - Théropodes (famille T, la plus nombreuse) redessinés : 3 postures (debout, coureur à l'horizontale, à l'affût tête basse),
//   5 têtes (fine, massive, museau de crocodile, bec, gueule ouverte), longueur des pattes, griffes géantes, queue à plumes.
// - Motifs sur le corps de toutes les familles : rayures, taches, bande dorsale, tigré (découpés à la forme du corps).
// Les réglages par espèce sont dans LOOK ; une espèce absente reçoit un choix fixe tiré de son nom (hashS).
// Chargé après 99-collect2 (toutes les espèces existent) : complète PORT[k][1] et vide les caches de portraits.
const LOOK={raptor:{pose:1,pt:"stripe",tl:"plume"},compsog:{pose:1,pt:"spot"},dilopho:{pose:0,pt:"spot"},ovi:{pose:0,hd:"beak",tl:"plume",pt:"band"},
 gallim:{pose:1,hd:"beak",lg:1.25,pt:"band"},coelo:{pose:1,pt:"stripe",lg:1.1},utah:{pose:2,tl:"plume",pt:"band",arm:"claw"},deino:{pose:2,pt:"tiger",tl:"plume",arm:"claw"},
 pyro:{pose:0,pt:"band",tl:"plume"},allo:{pose:1,pt:"stripe"},cerato:{pose:0,pt:"band"},carnota:{pose:1,pt:"spot"},carcharo:{pose:2,hd:"box",pt:"stripe"},
 giga:{pose:0,hd:"box",pt:"band"},rex:{pose:0,hd:"box",open:1,pt:"none"},tyranno:{pose:2,hd:"box",pt:"tiger"},spino:{pose:1,hd:"croc",pt:"spot"},
 bary:{pose:2,hd:"croc",pt:"spot"},therizi:{pose:0,arm:"scythe",hd:"beak",tl:"plume",pt:"none"},cryolo:{pose:0,pt:"band"},dracorex:{pose:0,hd:"box",pt:"tiger"},
 tonner:{pose:1,pt:"stripe"},helio:{pose:0,pt:"band"},nyx:{pose:2,pt:"spot",open:1},sarco:{pt:"spot"},majunga:{pose:2,hd:"box",pt:"spot"},yuty:{pose:0,tl:"plume",pt:"tiger"},
 boreal:{pose:1,tl:"plume",pt:"band"},concav:{pose:1,pt:"stripe"},chrono:{pose:2,pt:"tiger"},pumpkin:{pose:0,pt:"stripe",open:1},firstfang:{pose:2,hd:"box",open:1,pt:"tiger"}};
const P2_PT=["none","stripe","spot","band","tiger"],P2_POSE=[0,1,2,1];
function p2Auto(k,fam,o){const h=hashS(k+"#p2"),a={_k:k,pt:P2_PT[h%5]};
 if(fam==="T"){a.pose=P2_POSE[(h>>3)%4];a.hd=(o.hs||1)>=1.3?"box":(h>>5)%5===0?"croc":"slim";a.lg=.9+((h>>7)%4)*.1;if(o.fe)a.tl="plume";if((h>>9)%4===0)a.open=1}
 return a}
// géométrie des 3 postures : corps (cx,cy,rx,ry,rotation), queue, cou, pattes, ventre, décalage de la tête, du bras et de la voile
const P2_G=[
 {b:[30,38,15,10,-8],tail:"M19 33 Q5 35 2 48 Q12 42 21 44Z",neck:"M37 37 Q39 24 45 22 L50 33Z",bl:"M27 42 l-3 12 h8 l2 -12z",fl:"M32 42 l-3 12 h8 l2 -12z",ft:"M23 54 h8 l1 2 h-10z M28 54 h9 l1 2 h-11z",belly:"M18 42 Q30 53 43 42 Q30 47 18 42Z",hd:[0,0],arm:[0,0],sail:"translate(0 0)",tip:[3,46]},
 {b:[28,40,16,8.5,-2],tail:"M15 37 Q4 34 0 30 Q4 41 15 45Z",neck:"M38 36 Q45 31 50 32 L50 41 Q43 43 38 42Z",bl:"M21 43 l-5 11 h7 l4 -10z",fl:"M32 44 l1 10 h7 l-2 -10z",ft:"M15 54 h8 v1.6 h-9z M33 54 h8 v1.6 h-9z",belly:"M15 43 Q28 51 42 44 Q28 47 15 43Z",hd:[2,11],arm:[0,4],sail:"translate(-1 4) rotate(4 30 38)",tip:[1,33]},
 {b:[29,41,15,9,9],tail:"M18 36 Q8 26 2 21 Q7 35 19 44Z",neck:"M38 38 Q46 38 52 40 L50 47 Q42 46 37 43Z",bl:"M22 42 l-6 12 h8 l3 -11z",fl:"M34 44 l3 10 h7 l-4 -11z",ft:"M15 54 h9 v1.6 h-10z M37 54 h9 v1.6 h-10z",belly:"M17 43 Q30 53 43 47 Q30 49 17 43Z",hd:[0,17],arm:[-1,6],sail:"translate(0 4) rotate(10 30 38)",tip:[3,23]}];
// motif découpé à la forme du corps (ellipse cx,cy,rx,ry,rot)
function p2Pat(c,pt,k,fam,E){if(!pt||pt==="none")return"";const[x,y,rx,ry,r]=E,id="p2"+hashS(k+fam),col=pt==="tiger"?c.dark:pt==="band"?c.acc:c.dark;let m="";
 if(pt==="stripe")for(let i=-2;i<4;i++)m+=`<path d="M${x-rx+i*7+6} ${y-ry-2} l-5 ${ry*2+4}" stroke="${col}" stroke-width="2.2" opacity=".45"/>`;
 else if(pt==="tiger")for(let i=-2;i<5;i++)m+=`<path d="M${x-rx+i*6+4} ${y-ry-2} q3 ${ry} -1 ${ry*1.6}" fill="none" stroke="${col}" stroke-width="2.8" stroke-linecap="round" opacity=".6"/>`;
 else if(pt==="spot"){const R=n=>(hashS(k+n)%1000)/1000;for(let i=0;i<7;i++)m+=`<circle cx="${(x-rx*.8+R("x"+i)*rx*1.6).toFixed(1)}" cy="${(y-ry*.8+R("y"+i)*ry*1.1).toFixed(1)}" r="${(1.3+R("r"+i)*1.5).toFixed(1)}" fill="${i%3?c.dark:c.acc}" opacity=".55"/>`}
 else if(pt==="band")m=`<ellipse cx="${x}" cy="${y-ry*.85}" rx="${rx*1.05}" ry="${ry*.42}" fill="${col}" opacity=".55"/>`;
 return`<clipPath id="${id}"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})"/></clipPath><g clip-path="url(#${id})">${m}</g>`}
// têtes (même repère que l'ancienne : museau vers la droite autour de 39-63 × 12-35)
function p2Head(c,o){const hd=o.hd||"slim",open=o.open?1:0;let s="";
 if(hd==="box"){s+=Q("M38 19 Q39 14 49 14 Q58 15 60 20 L60 25 Q51 28 43 27 Q37 24 38 19Z",c.main);
  s+=`<g transform="rotate(${open?16:0} 44 27)">`+Q("M43 26 Q52 29 60 25 L58 30 Q51 33 44 30Z",c.dark)+Q("M48.5 28.5 l1 -2 l1 2z M52 28.2 l1 -2 l1 2z M55.5 27.6 l1 -2 l1 2z","#fff")+"</g>";
  s+=Q("M49 26.6 l1 2.2 l1 -2.2z M52.5 26.3 l1 2.2 l1 -2.2z M56 25.6 l1 2 l1 -2z","#fff")+L("M44 17 Q47.5 15 51 17",c.dark,1.5)+eye(47.5,19.5,1.8)+`<circle cx="58.5" cy="18.5" r=".8" fill="${c.dark}"/>`}
 else if(hd==="croc"){s+=Q("M39 22 Q44 16 51 18 L64 21 L64 24 L50 26 Q42 27 39 22Z",c.main);
  s+=`<g transform="rotate(${open?14:0} 44 26)">`+Q("M44 26 L64 24 L63 27 L46 30Z",c.dark)+"</g>"+Q("M50 25 l.9 2 l.9 -2z M54 24.6 l.9 2 l.9 -2z M58 24.2 l.9 2 l.9 -2z M61.5 23.9 l.8 1.8 l.8 -1.8z","#fff")+eye(47,20,2)+Q("M61 20 l2 -2 l1 3z",c.dark)}
 else if(hd==="beak"){s+=Q("M40 21 Q44 13 52 15 Q57 17 56 22 L50 27 Q43 28 40 21Z",c.main)+Q("M54 17 Q63 19 61 25 L54 25Z",c.horn)+(open?Q("M54 25 L60 26 L55 28Z",c.dark):"")+eye(49,19,2.5)}
 else{s+=Q("M39 20 Q48 13 59 20 L61 26 Q54 29 46 28Z",c.main);
  s+=`<g transform="rotate(${open?18:0} 46 28)">`+Q("M46 27 Q54 31 61 26 L58 31 Q52 35 46 31Z",c.dark)+(open?Q("M50 30 l1.4 -3 l1.4 3z M54 29.6 l1.4 -3 l1.4 3z","#fff"):"")+"</g>"+Q("M52 27 l1.5 3.4 l1.5 -3.4 M56.5 26.5 l1.5 3 l1.4 -3z","#fff")+eye(50,21,2.3)}
 if(open)s+=Q(hd==="box"?"M45 27 Q52 29.5 59 26 L57 28 Q51 30 45 28Z":"M47 28 Q54 30 60 27 L58 29 Q52 31 47 29Z","#7a1f2b",' opacity=".85"');
 for(let i=0;i<(o.h||0);i++)s+=Q(`M${44+i*4} 17 l${i%2?3:-2} -7 l4 7z`,c.horn);return s}
function famT2(c,o){const G=P2_G[o.pose||0]||P2_G[0],hs=(o.hs||1)*(o.hd==="box"?.8:1),lg=o.lg||1,[bx,by,brx,bry,br]=G.b,[ax,ay]=G.arm,k=o._k||"";let s="";
 const legs=d=>`<g transform="translate(0 ${(1-lg)*10}) translate(30 55) scale(1 ${lg}) translate(-30 -55)">${d}</g>`;
 let back="";if(o.sa)back+=Q("M15 35 Q18 6 28 14 Q33 4 38 12 Q44 10 43 32Z",o.sa===2?"#ffd15c":c.acc,' opacity=".92"')+(o.sa===2?"":`<path d="M24 14 L25 34 M31 10 L32 34 M37 12 L37 34" stroke="${c.dark}" stroke-width="1" opacity=".5"/>`);
 if(o.cr)for(let i=0;i<5;i++)back+=Q(`M${16+i*6} ${34-i*.4} l3 ${o.cr===2?-10:-7} l3 ${o.cr===2?10:7}z`,o.cr===2?c.light:c.dark);
 if(back)s+=`<g transform="${G.sail}">${back}</g>`;
 s+=Q(G.tail,c.main);if(o.tl==="plume"){const[tx,ty]=G.tip;s+=[-5,0,5].map((d,i)=>Q(`M${tx+7} ${ty} Q${tx} ${ty+d-3} ${tx-5} ${ty+d*.9} Q${tx+1} ${ty+d+2} ${tx+8} ${ty+2}Z`,i===1?c.light:c.acc,' opacity=".9"')).join("")}
 s+=legs(Q(G.bl,c.dark))+`<ellipse cx="${bx}" cy="${by}" rx="${brx}" ry="${bry}" fill="${c.main}" transform="rotate(${br} ${bx} ${by})"/>`+Q(G.belly,c.light)+p2Pat(c,o.pt,k,"T",G.b)+legs(Q(G.fl,c.main)+Q(G.ft,c.horn));
 const arm=`translate(${ax} ${ay})`;
 if(o.arm==="scythe")s+=`<g transform="${arm}">`+L("M39 37 l6 4",c.dark,2.6)+[0,1,2].map(i=>L(`M45 ${40+i} q6 ${2+i} 5 ${9+i*2}`,c.horn,1.4)).join("")+"</g>";
 else if(o.arm==="claw")s+=`<g transform="${arm}">`+L("M39 37 l6 4",c.dark,2.6)+L("M45 41 q3 1 3 4 M45 41 q4 0 5 3",c.horn,1.3)+"</g>";
 if(o.fe)s+=`<g transform="${arm}">`+Q("M38 36 Q30 28 20 38 Q32 42 40 40Z",c.acc,' opacity=".95"')+(o.fe===2?Q("M38 34 Q31 24 22 32 Q31 36 38 37Z",c.light,' opacity=".9"'):"")+"</g>";
 else if(!o.arm)s+=`<g transform="${arm}"><path d="M40 38 l${o.arms===0?4:6} 4" stroke="${c.dark}" stroke-width="2.4" stroke-linecap="round"/></g>`;
 s+=Q(G.neck,c.main);const[hx,hy]=G.hd;
 return s+`<g transform="translate(${hx} ${hy}) translate(44 25) scale(${hs}) translate(-44 -25)">${p2Head(c,o)}</g>`}
// motifs pour les autres familles : ellipse du corps de chaque dessin d'origine
const P2_BODY={S:[28,41,17,9.5,0],C:[28,40,17,10.5,0],A:[30,40,19,12,0],G:[29,40,16,10,0],H:[30,39,14,9.5,-6],F:[32,38,10,6,-10],M:[34,37,24,8,0]};
Object.keys(P2_BODY).forEach(f=>{const _f=FAM[f];if(!_f)return;FAM[f]=function(c,o){const s=_f(c,o);if(!o||!o.pt||o.pt==="none")return s;
 // le motif se pose juste après le corps : avant la tête (dernier tiers du dessin) on ne peut pas couper proprement, donc par-dessus avec une opacité douce
 return s+p2Pat(c,o.pt,o._k||"",f,P2_BODY[f])}});
FAM.T=famT2;
// fusion des réglages dans PORT (les options d'origine restent, LOOK a le dernier mot)
function p2Merge(){Object.keys(PORT).forEach(k=>{const cfg=PORT[k];if(!cfg||cfg[0]==="W"||cfg[0]==="I")return;cfg[1]={...p2Auto(k,cfg[0],cfg[1]||{}),...(cfg[1]||{}),...(LOOK[k]||{}),_k:k}})}
p2Merge();Object.keys(PCACHE).forEach(k=>delete PCACHE[k]);if(typeof ECACHE!=="undefined")Object.keys(ECACHE).forEach(k=>delete ECACHE[k]);try{e2t()}catch(e){}
// Versions (variantes) bien distinctes : en plus du filtre de couleur, un décor dessiné par-dessus le portrait
// (griffures de l'Alpha, fumée de l'Ombre, reflet du Doré, fissures du Fossile, éclats du Cristal, braises de la Lave…), voir css/97-portraits2.css.
const _artP2=art;art=function(e){const r=_artP2(e),m=/^<span class="v-([a-z]+)"><span class="pt">/.exec(r);if(!m||!r.endsWith("</span></span>"))return r;
 return r.replace('<span class="pt">','<span class="pt vxp">').slice(0,-14)+`<i class="vxo vxo-${m[1]}" aria-hidden="true"></i></span></span>`};
