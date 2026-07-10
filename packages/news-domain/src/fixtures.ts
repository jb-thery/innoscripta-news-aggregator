import type { Article, ProviderId } from "@signal-desk/contracts"
import { MOCK_ARTICLE_IMAGES } from "./mock-assets.ts"

export const mockArticles = [
  {
    id: "newsapi-ai-audit-tools",
    title: "AI audit tools move from pilot projects to procurement checklists",
    description:
      "Technology teams are adding model evaluation and provenance checks before adopting generative systems in regulated workflows.",
    url: "https://newsapi.org/mock/ai-audit-tools",
    imageUrl: MOCK_ARTICLE_IMAGES.newsapi,
    source: "NewsAPI.org",
    provider: "newsapi",
    author: "Maya Bell",
    category: "technology",
    publishedAt: "2026-07-10T07:45:00.000Z",
  },
  {
    id: "newsapi-climate-rd-tax",
    title: "Climate R&D claims rise as software teams document experiments earlier",
    description:
      "Finance leaders say better engineering notes are helping teams connect research spend to measurable innovation outcomes.",
    url: "https://newsapi.org/mock/climate-rd-tax",
    imageUrl: MOCK_ARTICLE_IMAGES.newsapi,
    source: "NewsAPI.org",
    provider: "newsapi",
    author: "Elliot Green",
    category: "business",
    publishedAt: "2026-07-09T12:10:00.000Z",
  },
  {
    id: "guardian-eu-ai-compliance",
    title: "European startups build compliance playbooks around the AI Act",
    description:
      "Founders are turning risk classification, audit trails and model cards into practical product operations.",
    url: "https://www.theguardian.com/mock/eu-ai-compliance",
    imageUrl: MOCK_ARTICLE_IMAGES.guardian,
    source: "The Guardian",
    provider: "guardian",
    author: "Laura Klein",
    category: "world",
    publishedAt: "2026-07-10T06:20:00.000Z",
  },
  {
    id: "guardian-health-research",
    title: "Hospitals test personalized news briefs for clinical research teams",
    description:
      "The pilots combine trusted feeds, human review and strict privacy boundaries to shorten literature monitoring.",
    url: "https://www.theguardian.com/mock/health-research-briefs",
    imageUrl: MOCK_ARTICLE_IMAGES.guardian,
    source: "The Guardian",
    provider: "guardian",
    author: "Amara Singh",
    category: "health",
    publishedAt: "2026-07-08T15:35:00.000Z",
  },
  {
    id: "nytimes-personalization-newsrooms",
    title: "Newsrooms revisit personalization after a year of AI summaries",
    description:
      "Editors are balancing relevance, transparency and source diversity as readers ask for focused feeds.",
    url: "https://www.nytimes.com/mock/personalization-newsrooms",
    imageUrl: MOCK_ARTICLE_IMAGES.nytimes,
    source: "The New York Times",
    provider: "nytimes",
    author: "Jonas Reed",
    category: "media",
    publishedAt: "2026-07-10T09:00:00.000Z",
  },
  {
    id: "nytimes-fintech-rd",
    title: "Fintech teams turn research evidence into investor-ready narratives",
    description:
      "Product managers are tracking experiments, failures and iteration notes to support audit-heavy funding rounds.",
    url: "https://www.nytimes.com/mock/fintech-rd",
    imageUrl: MOCK_ARTICLE_IMAGES.nytimes,
    source: "The New York Times",
    provider: "nytimes",
    author: "Nora Weiss",
    category: "business",
    publishedAt: "2026-07-07T10:30:00.000Z",
  },
] satisfies Article[]

export function getFixtureArticles(provider: ProviderId): Article[] {
  return mockArticles.filter((article) => article.provider === provider)
}
