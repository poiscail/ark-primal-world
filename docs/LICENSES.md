# Ressources tierces intégrées

| Ressource | Auteur | Licence | Utilisation |
|---|---|---|---|
| Orbitron (graisses 700, 900, latin) | The Orbitron Project Authors | SIL Open Font License 1.1 — `docs/LICENSE-Orbitron-OFL.txt` | titres, boutons, chiffres (`css/91-fonts.css`) |
| Exo 2 (graisses 500, 700, 800, latin) | Natanael Gama / Exo 2 Project Authors | SIL Open Font License 1.1 — `docs/LICENSE-Exo2-OFL.txt` | texte de l'interface |
| Particle Pack (15 textures, réduites à 128 px) | Kenney (kenney.nl) | CC0 1.0 (domaine public) | effets de combat et d'invocation (`css/91-tex.css`) |
| Electron (et Chromium qu'il contient) | OpenJS Foundation et contributeurs / The Chromium Authors | MIT ; licences de Chromium jointes à l'application (`LICENSE.electron.txt`, `LICENSES.chromium.html`) | moteur de l'application Windows |
| NSIS (via electron-builder) | NSIS Contributors | zlib/libpng | installateur Windows |

Polices récupérées via Fontsource (npm `@fontsource/orbitron`, `@fontsource/exo-2`) et intégrées en base64 pour fonctionner hors ligne. Tout le reste (portraits, décors, images de fond des thèmes — `tools/gen_backgrounds.py` —, icônes, sons, musique) est original et généré par le code.
