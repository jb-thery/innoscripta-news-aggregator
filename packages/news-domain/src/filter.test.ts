// @vitest-environment node

import type { Article } from "@signal-desk/contracts"
import { describe, expect, it } from "vitest"
import { articleMatchesParams } from "./filter.ts"

const article: Article = {
  id: "claims-story",
  title: "Climate R&D claims rise",
  description: "Finance leaders publish new narratives.",
  url: "https://example.com/claims",
  imageUrl: null,
  source: "Example Wire",
  provider: "newsapi",
  author: "Ada Reporter",
  category: "business",
  publishedAt: "2026-07-10T08:00:00.000Z",
}

describe("article filtering", () => {
  it("should not match short queries embedded inside longer words", () => {
    expect(articleMatchesParams(article, { q: "AI" })).toBe(false)
  })

  it("should match short queries when they are complete words", () => {
    expect(
      articleMatchesParams({ ...article, title: "AI policy reaches procurement" }, { q: "AI" }),
    ).toBe(true)
  })

  it("should reject articles when their provider is excluded", () => {
    expect(articleMatchesParams(article, { q: "", providers: "guardian,nytimes" })).toBe(false)
  })

  it("should reject articles published before the date range", () => {
    expect(articleMatchesParams(article, { q: "", from: "2026-07-11" })).toBe(false)
  })

  it("should reject articles published after the date range", () => {
    expect(articleMatchesParams(article, { q: "", to: "2026-07-09" })).toBe(false)
  })

  it("should reject articles outside the selected category", () => {
    expect(articleMatchesParams(article, { q: "", category: "technology" })).toBe(false)
  })

  it("should reject articles outside the selected author", () => {
    expect(articleMatchesParams(article, { q: "", author: "Grace" })).toBe(false)
  })

  it("should accept matching articles when the query is empty", () => {
    expect(articleMatchesParams(article, { q: "" })).toBe(true)
  })
})
