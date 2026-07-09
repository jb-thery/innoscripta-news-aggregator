import { Link } from "@tanstack/react-router"
import { Languages, Moon, Sun } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useGetHealth } from "@/api/generated/news"
import { DEFAULT_SEARCH } from "@/features/search/search-state"
import { useTheme } from "./theme-provider"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const health = useGetHealth({ query: { staleTime: 60_000, retry: false } })
  const language = i18n.resolvedLanguage?.split("-")[0] ?? "en"
  const mode = health.data?.mode ?? "unknown"

  return (
    <div className="site-frame">
      <div className="top-rule" aria-hidden="true" />
      <header className="site-header">
        <Link className="wordmark" to="/" search={DEFAULT_SEARCH}>
          <span className="wordmark__mark" aria-hidden="true">
            SD
          </span>
          <span>
            <strong>{t("app.name")}</strong>
            <small>{t("app.tagline")}</small>
          </span>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          <Link
            className="nav-link"
            activeProps={{ className: "nav-link nav-link--active" }}
            activeOptions={{ exact: true }}
            to="/"
            search={DEFAULT_SEARCH}
          >
            {t("nav.discover")}
          </Link>
          <Link
            className="nav-link"
            activeProps={{ className: "nav-link nav-link--active" }}
            to="/feed"
          >
            {t("nav.feed")}
          </Link>
        </nav>

        <div className="header-actions">
          <Badge tone={mode === "live" ? "success" : "neutral"} className="runtime-badge">
            <span className="status-dot" aria-hidden="true" />
            {t(`runtime.${mode}`)}
          </Badge>

          <label className="language-control">
            <Languages size={16} aria-hidden="true" />
            <span className="sr-only">{t("language.label")}</span>
            <select
              aria-label={t("language.label")}
              id="language-select"
              name="language"
              value={language}
              onChange={(event) => void i18n.changeLanguage(event.target.value)}
            >
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
          </label>

          <Button
            aria-label={t(resolvedTheme === "dark" ? "theme.light" : "theme.dark")}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            size="icon"
            variant="icon"
          >
            {resolvedTheme === "dark" ? (
              <Sun size={18} aria-hidden="true" />
            ) : (
              <Moon size={18} aria-hidden="true" />
            )}
          </Button>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <p>{t("footer.note")}</p>
        {__STATIC_MOCK__ ? (
          <span>{t("footer.staticMode")}</span>
        ) : (
          <a href="/docs" target="_blank" rel="noreferrer">
            {t("footer.apiDocs")}
          </a>
        )}
      </footer>
    </div>
  )
}
