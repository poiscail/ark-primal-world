# Changelog

## 0.39.0 — Animations et graphismes, plus loin
- **Animations de combat** (toutes visuelles, coupées avec les animations) :
  - Les **orbes éclatent** en éclats à la touche ; une orbe **boostée** lance un anneau de lumière ; les orbes tombent avec un **rebond** et un écrasement.
  - **Particules d'élément** sur chaque coup (braises, gouttes, feuilles, éclairs, étincelles), **nombres de dégâts colorés** par élément et **empilés**, lettrage **« CRITIQUE ! »** façon bande dessinée et **zoom** de la caméra sur les critiques.
  - L'ennemi **recule et vacille** selon la force du coup ; le dino qui charge laisse une **traînée** ; un ennemi vaincu **se désintègre** en particules ; le **coup final d'un boss passe au ralenti**.
  - **Entrée de l'équipe** au début du combat (course et saut), **transition de vague**, **rugissement des boss** avec onde de choc, **feuilles** autour d'un dino soigné, **dôme hexagonal** pendant la Garde ou un bouclier, **bulles vertes** au-dessus d'un dino empoisonné, **pose de victoire**, et après une défaite la meute **se replie et se relève au camp**.
  - Nid : **éclosion animée** (œuf qui tremble, fissures, lumière ; ADN qui tourne pour une mutation). Évolution : la **silhouette grandit** avant d'être révélée.
  - Réglages > Affichage : **intensité des animations** (faible, normale, forte) et **réduction automatique** si le combat tourne sous 28 images par seconde.
- **Graphismes** :
  - **Portraits ombrés** avec une texture d'écailles (grands portraits), **décor à 4 plans** (crêtes lointaines et vol de ptérosaures, combat et bannières), **éclairage** de la scène selon l'élément de l'attaque.
  - **Météo plus riche** (gouttes, flocons, grains de sable, braises, aurore, brume en particules, en plus du voile existant), **brume volumétrique** en Cauchemar, **lucioles** la nuit, **reflets dans l'eau** dans les abysses, **ciel selon l'heure réelle** (aube, jour, crépuscule, nuit), **ombres au sol** plus marquées.
  - **3 nouveaux thèmes** : Fossile, Aurore, Rubis (10 en tout). **Icônes dessinées** pour les ressources de la barre du haut.
  - **Cadres de rareté** plus distincts (rare, épique avec coins, légendaire holographique irisé qui suit la souris, mythique à part), **vitrine** pour la collection, **carte d'histoire en relief**, **emblème** de chaque mode sur sa bannière, **feuillage animé** des bannières, silhouettes du bestiaire plus marquées.
  - **Écran titre** : dinos qui passent au loin et **astuce illustrée**. **Transitions** à l'ouverture d'un écran (animation d'entrée : l'API View Transitions aurait rendu le changement d'écran asynchrone, ce qui casserait le code qui enchaîne `go()` puis le rendu). **Police du titre** du combat selon la zone. HUD de combat plus lisible (PV plus grands, chiffres alignés).
  - Réglages > Affichage : **graphismes « Simples »** (sans textures, météo en particules, brume, lucioles, reflets ni flous) pour les petits ordinateurs.
- **Correctifs** : le tirage gratuit doublé du week-end (0.38) n'est plus actif sous un navigateur automatisé (sauf `window.__forceWkend`), sinon `test_gacha` échouait le samedi et le dimanche ; tests rendus robustes au hasard et au minutage (`battle_anim` compte les effets créés au lieu de ceux encore présents, `auto` suspend l'auto ×3 pendant un vrai clic, `juice` remet à zéro le gel en cours, `species2` coupe les créatures rares tirées au hasard).
- Tests : `test_anim2` (35 vérifications) et `test_gfx2` (33), vrais clics et effets comptés dans la couche d'effets. 63 suites. Le rendu a été vérifié sur des captures d'écran (Chromium ici, pas sur Windows).

## 0.38.0 — L'équipement, les invocations et les événements, plus loin
- **Équipement** :
  - **Ensembles** (25 % des objets) : 3 pièces du même ensemble donnent un bonus (Croc du Roi +10 % d'attaque, Écaille de glace +12 % de PV, Ambre ancestral +15 % de défense et +5 % de PV, Plume d'orage +2 de super par orbe).
  - **Objets de famille** (réservés à une famille, plus forts), **objets maudits** (×1,8 mais −12 % de PV), **objets uniques** (Croc de Tyran, Cuirasse du Mammouth, Œil de l'Obélisque, Cœur de la Graine, chacun avec un effet).
  - **Gemmes** à sertir (Rubis, Saphir, Émeraude, Topaze), **gravure** du talisman (choisir son attribut, 40 🔮), **apparence** (prendre le nom d'un autre objet), **verrou** et tri du sac, comparaison avec l'objet équipé.
  - **Amélioration risquée** (option) : coût divisé par deux dès +4, mais 10 à 50 % d'échec (l'objet reste intact).
  - **Atelier** : conversions de matériaux, **recettes trouvées dans les fouilles**, fabrication en série ; **parchemin d'étude** (XP +50 % pendant 1 h).
  - **Durabilité** (option « hardcore ») : les objets s'usent, une réparation à l'atelier.
  - **Les objets évoluent** : +1 niveau toutes les 25 victoires de leur porteur.
  - **Sacoche** : bombe d'ambre, filet, totem. **Icônes d'équipement** sur le portrait, **matériaux de la zone** sur la carte, **forge illustrée**, **coffre de butin animé**, **historique des objets**.
  - Les bonus d'ensembles et de gemmes passent par le **plafond de puissance** de 0.36 (vérifié par test).
- **Invocations** :
  - **Bannière de famille** (une seule famille, garantie légendaire à 40 comme d'habitude), **bannière de choix** (ta vedette parmi 5 légendaires de la semaine : 70 % des légendaires), **bannière élémentaire Épique+**, **bannière de retour** des espèces de saison (du 15 au 17 de chaque mois), **bannière anniversaire**.
  - **Liste de souhaits** (3 espèces plus probables), **ticket de variante garantie**, **tirage gratuit doublé le week-end**, **échange de 3 doublons** contre l'espèce de son choix (même rareté).
  - **Garanties et taux affichés**, **récapitulatif** des ×10 (nouveautés d'abord), bouton **« invoquer encore »**, mode sans animation pour les ×10, son de suspense réglable, œuf qui éclot selon la rareté.
  - **Cartes d'invocation** (album), **historique complet** et statistiques, **récompense toutes les 100 invocations** (+5 🎟️ et un ticket de variante), **tickets du bestiaire** (paliers jusqu'à 100 %).
  - Admin : **simulation des taux**.
- **Événements** :
  - **Événements spéciaux datés** qui reviennent chaque mois : Invasion (1-4 : 10 niveaux envahis à libérer), Nostalgie (5-6 : l'événement de la semaine dernière revient), Éclipse (7-9 : ennemis +10 % ATQ, +20 % d'essence), Chasse aux œufs dorés (10-14), Grande pêche (15-17 : prises doublées), Course contre la montre (18-19, Sprint), Âge de glace (20-22 : orbes 💧 +15 %), Éveil des volcans (25-27 : feu ×1,5 des deux côtés), Grande migration (28+ : apprivoisement facile), plus **Halloween** et **Noël** (cadeau chaque jour), avec leur décor.
  - **Jetons de fête 🎉** : gagnés en combattant pendant un événement (même en cas de défaite) ; les **jetons de la semaine non dépensés deviennent des jetons de fête** au lieu d'être perdus ; **boutique d'événement** qui change chaque semaine.
  - **Boss d'événement** : 10 tours pour infliger un maximum de dégâts, **classement personnel**.
  - **Calendrier des 4 prochaines semaines**, **défis du week-end**, **mission de lancement** de chaque version (5 victoires en 3 jours), **bandeau animé** et notification sur l'accueil.
- **Correctif** (présent depuis 0.35) : une sauvegarde contenant un dino Fossile, Cristal, Lave ou Spectral provoquait des erreurs au démarrage (la collection s'affichait avant que ces variantes soient déclarées) ; vérifié par un rechargement dans `test_collect`.
- 9 succès, entrées du guide.
- Tests : `test_gear2` (27 vérifications), `test_gacha2` (19) et `test_events3` (32), vrais clics. 61 suites.

## 0.37.0 — L'élevage et le Grand Nord, plus loin
- **Élevage** :
  - **Gènes de défense** (+3 % par point) et **de super** (+0,4 de jauge par orbe et par point), hérités comme les autres ; **mutations de couleur** visibles sur le portrait.
  - **Soins des œufs** : tourner et réchauffer (une fois par heure chacun, 3 soins) donnent une empreinte de départ au petit.
  - **Croisements spéciaux** entre familles proches (Cératopsiens × Ankylosaures, Ankylosaures × Stégosaures, Sauropodes × Hadrosaures, Théropodes × Ptérosaures, Reptiles marins × Ptérosaures, Mammifères × Cératopsiens, Insectes × Stégosaures) : le petit est une espèce épique, parfois légendaire.
  - **3e nid** après 10 éclosions ; la **Couveuse** du camp augmente aussi les mutations (+1 % par niveau) ; **Ponte record** les 3 premiers jours du mois (mutations ×2).
  - **Arbre généalogique** (parents, grands-parents), **nom de lignée**, **classement des lignées** (score), **bébés plus petits** qui grandissent avec le niveau.
  - **Échange par code** : un dino d'élevage quitte ta meute et peut rejoindre une autre sauvegarde (code à usage unique, vérifié).
  - **Quêtes d'élevage du Dr Elara** (6), **statistiques d'élevage**, **œufs visibles au camp**.
- **Grand Nord** :
  - **Chapitre 3 : le volcan sous-glaciaire** (niveaux 41 à 60, onglet des Régions, 2 gardiens avec éruption et lianes).
  - **Mode difficile** (étoiles noires) : les 40 niveaux, ennemis +45 % PV et +20 % ATQ, sous le blizzard.
  - **Gardien de la semaine** : il revient chaque semaine, plus fort à chaque défaite.
  - **Blizzard** (35 % des combats du Grand Nord, toujours dans le chapitre 3 et en difficile) : des orbes sont voilées un tour sur deux.
  - **Équipement de froid** ❄️ (40 % des objets trouvés là-bas) : +15 % d'attaque et −15 % de dégâts reçus dans le Grand Nord.
  - **Faune apprivoisable** : une bête du Grand Nord affaiblie peut être purifiée et rejoint la meute sous forme de mammifère.
  - **Expéditions vers le Grand Nord** (cristaux et ambre), **aurore boréale** animée sur l'écran, **vent glacé** en fond sonore, **bestiaire du Grand Nord** avec récompenses à 50 % et 100 %.
- Correctif : la puce de mécanique d'une région n'affiche plus « Ptérosaures +30 % » pour une mécanique inconnue.
- 6 succès, entrées du guide.
- Tests : `test_nest2` (21 vérifications) et `test_far2` (18 vérifications), vrais clics. 58 suites.

## 0.36.0 — Progression : éveil ultime, prestige, objectifs et conseils
- **Niveau maximum 100**, porté à **120** par l'**éveil ultime ★★★★★★** (après ★5 : 25 🟠, 25 💎, 200 🔮, 60 🦴). **Auras d'éveil** sur les portraits (couronne à ★5, étoile à ★6).
- **XP** : les dinos hors équipe gagnent 10 % de l'XP des combats (entraînement passif), ceux 5 niveaux sous la moyenne de l'équipe le double (rattrapage), ceux entre les niveaux 40 et 60 +20 % (creux de la courbe) ; **partage réglable** (équitable, priorité au plus faible, priorité au chef) ; **baies 🫐 et viande 🍖** trouvées en combat à donner directement (+60 / +250 XP).
- **Progression du dresseur** (Accueil) : **récompenses de rang** (tous les 5 rangs, plus grosses tous les 10 et 25), **arbre du dresseur** (Vigueur, Férocité, Prospection, Savoir : 1 point tous les 5 rangs), **prestige** (après l'histoire 100 : l'histoire recommence contre +10 % d'XP et de pierres et +2 points d'arbre, jusqu'à 5 fois).
- **Objectifs et progression** (Accueil) : **conseil « quoi faire ensuite »**, **objectifs sur 30 jours** (avec un grand coffre), **paliers de puissance** (chaque palier ouvre un **défi de puissance**), **connexion du mois** (paliers de 5 à 25 jours), **maîtrise d'espèce** (100 victoires → « Maître des … »), **graphique de puissance** jour par jour, **résumé de la semaine passée**, **cadeau de retour** après 3 jours d'absence ou plus, **bonus de 1re victoire du jour** (+150 🪨 +12 🔮 +1 🎟️).
- **Maîtrise des niveaux** : un niveau d'histoire gagné sans perdre de PV est marqué 💎 sur la carte (+5 🔮 la 1re fois).
- **Éveil** : à partir de ★3, il faut aussi des **jetons de la famille** du dino (1 par victoire où la famille combat ; 10 offerts par famille) ; **âmes d'espèce** : chaque dino recyclé laisse une âme, 5 âmes = +1★ pour un dino de cette espèce.
- **Lisibilité** : la défense indique combien elle bloque par coup ; la barre du haut affiche le **niveau moyen de l'équipe** au lieu de « ⚔ puissance » (la puissance reste dans l'infobulle).
- **Plafond contre les cumuls absurdes** : au-delà de ×4 (PV) et ×3,5 (attaque) des stats de base du niveau, l'excédent ne compte qu'au tiers (un dino « tout au maximum » reste sous ×5, vérifié par test). Sans effet sur les mesures d'équilibrage habituelles.
- 6 succès, entrées du guide.
- Tests : `test_progress` (19 vérifications) et `test_progress2` (24 vérifications), vrais clics. 56 suites.

## 0.35.0 — La collection : nouvelles familles, style, albums et mythiques
- **Deux nouvelles familles jouables** : 🦣 **Mammifères** (Mammouth laineux, Smilodon, Mégacéros, Mégathérium, Ours des cavernes) et 🪲 **Insectes** (Arthropleura, Meganeura, Titanomyrma, Mante géante), avec leurs portraits, leur effet de chef (Charge de horde, Nuée), leur super (Piétinement : +20 % et étourdit ; Essaim : poison 3 tours) et leurs liens (Horde, Essaim).
- **4 nouvelles variantes** : Fossile, Cristal, Lave, Spectral (environ 1 % chacune).
- **Sur chaque carte** : ✏️ surnom, ⭐ favori (épinglé en haut de la collection), 🔒 verrou (empêche le recyclage), ⚖️ comparaison avec un autre dino, 💕 **affection** (monte à chaque victoire ensemble : 4 niveaux, jusqu'à +4 % de PV et d'attaque, avec une réplique), 📊 statistiques d'utilisation (combats, victoires, K.O.).
- **Galerie & style** : vue 3D du dino qui suit la souris, **6 couleurs** et **6 accessoires** (collier, casque, selle, couronne, écharpe, lunettes ; 30 🔮 pour débloquer chacun), visibles en combat ; **taille réelle** comparée à un humain et **faits scientifiques** (aussi dans la fiche « Comment le jouer »).
- **Portraits vivants** (respiration au repos) et **cri de chaque famille** (son synthétisé) quand on touche un portrait.
- **Collection** : filtres par famille, élément, compétence et passif ; tris par gènes, génération, affection ou favoris ; **recyclage intelligent** (garde le meilleur exemplaire de chaque espèce et tout ce qui est protégé) ; **statistiques de collection** (raretés, familles, variantes) ; **albums par famille** (récompense quand une famille est complète) ; 📸 **mode photo** (ton équipe dans un décor au choix, image PNG).
- **Boutique saisonnière** (collection et événements) : 4 espèces de saison (Citrouillosaure en automne, Givrosaure en hiver, Fleurosaure au printemps, Solarosaure en été), 120 🧩 pendant leur saison, 300 🧩 le reste de l'année ; jamais tirées en invocation.
- **3 dinos mythiques** obtenus par des quêtes (Wyrm de la Graine, Roi des Abysses, Premier Croc).
- **Évolutions** : une **2e branche** pour les espèces qui évoluent (autre espèce de même famille et même rareté, mêmes conditions) et des **évolutions par fossile rare** (Mégacéros ou Mégathérium → Mammouth, Titanomyrma → Arthropleura, Meganeura → Mante géante, Smilodon → Ours des cavernes, Compsognathus → Raptor). Fossiles rares : fossile légendaire des fouilles, 1 chance sur 10 sur un boss.
- 100 espèces en tout. 6 succès, entrées du guide.
- Tests : `test_collect` (17 vérifications) et `test_collect2` (25 vérifications), vrais clics ; 4 anciens tests mis à jour (nombre d'espèces). 54 suites.

## 0.34.0 — Nouveaux modes de jeu et mini-jeux
- **Écran « Modes »** (Aventure > Modes) :
  - 🔥 **Survie** : vagues infinies avec une seule équipe ; les PV restent d'une série à l'autre (+10 % entre deux séries), gardien toutes les 5 séries, récompense selon le nombre de séries, record personnel.
  - ⏱️ **Sprint** : 10 combats d'affilée chronométrés, record personnel, récompense une fois par jour.
  - 🧩 **Combats-énigmes** (8) : plateau imposé et nombre d'actions limité (2 à 7) : trouve le bon ordre.
  - 🪞 **Miroir** : affronte le reflet corrompu de ta propre équipe.
  - 🚫 **Sans orbes** : compétences, super et Garde seulement (toucher une orbe = Garde) ; recharges et super plus rapides.
  - 🎯 **Entraînement** : un mannequin qui ne riposte pas, avec compteur de dégâts (total, moyenne, meilleur coup).
  - 📖 **Découverte** : l'histoire de l'île en 10 niveaux courts.
- **Aventures de la semaine** : 🗺️ **expédition dans le brouillard** (une carte 5×5 par jour, case par case : combats, coffres, sources, gardien au bout), 🐾 **traque** (3 pistes puis le dino rare de la semaine à apprivoiser), 🏆 **tournoi** (quarts, demies, finale contre des équipes de vrais dinos, élimination directe).
- **Mini-jeux** : 🏁 **course de dinos** (réflexes : clique ou appuie sur Espace dans la zone verte, 3 courses par jour) et 🎣 **pêche dans les abysses** (ferre au bon moment, 7 poissons à collectionner, 5 lancers par jour, dès l'histoire 50).
- **En combat** : 💠 **apprivoisement** (un dino corrompu, hors boss, à moins de 15 % de PV peut être purifié : 30 🔮, 60 % de réussite, 3 fois par jour ; il rejoint ta meute) et 🔁 **revanche** (après une défaite, rejoue le combat avec le même tirage : mêmes orbes et mêmes coups du sort tant que tu joues pareil).
- **Arène par saisons** (2 semaines) avec 6 ligues (Bronze, Argent, Or, Platine, Diamant, Légende) : récompense de fin de saison selon la meilleure ligue atteinte, puis classement ramené à mi-chemin de 1000.
- 🗓️ **Défi de la semaine** (écran du Défi du jour) : deux règles du Défi du jour à la fois (+5 🎟️ +50 🔮 +15 🧩).
- **Fouilles** : 🖌️ pinceau (voir le contenu d'une case sans la creuser, 3 par jour) et 🧨 dynamite (une croix de 5 cases pour 3 pioches).
- 9 succès, entrées du guide.
- **Équilibrage** (simulation seulement, robot qui choisit la meilleure orbe, 10 essais par mesure) : énigmes 70 à 100 % pour 6 d'entre elles avec une équipe niveau 30 ; les 2 plus dures ont été adoucies (10-30 % avant) ; Survie : 3 à 5 séries (équipe niveau 30 à 50) ; Miroir, Sans orbes, Sprint et Découverte : 100 % avec une équipe adaptée. À valider avec de vrais joueurs.
- Tests : `test_modes2` (20 vérifications) et `test_modes3` (26 vérifications), vrais clics. 52 suites.

## 0.33.0 — Le camp, le monde et de nouvelles régions
- **Camp de base** (Quêtes > Camp, dès le niveau 3 de l'histoire) : tes dinos s'y promènent autour du feu.
  - **5 bâtiments** à construire puis améliorer (niveaux 1 à 5, pierres + os + peaux) : 🛡️ Palissade (+2 % de PV par niveau pour tous tes dinos), 🍖 Garde-manger (+2 % d'attaque par niveau), ⛏️ Carrière (+25 🪨 par heure et par niveau) et 📚 Bibliothèque (+1 🔮 par heure et par niveau), à récolter (jusqu'à 12 h d'avance), 🪺 Couveuse (incubation du Nid −6 % par niveau).
  - **Habitants** : 🧑‍🔬 le Dr Elara t'écrit **une lettre chaque semaine** avec une question ; ta réponse choisit le cadeau. 🧢 **Kael, ton rival**, revient tous les 10 niveaux d'histoire (10 manches) avec une équipe de vrais dinos qui progresse (rares puis épiques puis légendaires, compétence ennemie dès la manche 3) ; tu peux **parier** des pierres (gagné : mise doublée et récompense ×1,5). 🧕 **Mira la marchande** propose 3 offres par semaine. 👴 **Oto le vieux chercheur** confie une **quête en 8 carnets** (combats, boss, camp, invocations, chasses, Nid, rival).
  - 3 succès (« Bâtisseur », « Rival respecté », « Les carnets d'Oto »), rappels dans « À faire », pastille sur l'onglet.
- **Le monde** :
  - 🌍 **Carte du monde** (Aventure > Monde) : l'île, le Cauchemar, le Grand Nord, le Labyrinthe, le camp et l'archipel volcanique (bientôt), avec la progression de chaque région ; un clic pour s'y rendre.
  - 🌙 **Jour et nuit réels** : de 20 h à 6 h, des créatures nocturnes (chauves-souris, loups, araignées, yeux) remplacent parfois les premiers ennemis, le décor s'assombrit et chaque victoire rapporte +3 🔮.
  - 🍂 **Saisons réelles** : feuilles d'automne, neige en hiver, pétales au printemps, lucioles en été, sur les combats et la carte.
  - 📜 **Résumés du narrateur** pour chaque chapitre battu, **épilogues** des régions terminées (île, Cauchemar, Grand Nord, Labyrinthe, Graine) et **3 fins** selon tes réponses aux lettres d'Elara et tes exploits (le gardien, le savant, le dresseur légendaire), dans le journal.
  - 📖 **Histoire de chaque espèce** dans la fiche « Comment le jouer », lisible quand un dino de l'espèce atteint le niveau 30.
  - 🔐 **Énigmes d'Oto** (6) : les fouilles révèlent leurs lettres ; réponds quand tu veux (+2 🎟️ +20 🔮).
  - 🏺 **Journal des découvertes** : 12 artefacts à trouver dans les fouilles et sur les boss (collection complète : +5 🎟️ +50 🔮 +5 💎). 🌱 **Archives de la Graine** : une page tous les 5 succès.
  - 🎬 **Cinématique d'introduction** en 5 cases pour une nouvelle partie (à revoir depuis le journal ; « Passer » à tout moment, coupée avec les dialogues).
  - 🎪 **Événement du jour sur la carte** de l'histoire : marchand ambulant, dino blessé, coffre échoué, œuf perdu, chacun avec un choix.
  - 3 succès (« Archéologue », « Esprit vif », « Oiseau de nuit »), entrées du guide.
- **Nouvelles régions** (Aventure > Régions, 5 onglets, carte à chapitres avec étoiles et gardiens nommés) :
  - 🌋 **Chapitre 5 : l'archipel volcanique**, niveaux 101 à 150 après l'histoire, 5 gardiens (Roi des Cendres, Hydre de magma, Titan d'obsidienne, Phénix noir, Cœur de l'archipel) avec l'éruption.
  - 🏜️ **Les Badlands** (dès l'histoire 30, 20 niveaux) : tous les 3 tours, une tempête de sable cache un tiers des orbes (elles frappent quand même, mais à l'aveugle).
  - 💎 **Les grottes de cristal** (dès l'histoire 60, 20 niveaux) : dans le noir, seule une moitié des orbes est éclairée à chaque tour.
  - ☁️ **Les îles célestes** (dès l'histoire 80, 20 niveaux) : les ptérosaures frappent 30 % plus fort ; tous les 4 tours, une rafale mélange les orbes.
  - ♾️ **Nouvelle partie +** (après l'histoire) : les 100 niveaux de l'île avec des ennemis bien plus forts, des récompenses ×1,5 et des dialogues différents (Kael, Elara, Oto, Mira… et la Graine).
  - Elles apparaissent sur la carte du monde ; 3 succès (« Explorateur », « Grand voyageur », « Recommencement »).
- **Équilibrage** (simulation seulement, 20 combats par mesure) : régions avec une équipe éveillée et forgée au niveau conseillé : 95 à 100 % partout (Badlands, grottes, îles célestes, archipel jusqu'au niveau 150, Nouvelle partie + jusqu'au niveau 100) ; le robot voit les orbes cachées, un vrai joueur aura plus de mal dans les Badlands et les grottes. Kael 100 % aux manches 1 et 3 (équipe non éveillée), 90 % à la manche 5 et 85 % à la manche 10 avec une équipe éveillée et forgée à son niveau, 5 % à la manche 5 sans éveil. Les bâtiments du camp renforcent l'équipe (jusqu'à +10 % de PV et d'attaque) : non pris en compte dans les simulations.
- Tests : `test_camp` (24 vérifications), `test_world` (29 vérifications) et `test_regions` (21 vérifications), vrais clics ; `test_enemy_skills` rendu indépendant du gel aléatoire des orbes, nombre d'onglets mis à jour dans `test_nav` et `test_exped`. 50 suites.

## 0.32.0 — Boss de zone, nouvelles créatures et chasses
- **Mécanique de boss par zone** (histoire et donjons) : 🌿 **Lianes** dans la jungle (tous les 3 tours, 3 orbes sont enlacées ; une orbe 🌿 les libère toutes, toucher une orbe enlacée l'arrache mais coûte un tour), 🔷 **Bouclier runique** dans les ruines (seule la couleur de la rune frappe fort, ×0,6 sinon, l'estimation des orbes en tient compte ; la rune change tous les 3 tours), 🌋 **Éruption** au volcan (−6 % de PV pour toute l'équipe tous les 3 tours), 🦑 **Saisie** à l'obélisque (un dino est pris tous les 4 tours : pas de compétence, −4 % de PV par tour ; 2 orbes de l'élément qui bat le boss le libèrent).
- **Boss corrompus du Cauchemar** : deux mécaniques à la fois (celle de la zone et la suivante).
- **Parties à viser** : Mâchoire et Queue (20 % des PV du boss chacune), boutons sous le boss. Mâchoire brisée : attaque du boss −20 % ; Queue brisée : plus d'attaque de zone. Les dégâts portés à une partie comptent aussi pour le boss.
- **Mise en scène** : entrée en scène du boss (bandeau « ⚠ BOSS »), répliques dans une bulle au début et à chaque phase, décor qui s'assombrit en phase 2 puis 3.
- **10 nouvelles créatures dessinées** dans l'histoire (35 % des premières vagues) : Arthropleura 🐛 et Meganeura 🦟, Quetzalcoatlus 🦅 (jungle), ammonite 🐚 et trilobite 🦐 géants, scorpion de mer 🦞 (ruines), Gorgonopsien 🐆 et Andrewsarchus 🐷 (volcan), Dunkleosteus 🐟 et Platybelodon 🐘 (obélisque). Elles ont leur fiche dans le bestiaire des créatures (49 entrées avec la Graine originelle).
- **Ennemis rares** : 💰 **ennemi doré** (1 %, PV ×2,5 ; vaincu : +300 🪨, +30 🔮, +1 🎟️), 📣 **meneur** (dès le niveau 15, 10 % : appelle des renforts qui frappent en plus pendant 3 tours), **double trait** dès le niveau 80 (une carapace en plus), **élites nommés** en dernière vague (Croc-de-Fer, Œil-Rouge…).
- **Chasses** :
  - 🐾 **Mini-boss errant du jour** : il rôde près d'un niveau déjà terminé de l'histoire (visible sur la carte et dans un panneau « Traquer ») ; récompense une fois par jour (+1 🎟️, +15 🔮, pierres, 1 chance sur 2 d'un objet).
  - 💀 **Boss secret de chaque chapitre** (10 boss nommés : Spectre des Fougères, Mère des Lianes… Le Dernier Écho) : il se réveille quand les 10 niveaux du chapitre ont été gagnés sans perdre de dino (les niveaux déjà à ★★★ comptent). Il a la mécanique de boss de sa zone. Première victoire : +5 🎟️, +20 🧩, +50 🔮, +5 💎 et un objet.
  - ⚔ **Duel de champions** (Arène) : un seul de tes dinos, choisi au début, affronte le champion du jour (7 champions corrompus, un par jour) ; les deux autres restent sur la touche. 3 essais par jour, victoire : +2 🎟️ +25 🔮.
  - 👹 **Raid en 3 phases** sur la semaine : à 34 % puis 67 % de PV détruits, le boss change d'élément et frappe plus fort (+20 %, puis +45 %). La phase s'affiche dans l'écran du Raid et en combat.
  - 🌱 **La Graine originelle**, boss final secret : elle se réveille après l'histoire (100) et le Grand Nord (40), dans le Grand Nord. Deux mécaniques de boss à la fois (lianes + éruption), sprite dessiné, épilogue du Dr Elara. Première victoire : +10 🎟️, +50 🧩, +100 🔮, +20 💎, +10 🟠 ; ensuite une récompense par semaine.
  - 4 succès (« Chasseur d'errants », « Sans une égratignure », « Champion des champions », « Gardien de la Graine »), entrée du guide.
- Correctif : dans les combats de mode (Tour, Arène, Événements, Grand Nord…), l'ouverture du chef (0.31) était appliquée deux fois (saignement et bonus de PV doublés, message répété).
- Première victoire contre une créature : +10 🔮. Succès « Chercheur d'or », entrées du guide.
- **Équilibrage** (simulation seulement, histoire, 20 combats par mesure) : équipe éveillée et forgée 100 % à tous les niveaux mesurés (5 à 100) ; équipe non éveillée 100 % jusqu'au niveau 30, 60 % au 50, 25 % au 70, 5 à 15 % au 100 (0.31 : 90 % au 50, 40 % au 70) : les boss demandent davantage d'éveiller et de forger son équipe. Un premier réglage rendait le boss de la jungle (niveau 20) trop dur (30-40 %) : les lianes coûtent maintenant un tour au lieu de bloquer, et le bouclier runique est passé de ×0,4 à ×0,6. Chasses (20 combats par mesure) : errant 100 % avec une équipe éveillée à son niveau (45 % non éveillée au niveau 50) ; boss secrets 55 à 100 % (équipe éveillée) ; duels 95-100 % avec un dino éveillé, 0 à 100 % sans éveil selon l'espèce ; Graine originelle 55 % avec une équipe éveillée et forgée niveau 60, 100 % au niveau 70. À valider avec de vrais joueurs.
- Tests : `test_bosses` (18 vérifications), `test_foes2` (11 vérifications) et `test_hunts` (28 vérifications), vrais clics ; `test_codex`, `test_far`, `test_bestiary` et `test_attack_fx` adaptés aux nouvelles créatures. Le robot des simulations évite les orbes enlacées, comme un joueur. 47 suites.

## 0.31.0 — Maîtrise, talents et nouvelles compétences
- **Maîtrise des compétences** : chaque compétence progresse en l'utilisant (niveaux 1 à 5 à 10, 30, 60 et 100 utilisations) : +5 % de dégâts par niveau, recharge −1 au niveau 5. Le niveau s'affiche sur le bouton et la fiche.
- **2e compétence à l'éveil ★★★** : à choisir parmi les compétences de la famille du dino. Elle a son propre bouton et sa propre recharge en combat (touches Q, S, D).
- **5 nouvelles compétences** (aussi proposées en 2e compétence) : 📯 Cri de meute (−2 tours de recharge aux alliés), 🦖 Appel du petit (un petit allié frappe 3 tours), 🧛 Morsure vampirique (dégâts + soin de l'équipe), 🗯️ Défi (attire les coups 2 tours et renvoie 40 %), 🌟 Pluie d'or (la couleur d'orbe la plus faible devient dorée, +10 % de super).
- **Arbre de talents** : 1 point tous les 10 niveaux à répartir entre Attaque (+2 % d'ATQ par rang), Défense (+3 % de PV) et Soutien (+1 % de super par orbe), 5 rangs par branche, réinitialisation gratuite. Le même écran règle l'**auto-combat** pour ce dino (en priorité, normal, jamais).
- **Ouverture du chef** : chaque combat commence par un effet de la famille du chef (embuscade, charge d'ouverture, formation tortue, hérisson, repérage, pas lourd, chœur, ressac).
- **Terrain natal** : +10 % d'attaque pour un dino dans le terrain de son élément (jungle 🌿, volcan 🔥, ruines et toundra 💧, obélisque et abysses ⚡).
- **Paliers aux niveaux 20, 40 et 60** : +3 % de PV, +3 % d'attaque, puis +4 % des deux.
- **Super prismatique** : avec 3 éléments différents dans l'équipe, la super frappe 20 % plus fort.
- **Soins ciblés** : clique sur le portrait d'un de tes dinos (liste sous la scène) pour diriger vers lui la Régénération.
- **Compétences légendaires mises en scène** (bandeau avec le portrait), **fiche « Comment le jouer »** sur chaque dino (rôle, orbes, compétence, passif, rôle de chef, terrain natal).
- 2 succès (« Maître d'armes », « Arbre de vie »), entrées du guide.
- **Équilibrage** (simulation seulement, histoire, 20 combats par mesure) : avec des équipes neuves (sans talents ni maîtrise accumulée), pas d'écart au-delà du bruit (non éveillée : 90 % au niveau 50, 40 % au niveau 70 ; éveillée et forgée : 95 à 100 %). Les talents et la maîtrise rendront les équipes entraînées plus fortes : à surveiller avec de vrais joueurs.
- Tests : `test_mastery` (15 vérifications), `test_skills3` (16 vérifications), vrais clics ; 5 anciens tests adaptés (ouverture du chef, nouvelles compétences, effets visuels, course de timing de l'auto-combat). 44 suites.

## 0.30.0 — Combat : duos d'ennemis et grand plateau de 16 orbes
- **Duos d'ennemis** (30 % des combats d'histoire dès le niveau 20, du Grand Nord et du Cauchemar) : les deux premiers ennemis arrivent ensemble et attaquent tous les deux à chaque tour, le second décalé d'un tour dans le cycle des attaques puissantes. **Clique sur l'autre ennemi** (clic gauche ou droit) pour le viser, sans perdre ton tour ; un 🎯 marque la cible. Quand l'un tombe, on continue contre l'autre, puis vient la dernière vague. Compensation : PV ×0,9 et attaque ×0,7 pour les deux.
- **Grand plateau de 16 orbes** (4×4) dans le Cauchemar, le Grand Nord et la Tour dès l'étage 30 : plus de choix. Le boost d'orbes compte les orbes de même couleur ramenées à un plateau de 9, pour garder la même force (8 orbes sur 16 comptent comme 5 sur 9).
- Les boutons Aide, Garde et Fuir tiennent sur une ligne. Correctifs : le terrain (0.29) est maintenant choisi pour le vrai mode du combat (Cauchemar, Grand Nord…) et non pour le combat d'histoire qui sert de base ; ni duo ni terrain dans le Défi du jour et le Raid. Trois anciens tests rendus indépendants du hasard des duos, terrains et faiblesses.
- **Équilibrage** (simulation seulement, histoire, 20 combats par mesure) : avec les duos, équipe non éveillée 90 % au niveau 50 et 65 % au niveau 70 (75 % et 25 % sans duo). Ces mesures varient beaucoup d'une simulation à l'autre (25 à 65 % au niveau 70 selon les essais) ; l'équipe éveillée et forgée reste à 100 %. À valider avec de vrais joueurs.
- Tests : `test_combat4` (15 vérifications, vrais clics). 42 suites.

## 0.29.0 — Combat : états, faiblesses, terrains et objets à ramasser
- **États infligés par les orbes** : 🔥 Brûlure (orbe rouge avec avantage, 20 % : −3 % de PV par tour pendant 3 tours), 🧊 Gel (orbe bleue avec avantage, 12 % : l'ennemi saute son tour), 🩸 Saignement (orbe verte avec avantage, 20 % : −2,5 % par tour), 😱 Peur (orbe violette, 15 % : l'ennemi frappe 25 % moins fort pendant 2 tours). Effets moitié moins forts ou moins fréquents sur les boss.
- **Résistances** : un ennemi de feu ne brûle pas, un ennemi d'eau ne gèle pas ; les golems, squelettes, méduses et cristaux ne saignent pas ; les morts-vivants et golems n'ont pas peur ; les bêtes de la toundra ne gèlent pas.
- **Faiblesse de chaque créature** : une famille de dinos lui inflige +25 %. Elle est révélée après avoir vaincu la créature une fois (puce dans le combat, fiche, bestiaire des créatures).
- **Fiche d'ennemi** : clique sur l'ennemi pour voir ses PV, son attaque, sa rage, sa faiblesse, ses résistances, son trait, sa compétence, ses états et le terrain.
- **Terrains** (30 % des combats d'histoire, de donjon, d'événement, de Tour, du Grand Nord, du Cauchemar et du Labyrinthe) : Boue (🌿 +20 %, 🔥 −10 %), Coulée de lave (🔥 +15 %, tout le monde perd 2 % de PV par tour), Sol gelé (💧 +20 %, Gel deux fois plus fréquent), Brume (⚡ +20 %, Peur deux fois plus fréquente). Ils se voient sur la scène.
- **Objets qui tombent pendant le combat** (12 % par tour ennemi, 3 tours pour les ramasser, sans perdre son tour) : 🪶 plume (+15 % de super), 🍖 viande (soigne le dino le plus blessé de 12 %), 💎 éclat (la prochaine orbe ×1,5). L'auto-combat les ramasse aussi.
- Le haut de l'écran de combat est plus compact (frise, rage et objet sur une ligne). Succès « Pilleur de terrain », entrée du guide.
- **Équilibrage** (simulation seulement, histoire, 20 combats par mesure, avec et sans ces nouveautés) : pas d'écart au-delà du bruit de mesure (équipe non éveillée au niveau 50 : 75 % contre 65 % ; niveau 70 : 25 % contre 50 % ; éveillée et forgée : 100 % partout). Pas de nouveau réglage.
- Tests : `test_combat3` (23 vérifications, vrais clics). 41 suites.

## 0.28.0 — Combat : super de famille, Ruée, Garde et rage ennemie
- **Super attaque renforcée** (×1,7) : elle ne faisait que 1,1 à 1,4 fois les dégâts de la meilleure orbe. Elle ajoute maintenant **un effet selon la famille du chef** : Saignement (théropodes, 3 tours), Brise-carapace (cératopsiens, +15 %), Rempart (ankylosaures, −50 % de dégâts 2 tours), Épines (stégosaures, 30 % renvoyés), Piqué (ptérosaures, +25 % de jauge), Séisme (sauropodes, étourdit), Chant de harde (hadrosaures, soin 15 %), Raz-de-marée (reptiles marins, retire le trait de l'ennemi et soigne 10 %). L'effet est écrit sur le bouton de super, et la jauge s'anime à partir de 90 %.
- **Ruée** : la 3e orbe de la même couleur d'affilée frappe ×1,3 et rend 10 % de super (les orbes qui la déclenchent brillent).
- **Coup final** : achever un ennemi avec l'élément qui le bat rend 20 % de super.
- **Rage ennemie** : frapper sans l'élément qui bat l'ennemi le met en rage (+20), l'élément avantageux le calme (−10). Pleine, sa prochaine attaque fait ×1,5 (FURIE).
- **Garde** (bouton ou touche G) : on passe son tour sans dégâts ni super ; le prochain coup ennemi est divisé par deux et le plateau d'orbes change.
- **Frise des 4 prochains tours ennemis** (attaque, attaque puissante ou de zone, compétence, étourdi, furie), **recharge des compétences en cercle**, **infobulles chiffrées** sur les orbes (dégâts estimés, avantage, Ruée) et les compétences.
- **Équilibrage** (simulation seulement, histoire, 20 combats par mesure) : ces nouveautés rendaient le jeu plus facile (équipe non éveillée au niveau conseillé : 100 % au niveau 50 au lieu de 65 %, 65 % au niveau 70 au lieu de 20 %). Compensation : les ennemis ont 15 % de PV en plus (`C2_EHP`, appliqué à chaque nouvel ennemi, sauf le boss du Raid). Avec elle : équipe non éveillée 100 % au niveau 50 et 25 % au niveau 70 ; équipe 6 niveaux en dessous 70 % au niveau 30 et 10 % au niveau 50 (65 % et 5 % avant) ; équipe éveillée et forgée : 100 % partout, comme avant. Un autre réglage (super ×1,4, PV +8 %) a été écarté. Les autres modes n'ont pas été remesurés. À valider avec de vrais joueurs.
- Succès « Furie maîtrisée », entrée du guide.
- Tests : `test_combat2` (24 vérifications : effet de chaque famille, Ruée, Coup final, rage, Garde par un vrai clic et la touche G, frise, infobulles). 40 suites.

## 0.27.0 — Mon dresseur : pseudo, apparence et carte de profil
Clique sur ton avatar en haut à gauche (ou Accueil > Profil) pour créer ton dresseur.
- **Pseudo** (3 à 16 caractères) et **nom de ton île**. Le pseudo s'affiche dans la barre du haut, sur l'accueil (« Bienvenue, … »), dans le classement de l'Arène, et remplace « survivant » dans les dialogues de l'histoire. Un rappel « À faire » invite à le choisir.
- **Apparence du dresseur**, dessinée par le jeu : 6 couleurs de peau, 6 coiffures, 8 couleurs de cheveux, 6 tenues, 8 couleurs de tenue, 7 accessoires, 6 décors, et un bouton « au hasard ». Des pièces se débloquent en progressant : armure d'os (histoire 30), cape d'ombre (Cauchemar 10), manteau de fourrure et combinaison de plongée (Grand Nord 10 et 21), aurore boréale (Grand Nord 40), casque de l'arène (10 victoires), plume (un œuf éclos au Nid), couronne de la Graine (histoire 100).
- **Emote de victoire** (8, dont 2 à débloquer) : ton dresseur la lance sur l'écran de victoire.
- **Compagnon** : un dino de ta collection qui sautille à côté de toi sur l'accueil et figure sur ta carte.
- **Carte de dresseur en image** (PNG) : avatar, pseudo, titre, île, chiffres clés et équipe. **Photo de groupe** après chaque boss vaincu.
- Succès « Un nom pour l'histoire », entrée du guide. Dans l'application Windows, l'enregistrement d'une image ouvre la fenêtre « Enregistrer l'image » (non testé à la main sous Windows : seule la construction automatique l'a lancé).
- Tests : `test_player` (21 vérifications, vrais clics, PNG vérifié). 39 suites.

## 0.26.0 — Le Nid d'élevage : gènes, mutations et lignées
Quêtes > 🥚 Nid, dès le niveau 15 de l'histoire (2e nid au niveau 40) : élève tes propres dinos.
- **Couvées** : deux dinos de la même famille (niveau 10 ou plus) pondent un œuf. Le petit est de l'une des deux espèces et naît au niveau de la moitié du plus faible des parents. Incubation de 20 min (commun) à 6 h (légendaire), qui continue jeu fermé ; on peut l'accélérer avec de l'essence (1 🔮 par quart d'heure restant). Coût en cuir, os, ambre et cristaux selon la rareté. Les parents veillent sur l'œuf jusqu'à l'éclosion. Les 4 gardiens du Grand Nord ne pondent pas.
- **Gènes 🧬** : chaque point donne +2 % de PV ou d'ATQ (5 au plus par statistique, soit +10 %). Le petit hérite du meilleur parent à 70 %. **Mutation** : +1 point (20 %, 35 % si les parents sont de la même espèce) : lignée après lignée, les gènes s'accumulent. **Variante** : 20 % d'hériter de celle d'un parent (Alpha, Ombre, Albinos, Doré, Prismatique), sinon 3 % de variante spontanée. **Générations** affichées (G2, G3…).
- **Empreinte 🤲** : le petit gagne +3 % de PV et d'ATQ à chacune de ses 3 premières victoires dans l'équipe.
- Éclosion mise en scène comme une invocation (« UN PETIT EST NÉ ! », gènes, mutation), œufs qui bougent puis sautent quand ils sont prêts, ligne des gènes sur les fiches des dinos, « Tes meilleures lignées », badge et rappel quand un œuf est prêt, 4 succès (dont le titre « Grand éleveur »), missions quotidienne et permanentes, entrée du guide.
- **4 nouveaux événements de la semaine** (8 en rotation ; celui de cette semaine ne change pas) : **Grand Froid** (créatures de la toundra, cuir), **Saison des amours** (incubation deux fois plus rapide au Nid, œufs à gagner aux épreuves), **Nuit des Abysses** (créatures des profondeurs, cristaux, équipement plus fréquent), **Pluie de météores** (essence doublée). Chacun a son décor.
- **Défi du jour : une règle du jour** en plus du trait, parmi 4 : **Colosse solitaire** (un seul ennemi, qui réunit 80 % des PV des trois et frappe 10 % plus fort), **Surcharge** (super deux fois plus rapide et 25 % plus forte, ennemis +10 % d'ATQ), **Coups critiques** (25 % de chances de ×1,8 pour tout le monde), **Blessures profondes** (aucun soin possible, ennemis −5 % de PV). Puce dans le combat, succès « Maître des règles ».
- **Équilibrage** (simulation seulement, équipe conseillée de 3 théropodes, 20 combats par mesure, 30 pour Surcharge) : niveaux 15 et 35, 100 % avec chaque règle ; niveau 65 : 90 à 100 % ; niveau 95 : 70 à 85 % (90 % sans règle) ; boss 30 : 60 à 95 % (75-80 % sans règle) ; boss 100 : 40 à 60 % (53-60 % sans règle). Un premier réglage a été écarté (colosse ×2,5 PV et +30 % d'ATQ : 0 % dès le niveau 30 ; surcharge +25 % d'ATQ ennemie : 15 à 45 %). Mesure annexe : la super attaque ne fait que 1,1 à 1,4 fois les dégâts de la meilleure orbe. À valider avec de vrais joueurs.
- Tests : `test_nest` (49 vérifications, vrais clics) ; simulation `tests/test_balance_daily.py` ; `test_nav` (6 onglets de Quêtes) et `test_modes` (8 événements) mis à jour. 38 suites.

## 0.25.0 — Le Grand Nord : une nouvelle région au-delà de la mer
Aventure > 🧊 Grand Nord, dès le niveau 50 de l'histoire : la suite pour ceux qui ont fini l'île.
- **40 niveaux en 2 terres** : la **Toundra glacée** (niveaux 1 à 20 : montagnes glacées, sapins enneigés, aurore boréale, neige qui tombe) puis les **Abysses** sous la banquise (21 à 40 : algues, coraux, rayons de lumière, plancton, bulles). Les ennemis sont plus forts qu'à la fin de l'histoire (niveau 52 à 110) et 45 % ont un trait.
- **8 nouvelles créatures dessinées** : mammouth laineux, smilodon, ours des cavernes, oiseau-terreur ; calmar géant, baudroie des abysses, méduse spectrale, mégalodon. Les élites sont des dinosaures corrompus de la région. Le bestiaire des créatures passe à 38 entrées.
- **4 gardiens** (Mammouth ancestral, Smilodon roi, Calmar colossal, Mégalodon abyssal), chacun avec une compétence ennemie et ses dialogues. **Vaincu pour la première fois, chaque gardien rejoint ta meute** : 4 espèces introuvables ailleurs (ni invocation, ni boutique de fragments, ni appel au choix) : Cryostégosaure (épique, Ancrage + Écailles épaisses), Tyran boréal (légendaire, Ruée frénétique + Instinct de meute), Abyssaure (épique, Coup perforant + Embuscade), Mégathalassa (légendaire, Hurlement de terreur + Charognard). 84 espèces au total.
- Carte par chapitres, étoiles et paliers propres (tous les 30 étoiles : 3 tickets, 30 essences, 10 fragments), bouton « niveau suivant », enchaînement automatique, matériaux de la région (peaux et os dans la toundra, cristaux et ambre dans les abysses), tickets aux premières victoires (3 par gardien), équipement sur les gardiens.
- 4 succès (dont le titre « Conquérant du Nord »), mission quotidienne et missions permanentes, rappel dans « À faire », entrée du guide, **journal du Grand Nord** (Succès) pour relire ses dialogues ; le journal de l'île garde ses 14 pages.
- **Combats sans fin évités** : après 40 actions contre le même ennemi, il **s'acharne** (il perd son trait et frappe 20 % plus fort toutes les 5 actions ; puce « ⏳ Acharné »). Trouvé par les tests : une équipe très en dessous du niveau, qui se soigne et se ranime (Cri de ralliement), contre un ennemi Régénérant pouvait faire durer un combat plus de 600 actions. En jeu normal, aucun ennemi n'a tenu plus de 22 actions dans les simulations : la règle ne change pas l'équilibrage. Le Raid garde sa propre limite de tours.
- **Équilibrage** (simulation seulement, 20 combats par mesure) : une équipe conseillée pour le niveau des ennemis (éveil + forge) gagne 95 à 100 % à tous les niveaux, gardiens compris ; l'équipe qui vient de finir le niveau 50 de l'histoire gagne 100 % aux niveaux 1 et 5, puis doit se renforcer (5 % contre le premier gardien, 0 % dès le niveau 20). À valider avec de vrais joueurs.
- Tests : `test_far` (32 vérifications, vrais clics), `test_species2` (+5 vérifications : anti-enlisement), `test_story` (journal) ; simulation `tests/test_balance_far.py` ; les suites qui comptent les espèces, les créatures et les sous-onglets passent à 84, 38 et 9. 37 suites.

## 0.24.0 — La grande migration : 26 nouvelles espèces, 8 compétences, 6 attributs
- **26 nouvelles espèces** (54 → 80), surtout dans les familles qui en manquaient : stégosaures (Huayangosaure, Dacentrurus, Miragaia, Wuerhosaure), cératopsiens (Protocératops, Chasmosaure, Kosmocératops, Titanocératops), ankylosaures (Nodosaure, Euoplocéphale, Zuul), ptérosaures (Rhamphorhynchus, Tapejara, Hatzegopteryx, Tropéognathe), sauropodes (Brachiosaure, Diplodocus, Dreadnoughtus), hadrosaures (Lambéosaure, Edmontosaure, Shantungosaure), reptiles marins (Nothosaure, Liopleurodon, Kronosaure), théropodes (Majungasaure, Yutyrannus). Portraits dessinés par le jeu, 4 nouveaux effets (vague, étoile, feuilles, orage). Chaque famille compte désormais au moins 4 espèces, ce qui ouvre davantage les Épreuves de famille.
- **8 nouvelles compétences** : Ruée frénétique (3 coups), Coup perforant (brise les boucliers), Piétinement (peut étourdir), Hurlement de terreur (l'ennemi perd 35 % d'attaque), Ancrage (attire les coups, −60 % de dégâts), Cri de ralliement (ranime un dino KO), Éclat élémentaire (4 orbes de son élément), Danse de guerre (+20 % ATQ et +25 % de super). Effets visuels, puces d'état dans le combat.
- **6 nouveaux attributs** : Contre-attaque, Charognard, Instinct de meute, Écailles épaisses, Énergie primordiale, Embuscade ; aussi sur les talismans.
- **7 nouvelles chaînes d'évolution** (37 évolutions au total), par exemple Protocératops → Chasmosaure → Kosmocératops → Titanocératops, ou Rhamphorhynchus → Tapejara → Hatzegopteryx → Tropéognathe.
- L'auto-combat sait utiliser les nouvelles compétences (relever un allié KO, s'ancrer avant une attaque puissante…) ; en Arène, les adversaires qui les possèdent utilisent une compétence ennemie équivalente.
- 3 succès (dont les titres « Arche Vivante » et « Encyclopédiste »), entrée du guide.
- **Correctif** : un talisman portant un attribut ajouté par un module chargé plus tard provoquait une erreur au démarrage (affichage du sac).
- Tests : `test_species2` (36 vérifications : effets de chaque compétence et attribut, évolution par un vrai clic, Arène, auto-combat, rechargement) ; `test_skills` joue désormais les 80 espèces. 36 suites.

## 0.23.0 — Épreuves de la meute : toute la collection a enfin un rôle
Aventure > 🏅 Épreuves, dès le niveau 10 de l'histoire : 18 défis à contraintes qui font jouer les dinos qu'on laissait de côté.
- **8 épreuves de famille** : 3 dinos de la même famille (Meute des théropodes, Charge des cératopsiens, Rempart des ankylosaures, Épines des stégosaures, Escadrille des ptérosaures, Pas des colosses, Harde des hadrosaures, Banc des reptiles marins).
- **5 épreuves d'élément** (Fournaise, Marée, Canopée, Tempête, Aube) : 3 dinos du même élément ; pour 🔥 💧 🌿, les ennemis ont l'élément qui les bat.
- **2 épreuves de rareté** : « Les humbles » (communs seulement), « Sans légende » (ni épique ni légendaire).
- **3 règles spéciales**, avec n'importe quelle équipe : sans super attaque, sans compétences, « Contre la montre » (12, 16 ou 20 actions au plus selon le palier ; les compétences ne comptent pas).
- **3 paliers par épreuve** (🥉 bronze niv. 15, 🥈 argent niv. 45, 🥇 or niv. 80), chacun débloqué par le précédent, avec un gardien à la fin ; récompense à la première victoire de chaque palier (jusqu'à 108 tickets au total). Bouton « palier suivant » après une victoire.
- **« Former l'équipe »** met en tête les 3 dinos éligibles les plus puissants ; **« Rétablir mon équipe »** remet l'équipe d'avant. Chaque carte indique si l'équipe est conforme et combien de dinos éligibles tu possèdes.
- 3 succès (dont le titre « Maître des Épreuves »), missions permanentes, entrée du guide.
- **Équilibrage** (simulation seulement, 20 combats par mesure, équipe conseillée pour le niveau du palier) : 100 % à tous les paliers, sauf « Contre la montre » en or (60 %). La difficulté vient surtout de la contrainte : il faut entraîner et éveiller 3 dinos éligibles. À valider avec de vrais joueurs.
- Tests : `test_trials` (28 vérifications, vrais clics) ; simulation `tests/test_balance_trials.py`. 35 suites.

## 0.22.0 — Histoire Cauchemar : l'île corrompue
Une deuxième histoire de 100 niveaux pour la suite de la progression : bouton **🌑 Cauchemar** en haut de l'écran Histoire.
- **Les 100 niveaux sur une île corrompue** : carte et décors assombris, ennemis bien plus forts (niveau des ennemis = niveau × 1,2 + 6). Un chapitre de 10 niveaux s'ouvre quand son gardien a été vaincu en mode normal.
- **Ennemis plus tactiques** : chaque ennemi a un trait (Carapace, Venimeux, Régénérant, Berserker) **et** une compétence (frappe lourde, coup de zone, choc, brûlure, venin, dévoration, coup fatal, rugissement, vol de super, orbes brouillées…), annoncée dans le HUD quelques tours à l'avance : il faut se protéger au bon moment. Les gardiens gardent leurs 3 phases et ont aussi une compétence.
- **Étoiles noires** séparées (★ à ★★★ par niveau) et paliers tous les 30 étoiles.
- **Éclats d'ombre 🌑** : 3 à la première victoire (12 pour un gardien, davantage plus loin), 1 en rejouant ; tickets à la première victoire des niveaux 5, 10, 15…
- **Boutique de l'ombre** : **Rite d'ombre** (le dino de ton choix, sans variante, devient une variante Ombre : ATQ ×1,3), œuf épique, talisman légendaire, tickets.
- Bouton « Cauchemar suivant » après une victoire, enchaînement automatique des niveaux, 4 succès (dont le titre « Seigneur des Cauchemars »), missions quotidienne et permanentes, entrée du guide.
- **Équilibrage** (simulation seulement, 20 combats par mesure) : une équipe au niveau des ennemis (éveil + forge) gagne 100 % jusqu'au Cauchemar 50, 80 % au 70 et 75 % au 100 ; l'équipe qui vient de finir le chapitre normal gagne 100 % au Cauchemar 5 et 95 % au 10, puis il faut la renforcer (0 % dès le 30). Un premier réglage plus dur (40-50 % dès le niveau 50) a été écarté. À valider avec de vrais joueurs.
- Tests : `test_nightmare` (31 vérifications, vrais clics) ; simulation `tests/test_balance_nightmare.py`. 34 suites.

## 0.21.0 — Labyrinthe des reliques (mode rejouable à l'infini)
Nouveau mode inspiré de Slay the Spire et de Hades : Aventure > 🌀 Labyrinthe, dès le niveau 10 de l'histoire.
- **Une course en 3 actes** (Jungle, Volcan, Obélisque). Chaque acte est une carte de 6 étapes à embranchements, puis un gardien 👑. On choisit sa route parmi ⚔️ combats (2 ennemis), 💀 élites (3 ennemis, la dernière avec un trait et une compétence), ❓ mystères, 🏕️ campements, 🛒 marchands et 💎 trésors.
- **Les PV sont conservés** d'un combat à l'autre (par place dans l'équipe) : se soigner au campement ou chez le marchand devient un vrai choix. Fuir garde les dégâts subis ; entre deux actes, l'équipe récupère 30 %.
- **30 reliques** (12 communes, 12 rares, 6 légendaires) qui changent les règles jusqu'à la fin de la course : orbes d'une couleur renforcées, super prête au départ, compétences prêtes, œuf de phénix, avantage d'élément ×1,6, ennemi qui perd son premier tour, combo renforcé, épines, soins après chaque combat… et **5 malédictions**. Relique de départ au choix parmi 3 ; relique au choix après les élites, les gardiens, les trésors et parfois les combats.
- **14 mystères** à choix (source chaude, nid abandonné, autel de sang, meute errante, totem, œuf doré, étoile filante…), certains risqués.
- **Crocs 🦷**, la monnaie de la course, à dépenser chez le marchand : reliques, soins, purification d'une malédiction, herbe de soin pour la sacoche.
- **Fin de course** : pierres, essences, fragments, tickets en cas de victoire, et **marques 🌀** pour une boutique permanente : 6 améliorations du labyrinthe ; tickets, fragments, œuf épique et objet légendaire avec une limite par semaine.
- **11 profondeurs** (0 à 10) : chaque victoire débloque la suivante, avec un modificateur de plus (ennemis plus solides, élite supplémentaire, malédiction de départ…) et davantage de marques.
- Niveau des ennemis : d'après la progression dans l'histoire, ou le niveau de l'équipe s'il est plus élevé.
- Codex des 35 reliques, 4 succès (dont le titre « Seigneur du Labyrinthe »), missions quotidienne et permanentes, entrée du guide, conseil du tutoriel, pastille sur l'onglet quand un choix attend.
- **Correctif** : en Tour, Arène et Événements, la bannière d'ouverture du combat affichait « Niv. N · zone » au lieu du nom du mode.
- **Équilibrage** (simulation seulement, 10 courses par mesure, avec un bot qui joue bien et choisit sa route) : équipe conseillée (éveil + forge), histoire 40 à 100 : 90-100 % de courses gagnées en profondeur 0, 70-90 % en profondeur 3, 40-80 % en profondeur 6, 0-10 % en profondeur 10 ; équipe non éveillée (histoire 40) : 100 % en profondeur 0, 20 % en profondeur 3. Une course gagnée compte environ 13 combats. À valider avec de vrais joueurs.
- Tests : `test_maze` (vrais clics, PV conservés, effets des reliques, mystères, campement, marchand, actes, victoire, défaite, abandon, sauvegarde, boutique, mise en page de 1024×640 à 1920×1080) ; simulation `tests/test_balance_maze.py`. 33 suites.

## 0.20.0 — Chef d'équipe, liens, météo de zone, sacoche de combat
D'après la recherche en ligne sur les systèmes de Dokkan Battle (compétences de chef, liens, objets de soutien) et la météo de Pokémon.
- **Chef d'équipe 🚩** : le 1er dino de l'équipe renforce (PV et ATQ) les dinos de **sa famille** (théropodes, cératopsiens, ankylosaures, stégosaures, ptérosaures, sauropodes, hadrosaures, reptiles marins) **ou de son élément** : Commun +6 %, Rare +9 %, Épique +12 %, Légendaire +15 % ; un tiers pour les autres.
- **Liens 🔗** entre voisins (places 1-2 et 2-3) : même famille → +5 % ATQ (Meute, Troupeau, Escadrille, Banc…), même élément → +5 % PV (Harmonie). Affichés en combat et dans Équipe > Meute.
- **Météo de zone** (Histoire et Donjons) : chaque jour, chaque zone a sa météo — pluie tropicale, brume de spores, vent de sable, pluie de cendres, orage magnétique, aurore boréale ou ciel clair — qui renforce certaines orbes de 20 % (15 % pour l'aurore) et en affaiblit d'autres de 15 %, avec un effet visuel sur la scène (pluie, brume, sable, cendres, éclairs, aurore). L'aperçu des dégâts sous les orbes en tient compte.
- **Sacoche de combat 🎒** : 4 objets fabriqués avec les matériaux (Équipe > Sac) — Herbe de soin (+35 % PV à l'équipe), Tonique de rage (+30 % ATQ pendant 2 tours), Pierre fumigène (l'ennemi perd un tour), Éclat d'orbe (5 orbes de l'élément du chef). Jusqu'à 3 par combat, sans prendre le tour ; une herbe offerte pour commencer.
- 3 succès (Alchimiste, Trousse de survie, Stratège + titre), guide du jeu et tutoriel mis à jour.
- **Équilibrage** (simulation seulement, équipe la plus favorable : 3 théropodes, chef épique, 2 liens) : l'Histoire reste à 100 % pour une équipe conseillée (éveil + forge) ; une équipe non éveillée gagne davantage au milieu du jeu (niveau 50 : 30 % → 70 % ; niveau 70 : 5 % → 25 %), toujours 0 % au niveau 100. En Arène, l'adversaire a aussi son chef et ses liens, et les équipes Redoutable passent à +20 % PV / +10 % ATQ (Équilibré +5 % PV) : avec 3 théropodes, 100 % aux classements 1000 et 1300 et 82,5 % au classement 1700 (40 combats par mesure ; sans ce renfort : 100 %) ; une équipe d'espèces plus puissantes (légendaire + 2 épiques) reste à 100 %. La Tour se renforce de 10 % PV / 6 % ATQ (une équipe conseillée y gagne toujours 95-100 %). À valider avec de vrais joueurs.
- Tests : `test_tactics` (32 vérifications). 32 suites.

## 0.19.0 — Refonte visuelle PC : mise en page, sensations de combat, super attaque façon Dokkan
D'après une recherche en ligne sur le « game feel » des jeux d'action et la mise en scène des gachas (Dokkan Battle et autres).
- **Mise en page PC** : la navigation passe en colonne à gauche (logo, 5 onglets avec survol), le contenu s'élargit (1040 px, 1240 px sur grand écran), l'en-tête met les ressources sur une ligne à droite, « À faire aujourd'hui » et la collection passent en grille. Sur une fenêtre haute (1080 p), la scène de combat et les orbes s'agrandissent.
- **Sensations de combat** :
  - **gel à l'impact** : l'action se fige un instant sur les gros coups (45 ms pour une orbe, 95 ms pour un critique, 150 ms pour la super, 170 ms pour un coup fatal) ;
  - **secousse « trauma »** de la scène, d'autant plus forte que le coup est puissant, avec un amortissement progressif ;
  - **l'ennemi touché clignote en blanc et s'écrase** ; un dino blessé clignote en rouge ;
  - **images d'impact** (négatif contrasté de 55 ms) sur la super attaque et les coups fatals, au plus 3 par seconde ;
  - **étincelles** à la couleur de l'orbe jouée (canvas en mélange additif), plus nombreuses sur les critiques, la super et les coups fatals ;
  - chiffres de dégâts en police **Bangers** (style bande dessinée), critiques en dégradé doré.
- **Super attaque façon Dokkan** : bandes noires, bandeau incliné avec lignes de vitesse, portrait du dino de tête qui surgit et nom de l'attaque selon l'élément (Brasier primordial, Raz-de-marée abyssal, Sève ancestrale, Orage fossile, Aube solaire), puis le coup part. Clic, Espace, Entrée ou Échap pour passer ; aucune autre action possible pendant l'animation.
- **Invocation** : la couleur du cercle annonce la rareté avant le dino, et elle peut « monter d'un cran » pendant l'incantation (une fois sur trois pour une épique, quatre fois sur dix pour une légendaire), avec flash et secousse.
- **Parallaxe à la souris** : les plans du décor de combat et des bannières bougent selon la position de la souris.
- **Cadres légendaires holographiques** : bordure irisée qui tourne et reflet qui suit la souris (collection, résultats d'invocation).
- **Réglages > Affichage** : secousses d'écran, flashs d'impact et animation de super attaque désactivables (désactivés d'office si Windows demande de réduire les animations).
- Tests : `test_juice` (25 vérifications) ; `test_layout` adapté à la navigation en colonne. 31 suites.

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
