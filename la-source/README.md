# La Source — vertical slice du jeu principal

Tranche verticale jouable de la vision validée (`docs/jeu-principal-vision.md`) :
le cœur d'**Awoui Universe** — builder de colonie isométrique + moteur idle +
carte de secteur + emplacements des mini-jeux comme verbes du monde.

## Ce que contient la slice

- **Intro cinématique** (3 scènes canvas, skippable, vue une seule fois) :
  réveil de cryo sur l'AWOUI-7 → planète vierge → descente de l'Étincelle.
  En prod : remplacée/raccordée à la cinématique existante du site.
- **Colonie isométrique** (canvas, charte respectée : désert ocre, cristaux
  cyan, bâtiments titane blanc/graphite à énergie bleue, niveaux visuels
  progressifs — hauteur, antennes, balises).
- **La Source** au centre : la **balise centrale**, asset définitif du
  propriétaire (`tuile-balise.png`, faisceau détouré en matte de
  différence, halo animé léger le long du faisceau) — tout bâtiment s'y
  relie par un conduit d'énergie animé. Le **Hub réseau HUB-01**
  (asset `awoui-universe-asset-hub-reseau.png`) se pose en mission 2, puis
  s'alimente et se câble à la main (4 ports) ; le
  **drone ouvrier** vole en sprite définitif (`drone-ouvrier.png`,
  vibration légère, sans ballant) ; les amas de cristaux sont les **3
  gisements** du propriétaire (voir « Gisements de cristaux » ci-dessous).
- **Économie du vrai jeu (v2)** — alignée sur console.awoui.com :
  **Matériaux 💠** extraits, **Énergie ⚡** en capacité (Centrale) consommée
  par chaque bâtiment, **Données Eo 💾** calculées (Fermes) et stockées
  (Datacenter). Coût ×1,6 par niveau, comme en prod.
- **8 bâtiments du roster réel** : Extracteur de matériaux, Centrale
  énergétique, Entrepôt de matériaux, **Serveur** (la première machine à
  calculer des Données), Ferme de serveurs (le parc, plus tard), Datacenter,
  Baie réseau (contrats, requiert DNS), Console de commandement
  (+4 %/niv de production globale, PowerShell) — améliorations NIV 1→10.
- **Chaînes de progression émergentes** : construire coûte de l'énergie →
  il faut des Centrales ; DNS coûte 40 Eo > soute (20) → il faut Ferme puis
  Datacenter avant la recherche ; étendre coûte 450 💠 > soute (300) →
  il faut un Entrepôt.
- **Moteur idle** : production continue, gains hors-ligne calculés au retour
  (cap 2 h, 24 h avec BACKUP).
- **Éclats de matériaux ✨ (v3)** : la planète fait émerger des éclats à
  récolter au doigt, surtout près des cristaux — la toute première activité
  d'Aurore, avant tout bâtiment (couche « bambin »). Découplés de
  l'Extracteur, qui est l'automatisation.
- **Ouverture ré-ordonnée (v10)** — l'ordre validé par le propriétaire :
  **1)** taper un gisement pour y envoyer un drone ouvrier de la soute (la
  toute première action du jeu, avant tout bâtiment) · **2)** poser le **Hub
  réseau** · **3)** récolter des éclats ✨ pour l'**alimenter** (mini-jeu
  d'Amorçage) · **4)** le **câbler à la Source** (bouton 🔌). Le Hub n'est
  plus relié d'office : l'alimenter puis le câbler sont deux gestes du
  joueur. Migration automatique des parties en cours (save v10).
- **Équipements réseau, assets définitifs (v10)** : le **Hub réseau**
  (`awoui-universe-asset-hub-reseau.png`, 4 ports), le **Switch réseau**
  (`awoui-universe-asset-switch-reseau.png`, vrai switch 12 ports câblé — le
  visuel du coffret a disparu du jeu) et le **Serveur**
  (`awoui-universe-asset-server-reseau.png`, baie câblée). Tous découpés par
  la même méthode : masque couleur + **terme de structure** (les câbles et
  les socles ont la teinte du sable et échappaient au seuil couleur) +
  fermeture forte — corps pleins, câbles conservés, aucun trou. Empreinte au
  sol ramenée au corps seul : les câbles n'interdisent pas la case voisine.
- **Serveur puis Ferme de serveurs** : la colonie démarre avec **un Serveur**
  (mission du chapitre 💾 Données) ; la **Ferme** reste en jeu mais bien plus
  tard — c'est le parc, quand une machine ne suffit plus (4× le calcul, même
  asset dessiné plus grand en attendant un visuel dédié).
- **Hub réseau (ex-Coffret réseau)** : nom officiel **Hub réseau**, asset
  définitif du propriétaire (`awoui-universe-asset-hub-reseau.png`),
  **4 ports**. L'ancien visuel du coffret sert désormais au **Switch réseau**.
- **Gisements de cristaux (v8.6)** : les amas sont les **3 assets définitifs**
  du propriétaire (`awoui-universe-assets-tuile-cristaux-small/medium/big.png`),
  découpe « écart au sable » qui **préserve les fissures du sol** autour de la
  base (elles se fondent dans le terrain, sable résiduel recalé sur le sol du
  jeu). Chaque gisement a une **taille** (graine de la case ; garantie de
  spawn : les 3 plus proches de la Source font un petit, un moyen, un grand)
  qui fixe son **stock** (120/240/360 💠 = 1x/2x/3x) et sa **vitesse
  d'extraction** (0,6/1,2/1,8 💠/s = 1x/2x/3x par drone). Un **compteur**
  s'affiche au-dessus du cristal en cours d'extraction (ou entamé) avec barre
  de progression du stock. Gisement épuisé → la case redevient du sable
  constructible et le **drone rentre en soute** ; les gains hors-ligne des
  drones sont plafonnés par le stock réel (sauvegarde v8, stock persisté).
  **2 drones ouvriers en soute dès le départ** : taper un gisement envoie un
  drone l'extraire (vol animé depuis la Source) — les premières ressources
  arrivent **avant** le premier Extracteur, avec une mission tuto dédiée
  (26 missions, migrations de sauvegarde v4→…→v8). La Forge en assemble
  d'autres ensuite ; les drones de soute ne comptent pas contre sa capacité.
- **Découverte pas-à-pas (v3)** : au départ, l'écran ne montre que le terrain,
  la Source et le compteur de matériaux. Les 14 missions déroulent la
  découverte dans un ordre logique : éclats → Extracteur (⚡ apparaît) →
  amélioration → Entrepôt → Centrale → Ferme (💾 apparaît) → Datacenter →
  onglet TECHNOS (DHCP, DNS) → onglet CARTE → Baie réseau → Surcharge →
  Console → expansion. Chaque bâtiment, ressource, onglet et mécanique
  n'apparaît qu'au moment où sa mission le rend évident.
- **Technologies** : DHCP (auto-collecte), DNS (débloque la Carte + Tour +
  Baie réseau), FIREWALL (débloque le Bastion), BACKUP — reprises des
  « effets réseaux » de la charte.
- **Carte du secteur** : starfield, ta colonie au centre, 8 colonies voisines
  (placeholder du multi asynchrone v1 : visites & fédérations à venir).
- **Flotte en orbite (v1)** : depuis la CARTE, taper sa propre colonie ouvre
  le **plan de disposition de la flotte** — la planète au centre, trois
  anneaux (Basse 6 / Moyenne 8 / Haute 10 créneaux) tournant chacun à sa
  vitesse, vaisseaux orientés le long de leur orbite, moitié arrière
  atténuée derrière la planète. Taper un créneau libre déploie un Chasseur
  disponible ; taper un vaisseau le rappelle au sol. L'affectation vit sur
  l'unité (`u.orb`), donc sauvegardée — et un chasseur en orbite n'est plus
  disponible au sol (défendre la colonie OU tenir l'orbite : un vrai choix).
  À venir : effets de la disposition (couverture par anneau, interception),
  variantes de vaisseaux du Chantier spatial. Hooks : `orbOpen/orbDeploy/
  orbRecall/orbInfo`.
- **Surcharge (⚡)** : mini-défi de synchronisation sur les bâtiments → buff
  de production ×2 min. **Mécanique validée telle quelle par le propriétaire
  (2026-08-06)** : elle reste une action native de la colonie. L'intégration
  des mini-jeux d'arcade (Admin Rush, Regex Invaders, The Flux, PowerShell
  Hero) se fera via **un autre système, à concevoir plus tard** — pistes en
  vrac (hypothèses) : bâtiment « Salle d'arcade » dans la colonie, contrats
  de la Baie réseau qui lancent un mini-jeu, terminaux dédiés.
- **Missions guidées** (21 étapes, re-séquencées v7) : elles SONT le système
  de déblocage, organisées en chapitres de ressources — 💠 Matériaux
  (éclats → Extracteur → amélioration → **palier « atteins 250 💠 »** →
  Entrepôt), ⚡ Énergie (Centrale → **Centrale NIV 2**),
  💾 Données (Ferme → **palier « accumule 12 Eo »** → Datacenter), 🌐 Réseau
  & technologies, 🔧 Commandement & unités. Chaque bâtiment n'arrive
  qu'après un moment passé à **ressentir** la ressource qu'il sert
  (jauge qui se remplit, plafond atteint, consommation qui monte) — plus
  d'enchaînement pose-sur-pose. Migration automatique des sauvegardes.
- **Guidage visuel (v4.2)** : la mission en cours pointe sa cible — losange
  ambre pulsant + chevron ▼ dans le monde (case à construire près de la
  Source, bâtiment à améliorer, Forge, parasite, la Source pour
  l'expansion, cristaux en mode placement) et surbrillance pulsante du bon
  bouton dans l'interface (carte du menu Construire, onglets TECHNOS/CARTE,
  AMÉLIORER, SURCHARGE, assemblage, technologie, ÉTENDRE). Un enfant suit
  la lumière.
- **Forge d'assemblage & unités (v4)** : la Forge assemble les premières
  unités (capacité = niveaux de Forge + 3, dont les 2 drones de soute) —
  **Drone récolteur 🛸** (80 💠) : se pose sur un gisement et l'extrait à la
  vitesse du gisement (+36/+72/+108 💠/min selon la taille, jusqu'à
  épuisement du stock) — les cristaux sont une ressource exploitable et
  finie, en plus du bonus d'adjacence des Extracteurs ;
  **Chasseur 🚀** (120 💠 + 5 Eo) : patrouille au-dessus de la Forge.
- **Parasites de données 🕷 (v4)** : ils apparaissent sur les cases aux
  frontières du territoire (max 2), ralentissent l'extraction (−15 %) tant
  qu'ils rôdent. Taper un parasite envoie un Chasseur au combat (vol animé,
  récompense en 💠). Les expansions agrandissent la frontière… et le
  terrain de chasse. En prod : premier pas vers le PvE/PvP cyber de la
  vision (intrusion/défense).
- **Trafic de drones 16 directions (v11)** : illusion de 3D par sprites
  pré-rendus (`awoui-universe-assets-drone-test.png`, atlas 4×4 embarqué) —
  aucun rendu 3D. Le cap est l'angle **écran** de la trajectoire, lissé
  (≤ 4,2 rad/s) puis quantifié en 16 secteurs ; les vues de dos absentes de
  la planche sont couvertes par **miroirs horizontaux** (table calibrée en
  vol, 9 orientations traversées sur un demi-tour mesuré). Trajectoires en
  **Bézier cubiques** (contrôles décalés perpendiculairement, amplitude
  aléatoire bornée), profil accélération → croisière → ralentissement,
  altitude simulée avec **ombre séparée au sol** (taille/opacité selon
  l'altitude), états TAKEOFF/TRAVEL/APPROACH/LANDING/WORKING/retour.
  **TrafficManager piloté par l'état réel** : les extracteurs génèrent des
  rotations vers l'entrepôt (coupées si entrepôt plein), les serveurs vers
  le datacenter, les chantiers du miroir attirent un drone ; panne
  d'énergie → trafic réduit de moitié. Pool fixe de 14 (zéro allocation en
  régime), profondeur via la passe triée existante (passe devant/derrière
  les bâtiments), rien en sauvegarde. Hooks : `droneRun/droneInfo/droneCal`.
- **Pose en aperçu & déplacement (v9)** : la pose passe par un **fantôme**.
  Trois gestes mènent au même résultat — **glisser** une carte du menu sur le
  terrain, **taper** son nom puis viser et ✅, ou (chemin historique) case
  présélectionnée + bouton prix. Bouton flottant **🔨 CONSTRUIRE** pour ouvrir
  la palette sans avoir à trouver une case libre. Sous le fantôme :
  **l'empreinte au sol** en vert/rouge + **la marge en pointillé** (le « petit
  bord » visible), et l'obstacle entouré de rouge pulsant avec la raison écrite
  (« C'est la Source », « Trop près — laisse un peu de bord », « ⛰ Relief
  rocheux »…). **Rien n'est débité avant la confirmation** — annuler ne coûte
  rien (corrige au passage une perte de 80 💠 si on rechargeait pendant la pose
  d'un drone). Le drone ouvrier passe par le même moteur.
  **🚚 DÉPLACER** dans la fiche d'un bâtiment : 60 % de son prix courant
  (plancher 60 💠), niveaux conservés, et **les câbles suivent** — l'identité
  réseau d'un bâtiment étant sa position, les liens sont remappés à l'arrivée.
  Correction d'ergonomie trouvée au passage : `body{touch-action:none}`
  empêchait la palette de défiler au doigt, donc les derniers bâtiments
  étaient **inatteignables sur mobile**.
- **Persistance** locale (`localStorage`) + reprise hors-ligne.
- **Intuitivité enfant (v6.1)** : l'intro avance au tap sur la scène
  (après 1,2 s d'animation) ; le bouton COLONIE, déjà actif, ouvre
  directement l'action de la mission en cours (poser/améliorer/Source) ;
  « Pluie d'éclats » : 3 éclats récoltés en rafale (< 5 s) déclenchent un
  mini-jeu éclair au centre de l'écran — 6 s d'étincelles à taper vite
  (+5+niv 💠 chacune), au plus une fois toutes les 90 s.
- **Éboulis simples (v6.1)** : mix ~50/50 avec les crevasses — tap →
  🚜 DÉBLAYER (30 💠, instantané). Des éboulis réapparaissent lentement
  sur le territoire (1 toutes les ~4 min, max 3 en attente).
- **Crevasses & puzzle de colmatage (v5.2)** : avant la mission 3, simples
  cases de sable assombri ; à la mission 3, « le sol tremble » et les
  **crevasses s'ouvrent** (failles uniformes, lueur des profondeurs), la
  première signalée par un halo orange + « ? ». Tap → **mini-jeu de
  colmatage façon Tetris tactile** : une fosse 6×8 au sol irrégulier, des
  pièces de 2-3 blocs (tap sur une colonne = chute, bouton 🔄 = rotation),
  des 💠/💾 enfouis capturés en les recouvrant, 10 blocs maximum. Bonus
  « colmatage parfait » si aucun trou n'est enterré, puis la case devient
  constructible. Calme, sans chrono, gratuit : le jeu EST l'effort.
- **Drone ouvrier (v4.4)** : renommage du drone récolteur ; textes de tous
  les bâtiments/techs raccourcis au strict utile.
- **Expansion du territoire** (v1.2) — trois étages :
  1. **Colmater** les crevasses (puzzle ci-dessus) libère des cases ;
  2. **Étendre le territoire** depuis la Source : le plateau gagne un anneau
     complet (9×9 → 11×11 → … → 17×17), coût exponentiel (450/1350/4050/12150 ⚡ — la capacité de stockage doit suivre),
     terrain procédural stable par coordonnée ;
  3. **Cristaux stratégiques** : indéblayables, mais +15 % de production par
     cristal adjacent à un Extracteur — l'expansion révèle des emplacements
     convoités. (Étage 4 en prod : coloniser d'autres nœuds via la Sonde
     d'exploration.)

- **Pipeline de sprites (v7.2)** : `regSprite(type, dataURI, fumées)` branche
  une image iso sur un type de bâtiment — dessinée à l'ancre du socle,
  y-sortée, mise à l'échelle avec le niveau, fumée animée par cheminée.
  **Tuiles-bâtiments définitives (v8.4)** : l'Extracteur, la Centrale et
  l'Entrepôt sont les **assets-tuiles du propriétaire**
  (`assets/sprites/tuile-extracteur/centrale/entrepot.png`, remplacent
  les anciens sprites) — bake « sprite » comme les cristaux : bâtiment préservé par
  masque couleur + composante connexe (les décorations éloignées de la
  tuile sont jetées), halo de sol compact dont la teinte est mesurée puis
  alignée sur l'étalonnage du plateau. **Tout tient dans la case** (léger
  bord intérieur, jamais de débordement). Les autres bâtiments suivront
  au même format de tuile.
- **Terrain infini (v8)** : la map fixe est remplacée par la **tuile
  seamless du propriétaire** répétée en pattern GPU + **variations
  procédurales** (teintes par blocs, fissures/cailloux/plaques par case,
  stables par graine — exemples canvas remplaçables par des decals) +
  **décor** (cristaux et rochers du propriétaire partout, éboulis en
  jeu = rocher). Caméra libre bornée autour du territoire, zoom
  0,55–2,4 avec LOD (decals masqués de loin), expansion débornée.
  Voir `docs/terrain-infini.md`.
- **Carte-monde (v7.4, remplacée par la v8 ci-dessus)** : la map illustrée du
  propriétaire (`assets/map-test.png`, WebP embarqué) couvre **tout le
  champ de jeu** — plus aucun bord de plateau visible : les bords de la
  map sont les bords de l'écran. La **caméra est bornée** à l'image
  (zoom minimal dynamique) et démarre légèrement zoomée pour laisser du
  déplacement. Seul le **territoire débloqué** montre la découpe de
  grille. **Échelle (retour propriétaire)** : la map couvre **~11,4
  cases de large** pour des cases et bâtiments imposants ; l'expansion
  en anneaux est bornée à **11×11**. **Ancrage exact des sprites
  (v7.5)** : chaque sprite déclare les coins gauche/droit de sa PLAQUE
  colorée (mesurés au contour dur : Extracteur = x 18→245,7, hauteur
  101,5) ; le rendu pose ces coins sur les coins ouest/est de la
  cellule — la base tient dans la case (la plaque de l'Extracteur est
  asymétrique, sommet sud décentré : il tombe sur l'arête sud-est).
  Prochains assets : viser une base en losange 2:1 **symétrique**
  (sommet sud au centre, chute coins→sud = largeur/4) pour un calage
  parfait des quatre coins.
  À terme (idée propriétaire) :
  l'agrandissement ne sera plus des anneaux perpétuels mais une
  **extension des côtés de la map**. (`terrain-plateau.png` = ancien
  essai plateau, conservé en référence.)

## Contrôles

- **Mobile** : glisser = caméra, pincer ou boutons ± = zoom, tap = tout
  (case libre → construire, bâtiment → panneau, orbe → collecte, Source →
  état de la colonie).
- **PC** : molette = zoom, clic = idem.

## Correspondance slice → prod

| Slice | Prod (universe.awoui.com) |
|---|---|
| `localStorage` | PostgreSQL (backend existant) + calcul serveur des gains idle |
| Voisins placeholder | Vraies colonies des joueurs (multi asynchrone v1) |
| Surcharge QTE | Conservée telle quelle (décision 2026-08-06) |
| Formes canvas | Assets définitifs de la charte (sprites iso) |
| Intro canvas | Cinématique existante du site |
| Missions 7 étapes | Onboarding complet + académie |

## Mode miroir (embarquée dans concept.html — onglet « La Source »)

La slice est le **plateau du jeu principal** : concept.html pousse par
`postMessage` (`awoui:chantier`, à chaque rendu du Chantier + 1 Hz vue ouverte)
les bâtiments achevés (posés en anneaux autour de la Source, autolink, niveaux
imposés), la **file en cours rendue en fantômes minutés « 🏗 Ns »** (jamais de
pose instantanée — le bâtiment fini prend la case de son fantôme), les
ressources (HUD local caché, doublon du HUD principal), les défenses (compte =
niveau) et les technos (DNS du parcours → Carte). **Bidirectionnel** : la
palette 🔨 reste active et poser/améliorer depuis le plateau émet
`awoui:build {id}` vers le jeu principal — qui juge (plan redécouvert, soutes,
énergie, file de 3) et répond par le flux ; la case choisie est mémorisée
(`MIRROR_WISH`) et le fantôme s'y installe. En miroir : `save()` coupée
(`ls-save-v4` intact), production idle gelée, missions/technos locales gelées.
Correspondances ids prod ↔ slice : `baie↔datacenter`, `dhcp↔dhcpsrv`,
`coffre↔coffrefort` ; `nexus` sans équivalent (entrée BT à créer). Le
standalone `/la-source/` direct reste un jeu complet, intact.

## Technique

Un seul `index.html` — canvas 2D isométrique + DOM pour l'UI, vanilla JS,
zéro dépendance, sons WebAudio, mobile-first. Grille 9×9 (extensible),
terrain seedé stable, `window.__api` pour les tests automatisés
(Playwright dans le repo de dev).

## Backlog immédiat (après feedback)

- Concevoir le système dédié d'intégration des mini-jeux (voir décision
  Surcharge ci-dessus) — salle d'arcade en jeu ? contrats ? terminaux ?
- Unités supplémentaires de la charte (véhicule, cargo, sonde d'exploration).
- Sprites définitifs à partir des assets du propriétaire.
- Pont vers la prod : PostgreSQL + universe.awoui.com (depuis la maison).
