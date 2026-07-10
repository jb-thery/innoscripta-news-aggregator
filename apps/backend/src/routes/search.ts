import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi"
import {
  API_PATHS,
  type ProviderId,
  SearchParamsSchema,
  type SearchResponse,
  SearchResponseSchema,
  type SourceStatus,
} from "@signal-desk/contracts"
import type { ArticleProvider } from "../providers/types"

const searchRoute = createRoute({
  method: "get",
  path: API_PATHS.search,
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
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
})

const sourceStatus = (provider: ProviderId, ok: boolean, error: string | null): SourceStatus => ({
  provider,
  ok,
  error,
})

const searchProvider = async (
  provider: ArticleProvider,
  params: z.infer<typeof SearchParamsSchema>,
) => {
  try {
    const articles = await provider.search(params)
    return { status: sourceStatus(provider.id, true, null), articles }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown provider failure"
    return { status: sourceStatus(provider.id, false, message), articles: [] }
  }
}

export function registerSearchRoute(app: OpenAPIHono, providers: ArticleProvider[]) {
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

    return context.json(payload, 200)
  })
}
