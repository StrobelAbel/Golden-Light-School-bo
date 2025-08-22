export interface Admin {
  _id?: string
  username: string
  email: string
  password: string
  role: "admin" | "super_admin"
  createdAt: Date
  lastLogin?: Date
}
