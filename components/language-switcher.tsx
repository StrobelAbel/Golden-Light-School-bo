"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Check } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import type { Language } from "@/lib/translations"

interface LanguageOption {
  code: Language
  name: string
  nativeName: string
  flag: string
}

const languages: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "EN", flag: "🇬🇧" },
  { code: "fr", name: "French", nativeName: "FR", flag: "🇫🇷" },
  { code: "rw", name: "Kinyarwanda", nativeName: "RW", flag: "🇷🇼" },
]

interface LanguageSwitcherProps {
  variant?: "default" | "admin"
  size?: "default" | "sm" | "lg"
}

export function LanguageSwitcher({ variant = "default", size = "default" }: LanguageSwitcherProps) {
  const { language, changeLanguage } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0]

  const handleLanguageChange = async (langCode: Language) => {
    changeLanguage(langCode)

    // If admin user, save to backend
    const token = localStorage.getItem("adminToken")
    if (token && variant === "admin") {
      try {
        await fetch("/api/admin/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            settings: {
              language: langCode,
            },
          }),
        })
      } catch (error) {
        console.error("Error saving language preference:", error)
      }
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "admin" ? "outline" : "outline"}
          size={size}
          className={variant === "admin" ? "border-gray-300 text-gray-700 hover:bg-gray-50" : ""}
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </div>
            </div>
            {language === lang.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
