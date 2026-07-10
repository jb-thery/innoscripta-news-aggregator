import { Button, Input } from "@signal-desk/ui"
import { Plus, X } from "lucide-react"
import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"

interface AuthorPreferencesProps {
  authors: string[]
  onChange: (authors: string[]) => void
}

export function AuthorPreferences({ authors, onChange }: AuthorPreferencesProps) {
  const { t } = useTranslation()
  const [author, setAuthor] = useState("")

  const addAuthor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedAuthor = author.trim()
    const alreadySaved = authors.some(
      (savedAuthor) => savedAuthor.toLowerCase() === normalizedAuthor.toLowerCase(),
    )

    if (!normalizedAuthor || alreadySaved) {
      return
    }

    onChange([...authors, normalizedAuthor])
    setAuthor("")
  }

  return (
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
      {authors.length > 0 ? (
        <div className="author-list">
          {authors.map((savedAuthor) => (
            <span className="author-chip" key={savedAuthor}>
              {savedAuthor}
              <button
                type="button"
                aria-label={t("preferences.removeAuthor", { author: savedAuthor })}
                onClick={() => onChange(authors.filter((item) => item !== savedAuthor))}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
