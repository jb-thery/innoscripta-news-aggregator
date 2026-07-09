import { swaggerUI } from "@hono/swagger-ui"
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import type { Context, Next } from "hono"
import { proxy } from "hono/proxy"
import { createProviders } from "./providers"
import type { ArticleProvider } from "./providers/types"
import {
  HealthResponseSchema,
  type ProviderId,
  SearchParamsSchema,
  type SearchResponse,
  SearchResponseSchema,
  type SourceStatus,
} from "./schema"

const sourceStatus = (provider: ProviderId, ok: boolean, error: string | null): SourceStatus => ({
  provider,
  ok,
  error,
})

const contentSecurityPolicy = (path: string) => {
  const isApiDocumentation = path === "/docs"
  const scriptSources = isApiDocumentation
    ? "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
    : "script-src 'self'"
  const styleSources = isApiDocumentation
    ? "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
    : "style-src 'self' 'unsafe-inline'"
  const connectSources = isApiDocumentation
    ? "connect-src 'self' https://cdn.jsdelivr.net"
    : "connect-src 'self'"

  return [
    "default-src 'self'",
    scriptSources,
    styleSources,
    "img-src 'self' https: data:",
    "font-src 'self' data:",
    connectSources,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")
}

const securityHeaders = async (context: Context, next: Next) => {
  await next()

  context.header("X-Content-Type-Options", "nosniff")
  context.header("Referrer-Policy", "strict-origin-when-cross-origin")
  context.header("X-Frame-Options", "DENY")
  context.header(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  )
  context.header("Content-Security-Policy", contentSecurityPolicy(context.req.path))
}

const healthRoute = createRoute({
  method: "get",
  path: "/api/health",
  operationId: "getHealth",
  tags: ["system"],
  responses: {
    200: {
      description: "Runtime health and data mode.",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
})

const searchRoute = createRoute({
  method: "get",
  path: "/api/search",
  operationId: "searchArticles",
  tags: ["search"],
  request: {
    query: SearchParamsSchema,
  },
  responses: {
    200: {
      description: "Normalized news articles with per-provider status.",
      content: {
        "application/json": {
          schema: SearchResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid query parameters.",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
})

const searchProvider = async (
  provider: ArticleProvider,
  params: z.infer<typeof SearchParamsSchema>,
) => {
  try {
    const articles = await provider.search(params)
    return {
      status: sourceStatus(provider.id, true, null),
      articles,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown provider failure"

    return {
      status: sourceStatus(provider.id, false, message),
      articles: [],
    }
  }
}

export function createApp(providers = createProviders()) {
  const app = new OpenAPIHono()

  app.use("*", securityHeaders)

  app.openapi(healthRoute, (context) => {
    const liveCount = providers.filter((provider) => provider.hasLiveCredentials()).length
    const mode = liveCount === 0 ? "mock" : liveCount === providers.length ? "live" : "mixed"

    return context.json({
      status: "ok",
      mode,
      timestamp: new Date().toISOString(),
    })
  })

  app.openapi(searchRoute, async (context) => {
    const params = context.req.valid("query")
    const selectedProviders = new Set(
      params.providers
        ?.split(",")
        .map((provider) => provider.trim())
        .filter(Boolean) ?? providers.map((provider) => provider.id),
    )

    const activeProviders = providers.filter((provider) => selectedProviders.has(provider.id))
    const settled = await Promise.all(
      activeProviders.map((provider) => searchProvider(provider, params)),
    )
    const inactiveStatuses = providers
      .filter((provider) => !selectedProviders.has(provider.id))
      .map((provider) => sourceStatus(provider.id, true, "Not selected"))

    const payload = SearchResponseSchema.parse({
      articles: settled
        .flatMap((result) => result.articles)
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)),
      sources: [...settled.map((result) => result.status), ...inactiveStatuses],
    } satisfies SearchResponse)

    return context.json(payload)
  })

  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "Innoscripta News Aggregator BFF",
      version: "1.0.0",
      description: "Contract-first BFF that normalizes NewsAPI, The Guardian, and NYT articles.",
    },
  })

  app.get("/docs", swaggerUI({ url: "/openapi.json" }))

  app.all("/ingest/*", async (context) => {
    const upstreamPath = context.req.path.replace(/^\/ingest/, "")
    const target = upstreamPath.startsWith("/static")
      ? "https://eu-assets.i.posthog.com"
      : "https://eu.i.posthog.com"

    return proxy(`${target}${upstreamPath}`, {
      ...context.req.raw,
      headers: context.req.raw.headers,
    })
  })

  return app
}

export const app = createApp()
