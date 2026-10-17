"""Épreuves de la meute : taux de victoire par palier avec une équipe conseillée pour le niveau du palier (éveil + forge),
bot qui joue bien. Usage : python3 tests/test_balance_trials.py [combats_par_mesure]"""
import sys;sys.path.insert(0,str(__import__("pathlib").Path(__file__).resolve().parent));from balance_seuil import alerte
import asyncio,pathlib,sys,json
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
N=int(sys.argv[1]) if len(sys.argv)>1 else 20
JS='''(T)=>{const out={};
const sim=(id,types,L,star,gear,t)=>{let w=0;for(let r=0;r<T;r++){S.team=types.map((x,j)=>({id:j+1,type:x,level:L,xp:0,star}));S.gear=gear;S.stage=100;S.level=Math.round(TR_TIERS[t].lv/4)+1;S.xp=0;S.trial.done={};S.trial.done[id]=t-1;
  fight=null;startBattle({mode:"trial",id,t});let g=0;
  while(fight&&!fight.over&&g++<600){[0,1,2].forEach(k=>{if(fight&&!fight.over&&fight.hp[k]>0&&fight.cd[k]<=0)useSkill(k)});if(fight.over)break;
   if(fight.sp>=100){special();continue}let b=0,bv=-1;fight.orbs.forEach((c,i)=>{const v=orbPreview(c);if(v>bv){bv=v;b=i}});tapOrb(b)}
  if(fight&&fight.over==="win")w++}return Math.round(w/T*100)+" %"};
for(let t=0;t<3;t++){const lv=TR_TIERS[t].lv,L=Math.ceil(lv/2)+1,st=Math.min(5,Math.floor(lv/20)),gr=Math.floor(lv/10);
 out[TR_TIERS[t].n+" (niv. "+lv+", équipe niv. "+L+")"]={"Meute (3 théropodes)":sim("fam_T",["rex","giga","carnota"],L,st,gr,t),"Marée (3 💧 contre 🌿)":sim("el_blueorb",["mosa","stego","ptera"],L,st,gr,t),
  "Les humbles (3 communs)":sim("rar_c",["raptor","trike","parasau"],L,st,gr,t),"Sans super":sim("rule_sp",["rex","giga","carnota"],L,st,gr,t),"Sans compétences":sim("rule_sk",["rex","giga","carnota"],L,st,gr,t),"Contre la montre":sim("rule_t",["rex","giga","carnota"],L,st,gr,t)}}
return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await pg.evaluate("PREFS.anim=false;PREFS.lore=false;PREFS.diff='normal';applyPrefs();WX_ON=false;toast=()=>{}")
        res=await pg.evaluate(JS,N)
        for k,v in res.items():print(k,json.dumps(v,ensure_ascii=False))
        print('erreurs:',errs);await b.close()
        return alerte(res,0)+len(errs)
sys.exit(1 if asyncio.run(main()) else 0)
