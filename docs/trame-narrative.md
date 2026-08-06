# Trame narrative d'Awoui Universe — les Archives de l'humanité

*Trame **confirmée par le propriétaire** (2026-08-06). Les textes des fragments
sont des brouillons Claude **à écrire/valider par le propriétaire**.*

## La trame initiale

- **Aurore se réveille sans rien savoir** : ni pourquoi elle est là, ni ce qui
  s'est passé avant dans l'histoire de l'humanité. L'amnésie est le moteur
  narratif du jeu.
- **Le plot twist — l'histoire à découvrir — réside dans les Archives de
  l'humanité**, stockées dans un **format ancien**, lisible uniquement avec
  les **systèmes d'époque**.
- En **déployant ces systèmes**, le joueur découvre et **décrypte les
  archives**, fragment par fragment, et reconstitue l'histoire du passé.
- Les systèmes d'époque sont **à double usage** : lire les Archives ET être
  revisités pour **servir la colonie naissante** (le rétro-computing devient
  l'infrastructure réelle du joueur).

## La séquence « conception d'un serveur »

Premier grand jalon de cette trame : **assembler un système d'époque** en
choisissant du matériel cohérent — carte mère, processeur, mémoire, stockage,
réseau (« toute la cavalerie »).

- Le joueur choisit **parmi plusieurs matériels plausibles**, dont les
  mauvais choix produisent des **erreurs de compatibilité réelles et
  pédagogiques** (socket, génération de RAM, redondance disque…).
- **La configuration correcte correspond au système réellement accessible
  dans le datacenter in-game** — c'est-à-dire le serveur réel du projet :
  config type « AX41 » (⚠️ **ne jamais citer le fournisseur en jeu**) :
  - CPU 6 cœurs / 12 threads · 3,6 GHz (socket AM4)
  - 64 Go DDR4
  - 2 × 512 Go NVMe en RAID 1
  - Réseau 1 Gbit/s
- **Suite prévue** : l'accès aux systèmes serveur (administration, services…)
  — à concevoir (pont naturel vers l'académie et les formations réelles).

## Implémentation dans la slice (v5.1)

- ⚠️ **Cohérence (correction du propriétaire)** : on vient d'arriver sur une
  planète vierge — aucun fragment humain ne peut être enterré dans les
  crevasses. **Le Fragment 001 vient de la soute** : les Archives ont voyagé
  avec Aurore à bord de l'AWOUI-7 (c'est la raison d'être d'un
  vaisseau-colonie). Les crevasses pourront cacher des fragments plus tard,
  quand le lore le justifiera.
- **Quête annexe, pas mission principale** : quand la colonie sait stocker
  des données (premier Datacenter), un **compartiment scellé de la soute** se
  déverrouille — signalé par un discret 📼 flottant près de la Source (la
  « main tendue » : le curieux la suit, le bambin l'ignore sans rien bloquer).
  L'ouvrir donne le Fragment 001 et fait apparaître l'onglet **ARCHIVES**
  (fragments + état du **Lecteur d'Archives**, hors ligne tant que le système
  d'époque n'est pas assemblé).
- **Assemblage** : 5 emplacements (carte mère, processeur, mémoire, stockage,
  réseau), 3 options chacun ; le démarrage (POST) échoue avec un message
  pédagogique sur la première incompatibilité ; seule la config cible
  démarre. Coût : 200 💠 + 20 Eo au démarrage réussi.
- Fragment 001 décrypté = premier texte d'histoire (brouillon placeholder,
  cliffhanger : « l'humanité n'a pas disparu. Elle a choisi de… ») ;
  les fragments suivants dorment sous la surface (futures crevasses,
  expansions, et à terme d'autres mécaniques).

## À trancher avec le propriétaire (plus tard)

- L'histoire réelle du passé (contenu des fragments) — le propriétaire tient
  la plume, Claude peut proposer.
- Le rythme de découverte des fragments (crevasses ? expéditions ? académie ?).
- La forme de « l'accès aux systèmes serveurs » (terminal in-game ? liens
  avec les formations ? vrai SSH sandboxé en prod ?).
