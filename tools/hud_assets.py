#!/usr/bin/env python3
"""Génère game/css/assets/97-hud-assets.css (0.43) à partir des sources de tools/hud_src/ :
- icônes game-icons.net (CC BY 3.0, auteurs dans tools/hud_src/gi/license.txt et docs/LICENSES.md),
  fichiers nommés « auteur--nom.svg », intégrées en variables CSS --gi-<nom> (masques : la couleur vient du thème) ;
- pièces du Kenney UI Pack Sci-Fi (CC0) : curseur (normal et « bouton », recoloré) et viseur.
Les règles qui posent les icônes sur la navigation et les ressources sont générées ici aussi (table NAV/SUB/MET),
le reste du style est dans game/css/graphismes/97-hud.css. Relancer après avoir changé la table ou ajouté une icône :
    python3 tools/hud_assets.py
"""
import pathlib,re,urllib.parse
ROOT=pathlib.Path(__file__).resolve().parent.parent
SRC=ROOT/'tools'/'hud_src'
OUT=ROOT/'game'/'css'/'assets'/'97-hud-assets.css'

def uri(svg):
    svg=re.sub(r'>\s+<','><',svg.strip())
    return 'url("data:image/svg+xml,'+urllib.parse.quote(svg,safe=' =:/;,.-_()\'')+'")'

ICONS={p.stem.split('--',1)[1]:p.read_text() for p in sorted((SRC/'gi').glob('*.svg'))}
# barre de navigation (data-screen) → icône
NAV={'home':'house','team':'dinosaur-rex','story':'treasure-map','summon':'crystal-ball','missions':'scroll-unfurled','dungeon':'dungeon-gate'}
# sous-onglets (attribut onclick exact) → icône
SUB={"go('world')":'globe',"go('story')":'open-book',"go('dungeon')":'dungeon-gate',"go('tower')":'stone-tower',"go('arena')":'arena',
 "go('events')":'party-popper',"go('raid')":'dragon-head',"go('maze')":'maze',"go('trials')":'laurels-trophy',"go('far')":'snowflake-2',
 "go('regions')":'compass',"go('modes2')":'gamepad',"go('camp')":'camping-tent',"go('missions')":'scroll-unfurled',"go('daily')":'crossed-swords',
 "go('dig')":'spade',"go('exped')":'hiking',"go('nest')":'dinosaur-egg',"go('achs')":'trophy-cup',
 "subSet('home','main')":'house',"subSet('home','profile')":'person',"subSet('team','pack')":'dinosaur-rex',"subSet('team','up')":'dna1',
 "subSet('team','bag')":'backpack',"subSet('team','dex')":'book-cover',"subSet('summon','ban')":'star-medal',"subSet('summon','bonus')":'rolling-dices',
 "subSet('summon','shop')":'puzzle',"subSet('summon','market')":'shopping-cart'}
# compteurs de l'en-tête (id du <b>) → icône et couleur
MET={'m_bone':('crossed-bones','#efe3c4'),'m_hide':('animal-hide','#c98a55'),'m_crystal':('crystal-growth','#7fe7ff'),'m_amber':('amber-mosquito','#ffb43a'),
 'powerM':('dinosaur-rex','#8fe36a'),'m_shards':('puzzle','#c9a2ff'),'setFab':('cog','var(--txt2)')}

def cursor(fill):
    s=(SRC/'kenney'/'cursor_h.svg').read_text().replace('fill="#FFFFFF"',f'fill="{fill}"')
    return uri(s)

css=['/* Généré par tools/hud_assets.py — ne pas modifier à la main. Icônes : game-icons.net (CC BY 3.0, voir docs/LICENSES.md) ; curseur et viseur : Kenney UI Pack Sci-Fi (CC0). */',':root{']
used=sorted(set(NAV.values())|set(SUB.values())|{v[0] for v in MET.values()})
missing=[u for u in used if u not in ICONS]
if missing:raise SystemExit('icônes manquantes dans tools/hud_src/gi : '+', '.join(missing))
for k in used:css.append(f'--gi-{k}:{uri(ICONS[k])};')
css.append(f'--k-cur:{cursor("#FFFFFF")};--k-cur2:{cursor("#7ff3ff")};')
css.append(f'--k-cross:{uri((SRC/"kenney"/"crosshair_color_a.svg").read_text())};')
css.append('}')
for scr,ic in NAV.items():css.append(f'html.hud-ico .bottomnav button[data-screen="{scr}"]>span:first-child{{--gi:var(--gi-{ic})}}')
for oc,ic in SUB.items():css.append(f'html.hud-ico #subnav button[onclick="{oc}"]>span:first-child{{--gi:var(--gi-{ic})}}')
for bid,(ic,col) in MET.items():css.append(f'html.hud-ico .hudico[data-for="{bid}"]{{--gi:var(--gi-{ic});--gic:{col}}}')
sel=[f'html.hud-ico .bottomnav button[data-screen="{s}"]>span:first-child' for s in NAV]+[f'html.hud-ico #subnav button[onclick="{o}"]>span:first-child' for o in SUB]
css.append(',\n'.join(sel)+'{font-size:0!important;line-height:0!important;display:block;-webkit-mask:var(--gi) center/contain no-repeat;mask:var(--gi) center/contain no-repeat;background:var(--hudic,currentColor)}')
OUT.write_text('\n'.join(css)+'\n')
print(f'{OUT.relative_to(ROOT)} : {len(used)} icônes, {OUT.stat().st_size//1024} Ko')
