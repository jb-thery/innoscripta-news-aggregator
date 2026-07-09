import posthog from "posthog-js"

const apiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
const apiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

export const analyticsConfig = apiKey && apiHost ? { apiKey, apiHost } : null

export function safeCapture(event: string, properties?: Record<string, unknown>) {
  if (!analyticsConfig) {
    return
  }

  posthog.capture(event, properties)
}

export function reportError(error: unknown) {
  if (!analyticsConfig) {
    return
  }

  posthog.captureException(error)
}
