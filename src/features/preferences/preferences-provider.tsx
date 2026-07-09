import { type ReactNode, useEffect, useMemo, useState } from "react"
import { type Preferences, parsePreferences } from "./preferences"
import { PreferencesContext } from "./preferences-context"

const STORAGE_KEY = "signal-desk-preferences"

const readPreferences = () => parsePreferences(window.localStorage.getItem(STORAGE_KEY))

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  const value = useMemo(() => ({ preferences, setPreferences }), [preferences])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
