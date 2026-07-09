import { describe, expect, it } from "vitest"
import { hasPreferences, parsePreferences, togglePreference } from "./preferences"

describe("preferences", () => {
  it("should return empty preferences when storage is missing", () => {
    expect(parsePreferences(null)).toEqual({ sources: [], categories: [], authors: [] })
  })

  it("should return empty preferences when storage is invalid", () => {
    expect(parsePreferences("not-json")).toEqual({ sources: [], categories: [], authors: [] })
  })

  it("should preserve valid preferences when storage is valid", () => {
    const stored = JSON.stringify({
      sources: ["guardian"],
      categories: ["technology"],
      authors: ["Maya Bell"],
    })

    expect(parsePreferences(stored)).toEqual({
      sources: ["guardian"],
      categories: ["technology"],
      authors: ["Maya Bell"],
    })
  })

  it("should remove an existing preference when toggled", () => {
    expect(togglePreference(["guardian", "nytimes"], "guardian")).toEqual(["nytimes"])
  })

  it("should add a missing preference when toggled", () => {
    expect(togglePreference(["guardian"], "nytimes")).toEqual(["guardian", "nytimes"])
  })

  it("should detect configured preferences when one group has a value", () => {
    expect(hasPreferences({ sources: [], categories: [], authors: ["Maya Bell"] })).toBe(true)
  })

  it("should detect empty preferences when every group is empty", () => {
    expect(hasPreferences({ sources: [], categories: [], authors: [] })).toBe(false)
  })
})
