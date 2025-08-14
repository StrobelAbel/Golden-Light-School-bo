import type { ObjectId } from "mongodb"

export interface Booking {
  _id?: ObjectId
  appointmentType: "school-tour" | "admission-consultation" | "parent-meeting" | "product-demo"
  date: string
  time: string
  parentName: string
  email: string
  phone: string
  childName?: string
  childAge?: string
  numberOfChildren: string
  specialRequests?: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: Date
  confirmedAt?: Date
  confirmedBy?: string
  notes?: string
}

export const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export const AppointmentTypes = {
  SCHOOL_TOUR: "school-tour",
  ADMISSION_CONSULTATION: "admission-consultation",
  PARENT_MEETING: "parent-meeting",
  PRODUCT_DEMO: "product-demo",
} as const
