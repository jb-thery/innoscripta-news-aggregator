import { z } from "@hono/zod-openapi"
import { ArticleSchema, type SearchParams } from "../schema"
import { filterArticles } from "./filter"
import { getFixtureArticles } from "./fixtures"
import type { ArticleProvider, ProviderRuntimeConfig } from "./types"

const nytMultimediaSchema = z.object({
  url: z.string().optional(),
})

const nytDocumentSchema = z.object({
  _id: z.string(),
  web_url: z.string().url(),
  headline: z.object({
    main: z.string().nullable().optional(),
  }),
  abstract: z.string().nullable().optional(),
  byline: z
    .object({
      original: z.string().nullable().optional(),
    })
    .optional(),
  section_name: z.string().nullable().optional(),
  pub_date: z.string(),
  multimedia: z.array(nytMultimediaSchema).optional(),
  source: z.string().nullable().optional(),
})

const nytResponseSchema = z.object({
  response: z.object({
    docs: z.array(nytDocumentSchema),
  }),
})

const toNytDate = (value: string) => value.replaceAll("-", "")

const toImageUrl = (multimedia: z.infer<typeof nytMultimediaSchema>[] | undefined) => {
  const path = multimedia?.find((item) => item.url)?.url
  if (!path) {
    return null
  }

  return path.startsWith("http") ? path : `https://www.nytimes.com/${path}`
}

export function createNytimesProvider(config: ProviderRuntimeConfig): ArticleProvider {
  const provider = {
    id: "nytimes" as const,
    label: "New York Times",
    hasLiveCredentials: () => Boolean(config.apiKey),
    async search(params: SearchParams, signal?: AbortSignal) {
      if (config.failProvider === provider.id) {
        throw new Error("Simulated New York Times provider failure")
      }

      if (!config.apiKey) {
        return filterArticles(getFixtureArticles(provider.id), params)
      }

      const url = new URL(`${config.baseUrl}/articlesearch.json`)
      if (params.q) {
        url.searchParams.set("q", params.q)
      }
      url.searchParams.set("sort", "newest")
      url.searchParams.set("api-key", config.apiKey)

      if (params.from) {
        url.searchParams.set("begin_date", toNytDate(params.from))
      }

      if (params.to) {
        url.searchParams.set("end_date", toNytDate(params.to))
      }

      if (params.category) {
        url.searchParams.set("fq", `section_name:("${params.category}")`)
      }

      const response = await fetch(url, { signal })
      if (!response.ok) {
        throw new Error(`New York Times returned ${response.status}`)
      }

      const payload = nytResponseSchema.parse(await response.json())
      const articles = payload.response.docs.map((article) =>
        ArticleSchema.parse({
          id: `nytimes-${article._id}`,
          title: article.headline.main ?? "Untitled New York Times article",
          description: article.abstract ?? null,
          url: article.web_url,
          imageUrl: toImageUrl(article.multimedia),
          source: article.source ?? "The New York Times",
          provider: provider.id,
          author: article.byline?.original ?? null,
          category: article.section_name ?? null,
          publishedAt: new Date(article.pub_date).toISOString(),
        }),
      )

      return filterArticles(articles, params)
    },
  } satisfies ArticleProvider

  return provider
}
