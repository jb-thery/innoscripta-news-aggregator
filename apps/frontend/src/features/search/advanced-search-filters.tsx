import { Input } from "@signal-desk/ui"
import type { ProviderId } from "@/api/generated/model"
import { CATEGORIES } from "@/lib/categories"
import { PROVIDERS } from "@/lib/providers"
import type { SearchState } from "./search-state"

interface AdvancedSearchFiltersProps {
  value: SearchState
  selectedProviders: ReadonlySet<string>
  onChange: (change: Partial<SearchState>) => void
  onToggleProvider: (providerId: ProviderId) => void
  translate: (key: string) => string
}

export function AdvancedSearchFilters({
  value,
  selectedProviders,
  onChange,
  onToggleProvider,
  translate,
}: AdvancedSearchFiltersProps) {
  return (
    <>
      <label className="field-label" htmlFor="filter-from">
        <span>{translate("filters.from")}</span>
        <Input
          id="filter-from"
          type="date"
          value={value.from ?? ""}
          onChange={(event) => onChange({ from: event.target.value || undefined })}
        />
      </label>

      <label className="field-label" htmlFor="filter-to">
        <span>{translate("filters.to")}</span>
        <Input
          id="filter-to"
          type="date"
          value={value.to ?? ""}
          onChange={(event) => onChange({ to: event.target.value || undefined })}
        />
      </label>

      <label className="field-label" htmlFor="filter-category">
        <span>{translate("filters.category")}</span>
        <select
          id="filter-category"
          className="input"
          value={value.category ?? ""}
          onChange={(event) => onChange({ category: event.target.value || undefined })}
        >
          <option value="">{translate("filters.allCategories")}</option>
          {CATEGORIES.map((category) => (
            <option value={category} key={category}>
              {translate(`categories.${category}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label" htmlFor="filter-author">
        <span>{translate("filters.author")}</span>
        <Input
          id="filter-author"
          value={value.author ?? ""}
          onChange={(event) => onChange({ author: event.target.value || undefined })}
          placeholder={translate("filters.authorPlaceholder")}
        />
      </label>

      <fieldset className="source-fieldset">
        <legend>{translate("filters.sources")}</legend>
        <div className="checkbox-row">
          {PROVIDERS.map((provider) => (
            <label className="check-pill" key={provider.id}>
              <input
                type="checkbox"
                checked={selectedProviders.has(provider.id)}
                onChange={() => onToggleProvider(provider.id)}
              />
              <span>{provider.shortLabel}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  )
}
