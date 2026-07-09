import { describe, expect, it } from "vitest"
import { ALL_PROVIDER_IDS } from "@/lib/providers"
import { searchStateSchema } from "./search-state"

describe("search URL state", () => {
  it("should apply shareable defaults when the URL has no filters", () => {
    expect(searchStateSchema.parse({})).toEqual({
      q: "innovation",
      providers: ALL_PROVIDER_IDS,
    })
  })

  it("should discard blank optional filters when parsing the URL", () => {
    expect(searchStateSchema.parse({ from: "", author: "  " })).toEqual({
      q: "innovation",
      providers: ALL_PROVIDER_IDS,
    })
  })
})
