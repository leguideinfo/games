# Le SI de la colonie — le pont jeu ↔ informatique réelle

*Proposition Claude (2026-08-08) en réponse à la demande du propriétaire :
bridger le jeu avec l'informatique réelle de façon fun, tôt et bien plus
poussée que le seul choix des composants serveur — une architecture de SI
parallèle, avec révision des couches (OSI/TCP), via une interface type
« Cisco Packet Tracer d'un nouveau genre » bridgée au jeu.
**VALIDÉ par le propriétaire (2026-08-08) — v1 implémentée dans la slice.***

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

## v1 IMPLÉMENTÉE (2026-08-08)

- **Arbitrages validés** : 5 bandes (OSI précisé dans les fiches) ;
  apparition mission 8 (chapitre 🔌 après la Centrale NIV 2) ; malus doux
  −30 % pour un bâtiment non raccordé (dès la mission 9) ; DHCP migré en
  équipement posé/câblé (DNS/FIREWALL suivront en v2).
- **Face monde** : bouton 🔌 (mode câblage tap-tap, 10 💠 le câble),
  câbles cuivre dessinés entre bâtiments, particules de trafic quand le
  lien est relié à la Source. Ports limités : Source 3, bâtiment 2,
  Switch 8, Serveur DHCP 1 — la pénurie de ports amène le Switch.
- **Équipements** : Switch réseau (30 💠) et Serveur DHCP (40 💠 + 5 Eo)
  dans le roster BT (menu Construire + palette de l'onglet RÉSEAU).
  DHCP en ligne = adresses IP visibles + auto-collecte des éclats
  (ancien effet de la techno, retirée de TECHNOS).
- **Face schéma** (onglet RÉSEAU) : 5 bandes Application/Transport/
  Réseau/Liaison/Physique, chips d'état tapables (chaque tap = une
  ligne de savoir), MAC et IP réelles dérivées des coordonnées.
- **Mode Simulation** : suivi pas à pas d'une trame Source → bâtiment,
  pile d'encapsulation visuelle (DONNÉES → [PAQUET IP] → TRAME), étape
  switch « lit la table MAC », désencapsulation à l'arrivée. Sans DHCP :
  trame de test couche 2 et message pédagogique ; avec DHCP : paquet IP
  complet.
- **Missions 8-11** (chapitre 🔌) : câbler l'Extracteur, **poser un
  Switch, PUIS tout raccorder** (ordre corrigé 2026-08-08 : avec 3 prises
  sur la Source, « raccorde tout » avant le Switch était une impasse pour
  un enfant — le chaînage bâtiment-à-bâtiment restait possible mais
  indevinable), suivre une trame. Mission 15 : poser le Serveur DHCP.
  25 missions au total, migrations de sauvegarde v3→v4→v5→v6.
- **Data-driven** : NET_LAYERS (bandes + savoirs), PORTS, équipements en
  BT — prêt à recevoir le contenu de formation du propriétaire.

## Amorçage du hub (2026-08-08 — remplace la « Pluie d'éclats »)

Retour propriétaire : « router des paquets » n'a pas de sens en tout début
de colonie — la première interaction réseau réelle, c'est **l'alimentation**.
Le mini-jeu éclair (3 éclats récoltés en rafale) devient **« ⚡ Amorçage du
hub »** : un équipement HORS TENSION dans le popup (boîtier, 4 LED
éteintes, jauge 8 segments), chaque éclat tapé est injecté dans sa prise
(vol animé, segment de jauge, LED ambre) ; jauge pleine → **séquence de
boot** (LED vertes une à une, +25 💠 bonus, « HUB-01 · EN LIGNE ✓ »).
Leçon à la première réussite : *« Règle n°1 du technicien : vérifier
l'alimentation »* — la couche 0 avant la couche 1, cohérent avec le
chapitre 🔌 qui suit.

## Suite (v2+)

- DNS et FIREWALL en équipements (résolution de noms jouée, pare-feu
  placé contre les parasites-attaques).
- Pannes-enquêtes (câble coupé, conflit d'adresses) et outils de
  diagnostic (ping ciblé, table MAC détaillée).
- Routeur + second segment à l'expansion ; VLAN → VPN vers l'académie.
- Assets propriétaire pour les équipements (icônes/sprites charte).

## À trancher avec le propriétaire

- OSI 7 couches, TCP/IP 4/5 couches, ou hybride moderne ? (proposition :
  5 bandes — Physique, Liaison, Réseau, Transport, Application — et on
  précise OSI dans les fiches de savoir).
- Le rythme d'apparition (dès la mission ~6 ? après la Baie réseau ?).
- La part de contrainte : SI obligatoire pour produire, ou bonus/malus
  doux ? (proposition : malus doux au début, exigence croissante).
- Assets : équipements du schéma en icônes dédiées (style charte) —
  à générer avec les prompts calibrés.
