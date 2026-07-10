import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useSearchArticles } from "@/api/generated/news"
import { ArticleGrid } from "@/components/article-grid"
import { SourceStatusStrip } from "@/components/source-status-strip"
import { ErrorState, LoadingState } from "@/components/states"
import { applyPreferences } from "@/features/preferences/apply-preferences"
import { hasPreferences } from "@/features/preferences/preferences"
import { usePreferences } from "@/features/preferences/preferences-context"
import { PreferencesControls } from "@/features/preferences/preferences-controls"

export const Route = createFileRoute("/feed")({
  component: PersonalizedFeedPage,
})

function PersonalizedFeedPage() {
  const { t, i18n } = useTranslation()
  const { preferences } = usePreferences()
  const isConfigured = hasPreferences(preferences)
  const result = useSearchArticles(
    { q: "" },
    {
      query: {
        enabled: isConfigured,
      },
    },
  )
  const articles = result.data ? applyPreferences(result.data.articles, preferences) : []
  const articleCount = useMemo(
    () =>
      new Intl.NumberFormat(i18n.resolvedLanguage ?? i18n.language, {
        minimumIntegerDigits: 2,
        useGrouping: false,
      }).format(articles.length),
    [articles.length, i18n.language, i18n.resolvedLanguage],
  )

  return (
    <div className="feed-page">
      <header className="feed-header">
        <div>
          <p className="eyebrow">{t("preferences.eyebrow")}</p>
          <h1>{t("preferences.title")}</h1>
          <p>{t("preferences.subtitle")}</p>
        </div>
        <div className="feed-header__index" aria-hidden="true">
          <strong>{articleCount}</strong>
          <span>{t("preferences.signalCount")}</span>
        </div>
      </header>

      <div className="feed-layout">
        <PreferencesControls />

        <section className="feed-results" aria-live="polite">
          {!isConfigured ? (
            <div className="state-panel">
              <h2>{t("preferences.emptyTitle")}</h2>
              <p>{t("preferences.emptyBody")}</p>
            </div>
          ) : null}
          {isConfigured && result.isPending ? <LoadingState /> : null}
          {isConfigured && result.isError ? (
            <ErrorState onRetry={() => void result.refetch()} />
          ) : null}
          {isConfigured && result.data ? (
            <>
              <SourceStatusStrip sources={result.data.sources} />
              <div className="results-heading">
                <p>{t("preferences.matching", { count: articles.length })}</p>
              </div>
              {articles.length > 0 ? (
                <ArticleGrid articles={articles} />
              ) : (
                <div className="state-panel">
                  <h2>{t("states.emptyTitle")}</h2>
                  <p>{t("states.emptyBody")}</p>
                </div>
              )}
            </>
          ) : null}
        </section>
      </div>
    </div>
  )
}
