import { SearchResponseSchema } from "@server/schema"
import { describe, expect, it } from "vitest"
import { createStaticApiResponse } from "./static-api"

describe("static demo API", () => {
  it("should return normalized search results without a server", async () => {
    const response = createStaticApiResponse("/api/search?q=AI&providers=newsapi,guardian,nytimes")

    const payload = SearchResponseSchema.parse(await response.json())

    expect(payload.articles).toHaveLength(3)
  })

  it("should preserve provider selection in source statuses", async () => {
    const response = createStaticApiResponse("/api/search?q=AI&providers=guardian")

    const payload = SearchResponseSchema.parse(await response.json())

    expect(payload.sources).toEqual([
      { provider: "newsapi", ok: true, error: "Not selected" },
      { provider: "guardian", ok: true, error: null },
      { provider: "nytimes", ok: true, error: "Not selected" },
    ])
  })
})
