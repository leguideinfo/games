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
- **Caméra** : bornée autour du plateau (+4 cases), **zoom 1,6–5,2**
  (dézoom resserré) ; expansion débornée.
- **Prochain chantier relief (2 étages)** : ① relief par décor — assets
  propriétaire : mesas (1/2/3 cases), arêtes rocheuses orientées NE-SO
  et NO-SE, cratères, dunes en decal ; Claude : placement en chaînes
  par bruit basse fréquence, cases infranchissables. ② vraie heightmap
  avec falaises étagées (assets : segments de falaise raccordables +
  rampe ; Claude : moteur altitude/rendu/gameplay).
- La map-image (`assets/map-test.png`, `terrain-plateau.png`) reste en
  archive de référence.
