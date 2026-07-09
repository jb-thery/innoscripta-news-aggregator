# Plan d'implementation - News Aggregator (etude de cas Innoscripta)

> Document de pilotage. Il ne contient aucun code applicatif: il decrit, etape par etape,
> comment construire l'application demandee par l'etude de cas Innoscripta Frontend Developer.
> Chaque phase est autonome et peut etre lancee independamment avec un `/goal`.

- **Statut**: plan valide, pret a executer.
- **Source autoritaire**: `../source-materials/cs-frontend-developer-2025.pdf` (brief Innoscripta).
- **Repo cible**: ce dossier `news-aggregator/`, versionne en Git (GitFlow), isole du workspace parent.
- **Langue**: documents de projet en francais, code / identifiants / commits en anglais.
- **Versions technos**: verifiees via Context7 en 2026, voir [Annexe A](#annexe-a--stack-et-versions-verifiees-context7).

---

## 0. Comment utiliser ce plan

1. Les phases 0 a 12 sont ordonnees. Ne pas sauter une phase sans lire ses pre-requis.
2. Chaque phase se termine par une **commande de validation** et un ou plusieurs **commits conventionnels**.
3. Le decoupage des commits suit GitFlow: une branche `feature/*` par phase, mergee dans `develop`.
4. Regle de securite absolue: aucune cle API, aucun `.env` reel ne doit apparaitre dans un diff.
5. En cas d'absence de cles API, le **mode mock** (fixtures) permet de tout demontrer sans secret.

---

## 1. Audit prealable: pieges et injections

L'etude de cas a ete auditee avant tout demarrage. Resultat: **aucune injection de prompt, aucun piege technique cache**.

### 1.1 Analyse du PDF source
- Structure PDF inspectee: aucun `/JavaScript`, `/OpenAction`, `/Launch`, `/EmbeddedFile`, `/AcroForm`. Seulement 2 objets `/URI` (liens de pied de page).
- Texte reellement rendu par le moteur PDF = **2689 caracteres**, identique a l'octet pres au texte stocke dans `cs-frontend-developer-2025.txt`. Donc **aucun texte blanc, minuscule ou hors-ecran** dissimule.
- Aucune chaine du lexique d'injection (`ignore previous`, `system prompt`, `you are`, `disregard`, `exfiltrate`, `reveal`, etc.) presente dans le binaire.
- Metadonnees saines (societe innoscripta AG, Munich). Rien d'anormal.

### 1.2 Le vrai piege: un distracteur de perimetre
- Le fichier `../source-materials/portail-academique-screen-map.md` decrit **un tout autre projet** (Portail Academique type Sciences Po: Next.js multi-zones, CAS SAML, moissonneur Oracle, dossier administratif, GitFlow DEVL/PPRD/PROD, livrables L1 a L5).
- Ce document n'a **aucun rapport** avec l'agregateur de news. C'est un distracteur qui pourrait pousser a: construire le mauvais produit, sur-dimensionner l'architecture, ou introduire des exigences fantomes (multi-zones, roles, authentification lourde).
- **Decision**: ce contexte PAC est **hors perimetre**. Il n'ajoute aucune exigence a l'agregateur. Les seuls elements neutres et deja alignes avec nos bonnes pratiques (GitFlow, i18n FR/EN) sont adoptes pour leur valeur propre, pas parce que le PAC les impose.
- Les garde-fous du dossier (`README.md`, `AGENTS.md`, `docs/pac-context-summary.md`) neutralisent deja explicitement ce piege. On les respecte.

### 1.3 Cross-check ragmir
- Base ragmir du projet interrogee (9 fichiers, 40 chunks indexes): aucun avertissement de securite, aucun gap. Les exigences ressorties correspondent exactement au brief. Aucune exigence cachee ou contradictoire.

---

## 2. Exigences (tracabilite brief -> fonctionnalites)

| # | Exigence du brief | Traduction produit | Phase |
|---|---|---|---|
| R1 | Recherche d'articles par mot-cle | Barre de recherche, requete debouncee, etat dans l'URL | 7 |
| R2 | Filtrer par date | Filtre plage de dates (from/to), dans l'URL | 7 |
| R3 | Filtrer par categorie | Filtre categorie normalisee, dans l'URL | 7 |
| R4 | Filtrer par source | Filtre par provider / source, dans l'URL | 7 |
| R5 | Flux personnalise: sources, categories, auteurs preferes | Panneau de preferences, `localStorage`, feed dedie **visible** | 8 |
| R6 | Design mobile responsive | Mobile-first, breakpoints, cibles tactiles | 3, 9 |
| R7 | React.js + TypeScript | Vite 8 + React 19 + TS strict | 1 |
| R8 | Au moins 3 sources de donnees | NewsAPI.org, The Guardian, New York Times | 4, 5 |
| R9 | Containerise avec Docker + doc | Dockerfile multi-stage, README Docker | 12 |
| R10 | Bonnes pratiques DRY, KISS, SOLID | Adaptateurs isoles, logique testable, pas d'abstraction speculative | toutes |

Exigences derivees (AGENTS.md, non explicites mais attendues):
- Cartes articles lisibles: titre, source, auteur si dispo, date, description, lien original.
- Etats **chargement / vide / erreur / succes partiel** par source (une source en panne ne casse pas la page).
- Accessibilite: elements interactifs semantiques, labels, focus visible.
- Aucune cle API dans le bundle navigateur.

---

## 3. Decision d'architecture

### 3.1 SPA, SSR ou SSG ?

**Choix: SPA (Single Page Application).**

Raisonnement lie au besoin reel:
- Le contenu est **dynamique par requete** (resultats de recherche/filtres en temps reel). Rien n'est pre-rendable de facon stable -> **SSG ecarte**.
- Le **flux personnalise depend de preferences stockees cote client** (`localStorage`, propres au navigateur, sans compte utilisateur). Un serveur ne peut pas pre-rendre ce feed sans session/auth -> **la valeur du SSR est marginale ici**.
- **Aucune exigence SEO** dans le brief (agregateur de contenus tiers, pas de pages a indexer). Le SSR repondrait surtout a un besoin SEO/first-paint absent ici.
- Le poste vise est **Frontend Developer**: une SPA riche (recherche, filtres URL, cache, etats) met en valeur exactement les competences frontend attendues.

### 3.2 Next.js ou Vite ?

**Choix: Vite.**

- Next.js apporterait SSR/SSG (peu utiles ici, cf. 3.1) et des Route Handlers integres (BFF). Il est plus lourd et opiniatre pour un besoin qui est avant tout une SPA data-driven.
- Vite + l'ecosysteme **TanStack** est le meilleur ajustement au besoin:
  - **TanStack Query v5**: cache, retries, requetes **paralleles** vers les 3 sources (`useQueries`), gestion **native des echecs partiels** (chaque source a son propre statut).
  - **TanStack Router v1**: routing **type-safe** et surtout `validateSearch` (+ Zod) pour valider et typer les **filtres dans l'URL** -> recherche/filtres partageables et bookmarkables (R1 a R4).

**Validation externe (contexte Innoscripta)**: ce take-home est un challenge recurrent. Parmi les solutions publiques d'anciens candidats, **Vite + React + TS ressort comme le choix le plus courant et le moins risque** (Next.js a aussi ete utilise et reste acceptable). Plusieurs candidats retenus utilisent React Query, lu comme un signal senior. Notre stack est donc alignee et differenciante, sans etre exotique.

### 3.3 Le point critique: cacher les cles API

Confirme via Context7 (docs Vite): **`server.proxy` de Vite est dev-only**. Il n'existe pas dans le build de production. Cacher une cle par proxy en dev **n'est donc pas** une solution de prod. Il faut un vrai composant serveur.

**Choix: un BFF (Backend For Frontend) minimal en [Hono](#annexe-a--stack-et-versions-verifiees-context7).**
- En **dev**: `server.proxy` route `/api/*` vers le serveur Hono local. La cle reste cote serveur.
- En **prod**: le meme serveur Hono sert le build statique **et** expose `/api/*` (proxy vers NewsAPI/Guardian/NYT avec les cles lues dans `process.env`). **Un seul container**.
- Regle: les cles secretes ne sont **jamais** prefixees `VITE_` (sinon inlinees dans le bundle). Seules les valeurs publiques utilisent `VITE_`.

### 3.4 Trois modes, un seul artefact (couvre l'absence de cles)

Point cle pour l'evaluation: **l'evaluateur lancera `docker run` sans cle API**. L'image doit donc fonctionner sans configuration. On le garantit par un **fallback mock au niveau du BFF (au runtime)**, pas seulement par un flag de build.

| Mode | Declencheur | Comportement |
|---|---|---|
| **Live** | Cle presente dans `process.env` (runtime) | Le BFF relaie l'API reelle du provider |
| **Mock serveur** | Cle absente (`docker run` sans env) | Le BFF renvoie des fixtures realistes (meme forme que l'API reelle) |
| **Mock client** (option) | Build `VITE_ENABLE_MOCK_DATA=true` | Le client court-circuite `/api` et lit les fixtures directement (hebergement statique sans serveur) |

Consequences:
- **La meme image Docker** marche sans cle (mock serveur) et avec cles (`--env-file`), sans rebuild.
- Fixtures partagees (DRY) entre mock serveur et mock client.
- `docker run -p 3000:3000 news-aggregator` (sans env) doit afficher une app pleinement fonctionnelle (recherche, filtres, feed) sur donnees mock. C'est l'exigence de repli du brief/AGENTS **et** la garantie que l'evaluateur voit tourner l'app immediatement.

### 3.5 Contrat OpenAPI et generation du client (Orval)

Le BFF est **contract-first**: ses routes sont decrites en Zod via `@hono/zod-openapi`, ce qui **genere automatiquement une spec OpenAPI**. **[Orval](https://orval.dev/)** consomme cette spec et **genere le client typé**: hooks TanStack Query + types TS. Une seule source de verite (schema Zod -> OpenAPI -> client genere), zero type ecrit a la main cote client, zero derive. C'est un signal fort de rigueur pour Innoscripta (type-safety de bout en bout, contract-first).

- **Normalisation cote serveur (pattern Adapter au bon endroit)**: le BFF expose **un endpoint unifie** `GET /api/search` renvoyant des `Article[]` **deja normalises** + un statut par source. La normalisation vit dans `server/providers/*` (un adaptateur par source), la ou l'on parle aux 3 APIs heterogenes (anti-corruption layer). Le client ne connait jamais les formes brutes des providers.
- **Fan-out parallele cote serveur**: le BFF encapsule chaque appel provider puis les execute avec `Promise.all` -> **echecs partiels** renvoyes dans `sources: [{ provider, ok, error }]`, un seul aller-retour client.
- **Cote client**: on consomme les **hooks generes par Orval** (bases sur TanStack Query v5). L'UI ne manipule que des `Article`.
- **Tests**: la normalisation (adapters) est testee en Vitest **cote serveur** (node, avec fixtures); le mode statique utilise une implementation locale du meme contrat. La conformite Article/filtrage/preferences reste couverte (exigence AGENTS.md).
- **Fallback 5 jours**: si la chaine OpenAPI/Orval deborde, un client `fetch` typé a la main sur le meme contrat reste acceptable. Mais la generation fait surtout **gagner** du temps (hooks + types).

---

## 4. Architecture cible du repo

```
news-aggregator/
  PLAN.md                     # ce document
  README.md                   # install + lancement local + Docker (phase 12)
  .env.example                # variables, sans secret
  .gitignore .editorconfig .nvmrc
  biome.json                  # format + lint
  commitlint.config.mjs  .husky/           # hooks git (Husky v9)
  Dockerfile  .dockerignore  docker-compose.yml  LICENSE
  vite.config.ts  tsconfig*.json  components.json
  orval.config.ts             # generation du client depuis openapi.json
  openapi.json                # spec generee par le BFF (@hono/zod-openapi)
  index.html
  src/
    main.tsx
    routeTree.gen.ts          # genere par le plugin TanStack Router (ignore par git)
    routes/
      __root.tsx              # root route + contexte queryClient
      index.tsx               # ecran: recherche + filtres + resultats
      feed.tsx                # flux personnalise (preferences)
    api/
      generated/              # Orval: hooks TanStack Query + types + client (genere)
      http-client.ts          # mutator fetch (baseURL /api) injecte dans Orval
    features/
      search/                 # barre de recherche + filtres (etat URL)
      preferences/            # feed perso (localStorage), UI visible
    components/
      ui/                     # composants shadcn (zinc)
      article-card.tsx  states/ (loading/empty/error/partial)
    mocks/                    # implementation statique du contrat avec fixtures
    lib/
      query-client.ts         # TanStack Query
      analytics.ts            # client PostHog, active par env
      analytics-provider.tsx  # provider React conditionnel
      i18n.ts                 # i18next en/de
      utils.ts                # cn() shadcn
    locales/                  # traductions en/de
    styles/ index.css         # tailwind v4 + variables zinc
    test/ setup.ts            # RTL + jest-dom
  server/
    index.ts                  # bootstrap @hono/node-server + serveStatic (prod)
    app.ts                    # OpenAPIHono: routes /api/* decrites en Zod
    schema.ts                 # Zod: Article, SearchParams, SourceStatus (source de verite)
    openapi.ts                # emet openapi.json (pre-generation Orval)
    providers/
      newsapi.ts guardian.ts nytimes.ts index.ts   # adaptateurs -> Article (pattern Adapter)
      __fixtures__/           # donnees mock par source (fallback sans cle)
  tests/e2e/                  # Playwright desktop et mobile
  .github/workflows/ci.yml    # audit + lint + types + couverture + e2e + Docker
```

### 4.1 Modele de donnees (deja cadre dans `../docs/api-sources.md`)

```ts
// server/schema.ts - source de verite unique (sert @hono/zod-openapi ET Orval)
import { z } from "zod";

export const Article = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string().url(),
  imageUrl: z.string().url().nullable(),
  source: z.string(),
  provider: z.enum(["newsapi", "guardian", "nytimes"]),
  author: z.string().nullable(),
  category: z.string().nullable(),
  publishedAt: z.string().datetime(), // ISO 8601
});
export type Article = z.infer<typeof Article>;

export const SearchParams = z.object({
  q: z.string().min(1),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  category: z.string().optional(),
  sources: z.string().optional(), // csv des providers
  author: z.string().optional(),
});

export const SourceStatus = z.object({
  provider: Article.shape.provider,
  ok: z.boolean(),
  error: z.string().nullable(),
});

export const SearchResponse = z.object({
  articles: z.array(Article),
  sources: z.array(SourceStatus), // echecs partiels par source
});

// server/providers - un adaptateur par source (pattern Adapter), cote serveur
export interface ArticleProvider {
  id: z.infer<typeof Article>["provider"];
  label: string;
  search(params: z.infer<typeof SearchParams>, signal?: AbortSignal): Promise<Article[]>;
}
```

**Pattern Adapter** (a nommer explicitement dans le README, cf. 15.4): cote **serveur**, un adaptateur par source implemente `ArticleProvider` et normalise la forme propre du provider (NewsAPI, Guardian, NYT tres differents) vers `Article`. Ajouter une source = ajouter un fichier, sans toucher au reste (Open/Closed + Dependency Inversion). Le schema Zod ci-dessus est la **source de verite unique**: `@hono/zod-openapi` en derive la spec OpenAPI, et **Orval** en derive les types + hooks du client. Le front n'ecrit aucun type d'API a la main. C'est la reponse directe a l'obsession "design patterns / type-safety / SOLID" d'Innoscripta. (Cote serveur, le `z` provient de `@hono/zod-openapi` pour porter les metadonnees `.openapi()`; details en Annexe D.)

---

## 5. Isolation vis-a-vis du workspace parent (piege d'environnement)

Le dossier parent contient un `pnpm-workspace.yaml` (sans cle `packages:`) et un `package.json` (ragmir). Lance depuis `news-aggregator/`, pnpm remonte l'arbre et peut rattacher a tort ce sous-projet au workspace parent.

**Mitigation (phase 1)**:
- Ajouter un `news-aggregator/pnpm-workspace.yaml` **propre** (ou `packages: []`) pour faire de ce dossier une **racine de workspace autonome**.
- Le sous-projet a son **propre lockfile** `pnpm-lock.yaml`.
- Verifier apres `pnpm install` que `node_modules` est bien cree dans `news-aggregator/`, pas remonte au parent.

---

## 6. Internationalisation (i18n)

- Langues: **anglais (`en`) et allemand (`de`)**. Justification: le brief est emis par **innoscripta AG, Arnulfstrasse 60, 80335 Munchen** -> societe allemande. `en` par defaut (langue du brief), `de` en seconde langue.
- Stack: `i18next` + `react-i18next` + `i18next-browser-languagedetector` (versions en Annexe A).
- Ressources bundlees (`src/locales` ou `public/locales`), detection: querystring > localStorage > navigator. Selecteur de langue visible dans l'UI.
- `escapeValue: false` (React echappe deja). Cles typees via `CustomTypeOptions`.
- Aucun texte d'UI en dur: tout passe par `t()`.

---

## 7. Design system et accessibilite

- **shadcn/ui 3.x**, base color **`zinc`**, style `new-york`, sur **Tailwind CSS v4** (CSS-first, plugin `@tailwindcss/vite`, aucun `tailwind.config.js`).
- Variables semantiques OKLCH dans `:root` + `.dark`, exposees via `@theme inline`. Dark mode par classe `.dark` (petit `ThemeProvider` maison lisant `localStorage`, pas de `next-themes` en Vite).
- Mobile-first: filtres repliables sur mobile, grille fluide des cartes, cibles tactiles >= 44px.
- Accessibilite (RGAA/WCAG AA de principe): elements interactifs semantiques, `label` sur chaque champ, focus visible conserve, images avec `alt`, contrastes respectes.

---

## 8. Observabilite et gestion des erreurs (PostHog "pour de faux")

Objectif: instrumenter proprement le monitoring **sans envoyer vers un vrai projet** tant qu'aucune cle n'est fournie. Le cablage est reel et demontrable, mais **desactive par defaut**.

Approche (alignee sur le repo `workoutgen`, voir [Annexe A](#annexe-a--stack-et-versions-verifiees-context7)):
- `posthog-js` initialise seulement si `VITE_PUBLIC_POSTHOG_KEY` est defini; sinon **no-op** (aucun reseau, aucune erreur).
- Pattern **reverse proxy** (`/ingest`) documente pour eviter les bloqueurs, sans exposer d'infrastructure.
- **Error Boundary** React global + `captureException` sur les erreurs non catchees et les echecs providers.
- Capture manuelle des `$pageview` sur changement de route (SPA + TanStack Router).
- Evenements produit legers: recherche lancee, filtre applique, preference modifiee.

---

## 9. Qualite, DevTools et conventions

- **Biome** (format + lint, remplace ESLint/Prettier). Le template Vite `react-ts` recent propose `oxlint` par defaut: on le retire au profit de Biome (un seul outil format+lint). Voir Annexe A.
- **TypeScript strict**: pas de `any`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Narrowing aux frontieres (reponses API).
- **Conventional Commits** valides par **commitlint** (`@commitlint/config-conventional`).
- **Hooks git** (Husky v9, comme workoutgen):
  - `pre-commit`: `biome check --staged --write` (pas besoin de lint-staged).
  - `commit-msg`: commitlint (`@commitlint/config-conventional`).
  - `pre-push`: Biome + `typecheck` + tests.
- **Alias `@/`** vers `src/` (tsconfig + vite).
- Pas de `console.log` residuel, pas de code mort, pas d'abstraction speculative (YAGNI).

---

## 10. Strategie de tests

- **Vitest** (node) cote serveur: la **normalisation** de chaque adaptateur (fixtures brutes provider -> `Article` conforme au schema Zod) et le **fan-out / echecs partiels** de `/api/search`.
- **Vitest + Testing Library** (jsdom) cote front: la **logique de filtrage**, les **preferences**, l'analytics conditionnelle et l'implementation statique du contrat.
- **Playwright**: scenarios **smoke** sur desktop Chromium et Pixel 5 (recherche, filtre, preference, langue) en **mode mock serveur** pour etre deterministe.
- Regle: mocker les frontieres externes (fetch upstream cote serveur, SDK analytics), pas les modules internes. Nettoyage en `afterEach`.

---

## 11. Docker

Objectif verifie: `docker build` puis `docker run` **sans aucune cle** lance l'app complete (mode mock serveur, cf. 3.4). C'est exactement ce que l'evaluateur executera.

- **Multi-stage**: stage `build` (corepack + `pnpm install --frozen-lockfile` + `vite build` -> `dist/` + bundle du serveur Hono via tsup/esbuild -> `server-dist/index.js` autonome) ; stage `runner` (`node:22-slim`, copie `dist/` + `server-dist/` + fixtures, `USER node`).
- **Un seul process, un seul port**: le serveur Hono sert `dist/` en statique **et** `/api/*` (+ `/ingest/*` PostHog). Pas de nginx.
- **Sans cle -> mock serveur**, **avec cles -> live** (`docker run --env-file .env`). La meme image couvre les deux, sans rebuild.
- **Secrets**: jamais dans l'image, passes au runtime (`-e` / `--env-file`). Les `VITE_*` publiques ont des valeurs par defaut au build (PostHog desactive par defaut).
- **Robustesse**: `HEALTHCHECK` sur `/api/health`, utilisateur non-root, `.dockerignore` (exclut `node_modules`, `.git`, `.env*`, `dist`, `coverage`, tests, `.ragmir`).
- README documente `docker build`, `docker run` (mock et live), le port, et le smoke test.
- **`docker-compose.yml`** fourni pour un `docker compose up` en une commande (trait recurrent des submissions Innoscripta acceptees).
- Dockerfile de reference: [Annexe C](#annexe-c--dockerfile-de-reference-verifie-faisable).

---

## 12. Git et GitFlow

### 12.1 Branches
- `main`: production, taggee (`vX.Y.Z`). Le commit seed = ce PLAN.md.
- `develop`: branche d'integration.
- `feature/<slug>`: une par phase, partant de `develop`, mergee dans `develop`.
- `release/<version>`: stabilisation avant `main`.
- `hotfix/<slug>`: correctif urgent depuis `main`.

### 12.2 Commits (segmentation professionnelle)
Un commit conventionnel par unite logique. Fil directeur par phase:

| Phase | Branche | Commits types |
|---|---|---|
| 0 | (main/develop) | `docs: add implementation plan`, `chore: init repo and gitflow` |
| 1 | `feature/scaffold` | `chore: scaffold vite react-ts`, `chore: isolate pnpm workspace`, `build: strict tsconfig and path alias` |
| 2 | `feature/tooling` | `chore: add biome`, `ci: add commitlint and git hooks`, `ci: add github actions pipeline` |
| 3 | `feature/design-system` | `feat(ui): add tailwind v4 and shadcn zinc`, `feat(ui): add theme provider and dark mode`, `feat(ui): responsive app shell` |
| 4 | `feature/domain-providers` | `feat(domain): add Article model`, `feat(providers): add source adapters`, `test(providers): normalization tests`, `feat(providers): mock mode fixtures` |
| 5 | `feature/bff-proxy` | `feat(server): add hono bff proxy`, `chore: wire dev proxy to bff`, `docs: env variables` |
| 6 | `feature/data-layer` | `feat: add tanstack query client`, `feat: add tanstack router with typed search` |
| 7 | `feature/search-filters` | `feat(search): keyword search`, `feat(search): date category source filters in url` |
| 8 | `feature/preferences` | `feat(preferences): sources categories authors`, `feat(feed): personalized feed view` |
| 9 | `feature/ux-i18n` | `feat: loading empty error partial states`, `feat(i18n): english and german`, `feat(a11y): labels and focus` |
| 10 | `feature/observability` | `feat(monitoring): posthog gated init`, `feat(monitoring): error boundary and capture` |
| 11 | `feature/tests` | `test: filtering and preferences`, `test(e2e): playwright smoke` |
| 12 | `release/1.0.0` | `feat: dockerfile multi-stage`, `docs: readme and docker guide`, `chore: complete control checklist` |

Merge `release/1.0.0` -> `main`, tag `v1.0.0`, back-merge dans `develop`.

---

## Phases d'execution detaillees

> Chaque phase: **Objectif**, **Actions**, **Validation**, **Commits**. A lancer une par une.

### Phase 0 - Amorcage du repo et garde-fous
- **Objectif**: repo Git tracke, GitFlow amorce, garde-fous secrets en place.
- **Actions**: `git init -b main` dans `news-aggregator/`; commit du PLAN.md; creer `develop`; ajouter `.gitignore` (node_modules, dist, `.env*` sauf `.env.example`, `routeTree.gen.ts`, coverage, playwright-report), `.editorconfig`, `.nvmrc`, `.env.example` (copie des noms de variables, sans valeur secrete).
- **Validation**: `git status` propre; `git log` montre le commit du plan; aucune valeur secrete dans le diff.
- **Commits**: `docs: add implementation plan`; `chore: init repo and gitflow guardrails`.

### Phase 1 - Socle Vite + React + TS
- **Objectif**: SPA qui demarre, TS strict, alias, workspace isole.
- **Actions**: `pnpm create vite@latest . --template react-ts` (fusion si dossier non vide); retirer `oxlint` du template; `pnpm-workspace.yaml` propre; alias `@/`; scripts `dev/build/preview/typecheck`; `tsconfig` strict.
- **Validation**: `pnpm install` (node_modules local), `pnpm typecheck`, `pnpm build`, `pnpm dev` sert la page.
- **Commits**: `chore: scaffold vite react-ts`; `chore: isolate pnpm workspace`; `build: strict tsconfig and path alias`.

### Phase 2 - Outillage qualite et CI
- **Objectif**: format/lint/commits/hooks/CI operationnels.
- **Actions**: Biome 2.5.x (`biome.json`, voir A.6), scripts `check`/`check:fix`; Husky v9 + commitlint (`commit-msg`), pre-commit `biome check --staged --write` (sans lint-staged), pre-push `verify:fast`; GitHub Actions reutilisable (`install --frozen-lockfile -> audit -> check -> typecheck -> coverage -> build -> e2e -> Docker smoke`).
- **Validation**: `pnpm biome check .` vert; un commit non conforme est rejete; CI verte.
- **Commits**: `chore: add biome`; `ci: add commitlint and git hooks`; `ci: add github actions pipeline`.

### Phase 3 - Design system (Tailwind v4 + shadcn zinc)
- **Objectif**: theme zinc, dark mode, coquille responsive.
- **Actions**: `@tailwindcss/vite` + `@import "tailwindcss"`; `npx shadcn@latest init` (baseColor `zinc`); premiers composants (`button`, `card`, `input`, `select`, `badge`); `ThemeProvider` localStorage; app shell mobile-first.
- **Validation**: `pnpm dev`, bascule clair/sombre OK, layout correct mobile/desktop (verifie au navigateur).
- **Commits**: `feat(ui): add tailwind v4 and shadcn zinc`; `feat(ui): add theme provider and dark mode`; `feat(ui): responsive app shell`.

### Phase 4 - Schema Zod et adaptateurs (cote serveur)
- **Objectif**: schema `Article` source de verite, 3 adaptateurs serveur, fallback mock, tests de normalisation.
- **Actions**: `server/schema.ts` (Zod: `Article`, `SearchParams`, `SourceStatus`, `SearchResponse`); `server/providers/{newsapi,guardian,nytimes}.ts` + `__fixtures__` (normalisation -> `Article`, **fallback fixture si la cle est absente**); tests Vitest (node) sur la normalisation de chaque provider.
- **Validation**: `pnpm test` vert; chaque adaptateur produit des `Article` conformes au schema Zod; le fallback sans cle rend des fixtures.
- **Commits**: `feat(server): add zod article schema`; `feat(server): add source adapters`; `feat(server): add mock fallback fixtures`; `test(server): adapter normalization tests`.

### Phase 5 - BFF contract-first (@hono/zod-openapi) + generation Orval
- **Objectif**: endpoint unifie `/api/search` decrit en OpenAPI, cles cote serveur, client genere.
- **Actions**: `server/app.ts` (`OpenAPIHono`, `GET /api/search` avec fan-out parallele isole -> `Article[]` + statut par source, `GET /api/health`); `app.doc('/openapi.json')` et Swagger UI; `server/openapi.ts` emet `openapi.json`; `orval.config.ts` (client `react-query`, input `openapi.json`, mutator `/api`) -> `src/api/generated`; `server/index.ts` bootstrap `@hono/node-server` + `serveStatic`; `server.proxy` Vite vers le BFF; `.env.example` a jour. Voir Annexe A.7 et Annexe D.
- **Validation**: `pnpm generate:api` (= `emit:openapi` puis `orval`) ne produit aucun diff en CI; `/api/search` renvoie `Article[]` + echecs partiels; aucune cle dans le bundle (`grep` du `dist`).
- **Commits**: `feat(server): contract-first bff with zod-openapi`; `feat(api): generate typed client with orval`; `chore: wire dev proxy to bff`; `docs: document env variables`.

### Phase 6 - Couche donnees front (TanStack Query + Router)
- **Objectif**: cache, routing type-safe, filtres URL, hooks generes.
- **Actions**: `query-client.ts` (defauts: staleTime, retry); `QueryClientProvider` + devtools; plugin `@tanstack/router-plugin` (avant `react()`); `routes/__root.tsx` avec contexte `queryClient`; consommer le hook **genere par Orval** `useSearchArticles` (nom derive de l'`operationId`; le fan-out des 3 sources est deja cote serveur); `validateSearch` (Zod) sur la route de recherche (filtres dans l'URL).
- **Validation**: `pnpm build` (routeTree genere); la recherche renvoie les 3 sources agregees; les echecs partiels s'affichent; filtres dans l'URL partageable.
- **Commits**: `feat: add tanstack query client`; `feat: add tanstack router with typed search params`; `feat(search): consume generated search hook`.

### Phase 7 - Recherche et filtres
- **Objectif**: R1 a R4.
- **Actions**: barre de recherche debouncee (etat URL); filtres date (from/to), categorie, source, relies a `validateSearch`; agregation + tri des resultats des 3 sources.
- **Validation**: recherche + chaque filtre modifie l'URL et les resultats; URL partageable reproduit l'etat.
- **Commits**: `feat(search): keyword search`; `feat(search): date category and source filters`.

### Phase 8 - Preferences et flux personnalise
- **Objectif**: R5, feed perso **visible**.
- **Actions**: panneau de preferences (sources, categories, auteurs); persistance `localStorage`; route/vue `feed` qui applique les preferences; etat vide guide si aucune preference.
- **Validation**: preferences persistees apres reload; le feed reflete les preferences; tests preferences verts.
- **Commits**: `feat(preferences): sources categories authors`; `feat(feed): personalized feed view`.

### Phase 9 - Etats UI, i18n, accessibilite
- **Objectif**: R6 + robustesse + i18n en/de.
- **Actions**: etats chargement/vide/erreur/**succes partiel** (une source KO n'empeche pas les autres); i18next en/de + selecteur; passe a11y (labels, focus, alt, contrastes); responsive final.
- **Validation**: simuler une source en erreur -> page utilisable; bascule en/de complete; audit a11y au navigateur.
- **Commits**: `feat: loading empty error and partial states`; `feat(i18n): english and german`; `feat(a11y): labels focus and contrast`.

### Phase 10 - Observabilite (PostHog gated)
- **Objectif**: monitoring instrumente, desactive par defaut.
- **Actions**: provider PostHog conditionnel a `VITE_PUBLIC_POSTHOG_KEY` + host (mode desactive sinon); reverse proxy `/ingest` (dev via `server.proxy`, prod via Hono); error boundary React global + `captureException`; `capture_exceptions` pour les erreurs globales; `$pageview` manuel sans query string; evenement de recherche sans texte utilisateur. Voir Annexe A.5.
- **Validation**: sans cle, aucun appel reseau PostHog et aucune erreur; avec une cle factice + reverse proxy, les evenements partent vers `/ingest`.
- **Commits**: `feat(monitoring): posthog gated init`; `feat(monitoring): error boundary and capture`.

### Phase 11 - Tests (completion)
- **Objectif**: couverture comportementale + smoke e2e.
- **Actions**: completer les tests filtrage/preferences/API/analytics; imposer les seuils de couverture; Playwright desktop/mobile (recherche, filtre, preference, langue) en mode mock.
- **Validation**: `pnpm test:coverage` et `pnpm test:e2e` verts.
- **Commits**: `test: filtering and preferences`; `test(e2e): playwright smoke`.

### Phase 12 - Docker, doc, release
- **Objectif**: R9 + livraison.
- **Actions**: `Dockerfile` multi-stage + `.dockerignore` + `docker-compose.yml`; en-tetes de securite servis par le BFF Hono (CSP, `X-Content-Type-Options`, permissions, frame et referrer); README (install, dev, Docker, variables, modes live/mock, limitations); completer `docs/control-checklist.md`; `release/1.0.0` -> `main`, tag `v1.0.0`.
- **Validation**: `docker build` + `docker run` demarrent le container; smoke test navigateur; diff scanne pour secrets; checklist complete.
- **Commits**: `feat: add multi-stage dockerfile`; `docs: readme and docker guide`; `chore: complete control checklist`.

### Phase 13 - Publication GitHub, demo et soumission
- **Objectif**: repo public evaluable, documente, sans ZIP (contrainte email Innoscripta).
- **Actions**: creer le repo GitHub **public** (`gh repo create`), pousser `main` + `develop` + tags (historique GitFlow visible); README vitrine (section 15) avec captures/GIF; `LICENSE` (MIT); description + topics; **demo live** deployee (Cloudflare Pages / Netlify / Fly, mode mock) avec lien dans le README; verifier la CI verte sur GitHub; derniere passe secrets.
- **Validation**: le repo se comprend en < 2 min; `docker run` sans cle marche depuis un clone frais; demo live accessible; CI verte; aucun secret dans l'historique.
- **Commits/PR**: PRs `feature/*` -> `develop` visibles; `docs: add screenshots and live demo link`; tag `v1.0.0` sur `main`.
- **Soumission manuelle**: le candidat repond a `sharma@innoscripta.com` avec le lien du repo + CV a jour, sous 5 jours, **sans ZIP**. Aucun envoi automatise.

---

## 13. Risques et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| NewsAPI bloque les appels navigateur en plan gratuit / CORS | Pas de donnees live cote client | BFF Hono (appel serveur), sinon mode mock |
| Quotas Guardian / NYT depasses | Resultats partiels | Echecs partiels geres par source, etat degrade |
| Cle API fuit dans le bundle | Faille de securite | Jamais de `VITE_` sur un secret; `grep` du `dist`; scan du diff |
| Tailwind v4 casse vs tutoriels v3 | Setup errone | Suivre Annexe A (CSS-first, `@tailwindcss/vite`, pas de `tailwind.config.js`) |
| `routeTree.gen.ts` commite ou lint casse | Bruit / CI rouge | Ajouter aux ignores (git, biome) |
| pnpm rattache au workspace parent | Install cassee | `pnpm-workspace.yaml` propre + lockfile local (phase 5 doc) |
| Distracteur PAC reintroduit du scope | Sur-ingenierie | PAC hors perimetre, verifie a chaque phase |
| Deadline 5 jours vs stack ambitieuse | Livraison incomplete | Chemin critique MVP (15.3): exigences du brief d'abord, extras degradables |
| Secret pousse dans l'historique GitHub public | Fuite de cle | `.gitignore` strict, scan avant chaque push, jamais de `git add -f`, repo rendu public seulement apres verification |
| Sur-ingenierie percue (ils jugent la clarte, pas le volume) | Signal negatif en revue | Garder KISS: patterns nommes et justifies, pas de couches speculatives |
| Client Orval desynchronise du contrat OpenAPI | Types faux / bugs silencieux | `generate:api` en CI (echec si diff); scripts `predev`/`prebuild` regenerent |
| `@hono/zod-openapi` v1 exige Zod v4 | Incompat de version | Pin `zod ^4` (deja fait); `z` importe depuis `@hono/zod-openapi` cote serveur |

---

## 14. Definition of Done (globale)

- L'app demarre en local avec la commande documentee.
- Le container Docker demarre avec la commande documentee.
- Les 3 sources sont integrees (ou mockees explicitement si cles absentes).
- R1 a R10 couvertes; feed personnalise **visible**.
- Etats chargement/vide/erreur/partiel presents.
- Aucune cle ni secret dans le diff ni dans le bundle.
- `biome check`, typecheck, tests, build, `docker build`, `docker run` verts.
- `../docs/control-checklist.md` complete.
- Repo GitHub **public**, README vitrine, `LICENSE`, CI verte, **pas de ZIP** (cf. section 15).
- `docker compose up` (ou `docker run`) sans cle lance l'app depuis un clone frais.
- Pattern Adapter et SOLID/DRY/KISS enonces dans le README.

---

## 15. Soumission GitHub et strategie recruteur (Innoscripta)

### 15.1 Contraintes de l'email (obligatoires)
- Livrer via **repo GitHub public**, **jamais de ZIP**.
- Tout doit etre **documente et accessible via le repo**.
- Repondre manuellement a **sharma@innoscripta.com** avec **lien du repo + CV a jour**, sous **5 jours**. Aucun envoi automatise.
- Evaluation interne; si convaincant, entretien technique avec le lead IT.

### 15.2 README vitrine (ce que l'evaluateur voit en premier)
Un seul README **en anglais** (langue de travail Innoscripta), lisible en 2 minutes:
1. Titre + pitch en une ligne + **lien demo live** + badges (CI, licence).
2. **Capture / GIF** (recherche, filtres, feed perso, mobile).
3. **Quickstart**: `docker compose up` (marche sans cle) puis local (`pnpm i && pnpm dev`).
4. **Features** mappees aux exigences du brief.
5. **Stack + justification** (SPA Vite + TanStack + BFF Hono; lien section 3).
6. **Architecture & decisions**: SOLID/DRY/KISS enonces, **pattern Adapter** par source, modele `Article`, BFF, modes mock/live.
7. **Configuration**: variables d'env (`.env.example`), modes mock/live.
8. **Qualite**: tests, `biome`, typecheck, a11y, i18n en/de, CI.
9. **Trade-offs / what I'd do next**: limites connues et suites.

### 15.3 Chemin critique en 5 jours (MVP d'abord)
Livrer un produit **complet et poli** plutot qu'une stack maximale a moitie finie: Innoscripta juge explicitement les **best practices, pas la completude**.
- **Indispensable (J1-J3)**: phases 0-9 = socle, 3 sources (mock + live), recherche, filtres, feed perso, etats, responsive, i18n en/de, README + Docker qui tournent sans cle.
- **Fort atout (J4)**: phases 10-11 = tests (unit + 1 smoke e2e), CI verte, observabilite PostHog gated.
- **Finition (J5)**: phases 12-13 = Docker/compose final, demo live, captures, LICENSE, relecture, envoi.
- **Degradable si le temps manque**: React Compiler, reverse proxy PostHog, e2e etendus, et la chaine Orval/OpenAPI (fallback: client `fetch` typé a la main sur le meme contrat). A couper **avant** de sacrifier les exigences du brief, les tests ou la doc.

### 15.4 Ce qui maximise les chances chez Innoscripta
Contexte: SaaS/fintech B2B a Munich (Forschungszulage, R&D tax credits), IPO 2025, domaine reglemente "audit-proof", langue de travail anglais, frontend React + TypeScript, backend Laravel. Ils jugent la clarte et les patterns avant la completude. Leviers:
- **Nommer le pattern Adapter** dans le README: un `ArticleProvider` par source normalise NewsAPI/Guardian/NYT (formes tres differentes) vers `Article`. Cible directe de leur focus "design patterns / SOLID".
- **Section "Architecture & decisions"** enoncant SOLID/DRY/KISS, composants petits, logique en hooks/services (pas de God-components).
- **TypeScript strict, zero `any`**; domaine type (`Article`, `Source`, `Category`, `Filters`, `Preferences`).
- **Vrais tests** (Vitest + RTL): differenciateur fort, la plupart des candidats n'en mettent pas. Tester adapters, filtrage, preferences, etats erreur/vide.
- **Docker + docker-compose** qui marchent du premier coup, **sans cle** (mock serveur): trait quasi universel des submissions acceptees.
- **TanStack Query** (cache, retries, etats): lu comme senior; ils interrogent la scalabilite en entretien.
- **Securite des cles**: `.env.example`, jamais de secret commite, BFF cote serveur (ils insistent auth/securite dans leurs offres).
- **a11y + i18n en/de**: differenciateur **cible sur leur marche allemand**; tres peu de candidats le font.
- **README de qualite** (screenshots/GIF, rationale, run local + Docker, schema archi, trade-offs / next steps): leur metier est la documentation audit-proof, la qualite doc resonne culturellement.

Prepa entretien (au-dela du take-home, a garder en tete): patterns creationnels en React, micro-frontends, class vs functional, "comment monitorer/scaler un site a 3M d'utilisateurs".

CV (a joindre a l'email): mettre en avant React + TypeScript, Docker, integration REST API, tests, design patterns / clean architecture; toute experience B2B SaaS / fintech / domaine reglemente; allemand meme niveau notion; performance/scalabilite et ownership (leurs valeurs), avec si possible une metrique.

### 15.5 Checklist de soumission
- [x] Repo GitHub **public**, pas de ZIP.
- [x] `docker compose up` / `docker run` sans cle lance l'app depuis un clone frais.
- [x] README vitrine complet (captures, quickstart, stack, archi, trade-offs).
- [x] `LICENSE` (MIT) presente.
- [ ] CI GitHub Actions **verte** (lint, typecheck, test, build).
- [x] Pattern Adapter et principes SOLID/DRY/KISS visibles dans l'architecture et le code.
- [x] Tests presents (adapters, filtrage, preferences, etats, analytics, E2E).
- [x] i18n en/de operationnelle.
- [x] Aucun secret detecte dans le depot ni le bundle.
- [ ] Demo live accessible (recommande).
- [ ] Email manuel a `sharma@innoscripta.com`: lien repo + CV a jour, sous 5 jours.

---

## Annexe A - Stack et versions (verifiees Context7)

> Pins indicatifs (2026). Confirmer le patch exact avec `pnpm view <pkg> version` a l'install.
> Versions alignees sur le repo `workoutgen` (eprouve en production) quand elles divergent des snippets Context7.

### A.1 Coeur (verifie)
| Paquet | Version | Role |
|---|---|---|
| `vite` | `^8.1` | Bundler / dev server |
| `@vitejs/plugin-react` | `^6.0` | React dans Vite |
| `react` / `react-dom` | `^19.2` | UI |
| `typescript` | `~6.0` | Types (strict) |
| `@types/node` | `^24` | `path` dans vite.config |
| `@tanstack/react-query` | `^5.101` | Data fetching / cache |
| `@tanstack/react-query-devtools` | `^5.101` | Devtools query (dev) |
| `@tanstack/react-router` | `^1.170` | Routing type-safe |
| `@tanstack/router-plugin` | `^1.170` | Generation routeTree (dev) |
| `@tanstack/react-router-devtools` | `^1.170` | Devtools router (verifier le nom exact) |
| `zod` | `^4` | Validation `validateSearch` (v4 compatible) |
| `tailwindcss` | `^4.1` | Styling (CSS-first) |
| `@tailwindcss/vite` | `^4.1` | Plugin Tailwind v4 |
| `shadcn` (CLI) | `3.x` | Composants (copie, pas de dep runtime) |
| `tw-animate-css` | latest | Animations v4 (remplace tailwindcss-animate) |
| `i18next` | `^26` | i18n coeur |
| `react-i18next` | `^17` | Binding React |
| `i18next-browser-languagedetector` | `^8` | Detection langue |
| `hono` | `^4.12` | BFF (serveur) |
| `@hono/node-server` | `^2.0` | Runtime Node du BFF |
| `@hono/zod-openapi` | `^1.4` | Routes Zod -> spec OpenAPI (contract-first, **Zod v4 requis**) |
| `@hono/swagger-ui` | `^0.6` | Swagger UI (optionnel) |
| `orval` | `^8.20` | Client `react-query` + types (devDep, ESM-only) |

Tests: `vitest ^4`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@playwright/test ^1.61`.
Qualite: `@biomejs/biome 2.5.x` (installe en version exacte), `@commitlint/cli ^21`, `@commitlint/config-conventional ^21`, `husky ^9`. Pas de `lint-staged`: `biome check --staged` suffit.
Bonus workoutgen (optionnel): `babel-plugin-react-compiler` + `@rolldown/plugin-babel` (React Compiler), `date-fns ^4`, `lucide-react`, `sonner` (toasts).

### A.2 Vite (config, verifie)
- `server.proxy` = **dev only**; prod = BFF reel. Cle secrete **jamais** en `VITE_`.
- `vite.config.ts`: plugin `tanstackRouter({ target: 'react', autoCodeSplitting: true })` **avant** `react()`, plus `@tailwindcss/vite`, plus alias `@`.

### A.3 shadcn / Tailwind v4 (verifie)
- `components.json`: `style: new-york`, `rsc: false`, `tailwind.config: ""` (v4), `baseColor: "zinc"`, `cssVariables: true`, alias `@/`.
- `src/index.css`: `@import "tailwindcss";` + tokens OKLCH dans `:root`/`.dark` + `@theme inline`. Dark mode: `@custom-variant dark (&:is(.dark *));` (remplace `darkMode: class`).
- v4: plus de `tailwind.config.js`, plus de PostCSS/autoprefixer, detection de contenu auto, utilitaires renommes (`shadow-sm`->`shadow-xs`, `rounded-sm`->`rounded-xs`, `outline-none`->`outline-hidden`), navigateurs modernes uniquement.

### A.4 i18next (verifie)
- Init `src/i18n.ts`: `.use(LanguageDetector).use(initReactI18next)`, `resources { en, de }`, `fallbackLng: "en"`, `supportedLngs: ["en","de"]`, `interpolation.escapeValue: false`, detection `["querystring","localStorage","navigator","htmlTag"]` + `caches: ["localStorage"]`. Importer `./i18n` dans `main.tsx`.

### A.5 PostHog (verifie: `posthog-js` 1.399.0)
- `pnpm add posthog-js` (le SDK React est le sous-chemin `posthog-js/react`, pas de paquet separe).
- Init moderne via `PostHogProvider apiKey={...} options={...}` (plus de `posthog.init()` manuel).
- **Env-gating** (aligne workoutgen): monter le provider seulement si la cle existe, sinon rendre l'app nue -> mode desactive (aucun reseau, aucune erreur). `safeCapture()` no-op si `posthog` est null.
```ts
const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST // ex: /ingest
const enabled = Boolean(key && host)
```
- Options cles: `api_host: host` (reverse proxy), `ui_host: "https://eu.posthog.com"`, `capture_pageview: false` (pageviews manuels via TanStack Router), `capture_exceptions: true` (autocapture erreurs), `person_profiles: "identified_only"`.
- **Reverse proxy `/ingest`** (evite les bloqueurs, self-host du chemin d'ingestion):
  - Dev (`vite.config.ts` `server.proxy`): `/ingest/static` -> `https://eu-assets.i.posthog.com/static`, `/ingest` -> `https://eu.i.posthog.com`.
  - Prod: memes routes dans le BFF Hono (`app.all('/ingest/*', ...)`). Un seul container sert SPA + `/api` + `/ingest`.
- Erreurs: error boundary React global route vers `reportError()` et `posthog.captureException(err)`; `capture_exceptions: true` gere deja `window.onerror` et les promesses rejetees, donc aucun listener global duplique.
- Gotcha: la cle de config est `capture_exceptions` (l'alias `enable_exception_autocapture` est legacy).

### A.6 Biome (verifie: 2.5.3, ligne v2)
- `pnpm add -D --save-exact @biomejs/biome` puis `pnpm biome init`.
- Commandes: `biome check --write` (format + lint + imports, fixes surs), `biome ci` (lecture seule CI), `biome check --staged --write` (pre-commit, sans lint-staged).
- `biome.json` (base React + TS, aligne workoutgen 2.5.x):
```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.5.3/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true, "defaultBranch": "main" },
  "assist": { "actions": { "source": { "organizeImports": "on" } } },
  "formatter": { "indentStyle": "space", "indentWidth": 2, "lineWidth": 100, "lineEnding": "lf" },
  "linter": { "rules": { "recommended": true,
    "correctness": { "noUnusedImports": "error", "useHookAtTopLevel": "error" },
    "style": { "useConst": "error", "useImportType": "error" } } },
  "javascript": { "formatter": { "quoteStyle": "double", "semicolons": "asNeeded", "trailingCommas": "all" } }
}
```
- Exclure `routeTree.gen.ts` de l'assist/format/lint (`includes` avec `!`).
- v2 vs v1: `organizeImports` -> `assist.actions.source`; `include`/`ignore` unifies en `includes` (globs `!`); lint type-aware sans `tsc`. Migration: `biome migrate --write`.

### A.7 Hono BFF - bootstrap et serveStatic (verifie: `hono` 4.12.28, `@hono/node-server` 2.0.8)
- `pnpm add hono @hono/node-server`.
- Les routes `/api/*` sont definies **contract-first** avec `@hono/zod-openapi` (endpoint unifie `/api/search`), voir Annexe D. `new Hono()` devient donc `new OpenAPIHono()`.
- Le snippet ci-dessous illustre le **bootstrap serveur**: fallback mock sans cle + `serveStatic` du SPA en prod.
```ts
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { mockNewsApi } from './fixtures' // fixtures partagees client/serveur (DRY)

const app = new Hono()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.get('/api/newsapi', async (c) => {
  const q = c.req.query('q') ?? ''
  const key = process.env.NEWS_API_KEY
  if (!key) return c.json(mockNewsApi(q)) // mock serveur: docker run sans cle marche
  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', q)
  url.searchParams.set('apiKey', key) // la cle reste cote serveur
  const r = await fetch(url)
  if (!r.ok) return c.json({ error: 'upstream failed' }, 502)
  return c.json(await r.json())
})

// prod: SPA statique + fallback SPA (APRES /api et les assets)
app.use('/*', serveStatic({ root: './dist' }))
app.get('*', serveStatic({ path: './dist/index.html' }))

serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3000) })
```
- Gotchas: l'ordre des routes compte (`/api` et assets AVANT le fallback `*`); `serveStatic` root est relatif a `process.cwd()` (le construire depuis `import.meta.url` pour fiabiliser); ajouter les routes `/ingest/*` pour PostHog. Same-origin -> pas de CORS.
- Ajouter des en-tetes de securite (CSP, cache, `X-Content-Type-Options`) cote Hono (equivalent du `_headers` Cloudflare de workoutgen).

### A.8 Conventions empruntees a workoutgen
- **Reproductibilite**: `packageManager` pnpm epingle avec hash SHA, `.nvmrc` (`22`), `engines.node >= 22.13`.
- **TS strict** (base a inliner): `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals`/`noUnusedParameters`, `moduleResolution: bundler`, `jsx: react-jsx`, `target ES2022`.
- **Biome** unique pour format + lint + imports (`pnpm check` / `check:fix`), pas d'ESLint/Prettier.
- **Hooks**: Husky v9 (`"prepare": "husky"`) + commitlint sur `commit-msg`. workoutgen a un pre-commit vide; on l'ameliore avec `biome check --staged`.
- **TanStack Router**: `createRouter` + module augmentation `interface Register`, `queryClient` dans le contexte, `defaultPreload: 'intent'`. Fabrique de cles typees: `queryKeys.articles.list(filter)`.
- **QueryClient**: `retry` qui ne rejoue pas sur 401/403/429, `retryDelay` en backoff, `staleTime` court (2 min). Pas de `PersistQueryClientProvider` ici (offline non requis pour un agregateur, YAGNI).
- **PostHog**: init env-gated, `api_host` par env (reverse proxy), `capture_pageview:false` + pageviews manuels, `before_send` filtrant le bruit (avec test), wrapper `safeCapture`.
- **i18next**: detection synchrone avant init, `dir`/`lang` poses sur `<html>`. workoutgen code-split 9 locales; pour 2 langues on garde du JSON simple (option code-split si les fichiers grossissent).
- **CI**: quality gate reutilisable (`workflow_call`) partagee PR + build, `pnpm install --frozen-lockfile`, actions epinglees au SHA.
- **Secrets**: uniquement cote serveur, jamais en `VITE_*`. `.gitignore` inclut `.env`, `.env.*.local`, `.dev.vars`.
- **React Compiler** (React 19, optionnel): `babel-plugin-react-compiler` (`compilationMode: 'infer'`); convention PR "pas de `useMemo`/`useCallback`/`React.memo` a la main".
- **Divergences assumees**: workoutgen deploie sur Cloudflare Pages/Workers (pas de Docker) et n'a pas de tests RTL. L'etude de cas EXIGE Docker -> on sert SPA + `/api` via le container Hono. On AJOUTE des tests Vitest + RTL (absents de workoutgen) car normalisation/filtrage/preferences doivent etre testes.

---

## Annexe B - References
- Brief: `../source-materials/cs-frontend-developer-2025.pdf` (+ `.txt`).
- Sources API: `../docs/api-sources.md` (NewsAPI, Guardian, NYT, modele `Article`).
- Cadre du dossier: `../AGENTS.md`, `../README.md`, `../docs/control-checklist.md`.
- Hors perimetre: `../source-materials/portail-academique-screen-map.md` (distracteur PAC).

---

## Annexe C - Dockerfile de reference (verifie faisable)

Esquisse validant que `docker run` **sans cle** lance l'app (mode mock serveur). A finaliser en phase 12.

```dockerfile
# ---- build ----
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build            # vite build -> dist/ ; bundle Hono (tsup/esbuild) -> server-dist/index.js

# ---- runtime ----
FROM node:22-slim AS runner
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server-dist ./server-dist
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server-dist/index.js"]
```

Lancement:
```bash
docker build -t news-aggregator .
docker run -p 3000:3000 news-aggregator                  # mode mock, aucune cle
docker run -p 3000:3000 --env-file .env news-aggregator  # mode live (cles au runtime)
```

Points de faisabilite verifies:
- Le serveur Hono est **bundle en un fichier autonome** (tsup/esbuild) -> pas de `node_modules` au runtime, image minimale, pas de `pnpm install` cote runner.
- `serveStatic` sert `dist/`; les fixtures sont incluses dans le bundle serveur (import), donc disponibles sans cle.
- `HEALTHCHECK` via `/api/health`, utilisateur non-root (`node`), un seul port.
- `.dockerignore` empeche de copier `node_modules`, `.git`, `.env*`, `dist`, `coverage`, tests, `.ragmir`.
- Le plugin TanStack Router regenere `routeTree.gen.ts` pendant `vite build` (fichier gitignore, non copie), donc le build fonctionne dans une image propre.
- Aucune `VITE_*` secrete: seules des valeurs publiques (avec defauts) entrent au build; les cles arrivent au runtime.

`docker-compose.yml` (evaluateur: `docker compose up`, sans cle -> mode mock; avec `.env` -> mode live):
```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - path: .env       # absent -> mode mock serveur; present -> mode live
        required: false  # Compose v2.24+; evite l'echec si .env n'existe pas
    restart: unless-stopped
```
Gotcha verifie: sans `required: false`, `docker compose up` echoue si `.env` est absent, ce qui est justement le cas de l'evaluateur. Alternative si Compose plus ancien: ne pas declarer `env_file` (mode mock par defaut) et passer les cles via un override.

---

## Annexe D - Contract-first: Hono zod-openapi + Orval (verifie)

Versions (npm, 2026): `orval` 8.20 (ESM-only), `@hono/zod-openapi` 1.4 (**Zod v4 requis**, Hono >= 4.10), `@hono/swagger-ui` 0.6.
Pipeline: `OpenAPIHono` (routes Zod) -> `openapi.json` -> Orval -> hooks TanStack Query + types.

### D.1 Route BFF decrite en Zod (`server/app.ts`)
```ts
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'; // z = wrapper avec .openapi()
import { swaggerUI } from '@hono/swagger-ui';

const Article = z.object({
  id: z.string(), title: z.string(), description: z.string().nullable(),
  url: z.string().url(), imageUrl: z.string().url().nullable(),
  source: z.string(), provider: z.enum(['newsapi', 'guardian', 'nytimes']),
  author: z.string().nullable(), category: z.string().nullable(),
  publishedAt: z.string().datetime(),
}).openapi('Article');

const SourceStatus = z.object({
  provider: z.string(), ok: z.boolean(), error: z.string().nullable(),
}).openapi('SourceStatus');

const SearchQuery = z.object({
  q: z.string().openapi({ param: { name: 'q', in: 'query' } }),
  from: z.string().optional(), to: z.string().optional(),
  category: z.string().optional(), sources: z.string().optional(),
});

const SearchResponse = z.object({
  articles: z.array(Article), sources: z.array(SourceStatus),
}).openapi('SearchResponse');

const searchRoute = createRoute({
  method: 'get', path: '/api/search',
  operationId: 'searchArticles',   // -> hook Orval useSearchArticles
  tags: ['search'],                // -> layout tags-split
  request: { query: SearchQuery },
  responses: { 200: { content: { 'application/json': { schema: SearchResponse } }, description: 'Aggregated results' } },
});

export const app = new OpenAPIHono();
app.openapi(searchRoute, async (c) => {
  const params = c.req.valid('query'); // valide + typé au runtime
  // appels providers encapsules puis fan-out Promise.all -> Article[] + statut par source
  return c.json({ articles: [], sources: [] }, 200);
});
app.doc('/api/openapi.json', { openapi: '3.0.0', info: { title: 'News BFF', version: '1.0.0' } });
app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' })); // optionnel
```
`@hono/zod-openapi` valide les **requetes** au runtime, pas les reponses (les `responses` servent la spec + les types).

### D.2 Emettre openapi.json sans serveur (`scripts/emit-openapi.ts`)
```ts
import { writeFileSync } from 'node:fs';
import { app } from '../server/app';
const doc = app.getOpenAPIDocument({ openapi: '3.0.0', info: { title: 'News BFF', version: '1.0.0' } });
writeFileSync('./openapi.json', JSON.stringify(doc, null, 2));
```
Preferer le document **3.0** (meilleure compat Orval) au 3.1.

### D.3 `orval.config.ts`
```ts
import { defineConfig } from 'orval';
export default defineConfig({
  bff: {
    input: { target: './openapi.json' },
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/generated/model',
      client: 'react-query',                                      // hooks TanStack Query v5
      httpClient: 'fetch',                                        // ou 'axios'
      override: {
        mutator: { path: './src/api/http-client.ts', name: 'customInstance' },
        query: { useQuery: true, useSuspenseQuery: true },
      },
    },
    hooks: { afterAllFilesWrite: 'biome format --write' },
  },
});
```

### D.4 Scripts et anti-derive
```jsonc
// package.json
{ "scripts": {
  "emit:openapi": "tsx scripts/emit-openapi.ts",
  "generate:api": "pnpm emit:openapi && orval",
  "predev": "pnpm generate:api",
  "prebuild": "pnpm generate:api"
} }
```
En CI: lancer `generate:api` puis **echouer si `git diff` non vide** (le client ne peut pas diverger du contrat). `src/api/generated` peut etre commite (revue plus lisible) ou gitignore + regenere: choisir l'un et le documenter.

### D.5 Gotchas verifies
- `@hono/zod-openapi` v1 **exige Zod v4** (et Hono >= 4.10). Importer `z` depuis `@hono/zod-openapi`, pas depuis `zod`.
- Orval v8 est **ESM-only**. Le projet ne genere que le client et les types; les fixtures deterministes restent dans `server/providers/fixtures.ts` et `src/mocks/static-api.ts`.
- Toujours definir `operationId` (nom du hook) et `tags` (layout `tags-split`).
- Reponses non validees au runtime cote Hono: garder les adaptateurs stricts (ils produisent deja des `Article` conformes).
