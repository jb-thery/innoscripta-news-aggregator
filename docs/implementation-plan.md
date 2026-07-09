# Etat d'implementation

Le plan detaille et la tracabilite du brief sont conserves dans `PLAN.md`. Ce document decrit l'etat reel du depot apres implementation.

## Architecture livree

- SPA React 19 + TypeScript strict construite avec Vite 8.
- Recherche et filtres partages dans l'URL via TanStack Router.
- Cache et etats asynchrones via TanStack Query.
- BFF Hono same-origin, les cles provider restent cote serveur.
- Schemas Zod et OpenAPI derives du serveur.
- Client, types, hooks et mocks generes avec Orval.
- Adaptateurs distincts pour NewsAPI.org, The Guardian et New York Times.
- Fallback mock automatique par provider lorsqu'une cle est absente.
- Preferences persistantes dans `localStorage` et flux personnalise visible.
- Interface anglais/allemand, themes clair/sombre et responsive mobile.
- Image Docker multi-stage executant le serveur en utilisateur non-root.

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
pnpm test
pnpm test:e2e
pnpm build
docker build -t innoscripta-news-aggregator .
docker run --rm -p 3000:3000 innoscripta-news-aggregator
```

## Preuves locales

- 12 tests Vitest verts.
- 2 scenarios Playwright Chromium verts.
- Build client et bundle serveur autonome verts.
- Image Docker executee sans cle en mode mock.
- Smoke container valide sur `/`, `/api/health` et `/api/search`.
- Audit navigateur mobile: Accessibility 100, Best Practices 100, SEO 100, Agentic Browsing 100.

## Reste lie a la publication

La publication GitHub, la verification de la CI distante et le deploiement de demonstration sont suivis dans `docs/control-checklist.md`. Ils dependent de la creation des surfaces distantes et ne modifient pas l'architecture locale.
