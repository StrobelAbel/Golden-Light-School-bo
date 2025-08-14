import type { ObjectId } from "mongodb"

export interface Application {
  _id?: ObjectId
  parentName: string
  email: string
  phone: string
  childName: string
  childAge: string
  childDOB: string
  preferredStartDate: string
  previousSchool?: string
  specialNeeds?: string
  emergencyContact: string
  emergencyPhone: string
  agreedToTerms: boolean
  status: "pending" | "approved" | "rejected" | "review"
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  notes?: string
}

export const ApplicationStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REVIEW: "review",
} as const
