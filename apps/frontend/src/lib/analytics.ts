const apiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
const apiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

export const analyticsConfig = apiKey && apiHost ? { apiKey, apiHost } : null

type AnalyticsClient = typeof import("posthog-js")["default"]

let analyticsClientPromise: Promise<AnalyticsClient | null> | null = null

async function loadAnalyticsClient() {
  if (!analyticsConfig) {
    return null
  }

  analyticsClientPromise ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(analyticsConfig.apiKey, {
        api_host: analyticsConfig.apiHost,
        ui_host: "https://eu.posthog.com",
        capture_pageview: false,
        capture_exceptions: true,
        person_profiles: "identified_only",
      })
      return posthog
    })
    .catch(() => null)

  return analyticsClientPromise
}

export function initializeAnalytics() {
  void loadAnalyticsClient()
}

export async function safeCapture(event: string, properties?: Record<string, unknown>) {
  const posthog = await loadAnalyticsClient()
  posthog?.capture(event, properties)
}

export async function reportError(error: unknown) {
  const posthog = await loadAnalyticsClient()
  posthog?.captureException(error)
}
