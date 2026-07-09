import { describe, expect, it } from "vitest"
import type { Article } from "@/api/generated/model"
import { applyPreferences } from "./apply-preferences"

const articles: Article[] = [
  {
    id: "one",
    title: "AI policy",
    description: null,
    url: "https://example.com/one",
    imageUrl: null,
    source: "The Guardian",
    provider: "guardian",
    author: "Maya Bell",
    category: "technology",
    publishedAt: "2026-07-10T08:00:00.000Z",
  },
  {
    id: "two",
    title: "Market update",
    description: null,
    url: "https://example.com/two",
    imageUrl: null,
    source: "The New York Times",
    provider: "nytimes",
    author: "Jonas Reed",
    category: "business",
    publishedAt: "2026-07-09T08:00:00.000Z",
  },
]

describe("personalized feed", () => {
  it("should include articles matching any saved preference", () => {
    const result = applyPreferences(articles, {
      sources: ["nytimes"],
      categories: ["technology"],
      authors: [],
    })

    expect(result.map((article) => article.id)).toEqual(["one", "two"])
  })

  it("should match author preferences without case sensitivity", () => {
    const result = applyPreferences(articles, {
      sources: [],
      categories: [],
      authors: ["maya"],
    })

    expect(result.map((article) => article.id)).toEqual(["one"])
  })
})
