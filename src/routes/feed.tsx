import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useSearchArticles } from "@/api/generated/news"
import { ArticleGrid } from "@/components/article-grid"
import { SourceStatusStrip } from "@/components/source-status-strip"
import { ErrorState, LoadingState } from "@/components/states"
import { applyPreferences } from "@/features/preferences/apply-preferences"
import { hasPreferences, usePreferences } from "@/features/preferences/preferences-context"
import { PreferencesControls } from "@/features/preferences/preferences-controls"

export const Route = createFileRoute("/feed")({
  component: PersonalizedFeedPage,
})

function PersonalizedFeedPage() {
  const { t } = useTranslation()
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

  return (
    <div className="feed-page">
      <header className="feed-header">
        <div>
          <p className="eyebrow">{t("preferences.eyebrow")}</p>
          <h1>{t("preferences.title")}</h1>
          <p>{t("preferences.subtitle")}</p>
        </div>
        <div className="feed-header__index" aria-hidden="true">
          <strong>{String(articles.length).padStart(2, "0")}</strong>
          <span>curated signals</span>
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
