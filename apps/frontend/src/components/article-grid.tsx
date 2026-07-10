import type { Article } from "@/api/generated/model"
import { ArticleCard } from "./article-card"

export function ArticleGrid({ articles }: { articles: Article[] }) {
  return (
    <div className="article-grid">
      {articles.map((article, index) => (
        <ArticleCard article={article} index={index} key={article.id} lead={index === 0} />
      ))}
    </div>
  )
}
