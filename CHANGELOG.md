# Changelog

## 0.18.0 — Application Windows (.exe), PC uniquement, fusion des deux branches de travail
**Application Windows**
- Le jeu devient une application Windows (.exe, Electron) : **installateur** (raccourcis Bureau et menu Démarrer, désinstallation) ou **portable** (un seul fichier). Fenêtre redimensionnable dont la taille est mémorisée, plein écran (F11), une seule fenêtre à la fois, sauvegarde dans `%APPDATA%\ARK Primal World` (conservée d'une version à l'autre). Réglages > Application Windows : plein écran, dernière version, quitter.
- **Une page GitHub par version** (0.4.0 à 0.18.0) avec ses nouveautés ; lien « Télécharger la dernière version » en haut de la page du dépôt et bouton « Dernière version » dans les réglages. Les versions 0.4 à 0.17 se jouent dans un navigateur (zip joint à leur page).
- Construction automatique sur une machine Windows virtuelle (GitHub Actions) : à chaque envoi, l'installateur et le portable sont construits puis testés (installation silencieuse, lancement, combat, invocation avec un vrai clic sur OK, sauvegarde retrouvée au lancement suivant) ; les pages de versions ne sont publiées que si ces tests passent. Pas encore essayé à la main sur un vrai PC.

**PC uniquement**
- Plus de version téléphone : code, réglage « Vibrations » et textes propres au téléphone retirés. Les sauvegardes des anciennes versions (navigateur, téléphone) s'importent toujours (Accueil > Profil > Sauvegarde).
- Clavier : les **9 orbes** au clavier (touches 1 à 9, aussi en AZERTY sans Maj et au pavé numérique ; avant, seules 1-2-3 marchaient, et seulement avec Maj en AZERTY), C pour l'enchaînement des combats.
- Combat sur PC peu haut (portable 1366×768) : scène et orbes plus compacts pour tout voir sans défiler. Mise en page vérifiée en 1280×800, 1366×700 et 1920×1080.

**Fusion des deux branches de travail** — deux sessions avaient avancé en parallèle depuis la 0.12.0 : la branche principale (0.13 à 0.17 ci-dessous) et une branche de travail dont les ajouts arrivent ici :
- **Auto-combat** (l'IA lance la super, les compétences utiles, puis la meilleure orbe ; pause si une fenêtre est ouverte ou l'écran quitté) et **vitesse ×1/×2/×3** des animations (touches R et T, réglages « Combat »).
- **Bestiaire des ennemis** : 20 créatures dessinées (Sarcosuchus, Titanoboa, spectre fossile, squelette animé, scarabée cuirassé, scorpion géant, salamandre de lave, wyverne, rôdeur du néant, sentinelle de pierre, œil du temple, loup sinistre, entélodon, bison colossal, élasmothérium, golem de cristal, chauve-souris géante, ammonite géante, guêpe géante, araignée géante) et dinosaures corrompus par l'obélisque (veines d'énergie, yeux luisants, gardiens couronnés), teintés selon l'élément. **Bestiaire des créatures** (Quêtes > Succès) : créatures vaincues, silhouettes, habitats, 2 succès.
- **Attaques par famille** : morsure (théropodes), charge (cératopsiens), coup de massue (ankylosaures), pluie d'épines (stégosaures), piqué (ptérosaures), séisme (sauropodes), cri sonique (hadrosaures), jet d'eau (reptiles marins) ; ripostes des ennemis selon leur créature (morsure, griffes, souffle, projectile, rayon, rocher), onde de choc pour les attaques de zone. Elles s'ajoutent aux impacts à textures de la 0.14.
- **Compétences ennemies** : en Arène, chaque adversaire utilise la compétence de son espèce (annoncée dans le HUD) ; les gardiens de la Tour aussi (offensive ou contrôle). L'auto-combat se protège avant une compétence offensive annoncée.
- **Combat** : PV de l'équipe et compétence prête affichés sur la scène (cliquer sur un dino prêt lance sa compétence), zone et vague dans le HUD, deux colonnes (orbes à gauche, super et équipe à droite), en-tête réduit pendant le combat.
- **Décors de menu** : la vedette des bannières devient le gardien de la zone (Histoire), la créature du mode (Donjons, Tour, Événements) ou ton dino de tête (Arène).
- **Équilibrage** (simulation seulement : bot qui joue parfaitement, équipe préparée) : l'Arène restait à 100 % de victoires ; équipes Redoutable +10 % PV et +5 % ATQ → 97 / 93 / 73 % aux classements 1000 / 1300 / 1700 (Facile et Équilibré : 100 %). Tour : gardiens à compétences sans soin ni bouclier, équipe conseillée 75 à 100 % selon l'étage. Les simulations fixent maintenant le rang du joueur à chaque combat (il grimpait pendant la mesure et la faussait).
- Doublons des deux branches retirés : un seul **enchaînement des combats** (celui de la 0.16 : compte à rebours, série, arrêt sur défaite), piloté par le bouton 🔁 de l'en-tête de combat ; un seul décor de bannière (celui de la 0.13).

**Corrections**
- Invocation : le bouton OK du résultat ne répondait plus (corrigé dans les deux branches) ; chaque bouton de l'écran d'invocation est maintenant testé par de vrais clics, et l'application l'est aussi au lancement.
- Début de partie : avec l'équipe de départ (un seul raptor), le premier combat était perdu une fois sur trois même en jouant parfaitement. En Histoire, les ennemis sont affaiblis tant que l'équipe compte moins de 3 dinos : niveau 1 gagné du premier coup 100 % du temps (bot parfait et bot « joueur moyen »), le boss du niveau 10 reste exigeant (69 % du premier coup pour le bot moyen). Une équipe de 3 reste toujours plus forte. Simulation seulement.
- Compétence de soin : elle ne fait plus « attaquer » toute l'équipe ni afficher « -0 » ; un coup absorbé par un bouclier affiche « ABSORBÉ » ; réglages accessibles pendant un combat.
- Nom des équipes enregistrées saisi dans une fenêtre du jeu (la fenêtre système `prompt()` n'existe pas dans l'application) ; animations désactivées : plus d'effets différés qui s'affichaient quand même ; thème clair : titre en dégradé plus contrasté.
- Suppression du dossier `online-supabase/` et de l'ancien écran de connexion (inutilisés : jeu 100 % local).

**Tests** : 30 suites. Chaque suite signale maintenant ses échecs à `tools/run_tests.sh` : avant, 10 suites répondaient « réussi » même en cas d'échec, donc les bilans des versions précédentes étaient surestimés. Toutes les suites tournent en format PC ; nouvelles : `test_summon_buttons` (vrai clic sur chaque bouton d'invocation, deux tailles d'écran), `test_transfer` réécrit (deux PC, ancienne sauvegarde téléphone, clavier AZERTY).

## 0.17.0 — 7 thèmes avec images de fond, nouvelles espèces, Raid, Marché
- 7 thèmes complets au choix dans les Réglages (Néon, Clair, Jungle, Volcan, Abysses, Mystique, Désert) : couleurs de toute l'interface + image de fond, aperçus cliquables, mode automatique conservé.
- 7 images de fond générées par programme (`tools/gen_backgrounds.py`, Python/PIL) : décors en couches avec silhouettes de dinosaures, brume, rayons, particules ; WebP intégrées (≈110 Ko au total).
- 8 nouvelles espèces (54 au total) : Kentrosaure, Dimorphodon, Styracosaure, Élasmosaure, Concavenator, Sarcosuchus et 2 légendaires (Chronosaure, Aurorasaure), avec portraits et 3 évolutions supplémentaires.
- Raid de la semaine (Aventure → Raid) : boss colossal dont les PV persistent toute la semaine, 3 tentatives de 10 tours par jour, récompense selon les dégâts, 4 paliers (25/50/75/100 %).
- Marché du jour (Invocation → Marché) : 6 offres tirées chaque jour (tickets, essence, matériaux, fragments, coffre d'équipement, viande +3 niveaux, pioche, œuf), une fois chacune.
- 3 nouveaux succès. Tests : `test_content.py`.

## 0.16.0 — Enchaînement auto, animations de plateau, correctif invocation
- Correctif : le bouton « OK » du résultat d'invocation ne répondait pas (la couche d'effets restait au-dessus après l'animation).
- Enchaînement automatique des combats : option dans les Réglages et bouton en combat ; après une victoire, compte à rebours puis combat suivant (histoire : niveau suivant ; Tour : étage suivant ; Donjon : même donjon), jusqu'à une défaite, l'arrêt manuel ou la fin de la progression. Compteur de série.
- Animations : orbes qui tombent en cascade à chaque nouveau plateau, bulle « COMBO ×N », bouton de super attaque qui pulse quand elle est prête, anneau de compte à rebours.
- Tests : `test_chain.py` (dont un vrai clic sur « OK » après invocation x1 et x5).

## 0.15.0 — Onglets épurés et nouvelles activités
- Navigation : 5 onglets (Accueil, Équipe, Aventure, Invocation, Quêtes) et une barre de sous-onglets collante avec pastilles de notification.
  - Accueil : Accueil / Profil (journal, profil, sauvegarde rangés à part).
  - Équipe : Meute / Améliorer (forge, évolutions) / Sac / Bestiaire.
  - Aventure : Histoire / Donjons / Tour / Arène / Événements.
  - Invocation : Bannières / Bonus (roue, appels, équipement, œufs) / Boutique.
  - Quêtes : Missions / Défi / Fouilles / Expéditions / Succès.
- « À faire aujourd'hui » sur l'accueil : liste des activités disponibles avec accès direct.
- Défi du jour : combat spécial quotidien (orbes du jour ×1,5, trait imposé, ennemis +50 % PV), récompense une fois par jour, série de 7 jours bonus.
- Fouilles : 16 cases de sable, 3 pioches gratuites par jour (+3 achetables), trésors dont un fossile légendaire ; terrain différent chaque jour.
- Missions : les missions terminées sont masquées (bouton pour les afficher).
- 2 succès supplémentaires (Archéologue, Défieur Quotidien).
- Tests : `test_nav.py`.

## 0.14.0 — Polices futuristes et effets à textures
- Polices intégrées (fonctionnent hors ligne) : Orbitron pour les titres, chiffres et bannières, Exo 2 pour le texte (licence SIL OFL).
- 15 textures de particules (Kenney Particle Pack, CC0) teintées par masque : impacts colorés selon l'orbe, entailles de griffes, flammes, fumée de venin, onde de choc, éclairs, éclat de super attaque, fumée à la mort d'un ennemi, cercle de runes à l'invocation.
- `docs/LICENSES.md` liste les ressources tierces et leurs licences.

## 0.13.0 — Finitions de l'interface et carte d'histoire
- Carte de l'histoire : 10 chapitres de 10 niveaux sur un chemin sinueux animé au-dessus du décor de la zone, nœuds terminés / en cours / verrouillés / boss, dino de tête au-dessus du niveau courant.
- Étoiles (1 à 3) enregistrées par niveau d'histoire, paliers de récompenses tous les 25 étoiles.
- Bannières de tous les écrans illustrées par un décor animé ; en-tête compact (ressources sur une ligne défilante), titre en dégradé animé.
- Animations : entrées en cascade, onde au toucher, reflet sur les boutons principaux, icônes de navigation qui rebondissent, équipe qui saute de joie à la victoire / s'effondre à la défaite, ennemi qui charge vers l'équipe.
- Réglages : vrais interrupteurs ; écran titre animé au lancement.
- Tests : `test_polish.py`.

## 0.12.0 — Refonte graphique
- Portraits : volume (reflet, ombre interne, contour) via filtre SVG, fonds dégradés, cadres de rareté (Rare / Épique / Légendaire doré), version « sans fond » pour la scène.
- Scène de combat : décor en parallaxe par zone (jungle, ruines, volcan, obélisque), gros ennemi retourné face à l'équipe, formation de 3 dinos, ennemi teinté selon son élément, boss agrandi avec aura ; plus grande sur PC.
- Orbes en verre : sphères brillantes avec symboles SVG (flamme, goutte, feuille, éclair, soleil).
- Accueil : le dino de tête en grand ; cartes de collection avec cadre de rareté ; bestiaire en silhouettes ; résultats d'invocation agrandis.
- Correction : mise en page de la collection en 2 colonnes sur fenêtre étroite (PC).

## 0.11.0 — Combat animé, expéditions, succès, évolutions, histoire
- Combat : projectiles d'attaque, chiffres de dégâts flottants (critique, « EFFICACE ! », combo), barres de PV avec traînée, scènes animées par zone, bannières de vague / boss / rage, écran de victoire avec étoiles, vibrations (téléphone), particules d'ambiance.
- 14 effets visuels de compétences (entailles, flammes, venin, soins, bouclier, viseur…).
- Invocation spectaculaire : cercle magique teinté selon la meilleure rareté, cartes face cachée retournées une à une, éclats et rayons pour les légendaires, « toucher pour passer ».
- Ennemis : traits (Carapace, Venimeux, Régénérant, Berserker) à partir du niveau 8 ; boss en 3 phases (bouclier à 66 %, venin + rage à 33 %).
- Expéditions chronométrées (3 emplacements, 15 min / 1 h / 4 h) qui continuent fermé le jeu.
- 34 succès avec récompenses et titres affichés sur l'accueil ; pastilles de notification.
- Évolutions : 17 chaînes d'espèces (niveau, étoiles, variante conservés), animation dédiée.
- Histoire : 14 dialogues aux niveaux clés + journal de l'île relisible.
- Musique procédurale à 3 ambiances (menu, combat, boss).
- Réglages : vibrations et dialogues d'histoire activables.
- Tests : `test_battle_anim`, `test_exped`, `test_traits`, `test_summon_fx`, `test_skill_fx`, `test_story`, `test_evolution`, `test_music`.

## 0.10.0 — Style futuriste, thèmes, boost d'orbes, animations, gacha étendu, rang
- Style futuriste (grille néon, angles coupés, HUD) avec thème sombre, clair ou automatique.
- Boost d'orbes : plus il y a d'orbes de la même couleur sur le plateau, plus elles frappent fort (×1,15 à ×3), avec badges et pulsations.
- Animations : particules, ondes de choc, ennemi qui se dissout, secousses, transitions d'écran, compteurs animés, héros flottants.
- Gacha : roue de la chance quotidienne, invocation d'équipement (garantie à 30), œufs mystères, appels épique/légendaire au choix, jauges de garantie.
- Rang du survivant : le niveau de joueur donne +0,5 % PV/ATQ par rang et des récompenses à chaque rang.
- Tests : `test_v10.py`.

## 0.9.0 — Confort : tutoriel, équipes enregistrées, sauvegardes de secours
- Tutoriel contextuel (9 conseils à affichage unique, « passer » possible) et Guide du jeu.
- 5 équipes enregistrées, chargeables depuis l'écran Équipe et la barre des modes ; gestion des dinosaures disparus.
- 5 sauvegardes automatiques tournantes, restauration depuis les Réglages ; l'import crée une copie « avant import » (remplace l'ancienne copie unique).
- Tests : `test_qol.py`.

## 0.8.0 — Version PC et version téléphone, transfert de sauvegarde
- Deux versions construites depuis le même code (`tools/build.py`) : dossier PC (clavier, mise en page élargie) et fichier unique téléphone (tactile).
- Transfert de sauvegarde par fichier `.arksave` ou par code compressé ; enveloppe versionnée, validation stricte, rejet des sauvegardes d'un jeu/format inconnu, annulation du dernier import, anciens codes toujours lus.
- Le fichier de sauvegarde emporte aussi les réglages d'admin ; les préférences (son, difficulté) restent propres à chaque appareil.
- Retrait de l'installation PWA (service worker, manifeste, icônes) : remplacée par les deux versions ci-dessus.
- Correction : au chargement, une sauvegarde contenant une espèce récente provoquait des erreurs JavaScript (non bloquantes) avant le chargement complet des modules.

## 0.7.0 — Équipement, modes de jeu, sons, illustrations, hors ligne
- Code découpé en fichiers `css/` et `js/` (plus de fichier unique de 100 Ko).
- Équipement : armes, armures, talismans (passif), butin, forge +10, démontage, auto-équipement ; 2 nouvelles missions permanentes.
- Navigation : 5 onglets (Accueil, Équipe, Aventure, Invocation, Missions) + sous-navigation Histoire / Donjons / Tour / Arène / Événements.
- Tour infinie avec modificateurs et paliers ; Arène avec classement, médailles et boutique ; événements hebdomadaires avec jetons, objectifs et boutique.
- Réglages : sons et musique (Web Audio), animations, difficulté, rapport d'équilibrage local, réinitialisation.
- 46 portraits SVG originaux, mode emoji de secours, import d'images dans l'admin (redimensionnées, stockées localement).
- PWA : manifeste, icônes, service worker versionné, jeu jouable hors ligne (testé sur Chromium via localhost).
- Iguanodon avait le même emoji que Compsognathus (🦎) : remplacé par 🐸.
- Tests ajoutés : équipement, modes, réglages, portraits, PWA, équilibrage des modes.

## 0.6.0 — Gacha étendu, connexion quotidienne, HUD
- Gacha : tirage gratuit quotidien, bannière vedette (rotation quotidienne, 60 % de vedette parmi les légendaires, garantie à 60), bannière élémentaire, bannière des variantes (x2,5), historique et statistiques.
- Incubateur : 3 emplacements, œufs commun / rare / épique obtenus en boss, donjons et connexion ; éclosion après des victoires.
- Boutique de fragments (🧩) alimentée par le recyclage ; connexion quotidienne sur 7 jours.
- HUD : fenêtre de résultats animée avec lueurs par rareté, notifications non bloquantes (remplacent les alertes), journal de combat, profil du survivant, compteurs sur deux lignes.
- Corrections : la bannière élémentaire pouvait sortir un autre élément (aucun Épique doré) ; grille de résultats qui débordait ; variante Ombre peu lisible.
- 6 nouvelles missions (œufs éclos, tirages).

## 0.5.0 — Compétences, attributs spéciaux, 46 espèces, variantes, nouveau HUD
- 14 compétences actives avec recharge (réduite aux éveils ★3 et ★5) et 13 attributs passifs.
- 46 espèces (31 nouvelles) ; variantes Alpha / Ombre / Albinos / Doré / Prismatique au gacha.
- Moteur de combat réécrit : statuts (étourdissement, brûlure, poison, bouclier, bonus d'attaque), synergie d'équipe, boss avec attaque de zone et rage, aperçu des dégâts par orbe, boutons de compétence, aide en combat.
- Collection : filtres, tri, pagination, bestiaire, 3 places d'équipe, fusion de doublons, recyclage.
- HUD : puissance d'équipe, pastille de missions à récupérer, carte « Aventure » sur l'accueil, combat plus compact.
- Admin local : choix de la compétence et de l'attribut, ajout d'espèces.
- 4 nouveaux types de missions (compétences, variantes, espèces, fusions) + 1 quotidienne.
- Difficulté rééquilibrée (+30 % de PV ennemis) : niveaux 70-100 exigent éveil et forge.

## 0.4.0 — Histoire 100 niveaux, donjons, matériaux, gacha, missions
- Mode histoire de 100 niveaux avec courbe de difficulté et boss tous les 10 niveaux.
- 5 donjons × 5 difficultés avec matériaux (os, cuir, cristaux, ambre).
- Éveil des dinosaures (★ ×5) coûtant des matériaux.
- Gacha : invocation par pierres, multi garanti, bannière cristal, garantie légendaire (40 tirages).
- 9 nouveaux dinosaures.
- 9 missions quotidiennes + 20 objectifs, suivi affiché après chaque combat, onglet Missions.
- HUD : matériaux dans l'en-tête, 7 onglets.
- Corrections : validation de l'admin local qui ne bloquait pas les erreurs ; `pickType` manquant ; insertion des compteurs de matériaux.
- Tests automatisés (`tests/`).

## 0.3.0 — Zones, attaques puissantes, supers par élément
## 0.2.0 — Équipe, forge, export/import, dégâts flottants
## 0.1.0 — Version locale : combat à vagues, orbes, HUD (barre d'XP)
## Avant — Prototype initial + piste Supabase (dossier `online-supabase/`)
