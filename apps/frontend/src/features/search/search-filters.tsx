import { Button, Input } from "@signal-desk/ui"
import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import type { ProviderId } from "@/api/generated/model"
import { PROVIDERS } from "@/lib/providers"
import { AdvancedSearchFilters } from "./advanced-search-filters"
import type { SearchState } from "./search-state"

interface SearchFiltersProps {
  value: SearchState
  onChange: (change: Partial<SearchState>) => void
  onReset: () => void
}

const SEARCH_DEBOUNCE_MS = 350

interface SearchInputProps {
  initialQuery: string
  onChange: SearchFiltersProps["onChange"]
}

function SearchInput({ initialQuery, onChange }: SearchInputProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState(initialQuery)
  const [synchronizedQuery, setSynchronizedQuery] = useState(initialQuery)

  if (initialQuery !== synchronizedQuery) {
    setSynchronizedQuery(initialQuery)
    setQuery(initialQuery)
  }

  useEffect(() => {
    if (query === initialQuery) {
      return
    }

    const timeout = window.setTimeout(() => onChange({ q: query }), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeout)
  }, [initialQuery, onChange, query])

  return (
    <div className="search-field">
      <Search size={22} aria-hidden="true" />
      <label htmlFor="article-search" className="sr-only">
        {t("search.label")}
      </label>
      <Input
        id="article-search"
        name="query"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("search.placeholder")}
        autoComplete="off"
      />
      <span className="search-field__hint">{t("search.hint")}</span>
    </div>
  )
}

export function SearchFilters({ value, onChange, onReset }: SearchFiltersProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const selectedProviders = new Set(value.providers.split(",").filter(Boolean))

  const toggleProvider = (providerId: ProviderId) => {
    const nextProviders = new Set(selectedProviders)
    if (nextProviders.has(providerId)) {
      nextProviders.delete(providerId)
    } else {
      nextProviders.add(providerId)
    }

    const providerIds: ProviderId[] = []
    for (const provider of PROVIDERS) {
      if (nextProviders.has(provider.id)) {
        providerIds.push(provider.id)
      }
    }

    onChange({ providers: providerIds.join(",") })
  }

  return (
    <section className="search-panel" aria-label={t("filters.title")}>
      <SearchInput initialQuery={value.q} onChange={onChange} />

      <div className="filter-toggle-row">
        <Button
          aria-expanded={isOpen}
          aria-controls="search-filters"
          className="filter-toggle"
          onClick={() => setIsOpen((open) => !open)}
          variant="ghost"
        >
          <SlidersHorizontal size={17} aria-hidden="true" />
          {t(isOpen ? "filters.hide" : "filters.show")}
          <ChevronDown
            className={
              isOpen
                ? "filter-toggle__chevron filter-toggle__chevron--open"
                : "filter-toggle__chevron"
            }
            size={16}
            aria-hidden="true"
          />
        </Button>
        <Button onClick={onReset} size="small" variant="ghost">
          <RotateCcw size={15} aria-hidden="true" />
          {t("filters.clear")}
        </Button>
      </div>

      {isOpen ? (
        <div className="filter-grid" id="search-filters">
          <AdvancedSearchFilters
            value={value}
            selectedProviders={selectedProviders}
            onChange={onChange}
            onToggleProvider={toggleProvider}
            translate={t}
          />
        </div>
      ) : null}
    </section>
  )
}
