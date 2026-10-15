# ARK: Primal World — contexte du projet (à lire en premier)

Jeu de combat d'orbes façon Dokkan Battle avec des dinosaures, **100 % local** (aucun compte, aucun serveur), en HTML/CSS/JS pur, **sans étape de build pour jouer**. Deux livrables construits depuis le même code : version **PC** (dossier) et version **téléphone** (un seul fichier HTML), avec **sauvegarde compatible** entre les deux.

- Dépôt : https://github.com/poiscail/ark-primal-world (branche `main`)
- Version actuelle : **0.12.0** (`game/js/00-version.js`, `ARK_VERSION` et `SAVE_FORMAT=1`)
- L'utilisateur est français : **répondre en français**, être honnête sur ce qui est testé (jamais affirmer qu'une chose non testée marche ; pas testé sur un vrai téléphone ; équilibrage mesuré par simulation seulement).
- Attentes permanentes : améliorer sans cesse le gameplay, les animations et les graphismes ; mettre à jour GitHub à la fin de chaque étape ; l'utilisateur dira à la fin ce qu'il veut retirer (ne rien supprimer sans demande).

## Lancer / tester / construire
```
open game/index.html                 # jouer directement
python3 tools/build.py               # produit dist/ARK_PC (dossier) + dist/ARK_Telephone/ARK_Primal_World.html + zips v<ver>
tools/run_tests.sh                   # 18 suites Playwright (python3, chromium headless) ; ~4-5 min
python3 tests/test_balance.py        # simulations d'équilibrage (lentes, à lancer en tâche de fond)
python3 tests/test_balance_modes.py
```
Tests : Playwright Python. Les tests coupent animations/dialogues (`setPref("anim",false)`, `setPref("lore",false)`) car sinon les simulations de milliers de combats sont très lentes. `dist/` est ignoré par git. Les scripts longs (>2 min) doivent tourner en arrière-plan.

## Architecture (voir docs/ARCHITECTURE.md)
Pas de bundler : les scripts sont chargés dans l'ordre de `game/index.html` et **se corrigent les uns les autres par « monkey-patching » en portée globale** : `const _x=fn; fn=function(){...}`. Règles :
- Ne jamais déclarer `const` un nom destiné à être re-patché (`function` ou `let`).
- **L'ordre des `<script>` et des `<link>` fait partie du contrat.** `css/95-theme.css` doit rester le dernier thème ; `90-platform.css` après.
- Les modules ajoutent leurs champs de sauvegarde via un wrapper de `ens()` (migration/initialisation).
- État `S` dans `localStorage["arkPrimalMobile"]` ; config admin `arkPrimalConfig` ; préférences `arkPrimalPrefs` (`PREFS` : sound, vol, music, anim, vib, lore, diff, art, theme) ; sauvegardes auto `arkPrimalBackups`.
- Enveloppe de sauvegarde `{game:"ark-primal-world",fmt:1,ver,at,from,S,cfg}` ; codes `ARK2.`(gzip+base64) / `ARK1.` / base64 ancien ; `validate()` strict ; import = copie « avant import » puis rechargement.

Modules JS (ordre) : 00-version, 00-core, 05-admin, 10-combat-v1, 20-team-forge-save, 30-zones-supers, 40-progression, 50-skills-species (moteur de combat final : `startBattle`, `tapOrb`, `useSkill`, `special`, `afterAction`, `killEnemy`, `enemyTurn`, `hitDino`, `renderBattle`), 60-gacha-hud, 70-equipment, 80-modes (Tour, Arène, Événements, navigation à 5 onglets + sous-menu), 90-settings-audio (réglages, sons, difficulté, télémétrie), 92-orbs-fx (boost d'orbes, FX), 93-gacha-plus (roue, œufs, équipement), 94-battle-anim, 95-portraits (portraits SVG par espèce), 96-transfer, 97-backups, 97-teams, 98-tutorial, 99-visual, 99-expeditions (expéditions + succès), 99-enemy-traits, 99-summon-fx, 99-skill-fx, 99-story, 99-evolution, 99-music, 99-tuning (équilibrage global : ennemis ×1,3 PV, ×1,15 ATQ).
CSS : 00-base … 80-fx, 92-anim, 93-battle, 94-visual, 95-theme (futuriste, thèmes sombre/clair via `html[data-theme]`), 90-platform.

## Contenu du jeu (état 0.12.0)
- Histoire 100 niveaux / 4 zones (boss tous les 10), Donjons 5×5, Tour infinie, Arène (classement simulé localement), Événements hebdomadaires, 46 espèces (14 communes, 13 rares, 10 épiques, 9 légendaires) avec compétence active (14) + passif, variantes (Alpha, Ombre, Albinos, Doré, Prismatique), équipement (armes/armures/talismans), éveil ★, fusion, recyclage, gacha riche (vedette, élémentaire, variantes, roue quotidienne, œufs, équipement, garanties), missions, connexion quotidienne, rang du survivant (niveau joueur = +0,5 % PV/ATQ par rang).
- Combat : plateau 3×3 de 9 orbes, **boost** si plusieurs orbes de même couleur (×1,15 à ×3), avantages d'éléments (rouge>vert>bleu>rouge), combos, synergie, super attaque, ennemis à traits (Carapace, Venimeux, Régénérant, Berserker dès le niveau 8, pas en Tour/Arène), boss en 3 phases (bouclier à 66 %, venin+rage à 33 %).
- Ajouts récents : expéditions chronométrées (3 emplacements, 15 min/1 h/4 h, hors-ligne via `Date.now()`), 34 succès + titres, 17 chaînes d'évolution, 14 dialogues d'histoire + journal (désactivés sous automatisation `navigator.webdriver` sauf `window.__forceLore`), musique procédurale à 3 ambiances, animations de combat (projectiles, chiffres flottants, traînée de PV, bannières, étoiles de victoire, vibrations), invocation animée, 14 effets de compétences.
- Graphismes 0.12.0 : filtre SVG global `#vol` (volume des portraits), `portrait(type,bare)` (version sans fond pour la scène), `stageBuild()` (scène de combat par zone en parallaxe avec ennemi + équipe), orbes en verre (symboles SVG), cadres de rareté.

## Pièges connus
- `T3` et `alive` sont des `const` : inaccessibles via `window.T3` ; utiliser `S.team.slice(0,3)`.
- `SK_of` est `const` (compétence lue sur `SPEC[type].sk`).
- `renderBattle` est réassigné par ~10 modules ; l'ordre compte. `stageBuild()` est appelé depuis 94-battle-anim juste après le rendu de base ; les modules ultérieurs cherchent `.sHud`/`.sFig` (avec repli sur l'ancien `.panel`).
- `giveXP`/`give()` : `give` gère matériaux (`S.mat`) ou champs de `S` (tickets, shards…).
- Comparer deux états après transfert : appeler `ens()` avant (champs par défaut ajoutés).
- Chromium headless se détecte « PC » : la grille 2 colonnes de la collection est limitée à ≥700 px.
- Éviter les `sleep` enchaînés pour attendre des tests ; utiliser un `until` avec timeout.

## Idées restantes / pistes
- Équilibrage : le bot de simulation joue parfaitement ; l'Arène reste à 100 % de victoires pour une équipe préparée → durcir si trop facile. À valider sur de vrais joueurs.
- Sprites d'ennemis dédiés (aujourd'hui portraits d'espèces réutilisés via `EMO_PT`), animations d'attaque propres par espèce, décors de menu, mode auto-combat/accélération, plus de succès/événements, tests sur vrai téléphone.
- Le « truc inutile » signalé par l'utilisateur : hypothèse = niveau du joueur (maintenant rang) ; à confirmer (autre candidat : la jauge ⚔ puissance).
