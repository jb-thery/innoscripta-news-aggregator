import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, Outlet, useRouterState } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { safeCapture } from "@/lib/analytics"

interface RouterContext {
  queryClient: QueryClient
}

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
      {import.meta.env.DEV ? (
        <>
          <ReactQueryDevtools initialIsOpen={false} />
          <TanStackRouterDevtools position="bottom-right" />
        </>
      ) : null}
    </AppShell>
  )
}
