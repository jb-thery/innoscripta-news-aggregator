import { APP_PATHS } from "@signal-desk/contracts"
import { Badge, Button } from "@signal-desk/ui"
import { Link } from "@tanstack/react-router"
import { Languages, Moon, Sun } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useGetHealth } from "@/api/generated/news"
import { DEFAULT_SEARCH } from "@/features/search/search-state"
import { useTheme } from "./theme-provider"

const HEALTH_STALE_TIME_MS = 60_000

export function AppHeader() {
  const { t, i18n } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const health = useGetHealth({ query: { staleTime: HEALTH_STALE_TIME_MS, retry: false } })
  const language = i18n.resolvedLanguage?.split("-")[0] ?? "en"
  const mode = health.data?.mode ?? "unknown"

  return (
    <header className="site-header">
      <Link className="wordmark" to={APP_PATHS.discover} search={DEFAULT_SEARCH}>
        <span className="wordmark__mark" aria-hidden="true" translate="no">
          SD
        </span>
        <span>
          <strong translate="no">{t("app.name")}</strong>
          <small>{t("app.tagline")}</small>
        </span>
      </Link>

      <nav className="primary-nav" aria-label={t("nav.label")}>
        <Link
          className="nav-link"
          activeProps={{ className: "nav-link nav-link--active" }}
          activeOptions={{ exact: true }}
          to={APP_PATHS.discover}
          search={DEFAULT_SEARCH}
        >
          {t("nav.discover")}
        </Link>
        <Link
          className="nav-link"
          activeProps={{ className: "nav-link nav-link--active" }}
          to={APP_PATHS.feed}
        >
          {t("nav.feed")}
        </Link>
      </nav>

      <div className="header-actions">
        <Badge
          tone={mode === "live" ? "success" : "neutral"}
          className="runtime-badge"
          aria-live="polite"
        >
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
            <option value="en">{t("language.english")}</option>
            <option value="de">{t("language.german")}</option>
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
  )
}
