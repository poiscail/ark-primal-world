# ARK: Primal World

Jeu de combat à orbes inspiré de Dokkan Battle, avec des dinosaures. Application **Windows (.exe)**, **100 % hors ligne** : aucun compte, aucun serveur.

## ⬇️ [Télécharger la dernière version](https://github.com/poiscail/ark-primal-world/releases/latest)

- **Installateur** (`ARK_Primal_World_<version>_installation.exe`) : raccourcis Bureau et menu Démarrer, désinstallation depuis les paramètres de Windows. Recommandé.
- **Portable** (`ARK_Primal_World_<version>_portable.exe`) : un seul fichier, rien à installer, double-clic pour jouer.
- Windows 10 ou 11, 64 bits. Le jeu n'est pas signé numériquement : au premier lancement, Windows peut afficher « Windows a protégé votre ordinateur » → *Informations complémentaires* → *Exécuter quand même*.
- **Toutes les versions**, chacune sur sa propre page avec ses nouveautés : [page des versions](https://github.com/poiscail/ark-primal-world/releases). Les versions 0.4 à 0.17 (avant l'application Windows) se jouent dans un navigateur : zip à décompresser, puis `index.html`.

Chaque .exe est construit et vérifié automatiquement sur une machine Windows virtuelle (GitHub Actions) avant d'être publié : installation silencieuse, lancement, combat, invocation, sauvegarde retrouvée au lancement suivant. Il n'a pas encore été essayé à la main sur un vrai PC.

## Sauvegarde
- La progression est enregistrée sur l'ordinateur (`%APPDATA%\ARK Primal World`) et reste en place quand tu installes une nouvelle version.
- *Accueil > Profil > Sauvegarde* : **exporter** un fichier `.arksave` ou un code, **importer** sur un autre PC. Les sauvegardes des anciennes versions (navigateur, téléphone) s'importent de la même façon.
- 5 copies de secours automatiques (Réglages), et « annuler le dernier import ».

## Commandes
Souris partout ; au clavier pendant un combat :

| Touche | Action |
|---|---|
| 1 à 9 | Jouer une orbe (aussi en AZERTY sans Maj, et au pavé numérique) |
| A, Z, E | Compétences des 3 dinos |
| Espace | Super attaque |
| R / T / C | Auto-combat / vitesse ×1-×2-×3 / enchaînement des combats |
| F11 | Plein écran |

## Contenu
- **Histoire** : 100 niveaux sur une carte à chapitres, 4 zones, un boss tous les 10 niveaux, étoiles (★ à ★★★) et paliers de récompenses, dialogues et journal de l'île. **Mode Cauchemar** : les 100 niveaux sur une île corrompue (ennemis bien plus forts, tous avec un trait et une compétence), étoiles noires, éclats d'ombre et boutique de l'ombre (Rite d'ombre : variante Ombre au choix).
- **Modes** : Donjons (5 × 5 difficultés), Tour infinie (gardiens à compétences), Arène (classement simulé, adversaires à compétences), Événements de la semaine, **Raid de la semaine** (boss colossal aux PV persistants), **Défi du jour**, **Fouilles**, **Expéditions** (le butin s'accumule jeu fermé), **Épreuves de la meute** (18 défis à contraintes : familles, éléments, raretés, sans super, sans compétences, contre la montre ; 3 paliers chacun), **Labyrinthe des reliques** (course rejouable à l'infini : carte à embranchements, PV conservés d'un combat à l'autre, 30 reliques et 5 malédictions, 14 mystères, marchand, campements, 3 gardiens, 11 profondeurs, boutique de marques).
- **Collection** : 80 espèces (21 communes, 22 rares, 20 épiques, 17 légendaires) dans 8 familles, avec une compétence active (22 différentes) et un attribut passif (19 différents) chacune, 5 variantes (Alpha, Ombre, Albinos, Doré, Prismatique), 37 évolutions, éveil ★, fusion, recyclage, équipement (armes, armures, talismans), forge, 5 équipes enregistrées.
- **Invocation** : tirage gratuit quotidien, bannière vedette, élémentaire, variantes, roue, œufs, équipement, appels au choix, boutique de fragments, **Marché du jour**, garanties ; animation de révélation.
- **Combat** : plateau de 9 orbes avec boost par couleur, éléments (🔥 > 🌿 > 💧 > 🔥), combos, synergie, super attaque, ennemis à traits (Carapace, Venimeux, Régénérant, Berserker), boss en 3 phases, **auto-combat**, vitesse ×1/×2/×3, **enchaînement automatique** des combats.
- **Stratégie d'équipe** : le 1er dino est le **chef** (bonus aux dinos de sa famille ou de son élément selon sa rareté), **liens** entre voisins de même famille ou de même élément, **météo** du jour par zone qui renforce certaines orbes, **sacoche de combat** (herbe de soin, tonique de rage, pierre fumigène, éclat d'orbe, fabriqués avec les matériaux, 3 par combat).
- **Monde** : 20 créatures ennemies dessinées et dinosaures corrompus, attaques animées par famille (morsure, charge, massue, épines, piqué, séisme, cri, jet d'eau), décors de zone, bestiaire des créatures.
- **Progression** : missions quotidiennes et permanentes, connexion quotidienne, « À faire aujourd'hui », 60 succès et titres, rang du survivant.
- **Présentation** : mise en page PC (navigation à gauche, écrans larges), 7 thèmes (Néon, Clair, Jungle, Volcan, Abysses, Mystique, Désert), polices Orbitron / Exo 2 / Bangers, effets à textures, musique et sons générés par le jeu, tutoriel et guide.
- **Sensations de combat** : gel à l'impact, secousses, flash de l'ennemi touché, étincelles, super attaque mise en scène façon Dokkan (portrait, nom de l'attaque), invocation dont la couleur peut monter d'un cran, cadres légendaires holographiques, parallaxe à la souris (tout est désactivable dans les Réglages).
- **Admin local** (⚙ ADMIN) : dinosaures, coûts, taux de drop, récompenses.

## Pour les développeurs
- `game/` : le jeu (HTML/CSS/JS sans bundler, modules chargés dans l'ordre de `index.html`). Architecture : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Contexte pour Claude Code : [CLAUDE.md](CLAUDE.md).
- `desktop/` : l'application Electron (fenêtre, plein écran, sauvegarde, test de lancement `--smoke-test`).
- `tools/build.py` : construit l'installateur et le portable (`dist/ARK_Windows/`, non versionné) ; `tools/releases.py` publie une page par version ; `tools/gen_backgrounds.py` génère les images de fond des thèmes.
- `.github/workflows/windows-exe.yml` : à chaque envoi, construit et teste l'exe sur Windows ; depuis `main`, publie les pages de versions.
- Tests : `tools/run_tests.sh` (36 suites Playwright, Python 3 + Chromium), `tests/test_balance*.py` (simulations d'équilibrage).
- Licences des ressources intégrées : [docs/LICENSES.md](docs/LICENSES.md). Historique détaillé : [CHANGELOG.md](CHANGELOG.md).
