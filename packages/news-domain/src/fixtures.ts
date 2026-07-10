import type { Article, ProviderId } from "@signal-desk/contracts"
import { MOCK_ARTICLE_IMAGES } from "./mock-assets.ts"

export const mockArticles = [
  {
    id: "newsapi-techcrunch-ai-guardrails",
    title: "Building AI guardrails should be part of the process",
    description:
      "Companies adopting AI tools need governance that addresses ethical, practical and legal risks without slowing responsible innovation.",
    url: "https://techcrunch.com/2024/01/30/building-ai-guardrails-should-be-part-of-the-process/",
    imageUrl: MOCK_ARTICLE_IMAGES.newsapi,
    source: "TechCrunch",
    provider: "newsapi",
    author: "Karyne Levy",
    category: "technology",
    publishedAt: "2024-01-30T19:05:51.000Z",
  },
  {
    id: "newsapi-ap-ocean-carbon-startup",
    title:
      "An Israeli startup says its new technology will save the planet. Scientists have doubts",
    description:
      "Scientists question whether the startup has released enough evidence to support its ocean carbon-removal claims.",
    url: "https://apnews.com/article/climate-global-warming-greenhouse-gases-oceans-carbon-06be29dd4dd2e8d3c0f92ac20e9ea193",
    imageUrl: MOCK_ARTICLE_IMAGES.newsapi,
    source: "Associated Press",
    provider: "newsapi",
    author: "Helen Wieffering",
    category: "science",
    publishedAt: "2025-07-03T04:01:34.000Z",
  },
  {
    id: "guardian-eu-ai-act",
    title: "What will the EU’s proposed act to regulate AI mean for consumers?",
    description:
      "An explainer on the EU AI Act, its safeguards, rollout and likely impact on consumers and technology companies.",
    url: "https://www.theguardian.com/technology/2024/mar/14/what-will-eu-proposed-regulation-ai-mean-consumers",
    imageUrl: MOCK_ARTICLE_IMAGES.guardian,
    source: "The Guardian",
    provider: "guardian",
    author: "Dan Milmo and Alex Hern",
    category: "technology",
    publishedAt: "2024-03-14T14:33:04.000Z",
  },
  {
    id: "guardian-cancer-jab-trial",
    title: "Cancer jab can eradicate entire tumours in patients, trial shows",
    description:
      "An international trial found strong responses in patients whose tumours had resisted chemotherapy and immunotherapy.",
    url: "https://www.theguardian.com/science/2026/may/30/cancer-jab-can-eradicate-entire-tumours-in-patients-trial-shows",
    imageUrl: MOCK_ARTICLE_IMAGES.guardian,
    source: "The Guardian",
    provider: "guardian",
    author: "Andrew Gregory",
    category: "health",
    publishedAt: "2026-05-30T17:00:24.000Z",
  },
  {
    id: "nytimes-meta-ai-model",
    title: "Meta Launches New A.I. Model as Global Technology Race Heats Up",
    description:
      "Meta is introducing a paid version of its latest AI service as competition and infrastructure spending intensify.",
    url: "https://www.nytimes.com/2026/07/09/technology/meta-muse-spark-artificial-intelligence.html",
    imageUrl: MOCK_ARTICLE_IMAGES.nytimes,
    source: "The New York Times",
    provider: "nytimes",
    author: "Eli Tan",
    category: "technology",
    publishedAt: "2026-07-09T18:11:41.000Z",
  },
  {
    id: "nytimes-san-francisco-stock-home-sales",
    title: "In San Francisco, Some Home Sellers Now Ask for OpenAI or Anthropic Stock",
    description:
      "Some Bay Area sellers are asking buyers for private-company stock as startup wealth reshapes the local housing market.",
    url: "https://www.nytimes.com/2026/07/08/technology/san-francisco-home-sales-openai-anthropic-ipo.html",
    imageUrl: MOCK_ARTICLE_IMAGES.nytimes,
    source: "The New York Times",
    provider: "nytimes",
    author: "Emmy Martin",
    category: "business",
    publishedAt: "2026-07-08T18:36:58.000Z",
  },
] satisfies Article[]

export function getFixtureArticles(provider: ProviderId): Article[] {
  return mockArticles.filter((article) => article.provider === provider)
}
