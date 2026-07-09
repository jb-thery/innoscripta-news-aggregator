import { OpenAPIHono } from "@hono/zod-openapi"
import { securityHeaders } from "./middleware/security-headers"
import { createProviders } from "./providers"
import type { ArticleProvider } from "./providers/types"
import { registerAnalyticsProxy } from "./routes/analytics-proxy"
import { registerDocumentationRoutes } from "./routes/documentation"
import { registerHealthRoute } from "./routes/health"
import { registerSearchRoute } from "./routes/search"

export function createApp(providers: ArticleProvider[] = createProviders()) {
  const app = new OpenAPIHono()

  app.use("*", securityHeaders)
  registerHealthRoute(app, providers)
  registerSearchRoute(app, providers)
  registerDocumentationRoutes(app)
  registerAnalyticsProxy(app)

  return app
}

export const app = createApp()
