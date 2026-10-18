# Ressources tierces intégrées

| Ressource | Auteur | Licence | Utilisation |
|---|---|---|---|
| Orbitron (graisses 700, 900, latin) | The Orbitron Project Authors | SIL Open Font License 1.1 — `docs/LICENSE-Orbitron-OFL.txt` | titres, boutons, chiffres (`css/assets/91-fonts.css`) |
| Exo 2 (graisses 500, 700, 800, latin) | Natanael Gama / Exo 2 Project Authors | SIL Open Font License 1.1 — `docs/LICENSE-Exo2-OFL.txt` | texte de l'interface |
| Bangers (sous-ensemble latin, woff2) | The Bangers Project Authors | SIL Open Font License 1.1 — `docs/LICENSE-Bangers-OFL.txt` | chiffres de dégâts, coupure de super attaque (`css/assets/91-fonts-fx.css`) |
| Particle Pack (15 textures, réduites à 128 px) | Kenney (kenney.nl) | CC0 1.0 (domaine public) | effets de combat et d'invocation (`css/assets/91-tex.css`) |
| UI Pack Sci-Fi (curseur `cursor_h`, viseur `crosshair_color_a` ; formes des vis, des boutons en relief et des barres brillantes reprises en CSS) | Kenney (kenney.nl) | CC0 1.0 (domaine public) — `tools/hud_src/kenney/License.txt` | interface (`css/assets/97-hud-assets.css`, `css/graphismes/97-hud.css`) |
| 35 icônes de game-icons.net (navigation, sous-onglets, ressources) | Lorc, Delapouite, Sbed (game-icons.net) | CC BY 3.0 — `tools/hud_src/gi/license.txt` ; auteur de chaque icône dans le nom du fichier source `tools/hud_src/gi/auteur--nom.svg` | `css/assets/97-hud-assets.css`, généré par `tools/hud_assets.py` ; crédits dans le jeu (Accueil > Crédits) |
| 6 décors peints (Jungle, Ruines, Volcan, Obélisque, Toundra, Abysses), sources `tools/aibg_src/*.webp` | générés par le joueur avec FLUX.1 [schnell] (Black Forest Labs) sur Hugging Face | Apache 2.0 (modèle et images produites) | fonds des scènes (`css/assets/97-aibg-img.css`, généré par `tools/aibg_build.py`) |
| Electron (et Chromium qu'il contient) | OpenJS Foundation et contributeurs / The Chromium Authors | MIT ; licences de Chromium jointes à l'application (`LICENSE.electron.txt`, `LICENSES.chromium.html`) | moteur de l'application Windows |
| NSIS (via electron-builder) | NSIS Contributors | zlib/libpng | installateur Windows |

Polices récupérées via Fontsource (npm `@fontsource/orbitron`, `@fontsource/exo-2`) et le dépôt GitHub google/fonts (Bangers, réduite aux caractères latins avec fontTools) et intégrées en base64 pour fonctionner hors ligne. Tout le reste (portraits, décors, images de fond des thèmes — `tools/gen_backgrounds.py` —, sons, musique, autres icônes) est original et généré par le code.
