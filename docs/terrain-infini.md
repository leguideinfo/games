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
- **ATLAS DE DÉCORS — ESSAI ABANDONNÉ (2026-08-08)** : la planche 6×6 du
  propriétaire (`atlas-decors.png`, 36 éléments) a été découpée puis
  **retirée du jeu**. Deux méthodes essayées, deux échecs :
  ① découpe serrée (masque calibré par case + érosion avant composante
  connexe) → presque tous les décors apparaissaient **coupés** dès qu'un
  pixel manquait au masque ; ② collerette de sable réel autour de l'objet
  → **chaque décor faisait une tache visible** sur le sol, la teinte de la
  collerette ne se fondant jamais parfaitement dans le pattern étalonné.
  Verdict propriétaire : « ça fait tous des taches, laisse tomber ».
  L'atlas reste en archive (`assets/sprites/atlas-decors.png`) ; le
  pipeline de découpe (`bake-atlas.py`) et l'échelle mesurée (**1 case =
  328 px d'atlas**) sont documentés ici pour un futur essai — la voie
  probable étant des assets déjà fournis **à fond transparent**, sans
  sable à détourer.
- **LE CHAMP DE DUNES (2026-08-10)** : `sol-tuile-dunes.png`, **miroir du
  lac** de l'autre côté de la carte (8 cases, centre ~(2,6)). Découpe la
  plus simple de toutes, et sans aucun risque de tache : ici le sable
  clair EST le sujet et son bord se fond déjà naturellement dans le sable
  de base, donc **l'alpha est directement l'écart au sable de base**.
  Discriminant mesuré : la **saturation** (sable de base S=231-245,
  dunes S=154-181) → rampe douce 224→188, plus une rampe de luminance
  (V<150) pour les pitons rocheux. Le mouchetis du sable de base, lui
  aussi peu saturé, ressortait en confettis : il est écarté en ne gardant
  que la composante centrale via une enveloppe douce (le dégradé du bord
  est préservé). **Différence clé avec le lac : on construit dessus** —
  c'est une couche purement visuelle, `tileAt` n'est pas touché, les
  cases restent du sable ordinaire (grille visible, empreintes
  appliquées). Les deux fissures ont été déplacées en (2,2) et (6,6),
  hors du lac et hors des dunes.
- **ROSTER DE BÂTIMENTS (2026-08-10)** : 20 assets du propriétaire, sur
  fond uni (bleu nuit ou noir), intégrés d'un coup. **Méthode de
  détourage : remplissage depuis les bords**, pas un seuil de couleur —
  les bâtiments contiennent eux-mêmes du bleu nuit identique au fond, un
  seuil les trouait (le sable traversait le bâtiment). On ne supprime que
  le fond EXTÉRIEUR : tout ce qui n'est pas atteignable depuis le bord de
  l'image appartient au bâtiment, quelle que soit sa couleur. On ne
  récupère donc **que le contour**, avec un micro-fondu (0,8 px).
  Remplacent le rendu canvas : Ferme (`ferme`), Datacenter (`baie`),
  Baie réseau (`reseau`), Console (`console`), Forge (`forge`), Serveur
  DHCP (`dhcp`), Switch (`nexus`). **Nouveau chapitre 🛡 Colonie
  avancée** (13 bâtiments, `mAt: 26` — ouverts après la chaîne de
  missions, donc aucun impact sur le tutoriel) : Foreuse profonde,
  Coffre blindé, Chantier spatial, Hangar de chasse, Aire de transport,
  Tour de guet, Tourelle, Batterie de missiles, Dôme de bouclier,
  Citadelle, Bastion, Sentinelle, Station de révocation.
  Échelle 0,68 case, empreintes mesurées sur la base de chaque asset.
  (`chantier`, `spatial` et `vaisseau` sont le même fichier : un seul
  gardé.)
- **QUATRE TERRAINS DE ZONE (2026-08-13)** : le plateau a maintenant ses
  quatre pôles, tous découpés par la même méthode que les dunes (alpha =
  écart au sable de base, puis composante centrale sous enveloppe douce).
  Discriminant mesuré par asset : **saturation** pour la montagne
  (sable S≈252, roche S=87-176), **teinte** pour la zone fertile (sable
  H≈17, végétation H=22-30), saturation pour les dunes, saturation+rive
  pour le lac.
  · **Chaîne de montagnes** en haut (`sol-tuile-montagne`) — nature de
  case `montagne`, **infranchissable** ;
  · **Zone fertile** en bas (`sol-tuile-fertile`) — **constructible**,
  couche purement visuelle ;
  · **Grand lac** à droite — infranchissable ;
  · **Champ de dunes** à gauche — constructible.
  Lac et dunes **écartés d'1/3 de case vers les bords** (retour
  propriétaire) ; les deux fissures passent en (2,4) et (6,4), au centre,
  hors des quatre zones.
- **NOUVELLE TUILE MONTAGNES (2026-08-14)** : l'ancienne tuile montagne
  (massif plein cadre) était disproportionnée quelle que soit l'échelle ; la
  rotation 180° tentée pour la « coucher » produisait un amas de pixels (les
  pics pointaient vers le bas). Le propriétaire a fourni
  `awoui-universe-assets-map-tuile-montagnes.png` : un **champ en losange
  iso** (pics rocheux, sable clair, petits cristaux) déjà orienté comme le
  plateau. Découpe méthode zones (écart au sable de bord S=252, bord érodé
  puis fondu), recalage couleur **affine pondéré par la clarté** vers le sol
  du jeu (164.8/96/38.3). Dessinée **à plat, sans rotation ni aplat**, à la
  taille des autres zones (w 2,15 ≈ lac/dunes w 2,0 — retour propriétaire :
  « taille similaire aux autres »), empreinte infranchissable 3×3 au coin
  haut. `drawZone()` clippe par le **losange exact du territoire**
  (`plateauDiamond()`, fermé — jamais de débordement au-dessus du vide).
- **Conduits pointillés retirés (2026-08-14)** : les liens pointillés animés
  bâtiment → Source (`drawLink`) sont supprimés (retour propriétaire) ; ne
  restent que les **câbles réseau** posés par le joueur (`drawCable`).
- **GISEMENTS DE CRISTAUX 3 TAILLES (2026-08-14)** : les amas par défaut
  sont remplacés par les 3 assets définitifs
  (`awoui-universe-assets-tuile-cristaux-small/medium/big.png`, fond sable
  orangé, **fissures du sol autour de la base**). Découpe « écart au sable »
  (teinte bleue = cristal, désaturation = roches, sombre = cracks), les
  branches de fissures reliées à l'amas par dilatation avant la composante
  centrale — **les fissures restent et se fondent dans le terrain**, sable
  résiduel recalé vers le sol du jeu pondéré par sa « sable-itude ».
  Ancre de pose = centroïde du sol seul (cristaux exclus). Gameplay :
  stock 120/240/360 💠 et vitesse 0,6/1,2/1,8 💠/s (1x/2x/3x selon la
  taille), compteur + barre au-dessus du cristal extrait, épuisement →
  sable constructible + drone de retour en soute, hors-ligne plafonné par
  le stock, garantie une-taille-de-chaque près de la Source au spawn
  (sauvegarde v8).
- **Décor en prod (inchangé, validé)** : **LA fissure et LES fissures**
  (une seule de chaque, emplacements fixes), **LA crevasse** (colmatage
  Tetris) et **LE rocher** (éboulis déblayables).
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
