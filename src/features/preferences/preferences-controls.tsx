import { Check, Plus, X } from "lucide-react"
import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CATEGORIES } from "@/lib/categories"
import { PROVIDERS } from "@/lib/providers"
import { togglePreference, usePreferences } from "./preferences-context"

export function PreferencesControls() {
  const { t } = useTranslation()
  const { preferences, setPreferences } = usePreferences()
  const [author, setAuthor] = useState("")

  const addAuthor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedAuthor = author.trim()
    const alreadySaved = preferences.authors.some(
      (savedAuthor) => savedAuthor.toLowerCase() === normalizedAuthor.toLowerCase(),
    )

    if (!normalizedAuthor || alreadySaved) {
      return
    }

    setPreferences({ ...preferences, authors: [...preferences.authors, normalizedAuthor] })
    setAuthor("")
  }

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

      <div className="preference-group">
        <h2>{t("preferences.authors")}</h2>
        <form className="author-form" onSubmit={addAuthor}>
          <label className="sr-only" htmlFor="preference-author">
            {t("preferences.authorPlaceholder")}
          </label>
          <Input
            id="preference-author"
            name="preferred-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder={t("preferences.authorPlaceholder")}
          />
          <Button type="submit" size="small">
            <Plus size={16} aria-hidden="true" />
            {t("preferences.addAuthor")}
          </Button>
        </form>
        {preferences.authors.length > 0 ? (
          <div className="author-list">
            {preferences.authors.map((savedAuthor) => (
              <span className="author-chip" key={savedAuthor}>
                {savedAuthor}
                <button
                  type="button"
                  aria-label={t("preferences.removeAuthor", { author: savedAuthor })}
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      authors: preferences.authors.filter((item) => item !== savedAuthor),
                    })
                  }
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="saved-indicator">
        <Check size={15} aria-hidden="true" />
        {t("preferences.saved")}
      </div>
    </section>
  )
}
