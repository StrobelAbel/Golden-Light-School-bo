"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useSessionTimeout } from "@/hooks/useSessionTimeout"
import { useTranslation } from "@/hooks/useTranslation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  BarChart3,
  GraduationCap,
  Users,
  LogOut,
  User,
  Settings,
  Shield,
  Calendar,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { EnhancedNotifications } from "@/components/admin/enhanced-notifications"
import { Notification } from "@/lib/models/Notification"

interface AdminUser {
  username: string
  email: string
  role: string
  createdAt: string
}

export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [sessionTimeout, setSessionTimeout] = useState(30)
  const [search, setSearch] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    setIsAuthenticated(false)
    setAdminUser(null)
    setNotifications([])
    setUnreadCount(0)
    router.push("/admin/login")
  }, [router])

  const { resetTimer } = useSessionTimeout({
    timeout: sessionTimeout,
    onLogout: handleLogout,
    enabled: isAuthenticated && pathname !== "/admin/login",
  })

  useEffect(() => {
    const handleStorageChange = () => {
      const userStr = localStorage.getItem("adminUser")
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.settings?.sessionTimeout && user.settings.sessionTimeout !== sessionTimeout) {
            setSessionTimeout(user.settings.sessionTimeout)
          }
        } catch (error) {
          console.error("Error parsing admin user from storage:", error)
        }
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [sessionTimeout])

  const fetchNotifications = useCallback(async (includeCleanup = false) => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return
      const url = includeCleanup ? "/api/notifications?cleanup=true" : "/api/notifications"
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store",
      })
      if (!response.ok) return
      const data = await response.json()
      setNotifications(data)
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }, [])

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("adminToken")
      const userStr = localStorage.getItem("adminUser")
      if (pathname === "/admin/login") { setIsLoading(false); return }
      if (!token) { setIsAuthenticated(false); setIsLoading(false); router.push("/admin/login"); return }
      setIsAuthenticated(true)
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setAdminUser(user)
          if (user.settings?.sessionTimeout) setSessionTimeout(user.settings.sessionTimeout)
        } catch { localStorage.removeItem("adminUser") }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [pathname, router])

  useEffect(() => {
    if (!isAuthenticated || pathname === "/admin/login") return
    fetchNotifications(true)
    const interval = setInterval(() => fetchNotifications(), 30000)
    const cleanupInterval = setInterval(() => fetchNotifications(true), 3600000)
    return () => { clearInterval(interval); clearInterval(cleanupInterval) }
  }, [isAuthenticated, pathname, fetchNotifications])

  const markNotificationAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" },
        body: JSON.stringify({ id, isRead: true }),
        cache: "no-store",
      })
      if (response.ok) fetchNotifications()
    } catch (error) { console.error("Error marking notification as read:", error) }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" },
        body: JSON.stringify({ markAllAsRead: true }),
        cache: "no-store",
      })
      if (response.ok) fetchNotifications()
    } catch (error) { console.error("Error marking all notifications as read:", error) }
  }

  // Persist sidebar state
  useEffect(() => {
    const stored = localStorage.getItem("sidebarOpen")
    if (stored !== null) setSidebarOpen(stored === "true")
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      localStorage.setItem("sidebarOpen", String(!prev))
      return !prev
    })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (pathname === "/admin/login") return <>{children}</>
  if (!isAuthenticated) return null

  const navItems = [
    { href: "/admin/dashboard",     label: t("Dashboard"),      icon: LayoutDashboard },
    { href: "/admin/products",      label: t("Products"),       icon: Package },
    { href: "/admin/orders",        label: t("Orders"),         icon: ShoppingCart },
    { href: "/admin/admissions",    label: t("Admissions"),     icon: GraduationCap },
    { href: "/admin/students",      label: t("Students"),       icon: Users },
    { href: "/admin/academic-years",label: t("Academic Years"), icon: Calendar },
    { href: "/admin/applications",  label: t("Applications"),   icon: FileText },
    { href: "/admin/reports",       label: t("Reports"),        icon: BarChart3 },
  ]

  const utilityItems = [
    { href: "/admin/profile",  label: t("Profile Settings"),  icon: User },
    { href: "/admin/account",  label: t("Account Settings"),  icon: Settings },
  ]

  const filteredNav = search.trim()
    ? navItems.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : navItems

  const initials = adminUser?.username?.slice(0, 2).toUpperCase() ?? "AD"

  return (
    <TooltipProvider delayDuration={200}>
      <div className="admin-shell">

        {/* ── Single Sidebar ─────────────────────────── */}
        <aside className={`sidebar${sidebarOpen ? " sidebar--expanded" : " sidebar--collapsed"}`}>

          {/* Header */}
          <div className="sidebar-header">
            {sidebarOpen && (
              <div className="sidebar-logo">
                <Image src="/images/logo.jpg" alt="Logo" width={32} height={32} className="object-cover rounded-lg" />
              </div>
            )}
            {sidebarOpen && (
              <div className="sidebar-brand">
                <div className="sidebar-brand-name">Golden Light</div>
                <div className="sidebar-brand-sub">{t("Admin Panel")}</div>
              </div>
            )}
            <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
              {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          </div>

          {/* Search — only when expanded */}
          {sidebarOpen && (
            <div className="sidebar-search-wrap">
              <div className="sidebar-search">
                <Search className="sidebar-search-icon" />
                <input
                  type="text"
                  placeholder={t("Search…")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="sidebar-tabs">
                <button className="sidebar-tab active">{t("Menu")}</button>
                <button className="sidebar-tab">{t("Pinned")}</button>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="sidebar-nav">
            {filteredNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.href} disableHoverableContent>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className={`sidebar-nav-item${isActive ? " active" : ""}`}>
                      <Icon className="sidebar-nav-icon" />
                      {sidebarOpen && <span className="sidebar-nav-label">{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!sidebarOpen && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              )
            })}

            <div className="sidebar-divider" />

            {utilityItems.map((item) => {
              const Icon = item.icon
              return (
                <Tooltip key={item.href} disableHoverableContent>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className="sidebar-nav-item">
                      <Icon className="sidebar-nav-icon" />
                      {sidebarOpen && <span className="sidebar-nav-label">{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!sidebarOpen && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="sidebar-footer-user">
                  <div className="sidebar-footer-avatar">
                    <div className="sidebar-footer-avatar-img">{initials}</div>
                    <span className="sidebar-footer-online" />
                  </div>
                  {sidebarOpen && (
                    <>
                      <div className="sidebar-footer-info">
                        <div className="sidebar-footer-name">{adminUser?.username ?? "Admin"}</div>
                        <div className="sidebar-footer-role">
                          {adminUser?.role?.replace("_", " ") ?? "Super Admin"}
                        </div>
                      </div>
                      <LogOut size={14} style={{ color: "hsl(var(--sidebar-muted))", flexShrink: 0 }} />
                    </>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-52">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{adminUser?.username ?? "Admin"}</p>
                  <p className="text-xs text-muted-foreground">{adminUser?.email ?? ""}</p>
                  <div className="flex items-center mt-1 gap-1">
                    <Shield className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-500 font-medium">
                      {adminUser?.role?.replace("_", " ").toUpperCase() ?? "SUPER ADMIN"}
                    </span>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile"><User className="mr-2 h-4 w-4" />{t("Profile Settings")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/account"><Settings className="mr-2 h-4 w-4" />{t("Account Settings")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />{t("Sign Out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* ── Main Content ───────────────────────────── */}
        <div className="admin-main">
          <header className="admin-topbar">
            <h1 className="text-base font-semibold text-foreground">
              {[...navItems, ...utilityItems].find((i) => i.href === pathname)?.label ?? t("Admin Dashboard")}
            </h1>
            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="admin" size="sm" />
              <EnhancedNotifications
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllAsRead}
                onRefresh={() => fetchNotifications(true)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="admin-content">{children}</main>
        </div>

      </div>
    </TooltipProvider>
  )
}
