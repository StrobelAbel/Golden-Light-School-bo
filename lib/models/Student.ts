export interface Student {
  _id?: string

  // Basic Information
  studentId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: "Male" | "Female"
  nationality?: string
  religion?: string
  bloodType?: string
  medicalConditions?: string[]
  allergies?: string[]

  // Parent/Guardian Information
  parentName: string
  parentEmail: string
  parentPhone: string
  parentPhoneAlt?: string
  parentOccupation?: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  address: string

  // Imported fields from application
  fatherName?: string
  fatherId?: string
  fatherPhone?: string
  fatherEmail?: string
  motherName?: string
  motherId?: string
  motherPhone?: string
  motherEmail?: string
  province?: string
  district?: string
  sector?: string
  cell?: string
  village?: string
  childGender?: string
  childYear?: string
  childAge?: number

  // Academic Information
  class: string
  level: string
  academicYear: string
  admissionDate: Date
  previousSchool?: string

  // Status Information
  status: "active" | "inactive" | "graduated" | "transferred" | "suspended"
  statusReason?: string
  statusDate?: Date

  // Financial Information
  paymentStatus: "paid" | "not_paid" | "half_paid" | "overdue"
  amountPaid: number
  amountDue: number
  totalFees: number
  paymentHistory: PaymentRecord[]

  // Additional Information
  notes?: string
  behaviorNotes?: string
  achievements?: string[]
  disciplinaryActions?: DisciplinaryRecord[]

  // Application Reference
  applicationId?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface StudentFilters { 
  search?: string 
  class?: string 
  level?: string 
  status?: string 
  academicYear?: string 
  paymentStatus?: string 
  dateFrom?: Date 
  dateTo?: Date 
}

export interface StudentStats { total: number 
  active: number 
  inactive: number 
  graduated: number 
  transferred: number 
  suspended: number 
  byClass: { [key: string]: number } 
  byPaymentStatus: { [key: string]: number } 
  totalRevenue: number 
  outstandingFees: number 
}

export interface PaymentRecord {
  _id?: string
  amount: number
  paymentDate: Date
  paymentMethod: "cash" | "bank_transfer" | "card" | "check" | "other"
  reference?: string
  description: string
  academicTerm: string
  createdBy: string
}

export interface DisciplinaryRecord {
  _id?: string
  date: Date
  type: "warning" | "detention" | "suspension" | "other"
  description: string
  action: string
  createdBy: string
}
