import asyncio,pathlib
GAME=(pathlib.Path(__file__).resolve().parent.parent/'game'/'index.html').as_uri()
from playwright.async_api import async_playwright
async def m():
 async with async_playwright() as p:
  b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
  await pg.goto(GAME);await pg.wait_for_timeout(300)
  async def play(opts):
   await pg.evaluate(f'startBattle({opts})')
   for _ in range(200):
    if await pg.evaluate('fight.over'):break
    if await pg.evaluate('fight.sp>=100'):await pg.evaluate('special()')
    else:await pg.evaluate('tapOrb(0)')
   return await pg.evaluate('fight.over')
  await pg.evaluate('S.team=[{id:1,type:"rex",level:30,xp:0},{id:2,type:"spino",level:30,xp:0},{id:3,type:"stego",level:30,xp:0}];S.nextId=10;render()')
  print('histoire 1:',await play("{mode:'story',n:1}"),'stage',await pg.evaluate('S.stage'))
  print('rapport missions présent:',await pg.locator('text=Suivi des missions').count())
  for n in (2,10,11): print('niv',n,await play("{mode:'story',n:%d}"%n))
  print('stage:',await pg.evaluate('S.stage'),'mat',await pg.evaluate('JSON.stringify(S.mat)'))
  await pg.evaluate('S.stage=100;render()')
  print('boss 100:',await play("{mode:'story',n:100}"),'stage',await pg.evaluate('S.stage'))
  await pg.evaluate('S.stage=100;render()')
  print('donjon:',await play("{mode:'dungeon',d:0,tier:5,n:90}"),await pg.evaluate('JSON.stringify(S.mat)'))
  await pg.evaluate('S.mat={bone:99,hide:99,crystal:99,amber:99};awaken(S.team[0].id);awaken(S.team[0].id)');print('étoiles:',await pg.evaluate('S.team[0].star'))
  await pg.evaluate('S.tickets=50;S.stone=1000;S.mat.crystal=100;summon(1);doGacha(10,RATE_STD(),"tickets",9,true);doGacha(10,[13,40,35,12],"crystal",45,true);doGacha(10,RATE_STD(),"stone",380)')
  print('dinos:',await pg.evaluate('S.team.length'),'pity',await pg.evaluate('S.pity'))
  await pg.evaluate('claimAll()');print('missions réclamées:',await pg.evaluate('Object.keys(S.dclaimed).length+Object.keys(S.claimed).length'))
  for sc in ['home','team','battle','summon','story','dungeon','missions']:
   await pg.evaluate(f'go("{sc}")')
  await pg.screenshot(path='/tmp/ark_shot.png')
  await pg.evaluate('go("home");subSet("home","profile")');await pg.evaluate('trExportCode()');c=await pg.input_value('#trCode');await pg.evaluate('S.team=[S.team[0]]');await pg.fill('#trCode',c)
  async with pg.expect_navigation():await pg.evaluate('trImportCode()')
  await pg.wait_for_timeout(400);print('import ok:',await pg.evaluate('S.team.length>10'))
  print('erreurs:',errs);await b.close()
asyncio.run(m())
