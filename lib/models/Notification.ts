export interface Notification {
  _id?: string
  type: "new_application" | "new_order" | "low_stock" | "out_of_stock" | "new_product" | "system" | "payment_received" | "status_change" | "new_product_request"
  category: "admissions" | "inventory" | "orders" | "system" | "payments" | "users"
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  updatedAt?: Date
  relatedId?: string
  priority: "low" | "medium" | "high" | "urgent"
  actions?: {
    label: string
    url: string
    type: "primary" | "secondary"
  }[]
  metadata?: {
    productName?: string
    stockLevel?: number
    customerName?: string
    applicantName?: string
    programName?: string
    amount?: number
    oldStatus?: string
    newStatus?: string
  }
}

export const NotificationCategories = {
  admissions: { label: "Admissions", color: "blue", icon: "GraduationCap" },
  inventory: { label: "Inventory", color: "orange", icon: "Package" },
  orders: { label: "Orders", color: "green", icon: "ShoppingCart" },
  system: { label: "System", color: "gray", icon: "Settings" },
  payments: { label: "Payments", color: "emerald", icon: "CreditCard" },
  users: { label: "Users", color: "purple", icon: "Users" }
} as const

export const NotificationPriorities = {
  low: { label: "Low", color: "gray", bgColor: "bg-gray-100", textColor: "text-gray-800" },
  medium: { label: "Medium", color: "blue", bgColor: "bg-blue-100", textColor: "text-blue-800" },
  high: { label: "High", color: "orange", bgColor: "bg-orange-100", textColor: "text-orange-800" },
  urgent: { label: "Urgent", color: "red", bgColor: "bg-red-100", textColor: "text-red-800" }
} as const
