# La Source — architecture de la source (sections + assemblage)

> Mis en place le 16/08/2026, après une soirée où deux flux d'édition parallèles
> (mobile → GitHub d'un côté, session locale de l'autre) ont réécrit le même
> `index.html` de 6 800 lignes — fusion à conflits, lignes qui dérivent sous les
> pieds des outils. Ce modèle en tire la leçon : **le monolithe reste l'artefact,
> les sections deviennent la surface de travail.**

## Le modèle en une phrase

`index.html` est **découpé** en ~68 sections physiques sous `src/` (le long des
marqueurs `/* ---------- … ---------- */` déjà présents dans le code), et
**réassemblé** par simple concaténation ordonnée — avec une **preuve
octet-pour-octet** à chaque opération : la concaténation des sections reproduit
exactement le fichier d'origine (SHA-1 identique).

```
index.html  ──(tools\decouper-source.ps1)──▶  src/{html,css,js}/NNN-nom.ext
src/…       ──(tools\assembler-source.ps1)──▶  index.html
```

Aucun bundler, aucun Node, aucune dépendance : la concaténation EST le build.
La portée globale partagée et l'ordre d'exécution — dont tout le code dépend —
sont préservés par construction. **Zéro changement de comportement possible**
tant que la preuve passe.

## Pourquoi pas des modules ES ?

- Le code vit dans **une portée globale partagée** (des milliers de références
  croisées) : le convertir en imports/exports = réécriture massive à haut risque.
- **Pas de Node/bundler sur le poste de build** : le pipeline est PowerShell pur
  (`build-source.ps1` lit `index.html` — il reste inchangé).
- La CSP du vhost impose des fichiers plats assemblés, pas des graphes de modules.
- Ce modèle est **l'étape 1** classique de modernisation d'un monolithe :
  découpe physique sûre d'abord ; l'étape 2 (vrais modules, section par section,
  avec outillage et tests) devient *possible* — plus tard, si le besoin naît.

## Les trois gestes du quotidien

```powershell
# 1) Travailler dans src/ (multi-agent, multi-édit), puis reconstruire :
powershell -File tools\assembler-source.ps1

# 2) Après une édition du monolithe (mobile, autre poste) : resynchroniser src/ :
powershell -File tools\decouper-source.ps1

# 3) Vérifier : chaque outil affiche le SHA-1 — deux mondes en phase = même hash.
```

**Garde anti-écrasement** : `src/.source-sha1` mémorise le hash d'`index.html`
au dernier découpage. Si le monolithe a changé depuis (édition mobile…),
`assembler-source.ps1` **refuse** d'écraser — relancer le découpage d'abord
(ou `-Force` en connaissance de cause). C'est la protection contre la perte
d'une édition faite de l'autre côté.

## Auto-découverte : un marqueur = une section

Le découpeur ne maintient **aucune table** : il dérive les sections des
marqueurs du code lui-même.

- JS (colonne 0) : `/* ---------- nom ---------- */` ou `/* ========== nom`
- CSS (indenté 2 espaces) : `  /* ---------- nom ---------- */`

**Poser un marqueur = créer une section** au prochain découpage. Supprimer un
système supprime ses sections. Le fichier vivant reste la vérité ; l'outillage
s'y adapte — il a survécu, le soir même de sa naissance, à deux réécritures du
fichier en cours de route.

Conséquences pratiques :
- les noms de fichiers dérivent du texte du marqueur (translittéré, kebab-case,
  numéroté par 10 dans l'ordre) — renommer un marqueur renomme sa section ;
- les gros blobs base64 (assets embarqués) restent dans la section de leur
  chargeur : ils ne polluent jamais un diff de logique ;
- l'**ordre du manifest** (`src/manifest.txt`, généré) est l'ordre d'exécution
  réel : ne jamais le réordonner à la main sans comprendre les dépendances
  (TDZ : plusieurs `const` du jeu sont lus par des sections ultérieures).

## Protocole multi-agent / multi-édit

1. **Un agent = ses sections.** Se répartir le travail par fichiers de `src/`,
   jamais deux flux sur la même section.
2. **Personne n'édite `index.html` pendant qu'un travail est ouvert dans
   `src/`** (la garde le détecte, mais autant ne pas la déclencher).
3. **Intégration = assemblage** : `assembler-source.ps1`, puis test de fumée
   (le jeu charge, 0 erreur console), puis `deploy\build-source.ps1` (universe)
   pour la prod — pipeline aval inchangé.
4. Édition mobile du monolithe ? Aucun souci : `decouper-source.ps1` au retour,
   et `src/` rejoint la réalité.
5. Les fins de ligne sont **verrouillées LF** (`.gitattributes` : `-text`) —
   la fidélité octet exige qu'aucune normalisation ne touche ces fichiers.

## Fichiers

| Chemin | Rôle |
|---|---|
| `index.html` | le jeu, monolithe assemblé — ce que servent le vhost et `build-source.ps1` |
| `src/manifest.txt` | ordre de concaténation (généré par le découpeur) |
| `src/html/…` | tête (`<head>`+`<style>`), corps (DOM), fin (`</script>`) |
| `src/css/…` | une section par marqueur CSS |
| `src/js/…` | une section par marqueur JS |
| `src/.source-sha1` | hash de synchro (garde anti-écrasement) |
| `tools/decouper-source.ps1` | monolithe → sections (+ preuve) |
| `tools/assembler-source.ps1` | sections → monolithe (+ garde + hash) |

Détails d'implémentation notables : tout le tranchage se fait en **Latin-1**
(1 octet = 1 caractère) — aucun décodage UTF-8, donc aucun risque
d'encodage/BOM/CRLF ; la comparaison de preuve est **ordinale** ; le découpeur
construit dans un dossier temporaire et ne remplace `src/` que si la preuve
passe ; les scripts sont 100 % ASCII (règle maison PowerShell 5.1).
