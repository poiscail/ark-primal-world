#!/usr/bin/env python3
"""Construit les deux versions du jeu depuis game/ :
  dist/ARK_PC/            dossier (index.html + css/ + js/), double-clic sur index.html
  dist/ARK_Telephone/     un seul fichier ARK_Primal_World.html, tout est dedans
et les zips correspondants. Même code, même format de sauvegarde ; seule la plateforme forcée change."""
import re,shutil,zipfile,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parent.parent;SRC=ROOT/'game';DIST=ROOT/'dist'
def version():return re.search(r'ARK_VERSION="([^"]+)"',(SRC/'js/00-version.js').read_text()).group(1)
def force(html,plat):return html.replace('</head>',f'<script>window.ARK_PLATFORM_FORCED="{plat}";</script></head>',1)
def build_pc():
    out=DIST/'ARK_PC';shutil.rmtree(out,ignore_errors=True);shutil.copytree(SRC,out)
    (out/'index.html').write_text(force((SRC/'index.html').read_text(),'pc'))
    (out/'LISEZ-MOI.txt').write_text("ARK: Primal World - version PC\n\nDouble-clique sur index.html (Chrome, Edge ou Firefox).\nTa progression est enregistree dans le navigateur utilise.\nClavier en combat : 1-2-3 orbes, A-Z-E competences, Espace super attaque.\n\nTransferer vers le telephone : Accueil > Sauvegarde > EXPORTER UN FICHIER, puis IMPORTER sur la version telephone.\n")
    return out
def build_phone():
    out=DIST/'ARK_Telephone';shutil.rmtree(out,ignore_errors=True);out.mkdir(parents=True)
    h=force((SRC/'index.html').read_text(),'phone')
    h=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+(SRC/m.group(1)).read_text()+'</style>',h)
    h=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(SRC/m.group(1)).read_text().replace('</script','<\\/script')+'</script>',h)
    assert 'src="js/' not in h and 'href="css/' not in h
    (out/'ARK_Primal_World.html').write_text(h)
    (out/'LISEZ-MOI.txt').write_text("ARK: Primal World - version telephone\n\nUn seul fichier : ARK_Primal_World.html. Ouvre-le avec Chrome, Firefox ou Safari (depuis le gestionnaire de fichiers, ou envoie-le toi par mail/cloud puis ouvre-le dans le navigateur).\nSi ton navigateur refuse d'ouvrir un fichier local, heberge-le (ex. page statique) ou ouvre-le depuis un autre navigateur.\nLa progression est enregistree dans ce navigateur : garde toujours le meme navigateur et exporte une sauvegarde de temps en temps (Accueil > Sauvegarde).\n\nTransferer depuis le PC : sur le PC, Accueil > Sauvegarde > EXPORTER UN FICHIER, envoie le fichier .arksave au telephone, puis IMPORTER UN FICHIER (ou utilise le code copie/colle).\n")
    return out
def zip_dir(d,name):
    z=DIST/name
    with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(d.rglob('*')):
            if p.is_file():zf.write(p,p.relative_to(d.parent))
    return z
if __name__=='__main__':
    DIST.mkdir(exist_ok=True);v=version()
    for d,n in [(build_pc(),f'ARK_Primal_World_PC_v{v}.zip'),(build_phone(),f'ARK_Primal_World_Telephone_v{v}.zip')]:print('->',zip_dir(d,n))
