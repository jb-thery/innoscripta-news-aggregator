import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CATEGORIES } from "@/lib/categories"
import { PROVIDERS } from "@/lib/providers"
import type { SearchState } from "./search-state"

interface SearchFiltersProps {
  value: SearchState
  onChange: (change: Partial<SearchState>) => void
  onReset: () => void
}

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

    const timeout = window.setTimeout(() => onChange({ q: query }), 350)
    return () => window.clearTimeout(timeout)
  }, [onChange, query, value.q])

  const toggleProvider = (providerId: string) => {
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
        <label className="field-label" htmlFor="filter-from">
          <span>{t("filters.from")}</span>
          <Input
            id="filter-from"
            type="date"
            value={value.from ?? ""}
            onChange={(event) => onChange({ from: event.target.value || undefined })}
          />
        </label>

        <label className="field-label" htmlFor="filter-to">
          <span>{t("filters.to")}</span>
          <Input
            id="filter-to"
            type="date"
            value={value.to ?? ""}
            onChange={(event) => onChange({ to: event.target.value || undefined })}
          />
        </label>

        <label className="field-label" htmlFor="filter-category">
          <span>{t("filters.category")}</span>
          <select
            id="filter-category"
            className="input"
            value={value.category ?? ""}
            onChange={(event) => onChange({ category: event.target.value || undefined })}
          >
            <option value="">{t("filters.allCategories")}</option>
            {CATEGORIES.map((category) => (
              <option value={category} key={category}>
                {t(`categories.${category}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="field-label" htmlFor="filter-author">
          <span>{t("filters.author")}</span>
          <Input
            id="filter-author"
            value={value.author ?? ""}
            onChange={(event) => onChange({ author: event.target.value || undefined })}
            placeholder={t("filters.authorPlaceholder")}
          />
        </label>

        <fieldset className="source-fieldset">
          <legend>{t("filters.sources")}</legend>
          <div className="checkbox-row">
            {PROVIDERS.map((provider) => (
              <label className="check-pill" key={provider.id}>
                <input
                  type="checkbox"
                  checked={selectedProviders.has(provider.id)}
                  onChange={() => toggleProvider(provider.id)}
                />
                <span>{provider.shortLabel}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  )
}
