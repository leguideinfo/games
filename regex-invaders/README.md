# Regex Invaders

Mini-jeu d'arcade pour **Awoui Universe** — formule maison : *concept IT ×
mécanique d'arcade culte*. Ici : **les expressions régulières × Space Invaders**.

## Pitch

Des paquets corrompus (des chaînes de caractères) descendent vers ton pare-feu.
Tu assembles un **motif regex** avec des modules (tuiles tactiles) ; les intrus
couverts par le motif s'illuminent en temps réel ; `FIRE` les détruit tous d'un
coup. Plus tu en détruis en un seul tir, plus le combo rapporte (score = n² ×
10 × vague). À partir de la vague 3, des **paquets alliés ✓** circulent : en
toucher un coûte un segment de pare-feu — il faut viser juste, pas viser large.

Le motif doit couvrir la chaîne **en entier** (match ancré `^…$`).

## Boucle & difficulté

- **Endless par vagues** : à chaque vague, plus d'ennemis, plus vite, chaînes
  plus longues et plus variées (chiffres → mots IT → mot+chiffre → hexa…).
- **Déblocage progressif des modules** : vague 2 `\d`, 3 `.`, 4 `+`, 5 `\w`,
  6 `?`, 7 `[a-f]` `[0-4]` `[5-9]`, 8 `|`, 9 `*`, 10 `{2}`, 12 `{3}`.
  Chaque nouveau module est annoncé avec sa signification → apprentissage
  implicite des regex par la pratique.
- **Tension risque/récompense** : tirer vite et petit, ou prendre le temps de
  construire le motif qui rafle toute une famille d'intrus pendant qu'ils
  descendent.
- 3 segments de pare-feu ; intrusion ou allié détruit = -1 segment.
- Record local (`localStorage`).

## Contrôles

- **Mobile (cible principale)** : tout au doigt — tuiles pour construire,
  gros bouton `FIRE`, tap sur un module du motif pour le retirer.
- **PC** : clavier — lettres/chiffres tapent des littéraux, `. + * ? |`
  directement, `Backspace` retire, `Échap` vide, `Entrée` tire.

## Technique

- **Un seul fichier** : `index.html` — HTML/CSS/JS vanilla, zéro dépendance,
  zéro asset (sons synthétisés en WebAudio). Conforme au stack des jeux
  existants d'Universe (full JS/CSS/HTML).
- Mobile-first (100dvh, safe-area, `touch-action`), colonne max 540px sur PC.
- Rendu DOM (≤ ~20 entités), boucle `requestAnimationFrame`.

## Lancer

Ouvrir `index.html` dans un navigateur, ou :

```bash
cd regex-invaders && python3 -m http.server 8080
```

## Pistes v2 (non implémentées)

- Échappement (`\.` vs `.`) et ancres comme mécanique explicite.
- Boss de fin de zone (chaîne géante à décomposer).
- Classement en ligne / récompenses croisées avec le MMO (voir
  `../docs/salle-arcade.md`, principe n°6).
- Thèmes de vagues nommés (logs, IP, ports) pour coller à l'académie.
