import { type ProviderId, ProviderIdSchema } from "../schema"
import { DEFAULT_PROVIDER_BASE_URLS } from "./constants"
import { createGuardianProvider } from "./guardian"
import { createNewsApiProvider } from "./newsapi"
import { createNytimesProvider } from "./nytimes"
import type { ArticleProvider } from "./types"

const providerSchema = ProviderIdSchema.optional()

function getFailProviderFromEnv(): ProviderId | undefined {
  const parsed = providerSchema.safeParse(process.env.MOCK_FAIL_PROVIDER)
  return parsed.success ? parsed.data : undefined
}

export function createProviders(): ArticleProvider[] {
  const failProvider = getFailProviderFromEnv()

  return [
    createNewsApiProvider({
      baseUrl: process.env.NEWS_API_BASE_URL ?? DEFAULT_PROVIDER_BASE_URLS.newsapi,
      apiKey: process.env.NEWS_API_KEY,
      failProvider,
    }),
    createGuardianProvider({
      baseUrl: process.env.GUARDIAN_API_BASE_URL ?? DEFAULT_PROVIDER_BASE_URLS.guardian,
      apiKey: process.env.GUARDIAN_API_KEY,
      failProvider,
    }),
    createNytimesProvider({
      baseUrl: process.env.NYT_API_BASE_URL ?? DEFAULT_PROVIDER_BASE_URLS.nytimes,
      apiKey: process.env.NYT_API_KEY,
      failProvider,
    }),
  ]
}
