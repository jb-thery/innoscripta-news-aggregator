import { keepPreviousData } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import type { SearchArticlesParams } from "@/api/generated/model"
import { useSearchArticles } from "@/api/generated/news"
import { ArticleGrid } from "@/components/article-grid"
import { SourceStatusStrip } from "@/components/source-status-strip"
import { EmptyState, ErrorState, LoadingState } from "@/components/states"
import { SearchFilters } from "@/features/search/search-filters"
import { DEFAULT_SEARCH, type SearchState, searchStateSchema } from "@/features/search/search-state"
import { safeCapture } from "@/lib/analytics"

export const Route = createFileRoute("/")({
  validateSearch: (search) => searchStateSchema.parse(search),
  component: SearchPage,
})

function toApiParams(search: SearchState): SearchArticlesParams {
  return {
    q: search.q,
    providers: search.providers,
    ...(search.from ? { from: search.from } : {}),
    ...(search.to ? { to: search.to } : {}),
    ...(search.category ? { category: search.category } : {}),
    ...(search.author ? { author: search.author } : {}),
  }
}

function SearchPage() {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const hasQuery = search.q.trim().length > 0
  const result = useSearchArticles(toApiParams(search), {
    query: {
      enabled: hasQuery,
      placeholderData: keepPreviousData,
    },
  })

  const updateSearch = useCallback(
    (change: Partial<SearchState>) => {
      const query = change.q?.trim()
      if (query) {
        void safeCapture("news_search", { query_length: query.length })
      }

      void navigate({
        replace: true,
        search: (previous) => ({ ...previous, ...change }),
      })
    },
    [navigate],
  )

  const resetSearch = useCallback(() => {
    void navigate({ replace: true, search: DEFAULT_SEARCH })
  }, [navigate])

  const articleCount = result.data?.articles.length ?? 0

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">{t("hero.eyebrow")}</p>
          <h1>{t("hero.title")}</h1>
          <p>{t("hero.subtitle")}</p>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <span className="hero-orbit__ring" />
          <span className="hero-orbit__core">03</span>
          <small>{t("hero.sourcesSummary")}</small>
        </div>
      </section>

      <div className="content-shell">
        <SearchFilters value={search} onChange={updateSearch} onReset={resetSearch} />

        {result.data ? <SourceStatusStrip sources={result.data.sources} /> : null}

        {hasQuery && result.data ? (
          <div className="results-heading" role="status">
            <p>{t("search.results", { count: articleCount })}</p>
            <span>{t("search.for", { query: search.q })}</span>
          </div>
        ) : null}

        {!hasQuery ? <EmptyState start /> : null}
        {hasQuery && result.isPending ? <LoadingState /> : null}
        {hasQuery && result.isError ? <ErrorState onRetry={() => void result.refetch()} /> : null}
        {hasQuery && result.data && articleCount === 0 ? <EmptyState /> : null}
        {hasQuery && result.data && articleCount > 0 ? (
          <ArticleGrid articles={result.data.articles} />
        ) : null}
      </div>
    </>
  )
}
