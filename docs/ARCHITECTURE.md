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
| `js/97-backups.js` | copies de secours automatiques (`takeBackup`, enveloppe `save()`) |
| `js/97-teams.js` | équipes enregistrées |
| `js/98-tutorial.js` | conseils contextuels (`TIPS`) et guide |
| `js/99-visual.js` | filtres de portrait, scène de combat (`stageBuild`), orbes en verre, cadres |
| `js/99-polish.js` | bannières illustrées, carte d'histoire et étoiles, interrupteurs, écran titre, fin de combat |
| `js/99-nav.js` | navigation à 5 onglets + sous-onglets, « À faire aujourd'hui », Défi du jour, Fouilles |
| `js/99-chain.js` | enchaînement automatique des combats, animations du plateau |
| `js/99-skins.js` | 7 thèmes (couleurs + image de fond), sélecteur dans les Réglages |
| `js/99-content.js` | 8 espèces supplémentaires, Raid hebdomadaire, Marché du jour |
| `js/99-expeditions.js` | expéditions chronométrées, succès (`ACH`) et titres |
| `js/99-enemy-traits.js` | traits d'ennemis et phases de boss |
| `js/99-summon-fx.js` | animation d'invocation (cercle, cartes retournées) |
| `js/99-skill-fx.js` | effets visuels des compétences |
| `js/99-story.js` | dialogues d'histoire (`LORE`) et journal |
| `js/99-evolution.js` | évolutions d'espèces (`EVO`) |
| `js/99-music.js` | musique procédurale à 3 ambiances |
| `js/94-battle-anim.js` | animations de combat (projectiles, chiffres flottants, traînée de PV, bannières, étoiles, ambiance) ; crochets `atkFx`/`foeFx`/`castFx`, délais via `fxd()` |
| `js/99-bestiary.js` | sprites d'ennemis : 20 créatures (`BEAST`), dinos corrompus (`corruptSVG`), choix par ennemi (`enemyLook`), noms (`bnName`) |
| `js/99-attack-fx.js` | animations d'attaque par famille d'espèce (`ATK`, `atkFx`), ripostes ennemies (`foeFx`), lancement de compétence (`castFx`) |
| `js/99-auto.js` | auto-combat (`autoPlay`, `autoSkill`, `autoWant`) et vitesse ×1/×2/×3 (`FX_SPEED`, `PREFS.spd`, `PREFS.auto`) |
| `js/99-enemy-skills.js` | compétences ennemies (Arène, gardiens de la Tour) : cadence, effets, intention dans le HUD |
| `js/99-menu-scenes.js` | décors des bannières de menu (scène de zone + vedette) |
| `js/99-codex.js` | bestiaire des créatures vaincues (`S.foes`), variété de la 2e vague, 2 succès |
| `js/99-layout.js` | mise en page du combat (classes `bl-*`, ordre visuel en CSS) : **doit rester le dernier script** |
| `css/94-layout.css` / `css/94-bestiary.css` | mise en page du combat, auto/vitesse ; bestiaire, effets d'attaque, décors, bestiaire des créatures |
| `tools/build.py` | construit `dist/ARK_PC` (dossier) et `dist/ARK_Telephone` (fichier unique), avec leurs zips |

## Ajouter une fonctionnalité
1. Nouveau fichier `js/NN-nom.js` (et `css/NN-nom.css`), ajouté dans `index.html` (le build téléphone les intègre automatiquement).
2. Nouveaux champs d'état : les initialiser dans un wrapper de `ens()`.
3. Nouveau mode de combat : ajouter une entrée à `MODES` dans `80-modes.js` (construit les ennemis) et son règlement dans `win`/`settleLose`.
4. Le combat : ne pas déplacer les éléments de `#battleArea` (d'autres modules les retrouvent par sélecteur) ; `js/99-layout.js` les étiquette (`bl-*`) et `css/94-layout.css` les ordonne. Un nouvel élément ajouté au combat est rangé en fin d'écran (`bl-misc`) sauf si on lui donne une place dans `blKind()`.
5. Animations de combat : passer les délais par `fxd(ms)` et créer les effets dans `#fxLayer` (via `fxAdd`) pour qu'ils suivent la vitesse ×1/×2/×3.
6. Changer `ARK_VERSION` à chaque publication. Si le format de `S` change de façon incompatible, incrémenter `SAVE_FORMAT` et écrire la migration dans `validate()`/`ens()`.

## État
`S` est sauvegardé dans `localStorage["arkPrimalMobile"]`, la config admin dans `arkPrimalConfig`, les préférences dans `arkPrimalPrefs`.

## Limites connues
- L'équilibrage est validé par **simulation** (`test_balance*.py`), pas par des joueurs.
- Les modules se patchent mutuellement : une régression se détecte surtout avec la suite de tests complète.
- Non testé sur un vrai téléphone (émulation mobile de Chromium seulement).
