#!/usr/bin/env python3
"""Publie une page GitHub (« release ») par version, avec les notes du CHANGELOG.
- Versions anciennes (0.4.0 à 0.17.0) : étiquette vX.Y.Z sur le commit de la version + zip du jeu de l'époque
  (à ouvrir dans un navigateur : index.html). Créées une seule fois, jamais marquées « dernière version ».
- Version actuelle (game/js/00-version.js) : étiquette sur le commit construit + les .exe Windows (installateur, portable),
  marquée « dernière version » ; recréée à chaque construction de main pour suivre le code.
Lancé par .github/workflows/windows-exe.yml après les tests de l'exe (gh + GITHUB_TOKEN).
  python3 tools/releases.py --exe-dir=DOSSIER [--sha=COMMIT] [--dry-run]"""
import os,re,subprocess,sys,pathlib,tempfile
ROOT=pathlib.Path(__file__).resolve().parent.parent
REPO=os.environ.get('GITHUB_REPOSITORY','poiscail/ark-primal-world')
LATEST=f'https://github.com/{REPO}/releases/latest'
# version -> commit de la branche main (0.1 à 0.3 sont antérieures au dépôt)
HISTORY=[("0.4.0","4de54cb"),("0.5.0","2ae32c6"),("0.6.0","f82cffd"),("0.7.0","1c34d3d"),("0.8.0","3c0c7f8"),("0.9.0","4a52558"),
         ("0.10.0","d409b94"),("0.11.0","6fc7c65"),("0.12.0","2c869ca"),("0.13.0","8355fd8"),("0.14.0","a5ffc69"),("0.15.0","2e0c1ef"),
         ("0.16.0","9dccc9b"),("0.17.0","94d5f0c")]
DRY='--dry-run' in sys.argv
def arg(k,d=None):
    for a in sys.argv[1:]:
        if a.startswith(k+'='):return a.split('=',1)[1]
    return d
def run(*cmd,capture=False):
    print('>',' '.join(cmd),flush=True)
    if DRY and cmd[0]=='gh' and cmd[2] in('create','delete'):return ''
    r=subprocess.run(cmd,check=True,text=True,capture_output=capture);return r.stdout if capture else ''
def version():return re.search(r'ARK_VERSION="([^"]+)"',(ROOT/'game/js/00-version.js').read_text(encoding='utf-8')).group(1)
def changelog():
    """{"0.17.0": ("titre", "notes")} d'après les sections « ## X.Y.Z — titre » du CHANGELOG"""
    secs,cur={},None
    for line in (ROOT/'CHANGELOG.md').read_text(encoding='utf-8').splitlines():
        m=re.match(r'## (\d+\.\d+\.\d+) — (.*)',line)
        if m:cur=m.group(1);secs[cur]=[m.group(2).strip(),[]];continue
        if line.startswith('## '):cur=None;continue
        if cur:secs[cur][1].append(line)
    return {k:(t,'\n'.join(b).strip()) for k,(t,b) in secs.items()}
def exists(tag):return subprocess.run(['gh','release','view',tag,'-R',REPO],capture_output=True).returncode==0
def create(tag,sha,title,notes,files,latest):
    with tempfile.NamedTemporaryFile('w',suffix='.md',delete=False,encoding='utf-8') as f:f.write(notes)
    run('gh','release','create',tag,'-R',REPO,'--target',sha,'--title',title,'--notes-file',f.name,'--latest='+('true' if latest else 'false'),*map(str,files))
def old_notes(v,body,zipname):
    return f"""{body}

---
**Jouer à cette version** : télécharge `{zipname}` ci-dessous, décompresse-le et ouvre `index.html` dans Chrome, Edge ou Firefox (version navigateur de l'époque ; la progression est enregistrée dans le navigateur utilisé).

➡️ La version la plus récente (application Windows .exe) : {LATEST}"""
def new_notes(v,body):
    return f"""{body}

---
## Télécharger (Windows 10 / 11, 64 bits)
- **ARK_Primal_World_{v}_installation.exe** : installe le jeu (raccourcis Bureau et menu Démarrer, désinstallation depuis les paramètres de Windows). Recommandé.
- **ARK_Primal_World_{v}_portable.exe** : un seul fichier, rien à installer : double-clique pour jouer.

Le jeu n'est pas signé numériquement : au premier lancement, Windows peut afficher « Windows a protégé votre ordinateur ». Clique alors sur « Informations complémentaires » puis « Exécuter quand même ».

Ta progression est enregistrée sur l'ordinateur (`%APPDATA%\\ARK Primal World`). Pour reprendre une partie d'une ancienne version (navigateur ou téléphone) : exporte-la depuis l'ancienne version (Accueil > Sauvegarde), puis importe-la dans le jeu (Accueil > Profil > Sauvegarde).

Vérifié automatiquement sur une machine Windows virtuelle (GitHub Actions) avant publication : installation silencieuse, lancement, combat, invocation (clic sur OK), sauvegarde conservée entre deux lancements."""
def main():
    log=changelog();v=version();sha=arg('--sha',os.environ.get('GITHUB_SHA'))or run('git','rev-parse','HEAD',capture=True).strip()
    exe_dir=pathlib.Path(arg('--exe-dir','dist/ARK_Windows'))
    # 1. versions anciennes (une seule fois)
    out=pathlib.Path(tempfile.mkdtemp())
    for ver,short in HISTORY:
        tag='v'+ver
        if exists(tag):print('déjà publiée :',tag);continue
        full=run('git','rev-parse',short+'^{commit}',capture=True).strip()
        t,body=log.get(ver,('',''));z=out/f'ARK_Primal_World_{ver}_navigateur.zip'
        run('git','archive','--format=zip',f'--prefix=ARK_Primal_World_{ver}/','-o',str(z),full+':game')
        create(tag,full,f'ARK: Primal World {ver}'+(f' — {t}' if t else ''),old_notes(ver,body,z.name),[z],False)
    # 2. version actuelle, avec les .exe
    exes=sorted(exe_dir.glob(f'ARK_Primal_World_{v}_*.exe'))
    if len(exes)<2:sys.exit(f'exe introuvables dans {exe_dir} (attendu : installation + portable de la version {v})')
    tag='v'+v
    if exists(tag):run('gh','release','delete',tag,'-R',REPO,'--cleanup-tag','--yes')
    t,body=log.get(v,('',''))
    create(tag,sha,f'ARK: Primal World {v}'+(f' — {t}' if t else ''),new_notes(v,body),exes,True)
    print('Dernière version :',LATEST)
if __name__=='__main__':main()
