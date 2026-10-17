# ARK: Primal World — contexte du projet (à lire en premier)

Jeu de combat d'orbes façon Dokkan Battle avec des dinosaures, **100 % local** (aucun compte, aucun serveur), en HTML/CSS/JS pur (pas de bundler). Depuis 0.18.0 le jeu est **uniquement sur PC** et livré en **application Windows (.exe)** construite avec Electron (`desktop/`). Plus de version téléphone ; les anciennes sauvegardes (navigateur, téléphone) s'importent toujours (Accueil > Sauvegarde).

- Dépôt : https://github.com/poiscail/ark-primal-world (branche `main`)
- Version actuelle : **0.43.0** (`game/js/00-version.js`, `ARK_VERSION` et `SAVE_FORMAT=1`)
- L'utilisateur est français : **répondre en français**, être honnête sur ce qui est testé (jamais affirmer qu'une chose non testée marche ; l'.exe Windows n'est testé que par la construction automatique GitHub sur une machine Windows virtuelle ; équilibrage mesuré par simulation seulement).
- Attentes permanentes : améliorer sans cesse le gameplay, les animations et les graphismes ; mettre à jour GitHub à la fin de chaque étape ; l'utilisateur dira à la fin ce qu'il veut retirer (ne rien supprimer sans demande).
- Deux sessions ont travaillé en parallèle le 15/10/2026 (branche `main` 0.13→0.17 et branche `claude/magical-heisenberg-a3w1xx` avec une autre 0.13) ; 0.18.0 les fusionne. Toujours `git fetch` et regarder `origin/main` avant de commencer.

## Lancer / tester / construire
```
open game/index.html                 # jouer directement dans un navigateur (développement)
python3 tools/build.py               # .exe portable + installateur (sur Windows ; hors Windows il faut Wine)
python3 tools/build.py --linux --electron-zips=DOSSIER   # version Linux dépaquetée pour tester l'application ici
python3 tools/build.py --stage       # copie seulement game/ dans desktop/app/ (puis « npm start » dans desktop/)
tools/run_tests.sh                   # 75 suites, en parallèle (JOBS=1 : un par un) ; « tools/run_tests.sh nest far » : quelques-unes
python3 tests/test_balance.py        # simulations d'équilibrage (lentes, à lancer en tâche de fond)
python3 tests/test_balance_modes.py
python3 tests/test_balance_maze.py 10   # labyrinthe : courses complètes par un bot (~5-15 min)
python3 tests/test_balance_nightmare.py 20   # mode Cauchemar (option : pv atq k b pour essayer des réglages)
python3 tests/test_balance_trials.py 20      # épreuves de la meute, par palier
```
- Tests : Playwright Python (ici `pip install playwright==1.56.0`, version qui correspond au Chromium préinstallé dans /opt/pw-browsers). Les tests coupent animations/dialogues (`setPref("anim",false)`, `setPref("lore",false)`) car sinon les simulations de milliers de combats sont très lentes. **Chaque test doit finir par `sys.exit(1 if FAILS else 0)`** (sinon `run_tests.sh` ne voit pas les échecs). `dist/` est ignoré par git. Les scripts longs (>2 min) doivent tourner en arrière-plan.
- Application : `desktop/main.js` (fenêtre, F11, une seule instance, sauvegarde dans `%APPDATA%\ARK Primal World`), `desktop/preload.js` (pont `window.arkDesktop` : `toggleFullscreen`, `quit`, `info`), `game/js/99-desktop.js` (panneau « Application Windows » des réglages). Test de lancement : `"ARK Primal World.exe" --smoke-test --smoke-data=DOSSIER --smoke-expect-boot=N --smoke-out=f.json --smoke-shot=f.png` (combat joué, invocation + vrai clic sur OK, sauvegarde conservée entre 2 lancements ; jamais la vraie sauvegarde).
- **Publier une version** : `ARK_VERSION` + section `## X.Y.Z — titre` en tête du CHANGELOG (elle devient la page de la version), tests verts, envoi sur `main` → `.github/workflows/windows-exe.yml` construit et teste l'installateur et le portable sur Windows, puis `tools/releases.py` publie la page `vX.Y.Z` avec les .exe (« dernière version ») et crée une fois pour toutes les pages des anciennes versions (`HISTORY` : version → commit de main, zip navigateur joint). Lien permanent : https://github.com/poiscail/ark-primal-world/releases/latest (README + bouton « Dernière version » des réglages, `ARK_RELEASES`). Sur les branches `claude/**`, le workflow construit et teste seulement (fichiers dans les artefacts). Suivi des exécutions : outils MCP GitHub (`actions_list`, `get_job_logs`) ou l'API publique `https://api.github.com/repos/poiscail/ark-primal-world/actions/runs/<id>` avec curl.
- Ici (conteneur Linux, root) : Electron exige `--no-sandbox` et un écran virtuel (`xvfb-run -a`). Le téléchargement d'Electron par npm échoue derrière le proxy : récupérer `electron-v<ver>-linux-x64.zip` / `win32-x64.zip` + `SHASUMS256.txt` avec curl depuis les releases GitHub d'Electron, vérifier le sha256, puis `--electron-zips=DOSSIER`. Pas de Wine ni de makensis : les .exe Windows sont construits et testés par `.github/workflows/windows-exe.yml` (windows-latest).

## Architecture (voir docs/ARCHITECTURE.md)
Les scripts sont chargés dans l'ordre de `game/index.html` et **se corrigent les uns les autres par « monkey-patching » en portée globale** : `const _x=fn; fn=function(){...}`. Règles :
- Ne jamais déclarer `const` un nom destiné à être re-patché (`function` ou `let`). Deux scripts qui déclarent le même `let`/`const` global = erreur de syntaxe, le second script ne se charge pas du tout.
- **L'ordre des `<script>` et des `<link>` fait partie du contrat.** `css/95-theme.css` puis `96-skins.css` restent les derniers thèmes ; `90-platform.css` après, puis `97-pc.css` (mise en page PC), `97-juice.css`, `97-content.css`, `97-maze.css`, `97-nightmare.css`, `97-trials.css`, `97-far.css`, `97-nest.css`, `97-player.css`, `97-combat2.css`, `97-combat3.css`, `97-combat4.css`, `97-mastery.css`, `97-skills3.css`, `97-bosses.css`, `97-foes2.css`, `97-hunts.css`, `97-camp.css`, `97-world.css`, `97-regions.css`, `97-modes2.css`, `97-modes3.css`, `97-collect.css`, `97-collect2.css`, `97-progress.css`, `97-progress2.css`, `97-nest2.css`, `97-far2.css`, `97-gear2.css`, `97-gacha2.css`, `97-events3.css`, `97-anim2.css`, `97-gfx2.css`, `97-ui2.css`, `97-sound2.css`, `97-access.css`, `97-share.css`, `97-app2.css`, `97-events4.css`, `97-quests2.css`, puis `97-hud-assets.css` et `97-hud.css` en tout dernier. `99-layout.js` reste le dernier script (`99-juice.js` juste avant).
- Les modules ajoutent leurs champs de sauvegarde via un wrapper de `ens()` (migration/initialisation).
- État `S` dans `localStorage["arkPrimalMobile"]` (nom historique, ne pas changer) ; config admin `arkPrimalConfig` ; préférences `arkPrimalPrefs` (`PREFS` : sound, vol, music, anim, lore, chain, diff, art, theme, skin, auto, spd ; `vib` n'a plus d'effet) ; sauvegardes auto `arkPrimalBackups`.
- Enveloppe de sauvegarde `{game:"ark-primal-world",fmt:1,ver,at,from,S,cfg}` ; codes `ARK2.`(gzip+base64) / `ARK1.` / base64 ancien ; `validate()` strict ; import = copie « avant import » puis rechargement. `ARK_PLATFORM` vaut toujours `"pc"`.

Ordre des modules, rôle de chacun, variables, contenu du jeu, **tous les pièges connus par module** et mesures d'équilibrage : **`docs/CONTEXTE.md`** — lire la section du module avant de le modifier. Le dernier script est `99-layout.js` (`99-juice.js` juste avant, `99-hud.js` après `99-quests2.js`).

## Pièges les plus graves (le détail par module est dans docs/CONTEXTE.md)
- Noms de wrappers (`const _xxx`) et `let`/`const` globaux **uniques entre tous les scripts** (sinon le script entier ne se charge pas) ; `test_order` le vérifie. Identifiants de succès et émojis d'espèce uniques aussi.
- `T3`, `alive`, `SK_of`, `skCd`, `boostOf`, `nestSlots` sont des `const` : non remplaçables.
- `renderBattle` redessine `#battleArea` à chaque action et est enveloppé par ~20 modules : un effet posé dans `.battlestage` disparaît au rendu suivant (effets courts dans `#fxLayer`, durables reposés à chaque rendu). Ne jamais déplacer les nœuds de `#battleArea` (`99-layout` les classe `bl-*`).
- Les modes de `MODES` créent d'abord un combat d'histoire puis le transforment (`f.o` change) : ce qui dépend du mode se décide au premier rendu en gardant l'objet `f.o` vu.
- Dernier wrapper de `stats` utile : `99-progress` (plafond `pgCap`) ; un bonus ajouté plus tard doit repasser par `pgCap`.
- Sous `navigator.webdriver` (tests) : pas de dialogues d'intro, toujours le jour (`WD_FORCE`), pas d'événement daté (`window.__forceEv`), pas de week-end (`__forceWkend`), pas de bonus de 1re victoire (`__forceFirstWin`), pas de coupure de super (`__forceCutin`), pas de réduction auto des effets (`__forcePerf`), pas de « Quoi de neuf ».
- Tests : vrais clics Playwright ; `setPref("anim",false);setPref("lore",false)` ; `F2.newP=F2.goldP=F2.callP=0` et `C4.duoP=0` quand on compte des ennemis ou des dégâts ; trait Carapace dès le niveau 8 (`e.tr="";e.sh=0`) ; compter les effets créés (MutationObserver), pas les présents ; attendre par condition, jamais par `sleep` enchaînés ; après `location.reload()`, attendre `typeof setPref==="function"`. Les tests tournent en parallèle : pas de fichier partagé entre deux tests.
- Animations réduites (Windows « Afficher les animations » coupé = `prefers-reduced-motion`) : un élément qui ne disparaît qu'à la fin de son animation reste affiché ; le retirer aussi par JS.
- Fenêtre minimale 1024×640 : orbes, super et compétences visibles sans défiler (`test_layout`).
- Notifications dans `localStorage["arkPrimalNotes"]`, jamais dans `S` (sinon le test de transfert échoue).
- Sessions cloud : `.claude/hooks/session-start.sh` installe Playwright 1.56.0 et Pillow.

## Ressources en ligne
- L'accès réseau a été ouvert par l'utilisateur, mais seuls certains sites répondent (17/10/2026 : GitHub, raw.githubusercontent.com, kenney.nl, game-icons.net, opengameart.org, itch.io, huggingface.co, fonts.google.com, image.pollinations.ai oui ; gameuidatabase.com et les pages web de github.com non). npm passe en forçant le proxy : `NO_PROXY=localhost npm i --proxy "$HTTPS_PROXY" --https-proxy "$HTTPS_PROXY" --noproxy localhost <paquet>`.
- Intégrés (voir `docs/LICENSES.md`) : polices Orbitron + Exo 2 (`css/91-fonts.css`, base64), 15 textures Kenney Particle Pack CC0 (`css/91-tex.css`, masques teintés via `tex()` dans `js/99-texfx.js`), Kenney UI Pack Sci-Fi CC0 et 35 icônes game-icons.net CC BY 3.0 (sources dans `tools/hud_src/`, `python3 tools/hud_assets.py` régénère `css/97-hud-assets.css` ; toute icône CC BY doit être créditée dans `shCredits` et `docs/LICENSES.md`).
- IA d'images gratuite joignable d'ici : `https://image.pollinations.ai/prompt/<texte>?width=…&height=…&seed=…` (sans compte, filigrane, licence floue : seulement pour des essais, jamais dans le jeu publié).
- Utilisables par l'utilisateur via l'admin (import d'image par espèce) : sprites CC0 (OpenGameArt « free dino sprites », Pixelsaurs), Kenney UI Pack Sci-Fi (CC0), police Orbitron (OFL).
