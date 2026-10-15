# Changelog

## 0.13.0 — Combat repensé, bestiaire des ennemis, auto-combat
- Combat sur téléphone : la scène, les orbes, la super attaque et les compétences tiennent dans l'écran sans défiler (avant, les orbes commençaient sous le bas de l'écran) ; en-tête réduit au titre et aux réglages, équipe sur trois cases, PV et compétence prête affichés sur la scène (toucher un dino lance sa compétence), zone et vague dans le HUD. PC : deux colonnes (orbes à gauche, super et équipe à droite). Vérifié en émulation (390×844, 1280×800), pas sur un vrai téléphone.
- Auto-combat (l'IA lance la super, les compétences utiles, puis la meilleure orbe ; pause si une fenêtre est ouverte, l'écran quitté ou la page cachée), vitesse ×1/×2/×3 des animations et « Enchaîner » 🔁 (après une victoire en auto, le combat suivant démarre seul : niveau suivant, étage suivant, même donjon ; jamais en Arène, arrêt sur défaite ou bouton ARRÊTER) ; touches R et T sur PC ; réglages « Combat ».
- Bestiaire des ennemis : 20 créatures dessinées (Sarcosuchus, Titanoboa, spectre fossile, squelette animé, scarabée cuirassé, scorpion géant, salamandre de lave, wyverne, rôdeur du néant, sentinelle de pierre, œil du temple, loup sinistre, entélodon, bison colossal, élasmothérium, golem de cristal, chauve-souris géante, ammonite géante, guêpe géante, araignée géante) et dinosaures corrompus par l'obélisque (veines d'énergie, yeux luisants, gardiens couronnés), teintés selon l'élément ; leur nom s'affiche en combat.
- Bestiaire des créatures (Aventure > Succès) : créatures vaincues, silhouettes, habitats ; 2 succès (dont le titre « Naturaliste de l'île »). La 2e vague alterne entre deux créatures de la zone pour que toutes soient rencontrables.
- Animations d'attaque par famille : morsure (théropodes), charge (cératopsiens), coup de massue (ankylosaures), pluie d'épines (stégosaures), piqué (ptérosaures), séisme (sauropodes), cri sonique (hadrosaures), jet d'eau (reptiles marins). Les ennemis ripostent selon leur créature (morsure, griffes, souffle, projectile, rayon, rocher), onde de choc pour les attaques de zone ; la riposte se joue après l'impact allié et les PV baissent au bon moment.
- Compétences ennemies : en Arène, chaque adversaire utilise la compétence de son espèce (2e tour puis tous les 4 tours, jamais sur une attaque puissante, annoncée dans le HUD) ; les gardiens de la Tour aussi. L'auto-combat se protège avant une compétence offensive annoncée.
- Décors de menu : bannières de l'accueil et des modes en scène de zone (parallaxe), avec le gardien de la zone, la créature du mode ou ton dino de tête.
- Équilibrage (mesuré par simulation seulement : bot qui joue parfaitement, équipe préparée) : l'Arène restait à 100 % de victoires, même avec les compétences ennemies ; les équipes Redoutable ont désormais +10 % PV et +5 % ATQ → 97 / 93 / 73 % de victoires aux classements 1000 / 1300 / 1700 (Facile et Équilibré : 100 %). Tour : les gardiens utilisent une compétence offensive ou de contrôle, sans soin ni bouclier (une première mesure avec soins donnait 60 % à l'étage 40) ; une équipe conseillée garde 75 à 100 % de victoires selon l'étage, comme sans compétence (70 à 100 %). Histoire (inchangée) : équipe conseillée éveillée + forge à 100 % ; sans éveil ni forge, 15 % au niveau 50 et 0 % aux niveaux 70-100, comme prévu. À valider avec de vrais joueurs.
- Simulations d'équilibrage corrigées : le rang du joueur (+0,5 % PV/ATQ par rang) grimpait pendant la simulation et faussait les dernières mesures ; il est maintenant fixé à chaque combat.
- Corrections : une compétence de soin faisait « attaquer » toute l'équipe et affichait « -0 » ; un coup entièrement absorbé par un bouclier affiche « ABSORBÉ » ; les réglages restent accessibles pendant un combat.
- Tests : `test_layout`, `test_auto`, `test_bestiary`, `test_attack_fx`, `test_enemy_skills`, `test_menu_scenes`, `test_codex` (25 suites) ; `test_battle_anim` et `test_skill_fx` adaptés (attaques par famille, comptage des effets ajoutés).

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
