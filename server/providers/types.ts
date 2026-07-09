import type { Article, ProviderId, SearchParams } from "../schema"

export interface ArticleProvider {
  id: ProviderId
  hasLiveCredentials(): boolean
  search(params: SearchParams, signal?: AbortSignal): Promise<Article[]>
}

export interface ProviderRuntimeConfig {
  baseUrl: string
  apiKey?: string | undefined
  failProvider?: ProviderId | undefined
}
