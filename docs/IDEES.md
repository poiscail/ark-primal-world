# 500 idées pour améliorer ARK: Primal World

Liste de travail (16/10/2026), classée en 20 thèmes de 25 idées.

**État au 17/10/2026 (version 0.41.0)** : toutes les idées choisies par le joueur ont été réalisées, de la version 0.28 à la
0.41 (le détail est dans le CHANGELOG, version par version), **sauf** :
- 453 · signature de l'exe : il faut un certificat de signature de code payant, au nom de l'auteur ;
- 472 · Discord « joue en ce moment » : il faut créer une application Discord (identifiant client) ;
- 462 · la version **Linux** est construite et testée, la version **macOS** non (signature et notarisation Apple payantes) ;
- 459 · pas de vrai limiteur d'images (Electron ne le permet pas pour une fenêtre normale) : remplacé par l'économie d'énergie ;
- 468 · chargement mesuré (~0,7 s) : rien de lent à différer ;
- 499 · le nom « ARK » (marque de Studio Wildcard) reste à vérifier : c'est une décision de l'auteur, rappelée dans les crédits.
Faites en plus de la sélection : 411 (taille des orbes), 412 (flashs et secousses coupés partout), 413 (rappel de pause). Les idées non choisies (301, 349, 414-447, 454, 500) restent une réserve.
Les idées marquées ⭐ sont celles que je conseillerais en premier (fort effet pour un coût raisonnable).

## 1. Combat : mécaniques (1-25)
1. ⭐ Orbes spéciales sur le plateau : orbe bombe (frappe les 3 vagues), orbe arc-en-ciel (compte pour toutes les couleurs), orbe de soin.
2. Chaînes de couleur : toucher 3 orbes de la même couleur d'affilée déclenche un bonus « Ruée ».
3. ⭐ Ordre de passage visible : une frise indique quand l'ennemi frappera fort (déjà annoncé tous les 3 tours, à rendre plus lisible).
4. Garde : une action « se protéger » qui divise par deux les dégâts du prochain coup ennemi mais ne rapporte pas de super.
5. Changement de dino en combat (remplaçant de 4e place) une fois par combat.
6. Positionnement avant/arrière : le dino de devant reçoit plus de coups mais frappe plus fort.
7. Coup final : achever un ennemi avec une orbe de sa faiblesse donne de la super en bonus.
8. Contre-attaque parfaite : toucher une orbe dans la demi-seconde après une attaque ennemie annoncée réduit les dégâts (option).
9. Faiblesses par ennemi (pas seulement par élément) : affichées après la première rencontre au bestiaire.
10. États de combat supplémentaires : brûlure, gel (saute un tour), saignement, peur (ATQ réduite).
11. Résistances d'ennemis à certains états (un boss de glace immunisé au gel).
12. Bouclier élémentaire ennemi : seul un élément précis peut le briser.
13. ⭐ Vagues à plusieurs ennemis simultanés (2 cibles, choix de la cible par clic).
14. Cible prioritaire : clic droit sur un ennemi pour le viser en premier.
15. Combo d'équipe : si les 3 dinos agissent dans le même tour (compétence + orbe + super), attaque groupée.
16. Jauge de rage ennemie visible qui se remplit quand on le frappe sans élément avantageux.
17. Terrain de combat qui change (boue : orbes vertes renforcées ; lave : brûlure à chaque tour).
18. Objets de terrain qui tombent pendant le combat (ramasser une plume = super +10).
19. Réserve d'orbe : garder une orbe de côté pour l'utiliser plus tard.
20. Plateau 4×4 dans certains modes avancés.
21. Orbes verrouillées par l'ennemi (lianes) qu'il faut libérer.
22. Effets de synergie de famille plus visibles (aura commune quand 3 dinos de la même famille).
23. Attaque groupée des 3 dinos quand la super est pleine et que tous sont vivants.
24. Bonus « sans dégâts subis » en fin de combat (étoile supplémentaire).
25. Mode « tactique » : afficher l'effet précis prévu de chaque orbe au survol (dégâts estimés).

## 2. Super attaques et compétences (26-50)
26. ⭐ Renforcer la super attaque : elle ne fait que 1,1 à 1,4 fois la meilleure orbe (mesuré en 0.26) ; viser ×2 à ×2,5 et rééquilibrer.
27. Super propre à chaque famille avec un effet secondaire (théropodes : saignement ; sauropodes : étourdissement ; reptiles marins : soin).
28. Super « ultime » à 200 % de jauge, avec une coupure plus longue.
29. Niveaux de compétence : chaque compétence monte de niveau en l'utilisant (recharge −1 au niveau 5).
30. Deuxième compétence débloquée à l'éveil ★★★.
31. Compétences de chef qui s'activent au début du combat (bouclier, super à 30 %).
32. Arbre de talents par dino (3 branches : attaque, défense, soutien).
33. Compétences combinées entre deux espèces précises (T-Rex + Raptor : « Chasse en meute »).
34. Compétence passive de zone : bonus quand on combat dans la zone d'origine de l'espèce.
35. Personnaliser l'ordre automatique des compétences pour l'auto-combat.
36. Infobulle de compétence avec les chiffres exacts (dégâts prévus selon l'ennemi actuel).
37. Recharge visible en cercle sur le portrait du dino.
38. Compétences ennemies copiables : vaincre un boss débloque un « parchemin » de sa compétence.
39. Super attaque d'élément mixte quand l'équipe a 3 éléments différents.
40. Compétence « Rugissement » qui réduit la recharge des alliés.
41. Compétence d'invocation : un petit dino allié temporaire (2 tours).
42. Compétence de vol de vie (soigne de 30 % des dégâts).
43. Compétence de provocation améliorée (renvoie une partie des dégâts).
44. Compétences qui interagissent avec les orbes (transformer toutes les orbes rouges en orbes dorées).
45. Animation de chargement de la super plus spectaculaire au-dessus de 90 %.
46. Choix de la cible d'une compétence de soin.
47. Super « relais » : la jauge passe au dino suivant quand un dino est KO.
48. Passifs à paliers (déverrouillés aux niveaux 20, 40, 60).
49. Compétences de rareté Légendaire avec une petite cinématique propre.
50. Fiche « Comment jouer ce dino » avec conseils générés à partir de sa compétence et son passif.

## 3. Ennemis et boss (51-75)
51. ⭐ Boss à mécanique unique par zone (le Kraken saisit un dino, il faut le libérer en 3 orbes bleues).
52. Boss à parties (queue, tête, griffes) qu'on peut viser séparément.
53. Ennemis qui fuient s'ils restent seuls et laissent un butin s'ils sont rattrapés.
54. Ennemis rares « dorés » (1 %) qui donnent beaucoup de butin.
55. Ennemis qui s'appellent des renforts.
56. Boss qui changent de décor à chaque phase.
57. Mini-boss errants sur la carte d'histoire.
58. Ennemis qui volent des orbes du plateau.
59. Ennemis invisibles (révélés par une orbe violette).
60. Ennemis qui se reconstituent sauf s'ils sont achevés par un élément précis.
61. ⭐ 10 nouvelles créatures préhistoriques (Arthropleura, Megalania, Titanoboa géant, Quetzalcoatlus sauvage…).
62. Variantes corrompues des boss pour le mode Cauchemar.
63. Boss secrets débloqués par des conditions (finir un chapitre sans perdre de dino).
64. Duels de champions : un ennemi unique très fort contre un seul dino.
65. Ennemis à traits combinés au-delà du niveau 80 (Carapace + Régénérant).
66. Phrases des boss pendant le combat (bulles courtes).
67. Ennemis qui s'adaptent : ils résistent davantage à l'élément le plus utilisé.
68. Ennemis jumeaux qui se ressuscitent s'ils ne meurent pas le même tour.
69. Boss de raid à plusieurs phases réparties sur la semaine.
70. Ennemis « nids » qui pondent des petits à chaque tour.
71. Animations d'entrée de boss (plan large, nom en grand).
72. Fiche d'ennemi au clic (PV, trait, compétence, faiblesse).
73. Ennemis élites avec une aura et un nom propre généré.
74. Récompense « première fois vaincu » pour chaque créature du bestiaire.
75. Boss final secret après le Grand Nord (la Graine originelle).

## 4. Histoire et monde (76-100)
76. ⭐ Chapitre 5 de l'histoire (niveaux 101-150) : l'archipel volcanique.
77. Personnages secondaires (un rival dresseur, une marchande, un vieux chercheur).
78. Choix de dialogue qui changent une récompense.
79. Journal illustré des découvertes (fossiles, artefacts).
80. Cinématique d'introduction en 5 cases dessinées.
81. Fins multiples selon les choix et les dinos favoris.
82. Lieux à explorer hors combat (camp de base à améliorer).
83. Camp de base visuel où les dinos de l'équipe se promènent.
84. ⭐ Améliorations du camp (forge, nid, bibliothèque) qui donnent des bonus permanents.
85. Quêtes de personnages en plusieurs étapes.
86. Carte du monde globale reliant île, Cauchemar, Grand Nord et futures régions.
87. Cycle jour/nuit réel (ennemis différents la nuit).
88. Saisons réelles (décor d'automne en octobre, neige en hiver).
89. Lettres du Dr Elara reçues chaque semaine (petit texte + cadeau).
90. Histoire de chaque espèce dans le bestiaire (texte débloqué au niveau 30).
91. Énigmes dans les dialogues (code à trouver dans les fouilles).
92. Région désertique (Badlands) avec tempêtes de sable.
93. Région souterraine (grottes de cristal) sans lumière.
94. Région céleste (îles flottantes) pour les ptérosaures.
95. Archives de la Graine : lore débloqué par les succès.
96. Rival qui revient tous les 10 niveaux avec une équipe qui progresse.
97. Événements d'histoire aléatoires sur la carte (marchand ambulant, dino blessé à soigner).
98. Narrateur optionnel pour les résumés de chapitre.
99. Épilogues pour chaque région terminée.
100. Mode « Nouvelle partie + » avec ennemis renforcés et dialogues alternatifs.

## 5. Modes de jeu (101-125)
101. ⭐ Mode Survie : vagues infinies, une seule équipe, PV conservés, classement personnel.
102. Contre-la-montre global : finir 10 niveaux le plus vite possible.
103. Mode Expédition dirigée : carte à explorer case par case avec brouillard.
104. Mode Puzzle : combats prédéfinis à résoudre en un nombre d'actions fixé.
105. Mode Chasse : traquer un dino sauvage rare sur plusieurs combats pour l'apprivoiser.
106. ⭐ Apprivoisement : affaiblir un ennemi dino corrompu puis le purifier pour l'obtenir.
107. Mode Tournoi : 8 équipes simulées, élimination directe.
108. Arène par saisons avec ligues (bronze à légende) et récompenses de fin de saison.
109. Défis hebdomadaires à règles combinées (2 règles du Défi du jour en même temps).
110. Mode Miroir : combattre sa propre équipe.
111. Mode Sans orbes : uniquement compétences et super.
112. Course de dinos : mini-jeu de réflexes avec les dinos rapides.
113. Mini-jeu de pêche dans les Abysses.
114. Mini-jeu de fouille amélioré (outils différents).
115. Donjon quotidien à étages aléatoires (5 étages, un boss).
116. Mode coopératif local à 2 sur le même PC (chacun contrôle un dino, au tour par tour).
117. Mode Gauntlet : enchaîner tous les boss de l'histoire sans soin.
118. Mode Gardien : défendre le nid contre des vagues.
119. Défis de collection : gagner avec seulement des communs.
120. Mode « Dino unique » : un seul dino très puissant contre tout.
121. Tour inversée : descendre, chaque étage retire un bonus.
122. Saisons du Labyrinthe avec reliques exclusives temporaires.
123. Mode entraînement : ennemi d'entraînement pour tester les dégâts.
124. Rejouer un combat perdu avec le même tirage d'orbes (mode « Revanche »).
125. Mode histoire « courte » pour découvrir le jeu en 30 minutes.

## 6. Collection et espèces (126-150)
126. ⭐ Familles d'insectes et de mammifères préhistoriques jouables (Mammouth, Smilodon, Arthropleura).
127. Nouvelles variantes : Fossile, Cristal, Lave, Spectral.
128. Skins cosmétiques par dino (couleurs, motifs) sans effet sur les stats.
129. Accessoires cosmétiques (collier, casque, selle).
130. Noms personnalisés pour chaque dino.
131. Dino favori épinglé en tête de collection.
132. Affection : un dino utilisé souvent gagne de petits bonus et des répliques.
133. Fiche détaillée avec statistiques d'utilisation (combats, victoires, KO).
134. Galerie 3D tournante simulée du portrait (parallaxe).
135. Espèces saisonnières disponibles seulement pendant un événement (puis dans une boutique).
136. Évolutions ramifiées (2 choix d'évolution pour certaines espèces).
137. Évolution par objet (fossile rare) en plus du niveau.
138. Dinos mythiques (5e rareté) obtenus seulement par quêtes.
139. Albums par famille avec récompense quand ils sont complets.
140. Comparateur de deux dinos côte à côte.
141. Filtre de collection par famille, élément, compétence, passif.
142. Tri par gènes et par génération (Nid).
143. Verrou anti-recyclage sur un dino.
144. Recyclage groupé intelligent (garder le meilleur exemplaire).
145. Fiches de taille réelle (silhouette comparée à un humain).
146. Faits scientifiques réels sur chaque espèce.
147. Mode photo : poser son équipe dans un décor et enregistrer une image.
148. Portraits animés (respiration, clignement).
149. Cris propres à chaque famille quand on touche la fiche.
150. Statistiques de collection (pourcentage par rareté, variantes possédées).

## 7. Progression et éveil (151-175)
151. ⭐ Niveau maximum 120 avec éveil ★★★★★★ (6 étoiles).
152. Entraînement passif : les dinos hors équipe gagnent un peu d'XP.
153. Objets d'XP à donner directement (viande, baies).
154. Partage d'XP réglable entre l'équipe.
155. Rang du survivant avec récompenses à chaque palier.
156. Arbre de compétences du joueur (bonus globaux).
157. Prestige : remettre l'histoire à zéro contre des bonus permanents.
158. Objectifs à long terme sur 30 jours.
159. Maîtrise d'espèce : 100 victoires avec une espèce débloquent un titre.
160. Éveil qui change visuellement le portrait (aura, couronne).
161. Paliers de puissance d'équipe débloquant des modes.
162. Recommandation automatique « quoi faire ensuite ».
163. Résumé de progression hebdomadaire.
164. Rattrapage : bonus d'XP pour les dinos très en dessous du niveau moyen.
165. ⭐ Limite de dégâts « absurdes » vérifiée (éviter qu'un cumul gènes + éveil + équipement casse l'équilibrage).
166. Matériaux d'éveil spécifiques par famille.
167. Éveil partagé : les doublons d'une espèce font monter l'éveil.
168. Statistiques de défense plus utiles (aujourd'hui peu visibles).
169. Niveau d'équipe affiché clairement (au lieu du « ⚔ puissance » jugé peu utile).
170. Courbe de progression revue entre les niveaux 40 et 60 (creux probable).
171. Récompenses de retour après une absence de plusieurs jours.
172. Paliers de connexion mensuels.
173. Bonus de premier combat du jour.
174. Défi de maîtrise par niveau d'histoire (gagner sans perdre de PV).
175. Graphique de progression de la puissance dans le temps.

## 8. Nid d'élevage et Grand Nord (176-200)
176. ⭐ Mutations de couleur visibles (teinte du portrait) en plus des gènes.
177. Gènes de défense et de super (pas seulement PV et ATQ).
178. Arbre généalogique d'un dino (parents, grands-parents).
179. Troisième nid débloqué par un succès.
180. Couveuse améliorable (temps réduit, chance de mutation +5 %).
181. Croisements spéciaux entre familles proches qui donnent une espèce rare.
182. Œufs à soigner (tourner l'œuf, le réchauffer) pour une meilleure empreinte.
183. Bébés plus petits visuellement qui grandissent avec le niveau.
184. Nom de lignée personnalisé (« Lignée des Crocs d'acier »).
185. Classement personnel des meilleures lignées.
186. Échange de dinos d'élevage avec un code (entre deux sauvegardes).
187. Événement « Ponte record » : mutations ×2.
188. Grand Nord : chapitre 3 (volcan sous-glaciaire).
189. Grand Nord : mode difficile avec étoiles noires.
190. Gardiens du Grand Nord qui reviennent plus forts chaque semaine.
191. Expéditions vers le Grand Nord (butin de cristaux).
192. Météo du Grand Nord (blizzard qui réduit la visibilité des orbes).
193. Équipements de froid (bonus dans la toundra).
194. Faune du Grand Nord apprivoisable (mammouth jouable).
195. Aurore boréale animée en fond de menu.
196. Sons d'ambiance de vent et de glace.
197. Bestiaire du Grand Nord avec récompenses de complétion.
198. Quêtes du Dr Elara liées au Nid (élever un dino précis).
199. Statistiques d'élevage (mutations obtenues, générations).
200. Nid visible dans le camp de base avec les œufs en cours.

## 9. Équipement et artisanat (201-225)
201. ⭐ Ensembles d'équipement (3 pièces = bonus de set).
202. Amélioration d'objet +1 à +10 avec risque d'échec désactivable.
203. Gravures d'attributs à choisir sur un talisman.
204. Recyclage d'objets en matériaux.
205. Objets légendaires uniques avec un nom et un effet propre.
206. Comparaison automatique avec l'objet équipé.
207. Équipement automatique optimal en un clic.
208. Transmogrification (garder l'apparence d'un objet).
209. Atelier de la sacoche : nouveaux objets (bombe d'ambre, filet, totem).
210. Objets consommables hors combat (boost d'XP 1 h).
211. Fabrication de matériaux rares à partir de communs.
212. Objets de famille (ne s'équipent que sur une famille, plus puissants).
213. Recettes à découvrir dans les fouilles.
214. Durabilité désactivée par défaut (option hardcore).
215. Objets qui évoluent avec les victoires.
216. Inventaire triable et filtrable.
217. Verrou anti-recyclage d'objet.
218. Affichage des objets sur le portrait (casque, collier).
219. Artisanat en file d'attente (plusieurs objets d'un coup).
220. Matériaux de zone affichés sur la carte (« ici : ambre »).
221. Forge de l'équipe : bonus global visible avec un visuel de forge.
222. Gemmes à sertir (rubis +ATQ, saphir +PV).
223. Objets maudits puissants avec un défaut.
224. Coffre de butin animé à l'ouverture.
225. Historique des objets obtenus.

## 10. Invocation (226-250)
226. ⭐ Bannière de famille (taux augmenté pour une famille).
227. Bannière de choix : on choisit la vedette parmi 5.
228. Garantie d'espèce vedette au bout de N invocations, affichée.
229. Invocation animée en œuf qui éclot (au lieu de la carte).
230. Animation spéciale selon la rareté (éclair, aurore, météore).
231. Historique complet des invocations avec statistiques.
232. Tickets d'invocation de variante garantie.
233. Invocation gratuite quotidienne améliorée le week-end.
234. Boutique d'échange de doublons contre l'espèce de son choix.
235. « Liste de souhaits » : 3 espèces plus probables.
236. Bannière anniversaire (date de la première partie).
237. Taux affichés clairement avant chaque tirage.
238. Mode « sans animation » pour les tirages ×10.
239. Effet sonore de suspense réglable.
240. Invocation par élément améliorée (choix de la rareté minimum).
241. Collection de cartes d'invocation (cartes illustrées obtenues).
242. Pity partagée entre bannières, clairement indiquée.
243. Récompense de la 100e invocation.
244. Bannière de retour des exclusives d'événement.
245. Tickets gagnés au bestiaire (complétion).
246. Animation de doublon transformé en fragments.
247. Affichage de la probabilité restante avant garantie.
248. Écran récapitulatif après ×10 (nouveautés en premier).
249. Bouton « invoquer encore » direct.
250. Simulation de taux dans l'admin pour vérifier les réglages.

## 11. Événements et rendez-vous (251-275)
251. ⭐ Calendrier des événements des 4 prochaines semaines.
252. Événements de fête (Halloween : dinos squelettes ; Noël : dinos des neiges).
253. Événement « Invasion » : la carte d'histoire envahie, rejouer des niveaux pour la libérer.
254. Boss d'événement avec classement personnel.
255. Événement de collection (trouver 50 œufs dorés).
256. Événement de pêche (Abysses).
257. Événement de course (temps record).
258. Événement « Migration » : dinos sauvages à apprivoiser.
259. Défis du week-end (samedi et dimanche).
260. Boutique d'événement tournante avec cosmétiques.
261. Mission spéciale du jour de lancement de version.
262. Événement « Éclipse » : tous les ennemis Ombre.
263. Événement « Âge de glace » : toundra sur toute l'île.
264. Événement « Volcan » : dégâts de feu ×1,5.
265. Événement de nostalgie : anciens événements qui reviennent.
266. Récompense de participation même sans victoire.
267. Points d'événement convertibles après la fin (pas perdus).
268. Notification dans le jeu quand un événement commence.
269. Bandeau d'événement animé sur l'accueil.
270. Musique propre à chaque événement.
271. Décor de menu propre à chaque événement.
272. Défi communautaire simulé (« l'île a vaincu 10 000 ennemis »).
273. Événement d'anniversaire du jeu.
274. Mini-histoire d'événement en 3 dialogues.
275. Titres exclusifs par événement.

## 12. Missions, succès et objectifs (276-300)
276. ⭐ Missions hebdomadaires (en plus des quotidiennes).
277. Succès cachés.
278. Succès drôles (perdre avec 1 PV d'avance sur l'ennemi).
279. Vitrine de titres et de badges sur le profil.
280. Points de succès et paliers.
281. Missions guidées pour les débutants (les 7 premiers jours).
282. Chaîne de missions narratives.
283. Missions par famille (gagner 10 combats avec des cératopsiens).
284. Missions de défi (gagner sans super).
285. Récupérer toutes les récompenses en un clic (partout).
286. Suivi des missions dans le combat (petite puce).
287. Missions qui se renouvellent à la demande (1 fois par jour).
288. Succès de vitesse (finir un combat en 3 actions).
289. Succès de collection par variante.
290. Succès pour le bestiaire complet.
291. Compteurs de statistiques globales (dégâts totaux, orbes touchées).
292. Classement personnel de records (plus gros coup, plus long combo).
293. Écran « records » avec relecture des chiffres.
294. Objectif du moment toujours visible sur l'accueil.
295. Succès d'élevage (génération 10, gènes maximum).
296. Succès du Labyrinthe par relique.
297. Succès de Défi du jour (série de 30 jours).
298. Récompense de fin de collection de succès d'une catégorie.
299. Notification discrète quand un succès est proche.
300. Mission « découvre une fonction » pour chaque menu peu utilisé.

## 13. Animations de combat (301-325)
301. ⭐ Animation d'attaque unique pour chaque légendaire.
302. Caméra qui zoome sur le coup critique.
303. Trainées de mouvement quand un dino charge.
304. Particules d'élément (braises, gouttes, feuilles, éclairs) sur chaque coup.
305. Ennemi qui recule et vacille selon la force du coup.
306. KO ennemi avec désintégration en particules.
307. Entrée des dinos au début du combat (course, saut).
308. Pose de victoire de l'équipe.
309. Animation de défaite (dinos qui s'effondrent puis se relèvent au camp).
310. Orbes qui explosent en éclats à la touche.
311. Orbes qui tombent avec rebond (amélioré).
312. Effet de lumière quand une orbe boostée est touchée.
313. Nombres de dégâts empilés et colorés par élément.
314. Lettrage « CRITIQUE ! » animé façon bande dessinée.
315. Fondu de vague avec transition (le décor défile).
316. Animation de soin (feuilles qui tourbillonnent).
317. Animation de bouclier (dôme hexagonal).
318. Animation de poison (bulles vertes au-dessus de la tête).
319. Ennemi boss qui rugit avec onde de choc.
320. Ralenti sur le coup final d'un boss.
321. Animation d'éclosion au Nid plus longue (fissures, lumière).
322. Animation de mutation (ADN qui tourne).
323. Animation d'évolution avec silhouette qui grandit.
324. Animations réduites automatiquement si l'ordinateur est lent.
325. Réglage de l'intensité des animations (faible, normale, forte).

## 14. Graphismes et décors (326-350)
326. ⭐ Portraits plus détaillés (ombres, textures d'écailles).
327. Décors à 4 plans de parallaxe.
328. Éclairage dynamique selon l'élément de l'attaque.
329. Météo visible en combat (pluie, neige, cendres) plus riche.
330. Décors de menu animés (feuillage qui bouge).
331. Nouvelles couleurs de thème (Fossile, Aurore, Rubis).
332. Icônes dessinées à la place des émojis pour les ressources.
333. Cadres de portrait par rareté plus distincts.
334. Fond de collection en vitrine de musée.
335. Carte d'histoire dessinée avec relief.
336. Écran titre animé (dinos qui passent au loin).
337. Écran de chargement avec astuces illustrées.
338. Interface de combat plus lisible (PV en grand, chiffres plus nets).
339. Bannières illustrées pour chaque mode.
340. Silhouettes d'ennemis dans le bestiaire avant découverte.
341. Ombres portées des dinos au sol.
342. Reflets dans l'eau pour les décors marins.
343. Brume volumétrique en Cauchemar.
344. Lucioles la nuit.
345. Ciel qui change selon l'heure réelle.
346. Animations de menu avec transitions de page (View Transitions).
347. Police de titre personnalisée par zone.
348. Effets holographiques sur les cartes légendaires (amélioré).
349. Mode haute résolution pour écrans 4K.
350. Option graphismes « simples » pour les petits ordinateurs.

## 15. Interface et confort (351-375)
351. ⭐ Raccourcis clavier partout (Échap pour revenir, E pour la super, A pour l'auto).
352. Infobulles au survol sur tous les chiffres.
353. Recherche dans la collection par nom.
354. Équipes enregistrées par mode (Arène, Tour, Grand Nord).
355. Bouton « meilleure équipe » automatique selon l'ennemi.
356. Prévisualisation des ennemis avant de lancer un niveau.
357. Récapitulatif de fin de combat plus clair (XP de chaque dino).
358. Notifications regroupées (moins de toasts).
359. Centre de notifications consultable.
360. Écran d'accueil personnalisable (raccourcis favoris).
361. Défilement de la souris sur la carte d'histoire.
362. Glisser-déposer pour réorganiser l'équipe.
363. Confirmation avant les actions irréversibles (recyclage) avec option « ne plus demander ».
364. Annuler la dernière action hors combat (recyclage, vente) pendant 10 s.
365. Barre de ressources cliquable (où obtenir cette ressource ?).
366. Guide interactif « où obtenir » pour chaque matériau.
367. Mode compact pour petits écrans (1024×640).
368. Taille de texte réglable.
369. Fenêtre de jeu redimensionnable sans perte de mise en page.
370. Menu pause en combat (avec abandon, réglages).
371. Reprendre automatiquement le dernier mode au lancement.
372. Historique des combats récents.
373. Indicateur de nouveauté (point) plus discret et désactivable.
374. Tutoriels courts par mode, relisibles.
375. Écran « Quoi de neuf » après une mise à jour.

## 16. Son et musique (376-400)
376. ⭐ Thème musical propre à chaque zone (amélioré).
377. Musique de boss plus intense en phase 3.
378. Bruitages par famille d'attaque.
379. Cris des dinos à l'invocation.
380. Sons d'ambiance par décor (jungle, volcan, glace, abysses).
381. Réglages séparés : musique, effets, ambiance, voix.
382. Effet sonore pour les combos qui monte en tonalité.
383. Jingle de victoire différent selon les étoiles.
384. Musique du Nid douce et calme.
385. Mode « musique calme » pour jouer longtemps.
386. Sons du menu plus discrets.
387. Son de mutation spécial.
388. Battement de cœur quand l'équipe a peu de PV.
389. Musique de l'Arène qui accélère au fil du combat.
390. Leitmotiv de la Graine dans les moments d'histoire.
391. Égaliseur simple (graves, aigus).
392. Silence automatique quand la fenêtre n'est pas au premier plan.
393. Lecteur de musiques débloquées (jukebox).
394. Sons de pas sur la carte d'histoire.
395. Effet sonore pour les orbes boostées.
396. Voix de narration optionnelle (synthèse vocale du système).
397. Sons distincts pour les attaques ennemies puissantes (alerte).
398. Volume des sons atténué pendant les dialogues.
399. Musique d'événement saisonnière.
400. Réglage « sons rétro 8 bits ».

## 17. Accessibilité et réglages (401-425)
401. ⭐ Mode daltonien : symboles sur les orbes en plus des couleurs.
402. Contraste élevé.
403. Réduction des mouvements (déjà en partie) étendue à tous les menus.
404. Lecture des textes à voix haute.
405. Combat entièrement jouable au clavier, avec focus visible.
406. Pas de limite de temps nulle part par défaut.
407. Mode facile « histoire » (ennemis −30 %).
408. Mode difficile avec meilleures récompenses.
409. Vitesse de texte des dialogues réglable.
410. Sous-titres pour les sons importants.
411. Taille des orbes réglable.
412. Désactiver les flashs (déjà) et les secousses séparément partout.
413. Rappel de pause après 1 h de jeu (optionnel).
414. Profils de réglages (rapide, confort, spectacle).
415. Langue anglaise (traduction complète).
416. Format de nombres réglable (1 000 / 1k).
417. Infobulles plus lentes à disparaître.
418. Couleurs de thème vérifiées pour le contraste (WCAG).
419. Curseur agrandi optionnel.
420. Mode une main (tout à la souris).
421. Réglage de la vitesse de l'auto-combat plus fin.
422. Option « confirmer avant la super ».
423. Indicateur textuel de l'avantage d'élément (« efficace ! »).
424. Résumé audio de la fin de combat.
425. Guide des symboles accessible depuis le combat.

## 18. Équilibrage et difficulté (426-450)
426. ⭐ Tests avec de vrais joueurs (tout l'équilibrage n'est mesuré que par simulation).
427. Bot de simulation « moyen » utilisé pour tous les modes (pas seulement le bot parfait).
428. Difficulté adaptative optionnelle après 3 défaites.
429. Revoir l'intérêt des communs à haut niveau.
430. Revoir les variantes Ombre (ATQ ×1,3 mais PV réduits).
431. Équilibrer les familles entre elles (taux de victoire par famille mesuré).
432. Mesurer chaque compétence (gain réel par combat).
433. Revoir les coûts d'éveil aux paliers élevés.
434. Revoir la Tour au-delà de l'étage 100.
435. Revoir l'Arène « Redoutable » (82,5 %).
436. Limiter l'effet boule de neige des gènes + empreinte + équipement.
437. Récompenses de rejeu équilibrées (pas de farm trop rentable).
438. Économie : suivre entrées et sorties de chaque ressource sur une semaine simulée.
439. Revoir les prix de la boutique de fragments.
440. Revoir la chance des œufs d'événement.
441. Contre-la-montre or (60 %) à rendre plus accessible.
442. Cauchemar 70-100 : vérifier que ce n'est pas un mur.
443. Grand Nord : marche entre le niveau 9 et le gardien 10 (5 % pour l'équipe juste à niveau).
444. Courbe d'XP revue pour éviter les longues stagnations.
445. Équilibrer l'auto-combat pour qu'il ne soit pas meilleur que le joueur.
446. Statistiques de télémétrie locale lisibles (où le joueur perd le plus).
447. Rapport d'équilibrage automatique dans les tests.
448. Seuils d'alerte dans les simulations (échec si un niveau tombe sous 50 %).
449. Revoir le coût d'accélération du Nid.
450. Revoir la valeur de la défense dans la formule de dégâts.

## 19. Application Windows et technique (451-475)
451. ⭐ Sauvegarde automatique dans le cloud personnel (dossier OneDrive choisi par le joueur, sans serveur).
452. Mise à jour automatique de l'application (vérifier la dernière version sur GitHub).
453. Signature de l'exécutable (moins d'alertes Windows).
454. Taille de l'.exe réduite (compression des images).
455. Version portable qui garde la sauvegarde à côté de l'.exe (option).
456. Raccourci de bureau et menu Démarrer vérifiés.
457. Captures d'écran avec F12.
458. Mode fenêtre sans bordure.
459. Limiteur d'images par seconde pour économiser la batterie.
460. Rapport de plantage local.
461. Export de la sauvegarde planifié chaque semaine.
462. Version macOS et Linux (Electron le permet).
463. Tests de performance automatiques (temps de rendu du combat).
464. Découper les gros fichiers JS en modules plus petits.
465. Moins de monkey-patching : un système de crochets (hooks) déclaré.
466. Vérification automatique de l'ordre des scripts.
467. Tests visuels par captures comparées.
468. Chargement plus rapide (scripts différés hors combat).
469. Base de données locale (IndexedDB) pour les grosses sauvegardes.
470. Outil d'administration amélioré (éditeur d'ennemis, de zones).
471. Support des manettes.
472. Intégration Discord « joue en ce moment » (optionnelle).
473. Mode développeur (journal des événements de combat).
474. Accessibilité du lecteur d'écran testée.
475. Documentation de création de contenu (ajouter une espèce en 5 étapes).

## 20. Partage, rejouabilité et divers (476-500)
476. ⭐ Codes d'équipe à partager (affronter l'équipe d'un ami en Arène, en local).
477. Défis à partager par code (règles + graine aléatoire).
478. Carte de profil exportable en image.
479. Graine du Défi du jour partagée : comparer son résultat avec un ami.
480. Mode spectateur : regarder l'auto-combat en accéléré.
481. Relecture d'un combat enregistré.
482. Statistiques de fin de saison (résumé du mois).
483. Galerie de fan-art importée localement.
484. Personnalisation du camp avec décorations.
485. Mascotte compagnon sur l'accueil (un bébé du Nid).
486. Animaux de compagnie non combattants (compsognathus qui suit l'équipe).
487. Mini-encyclopédie paléontologique réelle.
488. Quiz sur les dinosaures avec récompenses.
489. Mode « musée » pour exposer ses meilleurs dinos.
490. Défis entre deux sauvegardes sur le même PC (deux profils).
491. Plusieurs profils de joueur sur le même ordinateur.
492. Modes « challenge run » (nuzlocke : un dino KO est perdu).
493. Récompenses pour les joueurs qui reviennent après une mise à jour.
494. Écran crédits avec les ressources libres utilisées.
495. Nommer son île.
496. Choix d'un avatar de dresseur.
497. Emotes de victoire.
498. Photo de groupe de l'équipe après un boss.
499. Vérifier le nom « ARK » (marque de Studio Wildcard) avant toute diffusion publique, et prévoir un autre nom.
500. Demander aux joueurs, dans le jeu, quelle idée de cette liste ils veulent en premier.
