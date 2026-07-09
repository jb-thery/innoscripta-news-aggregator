import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet, useRouterState } from "@tanstack/react-router"
import { lazy, Suspense, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { safeCapture } from "@/lib/analytics"

interface RouterContext {
  queryClient: QueryClient
}

const DevelopmentTools = import.meta.env.DEV
  ? lazy(() =>
      import("@/components/development-tools").then(({ DevelopmentTools }) => ({
        default: DevelopmentTools,
      })),
    )
  : null

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="state-panel">
      <h1>Page not found</h1>
    </div>
  ),
})

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  useEffect(() => {
    safeCapture("$pageview", { $current_url: new URL(pathname, window.location.origin).toString() })
  }, [pathname])

  return (
    <AppShell>
      <Outlet />
      {DevelopmentTools ? (
        <Suspense fallback={null}>
          <DevelopmentTools />
        </Suspense>
      ) : null}
    </AppShell>
  )
}
