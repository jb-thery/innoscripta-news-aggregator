import type { OpenAPIHono } from "@hono/zod-openapi"
import { proxy } from "hono/proxy"
import { API_PATHS, API_WILDCARD_PATHS } from "../../shared/paths"

const ANALYTICS_ORIGINS = {
  events: "https://eu.i.posthog.com",
  assets: "https://eu-assets.i.posthog.com",
} as const

export function registerAnalyticsProxy(app: OpenAPIHono) {
  app.all(API_WILDCARD_PATHS.analytics, async (context) => {
    const upstreamPath = context.req.path.replace(new RegExp(`^${API_PATHS.analytics}`), "")
    const target = upstreamPath.startsWith("/static")
      ? ANALYTICS_ORIGINS.assets
      : ANALYTICS_ORIGINS.events

    return proxy(`${target}${upstreamPath}`, {
      ...context.req.raw,
      headers: context.req.raw.headers,
    })
  })
}
