import "@fontsource-variable/dm-sans"
import "@fontsource-variable/newsreader"
import "@/styles/index.css"
import "@/lib/i18n"

import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ErrorBoundary } from "@/components/error-boundary"
import { ThemeProvider } from "@/components/theme-provider"
import { PreferencesProvider } from "@/features/preferences/preferences-context"
import { AnalyticsProvider } from "@/lib/analytics-provider"
import { queryClient } from "@/lib/query-client"
import { routeTree } from "./routeTree.gen"

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <PreferencesProvider>
          <AnalyticsProvider>
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
            </QueryClientProvider>
          </AnalyticsProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
