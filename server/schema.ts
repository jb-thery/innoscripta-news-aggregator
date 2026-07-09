import { z } from "@hono/zod-openapi"

export const ProviderIdSchema = z.enum(["newsapi", "guardian", "nytimes"]).openapi("ProviderId")

export type ProviderId = z.infer<typeof ProviderIdSchema>

export const ArticleSchema = z
  .object({
    id: z.string().openapi({ example: "guardian-technology-2026-07-10-ai-research" }),
    title: z.string().min(1).openapi({ example: "Research teams use AI to shorten grant reviews" }),
    description: z.string().nullable().openapi({
      example: "A concise summary of the original publisher article.",
    }),
    url: z.string().url().openapi({ example: "https://example.com/news/story" }),
    imageUrl: z.string().url().nullable().openapi({ example: "https://example.com/image.jpg" }),
    source: z.string().min(1).openapi({ example: "The Guardian" }),
    provider: ProviderIdSchema,
    author: z.string().nullable().openapi({ example: "Jane Reporter" }),
    category: z.string().nullable().openapi({ example: "technology" }),
    publishedAt: z.string().datetime().openapi({ example: "2026-07-10T08:00:00.000Z" }),
  })
  .openapi("Article")

export type Article = z.infer<typeof ArticleSchema>

export const SearchParamsSchema = z
  .object({
    q: z
      .string()
      .trim()
      .default("")
      .openapi({
        param: { name: "q", in: "query" },
        example: "innovation",
      }),
    from: z
      .string()
      .date()
      .optional()
      .openapi({
        param: { name: "from", in: "query" },
        example: "2026-07-01",
      }),
    to: z
      .string()
      .date()
      .optional()
      .openapi({
        param: { name: "to", in: "query" },
        example: "2026-07-10",
      }),
    category: z
      .string()
      .trim()
      .optional()
      .openapi({
        param: { name: "category", in: "query" },
        example: "technology",
      }),
    providers: z
      .string()
      .trim()
      .optional()
      .openapi({
        param: { name: "providers", in: "query" },
        example: "newsapi,guardian,nytimes",
      }),
    author: z
      .string()
      .trim()
      .optional()
      .openapi({
        param: { name: "author", in: "query" },
        example: "Kara Swisher",
      }),
  })
  .openapi("SearchParams")

export type SearchParams = z.infer<typeof SearchParamsSchema>

const SourceStatusSchema = z
  .object({
    provider: ProviderIdSchema,
    ok: z.boolean().openapi({ example: true }),
    error: z.string().nullable().openapi({ example: null }),
  })
  .openapi("SourceStatus")

export type SourceStatus = z.infer<typeof SourceStatusSchema>

export const SearchResponseSchema = z
  .object({
    articles: z.array(ArticleSchema),
    sources: z.array(SourceStatusSchema),
  })
  .openapi("SearchResponse")

export type SearchResponse = z.infer<typeof SearchResponseSchema>

export const HealthResponseSchema = z
  .object({
    status: z.literal("ok"),
    mode: z.enum(["mock", "live", "mixed"]),
    timestamp: z.string().datetime(),
  })
  .openapi("HealthResponse")
