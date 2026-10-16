"""Mode Cauchemar : taux de victoire par niveau, avec un bot qui utilise ses compétences, la super et la meilleure orbe.
Équipe « conseillée » = celle qui gagne l'histoire au niveau équivalent (niveau ×1,2 + 6, voir NM_LV), éveillée et forgée comme dans
test_balance.py ; comparée à l'équipe qui vient juste de finir le chapitre normal correspondant.
Usage : python3 tests/test_balance_nightmare.py [combats_par_mesure] [pv atq k b] (réglages à essayer)"""
import asyncio,pathlib,sys,json
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
N=int(sys.argv[1]) if len(sys.argv)>1 else 20
JS='''(T)=>{const types=["rex","giga","carnota"],out={};if(T.tune){NM_TUNE=T.tune;NM_LV=T.lv;T=T.n}
const sim=(n,L,star,gear)=>{let w=0;for(let r=0;r<T;r++){S.team=types.map((t,j)=>({id:j+1,type:t,level:L,xp:0,star}));S.gear=gear;S.stage=100;S.nm.stage=100;S.level=Math.round(NM_EQ(n)/4)+1;S.xp=0;
  fight=null;startBattle({mode:"nightmare",n});let g=0;
  while(fight&&!fight.over&&g++<600){[0,1,2].forEach(k=>{if(fight&&!fight.over&&fight.hp[k]>0&&fight.cd[k]<=0)useSkill(k)});if(fight.over)break;
   if(fight.sp>=100){special();continue}let b=0,bv=-1;fight.orbs.forEach((c,i)=>{const v=orbPreview(c);if(v>bv){bv=v;b=i}});tapOrb(b)}
  if(fight&&fight.over==="win")w++}return Math.round(w/T*100)+" %"};
for(const n of [5,10,30,50,70,100]){const eq=NM_EQ(n),L=Math.ceil(eq/2)+1,c=Math.ceil(n/10)*10,Lc=Math.ceil(c/2)+1;
 out["cauchemar "+n+" (ennemis niv. "+eq+")"]={"équipe conseillée niv. équivalent (éveil+forge)":sim(n,L,Math.min(5,Math.floor(eq/20)),Math.floor(eq/10)),
  "équipe qui vient de finir le chapitre normal (éveil+forge)":sim(n,Lc,Math.min(5,Math.floor(c/20)),Math.floor(c/10))}}
return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await pg.evaluate("PREFS.anim=false;PREFS.lore=false;PREFS.diff='normal';applyPrefs();WX_ON=false;toast=()=>{}")
        arg=N
        if len(sys.argv)>4:arg={'n':N,'tune':{'hp':float(sys.argv[2]),'atk':float(sys.argv[3])},'lv':{'k':float(sys.argv[4]),'b':float(sys.argv[5])}}
        res=await pg.evaluate(JS,arg)
        for k,v in res.items():print(k,json.dumps(v,ensure_ascii=False))
        print('erreurs:',errs);await b.close()
asyncio.run(main())
