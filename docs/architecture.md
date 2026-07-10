# Architecture et état livré

Ce document décrit l'architecture actuelle du dépôt. Le brief durable et anonymisé
reste la source produit autoritaire dans `docs/case-study-brief.md`.

## Frontières du monorepo

```text
apps/frontend/          SPA React, routes, fonctionnalités et tests navigateur
apps/backend/           BFF Hono, sécurité, OpenAPI et adaptateurs fournisseurs
packages/contracts/     Schémas Zod et chemins partagés
packages/news-domain/   Filtrage, classement, déduplication, fixtures et démonstration
packages/ui/            Primitives visuelles typées
```

Les applications peuvent dépendre des packages. Les packages ne dépendent jamais des
applications. Le typecheck récursif découvre automatiquement chaque workspace qui
expose un script `typecheck`.

## Parcours de données

1. TanStack Router valide les paramètres de recherche présents dans l'URL.
2. Le hook généré par Orval appelle `GET /api/search`.
3. Hono interroge les adaptateurs NewsAPI, Guardian et NYT en parallèle.
4. Chaque adaptateur normalise sa réponse vers le schéma `Article`.
5. Une erreur fournisseur reste isolée et n'annule pas les autres résultats.
6. Les résultats fusionnés sont classés par pertinence puis dédupliqués entre sources.
7. TanStack Query met en cache la réponse et expose les états asynchrones à React.

Les routes et schémas Hono produisent `openapi.json`. Orval génère ensuite les types,
fonctions fetch et hooks TanStack Query du frontend. La CI régénère ce client et refuse
toute dérive non suivie.

Le classement pondère les correspondances par champ (titre, description, métadonnées),
ajoute un bonus de phrase exacte et de couverture des termes, et n'utilise la récence
que comme départage. La déduplication rapproche les articles par URL ou titre canonique.
Ces fonctions pures de `news-domain` s'appliquent au BFF Hono et à la démo statique.

## Routes principales

| Route | Responsabilité |
| --- | --- |
| `/` | Recherche, filtres URL et résultats normalisés |
| `/feed` | Préférences et flux personnalisé |
| `/api/health` | Santé du runtime et mode de configuration `mock`, `mixed` ou `live` |
| `/api/search` | Recherche agrégée et statut réel de chaque fournisseur |
| `/docs` et `/openapi.json` | Swagger UI et contrat OpenAPI du runtime Hono |
| `/ingest/*` | Proxy PostHog optionnel et same-origin |

## État et personnalisation

- Les recherches et filtres restent dans l'URL pour être partageables.
- Les préférences, la langue et le thème restent dans `localStorage`.
- Les composants n'introduisent pas de store global lorsque l'URL, TanStack Query ou
  un contexte local suffisent.

## Exécution

| Mode | Frontend | Données |
| --- | --- | --- |
| Local | Vite `5173`, Hono `3001` via `mise run local` | Live, mixed ou fixtures selon les clés serveur |
| Docker | Un runtime Node sur le port conteneur `3000`, publié sur `4174` par `mise run docker` | Live, mixed ou fixtures selon les variables runtime |
| Static demo | Bundle navigateur autonome | Fixtures locales, aucun appel API |
| GitHub Pages | Static demo avec base path et hash routing | Fixtures locales |

Le Dockerfile multi-stage installe tous les manifests workspace, construit les deux
applications et copie uniquement leurs bundles dans une image Node non-root.

## Sécurité et observabilité

- Les clés fournisseurs existent uniquement côté serveur.
- Les valeurs publiques `VITE_*` sont chargées depuis la racine du monorepo.
- Compose transmet les valeurs PostHog publiques au build Docker, sans y inclure les
  secrets fournisseurs.
- Le BFF ajoute les en-têtes de sécurité. `/api/health` décrit la configuration et
  `/api/search` fournit le statut réel de chaque source interrogée.
- PostHog reste optionnel et chargé dynamiquement après le montage client. L'error
  boundary et les smokes CI/Docker complètent la preuve de santé sans prétendre
  remplacer un dispositif de production.

## Validation

- Vitest sépare les tests Node des tests jsdom.
- Les seuils de couverture portent sur la logique TypeScript non générée.
- Playwright couvre les parcours React sur profils desktop et mobile.
- Le typecheck inclut les workspaces, les configurations racine et les specs E2E.
- GitHub Pages se déclenche uniquement après une CI `main` réussie.
- Semantic-release publie une pré-release de staging depuis `develop` et une release de
  production depuis `main`, en dernier job de la CI une fois les gates franchis.

Les résultats datés des contrôles sont conservés dans
`docs/control-checklist.md`.
