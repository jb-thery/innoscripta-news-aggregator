// @vitest-environment node

import { describe, expect, it } from "vitest"
import { createApp } from "./app"
import { getFixtureArticles } from "./providers/fixtures"
import type { ArticleProvider } from "./providers/types"
import { SearchResponseSchema } from "./schema"

const successfulProvider = (id: ArticleProvider["id"]): ArticleProvider => ({
  id,
  label: id,
  hasLiveCredentials: () => false,
  search: async () => getFixtureArticles(id),
})

const failingProvider = (id: ArticleProvider["id"]): ArticleProvider => ({
  id,
  label: id,
  hasLiveCredentials: () => false,
  search: async () => {
    throw new Error(`${id} is unavailable`)
  },
})

describe("news BFF", () => {
  it("should preserve successful results when one provider fails", async () => {
    const app = createApp([
      successfulProvider("newsapi"),
      failingProvider("guardian"),
      successfulProvider("nytimes"),
    ])

    const response = await app.request("/api/search?q=")
    const payload = SearchResponseSchema.parse(await response.json())

    expect(payload).toMatchObject({
      articles: expect.arrayContaining([
        expect.objectContaining({ provider: "newsapi" }),
        expect.objectContaining({ provider: "nytimes" }),
      ]),
      sources: expect.arrayContaining([
        { provider: "guardian", ok: false, error: "guardian is unavailable" },
      ]),
    })
  })

  it("should report mock mode when no provider has credentials", async () => {
    const app = createApp([
      successfulProvider("newsapi"),
      successfulProvider("guardian"),
      successfulProvider("nytimes"),
    ])

    const response = await app.request("/api/health")

    expect(await response.json()).toMatchObject({ status: "ok", mode: "mock" })
  })
})
