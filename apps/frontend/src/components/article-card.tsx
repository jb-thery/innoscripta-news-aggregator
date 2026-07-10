import { Badge, Card, cn } from "@signal-desk/ui"
import { ArrowUpRight, Clock3 } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import type { Article } from "@/api/generated/model"
import { ArticleImage } from "./article-image"

interface ArticleCardProps {
  article: Article
  lead?: boolean
  index: number
}

const MAX_STAGGERED_CARD_INDEX = 8
const CARD_STAGGER_DELAY_MS = 55

export function ArticleCard({ article, lead = false, index }: ArticleCardProps) {
  const { t, i18n } = useTranslation()
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [i18n.language, i18n.resolvedLanguage],
  )
  const publishedAt = dateFormatter.format(new Date(article.publishedAt))

  return (
    <Card
      className={cn("article-card", lead && "article-card--lead")}
      style={{
        animationDelay: `${Math.min(index, MAX_STAGGERED_CARD_INDEX) * CARD_STAGGER_DELAY_MS}ms`,
      }}
    >
      <div className="article-card__image-wrap">
        <ArticleImage
          imageUrl={article.imageUrl}
          title={t("article.imageAlt", { title: article.title })}
          provider={article.provider}
          eager={lead}
        />
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
