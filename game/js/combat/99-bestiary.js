/* Bestiaire des ennemis : sprites SVG dédiés (créatures non-dinosaures) et dinosaures « corrompus » par l'obélisque
   (couleurs assombries, veines d'énergie, yeux luisants, couronne pour les gardiens). Même grille 64×64 que les portraits,
   tournés vers la droite (la scène les retourne face à l'équipe) ; teintés selon l'élément de l'ennemi. */
document.body.insertAdjacentHTML("afterbegin",`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<filter id="eglow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="fglow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs></svg>`);
const P=(d,f,x)=>`<path d="${d}" fill="${f}"${x||""}/>`,C=(x,y,r,f,o)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${o?` opacity="${o}"`:""}/>`,
 EL_=(x,y,rx,ry,f,rot,o)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"${rot?` transform="rotate(${rot} ${x} ${y})"`:""}${o?` opacity="${o}"`:""}/>`,
 S_=(d,col,w,o)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o?` opacity="${o}"`:""}/>`;
const GEYE=(x,y,r,c)=>C(x,y,r*1.9,c,.35)+C(x,y,r,c)+C(x+r*.25,y-r*.2,r*.38,"#fff");
function bpal(el,k){const h=((E_HUE[el]??200)+(hashS(k)%24)-12+360)%360;
 return{h,main:`hsl(${h} 38% 36%)`,dark:`hsl(${h} 42% 20%)`,deep:`hsl(${h} 45% 12%)`,light:`hsl(${h} 32% 56%)`,glow:`hsl(${h} 100% 64%)`,eye:h>30&&h<70?"#ff4d5e":"#ffe45c",bone:"#e9e0c7",boneD:"#a99e82",rock:"#6d6a72",rockD:"#3f3c47",rockL:"#9a96a1",tooth:"#fff7e6"}}
/* --- créatures : chaque fonction renvoie {b: corps (avec volume), g: lueurs} --- */
const BEAST={
 croc(c){const t=[46,49.5,53,56.5,60].map(x=>P(`M${x} 44 l1.4 3 l1.4 -3z`,c.tooth)).join("")+[47.5,51,54.5,58].map(x=>P(`M${x} 46 l1.2 -2.6 l1.2 2.6z`,c.tooth)).join("");
  return{b:P("M1 46 Q10 40 22 42 L22 50 Q12 51 1 46Z",c.dark)+[6,10,14,18].map(x=>P(`M${x} ${44-(x-6)*.12} l2 -3.5 l2 3.5z`,c.deep)).join("")
   +P("M19 49 Q15 53 13 56 L19 56 Q21 53 24 51Z",c.dark)+P("M36 50 Q33 54 32 56 L38 56 Q39 53 41 51Z",c.dark)+EL_(31,44.5,16,8,c.main)+P("M17 47 Q31 56 46 47 Q31 52 17 47Z",c.light)
   +[20,24,28,32,36,40].map(x=>P(`M${x} ${39.5} l2 -3.6 l2 3.6z`,c.deep)).join("")+P("M25 50 Q24 54 21 56 L28 56 Q29 53 30 51Z",c.main)+P("M42 49 Q44 53 43 56 L49 56 Q48 52 46 49Z",c.main)
   +P("M38 40 Q46 36 53 39 L61 40.5 Q64 42 62 44 L44 45.5Z",c.main)+P("M42 45 L61.5 44.6 Q61 48.5 56 48.5 L44 48.5Z",c.dark)+t+C(60.5,41,2.4,c.main)+C(44,37.6,3.2,c.main),
   g:GEYE(44.6,37.4,1.5,c.eye)}},
 snake(c){return{b:EL_(30,51,22,5.5,c.dark)+EL_(32,46,17,5,c.main)+EL_(30,41.5,12,4.2,c.dark)+[14,22,30,38,46].map(x=>P(`M${x} 51 l3 -2 l3 2 l-3 2z`,c.deep)).join("")+[20,28,36,44].map(x=>P(`M${x} 46 l3 -2 l3 2 l-3 2z`,c.light)).join("")
   +S_("M34 40 Q48 34 44 22 Q42 14 48 12",c.main,8.5)+S_("M34 40 Q48 34 44 22 Q42 14 48 12",c.light,2.4,.55)
   +EL_(51,12,9,5.6,c.main,-12)+P("M52 15 Q60 15 62 19 L54 18.5Z",c.dark)+P("M55.5 15.2 l1 3.2 l1 -3.1z M58.5 15.6 l.9 2.8 l.9 -2.6z",c.tooth)+S_("M61 18 l2.6 1.4 M61 18 l2.4 2.6","#ff3b5c",.9),
   g:GEYE(52,10.6,1.5,c.eye)}},
 skull(c){return{b:P("M8 36 Q14 28 22 30 Q18 22 28 20 Q24 30 34 30Z",c.light,' opacity=".55"')+P("M26 24 Q36 10 50 14 L62 25 Q63.5 30 60 30.5 L44 33 Q34 34 29 29Z",c.bone)
   +P("M30 24 Q38 14 48 16 L46 19 Q38 18 32 26Z",c.boneD,' opacity=".6"')+C(41,22.5,4.6,"#140a12")+EL_(52.5,23,3,2,"#140a12",-15)+P("M57 26 l3 1 l-3 1.4z","#140a12")
   +P("M33 33 L58 31.6 Q57 37.5 51 38.5 L38 38.8 Q34 37 33 33Z",c.boneD)+[40,44,48,52,56].map(x=>P(`M${x} 30.6 l1.3 3.4 l1.3 -3.4z`,c.tooth)).join("")+[41,45,49,53].map(x=>P(`M${x} 34.6 l1.2 -2.8 l1.2 2.8z`,c.tooth)).join("")
   +S_("M31 21 l3 3 l-1 3",c.boneD,.8)+S_("M47 14.5 l-1 3 l2 2",c.boneD,.8),
   g:P("M2 44 Q8 34 18 38 Q12 30 24 28 Q20 38 30 36 Q22 46 10 46Z",c.glow,' opacity=".35"')+GEYE(41,22.5,2,c.glow)+C(41,22.5,.9,"#fff")}},
 bones(c){const rib=[22,25.5,29,32.5].map((x,i)=>S_(`M${x} ${33-i*.6} Q${x+2} ${40-i*.3} ${x+.5} ${45-i}`,c.bone,1.6)).join("");
  return{b:S_("M3 38 Q12 30 20 34 Q30 38 38 30 Q42 26 44 22",c.bone,2.6)+[6,10,14,18,26,30,34].map((x,i)=>C(x,i<4?35.5-i*.6:35-(i-4)*1.8,1.3,c.boneD)).join("")+rib
   +P("M18 34 Q22 32 25 36 Q22 39 18 37Z",c.bone)+S_("M21 37 L25 46 L21 55",c.bone,2.6)+S_("M21 55 l5 0 M21 55 l3 -2",c.bone,1.4)+S_("M24 37 L29 46 L26 54",c.boneD,2.2)+S_("M26 54 l4 0",c.boneD,1.3)
   +S_("M38 31 l4 6 l-2 3",c.bone,1.4)+P("M40 18 Q46 10 54 13 L63 21 Q63.5 24.5 61 25 L48 27 Q42 27 40 23Z",c.bone)+C(48,18.5,3.2,"#140a12")
   +P("M43 26.6 L60.5 25.4 Q60 29.5 55 30 L46 30Z",c.boneD)+[48,51.5,55,58.5].map(x=>P(`M${x} 25 l1.1 2.8 l1.1 -2.8z`,c.tooth)).join(""),
   g:GEYE(48,18.5,1.5,c.glow)+C(28,40,3.4,c.glow,.5)+C(28,40,1.8,"#fff",.7)}},
 beetle(c){const legs=[[22,0],[30,1],[38,2]].map(([x,i])=>S_(`M${x} 48 l${-3+i} 5 l${-2+i} 3`,c.deep,1.8)).join("");
  return{b:legs+EL_(29,42,18,11.5,c.main)+S_("M29 31 Q32 42 29 53",c.dark,1.4)+EL_(22,37,9,3.6,c.light,-14,.55)
   +[[16,44],[24,47],[36,46],[40,38]].map(([x,y])=>C(x,y,1.6,c.dark)).join("")+EL_(48,45,7,6,c.dark)+P("M50 41 Q56 34 54 24 Q60 30 60 38 Q58 43 53 45Z",c.main)+P("M54 24 l3 -3 l1 5z",c.light)+S_("M53 49 l5 3",c.deep,1.5),
   g:GEYE(51,44,1.2,c.eye)}},
 scorpion(c){const seg=[[22,42,4.2],[21,35,3.8],[24,28.5,3.5],[29.5,23.5,3.2],[36,21,3]];
  return{b:[[30,0],[34,1],[38,2],[42,3]].map(([x,i])=>S_(`M${x} 47 l-2 5 l-3 4`,c.deep,1.5)+S_(`M${x+2} 47 l1 5 l3 4`,c.deep,1.3)).join("")
   +seg.map(([x,y,r])=>C(x,y,r,c.main)).join("")+seg.map(([x,y,r])=>C(x-r*.25,y-r*.3,r*.45,c.light,.5)).join("")+P("M38 18 Q44 17 45 22 L43 27 L41 22Z",c.dark)
   +EL_(37,46,13,6.5,c.main)+[30,35,40].map(x=>S_(`M${x} 40.5 Q${x+1} 46 ${x} 51`,c.dark,.9)).join("")+EL_(48,45,5.5,4.5,c.dark)
   +S_("M50 43 Q54 38 55 33",c.main,3.4)+EL_(57.5,31,5.6,3.8,c.main,-35)+P("M58 30 Q63 23 64 27 Q62 29 60 30Z",c.main)+P("M59 32 Q64 31 64 34 Q61 34 59 33Z",c.dark)
   +S_("M49 48 Q55 51 57 48",c.main,3)+EL_(59.5,47,5,3.4,c.dark,-10)+P("M61 45 Q65 42 64 46Z M61 49 Q65 50 63 52Z",c.dark),
   g:GEYE(50,42.8,1,c.eye)+GEYE(47,42.4,.8,c.eye)+C(43.5,26.5,1.6,c.glow)}},
 salamander(c){const fl=[[18,36],[25,34],[32,34],[39,36]].map(([x,y],i)=>P(`M${x-3} ${y+2} Q${x-2} ${y-6-i%2*3} ${x} ${y-9-i%2*3} Q${x+1} ${y-4} ${x+3} ${y+2}Z`,"#ff8a2b"));
  return{b:P("M2 48 Q8 40 18 42 L20 49 Q10 50 2 48Z",c.rockD)+P("M18 50 l-3 6 h6 l2 -6z",c.rockD)+P("M33 50 l-2 6 h6 l1 -6z",c.rockD)+EL_(29,45,15,6.5,c.rockD)+P("M17 47 Q29 54 42 47 Q29 51 17 47Z",c.rock)
   +P("M24 50 l-2 6 h6 l1 -6z",c.rock)+P("M39 49 l-1 6 h6 l0 -6z",c.rock)+P("M40 40 Q48 36 56 39 L62 42 Q61 46 56 46 L42 47Z",c.rockD)+P("M46 45.5 L60 45 Q58 48.5 54 48.5 L47 48.5Z",c.rock),
   g:fl.join("")+S_("M8 46 l5 -2 l4 2 M22 44 l4 2 l5 -2 l4 2 M30 48 l5 -1",c.glow,1,.95)+S_("M44 42 l4 1 l4 -1",c.glow,.9)+P("M60 44 Q64 44 64 46 L60 46Z","#ffb02e")+GEYE(50,40.6,1.3,"#ffd15c")}},
 wyvern(c){return{b:P("M30 30 Q24 10 14 4 Q14 12 8 12 Q10 18 3 21 Q9 25 4 30 Q14 32 24 38Z",c.dark)+S_("M30 30 L14 5 M28 32 L8 13 M26 34 L4 22",c.deep,1.2)
   +P("M2 52 Q12 46 22 46 L26 50 Q14 52 2 52Z",c.main)+EL_(32,42,12,9.5,c.main,-12)+P("M24 46 Q32 54 42 46 Q33 50 24 46Z",c.light)
   +P("M30 47 Q34 52 30 56 h6 Q38 50 36 46Z",c.dark)+P("M38 34 Q40 22 46 17 L52 20 Q46 26 44 36Z",c.main)+[0,1,2].map(i=>P(`M${42+i*2.5} ${30-i*5} l-3 -2 l2 4z`,c.deep)).join("")
   +P("M45 15 Q52 10 59 13 L64 17 Q62 21 57 21 L48 22Z",c.main)+P("M49 21.5 L62 19.5 Q61 23 57 23.5 L50 24Z",c.dark)+P("M53 20.4 l1 2.2 l1 -2.2z M57 20 l.9 2 l.9 -2z",c.tooth)
   +P("M47 13 l-6 -6 l7 3z M51 12 l-3 -7 l5 5z",c.bone)+S_("M28 40 Q32 44 33 50",c.dark,1),
   g:GEYE(52,14.6,1.3,c.eye)+P("M62 19 Q64 18 64 20 Q63 21 62 20.5Z","#ffb02e",' opacity=".9"')}},
 void(c){const tent=[[16,48,-1],[24,52,1],[34,53,-1],[44,51,1],[52,46,-1]].map(([x,y,s])=>S_(`M${x} ${y-6} Q${x+s*4} ${y} ${x-s*2} ${y+4} Q${x-s*5} ${y+6} ${x-s*3} ${y+8}`,c.dark,3.2)).join("");
  return{b:tent+P("M10 40 Q8 22 24 16 Q36 10 48 18 Q60 24 58 38 Q56 50 40 50 Q22 52 14 46Z",c.main)+P("M16 28 Q24 18 36 18 Q28 22 22 30Z",c.light,' opacity=".5"')
   +P("M30 40 Q38 46 48 40 Q46 46 39 47 Q32 46 30 40Z",c.deep)+[33,37,41,45].map(x=>P(`M${x} 41.6 l1.2 2.6 l1.2 -2.2z`,c.tooth)).join("")+C(24,40,1.3,c.dark)+C(52,30,1.1,c.dark),
   g:GEYE(32,27,3.4,c.glow)+C(32,27,1.4,"#1a0626")+GEYE(45,25,2.3,c.eye)+GEYE(40,33,1.6,c.glow)+GEYE(22,32,1.3,c.eye)}},
 golem(c){return{b:P("M14 56 L16 44 L24 44 L25 56Z",c.rockD)+P("M34 56 L35 44 L43 44 L45 56Z",c.rockD)+P("M10 26 L18 18 L42 16 L52 24 L50 44 L36 48 L18 46 L10 38Z",c.rock)
   +P("M18 18 L42 16 L46 22 L22 24Z",c.rockL,' opacity=".7"')+P("M24 6 L38 5 L42 14 L38 20 L24 20 L20 13Z",c.rock)+P("M24 6 L38 5 L40 10 L24 11Z",c.rockL,' opacity=".6"')
   +P("M6 28 L12 25 L14 40 L6 44 L2 36Z",c.rockD)+P("M48 26 L58 30 L60 42 L52 46 L48 38Z",c.rockD)+P("M50 42 L62 44 L60 52 L50 52Z",c.rock)+P("M0 40 L8 40 L9 50 L1 50Z",c.rock)
   +S_("M22 28 l6 6 l-2 6 M38 22 l-2 8 l5 6",c.rockD,1.2),
   g:S_("M23 29 l5 5 l-1.5 5.5 M38 23 l-1.6 7 l4.5 5.5",c.glow,.9)+P("M29 32 l2 -3 l2 3 l-2 3z",c.glow)+GEYE(27,12.5,1.5,c.glow)+GEYE(35,12.2,1.5,c.glow)}},
 wolf(c){const fur=[0,1,2,3,4,5].map(i=>P(`M${16+i*5} ${33.5-i*.4} l2.5 -5 l2.5 5z`,c.dark)).join("");
  return{b:P("M17 36 Q7 37 3 29 Q1 23 5 20 Q6 27 12 29 Q15 30 18 31Z",c.main)+P("M16 34 Q8 34 5 28 Q9 31 17 32Z",c.light,' opacity=".6"')+P("M4 22 l-2 -3 l4 1z M3 27 l-3 0 l3 -2z",c.main)+P("M19 44 l-3 12 h5 l3 -11z",c.dark)+P("M40 44 l-1 12 h5 l1 -11z",c.dark)
   +fur+EL_(29,39,15,8.5,c.main)+P("M17 43 Q29 50 42 43 Q29 47 17 43Z",c.light)+P("M24 45 l-2 11 h5 l2 -10z",c.main)+P("M44 43 l0 13 h5 l-1 -12z",c.main)
   +P("M40 34 Q44 26 50 26 L54 22 L55 28 L63 34 Q63 38 58 38 L46 42Z",c.main)+P("M48 26 l1 -7 l4 6z",c.main)+P("M50 26 l1.5 -4.5 l2 4z",c.deep)
   +P("M52 37 L62 36 Q61 40 56 40.5 L51 40Z",c.dark)+P("M54 36.6 l1 2.4 l1 -2.4z M58 36.4 l.9 2.2 l.9 -2.2z",c.tooth)+C(62.4,34.2,1.3,"#140a12"),
   g:GEYE(53,30.6,1.3,c.eye)}},
 boar(c){const br=[0,1,2,3,4].map(i=>P(`M${20+i*5} ${30-Math.abs(i-1.5)*1.4} l1.5 -5 l2.5 5z`,c.deep)).join("");
  return{b:P("M19 46 l-2 10 h5 l2 -9z",c.dark)+P("M39 46 l-1 10 h5 l1 -9z",c.dark)+br+P("M12 38 Q12 28 28 27 Q42 26 46 34 L46 46 Q30 50 16 46Z",c.main)+P("M14 44 Q30 50 46 44 Q30 48 14 44Z",c.light)
   +S_("M10 36 Q4 34 3 38",c.main,2)+P("M24 46 l-1 10 h5 l1 -9z",c.main)+P("M44 45 l0 11 h5 l0 -10z",c.main)
   +P("M42 29 Q50 25 57 29 L63 35 Q64.5 40 61 41.5 L46 43Z",c.main)+P("M47 42 L62 41 Q60 46.5 55 47 L48 46.5Z",c.dark)+[50,53.5,57].map(x=>P(`M${x} 41.5 l1.1 2.6 l1.1 -2.6z`,c.tooth)).join("")
   +EL_(63,37,1.6,2.6,c.dark)+P("M45 29 l-3 -6 l6 3z",c.dark)+C(47,40,3.4,c.light,.55)+P("M58 42 Q61 37 59 32 Q63.5 36 61 42Z",c.bone)+P("M53 43 Q56 39 54.5 35 Q58.5 38 56 43Z",c.bone),
   g:GEYE(50,32.4,1.2,c.eye)}},
 bison(c){return{b:P("M18 46 l-2 10 h5 l2 -9z",c.dark)+P("M38 46 l-1 10 h5 l1 -9z",c.dark)+P("M6 38 Q4 30 10 30 Q8 36 12 40Z",c.dark)+P("M10 40 Q10 30 22 30 Q30 18 42 22 Q50 26 48 40 L46 47 Q28 50 14 46Z",c.main)
   +P("M30 22 Q42 18 48 26 Q50 36 46 46 Q42 34 36 30Z",c.dark)+P("M14 44 Q28 50 44 46 Q28 48 14 44Z",c.light)+P("M24 46 l-1 10 h5 l1 -9z",c.main)+P("M43 46 l0 10 h5 l0 -9z",c.main)
   +P("M44 30 Q54 28 58 34 L60 42 Q58 46 52 45 L46 44Z",c.dark)+P("M48 44 Q50 50 46 52 Q52 50 52 44Z",c.deep)+P("M46 31 Q42 22 48 20 Q46 26 50 30Z",c.bone)+P("M54 30 Q60 22 63 27 Q59 27 57 32Z",c.bone)+C(59,40,1.1,"#140a12"),
   g:GEYE(53,34.6,1.2,c.eye)}},
 rhino(c){const wool=[0,1,2,3,4,5].map(i=>C(16+i*5.5,31+Math.abs(i-2.5)*.8,3.4,c.dark)).join("");
  return{b:P("M17 46 l-2 10 h6 l2 -9z",c.dark)+P("M37 46 l-1 10 h6 l1 -9z",c.dark)+wool+P("M10 40 Q10 30 24 30 Q40 28 46 34 L46 46 Q28 50 14 46Z",c.main)+P("M14 44 Q28 50 46 44 Q28 48 14 44Z",c.light)
   +S_("M8 38 Q4 36 3 40",c.main,2)+P("M22 46 l-1 10 h6 l1 -9z",c.main)+P("M42 46 l0 10 h6 l0 -9z",c.main)
   +P("M42 32 Q52 28 58 34 L63 40 Q62 45 56 45 L46 45Z",c.main)+P("M50 31 Q52 14 58 6 Q57 18 55 31Z",c.bone)+P("M60 37 l3 -4 l0 5z",c.bone)+P("M46 31 l-1 -5 l4 3z",c.dark),
   g:GEYE(50,35.4,1.1,c.eye)}},
 crystal(c){return{b:P("M16 56 L18 44 L26 44 L26 56Z",c.dark)+P("M34 56 L35 44 L43 44 L45 56Z",c.dark)+P("M12 30 L20 20 L40 18 L50 28 L48 44 L34 48 L18 46 L12 38Z",c.main)
   +P("M20 20 L30 32 L40 18Z",c.light,' opacity=".75"')+P("M12 30 L30 32 L18 46Z",c.dark,' opacity=".55"')+P("M30 32 L48 44 L34 48Z",c.light,' opacity=".4"')
   +P("M22 6 L28 2 L38 6 L40 16 L30 20 L22 16Z",c.main)+P("M28 2 L30 20 L22 16 L22 6Z",c.light,' opacity=".6"')
   +P("M14 22 L6 12 L10 26Z M44 20 L52 8 L50 24Z M30 18 L32 10 L34 18Z",c.light)+P("M6 30 L12 28 L14 42 L4 44Z",c.dark)+P("M50 30 L60 34 L58 46 L50 46Z",c.dark)+P("M56 40 L64 46 L58 52 L52 48Z",c.main),
   g:C(30,32,4.2,c.glow,.45)+P("M30 27 l3 5 l-3 5 l-3 -5z","#fff",' opacity=".9"')+GEYE(27.5,11,1.3,c.glow)+GEYE(34,11,1.3,c.glow)}},
 bat(c){return{b:P("M30 30 Q20 12 4 10 Q8 16 6 20 Q10 20 8 26 Q14 24 14 30 Q20 28 22 36Z",c.dark)+P("M36 30 Q46 12 62 10 Q58 16 60 20 Q56 20 58 26 Q52 24 52 30 Q46 28 44 36Z",c.dark)
   +S_("M30 30 L6 11 M28 32 L8 25 M26 34 L14 30",c.deep,1)+S_("M36 30 L60 11 M38 32 L58 25 M40 34 L52 30",c.deep,1)
   +EL_(33,38,8,11,c.main)+EL_(33,41,5,7,c.light,0,.5)+P("M27 26 l-2 -9 l6 6z M39 26 l2 -9 l-6 6z",c.main)+EL_(33,28,7.5,6.5,c.main)
   +P("M29 32 Q33 36 37 32 Q33 34 29 32Z",c.deep)+P("M30.5 32.5 l1 3 l1 -2.6z M33.5 32.5 l1 2.6 l1 -3z",c.tooth)+S_("M29 48 l-2 6 M37 48 l2 6",c.dark,1.8),
   g:GEYE(30,27,1.4,c.eye)+GEYE(36,27,1.4,c.eye)}},
 kraken(c){const t=[[38,40,6,10],[44,38,10,6],[42,44,8,12],[34,46,2,14],[48,42,14,8]].map(([x,y,dx,dy],i)=>S_(`M${x} ${y} Q${x+dx*.8} ${y+dy*.2} ${x+dx} ${y+dy} Q${x+dx+3} ${y+dy+3} ${x+dx+1} ${y+dy+5}`,i%2?c.main:c.dark,3.4)).join("");
  return{b:t+C(22,32,17,c.main)+C(22,32,13,c.dark,.25)+S_("M22 32 m-11 0 a11 11 0 1 1 22 0 a8.5 8.5 0 1 1 -17 0 a6 6 0 1 1 12 0 a3.5 3.5 0 1 1 -7 0",c.light,1.6)
   +[0,1,2,3,4,5,6,7].map(i=>{const a=i*.785;return S_(`M${22+Math.cos(a)*13} ${32+Math.sin(a)*13} L${22+Math.cos(a)*17} ${32+Math.sin(a)*17}`,c.dark,1.1)}).join("")
   +EL_(40,36,8,7,c.main)+[38,42,46].map(x=>C(x+6,48+(x%4),1.2,c.light)).join(""),
   g:GEYE(42,34,2,c.eye)+C(42.6,34,.8,"#140a12")}},
 wasp(c){return{b:EL_(24,22,12,5,c.light,-25,.45)+EL_(30,19,11,4.4,c.light,-45,.4)+S_("M34 38 l-3 9 l-2 5 M38 38 l1 9 l-1 5 M42 37 l4 8 l1 5",c.deep,1.3)
   +EL_(18,40,12,7.5,c.main,-20)+[13,18,23].map(x=>P(`M${x} ${34+(x-13)*.2} Q${x+2.2} ${40} ${x+.6} ${47}`,"none",' stroke="'+c.deep+'" stroke-width="2.6"')).join("")+P("M6 44 L0 50 L8 46Z",c.deep)
   +EL_(37,35,7,5.5,c.dark)+EL_(48,32,6,5.2,c.main)+P("M52 34 l5 3 l-4 1z M52 31 l5 -1 l-4 3z",c.deep)+S_("M47 27 Q48 20 53 18 M50 28 Q53 22 58 22",c.deep,1),
   g:GEYE(49.6,30.6,1.6,c.eye)+C(0.8,49.6,1,c.glow)}},
 spider(c){const leg=(b,k,f,col,w)=>S_(`M${b[0]} ${b[1]} L${k[0]} ${k[1]} L${f[0]} ${f[1]}`,col,w),
  far=[[[36,40],[27,22],[13,55]],[[38,40],[34,18],[23,56]],[[41,41],[47,18],[51,56]],[[43,42],[56,24],[62,54]]].map(([b,k,f])=>leg(b,k,f,c.deep,2)).join(""),
  near=[[[35,44],[22,27],[6,57]],[[37,45],[30,23],[17,58]],[[41,45],[50,23],[46,58]],[[44,45],[60,29],[64,57]]].map(([b,k,f])=>leg(b,k,f,c.dark,2.4)).join("");
  return{b:far+EL_(20,37,14,11,c.main)+P("M12 33 Q20 28 28 33 Q20 46 12 33Z",c.dark)+P("M16 33 Q20 31 24 33 Q20 38 16 33Z",c.light,' opacity=".5"')+EL_(39,42,8.5,7,c.dark)+near
   +P("M45 45 Q48 50 45 53 Q49 51 49 46Z",c.bone)+P("M41 46 Q42 51 39 53 Q43 52 44 47Z",c.bone),
   g:GEYE(44,37,1.5,c.eye)+GEYE(46.8,39.4,1.2,c.eye)+GEYE(40.6,36.6,1,c.eye)+GEYE(43.2,40.5,.9,c.eye)}},
 eye(c){const rock=[[8,22],[54,14],[56,48],[6,50]].map(([x,y],i)=>P(`M${x-4} ${y} L${x} ${y-4} L${x+5} ${y-1} L${x+3} ${y+4} L${x-2} ${y+4}Z`,i%2?c.rockD:c.rock)).join("");
  return{b:rock+P("M32 6 L50 12 L58 30 L50 48 L32 54 L14 48 L6 30 L14 12Z",c.rock)+P("M32 6 L50 12 L46 16 L32 11 L18 16 L14 12Z",c.rockL,' opacity=".6"')+P("M32 11 L46 16 L52 30 L46 44 L32 49 L18 44 L12 30 L18 16Z",c.rockD)
   +EL_(32,30,16,11,"#f2ecdc")+C(32,30,8,c.main)+C(32,30,5.6,c.dark)+EL_(32,30,1.8,5.4,"#0a0510")+P("M16 30 Q32 14 48 30 Q32 20 16 30Z",c.rock)+P("M16 30 Q32 46 48 30 Q32 40 16 30Z",c.rockD,' opacity=".6"')
   +S_("M18 40 l-4 6 M46 40 l4 6 M32 50 l0 4",c.rockD,1.4),
   g:C(32,30,9,c.glow,.25)+C(29.4,27.6,1.6,"#fff",.9)+[[8,22],[56,48]].map(([x,y])=>C(x,y,1.3,c.glow)).join("")+S_("M24 9 l3 2 M40 9 l-3 2 M10 30 l3 0 M54 30 l-3 0",c.glow,1.1)}}};
/* --- dinosaures corrompus --- */
function corPal(type,el){const p=palette(type,el),h=p.h;return{...p,main:`hsl(${h} 30% 33%)`,dark:`hsl(${h} 38% 18%)`,light:`hsl(${h} 22% 50%)`,acc:`hsl(${(h+320)%360} 58% 34%)`,horn:"#d6c9ad",glow:`hsl(${h} 100% 63%)`}}
let EVIL_EYES=null;
const _eyeB=eye;eye=function(x,y,r){if(!EVIL_EYES)return _eyeB(x,y,r);EVIL_EYES.push([x,y,r]);return C(x,y,r,"#1a0612")};
const VEINS=k=>{const R=rng(hashS(k+"v")),f=n=>n.toFixed(1);let s="";for(let i=0;i<8;i++){let x=8+R()*48,y=18+R()*34,d=`M${f(x)} ${f(y)}`;for(let j=0;j<3;j++){const cx=x+(R()-.3)*10,cy=y+(R()-.5)*9;x=cx+(R()-.3)*8;y=cy+(R()-.5)*7;d+=` Q${f(cx)} ${f(cy)} ${f(x)} ${f(y)}`}s+=S_(d,"#c21fb0",1.5,.7)+S_(d,"#ff6be6",.6)}return s};
function corruptSVG(type,el,opt){opt=opt||{};const sp0=SPEC[type]||SPEC_DEFAULT[type];if(!sp0)return"";const cfg=PORT[type]||["T",{}],o={...cfg[1],...(opt.boss&&cfg[0]==="T"?{h:3,cr:2}:{})},c=corPal(type,el),sc=(o.sc||1),id="cv"+hashS(type+el+(opt.boss?"b":""));
 EVIL_EYES=[];let body,eyes;try{body=FAM[cfg[0]](c,o)}finally{eyes=EVIL_EYES;EVIL_EYES=null}
 const tr=`translate(${cfg[0]==="T"?-Math.max(0,(o.hs||1)-1)*8:0} 0) translate(32 55) scale(${sc}) translate(-32 -55)`;
 /* yeux : la tête des théropodes est mise à l'échelle autour de (44,25) */
 const eyeG=eyes.map(([x,y,r])=>{let X=x,Y=y;if(cfg[0]==="T"){const hs=o.hs||1;X=44+(x-44)*hs;Y=25+(y-25)*hs}return GEYE(X+.4,Y,r*.75,opt.boss?"#ff3b3b":"#ffd23c")}).join("");
 return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(sp0.name)} corrompu"><defs><mask id="${id}" style="mask-type:alpha"><g transform="${tr}">${body}</g></mask></defs><g filter="url(#vol)" transform="${tr}">${body}</g><g mask="url(#${id})" opacity=".85" filter="url(#eglow)">${VEINS(type)}</g>${typeof fxLayer==="function"?fxLayer(c,o.fx):""}<g filter="url(#eglow)" transform="${tr}">${eyeG}</g>${opt.boss?`<g filter="url(#eglow)" opacity=".9">${S_("M4 60 Q32 52 60 60","#ff3bd4",1.2,.6)}</g>`:""}</svg>`}
/* créatures basses agrandies (ancrées au sol) pour remplir le cadre comme les autres */
const BSC={croc:1.3,salamander:1.28,wolf:1.1,boar:1.12,bison:1.1,rhino:1.12,beetle:1.12,scorpion:1.08,skull:1.12};
function beastSVG(k,el,boss){const f=BEAST[k];if(!f)return"";const c=bpal(el,k),r=f(c),s=BSC[k]||1,tr=s!==1?` transform="translate(32 57) scale(${s}) translate(-32 -57)"`:"";
 return `<svg viewBox="0 0 64 64" overflow="visible" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(BNAME[k]||k)}"><g${tr}><g filter="url(#vol)">${r.b}</g><g filter="url(#eglow)">${r.g}</g></g></svg>`}
/* --- quel sprite pour quel ennemi --- */
const EN_SPR={"🐊":"croc","🐍":"snake","☠️":"skull","💀":"skull","🦴":"bones","🪲":"beetle","🦂":"scorpion","🔥":"salamander","🐲":"wyvern","🐉":"wyvern","⚡":"wyvern","👾":"void","🗿":"golem","🐺":"wolf","🐗":"boar","🐃":"bison","🦏":"rhino","🧊":"crystal","🦇":"bat","🐙":"kraken","🐝":"wasp","🕷️":"spider","👁️":"eye"};
const EN_COR={"🦎":"dilopho"};
const ELITE_BY={jungle:"carnota",ruines:"allo",volcan:"cerato",obelisque:"utah",neutre:"allo"},GUARD_BY={jungle:"giga",ruines:"spino",volcan:"carcharo",obelisque:"tyranno",neutre:"rex"},DUN_BOSS=["bones","boar","crystal","spider","wyvern"];
const BNAME={croc:"Sarcosuchus",snake:"Titanoboa",skull:"Spectre fossile",bones:"Squelette animé",beetle:"Scarabée cuirassé",scorpion:"Scorpion géant",salamander:"Salamandre de lave",wyvern:"Wyverne",void:"Rôdeur du néant",golem:"Sentinelle de pierre",wolf:"Loup sinistre",boar:"Entélodon",bison:"Bison colossal",rhino:"Élasmothérium",crystal:"Golem de cristal",bat:"Chauve-souris géante",kraken:"Ammonite géante",wasp:"Guêpe géante",spider:"Araignée géante",eye:"Œil du temple"};
function enemyLook(e,f){f=f||fight;if(!e)return null;const mode=f&&f.o?f.o.mode:"";if(mode==="arena"&&e.pt&&SPEC[e.pt])return null;
 const z=typeof stageZone==="function"?stageZone((f&&f.zone)||""):"neutre";
 if(e.e==="👹"){if(mode==="dungeon"&&f.o.d!==undefined&&DUN_BOSS[f.o.d])return{k:DUN_BOSS[f.o.d],boss:true};return{cor:GUARD_BY[z]||"rex",boss:true}}
 if(e.e==="🦖")return{cor:ELITE_BY[z]||"allo",boss:!!e.boss};
 if(EN_SPR[e.e])return{k:EN_SPR[e.e],boss:!!e.boss};
 if(EN_COR[e.e])return{cor:EN_COR[e.e],boss:!!e.boss};
 return{cor:typeof enemyPT==="function"?enemyPT(e):"raptor",boss:!!e.boss}}
const ECACHE={};
function enemySVG(e,f){const L=enemyLook(e,f);if(!L)return"";const key=(L.k||"c:"+L.cor)+"|"+e.el+"|"+(L.boss?1:0);if(ECACHE[key])return ECACHE[key];
 return ECACHE[key]=L.k?beastSVG(L.k,e.el,L.boss):corruptSVG(L.cor,e.el,{boss:L.boss})}
/* noms : « Jungle · Sarcosuchus », « Tour · Allosaure corrompu (élite) » (les gardiens gardent leur titre) */
function bnName(e,f){if(!e||e._nm)return;e._nm=1;const L=enemyLook(e,f);if(!L||/^Gardien/.test(e.name||""))return;const nm=L.k?BNAME[L.k]:SPEC[L.cor]?SPEC[L.cor].name+" corrompu":"";if(!nm)return;
 e.name=String(e.name||"").split(" · ")[0]+" · "+nm+(L.boss?" (gardien)":/Élite/.test(e.name||"")?" (élite)":"")}
/* --- branchement sur la scène de combat --- */
const _sbB=stageBuild;stageBuild=function(){const f=fight,e=f&&f.mx&&f.enemies?f.enemies[f.wave]:null;if(e)bnName(e,f);const st=_sbB();if(!st||!e)return st;
 const nb=st.querySelector(".sHud .grow>b");if(nb)nb.textContent=e.name;if(PREFS.art!=="svg")return st;const svg=enemySVG(e,f);if(!svg)return st;
 const en=st.querySelector(".sEnemy"),a=en&&en.querySelector(".sEart");if(!a)return st;const L=enemyLook(e,f);
 a.innerHTML=`<span class="pt">${svg}</span>`;en.style.setProperty("--hue","0deg");en.classList.add(L.k?"beast":"corrupt","b-"+(L.k||L.cor));if(L.boss)en.classList.add("crown");return st};
