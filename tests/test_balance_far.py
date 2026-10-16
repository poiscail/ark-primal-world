"""Le Grand Nord : taux de victoire par niveau, avec une équipe conseillée pour le niveau des ennemis (éveil + forge)
et l'équipe qui vient d'ouvrir le Grand Nord (histoire 50). Usage : python3 tests/test_balance_far.py [combats_par_mesure]"""
import asyncio,pathlib,sys,json
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
N=int(sys.argv[1]) if len(sys.argv)>1 else 20
JS='''(T)=>{const types=["rex","giga","carnota"],out={};
const sim=(n,L,star,gear)=>{let w=0;for(let r=0;r<T;r++){S.team=types.map((t,j)=>({id:j+1,type:t,level:L,xp:0,star}));S.gear=gear;S.stage=100;S.far.stage=40;S.level=Math.round(FAR_EQ(n)/4)+1;S.xp=0;
  fight=null;startBattle({mode:"far",n});let g=0;
  while(fight&&!fight.over&&g++<600){[0,1,2].forEach(k=>{if(fight&&!fight.over&&fight.hp[k]>0&&fight.cd[k]<=0)useSkill(k)});if(fight.over)break;
   if(fight.sp>=100){special();continue}let b=0,bv=-1;fight.orbs.forEach((c,i)=>{const v=orbPreview(c);if(v>bv){bv=v;b=i}});tapOrb(b)}
  if(fight&&fight.over==="win")w++}return Math.round(w/T*100)+" %"};
for(const n of [1,5,10,15,20,25,30,35,40]){const eq=FAR_EQ(n),L=Math.ceil(eq/2)+1;
 out["Grand Nord "+n+" (ennemis niv. "+eq+")"]={"équipe conseillée (éveil+forge)":sim(n,L,Math.min(5,Math.floor(eq/20)),Math.floor(eq/10)),"équipe de l'histoire 50 (éveil+forge)":sim(n,26,2,5)}}
return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await pg.evaluate("PREFS.anim=false;PREFS.lore=false;PREFS.diff='normal';applyPrefs();WX_ON=false;toast=()=>{}")
        res=await pg.evaluate(JS,N)
        for k,v in res.items():print(k,json.dumps(v,ensure_ascii=False))
        print('erreurs:',errs);await b.close()
asyncio.run(main())
