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
- **La Source** au centre : faisceau bleu, cœur pulsant, tout bâtiment s'y
  relie par un conduit d'énergie animé.
- **Économie du vrai jeu (v2)** — alignée sur console.awoui.com :
  **Matériaux 💠** extraits, **Énergie ⚡** en capacité (Centrale) consommée
  par chaque bâtiment, **Données Eo 💾** calculées (Fermes) et stockées
  (Datacenter). Coût ×1,6 par niveau, comme en prod.
- **7 bâtiments du roster réel** : Extracteur de matériaux, Centrale
  énergétique, Entrepôt de matériaux, Ferme de serveurs, Datacenter,
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
- **Surcharge (⚡)** : mini-défi de synchronisation sur les bâtiments → buff
  de production ×2 min. **C'est l'emplacement où se branchent les vrais
  mini-jeux** (affiché en jeu) : Ferme → Admin Rush, Extracteur → Regex Invaders,
  Baie réseau → The Flux, Console de commandement → PowerShell Hero.
- **Missions guidées** (17 étapes) : elles SONT le système de déblocage.
- **Forge d'assemblage & unités (v4)** : la Forge assemble les premières
  unités (capacité = niveaux de Forge + 1) —
  **Drone récolteur 🛸** (80 💠) : se pose sur un champ de cristaux et le
  récolte (+36 💠/min) — les cristaux deviennent une ressource exploitable,
  en plus du bonus d'adjacence des Extracteurs ;
  **Chasseur 🚀** (120 💠 + 5 Eo) : patrouille au-dessus de la Forge.
- **Parasites de données 🕷 (v4)** : ils apparaissent sur les cases aux
  frontières du territoire (max 2), ralentissent l'extraction (−15 %) tant
  qu'ils rôdent. Taper un parasite envoie un Chasseur au combat (vol animé,
  récompense en 💠). Les expansions agrandissent la frontière… et le
  terrain de chasse. En prod : premier pas vers le PvE/PvP cyber de la
  vision (intrusion/défense).
- **Persistance** locale (`localStorage`) + reprise hors-ligne.
- **Expansion du territoire** (v1.2) — trois étages :
  1. **Déblayer** les éboulis rocheux (tap sur un rocher, 50 💠) ;
  2. **Étendre le territoire** depuis la Source : le plateau gagne un anneau
     complet (9×9 → 11×11 → … → 17×17), coût exponentiel (450/1350/4050/12150 ⚡ — la capacité de stockage doit suivre),
     terrain procédural stable par coordonnée ;
  3. **Cristaux stratégiques** : indéblayables, mais +15 % de production par
     cristal adjacent à un Extracteur — l'expansion révèle des emplacements
     convoités. (Étage 4 en prod : coloniser d'autres nœuds via la Sonde
     d'exploration.)

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
| Surcharge QTE | Les mini-jeux réels de la salle d'arcade |
| Formes canvas | Assets définitifs de la charte (sprites iso) |
| Intro canvas | Cinématique existante du site |
| Missions 7 étapes | Onboarding complet + académie |

## Technique

Un seul `index.html` — canvas 2D isométrique + DOM pour l'UI, vanilla JS,
zéro dépendance, sons WebAudio, mobile-first. Grille 9×9 (extensible),
terrain seedé stable, `window.__api` pour les tests automatisés
(Playwright dans le repo de dev).

## Backlog immédiat (après feedback)

- Brancher réellement un mini-jeu dans la Surcharge (Admin Rush, même fichier).
- Extension de la grille (défricher les cases cristal/rocher).
- Console de commandement & Forge d'assemblage (charte) : file de production
  d'unités (drone, véhicule, sonde…).
- Sprites définitifs à partir des assets du propriétaire.
