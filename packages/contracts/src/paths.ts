export const APP_PATHS = {
  discover: "/",
  feed: "/feed",
} as const

export const API_PATHS = {
  root: "/api",
  health: "/api/health",
  search: "/api/search",
  openApi: "/openapi.json",
  docs: "/docs",
  analytics: "/ingest",
  analyticsAssets: "/ingest/static",
} as const

export const API_WILDCARD_PATHS = {
  analytics: `${API_PATHS.analytics}/*`,
} as const
