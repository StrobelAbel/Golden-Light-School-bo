"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useTranslation } from "@/hooks/useTranslation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Settings,
  Shield, 
  Calendar, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Bell,
  Mail,
  Lock,
  Eye,
  Trash2,
  Download,
  Upload,
  User,
  Clock,
  Activity,
  Globe
} from "lucide-react"

interface AccountSettings {
  _id: string
  username: string
  email: string
  role: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
  permissions?: string[]
  settings: {
    emailNotifications: boolean
    pushNotifications: boolean
    twoFactorAuth: boolean
    sessionTimeout: number
    theme: 'light' | 'dark' | 'system'
    language: string
  }
  sessions?: Array<{
    _id: string
    device: string
    browser: string
    location: string
    lastActive: string
    current: boolean
  }>
}

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  pushNotifications: true,
  twoFactorAuth: false,
  sessionTimeout: 30,
  theme: 'system' as 'light' | 'dark' | 'system',
  language: 'en'
}

export default function AccountSettingsPage() {
  const [account, setAccount] = useState<AccountSettings | null>(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  
  const router = useRouter()
  const { setTheme } = useTheme()
  const { t } = useTranslation()

  // Fetch account settings with better error handling
  const fetchAccountSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError("") // Clear previous errors
      
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/admin/account-settings", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken")
          localStorage.removeItem("adminUser")
          router.push("/admin/login")
          return
        }
        throw new Error(`Failed to fetch account settings: ${response.status}`)
      }

      const data = await response.json()
      setAccount(data)
      
      // Merge with defaults to ensure all properties exist
      const mergedSettings = {
        ...DEFAULT_SETTINGS,
        ...data.settings
      }
      setSettings(mergedSettings)
      
    } catch (err: any) {
      console.error("Error fetching account settings:", err)
      setError(err.message || "Error loading account settings")
    } finally {
      // Always set loading to false, regardless of success or failure
      setLoading(false)
    }
  }, [router]) // Removed settings dependency to prevent infinite loops

  // Load account settings on mount
  useEffect(() => {
    fetchAccountSettings()
  }, [fetchAccountSettings])

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Save settings quietly (without showing success message)
  const saveSettingsQuietly = async (settingsToSave: typeof settings) => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return

      const response = await fetch("/api/admin/account-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: settingsToSave }),
      })

      if (response.ok) {
        // Update localStorage with new settings
        const adminUserStr = localStorage.getItem("adminUser")
        if (adminUserStr) {
          try {
            const adminUser = JSON.parse(adminUserStr)
            adminUser.settings = settingsToSave
            localStorage.setItem("adminUser", JSON.stringify(adminUser))
            // Trigger language change event for immediate effect
            window.dispatchEvent(new Event('languageChanged'))
          } catch (error) {
            console.error("Error updating admin user settings:", error)
          }
        }
      }
    } catch (err) {
      console.error("Error saving settings:", err)
    }
  }

  // Save account settings with timeout
  const saveSettings = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        router.push("/admin/login")
        return
      }

      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch("/api/admin/account-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to save settings: ${response.status}`)
      }

      // Update localStorage with new settings
      const adminUserStr = localStorage.getItem("adminUser")
      if (adminUserStr) {
        try {
          const adminUser = JSON.parse(adminUserStr)
          adminUser.settings = settings
          localStorage.setItem("adminUser", JSON.stringify(adminUser))
        } catch (error) {
          console.error("Error updating admin user settings:", error)
        }
      }

      setSuccess("Account settings saved successfully!")
      
    } catch (err: any) {
      console.error("Error saving settings:", err)
      if (err.name === 'AbortError') {
        setError("Request timed out. Please try again.")
      } else {
        setError(err.message || "Error saving settings")
      }
    } finally {
      setSaving(false)
    }
  }

  // Terminate session with better error handling
  const terminateSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to terminate session")
      }

      // Refresh account data
      await fetchAccountSettings()
      setSuccess("Session terminated successfully!")
      
    } catch (err: any) {
      console.error("Error terminating session:", err)
      setError(err.message || "Error terminating session")
    }
  }

  // Export account data with timeout
  const exportAccountData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        setError("Authentication required")
        return
      }

      // Add timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch("/api/admin/export-data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setSuccess("Account data exported successfully!")
      
    } catch (err: any) {
      console.error("Error exporting data:", err)
      if (err.name === 'AbortError') {
        setError("Export request timed out. Please try again.")
      } else {
        setError(err.message || "Error exporting data")
      }
    }
  }

  // Format date helper with better error handling
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Unknown"
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return "Unknown"
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-golden-600" />
          <p className="text-gray-600">Loading account settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("Account Settings")}</h1>
        <p className="text-gray-600">{t("Manage your account security, notifications, and preferences")}</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>{t("Security & Privacy")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">{t("Two-Factor Authentication")}</Label>
                  <p className="text-sm text-gray-500">{t("Add an extra layer of security to your account")}</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={async (checked) => {
                    setSettings(prev => ({ ...prev, twoFactorAuth: checked }))
                    await saveSettingsQuietly({ ...settings, twoFactorAuth: checked })
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-medium">{t("Session Timeout")}</Label>
                <div className="space-y-2">
                  <select 
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={480}>8 hours</option>
                  </select>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Automatic logout after inactivity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>{t("Notifications")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">{t("Email Notifications")}</Label>
                  <p className="text-sm text-gray-500">{t("Receive notifications via email")}</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={async (checked) => {
                    setSettings(prev => ({ ...prev, emailNotifications: checked }))
                    await saveSettingsQuietly({ ...settings, emailNotifications: checked })
                  }}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">{t("Push Notifications")}</Label>
                  <p className="text-sm text-gray-500">{t("Receive browser push notifications")}</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={async (checked) => {
                    setSettings(prev => ({ ...prev, pushNotifications: checked }))
                    await saveSettingsQuietly({ ...settings, pushNotifications: checked })
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>{t("Preferences")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">{t("Theme")}</Label>
                <select 
                  value={settings.theme}
                  onChange={async (e) => {
                    const newTheme = e.target.value as 'light' | 'dark' | 'system'
                    setSettings(prev => ({ ...prev, theme: newTheme }))
                    setTheme(newTheme)
                    await saveSettingsQuietly({ ...settings, theme: newTheme })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
                >
                  <option value="light">{t("Light")}</option>
                  <option value="dark">{t("Dark")}</option>
                  <option value="system">{t("System")}</option>
                </select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-medium">{t("Language")}</Label>
                <select 
                  value={settings.language}
                  onChange={async (e) => {
                    const newLanguage = e.target.value
                    setSettings(prev => ({ ...prev, language: newLanguage }))
                    await saveSettingsQuietly({ ...settings, language: newLanguage })
                    // Trigger immediate language change
                    window.dispatchEvent(new Event('languageChanged'))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
                >
                  <option value="en">English</option>
                  <option value="rw">Kinyarwanda</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>{t("Data Management")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{t("Export Account Data")}</h4>
                  <p className="text-sm text-gray-500">{t("Download a copy of your account information")}</p>
                </div>
                <Button onClick={exportAccountData} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  {t("Export")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveSettings}
              className="bg-golden-600 hover:bg-golden-700" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Saving...")}
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  {t("Save Settings")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("Account Overview")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-golden-500 to-golden-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">{account?.username || "Admin"}</p>
                  <p className="text-sm text-gray-500">{account?.email || "No email"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t("Role")}</span>
                  <Badge variant="outline" className="bg-golden-50 border-golden-200 text-golden-700">
                    <Shield className="mr-1 h-3 w-3" />
                    {account?.role?.replace("_", " ").toUpperCase() || "ADMIN"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t("Status")}</span>
                  <Badge variant={account?.isActive ? "default" : "destructive"}>
                    {account?.isActive ? t("Active") : t("Inactive")}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">2FA</span>
                  <Badge variant={settings.twoFactorAuth ? "default" : "secondary"}>
                    {settings.twoFactorAuth ? t("Enabled") : t("Disabled")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                {t("Active Sessions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {account?.sessions?.length ? (
                  account.sessions.map((session) => (
                    <div key={session._id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{session.browser}</p>
                          <p className="text-xs text-gray-500">{session.device}</p>
                          <p className="text-xs text-gray-500">{session.location}</p>
                          <p className="text-xs text-gray-400">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {formatDate(session.lastActive)}
                          </p>
                        </div>
                        {session.current ? (
                          <Badge variant="default" className="text-xs">{t("Current")}</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => terminateSession(session._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">{t("No active sessions")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
