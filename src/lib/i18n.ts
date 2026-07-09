import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import de from "@/locales/de/translation.json"
import en from "@/locales/en/translation.json"

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "de"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  })

const updateDocumentLanguage = (language: string) => {
  document.documentElement.lang = language
  document.documentElement.dir = i18n.dir(language)
}

updateDocumentLanguage(i18n.resolvedLanguage ?? "en")
i18n.on("languageChanged", updateDocumentLanguage)
