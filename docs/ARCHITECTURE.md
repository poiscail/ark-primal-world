# Architecture

Pas de build : HTML + CSS + JavaScript simple, chargés dans l'ordre par `game/index.html`.

## Principe : modules « en couches »
Les scripts partagent la portée globale. Chaque module peut **remplacer** une fonction ou variable d'un module précédent
en gardant l'ancienne version (`const _win=win; win=function(){_win(); ...}`). Pour cela, les fonctions concernées sont
des `function` ou des `let`, jamais des `const`. L'ordre des balises `<script>` fait donc partie du contrat.

| Fichier | Rôle |
|---|---|
| `js/00-version.js` | `ARK_VERSION` et `SAVE_FORMAT`, plateforme |
| `js/00-core.js` | état `S`, sauvegarde, rendu de base, navigation `go()` |
| `js/05-admin.js` | panneau d'administration local |
| `js/10-combat-v1.js` … `30-zones-supers.js` | premier moteur de combat, équipe, forge, zones |
| `js/40-progression.js` | histoire 100 niveaux, donjons, matériaux, missions, `ens()` (migration d'état) |
| `js/50-skills-species.js` | 46 espèces, compétences, passifs, variantes, moteur de combat final, collection |
| `js/60-gacha-hud.js` | gacha, œufs, boutique de fragments, connexion quotidienne, notifications |
| `js/70-equipment.js` | objets d'équipement, `hasPA`, bonus de stats, butin |
| `js/80-modes.js` | hub de navigation, Tour, Arène, événements (`MODES`, règlement commun) |
| `js/90-settings-audio.js` | préférences, sons, animations, difficulté (enveloppe `H`/`A`), télémétrie |
| `js/95-portraits.js` | portraits SVG, remplacement de `art()`, import d'images |
| `js/96-transfer.js` | export/import de sauvegarde (fichier, code), clavier PC, classe `pc`/`phone` |
| `tools/build.py` | construit `dist/ARK_PC` (dossier) et `dist/ARK_Telephone` (fichier unique), avec leurs zips |

## Ajouter une fonctionnalité
1. Nouveau fichier `js/NN-nom.js` (et `css/NN-nom.css`), ajouté dans `index.html` (le build téléphone les intègre automatiquement).
2. Nouveaux champs d'état : les initialiser dans un wrapper de `ens()`.
3. Nouveau mode de combat : ajouter une entrée à `MODES` dans `80-modes.js` (construit les ennemis) et son règlement dans `win`/`settleLose`.
4. Changer `ARK_VERSION` à chaque publication. Si le format de `S` change de façon incompatible, incrémenter `SAVE_FORMAT` et écrire la migration dans `validate()`/`ens()`.

## État
`S` est sauvegardé dans `localStorage["arkPrimalMobile"]`, la config admin dans `arkPrimalConfig`, les préférences dans `arkPrimalPrefs`.

## Limites connues
- L'équilibrage est validé par **simulation** (`test_balance*.py`), pas par des joueurs.
- Les modules se patchent mutuellement : une régression se détecte surtout avec la suite de tests complète.
- Non testé sur un vrai téléphone (émulation mobile de Chromium seulement).
