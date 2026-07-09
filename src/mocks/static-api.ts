import { filterArticles } from "@server/providers/filter"
import { mockArticles } from "@server/providers/fixtures"
import { API_PATHS } from "@shared/paths"
import type { ProviderId, SourceStatus } from "@/api/generated/model"

const PROVIDER_IDS: ProviderId[] = ["newsapi", "guardian", "nytimes"]

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  })

const getOptionalParam = (url: URL, name: string) => {
  const value = url.searchParams.get(name)
  return value ? { [name]: value } : {}
}

export function createStaticApiResponse(url: string): Response {
  const requestUrl = new URL(url, "https://signal-desk.local")

  if (requestUrl.pathname === API_PATHS.health) {
    return jsonResponse({
      status: "ok",
      mode: "mock",
      timestamp: new Date().toISOString(),
    })
  }

  if (requestUrl.pathname !== API_PATHS.search) {
    return jsonResponse({ error: "Static endpoint not found" }, 404)
  }

  const providers = requestUrl.searchParams.get("providers")
  const selectedProviders = new Set(providers?.split(",").filter(Boolean) ?? PROVIDER_IDS)
  const params = {
    q: requestUrl.searchParams.get("q") ?? "",
    ...getOptionalParam(requestUrl, "from"),
    ...getOptionalParam(requestUrl, "to"),
    ...getOptionalParam(requestUrl, "category"),
    ...getOptionalParam(requestUrl, "author"),
    ...(providers ? { providers } : {}),
  }
  const articles = filterArticles(
    mockArticles
      .filter((article) => selectedProviders.has(article.provider))
      .map((article) => ({ ...article })),
    params,
  )
  const sources: SourceStatus[] = PROVIDER_IDS.map((provider) => ({
    provider,
    ok: true,
    error: selectedProviders.has(provider) ? null : "Not selected",
  }))

  return jsonResponse({ articles, sources })
}
