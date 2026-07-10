# Etat d'implementation

Ce document decrit l'etat reel du depot apres implementation. Le brief durable et anonymise est conserve dans `docs/case-study-brief.md`.

## Architecture livree

- SPA React 19 + TypeScript strict construite avec Vite 8.
- Monorepo pnpm avec applications deployables dans `apps/` et code reutilisable dans `packages/`.
- Frontend isole dans `apps/frontend` et backend Hono isole dans `apps/backend`.
- Contrats, logique de domaine partagee et primitives UI exposes par des packages workspace.
- Recherche et filtres partages dans l'URL via TanStack Router.
- Cache et etats asynchrones via TanStack Query.
- BFF Hono same-origin, les cles provider restent cote serveur.
- Routes Hono, middleware de securite, documentation et proxy analytique separes par responsabilite.
- Schemas Zod et OpenAPI derives du serveur.
- Client, types et hooks generes avec Orval.
- Adaptateurs distincts pour NewsAPI.org, The Guardian et New York Times.
- Fallback mock automatique par provider lorsqu'une cle est absente.
- Illustrations mock locales, servies par Vite, GitHub Pages et Docker sans dependance externe.
- Build statique optionnel utilisant les memes fixtures sans serveur API.
- Preferences persistantes dans `localStorage` et flux personnalise visible.
- Interface anglais/allemand, themes clair/sombre et responsive mobile.
- Feuilles de style segmentees par surface au lieu d'un fichier monolithique.
- Image Docker multi-stage executant le serveur en utilisateur non-root.
- Taches `mise` alignees sur le workflow PAC pour installer, verifier, lancer et arreter la stack de revue.
- PostHog conditionnel, error boundary global et captures sans texte de recherche.
- CSP distinct pour l'application et la documentation Swagger.
- Gates locaux et CI sur audit, couverture, E2E desktop/mobile et runtime Docker.

## Parcours de donnees

1. La route React valide les parametres de recherche de l'URL.
2. Le hook Orval appelle `GET /api/search`.
3. Hono interroge les adaptateurs provider en parallele.
4. Chaque adaptateur retourne des `Article` valides ou une erreur isolee.
5. Le BFF renvoie les articles tries et un statut par source.
6. L'interface affiche les resultats restants meme si une source echoue.

## Commandes de controle

```bash
pnpm check
pnpm typecheck
pnpm test:coverage
pnpm test:e2e
pnpm build
pnpm build:static-demo
mise run local
mise run docker
mise run stop
mise run docker:verify
docker build -t signal-desk .
docker run --rm -p 3000:3000 signal-desk
```

## Preuves locales

- 41 tests Vitest verts avec seuils 80% statements/lines/functions et 65% branches.
- 6 scenarios Playwright verts sur desktop Chromium et Pixel 5.
- Build client et bundle serveur autonome verts.
- Build statique et navigation directe sur `/feed` valides sans requete fetch ou XHR.
- Image Docker executee sans cle en mode mock.
- Smoke container valide sur `/`, `/api/health` et `/api/search`.
- Arret SIGTERM valide avec un code de sortie `0` et suppression de la stack Compose.
- Preuve navigateur mobile: controles semantiques, absence d'overflow horizontal, console propre et API saine.

## Publication

Le depot public, la CI distante, le tag signe `v1.0.0` et la demonstration GitHub Pages sont livres. Le detail des controles et des pull requests est conserve dans `docs/control-checklist.md`.
