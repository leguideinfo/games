# Awoui Universe — le MMO (universe.awoui.com)

*Dernière mise à jour : 2026-08-06 — source : propriétaire (conversation).*

## Concept

**Awoui Universe** est un **MMO persistant d'apprentissage IT** dans un univers
**science-fiction**. On y apprend l'informatique en jouant, dans un monde qui
continue d'exister et d'évoluer entre les sessions.

## Les trois systèmes qui s'imbriquent

1. **L'académie IT** — le cœur pédagogique : c'est là qu'on apprend
   l'informatique (parcours, cours, exercices — détail exact à documenter).

2. **La gestion de civilisation** — un système de management de civilisation
   qui tourne **en parallèle** de l'académie : le joueur développe/administre
   une civilisation dans l'univers persistant.

3. **Les technologies** — le **pont entre les deux** : les technologies relient
   l'apprentissage IT et la civilisation (ce qu'on apprend à l'académie
   débloque/alimente le développement de la civilisation).

> Détail des mécaniques exactes (ressources, progression, arbre technologique,
> multijoueur) : **à documenter** avec le propriétaire au fil des sessions.

## La salle d'arcade

À l'intérieur d'Universe, une **salle d'arcade** regroupe des **mini-jeux
centrés sur le fun et les réflexes** — par opposition au sérieux de l'académie.
Elle est considérée comme **stratégiquement clef** pour l'adhérence des joueurs
à l'univers. Voir `salle-arcade.md`.

Jeux existants :

- **PowerShell Hero** — les commandes PowerShell façon Guitar Hero
  (`jeux/powershell-hero.md`)
- **The Flux** — un bit de données traverse le réseau et esquive les obstacles,
  façon Subway Surfers (`jeux/the-flux.md`)

## État technique

- Le site est en production derrière **Cloudflare** (filtrage actif).
- Le code source est en prod et/ou sur la machine locale du propriétaire —
  **pas sur GitHub** pour l'instant.
- Ce repo (`leguideinfo/games`) sert à produire les **nouveaux jeux** destinés
  (à terme) à intégrer la salle d'arcade.
