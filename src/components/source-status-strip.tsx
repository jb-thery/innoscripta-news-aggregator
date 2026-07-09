import { AlertTriangle, Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { SourceStatus } from "@/api/generated/model"
import { getProviderLabel } from "@/lib/providers"

export function SourceStatusStrip({ sources }: { sources: SourceStatus[] }) {
  const { t } = useTranslation()
  const hasFailure = sources.some((source) => !source.ok)

  return (
    <section className="source-strip" aria-label={t("sources.title")} aria-live="polite">
      <div className="source-strip__label">{t("sources.title")}</div>
      <div className="source-strip__items">
        {sources.map((source) => {
          const isNotSelected = source.error === "Not selected"
          const statusLabel = isNotSelected
            ? t("sources.notSelected")
            : source.ok
              ? t("sources.online")
              : t("sources.unavailable")

          return (
            <div
              className={`source-chip source-chip--${source.ok ? "ok" : "error"}`}
              key={source.provider}
              title={source.error ?? undefined}
            >
              {source.ok ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <AlertTriangle size={14} aria-hidden="true" />
              )}
              <span>{getProviderLabel(source.provider)}</span>
              <small>{statusLabel}</small>
            </div>
          )
        })}
      </div>
      {hasFailure ? (
        <p className="partial-warning">
          <AlertTriangle size={16} aria-hidden="true" />
          {t("sources.partial")}
        </p>
      ) : null}
    </section>
  )
}
