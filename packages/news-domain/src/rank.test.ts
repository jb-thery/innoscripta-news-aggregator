// @vitest-environment node

import type { Article } from "@signal-desk/contracts"
import { describe, expect, it } from "vitest"
import { dedupeArticles, rankArticles } from "./rank.ts"

const make = (overrides: Partial<Article> & Pick<Article, "id">): Article => ({
  title: "",
  description: null,
  url: `https://example.com/${overrides.id}`,
  imageUrl: null,
  source: "Example Wire",
  provider: "newsapi",
  author: null,
  category: null,
  publishedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
})

describe("rankArticles", () => {
  it("should rank a title match above a description-only match", () => {
    const description = make({
      id: "description",
      title: "Market update",
      description: "notes on quantum computing progress",
    })
    const title = make({ id: "title", title: "Quantum computing breakthrough" })

    const ranked = rankArticles([description, title], { q: "quantum computing" })

    expect(ranked[0]?.id).toBe("title")
  })

  it("should rank an exact phrase match above scattered term matches", () => {
    const scattered = make({
      id: "scattered",
      title: "Allowance news",
      description: "German research grows",
    })
    const phrase = make({ id: "phrase", title: "Research allowance reform in Germany" })

    const ranked = rankArticles([scattered, phrase], { q: "research allowance" })

    expect(ranked[0]?.id).toBe("phrase")
  })

  it("should rank broader query coverage above repeated single-term matches", () => {
    const single = make({
      id: "single",
      title: "Solar panels expand",
      description: "solar everywhere and more solar",
    })
    const broad = make({ id: "broad", title: "Solar and battery storage" })

    const ranked = rankArticles([single, broad], { q: "solar battery" })

    expect(ranked[0]?.id).toBe("broad")
  })

  it("should only match short queries as whole words", () => {
    const wholeWord = make({ id: "whole", title: "EU policy reaches procurement" })
    const substring = make({ id: "substring", title: "Europe debates the measure" })

    const ranked = rankArticles([substring, wholeWord], { q: "EU" })

    expect(ranked[0]?.id).toBe("whole")
  })

  it("should fall back to recency when the query is empty", () => {
    const older = make({ id: "older", publishedAt: "2026-01-01T00:00:00.000Z" })
    const newer = make({ id: "newer", publishedAt: "2026-06-01T00:00:00.000Z" })

    const ranked = rankArticles([older, newer], { q: "" })

    expect(ranked.map((article) => article.id)).toEqual(["newer", "older"])
  })

  it("should break relevance ties by recency", () => {
    const older = make({
      id: "older",
      title: "Climate report published",
      publishedAt: "2026-01-01T00:00:00.000Z",
    })
    const newer = make({
      id: "newer",
      title: "Climate report published",
      publishedAt: "2026-06-01T00:00:00.000Z",
    })

    const ranked = rankArticles([older, newer], { q: "climate" })

    expect(ranked[0]?.id).toBe("newer")
  })
})

describe("dedupeArticles", () => {
  it("should drop a later article sharing a canonical URL", () => {
    const first = make({ id: "first", url: "https://www.example.com/story/" })
    const duplicate = make({ id: "duplicate", url: "https://example.com/story" })

    expect(dedupeArticles([first, duplicate]).map((article) => article.id)).toEqual(["first"])
  })

  it("should drop a cross-source duplicate sharing a canonical title", () => {
    const guardian = make({
      id: "guardian",
      title: "EU AI Act, explained",
      url: "https://theguardian.com/a",
      provider: "guardian",
    })
    const nytimes = make({
      id: "nytimes",
      title: "EU AI Act — explained!",
      url: "https://nytimes.com/b",
      provider: "nytimes",
    })

    expect(dedupeArticles([guardian, nytimes]).map((article) => article.id)).toEqual(["guardian"])
  })

  it("should keep genuinely distinct articles", () => {
    const first = make({ id: "first", title: "First story", url: "https://news.test/1" })
    const second = make({ id: "second", title: "Second story", url: "https://news.test/2" })

    expect(dedupeArticles([first, second])).toHaveLength(2)
  })

  it("should not throw on a malformed URL", () => {
    const malformed = make({ id: "malformed", url: "not a valid url", title: "Standalone" })

    expect(dedupeArticles([malformed]).map((article) => article.id)).toEqual(["malformed"])
  })
})
