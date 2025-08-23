export interface Order {
  _id?: string
  // Product Information
  productId: string
  productName: string
  productPrice: number
  quantity: number

  // Customer Information
  parentName: string
  email: string
  phone: string

  // Order Details
  status: "pending" | "ready_for_pickup" | "completed"
  totalAmount: number
  orderDate: Date

  // Admin Notes
  adminNotes?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface OrderFilters {
  status?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
  productId?: string
}

export interface SalesReport {
  productId: string
  productName: string
  totalQuantitySold: number
  totalRevenue: number
  orderCount: number
}
