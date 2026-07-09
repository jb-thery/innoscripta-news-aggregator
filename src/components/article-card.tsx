import { ArrowUpRight, Clock3 } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { Article } from "@/api/generated/model"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { Card } from "./ui/card"

interface ArticleCardProps {
  article: Article
  lead?: boolean
  index: number
}

export function ArticleCard({ article, lead = false, index }: ArticleCardProps) {
  const { t, i18n } = useTranslation()
  const publishedAt = new Intl.DateTimeFormat(i18n.language, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(article.publishedAt))

  return (
    <Card
      className={cn("article-card", lead && "article-card--lead")}
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div className="article-card__image-wrap">
        {article.imageUrl ? (
          <img
            className="article-card__image"
            src={article.imageUrl}
            alt={t("article.imageAlt", { title: article.title })}
            loading={lead ? "eager" : "lazy"}
          />
        ) : (
          <div className="article-card__image-placeholder" aria-hidden="true">
            <span>{article.provider.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        <Badge className="article-card__source" tone="accent">
          {article.source}
        </Badge>
      </div>

      <div className="article-card__body">
        <div className="article-card__meta">
          {article.category ? <span>{article.category}</span> : null}
          <span>
            <Clock3 size={13} aria-hidden="true" />
            {publishedAt}
          </span>
        </div>
        <h2>{article.title}</h2>
        {article.description ? <p>{article.description}</p> : null}
        <div className="article-card__footer">
          <span>{article.author || t("article.unknownAuthor")}</span>
          <a href={article.url} target="_blank" rel="noreferrer">
            {t("article.readOriginal")}
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
    </Card>
  )
}
