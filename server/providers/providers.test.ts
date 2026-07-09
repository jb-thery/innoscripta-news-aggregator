// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest"
import { ArticleSchema } from "../schema"
import { createGuardianProvider } from "./guardian"
import { createNewsApiProvider } from "./newsapi"
import { createNytimesProvider } from "./nytimes"

const jsonResponse = (payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("provider adapters", () => {
  it("should normalize NewsAPI payloads when live credentials are present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          articles: [
            {
              source: { name: "Example Wire" },
              author: "Ada Reporter",
              title: "AI policy reaches procurement teams",
              description: "A normalized NewsAPI story.",
              url: "https://example.com/newsapi-story",
              urlToImage: "https://example.com/newsapi.jpg",
              publishedAt: "2026-07-10T08:00:00.000Z",
            },
          ],
        }),
      ),
    )
    const provider = createNewsApiProvider({ baseUrl: "https://newsapi.example", apiKey: "test" })

    const articles = await provider.search({ q: "AI" })

    expect(ArticleSchema.array().parse(articles)).toEqual([
      expect.objectContaining({ provider: "newsapi", source: "Example Wire" }),
    ])
  })

  it("should normalize Guardian payloads when live credentials are present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          response: {
            results: [
              {
                id: "technology/2026/jul/10/story",
                webTitle: "Guardian teams publish AI controls",
                webUrl: "https://example.com/guardian-story",
                sectionName: "Technology",
                webPublicationDate: "2026-07-10T07:00:00.000Z",
                fields: {
                  trailText: "A normalized Guardian story.",
                  thumbnail: "https://example.com/guardian.jpg",
                  byline: "By Grace Editor",
                },
              },
            ],
          },
        }),
      ),
    )
    const provider = createGuardianProvider({ baseUrl: "https://guardian.example", apiKey: "test" })

    const articles = await provider.search({ q: "AI" })

    expect(ArticleSchema.array().parse(articles)).toEqual([
      expect.objectContaining({ provider: "guardian", category: "Technology" }),
    ])
  })

  it("should normalize New York Times payloads when live credentials are present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          response: {
            docs: [
              {
                _id: "nyt://article/example",
                web_url: "https://example.com/nyt-story",
                headline: { main: "NYT newsrooms revisit personalization" },
                abstract: "A normalized New York Times story.",
                byline: { original: "By Nora Writer" },
                section_name: "Business",
                pub_date: "2026-07-10T06:00:00.000Z",
                multimedia: [{ url: "images/nyt.jpg" }],
                source: "The New York Times",
              },
            ],
          },
        }),
      ),
    )
    const provider = createNytimesProvider({ baseUrl: "https://nyt.example", apiKey: "test" })

    const articles = await provider.search({ q: "personalization" })

    expect(ArticleSchema.array().parse(articles)).toEqual([
      expect.objectContaining({ provider: "nytimes", category: "Business" }),
    ])
  })

  it("should return deterministic fixtures when credentials are absent", async () => {
    const provider = createGuardianProvider({ baseUrl: "https://guardian.example" })

    const articles = await provider.search({ q: "" })

    expect(articles.every((article) => article.provider === "guardian")).toBe(true)
  })
})
