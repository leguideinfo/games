# La salle d'arcade d'Awoui Universe

*Dernière mise à jour : 2026-08-06 — vision : propriétaire ; principes de design : propositions Claude à valider.*

## Pourquoi elle est clef (vision du propriétaire)

Les jeux d'arcade sont **la clef du succès et de l'adhérence à l'univers
plus large**. L'objectif de ce repo est de « produire les jeux de demain » :
des mini-jeux assez fun pour attirer et retenir, qui servent de porte d'entrée
vers le MMO, l'académie IT et l'écosystème Awoui.

## Positionnement

- L'**académie** = apprentissage structuré. La **salle d'arcade** = fun et
  réflexes, l'apprentissage passe en contrebande.
- Chaque jeu prend un concept IT réel (commandes, réseau, sécurité, hardware…)
  et le transforme en mécanique d'arcade éprouvée (rythme, runner, puzzle…).
- La formule des deux jeux existants : **concept IT × mécanique d'arcade
  culte** — PowerShell × Guitar Hero, paquet réseau × Subway Surfers.

## Principes de design (propositions — à valider)

1. **Fun d'abord** : le jeu doit être bon même pour quelqu'un qui se fiche de
   l'IT. La thématique IT est un décor et un bonus, jamais un prérequis.
2. **Sessions courtes** : parties de 1 à 5 minutes, « encore une partie ».
3. **Skill ceiling élevé** : facile à prendre en main, dur à maîtriser —
   c'est ce qui fait revenir.
4. **Score & classements** : leaderboards persistants dans Universe,
   comparaison entre joueurs/civilisations.
5. **Apprentissage implicite** : à force de jouer, on retient des vraies
   commandes, des vrais concepts (mémoire musculaire de PowerShell Hero).
6. **Récompenses croisées** : jouer à l'arcade rapporte quelque chose dans le
   MMO (ressources, cosmétiques, techs ?) — l'arcade nourrit l'adhérence.
7. **Cohérence sci-fi** : chaque jeu a une justification diégétique dans
   l'univers (simulateurs, entraînements, archives…).
8. **Web-first** : jouable dans le navigateur, léger, instantané (stack exacte
   à décider par jeu).

## Catalogue

| Jeu | Mécanique | Concept IT | Statut |
|---|---|---|---|
| PowerShell Hero | Rythme (Guitar Hero) | Commandes PowerShell | ✅ Existant sur universe.awoui.com (code chez le propriétaire, intégration ici plus tard) |
| The Flux | Runner (Subway Surfers) | Un bit traverse le réseau | ✅ Existant sur universe.awoui.com (idem) |
| **Regex Invaders** | Shoot'em up (Space Invaders) | Expressions régulières | 🔨 Prototype jouable dans ce repo (`/regex-invaders/`) |
| *(suivants)* | — | — | Voir `jeux/backlog-idees.md` |

## Contraintes techniques (confirmées par le propriétaire)

- **Full JS/CSS/HTML** vanilla, comme les jeux existants.
- **Mobile d'abord** (jouable au doigt sur téléphone), puis PC — les jeux
  actuels d'Universe sont PC uniquement, les nouveaux doivent être tactiles.
- Fun, répétable, **difficulté croissante fascinante**.
