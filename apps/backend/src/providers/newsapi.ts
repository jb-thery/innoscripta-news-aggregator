import { z } from "@hono/zod-openapi"
import { ArticleSchema, type SearchParams } from "@signal-desk/contracts"
import { filterArticles, getFixtureArticles } from "@signal-desk/news-domain"
import { PROVIDER_RESULT_LIMIT } from "./constants"
import type { ArticleProvider, ProviderRuntimeConfig } from "./types"

const newsApiArticleSchema = z.object({
  source: z
    .object({
      name: z.string().nullable().optional(),
    })
    .optional(),
  author: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  url: z.string().url(),
  urlToImage: z.string().url().nullable().optional(),
  publishedAt: z.string(),
})

const newsApiResponseSchema = z.object({
  articles: z.array(newsApiArticleSchema),
})

export function createNewsApiProvider(config: ProviderRuntimeConfig): ArticleProvider {
  const providerId = "newsapi" as const
  const provider: ArticleProvider = {
    id: providerId,
    hasLiveCredentials: () => Boolean(config.apiKey),
    async search(params: SearchParams, signal?: AbortSignal) {
      if (config.failProvider === providerId) {
        throw new Error("Simulated NewsAPI provider failure")
      }

      if (!config.apiKey) {
        return filterArticles(getFixtureArticles(providerId), params)
      }

      const url = new URL(`${config.baseUrl}/everything`)
      url.searchParams.set("q", params.q || "technology OR business OR science")
      url.searchParams.set("pageSize", PROVIDER_RESULT_LIMIT)
      url.searchParams.set("sortBy", "publishedAt")
      url.searchParams.set("language", "en")
      url.searchParams.set("apiKey", config.apiKey)

      if (params.from) {
        url.searchParams.set("from", params.from)
      }

      if (params.to) {
        url.searchParams.set("to", params.to)
      }

      const response = await fetch(url, signal ? { signal } : undefined)
      if (!response.ok) {
        throw new Error(`NewsAPI returned ${response.status}`)
      }

      const payload = newsApiResponseSchema.parse(await response.json())
      const articles = payload.articles.map((article, index) =>
        ArticleSchema.parse({
          id: `newsapi-${article.url}-${index}`,
          title: article.title ?? "Untitled NewsAPI article",
          description: article.description ?? null,
          url: article.url,
          imageUrl: article.urlToImage ?? null,
          source: article.source?.name ?? "NewsAPI.org",
          provider: providerId,
          author: article.author ?? null,
          category: params.category ?? null,
          publishedAt: new Date(article.publishedAt).toISOString(),
        }),
      )

      return filterArticles(articles, params)
    },
  }

  return provider
}
