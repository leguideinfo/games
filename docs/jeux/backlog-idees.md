# Backlog d'idées — futurs jeux de la salle d'arcade

*Propositions Claude (2026-08-06) suivant la formule maison « concept IT ×
mécanique d'arcade culte ». **Rien n'est validé** — le propriétaire tranche.
Ajouter/élaguer au fil des sessions.*

## Comment lire

Chaque idée : mécanique éprouvée + concept IT + ce qu'on retient en jouant.
Critères (voir `../salle-arcade.md`) : fun d'abord, sessions courtes, skill
ceiling, apprentissage implicite, cohérence sci-fi.

## Idées

### 1. Regex Invaders — 🔨 EN PROTOTYPE (`/regex-invaders/`)
- **Mécanique** : Space Invaders / shoot'em up.
- **Concept IT** : des vagues de chaînes de caractères descendent ; le joueur
  construit une regex qui « tire » sur toutes les chaînes qu'elle matche.
- **On retient** : les motifs regex de base puis avancés, à la difficulté.
- **Choix v1** (2026-08-06) : match ancré (chaîne entière), construction par
  tuiles tactiles, combo n², paquets alliés à épargner dès la vague 3,
  déblocage d'un module regex par vague. Voir le README du jeu.

### 2. Sudo Snake
- **Mécanique** : Snake.
- **Concept IT** : naviguer une arborescence de fichiers ; manger les bons
  fichiers (`chmod`, droits, cibles d'une consigne) sans toucher les fichiers
  système critiques qui font grandir le serpent de processus zombies.
- **On retient** : arborescence Unix, permissions, prudence du root.

### 3. Packet Panic (tour de contrôle)
- **Mécanique** : Flight Control / Mini Metro — tracer des routes au doigt.
- **Concept IT** : router des paquets entre des nœuds ; les liens saturent,
  des pannes surviennent, il faut rerouter en direct.
- **On retient** : routage, congestion, redondance. Mobile-friendly ++.

### 4. Stack Overflow (empileur)
- **Mécanique** : Tetris / Tricky Towers — empiler sous pression.
- **Concept IT** : gérer une pile d'appels : empiler les frames des fonctions
  qui s'appellent, dépiler au bon rythme, éviter le débordement de pile.
- **On retient** : pile d'appels, récursion, LIFO.

### 5. Firewall Defender
- **Mécanique** : tower defense express (vagues d'1 minute).
- **Concept IT** : configurer des règles (ports, protocoles, IP) comme des
  tourelles pour laisser passer le trafic légitime et bloquer les attaques.
- **On retient** : ports courants, règles pare-feu, faux positifs.

### 6. Bit Miner (idle/clicker)
- **Mécanique** : clicker/idle façon Cookie Clicker.
- **Concept IT** : optimiser une infra (CPU → cluster → datacenter) ; les
  upgrades sont de vrais concepts (cache, load balancer, parallélisme).
- **On retient** : vocabulaire infra + pont naturel vers la **gestion de
  civilisation** du MMO (même fibre d'optimisation).

## Priorisation (proposition)

| Critère → | Fun brut | Coût dev | Lien académie | Mobile |
|---|---|---|---|---|
| Packet Panic | ★★★ | Moyen | Réseau | ★★★ |
| Regex Invaders | ★★★ | Faible | Dev/scripting | ★★ |
| Stack Overflow | ★★ | Faible | Dev | ★★ |
| Firewall Defender | ★★ | Moyen | Sécurité | ★★ |
| Sudo Snake | ★★ | Faible | Systèmes | ★★ |
| Bit Miner | ★★ | Moyen | Infra/MMO | ★★★ |

**Suggestion de premier prototype** : *Regex Invaders* ou *Packet Panic* —
faible coût, boucle de jeu immédiatement lisible, forte identité.
