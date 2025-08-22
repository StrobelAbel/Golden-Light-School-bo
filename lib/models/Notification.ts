export interface Notification {
  _id?: string
  type: "new_application" | "new_product_request" | "low_stock" | "system"
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  relatedId?: string // ID of related application, product, etc.
}
