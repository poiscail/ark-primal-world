"""Défi du jour (0.26) : taux de victoire selon la règle du jour (aucune, Colosse solitaire, Surcharge, Coups critiques,
Blessures profondes), avec l'équipe conseillée pour la progression (éveil + forge). Usage : python3 tests/test_balance_daily.py [combats] [règles,…] [niveaux,…]"""
import sys;sys.path.insert(0,str(__import__("pathlib").Path(__file__).resolve().parent));from balance_seuil import alerte
import asyncio,pathlib,sys,json
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
N=int(sys.argv[1]) if len(sys.argv)>1 else 20
RULES=sys.argv[2].split(",") if len(sys.argv)>2 else ["none","giant","charge","crit","deep"]
LEVELS=[int(x) for x in sys.argv[3].split(",")] if len(sys.argv)>3 else [15,35,65,95,30,100]
JS='''([T,RULES,LEVELS])=>{const types=["rex","giga","carnota"],out={};DRULES.push({k:"none",i:"",n:"Aucune",d:""});
const sim=(n,rule)=>{let w=0;const L=Math.ceil(n/2)+1;for(let r=0;r<T;r++){S.team=types.map((t,j)=>({id:j+1,type:t,level:L,xp:0,star:Math.min(5,Math.floor(n/20))}));S.gear=Math.floor(n/10);S.stage=n;S.level=Math.round(n/4)+1;S.xp=0;
  DRULE_FORCE=rule;fight=null;dchStart();let g=0;
  while(fight&&!fight.over&&g++<600){[0,1,2].forEach(k=>{if(fight&&!fight.over&&fight.hp[k]>0&&fight.cd[k]<=0)useSkill(k)});if(fight.over)break;
   if(fight.sp>=100){special();continue}let b=0,bv=-1;fight.orbs.forEach((c,i)=>{const v=orbPreview(c);if(v>bv){bv=v;b=i}});tapOrb(b)}
  if(fight&&fight.over==="win")w++}return Math.round(w/T*100)+" %"};
for(const n of LEVELS){const o={};for(const k of RULES)o[k]=sim(n,k);out["Défi du jour, niveau "+n+(n%10?"":" (boss)")]=o}
return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await pg.evaluate("PREFS.anim=false;PREFS.lore=false;PREFS.diff='normal';applyPrefs();WX_ON=false;toast=()=>{}")
        res=await pg.evaluate(JS,[N,RULES,LEVELS])
        for k,v in res.items():print(k,json.dumps(v,ensure_ascii=False))
        print('erreurs:',errs);await b.close()
        return alerte(res,0)+len(errs)
sys.exit(1 if asyncio.run(main()) else 0)
