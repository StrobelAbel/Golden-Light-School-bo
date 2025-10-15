export interface Notification {
  _id?: string
  type: "new_application" | "new_order" | "low_stock" | "out_of_stock" | "new_product" | "system" | "payment_received" | "status_change" | "new_product_request"
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  updatedAt?: Date
  relatedId?: string // ID of related application, product, order, etc.
  priority?: "low" | "medium" | "high" | "urgent"
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
