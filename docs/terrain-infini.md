# Terrain infini — tuiles seamless + décor en couches

*Direction **validée par le propriétaire** (2026-08-07, exemple de tuile
raccordable fourni) : le terrain sera généré en illimité à partir de tuiles
seamless, avec le décor posé par-dessus. Remplace à terme la map-image fixe
(`assets/map-test.png`), qui aura servi de maquette d'échelle.*

## Architecture en couches

1. **Sol infini** : tuile de terrain **seamless** (bords raccordables),
   répétée via `createPattern` canvas (GPU, coût quasi nul, aucune limite).
2. **Variation procédurale** : casser la répétition avec des teintes locales
   et des **decals** (fissures, semis de cailloux, plaques sombres) placés
   par la graine stable par coordonnée (`hash2` + `mulberry32`, déjà dans le
   moteur — c'est ce qui fixe cristaux/crevasses aujourd'hui).
3. **Décor** : sprites transparents ancrés au sol (amas de cristaux — déjà
   intégré —, rochers, éboulis), densité par graine, plus dense hors
   territoire pour border les zones jouables.
4. **Gameplay** : grille du territoire débloqué, bâtiments, unités
   (inchangé).

## Conséquences moteur

- Le moteur est **déjà infini** côté logique (terrain procédural sans bord) ;
  seule l'image de map actuelle impose une borne caméra et un plafond
  d'expansion (11×11). Le passage au pattern **supprime les deux** :
  « étendre les côtés » devient illimité.
- Rendu : itérer uniquement les cases visibles (calcul viewport via `s2w`),
  decals/décor dessinés par case visible. Option : cache par chunk en
  canvas offscreen si besoin de perf.

## Niveaux de vue (LOD) — plus tard

Tout est dessiné en coordonnées monde × zoom : les seuils suffisent.
1. **Vue rapprochée** : sprites complets, fumées, decals fins.
2. **Vue tactique** (dézoom) : masquer les petits decals, bâtiments en
   silhouettes/icônes lisibles (gain de perf au passage).
3. **Vue stratégique** : la Carte du secteur existante — la colonie devient
   un point parmi les voisines (pont vers le multi asynchrone).
Transitions par seuils de zoom + fondu ; à terme zoom continu façon
Supreme Commander.

## Assets à générer (cahier des charges propriétaire)

- **Tuile de sol seamless** : 1024–2048 px, éclairage neutre (pas d'ombre
  directionnelle marquée), **aucun élément remarquable** dans la tuile
  (tout ce qui se remarque va en couche décor, sinon la répétition se voit).
- **3 à 5 decals** de variation, fond transparent : fissure, semis de
  cailloux, plaque sombre…
- **2-3 rochers** en sprites transparents (mêmes règles que les bâtiments :
  base posée au sol, éclairage cohérent).

## État — IMPLÉMENTÉ (2026-08-07, v8)

- **Tuile en prod** : `assets/sprites/sol-tuile.png` (1254², seamless
  vérifié, WebP 1024 embarqué). **Échelle actée par le propriétaire
  (2026-08-07) : 1 répétition = 1 case** — densité de pixels alignée
  sur les bâtiments (~11-13 px image / px monde). Rendu net à tout zoom
  par **mip-mapping maison** (128/256/512/1024, niveau choisi selon
  zoom×DPR, patterns mis en cache).
- **Présentation « plateau flottant » (retour propriétaire 2026-08-07) :
  seul le territoire débloqué est affiché** — le pattern de tuile est
  clippé au losange du territoire, falaises de bordure dessinées, le
  reste est le vide spatial. Le pattern infini reste le moteur : chaque
  expansion agrandit le plateau sans limite. Décor uniquement en
  territoire (cristaux, rochers — jamais en miroir). **Variation par
  tuiles-variantes (méthode actée 2026-08-08, v3)** : masque par
  **composante connexe** — seule la crevasse reliée au centre est
  gardée (branches opaques jusqu'au bout, bruit isolé jeté), teinte
  auto-alignée, **chaque marque tient dans UNE
  tuile, en petit** (0,34–0,44 case, 4 rotations par graine) : LA
  fissure et LES fissures placées indépendamment (~2,5 % des cases de
  sable chacune), purement décoratives ; LA crevasse habille les
  crevasses de jeu (seule à se colmater, mini-jeu Tetris conservé,
  0,55 case). L'orbe énergétique du propriétaire remplace la boule
  bleue flottante (flottement conservé).
  Trois assets : `sol-tuile-fissure`, `sol-tuile-fissures` (décor) et
  `sol-tuile-crevasse` (**remplace le visuel des crevasses de jeu**,
  colmatage Tetris conservé). Ancienne méthode : le propriétaire
  fournit des tuiles complètes (ex. `sol-tuile-fissure.png`) ; à
  l'intégration, la teinte est alignée automatiquement sur la tuile de
  base (ratios mesurés par canal — ici ×1,07/×1,10/×1,23) et un masque
  radial fond les bords (opaque au centre, transparent avant les
  coins : aucun carré visible). En jeu : ~7 % des carreaux du pattern,
  graine stable, mips dédiées. Le decal découpé (`decal-fissure.png`)
  reste en archive — la tuile-variante donne un meilleur raccord.
- **Amas de cristaux (2026-08-08)** : remplacés par les **2
  tuiles-variantes du propriétaire** (`sol-tuile-cristaux-1/2.png`) —
  bake « sprite » : cristaux préservés par **masque couleur** (teintes
  cyan/bleu saturées), **halo de sol compact** au pied (radial aplati
  ~perspective), sol du halo passé par les **ratios exacts de
  l'étalonnage du plateau** (186/99/21 → 147/85/37) : raccord invisible,
  sûr même en bordure de plateau. Amas 1 petit (~0,78 case), amas 2
  large (~1,22 case), variation par graine, mips dédiées, tri en
  profondeur conservé (un amas devant un bâtiment passe devant).
  Gameplay associé : **2 drones ouvriers en soute** au départ, tap sur un
  amas = envoi d'un drone (mission tuto insérée en 1, 25 missions).
  **Taille recadrée (retour 2026-08-08)** : petits amas au sol,
  cohérents avec les tuiles-bâtiments qui restent dominantes.
  **Découpe serrée (retour 2026-08-08)** : plus de halo — cristaux +
  frange de socle adoucie (rochers proches en fondu) ; et **clip au
  pentagone du plateau** (bords-falaises exacts, ouvert vers le haut)
  sur cristaux et tuiles-bâtiments : plus aucun débordement en bordure.
  **Coupe nette en partie haute (retour 2026-08-08)** : rampe verticale
  sur le masque — au-dessus du socle, l'alpha suit exactement le contour
  de la texture (plus de liseré orange autour des pointes et des toits) ;
  la frange de sol n'existe qu'en partie basse. Bâtiments : trous
  internes (hublots lumineux, poussière, intérieur du hangar) comblés
  topologiquement (fermeture 7 px + remplissage des vides non reliés au
  fond).
- **Tuiles-bâtiments (2026-08-08)** : Extracteur, Centrale et Entrepôt
  remplacés par les assets-tuiles du propriétaire
  (`tuile-extracteur/centrale/entrepot.png`),
  même bake que les cristaux + **composante connexe depuis le centre**
  (cristaux/roches décoratifs et gros caillou jetés) ; le sol de la frange
  est **mesuré par asset** puis mappé vers la teinte étalonnée (les fonds
  de ces tuiles diffèrent de la tuile de base). **Découpe serrée (retour
  2026-08-08)** : plus de halo — bâtiment + fine frange de sol adoucie
  (~15 px), ancre = pied avant posé vers le coin sud de la case.
  **Échelle finale (retour 2026-08-08)** : bâtiments à **0,75 case**,
  balise centrale à **0,72 case** (contenue dans sa cellule) — chacun tient dans les limites de sa
  case, plus aucun chevauchement entre voisins. **Ancrage exact** : le
  point d'ancre est le centre du losange d'empreinte au sol (centroïde X
  du socle, Y = pointe avant − largeur de socle/4), posé pile au centre
  de la case — plus de réglage à l'œil.
- **Chemins de terre (2026-08-08)** : des sentiers de sable tassé se
  créent entre chaque bâtiment et son voisin le plus proche (ou la
  balise) — procédural (ellipses multiply, tracé stable par graine,
  clip plateau), remplaçable par un decal du propriétaire.
- **Crevasses/éboulis visibles dès le départ (retour 2026-08-08)** :
  plus de « cases sombres » avant la mission 4 — les assets s'affichent
  immédiatement, seule l'interaction reste gatée. La case en diagonale
  derrière la balise (3,3) est verrouillée sans décor.
- **Balise centrale (2026-08-08)** : la Source a son asset définitif
  (`tuile-balise.png`) — bake dédié : structure + anneau de débris
  préservé (halo elliptique bas), **faisceau détouré par matte de
  différence** (fond uni, référence par ligne, pixels bleutés seulement),
  sol mesuré et aligné. Posée à **0,72 case** (contenue dans sa case,
  retour propriétaire), ancre au centre de l'empreinte ; l'ancien dessin
  canvas reste en secours de chargement. **Découpe au pixel (retour
  2026-08-08)** : la matte de différence couvre toute la zone structure
  (sous le sommet mesuré des tours) avec **contrainte de proximité**
  (~30 px autour du masque couleur) — les antennes et panneaux ambrés
  troués par le masque sont réparés, le sol lointain reste au sol.
- **Étalonnage remonté (retour 2026-08-08)** : multiply 252/233/202 et
  désaturation 0,30 (avant : 236/216/187 × 0,34) — sol en jeu mesuré
  **164,8/96/38,3** (cible de tous les bakes de decals).
- **Caméra** : bornée autour du plateau (+4 cases), **zoom max 8,1**
  (+2 crans, retour 2026-08-08) ; **arrivée très rapprochée** (~5 cases
  PC, ~3,2 mobile — on découvre la balise et ses environs) ; expansion
  débornée.
- **ATLAS DE DÉCORS — terrain naturel (2026-08-08)** : la planche 6×6 du
  propriétaire (`atlas-decors.png`, 36 éléments) est découpée au bake
  (masque non-sable **calibré par case** — l'atlas est vignetté —,
  **érosion avant composante connexe** pour tuer les ponts de mouchetis,
  coupe nette en haut / frange au pied, teinte alignée). **Échelle
  calibrée sur un objet connu** : le gros cristal de l'atlas est le même
  objet que `sol-tuile-cristaux-3` ⇒ **1 case = 328 px d'atlas** ; chaque
  décor fait 0,12 à 0,52 case. Résolution adaptée par élément
  (96–256 px) : 426 Kio au total.
  **Méthode de découpe v2 (retour propriétaire 2026-08-08)** : la découpe
  serrée coupait presque tous les décors. Retour à la méthode d'origine —
  **collerette de sable** : l'objet est opaque, entouré d'un halo de sable
  RÉEL (dilatation 45 px + flou 18) qui se fond dans le sol, plus un fondu
  du bord de case. Un masque imparfait devient invisible et aucun contour
  n'apparaît coupé. **Semis (retour propriétaire)** : les décors sont
  **plus petits (×0,62)**, **jamais centrés sur leur tuile** (décalage
  stable jusqu'à ±0,39 case) et **répartis** — 0 à 3 par case de sable,
  taille variée par graine. **Fissures et rocher du propriétaire
  restaurés** (`sol-tuile-fissure(s)`, `rocher`) avec la même collerette.
  **Règle rappelée par le propriétaire (2026-08-08)** : **UNE seule
  fissure de chaque type** sur toute la carte, à un emplacement fixe
  (2,6) et (6,1) ; et dans le semis, **uniquement les petits cailloux** —
  tous les décors qui dessinent une « petite zone » (craquelures,
  flaques asséchées, cratères) sont retirés.
  **Arbitrage propriétaire (2026-08-08)** : les cristaux de l'atlas ne
  sont PAS utilisés — l'amas validé `sol-tuile-cristaux-3` est conservé ;
  et les decals sont limités aux **petites formes sèches (≤ 0,30 case)** :
  toutes les grandes formes plates (qui se retrouvaient coupées) et
  toutes les flaques/eaux sont retirées.
  Familles : **cristaux** (asset dédié, ressource), **relief**
  (mesas/pics — *infranchissable*, nouvelle nature de case), **éboulis**
  (déblayables), **crevasses** (colmatage Tetris), et **18 decals plats**
  (gravats, craquelures, flaques, lichen) semés sur ~38 % des cases de
  sable — c'est eux qui donnent le terrain naturel. Remplace les assets
  isolés `rocher`, `sol-tuile-fissure(s)`, `sol-tuile-crevasse`,
  `sol-tuile-cristaux-1/2/3`.
- **LE GRAND LAC (2026-08-08)** : `sol-tuile-grand-lac.png`, découpé par
  masque eau calibré sur échantillons (le sable est très saturé, S≥205 et
  b/r≤0,20 ; l'eau et ses reflets clairs ne le sont pas) + **rive sombre**
  récupérée dans un anneau (V<150). Zone **fixe de 8 cases** côté droit du
  plateau, en haut vers la diagonale ; on n'y pose ni objet ni décor, la
  grille ne s'y dessine pas, et la crevasse de tuto qui y tombait a été
  replacée à gauche. Un petit lac d'une case (`sol-tuile-lac.png`) est
  baké et disponible.
- **MOTEUR D'OCCUPATION — empreintes au sol (2026-08-08)** : chaque chose
  posée occupe un carré monde centré sur sa case, de côté « empreinte »
  **mesuré sur la base de l'asset** (pas sa bbox : toits et panneaux
  débordent). Deux empreintes ne peuvent se chevaucher : écart exigé
  ≥ (s1+s2)/2 + **marge 0,12 case**. Mesures : Extracteur 0,69 ·
  Centrale 0,69 · Entrepôt 0,71 · balise 0,63 · coffret 0,29 ·
  cristaux 0,42-0,46 · décor 0,04-0,47. L'adjacence reste donc toujours
  possible (0,71+0,12 < 1) : **la règle garantit sans restreindre**, et
  elle protégera automatiquement les futurs assets plus larges.
- **Prochain chantier relief (2 étages)** : ① relief par décor — assets
  propriétaire : mesas (1/2/3 cases), arêtes rocheuses orientées NE-SO
  et NO-SE, cratères, dunes en decal ; Claude : placement en chaînes
  par bruit basse fréquence, cases infranchissables. ② vraie heightmap
  avec falaises étagées (assets : segments de falaise raccordables +
  rampe ; Claude : moteur altitude/rendu/gameplay).
- La map-image (`assets/map-test.png`, `terrain-plateau.png`) reste en
  archive de référence.
