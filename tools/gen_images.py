#!/usr/bin/env python3
"""Génère des images avec FLUX.1 [schnell] (licence Apache 2.0) sur Hugging Face, pour les décors (pas pour les dinos,
qui restent dessinés par le code).
La clé Hugging Face n'est jamais dans le dépôt ni dans la session : c'est un « secret réseau » de l'environnement cloud
(Authorization: Bearer hf_…, sites huggingface.co, router.huggingface.co et *.hf.space), ajouté par le proxy aux requêtes.
    python3 tools/gen_images.py SORTIE.png "texte" [largeur hauteur graine]
Essaie d'abord l'API d'inférence (router.huggingface.co), puis l'espace FLUX.1-schnell (quota ZeroGPU du compte).
"""
import sys,json,urllib.request,urllib.error,shutil
def router(prompt,w,h,seed,out):
    url="https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
    body=json.dumps({"inputs":prompt,"parameters":{"width":w,"height":h,"seed":seed,"num_inference_steps":4}}).encode()
    req=urllib.request.Request(url,data=body,headers={"Content-Type":"application/json","Accept":"image/png"})
    with urllib.request.urlopen(req,timeout=180) as r:
        if not r.headers.get("Content-Type","").startswith("image/"):raise RuntimeError(r.read()[:300])
        open(out,"wb").write(r.read())
def space(prompt,w,h,seed,out):
    from gradio_client import Client  # pip install gradio_client
    c=Client("black-forest-labs/FLUX.1-schnell",verbose=False)
    r=c.predict(prompt=prompt,seed=seed,randomize_seed=False,width=w,height=h,num_inference_steps=4,api_name="/infer")
    p=r[0] if isinstance(r[0],str) else r[0].get("path");shutil.copy(p,out)
if __name__=="__main__":
    out,prompt=sys.argv[1],sys.argv[2];w,h,seed=(int(x) for x in (sys.argv[3:6]+["1024","576","42"][len(sys.argv[3:6]):]))
    for f in (router,space):
        try:f(prompt,w,h,seed,out);print("ok",f.__name__,out);break
        except Exception as e:print("échec",f.__name__,str(e)[:300])
    else:sys.exit(1)
