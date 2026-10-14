import asyncio,pathlib
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri(),sys
from playwright.async_api import async_playwright
async def m():
 async with async_playwright() as p:
  b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(GAME);await pg.wait_for_timeout(200)
  res=await pg.evaluate('''()=>{const out={};const types=["rex","spino","giga","mosa","argento","dracorex"];
  const sim=(n,L,star,gear)=>{let w=0,T=20;for(let r=0;r<T;r++){S.team=[0,1,2].map(i=>({id:i+1,type:types[i],level:L,xp:0,star}));S.gear=gear;S.stage=99;startBattle({mode:"story",n});let g=0;
   while(!fight.over&&g++<400){if(fight.sp>=100){special();continue}let best=0,bv=-1;fight.orbs.forEach((c,i)=>{let v=0;S.team.forEach(d=>{v+=(sp(d).element===c?1.8:c==="goldorb"?1.3:.9)*(c===fight.last?1.15:1)});if(v>bv){bv=v;best=i}});tapOrb(best)}
   if(fight.over==="win")w++}return w/T};
  for(const n of [5,10,20,30,50,70,100]){const L=Math.ceil(n/2)+1;out[n]={rec:sim(n,L,0,0),mid:sim(n,L,Math.min(5,Math.floor(n/20)),Math.floor(n/10))}}return out}''')
  for k,v in res.items():print('niv',k,v)
  print(errs);await b.close()
asyncio.run(m())
