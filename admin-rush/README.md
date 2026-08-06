# Admin Rush — Windows Server

Mini-jeu d'arcade pour **Awoui Universe**, conçu pour accompagner une
**formation Windows Server avancé** (pre-setup, sécurité, DC/AD/DNS, PKI
AD CS, VPN, multi-serveur, IIS HTTPS, auth Windows). Formule : *gestion de
tickets sous pression* (l'énergie d'un Overcooked, en solo, au doigt).

## Pitch

Tu es l'admin de garde. Des tickets concrets pleuvent (« Joindre PC-07 au
domaine », « Passer l'intranet en HTTPS », « Accès nomade au SI »…) et chacun
se résout en tapant **la bonne chaîne de services dans le bon ordre** sur la
console : `DNS → AD DS`, `Certificat → IIS → HTTPS 443`, `VPN → DNS → AD DS`…
Ticket expiré = SLA rompu (3 = fin de partie) — mais la solution s'affiche :
**on apprend aussi en échouant**.

## La progression suit le plan de formation

| Module | Services débloqués | Exemples de tickets |
|---|---|---|
| 1 · Pre-setup & sécurité | IP fixe, Nom serveur, Windows Update, Pare-feu | « Préparer SRV-DC1 avant promotion » = IP → Nom → MAJ |
| 2 · Contrôleur de domaine | AD DS, DNS | « Joindre PC-07 au domaine » = DNS → AD DS |
| 3 · PKI interne (AD CS) | AD CS, GPO, Certificat | « Auto-enrollment des postes » = GPO → Certificat |
| 4 · Web sécurisé & accès distant | IIS, HTTPS 443, VPN, Auth Windows | « SSO sur l'intranet » = AD DS → IIS → Auth Windows |
| 5 · Production | — (tout) | Chaînes de 4, cadence maximale |

Passage de module au fil des tickets résolus (5 / 11 / 18 / 26). En modules
avancés, ~40 % des tickets sont de la **révision** des modules précédents.

## Mécaniques

- **Multiplicateur de série** (jusqu'à ×3) : brisé par toute erreur de service.
- **Erreur** = buzz + 2 s de pénalité sur le ticket (pas de reset de la chaîne).
- **Indice intégré** : à mi-temps du ticket, le prochain service attendu se
  révèle en filigrane — le jeu enseigne sous pression, sans bloquer.
- Tickets simultanés (2 → 4) et délais qui raccourcissent avec le score.
- Record local (`localStorage`).

## Ajuster le contenu pédagogique

Tout le contenu est **data-driven** dans `index.html` : le tableau `MODULES`
(tickets `{ t: "titre", c: ["chaîne"] }`) et le dictionnaire `TILES`.
Ajouter un ticket ou un module = éditer ces tableaux, rien d'autre.
→ C'est la structure à réutiliser pour coller finement au contenu réel de la
formation du propriétaire (l'ordre des chaînes est volontairement simplifié
pédagogiquement ; à faire valider module par module).

## Technique

Un seul fichier `index.html` — HTML/CSS/JS vanilla, zéro dépendance, sons
WebAudio, mobile-first (100dvh, safe-area), colonne max 540px sur PC.
Même famille visuelle que Regex Invaders (écran CRT), accent azur.

## Pistes v2

- Tickets « pièges » à escalader plutôt que résoudre (mauvais périmètre).
- Mode « examen » : chaînes jamais révélées, score ×2.
- Chaînes alternatives valides (plusieurs ordres acceptés quand c'est vrai).
- Sync des thèmes/tickets avec les vrais chapitres de la formation suivie.
