import { type ReactNode, useEffect } from "react"
import { initializeAnalytics } from "./analytics"

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initializeAnalytics()
  }, [])

  return children
}
