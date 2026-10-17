"""Ordre des scripts et des feuilles de style (0.41, idée 466) — vérification statique, sans navigateur :
- chaque fichier référencé par game/index.html existe, et chaque js/css du dossier est chargé (pas de fichier oublié) ;
- 99-layout.js est le dernier script, 99-juice.js juste avant ; 00-version.js et 00-core.js sont les premiers ;
- 95-theme.css puis 96-skins.css, puis 90-platform.css, puis 97-pc.css ; les 97-*.css viennent après ;
- aucun nom global déclaré deux fois avec const/let entre deux scripts (sinon le second script ne se charge pas du tout :
  vrai bug de 0.39, « _rbG2 has already been declared ») : on concatène les scripts dans l'ordre et on demande à node de
  vérifier la syntaxe du tout."""
import pathlib,re,subprocess,sys,tempfile
ROOT=pathlib.Path(__file__).resolve().parent.parent/'game'
FAILS=[]
def check(name,cond,info=''):
    print(('OK   ' if cond else 'FAIL ')+name+(' '+str(info) if (info!='' and not cond) else ''))
    if not cond:FAILS.append(name)
html=(ROOT/'index.html').read_text()
js=re.findall(r'<script src="(js/[^"]+)"',html);css=re.findall(r'<link rel="stylesheet" href="(css/[^"]+)"',html)
check('fichiers référencés présents',all((ROOT/x).exists() for x in js+css),[x for x in js+css if not (ROOT/x).exists()])
oubli=sorted(str(p.relative_to(ROOT)) for p in list((ROOT/'js').glob('*.js'))+list((ROOT/'css').glob('*.css')) if str(p.relative_to(ROOT)) not in js+css)
check('aucun fichier js/css oublié dans index.html',oubli==[],oubli)
check('pas de doublon de chargement',len(js)==len(set(js)) and len(css)==len(set(css)))
check('00-version.js puis 00-core.js en premier',js[:2]==['js/00-version.js','js/00-core.js'],js[:2])
check('99-layout.js en dernier, 99-juice.js juste avant',js[-2:]==['js/99-juice.js','js/99-layout.js'],js[-3:])
i=lambda n:css.index('css/'+n) if 'css/'+n in css else -1
check('95-theme < 96-skins < 90-platform < 97-pc',0<=i('95-theme.css')<i('96-skins.css')<i('90-platform.css')<i('97-pc.css'),[i('95-theme.css'),i('96-skins.css'),i('90-platform.css'),i('97-pc.css')])
p97=[n for n in css if re.match(r'css/97-',n)]
check('toutes les feuilles 97-* après 97-pc',all(css.index(n)>=i('97-pc.css') for n in p97))
check('99-tuning après 50-skills-species (équilibrage global)',js.index('js/99-tuning.js')>js.index('js/50-skills-species.js'))
check('99-species2 avant 99-trials ; 99-skills3 avant 99-mastery',js.index('js/99-species2.js')<js.index('js/99-trials.js') and js.index('js/99-skills3.js')<js.index('js/99-mastery.js'))
# doublons de const/let entre scripts : node vérifie la syntaxe de la concaténation
with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False) as t:
    for x in js:t.write('\n/* ==== %s ==== */\n'%x+(ROOT/x).read_text()+'\n;\n')
    tmp=t.name
r=subprocess.run(['node','--check',tmp],capture_output=True,text=True)
msg=(r.stderr or '').strip().splitlines()
where=''
if r.returncode:
    m=re.search(r':(\d+)',r.stderr or '');ln=int(m.group(1)) if m else 0
    src=open(tmp).read().splitlines();cur=''
    for k,l in enumerate(src[:ln]):
        mm=re.match(r'/\* ==== (.+) ==== \*/',l)
        if mm:cur=mm.group(1)
    where=cur
check('aucun nom global déclaré deux fois (const/let) entre les scripts',r.returncode==0,(where,[l for l in msg if 'Error' in l][:1]))
pathlib.Path(tmp).unlink()
print('ÉCHECS:',FAILS or 'aucun');sys.exit(1 if FAILS else 0)
