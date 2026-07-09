import type { Article, SearchParams } from "../schema"

const normalize = (value: string | null | undefined) => value?.trim().toLowerCase() ?? ""

const parseCsv = (value: string | undefined) =>
  new Set(
    value
      ?.split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean) ?? [],
  )

const matchesQuery = (haystack: string, query: string) => {
  const words = new Set(haystack.split(/[^\p{L}\p{N}]+/u).filter(Boolean))

  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => (term.length <= 2 ? words.has(term) : haystack.includes(term)))
}

export function articleMatchesParams(article: Article, params: SearchParams): boolean {
  const query = normalize(params.q)
  const category = normalize(params.category)
  const author = normalize(params.author)
  const providers = parseCsv(params.providers)
  const publishedDate = article.publishedAt.slice(0, 10)

  if (providers.size > 0 && !providers.has(article.provider)) {
    return false
  }

  if (params.from && publishedDate < params.from) {
    return false
  }

  if (params.to && publishedDate > params.to) {
    return false
  }

  if (category && normalize(article.category) !== category) {
    return false
  }

  if (author && !normalize(article.author).includes(author)) {
    return false
  }

  if (!query) {
    return true
  }

  const haystack = [
    article.title,
    article.description,
    article.source,
    article.author,
    article.category,
  ]
    .map(normalize)
    .join(" ")

  return matchesQuery(haystack, query)
}

export function filterArticles(articles: Article[], params: SearchParams): Article[] {
  return articles
    .filter((article) => articleMatchesParams(article, params))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}
