# Le SI de la colonie — le pont jeu ↔ informatique réelle

*Proposition Claude (2026-08-08) en réponse à la demande du propriétaire :
bridger le jeu avec l'informatique réelle de façon fun, tôt et bien plus
poussée que le seul choix des composants serveur — une architecture de SI
parallèle, avec révision des couches (OSI/TCP), via une interface type
« Cisco Packet Tracer d'un nouveau genre » bridgée au jeu. **À valider.***

## Principe fondateur : la colonie EST la couche 1

Pas un logiciel de réseau posé à côté du jeu : on révèle que le jeu en était
déjà un. Les bâtiments sont les nœuds physiques (Ferme = serveurs,
Datacenter = stockage, Baie réseau = cœur télécom, Console = poste d'admin).
Le SI est le **système nerveux de la colonie** :
- bâtiment **non raccordé** → produit à taux réduit (~70 %) ;
- SI **bien architecturé** (redondance, segmentation, services en place) →
  bonus de production ;
- le pont n'est pas un mini-jeu annexe, c'est une **couche du monde**.

## L'interface : onglet RÉSEAU à deux faces synchronisées

1. **Face monde** (dans la vue colonie) : câblage physique tap-tap entre
   bâtiments — le conduit d'énergie animé existant devient un vrai lien de
   couche 1. Accessible à un enfant.
2. **Face schéma** (le « Packet Tracer nouveau genre ») : vue épurée où les
   mêmes équipements apparaissent en **bandes horizontales par couche**
   (Physique / Liaison / Réseau / Transport / Application) — le modèle en
   couches est la géographie de l'écran, on le révise en jouant. Palette
   d'éléments (câble, switch, routeur, pare-feu, serveurs DHCP/DNS…),
   pose + connexion au tap. Tout est répercuté sur la carte en direct.
   **Deux vues, un seul SI.**

## Le fun : voir les paquets vivre

- **Trafic continu** : particules circulant sur les liens (débit visible).
- **Mode Simulation** (le joyau pédagogique, repris de Packet Tracer) :
  on lance un ping, le temps se fige, on suit LE paquet étape par étape,
  avec la **pile d'encapsulation qui s'empile/se dépile visuellement** à
  chaque équipement traversé.
- **Pannes-enquêtes** : câble coupé, conflit d'IP, DNS muet — diagnostiquer
  avec les outils du schéma (ping, table MAC, table de routage simplifiées).
- **Les parasites deviennent des attaques réseau** : on les contre en
  plaçant un pare-feu **au bon endroit du schéma** (pas en achetant une
  techno abstraite). Pont naturel vers le PvE/PvP cyber de la vision.

## Progression (chapitre 🔌 Réseau, dans l'esprit des chapitres v7)

1. « Relie l'Extracteur à la Source » — couche 1, câble, un enfant le fait.
2. « Trop de bâtiments sur un fil : pose un switch » — couche 2, notion de
   trame/MAC montrée, pas récitée.
3. « Donne une adresse à chaque bâtiment » — le **DHCP actuel devient un
   vrai serveur posé et câblé** (couche 3, IP visibles).
4. « Nomme tes machines » — idem **DNS** (noms vs adresses).
5. Expansion → « relie deux quartiers » : **routeur**, table de routage.
6. Attaques → **pare-feu**, segmentation (le FIREWALL actuel migre).
7. La **quête serveur existante se raccorde** : le système d'époque devient
   un hôte du SI (on le câble, on lui donne une IP, on lit les Archives à
   travers le réseau — cohérence lore totale).
8. Plus tard (académie) : VLAN → VPN, supervision, cloud/conteneurs.

**Les technos abstraites actuelles (DHCP, DNS, FIREWALL, BACKUP) migrent en
équipements posés, câblés, visibles** — plus fort pédagogiquement que
l'arbre de recherche.

## Implémentable dès maintenant dans la slice (v1 proposée)

- Onglet **RÉSEAU** : face monde (câblage tap-tap, particules de trafic,
  malus/bonus de raccordement) + face schéma v1 (bandes de couches,
  palette, 3 équipements : câble, switch, serveur DHCP).
- **Mode Simulation** sur un ping (encapsulation visualisée).
- 4 premières missions du chapitre 🔌.
- **Data-driven** (ELEMENTS / LAYERS / MISSIONS en tableaux) pour injecter
  ensuite le vrai contenu de formation du propriétaire, comme Admin Rush.

## À trancher avec le propriétaire

- OSI 7 couches, TCP/IP 4/5 couches, ou hybride moderne ? (proposition :
  5 bandes — Physique, Liaison, Réseau, Transport, Application — et on
  précise OSI dans les fiches de savoir).
- Le rythme d'apparition (dès la mission ~6 ? après la Baie réseau ?).
- La part de contrainte : SI obligatoire pour produire, ou bonus/malus
  doux ? (proposition : malus doux au début, exigence croissante).
- Assets : équipements du schéma en icônes dédiées (style charte) —
  à générer avec les prompts calibrés.
