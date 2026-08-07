# L'Atelier de Mémoire & la Restauration d'Archives

> **Distinction actée (propriétaire, 2026-08-07)** — deux mini-jeux, deux sens :
> - **Jeu d'assemblage** (pièces abstraites dans une forme) → **la Forge
>   d'assemblage** : les Mémoires-pictogrammes (concepts). C'est l'Atelier.
> - **Vrai puzzle d'image** (fragments reconnaissables d'une image à replacer)
>   → **les Archives** : la « Restauration d'Archives », galerie « Les images
>   du passé » dans QUÊTES. Implémentées : **002 « La Terre »** (3×3),
>   **003 « La forêt »** (3×3), **004 « La ville »** (4×4), **005 « La
>   fusée »** (5×5), **006 « L'océan »** (6×6), **007 « La montagne »**
>   (6×6), **008 « La Lune »** (7×7, la Terre vue de la Lune) — images
>   dessinées en canvas puis découpées, un jour remplaçables par les
>   illustrations du propriétaire via data-URI. **Affichage progressif
>   (retour propriétaire 2026-08-07) : 2 cartes non restaurées max** dans
>   la liste (la jouable + un aperçu verrouillé) — la suite apparaît au
>   fur et à mesure.
>   Récompense en Eo croissante (5+5×id), légendes lore placeholder.
>   **Gating (retour propriétaire 2026-08-07) : le verrou « Lecteur
>   d'Archives » est retiré des images** — ce sont les photos du module
>   d'Aurore, jouables dès l'ouverture de QUÊTES (mission 2) ; seule la
>   **chaîne** demeure (restaurer la précédente débloque la suivante).
>   **Difficulté croissante actée** (la fille du propriétaire fait déjà du
>   100 pièces IRL — ici on reste progressif) : 3×3 → 3×3 → 4×4 → 5×5,
>   à poursuivre (6×6…) au fil des prochaines images.

# L'Atelier de Mémoire — le puzzle à niveaux comme reconstruction de la conscience collective

*Proposition Claude (2026-08-07) en réponse à la question du propriétaire :
intégrer le puzzle (colmatage) en feature alternative à niveaux croissants,
stimulant l'apprentissage de concepts capitaux (civilisation, vie…) en
cohérence avec l'univers et la conscience collective. **À valider.***

## Le concept

Le geste du puzzle = remplir un vide avec des formes. Son sens dans
l'univers : **chaque niveau reconstitue une Mémoire — le pictogramme d'un
concept capital**. Grille complétée = les blocs s'illuminent et **révèlent
l'image** (ressort du Picross : la révélation comme récompense — lisible par
un enfant qui ne sait pas lire).

- **Lore** : le Lecteur d'Archives décrypte les textes, mais certaines
  mémoires sont *visuelles* et corrompues — il faut les reconstituer à la
  main. L'Atelier est la suite de la quête des Archives (débloqué quand le
  système d'époque est en ligne).
- **Micro-savoir** : chaque Mémoire complétée = UNE ligne de savoir
  (« Le feu — première énergie maîtrisée par l'humanité »). Jamais un cours.
- **Séquence-histoire** (proposition, à affiner avec le propriétaire) :
  étincelle → feu → graine → abri → roue → écriture → pont → voile → ADN →
  bit → circuit → réseau. De la vie au numérique : la dernière Mémoire
  rejoint l'académie IT.

## Niveaux croissants

| Palier | Grille | Pièces | Contrainte |
|---|---|---|---|
| Mémoires 1-3 | 6×6 | dominos/trominos | blocs illimités |
| 4-6 | 8×8 | + tétrominos | blocs comptés (généreux) |
| 7-9 | 10×10 | tétrominos | blocs comptés (justes) |
| 10+ | 10×10+ | + pentominos | cases fragiles, rotations limitées… |

**Jamais de chrono** : l'Atelier est le moment calme du jeu (contrepoint de
la Pluie d'éclats). Récompense : la révélation + la ligne de savoir + un peu
d'Eo (une mémoire = des données) + la Mémoire s'ajoute à la **Fresque**.

## Intégration (feature alternative, jamais bloquante)

- Section « Atelier de Mémoire » dans l'onglet **QUÊTES**, visible quand le
  Lecteur d'Archives est en ligne.
- **Une Mémoire nouvelle par jour** (rituel de rétention : « la mémoire du
  jour ») ; les anciennes rejouables librement.
- La **Fresque** s'affiche sur un **Monument** dans la colonie (fierté
  visible ; bâtiment cosmétique de la charte à définir).

## La conscience collective, au sens propre (prod / MMO)

En multi asynchrone : la Fresque devient **commune à l'univers** — chaque
joueur qui complète une Mémoire ajoute sa pierre à la grande Fresque.
La communauté reconstruit littéralement la mémoire de l'humanité, ensemble.
Projet collectif fondateur du MMO : non-violent, tous âges, à progression
visible, aligné avec les fédérations et la vision (« couches » 1 à 4).

## Prototype (2026-08-07 — dérogation ponctuelle au gel, validée par le propriétaire)

- **Mémoire 001 « Le feu »** jouable dans la slice — **v2 « vrai puzzle
  d'enfant »** (retour propriétaire 2026-08-07) : l'image est découpée en
  ~10 **pièces colorées** (2-4 cases, découpe déterministe), mélangées dans
  le plateau ; on choisit une pièce et on tape sa place — elle s'emboîte au
  bon endroit ou la grille vibre. Essai-erreur, pas de rotation, l'image se
  construit sous les yeux. Complétion → vague de révélation + ligne de
  savoir + 60 💠, rejouable en « REVOIR ».
- **Disponible tôt** (retour propriétaire : après la quête serveur c'était
  trop tard) : l'onglet QUÊTES s'ouvre dès la **mission 2** avec l'Atelier.
  Cohérence lore : les **mémoires visuelles** sont dans le module d'Aurore
  (à elle, accessibles d'emblée) ; seules les **Archives textuelles**
  (l'intrigue) exigent le système d'époque.
- **Décision visuels (Claude, validée « à toi de trancher ») : produits en
  interne, en mosaïque data-driven** (grille de caractères + palette par
  Mémoire, ~6 lignes de code chacune). Raisons : la révélation cellule par
  cellule EST la mécanique (impossible avec une image téléchargée) ; zéro
  contrainte de licence/attribution CC-BY dans un jeu commercial ; style
  cohérent avec la charte et recolorable par l'artiste plus tard.

## Intégration Forge d'assemblage (idée propriétaire 2026-08-07, implémentée en v1)

- La Forge porte bien son nom : elle assemble les machines **et les
  souvenirs**. Son panneau a désormais **deux postes de travail distincts** :
  « 🛠 Production d'unités » (drone ouvrier, chasseur) et « 🧩 Atelier de
  Mémoire » (la prochaine Mémoire à reconstituer, ou la Fresque à revoir).
- **L'entrée QUÊTES est conservée** (accès précoce dès la mission 2 + vue
  Fresque/liste) — la Forge est l'ancrage diégétique dans la colonie.
- **Piste d'intégration profonde (à valider)** : les premières Mémoires
  (1-4) s'assemblent dans le module d'Aurore ; à partir de la 005, « les
  pièces sont trop lourdes pour le module » → **la Forge devient requise,
  et son niveau débloque les paliers de Mémoires** (Forge niv 2 → Mémoires
  5-8, etc.). Le bâtiment devient un moteur de progression de la Fresque,
  distinct de sa capacité d'unités.

## À trancher avec le propriétaire

- La liste exacte des Mémoires (concepts) et leurs lignes de savoir.
- Pictogrammes : dessinés en grille (style pixel/mosaïque, faisable sans
  assets) ou fournis par le propriétaire.
- Le rythme (1/jour ?) et la place du Monument.
- Slice actuellement **gelée** : à implémenter lors du pont vers la prod ou
  en prototype dédié si le propriétaire veut « sentir » un niveau avant.
