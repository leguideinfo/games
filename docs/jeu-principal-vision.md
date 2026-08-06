# Le jeu principal d'Awoui Universe — vision « La Source »

*Proposition Claude (2026-08-06). **✅ VALIDÉE par le propriétaire le 2026-08-06**,
avec les précisions ci-dessous.*

## Décisions actées (2026-08-06)

- ✅ **Concept global validé** (« je valide », « tout le reste tient la route »).
- ✅ **Lore existant à respecter** : le personnage principal s'appelle
  **Aurore** ; elle se réveille d'une **cryogénisation sur un vaisseau-colonie**
  et descend sur une **planète vierge** — déjà implémenté **avec cinématique**
  sur universe.awoui.com. Précision importante : **on descend avec une base
  dans la soute (matériaux)** — on ne part pas de zéro absolu. L'Étincelle/la
  Source s'insère comme **concept abstrait de l'âme / énergie initiatrice**
  (le cœur du monde), en complément de la base matérielle.
- ✅ **Backend actuel : PostgreSQL** (pour la persistance à terme).
- ✅ **Direction artistique reçue** (voir `assets/charte-graphique.png` et
  `assets/terrain-reference.png`) : vue isométrique ; bâtiments titane blanc +
  graphite + verre tech à énergie bleue ; désert ocre à cristaux cyan ;
  niveaux visuels NIV 1/3/5/10 ; bâtiments IT nommés (Baie de stockage, Ferme
  de serveurs, **Tour de résolution** (DNS), Baie réseau, Console de
  commandement, Forge d'assemblage, Citadelle) ; unités (drone, véhicule,
  cargo, sonde, chasseur, frégate, porte-nefs) ; effets réseaux DHCP / DNS /
  AD / FIREWALL / BACKUP ; palette officielle blanc-gris-noirs + bleu, orange,
  rouge, vert, violet ; environnements désert/cristaux/plateau/canyon/
  cratère/ruines ; routes & conduits NIV 1-5.
- ✅ **V1 multijoueur asynchrone** (recommandation acceptée implicitement).
- 🔨 **Vertical slice « La Source » en cours dans ce repo** (`/la-source/`).

## Le constat (propriétaire — confirmé)

Universe a aujourd'hui un accueil + une liste de bâtiments à construire, mais
**pas de vrai jeu permanent à part entière**. Il faut :

- un **style de jeu principal identifiable et largement aimé**, qui soit
  l'interface principale elle-même ;
- du **groupe** et une **vue d'ensemble** ;
- démarrer **de rien, d'une source**, puis évoluer, progresser, rencontrer,
  collaborer, combattre, dans un univers **évolutif et infini** ;
- que **tous les mini-jeux soient unifiés** (fun, progression, interaction) ;
- que ça marche **du bambin au grand-père**, en s'adaptant.

## La proposition en une phrase

> **Un builder de colonie vu du dessus (le style le plus universellement aimé :
> SimCity/Clash of Clans), posé sur une carte-réseau infinie et partagée
> (l'univers = un réseau galactique), animé par un moteur idle (ta colonie vit
> et produit même quand tu dors), où les mini-jeux d'arcade ne sont pas un
> à-côté mais LES actions du monde.**

Nom de travail du concept : **« La Source »** (à valider/renommer).

## Les 5 piliers

### 1. On naît d'une Source
Chaque joueur commence comme une **étincelle de données** issue de la Source.
Onboarding de 5 minutes sans un mot de jargon : tu atterris sur un nœud vide,
tu collectes du **Flux** (la ressource universelle : énergie/données), tu poses
ton premier générateur, la caméra dézoome… et tu découvres que le ciel est
plein des lumières des autres. De rien → quelque chose → les autres.

### 2. La carte-réseau infinie (la « vue d'ensemble »)
Un seul continuum zoomable : **ma base → mon secteur → la galaxie**.
L'univers est un réseau : les colonies sont des nœuds, les relations des
liens. Carte procédurale, donc **infinie**, qui s'étend à mesure que les
joueurs colonisent. La carte EST le menu : tout se lance depuis elle
(pas d'interface « site web » par-dessus le jeu).

### 3. Le moteur idle (la persistance qui fait revenir)
La colonie produit du Flux en continu (serveur persistant → vrai MMO).
Boucle courte : récolter / poser / améliorer. Boucle longue : débloquer des
**Technologies** (l'arbre tech = le vrai curriculum IT d'Awoui, du binaire
à la PKI). L'idle est le genre le plus accessible qui existe : un enfant de
4 ans comme un retraité comprennent « ça grandit, je récolte ».

### 4. Les mini-jeux sont les verbes du monde (l'unification)
**Règle d'or : aucun mini-jeu hors-sol.** Chaque jeu d'arcade est l'action
concrète d'un système de la colonie, et son score a un effet durable :

| Mini-jeu | Verbe dans le monde | Effet persistant |
|---|---|---|
| The Flux | **Transporter** des données entre nœuds | Débit des liens, revenus de commerce |
| PowerShell Hero | **Entraîner** ses unités d'admins | Vitesse d'exécution des tâches de la colonie |
| Admin Rush | **Opérer** ses services en production | Uptime → multiplicateur de production |
| Regex Invaders | **Filtrer** le trafic entrant | Qualité du pare-feu de la colonie |
| (futurs jeux) | Chaque nouveau jeu = un nouveau verbe | … |

Le joueur qui ne veut PAS jouer à un mini-jeu ne bloque jamais : l'action se
fait automatiquement en mode idle, juste plus lentement / moins bien. Le
mini-jeu est le **turbo skill-based**, pas un péage.

### 5. Profondeur par couches (du bambin au grand-père)
Pas de « mode enfant » : **un seul monde, plusieurs façons valides d'y
contribuer**, révélées progressivement (progressive disclosure) :

- **Couche 1 — Toucher** (sans lecture) : récolter, poser, décorer, regarder
  grandir. Un bambin est 100 % joueur légitime.
- **Couche 2 — Réflexes** : les mini-jeux d'arcade, scores et classements.
- **Couche 3 — Systèmes** : optimiser la colonie, l'arbre tech, le commerce.
- **Couche 4 — Savoir** : l'académie IT ; les connaissances réelles débloquent
  ce que rien d'autre ne débloque (la PKI du jeu s'apprend comme la vraie).

La même colonie familiale peut être jouée aux 4 couches en même temps :
le petit récolte et décore pendant que le parent configure la PKI.
L'interface s'adapte au comportement (ce qu'on utilise grossit, le reste se
range) plutôt qu'à un âge déclaré.

## Multijoueur : fédérations, coopération, « combat »

Cohérent avec l'ADN d'Awoui (souveraineté, fédération) :

- **Rencontrer** : les colonies voisines sur la carte ; visiter = voir la base
  de l'autre.
- **Collaborer** : les groupes sont des **fédérations** (guildes) ; projets
  communs à grande échelle (backbone inter-colonies, méga-structures) où
  chacun contribue à sa couche (le bambin récolte pour le chantier, l'expert
  débloque la tech qui le permet).
- **Combattre** : le PvP est **cyber, pas militaire** — intrusion contre
  défense. Attaquer = jouer des mini-jeux d'attaque contre les défenses de
  l'autre (ses scores de pare-feu, son infra). On ne rase pas une colonie :
  on siphonne du Flux, on tague, on se fait une réputation. Compatible tous
  âges, et thématiquement parfait (sécurité informatique).
- **Sécurité des mineurs** (à traiter sérieusement avant prod) : pas de chat
  libre par défaut (emotes/messages prédéfinis), fédérations sur invitation,
  conformité RGPD/mineurs à étudier.

## Les boucles de jeu

- **30 secondes** : récolter le Flux, poser/améliorer un bâtiment.
- **Une session (5-15 min)** : un ou deux mini-jeux « turbo », une décision
  de colonie, un coup d'œil à la carte et à la fédération.
- **Une semaine** : une technologie majeure, un chantier de fédération, un
  événement d'univers (vague d'intrusion globale, découverte d'un secteur…).
- **Une saison** : l'univers évolue (nouveau secteur, nouvelle ère tech).

## Par quoi on commence (proposition de plan)

1. **Trancher 5 décisions** (propriétaire) :
   - a. Ce concept global — oui / à amender / non ;
   - b. Le style visuel de référence (le propriétaire peut fournir les assets) ;
   - c. V1 multijoueur : **asynchrone d'abord** (on voit les colonies des
     autres, on interagit en différé — 10× plus simple que du temps réel, et
     suffisant pour « rencontrer/collaborer ») — recommandation Claude ;
   - d. Stack backend cible pour la persistance (à voir avec le code du site,
     de retour à la maison) ;
   - e. Le nom (« La Source » ?).
2. **Vertical slice dans ce repo** (faisable en sessions web, sans le code du
   site) : une tranche jouable solo de la boucle complète — naissance depuis
   la Source → première colonie → moteur idle → carte zoomable → UN mini-jeu
   branché comme verbe (Admin Rush ou Regex Invaders, déjà prêts) →
   persistance locale. Mobile-first, vanilla JS, comme le reste.
   **C'est la maquette de référence pour la prod.**
3. **Intégration des assets** du propriétaire quand ils arrivent.
4. **Doc technique multi/backend** une fois la slice validée (modèle de
   données, sync, anti-triche léger, coûts serveur).
5. **Passage en prod** sur universe.awoui.com (avec le code du site, à la
   maison).

## Questions ouvertes

- Que garde-t-on de l'existant (accueil + liste de bâtiments) comme base ?
- Économie : le Flux unique suffit-il, ou 2-3 ressources (Flux / Savoir /
  Réputation) ?
- Lien académie ↔ jeu : les certifications réelles donnent-elles des bonus
  en jeu ? (proposition : oui, c'est le pont LeGuideInfo.)
- Monétisation / gratuité (positionnement Awoui à respecter).
