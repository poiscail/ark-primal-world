#!/usr/bin/env python3
"""Génère game/css/97-aibg-img.css (0.45) à partir des décors peints de tools/aibg_src/<zone>.webp
(FLUX.1 [schnell], Black Forest Labs, licence Apache 2.0 ; images créées par le joueur sur Hugging Face).
Chaque image est réduite à 960×540 et compressée en WebP, puis intégrée en base64 (le jeu fonctionne hors ligne).
Ajouter une zone : déposer tools/aibg_src/<zone>.webp (nom donné par stageZone), l'ajouter à AIBG dans js/99-aibg.js, relancer :
    python3 tools/aibg_build.py
"""
import base64,io,pathlib
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent.parent
css=['/* Généré par tools/aibg_build.py — ne pas modifier à la main. Décors peints : FLUX.1 [schnell] (Black Forest Labs, Apache 2.0). */']
for p in sorted((ROOT/'tools'/'aibg_src').glob('*.webp')):
    b=io.BytesIO();Image.open(p).convert('RGB').resize((960,540),Image.LANCZOS).save(b,'WEBP',quality=70,method=6)
    css.append(f'.scene.aibg-{p.stem}>.sc-ai{{background-image:url(data:image/webp;base64,{base64.b64encode(b.getvalue()).decode()})}}')
    print(p.stem,len(b.getvalue()),'octets')
out=ROOT/'game'/'css'/'97-aibg-img.css';out.write_text('\n'.join(css)+'\n');print(out.relative_to(ROOT),out.stat().st_size//1024,'Ko')
