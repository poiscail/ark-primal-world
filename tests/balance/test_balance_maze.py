"""Labyrinthe des reliques : taux de courses gagnées, par progression d'histoire et profondeur, avec un bot qui joue bien
(compétences, super, meilleure orbe), choisit sa route (campement si PV bas, élites si PV hauts), prend la relique la plus rare
et fait des choix raisonnables aux mystères. L'équipe repart du même niveau à chaque course (elle gagne de l'XP pendant la course).
Usage : python3 tests/test_balance_maze.py [courses_par_mesure]"""
import sys;sys.path.insert(0,str(__import__("pathlib").Path(__file__).resolve().parent));from balance_seuil import alerte
import asyncio,pathlib,sys,json
from playwright.async_api import async_playwright
GAME=(pathlib.Path(__file__).resolve().parent.parent.parent/'game'/'index.html').as_uri()
N=int(sys.argv[1]) if len(sys.argv)>1 else 12
JS='''(cfg)=>{const types=["rex","giga","carnota"],RO={c:1,r:2,l:3,x:0};
const avg=r=>r.hp.reduce((a,b)=>a+b,0)/3;
const EVP={source:r=>avg(r)<.7?0:1,nid:()=>1,autel:r=>avg(r)>.6?0:1,carcasse:()=>0,ambre:()=>0,meute:r=>avg(r)>.5?0:1,totem:()=>0,eboul:r=>r.crocs>=30?1:0,
 ermite:r=>mzHasCurse(r)?0:1,fontaine:r=>r.crocs>=25?0:1,oeufdor:()=>1,embus:r=>avg(r)>.6?0:1,etoile:r=>avg(r)<.6?1:0,pisteur:()=>1};
function bot(){let g=0;while(fight&&!fight.over&&g++<600){[0,1,2].forEach(k=>{if(fight&&!fight.over&&fight.hp[k]>0&&fight.cd[k]<=0)useSkill(k)});if(fight.over)break;
 if(fight.sp>=100){special();continue}let b=0,bv=-1;fight.orbs.forEach((c,i)=>{const v=orbPreview(c);if(v>bv){bv=v;b=i}});tapOrb(b)}}
function pickNode(run){const R=mzReach(run),a=avg(run),ko=run.hp.some(h=>h<=0);let best=null,bs=-9;
 R.forEach(([r,c])=>{const t=run.map[r][c].t;let s={f:1.3,e:.4,q:1.2,c:1,s:.8,t:2,b:5}[t];
  if(a<.45||ko)s={f:0,e:-2,q:1,c:3,s:run.crocs>=30?1.5:.5,t:2,b:5}[t];else if(a>.75)s={f:1.5,e:2.5,q:1.2,c:.3,s:run.crocs>=60?2:.5,t:2.2,b:5}[t];
  s+=Math.random()*.3;if(s>bs){bs=s;best=[r,c]}});return best}
function run1(d){S.maze.run=null;mzSelD=d;mzStart();let guard=0;
 while(S.maze.run&&guard++<400){const run=S.maze.run,p=run.pend;
  if(p){if(p.t==="start"||p.t==="relic"){const k=[...p.ch].sort((x,y)=>RO[RELICS[y].r]-RO[RELICS[x].r])[0];if(k)mzTake(k);else mzSkip();continue}
   if(p.t==="event"){const E=MZ_EV.find(x=>x.id===p.id);let i=EVP[E.id]?EVP[E.id](run):0;if(E.o[i][3]&&!E.o[i][3](run))i=E.o.findIndex(o=>!o[3]||o[3](run));mzEvOpt(i);continue}
   if(p.t==="note"){mzOk();continue}
   if(p.t==="camp"){mzCamp(avg(run)<.8||run.hp.some(h=>h<=0)?0:1);continue}
   if(p.t==="shop"){const i=p.items.map((it,j)=>[it,j]).filter(([it])=>!it.sold&&run.crocs>=it.p).sort((x,y)=>RO[RELICS[y[0].k].r]-RO[RELICS[x[0].k].r])[0];if(i){mzBuy(i[1]);continue}
    if(!p.svc.heal&&run.crocs>=30&&run.hp.some(x=>x>0&&x<.7)){mzSvc("heal");continue}if(!p.svc.purge&&mzHasCurse(run)&&run.crocs>=55){mzSvc("purge");continue}mzLeave();continue}
   break}
  if(run.cur){S.level=cfg.rank;mzFight();bot();continue}
  const nd=pickNode(run);if(!nd)break;mzEnter(nd[0],nd[1])}
 return S.maze.last}
const out={};for(const [stage,L,star,gear,lab] of cfg.teams){for(const d of cfg.depths){let w=0,acts=0,fights=0;
 for(let i=0;i<cfg.n;i++){S.team=types.map((t,j)=>({id:j+1,type:t,level:L,xp:0,star}));S.gear=gear;S.stage=stage;S.level=cfg.rank=Math.round(stage/4)+1;S.xp=0;S.maze.asc=10;
  const r=run1(d);if(r&&r.win)w++;acts+=r?r.act+(r.win?1:0):0;fights+=r?(r.st.f||0)+(r.st.e||0)+(r.st.b||0):0}
 out[lab+" · histoire "+stage+" · profondeur "+d]={victoires:Math.round(w/cfg.n*100)+" %",actes:+(acts/cfg.n).toFixed(2),combats:+(fights/cfg.n).toFixed(1)}}}
return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
        await pg.goto(GAME);await pg.wait_for_timeout(300);await pg.evaluate("PREFS.anim=false;PREFS.lore=false;PREFS.diff='normal';applyPrefs();WX_ON=false;toast=()=>{}")
        teams=[]
        for st in [20,40,70,100]:
            L=-(-st//2)+1;teams.append([st,L,min(5,st//20),st//10,"conseillée éveillée+forge"])
        teams.append([40,21,0,0,"conseillée nue"]);teams.append([70,36,0,0,"conseillée nue"])
        cfg={'n':N,'depths':[0,3,6,10],'teams':teams,'rank':1}
        res=await pg.evaluate(JS,cfg)
        for k,v in res.items():print(k,json.dumps(v,ensure_ascii=False))
        print('erreurs:',errs);await b.close()
        return alerte(res,0)+len(errs)
sys.exit(1 if asyncio.run(main()) else 0)
