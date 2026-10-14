# ARK: Primal World

Jeu de combat 2D à orbes inspiré de Dokkan Battle, avec des dinosaures. Il tourne dans un navigateur, **en local, sans serveur ni compte**.

## Lancer le jeu
- **PC** : ouvrir `game/index.html` (double-clic).
- **Téléphone** (même Wi-Fi) : dans `game/`, lancer `python3 -m http.server 8000`, puis ouvrir `http://IP-DU-PC:8000`.
- La progression est enregistrée dans le navigateur de chaque appareil. Pour passer de l'un à l'autre : **Accueil > Exporter / Importer** un code de sauvegarde.

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
- **Admin local** (⚙ ADMIN) : dinosaures, coûts, taux de drop, récompenses (enregistré sur l'appareil).

## Tests
Nécessitent Python 3 et Playwright (`pip install playwright && playwright install chromium`).
```
python3 tests/test_full.py      # parcours complet : combats, donjons, éveil, gacha, missions, import/export
python3 tests/test_gacha.py     # vedette, bannières, garanties, œufs, boutique, connexion quotidienne
python3 tests/test_skills.py    # 14 compétences, passifs, variantes, fusion, recyclage, collection, admin, 46 espèces en combat
python3 tests/test_balance.py   # taux de victoire par niveau
```

## Dossiers
- `game/` : le jeu local (version à jouer).
- `online-supabase/` : ancienne piste en ligne (comptes + base Supabase). **Jamais testée contre un vrai Supabase**, non maintenue depuis l'abandon de la mise en ligne.

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique.
