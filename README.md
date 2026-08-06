# games

Jeux de la salle d'arcade d'**Awoui Universe** (universe.awoui.com) — le MMO
persistant d'apprentissage IT de l'écosystème [Awoui](https://awoui.com).

## Overview

Ce repo sert à concevoir et produire les mini-jeux d'arcade de l'univers
(formule : *concept IT × mécanique d'arcade culte*, comme PowerShell Hero et
The Flux). Le contexte complet est documenté dans [`docs/`](docs/) et
[`CLAUDE.md`](CLAUDE.md). Chaque jeu vit dans son propre dossier avec un README
autonome et ses instructions de build/run.

## Repository structure

- /<project-name>/ - each game or project lives in its own directory
  - README.md - project-specific instructions
  - src/ - source code
  - assets/ - images, sound, and other assets
  - docs/ - additional documentation

- tools/ - shared scripts and developer tools
- examples/ - demo projects or playable builds
- LICENSE - license file (if applicable)

## Getting started

1. Clone the repo:

   git clone https://github.com/leguideinfo/games.git

2. Enter a project folder and follow its README for build/run instructions.

## Development

- Keep each project self-contained.
- Use a top-level tools/ directory for scripts used across projects.
- Add a CONTRIBUTING.md at the root if you want contribution guidelines.

## Contributing

Contributions are welcome. For project-specific changes, open a PR against the relevant project folder. Add tests or a short playtest checklist if applicable.

## License

Add a license file at the repository root (LICENSE) and update this section accordingly.

## Contact

Repository owner: https://github.com/leguideinfo
