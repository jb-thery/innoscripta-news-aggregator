import "@fontsource-variable/dm-sans"
import "@fontsource-variable/newsreader"
import "@/styles/index.css"
import "@/lib/i18n"

import { QueryClientProvider } from "@tanstack/react-query"
import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ErrorBoundary } from "@/components/error-boundary"
import { ThemeProvider } from "@/components/theme-provider"
import { PreferencesProvider } from "@/features/preferences/preferences-provider"
import { AnalyticsProvider } from "@/lib/analytics-provider"
import { queryClient } from "@/lib/query-client"
import { routeTree } from "./routeTree.gen"

const routerBasePath = __HASH_ROUTING__ ? "/" : import.meta.env.BASE_URL.replace(/\/+$/, "") || "/"

const router = createRouter({
  routeTree,
  basepath: routerBasePath,
  context: { queryClient },
  defaultPreload: "intent",
  history: __HASH_ROUTING__ ? createHashHistory() : undefined,
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
