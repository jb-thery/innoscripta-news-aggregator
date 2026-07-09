import { Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import { CATEGORIES } from "@/lib/categories"
import { PROVIDERS } from "@/lib/providers"
import { AuthorPreferences } from "./author-preferences"
import { togglePreference } from "./preferences"
import { usePreferences } from "./preferences-context"

export function PreferencesControls() {
  const { t } = useTranslation()
  const { preferences, setPreferences } = usePreferences()

  return (
    <section className="preferences-card">
      <div className="preference-group">
        <h2>{t("preferences.sources")}</h2>
        <div className="preference-options">
          {PROVIDERS.map((provider) => {
            const selected = preferences.sources.includes(provider.id)
            return (
              <button
                className={
                  selected ? "preference-option preference-option--selected" : "preference-option"
                }
                type="button"
                aria-pressed={selected}
                key={provider.id}
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    sources: togglePreference(preferences.sources, provider.id),
                  })
                }
              >
                <span>{provider.label}</span>
                {selected ? <Check size={18} aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="preference-group">
        <h2>{t("preferences.categories")}</h2>
        <div className="preference-options preference-options--compact">
          {CATEGORIES.map((category) => {
            const selected = preferences.categories.includes(category)
            return (
              <button
                className={
                  selected ? "preference-option preference-option--selected" : "preference-option"
                }
                type="button"
                aria-pressed={selected}
                key={category}
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    categories: togglePreference(preferences.categories, category),
                  })
                }
              >
                <span>{t(`categories.${category}`)}</span>
                {selected ? <Check size={18} aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      </div>

      <AuthorPreferences
        authors={preferences.authors}
        onChange={(authors) => setPreferences({ ...preferences, authors })}
      />

      <div className="saved-indicator">
        <Check size={15} aria-hidden="true" />
        {t("preferences.saved")}
      </div>
    </section>
  )
}
