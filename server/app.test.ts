// @vitest-environment node

import { describe, expect, it } from "vitest"
import { createApp } from "./app"
import { getFixtureArticles } from "./providers/fixtures"
import type { ArticleProvider } from "./providers/types"
import { SearchResponseSchema } from "./schema"

const successfulProvider = (id: ArticleProvider["id"], live = false): ArticleProvider => ({
  id,
  label: id,
  hasLiveCredentials: () => live,
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

  it("should report mixed mode when some providers have credentials", async () => {
    const app = createApp([
      successfulProvider("newsapi", true),
      successfulProvider("guardian"),
      successfulProvider("nytimes"),
    ])

    const response = await app.request("/api/health")

    expect(await response.json()).toMatchObject({ status: "ok", mode: "mixed" })
  })

  it("should report live mode when every provider has credentials", async () => {
    const app = createApp([
      successfulProvider("newsapi", true),
      successfulProvider("guardian", true),
      successfulProvider("nytimes", true),
    ])

    const response = await app.request("/api/health")

    expect(await response.json()).toMatchObject({ status: "ok", mode: "live" })
  })

  it("should mark providers not selected by the request", async () => {
    const app = createApp([
      successfulProvider("newsapi"),
      successfulProvider("guardian"),
      successfulProvider("nytimes"),
    ])

    const response = await app.request("/api/search?q=AI&providers=guardian")
    const payload = SearchResponseSchema.parse(await response.json())

    expect(payload.sources).toEqual([
      { provider: "guardian", ok: true, error: null },
      { provider: "newsapi", ok: true, error: "Not selected" },
      { provider: "nytimes", ok: true, error: "Not selected" },
    ])
  })

  it("should reject malformed search dates", async () => {
    const response = await createApp([]).request("/api/search?from=not-a-date")

    expect(response.status).toBe(400)
  })

  it("should enforce a strict application content security policy", async () => {
    const response = await createApp([]).request("/api/health")
    const policy = response.headers.get("content-security-policy")

    expect(policy).toContain("script-src 'self'")
    expect(policy).toContain("connect-src 'self'")
    expect(policy).toContain("object-src 'none'")
    expect(policy).not.toContain("script-src 'self' 'unsafe-inline'")
  })

  it("should allow only the Swagger CDN on the documentation route", async () => {
    const response = await createApp([]).request("/docs")
    const policy = response.headers.get("content-security-policy")

    expect(policy).toContain("script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net")
    expect(policy).toContain("style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net")
  })
})
