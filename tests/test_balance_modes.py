"""Taux de victoire simulés : Tour infinie et Arène (joueur qui utilise ses compétences et choisit bien ses orbes)."""
import asyncio,pathlib
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
JS='''()=>{const types=["rex","spino","giga","mosa","argento","dracorex"],out={tower:{},arena:{}};
const run=(setup,start)=>{let w=0,T=20;for(let r=0;r<T;r++){S.team=[0,1,2].map(i=>({id:i+1,type:types[i],level:setup.L,xp:0,star:setup.st}));S.gear=setup.gr;S.stage=99;start();let g=0;
 while(!fight.over&&g++<600){[0,1,2].forEach(k=>{if(!fight.over&&fight.hp[k]>0&&fight.cd[k]<=0)useSkill(k)});if(fight.over)break;
  if(fight.sp>=100){special();continue}let best=0,bv=-1;fight.orbs.forEach((c,i)=>{const v=orbPreview(c);if(v>bv){bv=v;best=i}});tapOrb(best)}
 if(fight.over==="win")w++}return w/T};
for(const f of [1,5,10,20,30,40,60,80]){const n=eqLv(f),L=Math.ceil(n/2)+1,st=Math.min(5,Math.floor(n/20)),gr=Math.floor(n/10);
 out.tower[f]={rec:run({L,st,gr},()=>{S.tower.floor=f;startBattle({mode:"tower"})}),low:run({L:Math.max(1,L-6),st:0,gr:0},()=>{S.tower.floor=f;startBattle({mode:"tower"})})}}
for(const r of [800,1000,1300,1700]){out.arena[r]={};for(let d=0;d<3;d++){const n=Math.round((r-700)/10+[-6,6,24][d]),L=Math.ceil(n/2)+1,st=Math.min(5,Math.floor(n/20)),gr=Math.floor(n/10);
 out.arena[r][ARENA_D[d][0]]=run({L,st,gr},()=>startBattle({mode:"arena",go:true,d,n:Math.max(3,n),team:"Test",sp:["raptor","trike","rex"]}))}}
return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(GAME);await pg.wait_for_timeout(200);await pg.evaluate("PREFS.anim=false;PREFS.lore=false;applyPrefs()")
        res=await pg.evaluate(JS)
        for k,v in res['tower'].items():print('tour étage',k,v)
        for k,v in res['arena'].items():print('arène',k,v)
        print('erreurs:',errs);await b.close()
asyncio.run(main())
