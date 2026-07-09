import { createContext, useContext } from "react"
import type { Preferences } from "./preferences"

interface PreferencesContextValue {
  preferences: Preferences
  setPreferences: (preferences: Preferences) => void
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider")
  }

  return context
}
