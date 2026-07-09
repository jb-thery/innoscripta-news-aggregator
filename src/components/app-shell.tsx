import { API_PATHS } from "@shared/paths"
import { useTranslation } from "react-i18next"
import { AppHeader } from "./app-header"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()

  return (
    <div className="site-frame">
      <div className="top-rule" aria-hidden="true" />
      <AppHeader />
      <main>{children}</main>
      <footer className="site-footer">
        <p>{t("footer.note")}</p>
        {__STATIC_MOCK__ ? (
          <span>{t("footer.staticMode")}</span>
        ) : (
          <a href={API_PATHS.docs} target="_blank" rel="noreferrer">
            {t("footer.apiDocs")}
          </a>
        )}
      </footer>
    </div>
  )
}
