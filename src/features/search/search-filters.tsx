import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import type { ProviderId } from "@/api/generated/model"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PROVIDERS } from "@/lib/providers"
import { AdvancedSearchFilters } from "./advanced-search-filters"
import type { SearchState } from "./search-state"

interface SearchFiltersProps {
  value: SearchState
  onChange: (change: Partial<SearchState>) => void
  onReset: () => void
}

const SEARCH_DEBOUNCE_MS = 350

export function SearchFilters({ value, onChange, onReset }: SearchFiltersProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState(value.q)
  const [isOpen, setIsOpen] = useState(false)
  const selectedProviders = new Set(value.providers.split(",").filter(Boolean))

  useEffect(() => {
    setQuery(value.q)
  }, [value.q])

  useEffect(() => {
    if (query === value.q) {
      return
    }

    const timeout = window.setTimeout(() => onChange({ q: query }), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeout)
  }, [onChange, query, value.q])

  const toggleProvider = (providerId: ProviderId) => {
    const nextProviders = new Set(selectedProviders)
    if (nextProviders.has(providerId)) {
      nextProviders.delete(providerId)
    } else {
      nextProviders.add(providerId)
    }

    onChange({
      providers: PROVIDERS.filter((provider) => nextProviders.has(provider.id))
        .map((provider) => provider.id)
        .join(","),
    })
  }

  return (
    <section className="search-panel" aria-label={t("filters.title")}>
      <div className="search-field">
        <Search size={22} aria-hidden="true" />
        <label htmlFor="article-search" className="sr-only">
          {t("search.label")}
        </label>
        <Input
          id="article-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search.placeholder")}
          autoComplete="off"
        />
        <span className="search-field__hint">{t("search.hint")}</span>
      </div>

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

      <div
        className={isOpen ? "filter-grid filter-grid--open" : "filter-grid"}
        hidden={!isOpen}
        id="search-filters"
      >
        <AdvancedSearchFilters
          value={value}
          selectedProviders={selectedProviders}
          onChange={onChange}
          onToggleProvider={toggleProvider}
          translate={t}
        />
      </div>
    </section>
  )
}
