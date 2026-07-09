import type { ProviderId } from "@/api/generated/model"

export const PROVIDERS = [
  { id: "newsapi", label: "NewsAPI.org", shortLabel: "NewsAPI" },
  { id: "guardian", label: "The Guardian", shortLabel: "Guardian" },
  { id: "nytimes", label: "The New York Times", shortLabel: "NYT" },
] satisfies ReadonlyArray<{ id: ProviderId; label: string; shortLabel: string }>

export const ALL_PROVIDER_IDS = PROVIDERS.map((provider) => provider.id).join(",")

export function getProviderLabel(providerId: ProviderId) {
  return PROVIDERS.find((provider) => provider.id === providerId)?.label ?? providerId
}
