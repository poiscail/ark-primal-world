# Architecture

Pas de bundler : HTML + CSS + JavaScript simple, chargés dans l'ordre par `game/index.html`. L'application Windows (`desktop/`, Electron) affiche ce même dossier, copié tel quel.

## Principe : modules « en couches »
Les scripts partagent la portée globale. Chaque module peut **remplacer** une fonction ou variable d'un module précédent
en gardant l'ancienne version (`const _win=win; win=function(){_win(); ...}`). Pour cela, les fonctions concernées sont
des `function` ou des `let`, jamais des `const`. L'ordre des balises `<script>` fait donc partie du contrat.

| Fichier | Rôle |
|---|---|
| `js/00-version.js` | `ARK_VERSION`, `SAVE_FORMAT`, `ARK_PLATFORM` (toujours `"pc"`), `ARK_RELEASES` (page de la dernière version) |
| `js/00-core.js` | état `S`, sauvegarde, rendu de base, navigation `go()` |
| `js/05-admin.js` | panneau d'administration local |
| `js/10-combat-v1.js` … `30-zones-supers.js` | premier moteur de combat, équipe, forge, zones |
| `js/40-progression.js` | histoire 100 niveaux, donjons, matériaux, missions, `ens()` (migration d'état), `SMALL_TEAM` (ennemis d'histoire affaiblis si l'équipe a moins de 3 dinos) |
| `js/50-skills-species.js` | 46 espèces de base (8 de plus dans `99-content.js`), compétences, passifs, variantes, moteur de combat final, collection |
| `js/60-gacha-hud.js` | gacha, œufs, boutique de fragments, connexion quotidienne, notifications |
| `js/70-equipment.js` | objets d'équipement, `hasPA`, bonus de stats, butin |
| `js/80-modes.js` | hub de navigation, Tour, Arène, événements (`MODES`, règlement commun) |
| `js/90-settings-audio.js` | préférences, sons, animations, difficulté (enveloppe `H`/`A`), télémétrie |
| `js/92-orbs-fx.js` | boost d'orbes, effets, fenêtres du jeu (`openModal`, `askText` : saisie de texte, car `prompt()` n'existe pas dans l'application) |
| `js/95-portraits.js` | portraits SVG, remplacement de `art()`, import d'images |
| `js/96-transfer.js` | export/import de sauvegarde (fichier, code ; anciennes sauvegardes navigateur/téléphone acceptées), clavier du combat (touches 1-9 lues par position `e.code`, A-Z-E, Espace) |
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
| `js/99-texfx.js` | effets à textures (Kenney, CC0) teintés par masque : `tex()`, impacts, entailles, fumée |
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
| `js/99-juice.js` | sensations de combat : gel à l'impact `hitStop`, secousse `addTrauma` (propriétés `translate`/`rotate` de `.battlestage`), flash `hitfx`/`hurtfx`, image d'impact, étincelles canvas `sparkBurst`, coupure de super attaque `#cutin` (bloque les actions ; désactivée sous automatisation sauf `window.__forceCutin`), parallaxe (`--px`/`--py`), fausse piste d'invocation, réglages `PREFS.shake/flash/cutin` |
| `js/99-leader.js` | chef d'équipe (`leaderInfo`, `LEAD_PCT`), liens entre voisins (`linksOf`, `LINK_PCT`), bonus appliqués au premier rendu du combat (`fight._tm`), météo de zone (`WX`, `wxOf` paresseux car les modes transforment un combat d'histoire ; `WX_ON` coupé par les simulations, `WX_FORCE` pour les tests), panneau `#leadBox` |
| `js/99-pouch.js` | sacoche de combat : `POUCH` (4 objets), fabrication `pouchCraft` (Équipe > Sac, `#pouchBox`), utilisation `pouchUse` (3 par combat, sans prendre le tour), fenêtre `#pouchPop` hors de `#battleArea` |
| `js/99-maze.js` | Labyrinthe des reliques (rogue-lite) : course `S.maze.run` (carte `mzMap` de 6 étapes + gardien, PV conservés par place, reliques `RELICS`, mystères `MZ_EV`, marchand, campement), combats via `MODES.maze` (victoire : `eventWin` remplacé ; défaite : `settleLose` remplacé ; même case = reprise du combat en cours), effets des reliques par wrappers gardés par `mzOn(fight)` (statistiques `f.mzSt` calculées au début du combat), profondeurs `mzDepth`, marques et boutique permanente `MZ_UP`/`MZ_SHOP`, codex |
| `js/99-desktop.js` | réglages « Application Windows » (plein écran, dernière version, quitter) via `window.arkDesktop` ; lien vers la dernière version |
| `js/99-layout.js` | mise en page du combat (classes `bl-*`, ordre visuel en CSS) : **doit rester le dernier script** |
| `css/91-fonts.css` / `css/91-tex.css` | polices Orbitron et Exo 2 (base64) ; textures de particules (masques) |
| `css/94-layout.css` / `css/94-bestiary.css` | mise en page du combat (grille 2 colonnes, version compacte si la fenêtre est peu haute), auto/vitesse ; bestiaire, effets d'attaque, vedettes des bannières, bestiaire des créatures |
| `css/91-fonts-fx.css` | police Bangers (sous-ensemble latin, base64) pour les dégâts et la super attaque |
| `css/97-content.css` | sacoche (bouton, fenêtre, atelier), puces du chef/des liens/de la météo, effets de météo sur la scène (`.sWx`, `.wx-*`) |
| `css/97-maze.css` | écran du labyrinthe (carte horizontale, cases, cartes de reliques, mystères, marchand, codex) ; chargé après `97-content.css` |
| `css/97-pc.css` / `css/97-juice.css` | mise en page PC chargée en dernier (navigation en colonne, contenu large, grilles) ; styles des sensations de combat, de la coupure et des cadres holographiques |
| `css/96-skins.css` | 7 thèmes (`html[data-skin]`) avec images de fond en base64 (`tools/gen_backgrounds.py`) |
| `desktop/main.js` | application Electron : fenêtre (taille mémorisée, F11, une seule instance), sauvegarde dans `%APPDATA%`, liens externes ouverts dans le navigateur, test de lancement `--smoke-test` |
| `desktop/preload.js` | pont minimal `window.arkDesktop` (`toggleFullscreen`, `quit`, `info`) ; `contextIsolation` + `sandbox` |
| `tools/build.py` | copie `game/` dans `desktop/app/` puis construit l'installateur et le portable (`dist/ARK_Windows/`) ; `--dir`, `--linux`, `--stage`, `--electron-zips=` |
| `tools/releases.py` | une page GitHub par version : anciennes versions (zip navigateur) et version actuelle (les .exe), notes tirées du CHANGELOG |
| `.github/workflows/windows-exe.yml` | à chaque envoi : construction et tests de l'exe sur Windows ; depuis `main` : publication des pages de versions |

## Ajouter une fonctionnalité
1. Nouveau fichier `js/NN-nom.js` (et `css/NN-nom.css`), ajouté dans `index.html` avant `99-layout.js` (qui reste le dernier). Ne jamais redéclarer un `let`/`const` global déjà déclaré par un autre module (erreur de syntaxe : le script entier ne se charge pas).
2. Nouveaux champs d'état : les initialiser dans un wrapper de `ens()`.
3. Nouveau mode de combat : ajouter une entrée à `MODES` (construit les ennemis ; voir `80-modes.js`). Le règlement d'une victoire passe par `towerWin`/`arenaWin`/`eventWin` ; un mode ajouté dans un module ultérieur remplace `eventWin` (victoire) et `settleLose` (défaite) pour son mode, comme `99-maze.js`.
4. Le combat : ne pas déplacer les éléments de `#battleArea` (d'autres modules les retrouvent par sélecteur) ; `js/99-layout.js` les étiquette (`bl-*`) et `css/94-layout.css` les ordonne. Un nouvel élément ajouté au combat est rangé en fin d'écran (`bl-misc`) sauf si on lui donne une place dans `blKind()`.
5. Animations de combat : passer les délais par `fxd(ms)` et créer les effets dans `#fxLayer` (via `fxAdd`) pour qu'ils suivent la vitesse ×1/×2/×3.
6. Changer `ARK_VERSION` à chaque publication. Si le format de `S` change de façon incompatible, incrémenter `SAVE_FORMAT` et écrire la migration dans `validate()`/`ens()`.

## Publier une version
1. `ARK_VERSION` dans `js/00-version.js` et une section `## X.Y.Z — titre` en tête du `CHANGELOG.md` (elle devient la page de la version).
2. `tools/run_tests.sh` vert, puis envoi sur `main`.
3. Le workflow construit l'installateur et le portable sur Windows, les teste (lancements, sauvegarde, installation silencieuse) et, seulement si tout passe, publie la page `vX.Y.Z` avec les .exe, marquée « dernière version ». Les pages des versions précédentes restent en place.

## État
`S` est sauvegardé dans `localStorage["arkPrimalMobile"]`, la config admin dans `arkPrimalConfig`, les préférences dans `arkPrimalPrefs`.

## Limites connues
- L'équilibrage est validé par **simulation** (`test_balance*.py`), pas par des joueurs.
- Les modules se patchent mutuellement : une régression se détecte surtout avec la suite de tests complète.
- L'application Windows est testée automatiquement sur une machine Windows virtuelle (GitHub Actions), pas encore à la main sur un vrai PC. Les .exe ne sont pas signés (avertissement de Windows au premier lancement).
