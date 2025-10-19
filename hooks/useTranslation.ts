"use client"

import { useState, useEffect, useCallback } from "react"
import { translations, type Language, type TranslationKey } from "@/lib/translations"

export function useTranslation() {
  const [language, setLanguage] = useState<Language>("en")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get language from localStorage
    const loadLanguage = () => {
      try {
        // First check if user is admin
        const adminUserStr = localStorage.getItem("adminUser")
        if (adminUserStr) {
          const adminUser = JSON.parse(adminUserStr)
          if (adminUser.settings?.language) {
            setLanguage(adminUser.settings.language as Language)
            setIsLoading(false)
            return
          }
        }

        // Then check for general language preference
        const savedLanguage = localStorage.getItem("preferredLanguage")
        if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fr" || savedLanguage === "rw")) {
          setLanguage(savedLanguage as Language)
        }
      } catch (error) {
        console.error("Error loading language:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLanguage()

    // Listen for storage changes and custom language change events
    const handleStorageChange = (e?: StorageEvent) => {
      if (e && e.key !== "adminUser" && e.key !== "preferredLanguage") return
      loadLanguage()
    }

    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ language: Language }>
      if (customEvent.detail?.language) {
        setLanguage(customEvent.detail.language)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("languageChanged", handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("languageChanged", handleLanguageChange as EventListener)
    }
  }, [])

  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("preferredLanguage", newLanguage)

    // Update admin user if exists
    const adminUserStr = localStorage.getItem("adminUser")
    if (adminUserStr) {
      try {
        const adminUser = JSON.parse(adminUserStr)
        adminUser.settings = { ...adminUser.settings, language: newLanguage }
        localStorage.setItem("adminUser", JSON.stringify(adminUser))
      } catch (error) {
        console.error("Error updating admin user language:", error)
      }
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: newLanguage } }))
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language]?.[key] || translations.en[key] || key
    },
    [language],
  )

  const getLanguageInfo = useCallback(() => {
    const languageNames = {
      en: { name: "English", nativeName: "English", flag: "🇬🇧" },
      fr: { name: "French", nativeName: "Français", flag: "🇫🇷" },
      rw: { name: "Kinyarwanda", nativeName: "Ikinyarwanda", flag: "🇷🇼" },
    }
    return languageNames[language]
  }, [language])

  return { t, language, changeLanguage, isLoading, getLanguageInfo }
}
