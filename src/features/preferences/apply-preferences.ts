import type { Article } from "@/api/generated/model"
import type { Preferences } from "./preferences-context"

const normalize = (value: string | null) => value?.trim().toLocaleLowerCase() ?? ""

export function applyPreferences(articles: Article[], preferences: Preferences) {
  return articles.filter((article) => {
    const sourceMatch = preferences.sources.includes(article.provider)
    const categoryMatch = preferences.categories.some(
      (category) => normalize(article.category) === normalize(category),
    )
    const authorMatch = preferences.authors.some((author) =>
      normalize(article.author).includes(normalize(author)),
    )

    return sourceMatch || categoryMatch || authorMatch
  })
}
