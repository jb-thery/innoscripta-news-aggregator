// @vitest-environment node

import { describe, expect, it } from "vitest"
import type { Article } from "../schema"
import { articleMatchesParams } from "./filter"

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
})
