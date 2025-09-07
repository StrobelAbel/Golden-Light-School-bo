"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  BarChart3,
  GraduationCap,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  Shield,
} from "lucide-react"

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedId?: string
}

interface AdminUser {
  username: string
  email: string
  role: string
  createdAt: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Memoize the fetchNotifications function to prevent recreation on every render
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return // Don't fetch if no token

      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`, // Add auth header if needed
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch notifications:", response.status)
        return
      }

      const data = await response.json()
      setNotifications(data)
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }, []) // Empty dependency array since we're getting token inside the function

  // Separate authentication check from notification fetching
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("adminToken")
      const userStr = localStorage.getItem("adminUser")

      // If on login page, just stop loading
      if (pathname === "/admin/login") {
        setIsLoading(false)
        return
      }

      // Check authentication
      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        router.push("/admin/login")
        return
      }

      // Set authenticated state
      setIsAuthenticated(true)
      if (userStr) {
        try {
          setAdminUser(JSON.parse(userStr))
        } catch (error) {
          console.error("Error parsing admin user:", error)
          // Clear corrupted data
          localStorage.removeItem("adminUser")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  // Separate effect for notification polling - only runs when authenticated
  useEffect(() => {
    if (!isAuthenticated || pathname === "/admin/login") return

    // Initial fetch
    fetchNotifications()

    // Set up polling interval
    const interval = setInterval(fetchNotifications, 30000) // Increased to 30 seconds to reduce server load

    return () => clearInterval(interval)
  }, [isAuthenticated, pathname, fetchNotifications])

  const markNotificationAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return

      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add auth header if needed
        },
        body: JSON.stringify({ id, isRead: true }),
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return

      const unreadNotifications = notifications.filter((n) => !n.isRead)

      const promises = unreadNotifications.map((n) =>
        fetch("/api/notifications", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add auth header if needed
          },
          body: JSON.stringify({ id: n._id, isRead: true }),
        }),
      )

      await Promise.all(promises)
      fetchNotifications()
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const handleLogout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")

    // Reset state
    setIsAuthenticated(false)
    setAdminUser(null)
    setNotifications([])
    setUnreadCount(0)

    // Redirect
    router.push("/admin/login")
  }, [router])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_application":
        return "📝"
      case "new_order":
        return "🛒"
      case "new_product_request":
        return "📦"
      case "low_stock":
        return "⚠️"
      default:
        return "ℹ️"
    }
  }

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

      if (diffInMinutes < 1) return "Just now"
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    } catch (error) {
      return "Unknown"
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-golden-50 to-cyan-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-600"></div>
      </div>
    )
  }

  // Login page - render children directly
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Not authenticated - render nothing (redirect is handled in useEffect)
  if (!isAuthenticated) {
    return null
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/admissions", label: "Admissions", icon: GraduationCap },
    { href: "/admin/applications", label: "Applications", icon: FileText },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-golden-600 to-golden-700 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-golden-500">
          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8">
              <Image
                src="/images/logo.jpg"
                alt="Golden Light School Logo"
                fill
                className="object-contain rounded-full"
              />
            </div>
            <span className="text-white font-bold text-lg">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-golden-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive ? "bg-white/20 text-white" : "text-golden-100 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-golden-100 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="fixed top-0 left-0 right-0 lg:left-64 z-30 bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
                <DialogHeader className="flex flex-row items-center justify-between">
                  <DialogTitle>Notifications</DialogTitle>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                </DialogHeader>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <Link
                        key={notification._id}
                        href={
                          notification.type === "new_order" && notification.relatedId
                            ? `/admin/orders/${notification.relatedId}`
                            : "#"
                        }
                        className={`block p-3 rounded-lg transition hover:bg-gray-100 ${
                          notification.isRead ? "opacity-70" : "font-semibold"
                        }`}
                        onClick={() => markNotificationAsRead(notification._id)}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{getNotificationIcon(notification.type)}</span>
                          <span className="flex-1">{notification.title}</span>
                          <span className="text-xs text-gray-400">{getTimeAgo(notification.createdAt)}</span>
                        </div>
                        <div className="text-sm text-gray-600">{notification.message}</div>
                      </Link>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Admin Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-golden-500 to-golden-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">{adminUser?.username || "Admin"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{adminUser?.username || "Admin"}</p>
                  <p className="text-xs text-gray-500">{adminUser?.email || "admin@goldenlightschool.com"}</p>
                  <div className="flex items-center mt-1">
                    <Shield className="h-3 w-3 mr-1 text-golden-600" />
                    <span className="text-xs text-golden-600 font-medium">
                      {adminUser?.role?.replace("_", " ").toUpperCase() || "SUPER ADMIN"}
                    </span>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/account">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 pt-20">{children}</main>
      </div>
    </div>
  )
}
