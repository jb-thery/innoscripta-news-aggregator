import { MOCK_ASSET_ORIGIN } from "@signal-desk/news-domain"
import { useState } from "react"

interface ArticleImageProps {
  imageUrl: string | null
  title: string
  provider: string
  eager: boolean
}

const resolveArticleImageUrl = (imageUrl: string) =>
  imageUrl.startsWith(MOCK_ASSET_ORIGIN)
    ? `${import.meta.env.BASE_URL}${imageUrl.slice(MOCK_ASSET_ORIGIN.length + 1)}`
    : imageUrl

const ArticleImagePlaceholder = ({ provider }: Pick<ArticleImageProps, "provider">) => (
  <div className="article-card__image-placeholder" aria-hidden="true">
    <span>{provider.slice(0, 2).toUpperCase()}</span>
  </div>
)

export function ArticleImage({ imageUrl, title, provider, eager }: ArticleImageProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const resolvedUrl = imageUrl ? resolveArticleImageUrl(imageUrl) : null

  if (!resolvedUrl || failedUrl === resolvedUrl) {
    return <ArticleImagePlaceholder provider={provider} />
  }

  return (
    <img
      className="article-card__image"
      src={resolvedUrl}
      alt={title}
      width={1200}
      height={800}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailedUrl(resolvedUrl)}
    />
  )
}
