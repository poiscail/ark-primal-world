# Ajouter une espèce en 5 étapes

Ce guide montre comment ajouter un dinosaure jouable sans toucher au moteur. Tout se fait dans un **nouveau module**
(`game/js/99-mon-module.js`), chargé par `game/index.html` après les modules dont il dépend et **avant `99-juice.js` et
`99-layout.js`** (qui restent les deux derniers). Le modèle suivi est celui de `99-collect.js` (familles Mammifères et Insectes).

## 1. Déclarer l'espèce dans `SPEC`

Chaque espèce est une ligne : clé, nom, **émoji unique**, rareté, élément, PV, attaque, défense, compétence active, passif.

```js
const MES_ESPECES=[["ourano","Ouranosaure","🫏","Rare","greenorb",150,24,18,"heal","tank"]];   // vérifie que l'émoji n'est pas déjà pris
MES_ESPECES.forEach(a=>{const k=a[0];
  if(Object.values(SPEC).some(s=>s.e===a[2]&&s!==SPEC[k]))return;   // émoji déjà pris : on n'ajoute pas (art() retrouve l'espèce par son émoji)
  const o={name:a[1],e:a[2],r:a[3],element:a[4],hp:a[5],atk:a[6],def:a[7],sk:a[8],pa:a[9]};
  if(!SPEC_DEFAULT[k])SPEC_DEFAULT[k]={...o};      // valeurs d'origine (bouton « Réinitialiser » de l'admin)
  if(!SPEC[k])SPEC[k]={...o}});                    // SPEC peut venir d'une configuration admin enregistrée
```

- Raretés : `Commun`, `Rare`, `Épique`, `Légendaire` (les tables d'invocation, du Nid et du recyclage en dépendent).
- Éléments : `redorb` (feu), `greenorb` (plante), `blueorb` (eau), `purpleorb` (foudre), `goldorb` (lumière).
- Compétences (`SK`) et passifs (`PA`) existants : voir `50-skills-species.js`, `99-species2.js` et `99-skills3.js`.

## 2. Lui donner un portrait (`PORT`)

Le portrait SVG est dessiné à partir d'une **famille** (lettre) et d'une recette :

```js
PORT.ourano=["H",{sp:1}];   // H = hadrosaures ; options du dessin de la famille (voir 95-portraits.js : cr = crête, sp = épine…)
```

Familles : `T` théropodes, `S` sauropodes, `C` cératopsiens, `A` ankylosaures, `G` stégosaures, `F` ptérosaures,
`H` hadrosaures, `M` reptiles marins, `W` mammifères, `I` insectes. La famille règle aussi l'attaque animée, le cri,
le chef d'équipe et les liens.

## 3. (Facultatif) une évolution, une exclusivité

```js
EVO.ourano="parasau";         // évolue en Parasaurolophus (voir 99-evolution.js pour les coûts par rareté)
SPEC.ourano.ex=1;             // exclusive : jamais invoquée (il faut alors la donner ailleurs, comme les gardiens du Grand Nord)
```

Une nouvelle source d'invocation doit filtrer les exclusives (`isEx(k)`).

## 4. Charger le module

Dans `game/index.html`, ajoute `<script src="js/99-mon-module.js"></script>` **avant** `js/interface/99-desktop.js`
(et sa feuille de style éventuelle `css/97-mon-module.css` après les autres `97-*`). Puis lance :

```
python3 tests/test_order.py      # ordre des scripts, aucun nom global en double, aucun fichier oublié
```

Les noms de tes variables globales (`const _xxx=…` des wrappers) doivent être **uniques entre tous les scripts** :
`test_order.py` le vérifie.

## 5. Tester

Écris `tests/test_mon_module.py` sur le modèle des autres (Playwright, vrais clics) et termine par
`sys.exit(1 if FAILS else 0)`. Vérifie au minimum :

- l'espèce est dans `SPEC` et son portrait est un SVG valide (`portrait("ourano",true)`) ;
- elle sort à l'invocation de sa rareté (`pickType("Rare")` sur quelques milliers de tirages) ;
- elle combat (un combat d'histoire avec elle dans l'équipe, sans erreur JS) ;
- les identifiants de succès restent uniques.

Ajoute ensuite ton test à la liste de `tools/run_tests.sh`.

## Aller plus loin

- **Crochets** (`hook`, 0.41, `99-app2.js`) : pour réagir à une fonction du jeu sans écrire le wrapper à la main,
  `hook("win",()=>{ /* après la victoire */ },{id:"mon-module"})`. Les modules chargés **après** `99-app2.js` peuvent l'utiliser.
- **Équilibrage** : `tests/balance/test_balance.py` (simulation) ; `tests/balance/balance_seuil.py` signale une équipe conseillée sous 50 %.
- **Sauvegarde** : un nouveau champ de `S` s'initialise dans un wrapper de `ens()` (voir n'importe quel module 99-*).
