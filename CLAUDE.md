# Contexte pour Claude — repo `leguideinfo/games`

> Lis ce fichier en premier. Il pointe vers la base de connaissances du projet.
> Langue de travail : **français**.

## De quoi il s'agit

Ce repo sert à concevoir et produire les **jeux de la salle d'arcade** d'**Awoui Universe**
(universe.awoui.com), un MMO persistant d'apprentissage IT à l'univers sci-fi.
Les jeux d'arcade sont considérés comme **la clef du succès et de l'adhérence**
à l'univers plus large : c'est ici qu'on les invente et qu'on les développe.

## Base de connaissances (à lire selon le besoin)

| Fichier | Contenu |
|---|---|
| `docs/univers-awoui.md` | L'écosystème Awoui dans son ensemble (Awoui, LeGuideInfo, Universe) |
| `docs/universe-mmo.md` | Le MMO : académie IT, gestion de civilisation, technologies |
| `docs/salle-arcade.md` | Vision et principes de design de la salle d'arcade |
| `docs/jeu-principal-vision.md` | Proposition « La Source » : le jeu principal unifié (builder + carte-réseau + idle + mini-jeux comme verbes) — à trancher avant prod |
| `docs/jeux/admin-rush.md` | Suivi d'Admin Rush (produit ici, validé, en attente du contenu de formation pour passage en prod) |
| `docs/jeux/powershell-hero.md` | Fiche du jeu existant PowerShell Hero |
| `docs/jeux/the-flux.md` | Fiche du jeu existant The Flux |
| `docs/jeux/backlog-idees.md` | Backlog d'idées de nouveaux jeux (propositions à valider) |

## Règles de travail

- Chaque jeu vit dans son propre dossier à la racine (`/<nom-du-jeu>/`) avec son
  README, `src/`, `assets/` — voir le README racine.
- Les fiches de `docs/` sont la source de vérité du contexte : **mets-les à jour**
  quand une décision est prise ou qu'une info nouvelle arrive du propriétaire.
- Distingue toujours dans les docs ce qui est **confirmé** (dit par le propriétaire
  ou vérifié) de ce qui est **hypothèse/proposition**.

## Contraintes d'environnement connues

- Le code du site universe.awoui.com n'est **pas** dans ce repo (en prod / machine
  locale du propriétaire) ; le site est derrière un filtrage Cloudflare.
- Les sessions Claude Code web ont eu un accès réseau sortant restreint : ne pas
  compter sur le scraping du site ; se baser sur ces docs et sur le propriétaire.
- Repo frère : `leguideinfo/mini-games` (accessible via la même organisation).

## Propriétaire

- Compte GitHub : `leguideinfo` — LeGuideInfo est la branche **apprentissage
  académique** de l'écosystème Awoui. Contact : contact@leguideinfo.com.
