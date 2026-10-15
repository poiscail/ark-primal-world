#!/usr/bin/env python3
"""Construit le jeu en application Windows (.exe, Electron) depuis game/.
  python3 tools/build.py           -> dist/ARK_Windows/ARK_Primal_World_<version>_portable.exe     (un seul fichier, sans installation)
                                      dist/ARK_Windows/ARK_Primal_World_<version>_installation.exe (installateur : raccourcis, désinstallation)
  python3 tools/build.py --dir     -> dossier dist/ARK_Windows/win-unpacked/ (« ARK Primal World.exe » + fichiers), plus rapide
  python3 tools/build.py --linux   -> version Linux dépaquetée (pour tester l'application hors de Windows)
  python3 tools/build.py --stage   -> copie seulement le jeu dans desktop/app/ (pour « npm start » dans desktop/)
  --electron-zips=DOSSIER          -> utilise les archives Electron déjà téléchargées (electron-v<ver>-<os>-x64.zip) dans DOSSIER
Nécessite Node.js 18+ (npm). Hors de Windows, les cibles « portable » et « installation » demandent Wine :
la construction automatique GitHub (.github/workflows/windows-exe.yml) les produit sur un vrai Windows et y teste l'exe."""
import os,re,shutil,subprocess,sys,pathlib
ROOT=pathlib.Path(__file__).resolve().parent.parent;SRC=ROOT/'game';DESK=ROOT/'desktop';DIST=ROOT/'dist'
def version():return re.search(r'ARK_VERSION="([^"]+)"',(SRC/'js/00-version.js').read_text(encoding='utf-8')).group(1)
def run(cmd,**kw):
    print('>',' '.join(cmd),flush=True);subprocess.run(cmd,check=True,**kw)
def stage():
    """copie le jeu dans desktop/app (les fichiers servis par l'application)"""
    app=DESK/'app';shutil.rmtree(app,ignore_errors=True);shutil.copytree(SRC,app)
    return app
def main(argv):
    v=version();npm='npm.cmd' if os.name=='nt' else 'npm';npx='npx.cmd' if os.name=='nt' else 'npx'
    print('-> jeu copié dans',stage())
    if '--stage' in argv:return
    if not (DESK/'node_modules'/'electron-builder').exists():
        run([npm,'install','--no-audit','--no-fund'],cwd=DESK)
    target=['--linux','dir'] if '--linux' in argv else ['--win','dir'] if '--dir' in argv else ['--win']
    extra=[f'-c.electronDist={pathlib.Path(a.split("=",1)[1]).resolve()}' for a in argv if a.startswith('--electron-zips=')]
    run([npx,'electron-builder',*target,'--x64','--publish','never','-c.extraMetadata.version='+v,*extra],cwd=DESK)
    out=DIST/'ARK_Windows'
    for f in sorted(out.glob('*.exe'))+sorted(out.glob('*-unpacked')):print('->',f)
if __name__=='__main__':main(sys.argv[1:])
