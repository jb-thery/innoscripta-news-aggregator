import { PostHogProvider } from "posthog-js/react"
import type { ReactNode } from "react"
import { analyticsConfig } from "./analytics"

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  if (!analyticsConfig) {
    return children
  }

  return (
    <PostHogProvider
      apiKey={analyticsConfig.apiKey}
      options={{
        api_host: analyticsConfig.apiHost,
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
