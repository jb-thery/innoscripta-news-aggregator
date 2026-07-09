import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { z } from "zod"
import type { ProviderId } from "@/api/generated/model"

const PreferencesSchema = z.object({
  sources: z.array(z.enum(["newsapi", "guardian", "nytimes"])),
  categories: z.array(z.string()),
  authors: z.array(z.string()),
})

export type Preferences = z.infer<typeof PreferencesSchema>

interface PreferencesContextValue {
  preferences: Preferences
  setPreferences: (preferences: Preferences) => void
}

const EMPTY_PREFERENCES: Preferences = {
  sources: [],
  categories: [],
  authors: [],
}

const STORAGE_KEY = "signal-desk-preferences"
const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function readPreferences(): Preferences {
  const savedPreferences = window.localStorage.getItem(STORAGE_KEY)
  if (!savedPreferences) {
    return EMPTY_PREFERENCES
  }

  try {
    return PreferencesSchema.parse(JSON.parse(savedPreferences))
  } catch {
    return EMPTY_PREFERENCES
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  const value = useMemo(() => ({ preferences, setPreferences }), [preferences])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider")
  }

  return context
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

export function isProviderId(value: string): value is ProviderId {
  return value === "newsapi" || value === "guardian" || value === "nytimes"
}
