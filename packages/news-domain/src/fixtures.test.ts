// @vitest-environment node

import { describe, expect, it } from "vitest"
import { mockArticles } from "./fixtures.ts"

const RESERVED_URL_PREFIXES = ["https://example.com/", "https://www.example.com/"]

describe("mock article fixtures", () => {
  it("should use published article destinations when provider credentials are absent", () => {
    const invalidArticleIds = mockArticles
      .filter((article) => {
        return (
          !article.url.startsWith("https://") ||
          article.url.includes("/mock/") ||
          RESERVED_URL_PREFIXES.some((prefix) => article.url.startsWith(prefix))
        )
      })
      .map((article) => article.id)

    expect(invalidArticleIds).toEqual([])
  })
})
