export interface Application {
  _id?: string
  // Parent Information
  parentName: string
  email: string
  phone: string
  address: string

  // Child Information
  childName: string
  childAge: number
  childGender: "Male" | "Female"
  dateOfBirth: Date

  // Application Details
  // preferredStartDate: Date
  additionalInfo?: string
  status: "pending" | "approved" | "rejected" | "under_review"

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface ApplicationFilters {
  status?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}
