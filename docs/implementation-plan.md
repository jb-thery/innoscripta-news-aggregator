# Implementation Plan

## Decision initiale

- Futur repo root: ce dossier.
- Stack recommande: Vite + React + TypeScript.
- Commande de reference verifiee via la documentation Vite: `pnpm create vite@latest . -- --template react-ts`.
- Si l'outil refuse le dossier non vide, creer un dossier temporaire avec le template, puis fusionner les fichiers generes dans cette racine en conservant `docs/`, `source-materials/`, `AGENTS.md`, `.gitignore` et `.env.example`.

## Phase 1 - Socle projet

- Initialiser `package.json`, TypeScript, Vite et React.
- Ajouter scripts `dev`, `build`, `preview`, `lint`, `typecheck` et `test`.
- Ajouter une structure `src/` simple:
  - `src/domain/` pour les types et la normalisation.
  - `src/providers/` pour les adaptateurs NewsAPI, Guardian et NYT.
  - `src/features/search/` pour recherche et filtres.
  - `src/features/preferences/` pour le flux personnalise.
  - `src/components/` pour les composants UI reutilisables.
  - `src/styles/` pour les styles globaux.

## Phase 2 - Donnees et normalisation

- Definir `Article`, `ArticleSearchParams` et `ArticleProvider`.
- Implementer un adaptateur par source.
- Ajouter un mode mock active par `VITE_ENABLE_MOCK_DATA=true`.
- Gerer les erreurs provider par provider pour afficher des resultats partiels.

## Phase 3 - Experience utilisateur

- Ecran principal avec barre de recherche, filtres et liste d'articles.
- Panneau de preferences pour sources, categories et auteurs.
- Etats chargement, vide, erreur et succes partiel.
- Cartes articles lisibles avec lien vers l'article original.
- Mobile-first: filtres condensables, grille fluide, zones tactiles suffisantes.

## Phase 4 - Docker

- Ajouter un `Dockerfile`.
- Si l'app reste statique avec mocks, servir le build statique.
- Si des cles API sont necessaires en live, inclure un proxy serveur qui lit les variables d'environnement cote serveur.
- Documenter les commandes `docker build` et `docker run`.

## Phase 5 - Controle final

- Executer format/lint.
- Executer typecheck.
- Executer tests.
- Executer build.
- Construire et lancer le container Docker.
- Faire un smoke test navigateur sur desktop et mobile.
- Verifier qu'aucun secret n'est dans le diff.
- Completer `docs/control-checklist.md`.
