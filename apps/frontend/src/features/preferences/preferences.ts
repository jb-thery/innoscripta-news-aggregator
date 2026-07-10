import { z } from "zod"

z.config({ jitless: true })

const PreferencesSchema = z.object({
  sources: z.array(z.enum(["newsapi", "guardian", "nytimes"])),
  categories: z.array(z.string()),
  authors: z.array(z.string()),
})

export type Preferences = z.infer<typeof PreferencesSchema>

const emptyPreferences = (): Preferences => ({
  sources: [],
  categories: [],
  authors: [],
})

export function parsePreferences(value: string | null): Preferences {
  if (!value) {
    return emptyPreferences()
  }

  try {
    return PreferencesSchema.parse(JSON.parse(value))
  } catch {
    return emptyPreferences()
  }
}

export function togglePreference<T extends string>(items: T[], item: T): T[] {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item]
}

export function hasPreferences(preferences: Preferences) {
  return (
    preferences.sources.length > 0 ||
    preferences.categories.length > 0 ||
    preferences.authors.length > 0
  )
}
