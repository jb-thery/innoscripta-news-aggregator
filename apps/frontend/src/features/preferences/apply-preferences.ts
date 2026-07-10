import type { Article } from "@/api/generated/model"
import type { Preferences } from "./preferences"

const normalize = (value: string | null) => value?.trim().toLocaleLowerCase() ?? ""

export function applyPreferences(articles: Article[], preferences: Preferences) {
  const preferredSources = new Set(preferences.sources)
  const preferredCategories = new Set(preferences.categories.map(normalize))
  const preferredAuthors = preferences.authors.map(normalize)

  return articles.filter((article) => {
    const sourceMatch = preferredSources.has(article.provider)
    const categoryMatch = preferredCategories.has(normalize(article.category))
    const normalizedAuthor = normalize(article.author)
    const authorMatch = preferredAuthors.some((author) => normalizedAuthor.includes(author))

    return sourceMatch || categoryMatch || authorMatch
  })
}
