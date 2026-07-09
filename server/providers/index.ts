import { type ProviderId, ProviderIdSchema } from "../schema"
import { createGuardianProvider } from "./guardian"
import { createNewsApiProvider } from "./newsapi"
import { createNytimesProvider } from "./nytimes"
import type { ArticleProvider } from "./types"

const providerSchema = ProviderIdSchema.optional()

export function getFailProviderFromEnv(): ProviderId | undefined {
  const parsed = providerSchema.safeParse(process.env.MOCK_FAIL_PROVIDER)
  return parsed.success ? parsed.data : undefined
}

export function createProviders(): ArticleProvider[] {
  const failProvider = getFailProviderFromEnv()

  return [
    createNewsApiProvider({
      baseUrl: process.env.NEWS_API_BASE_URL ?? "https://newsapi.org/v2",
      apiKey: process.env.NEWS_API_KEY,
      failProvider,
    }),
    createGuardianProvider({
      baseUrl: process.env.GUARDIAN_API_BASE_URL ?? "https://content.guardianapis.com",
      apiKey: process.env.GUARDIAN_API_KEY,
      failProvider,
    }),
    createNytimesProvider({
      baseUrl: process.env.NYT_API_BASE_URL ?? "https://api.nytimes.com/svc/search/v2",
      apiKey: process.env.NYT_API_KEY,
      failProvider,
    }),
  ]
}
