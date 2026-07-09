import { AlertCircle, Newspaper, Radar } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "./ui/button"

export function LoadingState() {
  const { t } = useTranslation()

  return (
    <div className="state-panel state-panel--loading" role="status">
      <Radar className="state-panel__radar" size={32} aria-hidden="true" />
      <div>
        <h2>{t("states.loadingTitle")}</h2>
        <p>{t("states.loadingBody")}</p>
      </div>
      <div className="skeleton-grid" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

export function EmptyState({ start = false }: { start?: boolean }) {
  const { t } = useTranslation()

  return (
    <div className="state-panel">
      <Newspaper size={32} aria-hidden="true" />
      <h2>{t(start ? "states.startTitle" : "states.emptyTitle")}</h2>
      <p>{t(start ? "states.startBody" : "states.emptyBody")}</p>
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="state-panel state-panel--error" role="alert">
      <AlertCircle size={32} aria-hidden="true" />
      <h2>{t("states.errorTitle")}</h2>
      <p>{t("states.errorBody")}</p>
      <Button onClick={onRetry} variant="outline">
        {t("states.retry")}
      </Button>
    </div>
  )
}
