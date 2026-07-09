import { z } from "@hono/zod-openapi"
import { ArticleSchema, type SearchParams } from "../schema"
import { filterArticles } from "./filter"
import { getFixtureArticles } from "./fixtures"
import type { ArticleProvider, ProviderRuntimeConfig } from "./types"

const guardianResultSchema = z.object({
  id: z.string(),
  webTitle: z.string(),
  webUrl: z.string().url(),
  sectionName: z.string().nullable().optional(),
  webPublicationDate: z.string(),
  fields: z
    .object({
      trailText: z.string().nullable().optional(),
      thumbnail: z.string().url().nullable().optional(),
      byline: z.string().nullable().optional(),
    })
    .optional(),
})

const guardianResponseSchema = z.object({
  response: z.object({
    results: z.array(guardianResultSchema),
  }),
})

export function createGuardianProvider(config: ProviderRuntimeConfig): ArticleProvider {
  const provider = {
    id: "guardian" as const,
    label: "The Guardian",
    hasLiveCredentials: () => Boolean(config.apiKey),
    async search(params: SearchParams, signal?: AbortSignal) {
      if (config.failProvider === provider.id) {
        throw new Error("Simulated Guardian provider failure")
      }

      if (!config.apiKey) {
        return filterArticles(getFixtureArticles(provider.id), params)
      }

      const url = new URL(`${config.baseUrl}/search`)
      if (params.q) {
        url.searchParams.set("q", params.q)
      }
      url.searchParams.set("page-size", "20")
      url.searchParams.set("show-fields", "trailText,thumbnail,byline")
      url.searchParams.set("api-key", config.apiKey)

      if (params.from) {
        url.searchParams.set("from-date", params.from)
      }

      if (params.to) {
        url.searchParams.set("to-date", params.to)
      }

      if (params.category) {
        url.searchParams.set("section", params.category)
      }

      const response = await fetch(url, { signal })
      if (!response.ok) {
        throw new Error(`Guardian returned ${response.status}`)
      }

      const payload = guardianResponseSchema.parse(await response.json())
      const articles = payload.response.results.map((article) =>
        ArticleSchema.parse({
          id: `guardian-${article.id}`,
          title: article.webTitle,
          description: article.fields?.trailText ?? null,
          url: article.webUrl,
          imageUrl: article.fields?.thumbnail ?? null,
          source: "The Guardian",
          provider: provider.id,
          author: article.fields?.byline ?? null,
          category: article.sectionName ?? null,
          publishedAt: new Date(article.webPublicationDate).toISOString(),
        }),
      )

      return filterArticles(articles, params)
    },
  } satisfies ArticleProvider

  return provider
}
