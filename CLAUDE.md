# ARK: Primal World — contexte du projet (à lire en premier)

Jeu de combat d'orbes façon Dokkan Battle avec des dinosaures, **100 % local** (aucun compte, aucun serveur), en HTML/CSS/JS pur, **sans étape de build pour jouer**. Deux livrables construits depuis le même code : version **PC** (dossier) et version **téléphone** (un seul fichier HTML), avec **sauvegarde compatible** entre les deux.

- Dépôt : https://github.com/poiscail/ark-primal-world (branche `main`)
- Version actuelle : **0.13.0** (`game/js/00-version.js`, `ARK_VERSION` et `SAVE_FORMAT=1`)
- L'utilisateur est français : **répondre en français**, être honnête sur ce qui est testé (jamais affirmer qu'une chose non testée marche ; pas testé sur un vrai téléphone ; équilibrage mesuré par simulation seulement).
- Attentes permanentes : améliorer sans cesse le gameplay, les animations et les graphismes ; mettre à jour GitHub à la fin de chaque étape ; l'utilisateur dira à la fin ce qu'il veut retirer (ne rien supprimer sans demande).

## Lancer / tester / construire
```
open game/index.html                 # jouer directement
python3 tools/build.py               # produit dist/ARK_PC (dossier) + dist/ARK_Telephone/ARK_Primal_World.html + zips v<ver>
tools/run_tests.sh                   # 25 suites Playwright (python3, chromium headless) ; ~6-8 min
python3 tests/test_balance.py        # simulations d'équilibrage (lentes, à lancer en tâche de fond)
python3 tests/test_balance_modes.py
```
Tests : Playwright Python (ici `pip install playwright==1.56.0`, version qui correspond au Chromium préinstallé dans /opt/pw-browsers). Les tests coupent animations/dialogues (`setPref("anim",false)`, `setPref("lore",false)`) car sinon les simulations de milliers de combats sont très lentes. `dist/` est ignoré par git. Les scripts longs (>2 min) doivent tourner en arrière-plan.

## Architecture (voir docs/ARCHITECTURE.md)
Pas de bundler : les scripts sont chargés dans l'ordre de `game/index.html` et **se corrigent les uns les autres par « monkey-patching » en portée globale** : `const _x=fn; fn=function(){...}`. Règles :
- Ne jamais déclarer `const` un nom destiné à être re-patché (`function` ou `let`).
- **L'ordre des `<script>` et des `<link>` fait partie du contrat.** `css/95-theme.css` doit rester le dernier thème ; `90-platform.css` après.
- Les modules ajoutent leurs champs de sauvegarde via un wrapper de `ens()` (migration/initialisation).
- État `S` dans `localStorage["arkPrimalMobile"]` ; config admin `arkPrimalConfig` ; préférences `arkPrimalPrefs` (`PREFS` : sound, vol, music, anim, vib, lore, diff, art, theme, auto, spd, chain) ; sauvegardes auto `arkPrimalBackups`.
- Enveloppe de sauvegarde `{game:"ark-primal-world",fmt:1,ver,at,from,S,cfg}` ; codes `ARK2.`(gzip+base64) / `ARK1.` / base64 ancien ; `validate()` strict ; import = copie « avant import » puis rechargement.

Modules JS (ordre) : 00-version, 00-core, 05-admin, 10-combat-v1, 20-team-forge-save, 30-zones-supers, 40-progression, 50-skills-species (moteur de combat final : `startBattle`, `tapOrb`, `useSkill`, `special`, `afterAction`, `killEnemy`, `enemyTurn`, `hitDino`, `renderBattle`), 60-gacha-hud, 70-equipment, 80-modes (Tour, Arène, Événements, navigation à 5 onglets + sous-menu), 90-settings-audio (réglages, sons, difficulté, télémétrie), 92-orbs-fx (boost d'orbes, FX), 93-gacha-plus (roue, œufs, équipement), 94-battle-anim, 95-portraits (portraits SVG par espèce), 96-transfer, 97-backups, 97-teams, 98-tutorial, 99-visual, 99-expeditions (expéditions + succès), 99-enemy-traits, 99-summon-fx, 99-skill-fx, 99-story, 99-evolution, 99-music, 99-tuning (équilibrage global : ennemis ×1,3 PV, ×1,15 ATQ), 99-bestiary (sprites d'ennemis `BEAST`, dinos corrompus `corruptSVG`, `enemyLook`, noms `bnName`), 99-attack-fx (attaques par famille `atkFx`, ripostes `foeFx`, `castFx`), 99-auto (auto-combat, vitesse `FX_SPEED`/`PREFS.spd`), 99-enemy-skills (compétences ennemies Arène/gardiens de Tour), 99-menu-scenes (décors des bannières), 99-codex (bestiaire des créatures `S.foes`), **99-layout (doit rester le dernier : classes `bl-*` du combat)**.
CSS : 00-base … 80-fx, 92-anim, 93-battle, 94-visual, 94-layout (combat), 94-bestiary (ennemis, effets, décors), 95-theme (futuriste, thèmes sombre/clair via `html[data-theme]`), 90-platform.

## Contenu du jeu (état 0.13.0)
- Histoire 100 niveaux / 4 zones (boss tous les 10), Donjons 5×5, Tour infinie, Arène (classement simulé localement), Événements hebdomadaires, 46 espèces (14 communes, 13 rares, 10 épiques, 9 légendaires) avec compétence active (14) + passif, variantes (Alpha, Ombre, Albinos, Doré, Prismatique), équipement (armes/armures/talismans), éveil ★, fusion, recyclage, gacha riche (vedette, élémentaire, variantes, roue quotidienne, œufs, équipement, garanties), missions, connexion quotidienne, rang du survivant (niveau joueur = +0,5 % PV/ATQ par rang).
- Combat : plateau 3×3 de 9 orbes, **boost** si plusieurs orbes de même couleur (×1,15 à ×3), avantages d'éléments (rouge>vert>bleu>rouge), combos, synergie, super attaque, ennemis à traits (Carapace, Venimeux, Régénérant, Berserker dès le niveau 8, pas en Tour/Arène), boss en 3 phases (bouclier à 66 %, venin+rage à 33 %).
- Ajouts récents : expéditions chronométrées (3 emplacements, 15 min/1 h/4 h, hors-ligne via `Date.now()`), 34 succès + titres, 17 chaînes d'évolution, 14 dialogues d'histoire + journal (désactivés sous automatisation `navigator.webdriver` sauf `window.__forceLore`), musique procédurale à 3 ambiances, animations de combat (projectiles, chiffres flottants, traînée de PV, bannières, étoiles de victoire, vibrations), invocation animée, 14 effets de compétences.
- 0.13.0 : combat sans défilement sur téléphone (scène + orbes + super + compétences dans 390×844 ; PC en 2 colonnes), auto-combat, vitesse ×1/×2/×3 et « Enchaîner » 🔁 (touches R/T sur PC ; `PREFS.auto/spd/chain`), 20 créatures ennemies dessinées + 10 dinos corrompus (veines, yeux luisants, gardiens couronnés), bestiaire des créatures (Succès, 2 succès), animations d'attaque par famille (8) et ripostes par créature, compétences ennemies en Arène et chez les gardiens de la Tour, décors de zone dans les bannières de menu.
- Graphismes 0.12.0 : filtre SVG global `#vol` (volume des portraits), `portrait(type,bare)` (version sans fond pour la scène), `stageBuild()` (scène de combat par zone en parallaxe avec ennemi + équipe), orbes en verre (symboles SVG), cadres de rareté.

## Pièges connus
- `T3` et `alive` sont des `const` : inaccessibles via `window.T3` ; utiliser `S.team.slice(0,3)`.
- `SK_of` est `const` (compétence lue sur `SPEC[type].sk`).
- `renderBattle` est réassigné par ~10 modules ; l'ordre compte. `stageBuild()` est appelé depuis 94-battle-anim juste après le rendu de base ; les modules ultérieurs cherchent `.sHud`/`.sFig` (avec repli sur l'ancien `.panel`).
- `giveXP`/`give()` : `give` gère matériaux (`S.mat`) ou champs de `S` (tickets, shards…).
- Comparer deux états après transfert : appeler `ens()` avant (champs par défaut ajoutés).
- Chromium headless se détecte « PC » : la grille 2 colonnes de la collection est limitée à ≥700 px.
- Éviter les `sleep` enchaînés pour attendre des tests ; utiliser un `until` avec timeout.
- Combat : ne jamais déplacer les nœuds de `#battleArea` ; `99-layout.js` (dernier script) les étiquette `bl-*` et `css/94-layout.css` règle l'ordre (flex sur téléphone, grille 2 colonnes ≥700 px). Un nouvel élément non reconnu par `blKind()` va en fin d'écran.
- Animations de combat : délais via `fxd(ms)` (vitesse `FX_SPEED`, `let` dans 94), effets dans `#fxLayer` via `fxAdd`. Une compétence n'anime que son lanceur (`BQ.sk` → `castFx`) ; orbes/super → `atkFx` par famille (`PORT[type][0]`) ; riposte ennemie jouée après 480 ms (`foeFx`).
- `eye()` (portraits) est remplacé temporairement pendant `corruptSVG` (yeux luisants) : les portraits du joueur restent identiques (testé).
- Noms et variété des ennemis appliqués à l'affichage (`bnName`/`cxVary` dans `stageBuild`), car `startBattle` peut être différé par un dialogue d'histoire.
- Trait « Carapace » (dès le niveau 8, aléatoire) : un coup peut être absorbé à 0 → dans les tests de dégâts, niveau < 8 ou `e.tr="";e.sh=0`.
- Tests d'effets : compter les ajouts au `#fxLayer` (MutationObserver) plutôt que le nombre net d'enfants (les effets précédents disparaissent en même temps).
- Téléphone : `body.phone button{min-height:44px}` ; l'en-tête de combat (titre + ⚙️) fait ~51 px.
- Simulations d'équilibrage : fixer `S.level` (rang du joueur, +0,5 % PV/ATQ par rang) avant chaque combat ; sinon il grimpe pendant la simulation et fausse les dernières mesures (biais découvert et corrigé en 0.13 dans `test_balance*.py`).

## Idées restantes / pistes
- Équilibrage : le bot de simulation joue parfaitement. 0.13 : Arène avec compétences ennemies + Redoutable +10 % PV/+5 % ATQ (`ARENA_TUNE` dans 99-tuning) → 97/93/73 % (classements 1000/1300/1700), Facile/Équilibré 100 % ; gardiens de Tour sans soin ni bouclier (`ES_TOWER`) : équipe conseillée 75-100 % selon l'étage (70-100 % sans compétences ; l'étage 60 est le plus dur). Histoire : conseillé éveillé+forge 100 %, sans éveil/forge 15 % au niv. 50 puis 0 %. À valider sur de vrais joueurs.
- Fait en 0.13.0 : sprites d'ennemis, animations d'attaque par famille, décors de menu, auto-combat/accélération. Restent : plus d'événements, tests sur vrai téléphone (mise en page vérifiée seulement en émulation).
- Le « truc inutile » signalé par l'utilisateur : hypothèse = niveau du joueur (maintenant rang) ; à confirmer (autre candidat : la jauge ⚔ puissance).
