"""Seuils d'alerte des simulations d'équilibrage (0.41, idée 448).
Usage dans un script : `from balance_seuil import alerte` puis `sys.exit(1 if alerte(res) else 0)`.
Seules les mesures dont le chemin contient « conseill » (équipe conseillée) sont vérifiées ; le seuil par défaut est 50 %
et se change avec l'option `--seuil=NN` (en %) ou la variable d'environnement ARK_SEUIL. `--seuil=0` désactive l'alerte."""
import os,sys
def seuil_courant(defaut=50):
    for a in sys.argv[1:]:
        if a.startswith('--seuil='):return float(a.split('=',1)[1])
    return float(os.environ.get('ARK_SEUIL',defaut))
def _walk(o,chemin):
    if isinstance(o,dict):
        for k,v in o.items():yield from _walk(v,chemin+[str(k)])
    elif isinstance(o,(int,float)) and not isinstance(o,bool) and 0<=o<=1:yield chemin,o
def alerte(res,defaut=50,marque='conseill'):
    s=seuil_courant(defaut)
    if s<=0:return 0
    bas=[(c,v) for c,v in _walk(res,[]) if any(marque in x for x in c) and v*100<s]
    for c,v in bas:print('ALERTE : %s = %d %% (seuil %d %%)'%(' › '.join(c),round(v*100),s))
    if not bas:print('Seuil %d %% : aucune mesure de l\'équipe conseillée en dessous.'%s)
    return len(bas)
