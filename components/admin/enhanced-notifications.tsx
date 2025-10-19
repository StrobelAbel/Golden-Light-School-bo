"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Bell,
  GraduationCap,
  Package,
  ShoppingCart,
  Settings,
  CreditCard,
  Users,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Clock,
  AlertTriangle,
  Info
} from "lucide-react"
import { Notification, NotificationCategories, NotificationPriorities } from "@/lib/models/Notification"
import Link from "next/link"
import React from "react"

interface EnhancedNotificationsProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onRefresh: () => void
}

const categoryIcons = {
  admissions: GraduationCap,
  inventory: Package,
  orders: ShoppingCart,
  system: Settings,
  payments: CreditCard,
  users: Users
}

const priorityIcons = {
  low: Info,
  medium: Clock,
  high: AlertTriangle,
  urgent: AlertTriangle
}

export function EnhancedNotifications({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh
}: EnhancedNotificationsProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

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

  const getNotificationUrl = (notification: Notification) => {
    if (!notification.relatedId) return "#"
    
    switch (notification.type) {
      case "new_application":
        return `/admin/applications`
      case "new_order":
        return `/admin/orders/${notification.relatedId}`
      case "low_stock":
      case "out_of_stock":
      case "new_product":
        return `/admin/products`
      case "payment_received":
        return `/admin/orders/${notification.relatedId}`
      case "status_change":
        return notification.metadata?.programName ? `/admin/admissions` : `/admin/orders/${notification.relatedId}`
      default:
        return "#"
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab !== "all" && notification.category !== activeTab) return false
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (priorityFilter !== "all" && notification.priority !== priorityFilter) return false
    if (showUnreadOnly && notification.isRead) return false
    return true
  })

  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const category = notification.category
    if (!acc[category]) acc[category] = []
    acc[category].push(notification)
    return acc
  }, {} as Record<string, Notification[]>)

  const getCategoryCount = (category: string) => {
    return notifications.filter(n => 
      category === "all" ? true : n.category === category
    ).filter(n => showUnreadOnly ? !n.isRead : true).length
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id!)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <Settings className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {Object.entries(NotificationPriorities).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Unread
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all" className="text-xs">
              All ({getCategoryCount("all")})
            </TabsTrigger>
            {Object.entries(NotificationCategories).map(([key, config]) => {
              const Icon = categoryIcons[key as keyof typeof categoryIcons]
              const count = getCategoryCount(key)
              return (
                <TabsTrigger key={key} value={key} className="text-xs flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {count > 0 && `(${count})`}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[50vh]">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => (
                    <div key={category} className="space-y-2">
                      {Object.keys(groupedNotifications).length > 1 && (
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mt-4 first:mt-0">
                          {React.createElement(categoryIcons[category as keyof typeof categoryIcons] || Bell, { className: "h-4 w-4" })}
                          {NotificationCategories[category as keyof typeof NotificationCategories]?.label || category}
                        </div>
                      )}
                      {categoryNotifications.map((notification) => (
                        <NotificationItem
                          key={notification._id}
                          notification={notification}
                          onMarkAsRead={handleNotificationClick}
                          getTimeAgo={getTimeAgo}
                          getNotificationUrl={getNotificationUrl}
                          router={router}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {Object.keys(NotificationCategories).map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <ScrollArea className="h-[50vh]">
                {groupedNotifications[category]?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {React.createElement(categoryIcons[category as keyof typeof categoryIcons], { className: "h-8 w-8 mx-auto mb-2 opacity-50" })}
                    <p>No {NotificationCategories[category as keyof typeof NotificationCategories]?.label?.toLowerCase() || category} notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupedNotifications[category]?.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleNotificationClick}
                        getTimeAgo={getTimeAgo}
                        getNotificationUrl={getNotificationUrl}
                        router={router}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (notification: Notification) => void
  getTimeAgo: (date: string) => string
  getNotificationUrl: (notification: Notification) => string
  router: any
}

function NotificationItem({ notification, onMarkAsRead, getTimeAgo, getNotificationUrl, router }: NotificationItemProps) {
  const CategoryIcon = categoryIcons[notification.category as keyof typeof categoryIcons] || Bell
  const PriorityIcon = priorityIcons[notification.priority] || Info
  const priorityConfig = NotificationPriorities[notification.priority] || NotificationPriorities.medium
  const categoryConfig = NotificationCategories[notification.category as keyof typeof NotificationCategories] || { label: "System", color: "gray" }
  const url = getNotificationUrl(notification)

  const content = (
    <div
      className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
        notification.isRead 
          ? "bg-gray-50 border-gray-200" 
          : "bg-white border-blue-200 shadow-sm"
      }`}
      onClick={() => onMarkAsRead(notification)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-full ${categoryConfig.color === 'gray' ? 'bg-gray-100' : `bg-${categoryConfig.color}-100`}`}>
            <CategoryIcon className={`h-4 w-4 ${categoryConfig.color === 'gray' ? 'text-gray-600' : `text-${categoryConfig.color}-600`}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium text-sm ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                {notification.title}
              </h4>
              <Badge className={`${priorityConfig.bgColor} ${priorityConfig.textColor} text-xs`}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {priorityConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Badge variant="outline" className="text-xs">
                  {categoryConfig.label}
                </Badge>
                <span>{getTimeAgo(notification.createdAt.toString())}</span>
              </div>
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-1">
                  {notification.actions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={action.type === "primary" ? "default" : "outline"}
                      className="text-xs h-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(action.url)
                      }}
                    >
                      {action.label}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
          {url !== "#" && (
            <ExternalLink className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  )

  if (url !== "#") {
    return (
      <Link href={url} onClick={() => onMarkAsRead(notification)}>
        {content}
      </Link>
    )
  }

  return content
}