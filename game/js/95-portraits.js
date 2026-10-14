/* Illustrations : un portrait SVG original par espèce (aucun fichier image), images personnalisées via l'admin */
const E_HUE={redorb:8,blueorb:208,greenorb:140,purpleorb:268,goldorb:44};
const hashS=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
/* famille, options : sc échelle, hs tête, h=cornes, cr=crête, sa=voile, fe=plumes, fx=effet */
const PORT={raptor:["T",{hs:.9}],compsog:["T",{sc:.72,hs:.8}],dilopho:["T",{cr:1,fe:0,h:2,hs:.9,fx:"frill"}],ovi:["T",{sc:.85,fe:1,cr:1,hs:.8}],gallim:["T",{sc:.88,hs:.65}],coelo:["T",{sc:.8,hs:.8,cr:1}],micro:["F",{sc:.85,fe:1}],utah:["T",{fe:1,hs:1.05}],deino:["T",{fe:1,hs:.95,cr:1}],pyro:["T",{fe:1,cr:1,fx:"flame"}],
 allo:["T",{h:2,hs:1.15}],cerato:["T",{h:1,hs:1.1,cr:1}],carnota:["T",{h:3,hs:1.05}],carcharo:["T",{hs:1.3,cr:1}],giga:["T",{hs:1.35}],rex:["T",{hs:1.4,arms:0}],tyranno:["T",{hs:1.4,cr:1,h:1}],spino:["T",{sa:1,hs:1.1}],bary:["T",{hs:.95,cr:1,fx:"fish"}],therizi:["T",{fe:2,hs:.7}],
 argento:["S",{}],amarga:["S",{sp:1,sc:.95}],gaia:["S",{fx:"tree"}],sauropel:["A",{sp:1}],trike:["C",{}],pachyrh:["C",{nb:1,sc:.95}],ankylo:["A",{}],stego:["G",{}],cryolo:["T",{cr:2,hs:1.05,fx:"ice"}],
 ptera:["F",{}],quetzal:["F",{sc:1.1,cr:1}],mosa:["M",{k:"mosa"}],plesio:["M",{k:"plesio"}],ichthyo:["M",{k:"ichthyo"}],levia:["M",{k:"levia"}],
 parasau:["H",{cr:1}],iguano:["H",{sp:1}],maia:["H",{}],hypsi:["H",{sc:.75}],psitta:["H",{sc:.8,bk:1}],pachy:["H",{dome:1}],
 dracorex:["T",{cr:1,h:2,hs:1.15,fx:"crown"}],magma:["A",{fx:"lava",sp:1}],tonner:["T",{sa:1,hs:1.1,fx:"bolt"}],helio:["T",{sa:2,hs:1.1,fx:"sun"}],nyx:["T",{cr:1,h:2,hs:1.1,fx:"moon"}]};
const POOL=Object.keys(PORT);
function palette(key,el){const h=((E_HUE[el]??200)+(hashS(key)%44)-22+360)%360,s=52+hashS(key+"s")%22,l=50+hashS(key+"l")%10;
 return{h,main:`hsl(${h} ${s}% ${l}%)`,dark:`hsl(${h} ${s}% ${l-20}%)`,light:`hsl(${h} ${s-18}% ${l+26}%)`,acc:`hsl(${(h+35)%360} 75% 62%)`,horn:"#f3ead2",bgd:`hsl(${h} 45% 17%)`,bgl:`hsl(${h} 50% 30%)`}}
const L=(d,col,w,op)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${op?` opacity="${op}"`:""}/>`;
const Q=(d,f,x)=>`<path d="${d}" fill="${f}"${x||""}/>`;
function eye(x,y,r){return`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x+.6}" cy="${y}" r="${r*.5}" fill="#111"/>`}
function famT(c,o){let s="";const hs=o.hs||1;
 if(o.sa)s+=Q("M15 35 Q18 6 28 14 Q33 4 38 12 Q44 10 43 32Z",o.sa===2?"#ffd15c":c.acc,' opacity=".92"')+(o.sa===2?"":`<path d="M24 14 L25 34 M31 10 L32 34 M37 12 L37 34" stroke="${c.dark}" stroke-width="1" opacity=".5"/>`);
 if(o.cr)for(let i=0;i<5;i++)s+=Q(`M${16+i*6} ${34-i*.4} l3 ${o.cr===2?-10:-7} l3 ${o.cr===2?10:7}z`,o.cr===2?c.light:c.dark);
 s+=Q("M19 33 Q5 35 2 48 Q12 42 21 44Z",c.main)+Q("M27 42 l-3 12 h8 l2 -12z",c.dark)+`<ellipse cx="30" cy="38" rx="15" ry="10" fill="${c.main}" transform="rotate(-8 30 38)"/>`+Q("M18 42 Q30 53 43 42 Q30 47 18 42Z",c.light)+Q("M32 42 l-3 12 h8 l2 -12z",c.main)+Q("M28 54 h9 l1 2 h-11z",c.horn);
 if(o.fe)s+=Q("M38 36 Q30 28 20 38 Q32 42 40 40Z",c.acc,' opacity=".95"')+(o.fe===2?Q("M38 34 Q31 24 22 32 Q31 36 38 37Z",c.light,' opacity=".9"'):"");
 else if(o.arms!==0||true)s+=`<path d="M40 38 l${o.arms===0?4:6} 4" stroke="${c.dark}" stroke-width="2.4" stroke-linecap="round"/>`;
 s+=Q("M37 37 Q39 24 45 22 L50 33Z",c.main);
 s+=`<g transform="translate(44 25) scale(${hs}) translate(-44 -25)">`+Q("M39 20 Q48 13 59 20 L61 26 Q54 29 46 28Z",c.main)+Q("M46 27 Q54 31 61 26 L58 31 Q52 35 46 31Z",c.dark)+Q("M52 27 l1.5 3.4 l1.5 -3.4 M56.5 26.5 l1.5 3 l1.4 -3z","#fff")+eye(50,21,2.3);
 for(let i=0;i<(o.h||0);i++)s+=Q(`M${44+i*4} 17 l${i%2?3:-2} -7 l4 7z`,c.horn);
 return s+"</g>"}
function famS(c,o){let s=Q("M14 42 Q3 44 3 53 Q10 48 17 48Z",c.main);[17,23,34,40].forEach((x,i)=>s+=`<rect x="${x}" y="46" width="6" height="10" rx="2" fill="${i%2?c.main:c.dark}"/>`);
 s+=`<ellipse cx="28" cy="41" rx="17" ry="9.5" fill="${c.main}"/>`+Q("M16 44 Q28 52 40 44 Q28 48 16 44Z",c.light)+Q("M37 40 Q47 32 46 14 L53 13 Q56 36 44 47Z",c.main)+`<ellipse cx="54" cy="11" rx="6.5" ry="4.2" fill="${c.main}"/>`+eye(56,10,1.8);
 if(o.sp)for(let i=0;i<5;i++)s+=Q(`M${41+i} ${34-i*5} l5 -2 l-3 5z`,c.acc);
 return s}
function famC(c,o){let s=Q("M12 40 Q5 42 5 48 Q12 46 16 46Z",c.dark);[15,21,34,40].forEach((x,i)=>s+=`<rect x="${x}" y="46" width="6" height="9" rx="2" fill="${i%2?c.main:c.dark}"/>`);
 s+=`<ellipse cx="28" cy="40" rx="17" ry="10.5" fill="${c.main}"/>`+Q("M16 44 Q28 53 40 44 Q28 48 16 44Z",c.light)+`<circle cx="44" cy="33" r="11" fill="${c.acc}"/><circle cx="44" cy="33" r="7" fill="${c.main}" opacity=".6"/>`;
 for(let i=0;i<7;i++){const a=-Math.PI*.9+i*.42;s+=`<circle cx="${44+Math.cos(a)*11}" cy="${33+Math.sin(a)*11}" r="2" fill="${c.light}"/>`}
 s+=Q("M45 36 Q55 33 61 43 L56 49 Q48 49 45 44Z",c.main)+Q("M49 33 l-1 -11 l5 9z M44 32 l-4 -9 l7 6z",c.horn)+(o.nb?Q("M59 40 l5 -9 l-1 11z",c.horn):Q("M58 40 l4 -6 l-1 9z",c.horn))+eye(52,38,2);return s}
function famA(c,o){let s=L("M14 44 Q4 44 3 50",c.dark,3)+`<circle cx="4" cy="50" r="5.5" fill="${c.dark}"/>`;[15,22,35,42].forEach(x=>s+=`<rect x="${x}" y="47" width="6" height="8" rx="2" fill="${c.dark}"/>`);
 s+=`<ellipse cx="30" cy="40" rx="19" ry="12" fill="${c.main}"/>`;for(let i=0;i<6;i++)s+=`<circle cx="${17+i*5.2}" cy="${31+Math.abs(i-2.5)*1.2}" r="3.4" fill="${o.sp?c.acc:c.dark}"/>`;
 s+=Q("M16 45 Q30 54 44 45 Q30 49 16 45Z",c.light)+`<ellipse cx="51" cy="43" rx="8" ry="5.5" fill="${c.main}"/>`+eye(54,41,1.9);
 if(o.sp)for(let i=0;i<3;i++)s+=Q(`M${14+i*14} 44 l-2 8 l5 -4z`,c.horn);return s}
function famG(c,o){let s=Q("M14 40 Q4 38 2 44 L9 44 L6 50 L16 46Z",c.main)+Q("M3 42 l-3 -6 l5 3z M5 49 l-3 4 l6 -1z",c.horn);[15,21,34,40].forEach((x,i)=>s+=`<rect x="${x}" y="46" width="6" height="9" rx="2" fill="${i%2?c.main:c.dark}"/>`);
 s+=`<ellipse cx="29" cy="40" rx="16" ry="10" fill="${c.main}"/>`;[[16,16],[22,10],[29,6],[36,10],[42,17]].forEach(([x,h],i)=>s+=Q(`M${x-4} 33 L${x} ${33-(36-h)*.55-4} L${x+4} 33Z`,i%2?c.acc:c.light));
 s+=Q("M16 44 Q29 52 42 44 Q29 48 16 44Z",c.light)+`<ellipse cx="48" cy="43" rx="8" ry="5" fill="${c.main}"/>`+eye(51,41,1.8);return s}
function famF(c,o){let s=Q("M30 34 L4 10 Q8 32 22 40Z",c.dark)+`<ellipse cx="32" cy="38" rx="10" ry="6" fill="${c.main}" transform="rotate(-10 32 38)"/>`+Q("M32 32 L60 8 Q56 34 38 41Z",c.acc,' opacity=".95"')+L("M32 32 L52 14 M32 34 L56 22 M33 36 L54 30",c.dark,1,.6)
 +Q("M40 36 L61 33 L43 42Z",c.horn)+`<ellipse cx="40" cy="37" rx="6" ry="4" fill="${c.main}"/>`+eye(41,36,1.6)+Q("M38 34 L30 24 L43 32Z",o.cr?c.acc:c.dark)+Q("M22 40 l-6 6 l8 -2z",c.dark);
 if(o.fe)s+=Q("M26 38 Q14 36 8 48 Q20 44 28 42Z",c.light,' opacity=".9"');return s}
function famH(c,o){let s=Q("M16 38 Q4 38 2 48 Q12 44 20 44Z",c.main)+Q("M27 42 l-3 12 h8 l2 -12z",c.dark)+`<ellipse cx="30" cy="39" rx="14" ry="9.5" fill="${c.main}" transform="rotate(-6 30 39)"/>`+Q("M19 43 Q30 52 41 43 Q30 47 19 43Z",c.light)+Q("M32 42 l-3 12 h8 l2 -12z",c.main)+Q("M37 36 Q38 22 46 20 L50 34Z",c.main);
 if(o.dome)s+=`<circle cx="50" cy="16" r="6.5" fill="${c.horn}"/>`;
 s+=`<ellipse cx="50" cy="21" rx="7" ry="5" fill="${c.main}"/>`+(o.bk?Q("M55 18 Q63 19 62 24 Q58 25 55 24Z",c.acc):Q("M55 20 Q64 19 63 24 Q59 26 55 25Z",c.light))+eye(51,19,1.8);
 if(o.cr)s+=`<path d="M47 16 Q34 3 20 18 Q36 10 46 20" fill="none" stroke="${c.acc}" stroke-width="3.2" stroke-linecap="round"/>`;
 if(o.sp)s+=Q("M30 33 l3 -4 l3 4z",c.acc)+`<path d="M41 41 l4 4" stroke="${c.horn}" stroke-width="2.6" stroke-linecap="round"/>`;return s}
function famM(c,o){const k=o.k;
 if(k==="plesio")return Q("M10 44 Q2 46 3 52 Q12 50 18 47Z",c.dark)+`<ellipse cx="28" cy="43" rx="17" ry="8" fill="${c.main}"/>`+Q("M36 40 Q50 36 46 24 Q44 14 52 12 L55 17 Q50 20 52 28 Q54 40 40 48Z",c.main)+`<ellipse cx="55" cy="12" rx="6" ry="3.8" fill="${c.main}"/>`+eye(57,11,1.5)+Q("M20 46 l-8 9 l12 -3z M34 47 l-4 9 l10 -4z",c.acc,' opacity=".95"')+Q("M20 47 Q28 53 38 47 Q28 50 20 47Z",c.light);
 if(k==="levia"){let s=`<path d="M6 50 Q14 28 26 44 Q38 58 46 36 Q50 22 56 24" fill="none" stroke="${c.main}" stroke-width="9" stroke-linecap="round"/><path d="M6 50 Q14 28 26 44 Q38 58 46 36 Q50 22 56 24" fill="none" stroke="${c.light}" stroke-width="3" stroke-linecap="round" opacity=".5"/>`;for(let i=0;i<5;i++)s+=Q(`M${12+i*9} ${i%2?50:30} l3 -8 l3 8z`,c.acc);
  return s+`<ellipse cx="55" cy="22" rx="7" ry="5" fill="${c.main}"/>`+Q("M58 24 l5 2 l-6 3z",c.dark)+eye(54,20,2)+Q("M52 17 l-2 -8 l5 6z",c.horn)}
 const dol=k==="ichthyo";let s=Q("M7 36 L0 24 Q6 36 2 48Z",c.dark)+Q("M7 36 Q20 20 44 28 Q56 31 62 37 Q50 47 28 47 Q12 47 7 36Z",c.main)+Q("M14 42 Q30 50 54 41 Q30 47 14 42Z",c.light)+Q(dol?"M28 25 l6 -12 l5 14z":"M20 26 l4 -8 l8 9z",c.acc)+Q("M30 44 l-4 10 l10 -5z",c.acc)+eye(50,33,2.2);
 if(dol)s+=Q("M56 36 l8 1 l-9 3z",c.horn);else s+=Q("M52 38 L63 38 L53 43Z",c.dark)+Q("M54 38 l1.5 3 l1.5 -3 M58 38 l1.5 2.6 l1.4 -2.6z","#fff");return s}
const FAM={T:famT,S:famS,C:famC,A:famA,G:famG,F:famF,H:famH,M:famM};
function fxLayer(c,fx){switch(fx){
 case"flame":return Q("M56 8 Q50 14 53 20 Q55 16 58 20 Q62 14 56 8Z","#ff8a2b")+Q("M56 12 Q54 16 56 19 Q59 16 56 12Z","#ffe08a");
 case"ice":return Q("M54 6 l3 6 l6 1 l-5 4 l1 6 l-5 -3 l-5 3 l1 -6 l-5 -4 l6 -1z","#d8f4ff",' opacity=".95"');
 case"bolt":return Q("M56 4 L46 18 H53 L48 30 L62 12 H54 L58 4Z","#ffe45c");
 case"sun":return`<circle cx="55" cy="10" r="6" fill="#fff0a0"/>`+[0,1,2,3,4,5,6,7].map(i=>`<path d="M55 10 L${55+Math.cos(i*.785)*11} ${10+Math.sin(i*.785)*11}" stroke="#ffd15c" stroke-width="1.6"/>`).join("");
 case"moon":return Q("M56 4 A9 9 0 1 0 62 18 A7 7 0 1 1 56 4Z","#e5dcff")+`<circle cx="46" cy="8" r="1" fill="#fff"/><circle cx="60" cy="24" r="1" fill="#fff"/>`;
 case"crown":return Q("M43 12 L45 4 L49 9 L53 3 L57 9 L61 4 L63 14Z","#ffd15c")+`<circle cx="53" cy="7" r="1.5" fill="#ff647b"/>`;
 case"tree":return`<rect x="26" y="26" width="3" height="8" fill="#6b4a2b"/><circle cx="27" cy="22" r="8" fill="#3fa65a"/><circle cx="21" cy="26" r="5" fill="#57c274"/><circle cx="33" cy="26" r="5" fill="#2f8e49"/>`;
 case"lava":return Q("M20 30 L26 18 L32 30Z M30 30 L38 12 L46 30Z","#5b2a1a")+Q("M36 14 L38 12 L40 14 L38 20Z","#ff8a2b")+`<circle cx="38" cy="8" r="2" fill="#ff8a2b"/><circle cx="34" cy="4" r="1.3" fill="#ffd15c"/>`;
 case"frill":return Q("M38 22 Q44 8 52 20 L47 24Z",c.acc,' opacity=".9"');
 case"fish":return`<circle cx="10" cy="10" r="1.5" fill="#bfe8ff"/><circle cx="15" cy="6" r="1" fill="#bfe8ff"/>`;
 default:return""}}
function decor(r,c){if(r==="Rare")return[[8,9,2],[56,50,1.6],[12,52,1.2]].map(([x,y,s])=>Q(`M${x} ${y-3*s} l${s} ${2*s} l${2*s} ${s} l${-2*s} ${s} l${-s} ${2*s} l${-s} ${-2*s} l${-2*s} ${-s} l${2*s} ${-s}z`,"#bfe8ff",' opacity=".9"')).join("");
 if(r==="Épique")return`<circle cx="32" cy="31" r="29" fill="none" stroke="#c79bff" stroke-width="1.6" opacity=".9"/>`+[0,1,2,3,4,5].map(i=>`<circle cx="${32+Math.cos(i*1.047)*29}" cy="${31+Math.sin(i*1.047)*29}" r="1.8" fill="#e6ccff"/>`).join("");
 if(r==="Légendaire")return[...Array(12)].map((_,i)=>`<path d="M32 30 L${32+Math.cos(i*.5236)*40} ${30+Math.sin(i*.5236)*40}" stroke="#ffd15c" stroke-width="2.4" opacity=".16"/>`).join("")+`<rect x="1.2" y="1.2" width="61.6" height="61.6" rx="10" fill="none" stroke="#ffd15c" stroke-width="2"/>`;return""}
const PCACHE={};
function portrait(type){if(PCACHE[type])return PCACHE[type];const sp0=SPEC[type]||SPEC_DEFAULT[type];if(!sp0)return"❓";const cfg=PORT[type]||["T",{}],o=cfg[1],c=palette(type,sp0.element),sc=o.sc||1;
 const body=FAM[cfg[0]](c,o);
 const svg=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(sp0.name)}"><rect width="64" height="64" rx="11" fill="${c.bgd}"/><circle cx="32" cy="30" r="26" fill="${c.bgl}" opacity=".65"/>${decor(sp0.r,c)}<ellipse cx="32" cy="57" rx="22" ry="3.5" fill="#000" opacity=".3"/><g transform="translate(${cfg[0]==="T"?-Math.max(0,(o.hs||1)-1)*8:0} 0) translate(32 55) scale(${sc}) translate(-32 -55)">${body}</g>${fxLayer(c,o.fx)}</svg>`;return PCACHE[type]=svg}
/* art() : prend en charge les images personnalisées (https ou data:) puis les portraits */
const E2T={};const isImg=e=>/^(https:\/\/|data:image\/(png|jpeg|webp|gif);base64,)/i.test(e);
function e2t(){Object.keys(E2T).forEach(k=>delete E2T[k]);for(const k of Object.keys(SPEC))if(!isImg(SPEC[k].e)&&!E2T[SPEC[k].e])E2T[SPEC[k].e]=k}
art=e=>{let v="";e=String(e);if(e.charAt(0)==="\u0001"){const j=e.indexOf("\u0002");v=e.slice(1,j);e=e.slice(j+1)}
 let inner;if(isImg(e))inner=`<img src="${esc(e)}" alt="" style="max-width:100%;max-height:100%;border-radius:6px;object-fit:cover">`;
 else if(PREFS.art==="svg"&&E2T[e]&&SPEC[E2T[e]]&&SPEC[E2T[e]].e===e)inner=`<span class="pt">${portrait(E2T[e])}</span>`;else inner=esc(e);
 return v?`<span class="v-${v}">${inner}</span>`:inner};
const _rp=render;render=function(){e2t();_rp()};
/* enemies d'arène : portrait */
function enemyArt(e){return e.pt&&PREFS.art==="svg"?`<span class="pt">${portrait(e.pt)}</span>`:esc(e.e)}
/* import d'image dans l'admin */
function uploadDinoImg(key,inp){const f=inp.files&&inp.files[0];if(!f)return;if(!/^image\/(png|jpeg|webp|gif)$/.test(f.type)){toast("Format non pris en charge (PNG, JPEG, WebP ou GIF).");return}
 const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const m=160,k=Math.min(1,m/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=Math.max(1,Math.round(im.width*k));cv.height=Math.max(1,Math.round(im.height*k));cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
  let url=cv.toDataURL("image/webp",.85);if(!url.startsWith("data:image/webp"))url=cv.toDataURL("image/png");
  const el=document.querySelector(`.adminitem[data-dino="${key}"] [data-field="e"]`);if(el){el.value=url;toast("Image prête : clique sur ENREGISTRER.")}};im.onerror=()=>toast("Image illisible.");im.src=rd.result};rd.readAsDataURL(f)}
function resetDinoImg(key){const el=document.querySelector(`.adminitem[data-dino="${key}"] [data-field="e"]`);if(el&&SPEC_DEFAULT[key]){el.value=SPEC_DEFAULT[key].e;toast("Image par défaut rétablie : clique sur ENREGISTRER.")}}
const _ba=buildAdmin;buildAdmin=function(){_ba();document.querySelectorAll(".adminitem").forEach(el=>{if(el.querySelector(".imgtools"))return;const k=el.dataset.dino;el.insertAdjacentHTML("beforeend",`<div class="imgtools"><label>Importer une image (réduite à 160 px)</label><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onchange="uploadDinoImg('${esc(k)}',this)"> <button class="secondary" type="button" onclick="resetDinoImg('${esc(k)}')">IMAGE PAR DÉFAUT</button></div>`)})};
e2t();render();
