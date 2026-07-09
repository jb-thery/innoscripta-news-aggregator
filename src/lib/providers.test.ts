import { describe, expect, it } from "vitest"
import { ALL_PROVIDER_IDS, getProviderLabel } from "./providers"

describe("provider metadata", () => {
  it("should expose every provider in the default query", () => {
    expect(ALL_PROVIDER_IDS).toBe("newsapi,guardian,nytimes")
  })

  it("should resolve the display label for a provider", () => {
    expect(getProviderLabel("guardian")).toBe("The Guardian")
  })
})
