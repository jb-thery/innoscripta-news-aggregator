import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { type ReactNode, useEffect } from "react"

const apiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
const apiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

export const isAnalyticsEnabled = Boolean(apiKey && apiHost)

export function safeCapture(event: string, properties?: Record<string, unknown>) {
  if (!isAnalyticsEnabled) {
    return
  }

  posthog.capture(event, properties)
}

export function reportError(error: unknown) {
  if (!isAnalyticsEnabled) {
    return
  }

  posthog.captureException(error)
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isAnalyticsEnabled) {
      return
    }

    const handleError = (event: ErrorEvent) => reportError(event.error ?? event.message)
    const handleRejection = (event: PromiseRejectionEvent) => reportError(event.reason)

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  if (!isAnalyticsEnabled || !apiKey || !apiHost) {
    return children
  }

  return (
    <PostHogProvider
      apiKey={apiKey}
      options={{
        api_host: apiHost,
        ui_host: "https://eu.posthog.com",
        capture_pageview: false,
        capture_exceptions: true,
        person_profiles: "identified_only",
      }}
    >
      {children}
    </PostHogProvider>
  )
}
