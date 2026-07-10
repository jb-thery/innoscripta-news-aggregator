import type { Article, SearchParams } from "@signal-desk/contracts"

const NON_ALNUM = /[^\p{L}\p{N}]+/u
const NON_ALNUM_GLOBAL = /[^\p{L}\p{N}]+/gu

const normalizeText = (value: string | null | undefined) => value?.trim().toLowerCase() ?? ""

const tokenize = (value: string): string[] => value.split(NON_ALNUM).filter(Boolean)

// A title hit is far more meaningful than a description or metadata hit, so each
// field carries its own weight. Keeping the model as explicit weights (rather than a
// black-box scorer) keeps ranking explainable, which matters for a review-grade demo.
const RANKED_FIELDS = [
  { key: "title", weight: 6 },
  { key: "description", weight: 3 },
  { key: "category", weight: 2 },
  { key: "source", weight: 1 },
  { key: "author", weight: 1 },
] as const

type RankedFieldKey = (typeof RANKED_FIELDS)[number]["key"]

// Short terms (<= 2 chars) only count as whole-word matches to avoid noise like "AI"
// hiding inside "maintenance"; longer terms match as substrings.
const SHORT_TERM_LENGTH = 2
const PHRASE_BOOST = 2
const COVERAGE_WEIGHT = 4

const fieldText = (article: Article, key: RankedFieldKey) => normalizeText(article[key])

const termMatchesField = (tokens: Set<string>, text: string, term: string) =>
  term.length <= SHORT_TERM_LENGTH ? tokens.has(term) : text.includes(term)

function scoreArticle(article: Article, terms: string[], phrase: string): number {
  if (terms.length === 0) {
    return 0
  }

  const matched = new Set<string>()
  let score = 0

  for (const field of RANKED_FIELDS) {
    const text = fieldText(article, field.key)
    if (!text) {
      continue
    }

    const tokens = new Set(tokenize(text))
    for (const term of terms) {
      if (termMatchesField(tokens, text, term)) {
        score += field.weight
        matched.add(term)
      }
    }

    if (phrase && text.includes(phrase)) {
      score += field.weight * PHRASE_BOOST
    }
  }

  // Reward breadth of coverage so an article matching every query term outranks one
  // that merely repeats a single term across several fields.
  score += (matched.size / terms.length) * COVERAGE_WEIGHT
  return score
}

/**
 * Order articles by relevance to the query, then by recency. Recency is only a
 * tie-breaker: a more relevant older article always outranks a fresher weak match.
 * With no query every score is zero, so results fall back to a pure recency sort.
 */
export function rankArticles(articles: Article[], params: SearchParams): Article[] {
  const query = normalizeText(params.q)
  const terms = tokenize(query)
  // A multi-word query is also matched as a contiguous phrase for an extra boost.
  const phrase = terms.length > 1 ? query : ""

  return articles
    .map((article) => ({
      article,
      score: scoreArticle(article, terms, phrase),
      publishedAt: Date.parse(article.publishedAt),
    }))
    .sort((a, b) => b.score - a.score || b.publishedAt - a.publishedAt)
    .map((entry) => entry.article)
}

// Canonicalize with string operations rather than `new URL()` so the module stays
// portable across the browser demo and the Node backend without pulling in extra libs.
const canonicalUrl = (url: string): string =>
  url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")

const canonicalTitle = (title: string): string =>
  title.toLowerCase().replace(NON_ALNUM_GLOBAL, " ").trim()

/**
 * Remove cross-source duplicates, keeping the first (highest-ranked) occurrence.
 * Two articles collapse when they share a canonical URL or an identical canonical
 * title. Matching is exact-after-normalization rather than fuzzy, which stays
 * predictable and never merges genuinely distinct stories.
 */
export function dedupeArticles(articles: Article[]): Article[] {
  const seenUrls = new Set<string>()
  const seenTitles = new Set<string>()
  const unique: Article[] = []

  for (const article of articles) {
    const urlKey = canonicalUrl(article.url)
    const titleKey = canonicalTitle(article.title)

    if (seenUrls.has(urlKey) || (titleKey !== "" && seenTitles.has(titleKey))) {
      continue
    }

    seenUrls.add(urlKey)
    if (titleKey !== "") {
      seenTitles.add(titleKey)
    }
    unique.push(article)
  }

  return unique
}
