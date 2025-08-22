export interface Product {
  _id?: string
  name: string
  description: string
  price: number
  image: string
  category: "Books" | "Toys" | "Art Supplies" | "Educational Games" | "Electronics" | "Other"
  stock: number
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductFilters {
  category?: string
  search?: string
  isVisible?: boolean
}
