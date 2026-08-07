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
- **Décor volontairement épars (retour propriétaire : « plus simple
  pour commencer »)** : hors territoire, ~3 % de cases avec cristaux et
  ~1,5 % avec rocher (jamais retourné/miroir) ; les decals canvas
  (fissures/cailloux/plaques/teintes) ont été retirés — ils reviendront
  en assets du propriétaire. En territoire, éboulis = rocher.
- **Caméra libre** : bornée souplement autour du territoire (+7 cases),
  **zoom 0,55–4,5** (fort zoom demandé) ; expansion débornée.
- La map-image (`assets/map-test.png`, `terrain-plateau.png`) reste en
  archive de référence.
