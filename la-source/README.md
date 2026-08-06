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
- **6 bâtiments** : Extracteur de Flux, Baie de stockage, Ferme de serveurs,
  Tour de résolution (DNS), Baie réseau, Bastion pare-feu — coûts croissants,
  améliorations NIV 1→10.
- **Moteur idle** : production continue, orbes de Flux à collecter au doigt
  (couche « bambin »), gains hors-ligne calculés au retour (cap 2 h, 24 h
  avec BACKUP).
- **Technologies** : DHCP (auto-collecte), DNS (débloque la Carte + Tour +
  Baie réseau), FIREWALL (débloque le Bastion), BACKUP — reprises des
  « effets réseaux » de la charte.
- **Carte du secteur** : starfield, ta colonie au centre, 8 colonies voisines
  (placeholder du multi asynchrone v1 : visites & fédérations à venir).
- **Surcharge (⚡)** : mini-défi de synchronisation sur les bâtiments → buff
  de production ×2 min. **C'est l'emplacement où se branchent les vrais
  mini-jeux** (affiché en jeu) : Ferme → Admin Rush, Bastion → Regex
  Invaders, Baie réseau → The Flux, Extracteur → PowerShell Hero.
- **Missions guidées** (8 étapes) : le tutoriel de la boucle complète.
- **Persistance** locale (`localStorage`) + reprise hors-ligne.
- **Expansion du territoire** (v1.2) — trois étages :
  1. **Déblayer** les éboulis rocheux (tap sur un rocher, 50 ⚡) ;
  2. **Étendre le territoire** depuis la Source : le plateau gagne un anneau
     complet (9×9 → 11×11 → … → 17×17), coût exponentiel (150/450/1350/4050 ⚡),
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
