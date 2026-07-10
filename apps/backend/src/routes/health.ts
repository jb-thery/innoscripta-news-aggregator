import { createRoute, type OpenAPIHono } from "@hono/zod-openapi"
import { API_PATHS, HealthResponseSchema } from "@signal-desk/contracts"
import type { ArticleProvider } from "../providers/types"

const healthRoute = createRoute({
  method: "get",
  path: API_PATHS.health,
  operationId: "getHealth",
  tags: ["system"],
  responses: {
    200: {
      description: "Runtime health and data mode.",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
})

export function registerHealthRoute(app: OpenAPIHono, providers: ArticleProvider[]) {
  app.openapi(healthRoute, (context) => {
    const liveCount = providers.filter((provider) => provider.hasLiveCredentials()).length
    const mode = liveCount === 0 ? "mock" : liveCount === providers.length ? "live" : "mixed"

    return context.json(
      {
        status: "ok",
        mode,
        timestamp: new Date().toISOString(),
      },
      200,
    )
  })
}
