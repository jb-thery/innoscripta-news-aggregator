# Signal Desk

Signal Desk is a responsive news aggregator that searches NewsAPI.org, The Guardian,
and The New York Times through one normalized and resilient interface. It is a frontend
case study focused on React architecture, typed API integration, partial-failure handling,
testability, security, and reproducible delivery.

![Signal Desk search results](docs/screenshots/search-desktop.webp)

## Quick start with Docker

No API key is required. Without credentials, each provider serves deterministic fixtures
through the same server contract used in live mode.

```bash
docker compose up --build --wait
```

Open [http://localhost:3000](http://localhost:3000). The OpenAPI document and Swagger UI
are available at [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json)
and [http://localhost:3000/docs](http://localhost:3000/docs).

```bash
docker compose down --remove-orphans
```

The review workflow can also be run through `mise`:

```bash
mise trust
mise install
mise run install
mise run docker:verify
```

`mise run docker:verify` builds the image, waits for its healthcheck, probes health and
search, then removes only the `signal-desk` Compose stack. Set `APP_PORT=4174` if port
`3000` is occupied.

## Local development

Requirements: Node 22, Corepack, and optionally `mise`.

```bash
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Vite serves [http://localhost:5173](http://localhost:5173) and proxies same-origin calls
to Hono on port `3000`. For live providers in local development, export the server
variables before `pnpm dev`. Docker Compose reads them from an ignored `.env` file.

## Product behavior

- Debounced keyword search with shareable URL state.
- Date, category, provider, and author filters.
- Personalized feed by preferred sources, categories, and authors.
- Browser-local preferences, language, and theme with no account required.
- English and German UI with locale-aware dates.
- Loading, empty, error, and per-provider partial-success states.
- Responsive desktop and mobile layouts with semantic controls and visible focus.
- Live, mixed, mock, and serverless static-demo modes.

## Architecture and data flow

```mermaid
flowchart TB
  subgraph Browser["Browser: React 19 SPA"]
    Shell["App shell: theme, i18n, runtime status"]
    SearchUI["Search route and URL filters"]
    FeedUI["Personalized feed"]
    Router["TanStack Router"]
    Query["TanStack Query cache"]
    Storage["localStorage preferences"]
    Boundary["Global React error boundary"]
    Analytics["Gated PostHog client"]

    Shell --> SearchUI
    Shell --> FeedUI
    SearchUI --> Router
    Router -->|"validated search state"| Query
    FeedUI --> Storage
    FeedUI --> Query
    Boundary --> Analytics
  end

  Contract["Orval-generated fetch client and types"]

  subgraph Runtime["Node 22 and Hono BFF"]
    SearchAPI["GET /api/search"]
    HealthAPI["GET /api/health"]
    OpenAPI["OpenAPI 3 and Swagger UI"]
    Ingest["Same-origin /ingest proxy"]
  end

  subgraph Providers["ArticleProvider adapters"]
    NewsAPI["NewsAPI.org"]
    Guardian["The Guardian"]
    NYT["New York Times"]
    Fixtures["Deterministic fixtures when a key is absent"]
  end

  subgraph Delivery["Delivery and verification"]
    Docker["Multi-stage non-root Docker image"]
    Static["Serverless static demo build"]
    CI["GitHub Actions: quality, browser, container"]
  end

  Query --> Contract --> SearchAPI
  Shell --> HealthAPI
  Analytics --> Ingest
  SearchAPI --> NewsAPI
  SearchAPI --> Guardian
  SearchAPI --> NYT
  NewsAPI --> Fixtures
  Guardian --> Fixtures
  NYT --> Fixtures
  OpenAPI --> Contract
  Docker --> Runtime
  Docker --> Browser
  Static --> Browser
  CI -. verifies .-> Browser
  CI -. verifies .-> Runtime
```

The provider layer uses the Adapter pattern. Each `ArticleProvider` translates one
upstream response into the Zod-backed `Article` contract. Provider requests run in
parallel and isolate errors, so one failed source does not discard successful results.

The API is contract-first:

1. Hono routes and Zod schemas produce `openapi.json`.
2. Orval generates models, fetch functions, and TanStack Query hooks.
3. CI regenerates the client and fails if committed output has drifted.

This keeps source-specific code at the BFF boundary, browser code independent of API
payload shapes, and provider secrets outside the client bundle.

SOLID, DRY, and KISS are applied at concrete boundaries: one responsibility per adapter,
one generated contract shared by server and browser, small route components, URL state for
shareable filters, and `localStorage` only for user-owned preferences. There is no generic
repository layer or speculative provider framework.

## Stack

| Concern | Choice |
| --- | --- |
| UI | React 19, TypeScript 6 strict mode, Vite 8 |
| Routing and state | TanStack Router, URL filters, `localStorage` preferences |
| Server state | TanStack Query with bounded retry and cache policies |
| API | Hono, Zod OpenAPI, Orval-generated fetch client |
| Data sources | NewsAPI, Guardian, and NYT adapters with fixture fallback |
| Styling | Tailwind CSS 4, CSS tokens, CVA-based components |
| Localization | i18next and react-i18next, English and German |
| Observability | Environment-gated PostHog and a global React error boundary |
| Quality | Biome, strict TypeScript, Vitest, Playwright, commitlint, Husky |
| Delivery | Node 22, Docker Compose, `mise`, GitHub Actions |

## Runtime modes

| Mode | Trigger | Behavior |
| --- | --- | --- |
| Mock | No provider keys | All adapters return local fixtures. This is the default review mode. |
| Mixed | Some provider keys | Configured sources are live; the others continue with fixtures. |
| Live | All provider keys | All adapters call their upstream APIs from the server. |
| Static demo | `VITE_ENABLE_MOCK_DATA=true` during build | The browser uses fixtures without a server or API requests. |

Set `MOCK_FAIL_PROVIDER` to `newsapi`, `guardian`, or `nytimes` to demonstrate partial
success without changing code.

## Configuration

Copy `.env.example` to `.env` only for Docker or other runtime configuration. Never add
provider credentials to a `VITE_` variable.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEWS_API_KEY` | Server secret | NewsAPI.org credential. |
| `GUARDIAN_API_KEY` | Server secret | Guardian Open Platform credential. |
| `NYT_API_KEY` | Server secret | New York Times API credential. |
| `NEWS_API_BASE_URL` | Server | Optional NewsAPI endpoint override. |
| `GUARDIAN_API_BASE_URL` | Server | Optional Guardian endpoint override. |
| `NYT_API_BASE_URL` | Server | Optional NYT endpoint override. |
| `PORT` | Server | Container/runtime port, default `3000`. |
| `APP_PORT` | Docker host | Published host port, default `3000`. |
| `MOCK_FAIL_PROVIDER` | Server | Simulates one provider failure. |
| `VITE_PUBLIC_POSTHOG_KEY` | Browser public | Enables analytics only when a host is also configured. |
| `VITE_PUBLIC_POSTHOG_HOST` | Browser public | Same-origin PostHog proxy path, normally `/ingest`. |
| `VITE_ENABLE_MOCK_DATA` | Build-time public | Enables the serverless fixture-only build. |

## Security and observability

- Provider credentials exist only in server runtime variables.
- `.env` files are excluded from Git and Docker build context.
- The browser calls the same-origin BFF, never secret-bearing provider endpoints.
- Hono sets CSP, frame, referrer, permissions, object, and content-type protections.
- Swagger receives a route-specific jsDelivr allowance; the SPA does not allow inline scripts.
- PostHog is disabled unless both public variables are present and uses `/ingest` when enabled.
- Pageviews contain only the pathname; search events contain query length, not search text.
- `capture_exceptions` handles global failures and the root error boundary captures React errors.
- pnpm enforces release age and trust-downgrade checks; CI fails on any known audit finding.

## Quality gates

Current local evidence:

- 41 Vitest tests across provider normalization, filtering, preferences, analytics,
  API behavior, partial failure, and static responses.
- Enforced coverage minimums: 80% statements, lines, and functions; 65% branches.
- Current broad TypeScript logic coverage: 81.45% statements, 80.91% lines, 84% functions,
  and 67.03% branches.
- 6 Playwright scenarios across desktop Chromium and a Pixel 5 viewport.
- Production SPA, standalone Hono server, and fixture-only static builds.
- Multi-stage Docker build, non-root runtime, healthcheck, API smoke tests, and clean SIGTERM.
- Mobile browser check: Accessibility 100, Best Practices 100, and SEO 100.

GitHub Actions separates three jobs:

- `quality`: dependency audit, generated-client drift, Biome, TypeScript, coverage, and builds.
- `browser`: Playwright on desktop and mobile Chromium profiles.
- `container`: image build, health/search probes, and graceful shutdown.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run Vite and Hono in watch mode. |
| `pnpm check` | Verify Biome formatting, imports, and lint rules. |
| `pnpm typecheck` | Run strict TypeScript without emitting files. |
| `pnpm test` | Run the Vitest suite. |
| `pnpm test:coverage` | Run Vitest and enforce coverage thresholds. |
| `pnpm test:e2e` | Run desktop and mobile Playwright scenarios. |
| `pnpm build` | Build the SPA and standalone Hono server. |
| `pnpm build:static-demo` | Build the fixture-only serverless SPA. |
| `pnpm generate:api` | Regenerate OpenAPI and the Orval client. |
| `pnpm verify:fast` | Run Biome, TypeScript, and Vitest before push. |
| `mise run verify` | Run coverage plus the complete production build. |
| `mise run docker:verify` | Build, smoke-test, and remove the review stack. |

Install Chromium once before a local E2E run if needed:

```bash
pnpm exec playwright install chromium
```

## Repository map

```text
server/                     Hono routes, OpenAPI schemas, and provider adapters
src/api/generated/          Orval-generated models and TanStack Query hooks
src/components/             Application shell, reusable UI, and render boundary
src/features/search/        URL-backed search state and filters
src/features/preferences/   Preference domain, context, persistence, and feed logic
src/lib/                    Analytics, i18n, query client, and shared metadata
src/mocks/                  Fixture-only static API implementation
src/routes/                 TanStack Router route components
tests/e2e/                  Desktop and mobile Playwright scenarios
docs/                       Brief, source notes, checklist, and screenshots
```

## Deliberate trade-offs

- Preferences remain local because account sync and authentication are outside the brief.
- The static demo is fixture-only; live providers require the Hono runtime.
- Remote fixture images may fail independently while article text remains usable.
- Provider plans, quotas, and permitted use must be reviewed before production deployment.
- A production rollout should add server-side response caching and request rate limiting.
- Pagination and cross-publisher deduplication are natural next data-layer improvements.

The original assignment is preserved at
[`source-materials/cs-frontend-developer-2025.pdf`](source-materials/cs-frontend-developer-2025.pdf).
