"""Taux de victoire par niveau d'histoire, avec un joueur qui utilise ses compétences et choisit bien ses orbes."""
import asyncio,pathlib
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
JS='''()=>{const out={},types=["rex","spino","giga","mosa","argento","dracorex"];
const sim=(n,L,star,gear,skills)=>{let w=0,T=20;for(let r=0;r<T;r++){S.team=[0,1,2].map(i=>({id:i+1,type:types[i],level:L,xp:0,star}));S.gear=gear;S.stage=99;startBattle({mode:"story",n});let g=0;
 while(!fight.over&&g++<500){if(skills)[0,1,2].forEach(k=>{if(!fight.over&&fight.hp[k]>0&&fight.cd[k]<=0)useSkill(k)});if(fight.over)break;
  if(fight.sp>=100){special();continue}let best=0,bv=-1;fight.orbs.forEach((c,i)=>{const v=orbPreview(c);if(v>bv){bv=v;best=i}});tapOrb(best)}
 if(fight.over==="win")w++}return w/T};
for(const n of [5,10,20,30,50,70,100]){const L=Math.ceil(n/2)+1,st=Math.min(5,Math.floor(n/20)),gr=Math.floor(n/10);
 out[n]={"niv conseillé nu":sim(n,L,0,0,true),"niv conseillé éveillé+forge":sim(n,L,st,gr,true),"sans compétences":sim(n,L,st,gr,false),"6 niv. en dessous":sim(n,Math.max(1,L-6),0,0,true)}}return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(GAME);await pg.wait_for_timeout(200)
        res=await pg.evaluate(JS)
        for k,v in res.items():print('niv',k,v)
        print('erreurs:',errs);await b.close()
asyncio.run(main())
