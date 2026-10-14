# ARK: Primal World

Jeu de combat 2D à orbes inspiré de Dokkan Battle, avec des dinosaures. Il tourne dans un navigateur, **en local, sans serveur ni compte**.

## Deux versions, une même sauvegarde
- **Version PC** (`ARK_PC/`) : double-clic sur `index.html`. Raccourcis clavier en combat (1-2-3 orbes, A-Z-E compétences, Espace super), mise en page élargie.
- **Version téléphone** (`ARK_Telephone/ARK_Primal_World.html`) : **un seul fichier** à ouvrir dans le navigateur du téléphone, boutons tactiles agrandis.
- Les deux sont construites par `python3 tools/build.py` à partir du même code (`game/`) : seule la plateforme change.
- **Transfert** : *Accueil > Sauvegarde* → *Exporter un fichier* (`.arksave`) puis *Importer un fichier* sur l'autre appareil, ou *Copier le code* / *Importer ce code*. Format identique des deux côtés, avec contrôles de validité (jeu, version, dinosaures), possibilité d'*annuler le dernier import* et lecture des anciens codes.
- La progression est enregistrée dans le navigateur de chaque appareil : exporte de temps en temps pour avoir une copie.
- **Non testé sur un vrai téléphone** (seulement émulation mobile de Chromium). Certains navigateurs mobiles restreignent les fichiers locaux ; voir `LISEZ-MOI.txt` de la version téléphone.

## Contenu du jeu
- **Histoire : 100 niveaux**, 4 zones, un boss tous les 10 niveaux, difficulté croissante.
- **Donjons** : 5 donjons × 5 difficultés (Facile à Cauchemar), débloqués par l'histoire. Chaque donjon donne un matériau.
- **Matériaux** : 🦴 os, 🟤 cuir, 💎 cristaux, 🟠 ambre. Servent à l'éveil (★ jusqu'à 5, +10 % de stats par étoile) et au gacha.
- **Gacha** : tirage gratuit quotidien, bannière **vedette** qui change chaque jour (garantie à 60), bannière **élémentaire**, bannière **variantes** (x2,5), tickets x1/x5, pierres x1/x10, multi garanti (Épique+), bannière cristal, garantie légendaire à 40 tirages, historique.
- **Incubateur d'œufs** : les boss, donjons et la connexion quotidienne donnent des œufs qui éclosent après quelques victoires.
- **Boutique de fragments** : le recyclage donne des fragments pour acheter l'espèce de ton choix.
- **Connexion quotidienne** : série de 7 jours de récompenses.
- **Missions** : 9 quotidiennes (réinitialisées chaque jour) + 20 objectifs permanents. **Suivi des missions affiché à la fin de chaque combat.**
- **46 espèces** (14 communes, 13 rares, 10 épiques, 9 légendaires), chacune avec une **compétence active** (14 possibles, avec recharge) et un **attribut spécial passif** (13 possibles, ex. Dernier souffle, Piquants, Alpha de meute).
- **Variantes** tirées à l'invocation : Alpha, Ombre, Albinos, Doré, Prismatique (stats modifiées et rendu coloré).
- **Combat** : orbes de 5 couleurs avec aperçu des dégâts, avantages d'éléments, combos, synergie d'équipe, compétences actives, super attaque selon l'élément de tête, attaques puissantes ennemies, bosses avec attaque de zone et rage.
- **Collection** : filtre et tri, pagination, bestiaire, choix des 3 places d'équipe, **fusion de doublons** (+1★) et **recyclage**.
- **Progression** : niveaux, entraînement, forge (essences), éveil, équipe de 3.
- **Équipement** : armes (ATQ), armures (PV/DÉF) et talismans (PV/ATQ + un attribut passif supplémentaire), 4 raretés, butin des boss/donjons/modes, amélioration jusqu'à +10, démontage, auto-équipement.
- **Tour infinie** : étages sans fin avec modificateurs (Colosse, Frénésie, Régénérant, Gardien tous les 10), paliers de récompenses jusqu'à l'étage 300.
- **Arène** : combats contre des équipes d'IA (3 difficultés), classement Bronze → Apex, médailles 🏅, boutique, 5 combats par jour. Les rivaux du classement sont simulés localement.
- **Événements hebdomadaires** : 4 événements en rotation (lundi, UTC), 3 épreuves, jetons 🎫, objectifs et boutique à stock limité.
- **Sons et animations** : effets sonores et musique synthétisés (aucun fichier), secousses, éclairs, confettis.
- **Illustrations** : un portrait SVG original par espèce (interrupteur illustrations/emojis), images personnalisées importables depuis l'admin.
- **Réglages** (⚙) : audio, animations, difficulté (facile / normal / difficile), rapport d'équilibrage copiable, réinitialisation.
- **Admin local** (⚙ ADMIN) : dinosaures, coûts, taux de drop, récompenses (enregistré sur l'appareil).

## Tests
Nécessitent Python 3 et Playwright (`pip install playwright && playwright install chromium`).
```
python3 tests/test_full.py      # parcours complet : combats, donjons, éveil, gacha, missions, import/export
python3 tests/test_gacha.py     # vedette, bannières, garanties, œufs, boutique, connexion quotidienne
python3 tests/test_skills.py    # 14 compétences, passifs, variantes, fusion, recyclage, collection, admin, 46 espèces en combat
python3 tests/test_equipment.py # butin, forge, démontage, auto-équipement, passifs de talismans
python3 tests/test_modes.py     # navigation, Tour, Arène, événements (règlement, limites, boutiques)
python3 tests/test_settings.py  # sons, difficulté, télémétrie, préférences, animations
python3 tests/test_portraits.py # 46 portraits SVG, mode emoji, import d'image admin
python3 tests/test_transfer.py  # construit PC + téléphone, transfert de sauvegarde dans les deux sens, rejets, clavier
python3 tests/test_balance.py   # taux de victoire par niveau d'histoire (simulation)
python3 tests/test_balance_modes.py # idem pour la Tour et l'Arène
```

## Dossiers
- `game/` : le code source du jeu (`index.html`, `css/`, `js/`). `tools/build.py` en fait les versions PC et téléphone dans `dist/` (non versionné). Architecture : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- `online-supabase/` : ancienne piste en ligne (comptes + base Supabase). **Jamais testée contre un vrai Supabase**, non maintenue depuis l'abandon de la mise en ligne.

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique.
