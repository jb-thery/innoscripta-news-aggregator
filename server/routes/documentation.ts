import { swaggerUI } from "@hono/swagger-ui"
import type { OpenAPIHono } from "@hono/zod-openapi"
import { API_PATHS } from "../../shared/paths"

export const OPEN_API_INFO = {
  title: "Innoscripta News Aggregator BFF",
  version: "1.0.0",
  description: "Contract-first BFF that normalizes NewsAPI, The Guardian, and NYT articles.",
} as const

export function registerDocumentationRoutes(app: OpenAPIHono) {
  app.doc(API_PATHS.openApi, {
    openapi: "3.0.0",
    info: OPEN_API_INFO,
  })
  app.get(API_PATHS.docs, swaggerUI({ url: API_PATHS.openApi }))
}
