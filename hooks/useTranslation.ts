"use client"

import { useState, useEffect } from 'react'
import { translations, type Language, type TranslationKey } from '@/lib/translations'

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    // Get language from localStorage
    const adminUserStr = localStorage.getItem("adminUser")
    if (adminUserStr) {
      try {
        const adminUser = JSON.parse(adminUserStr)
        if (adminUser.settings?.language) {
          setLanguage(adminUser.settings.language as Language)
        }
      } catch (error) {
        console.error("Error parsing admin user for language:", error)
      }
    }

    // Listen for storage changes and custom language change events
    const handleStorageChange = () => {
      const userStr = localStorage.getItem("adminUser")
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.settings?.language) {
            setLanguage(user.settings.language as Language)
          }
        } catch (error) {
          console.error("Error parsing admin user from storage:", error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('languageChanged', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('languageChanged', handleStorageChange)
    }
  }, [])

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return { t, language }
}