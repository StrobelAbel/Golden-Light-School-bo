export interface AdmissionProgram {
  _id?: string
  name: string
  description: string
  academicYear: string
  ageRange: {
    min: number
    max: number
  }
  capacity: number
  currentEnrollment: number
  fees: {
    applicationFee: number
    tuitionFee: number
    registrationFee: number
    otherFees: { name: string; amount: number }[]
  }
  requirements: string[]
  documents: string[]
  status: "active" | "inactive" | "full"
  admissionStatus: "open" | "closed" | "scheduled"
  deadlines: {
    applicationStart?: Date
    applicationEnd?: Date
    interviewStart?: Date
    interviewEnd?: Date
    resultAnnouncement?: Date
  }
  customFields: {
    id: string
    label: string
    type: "text" | "textarea" | "select" | "checkbox" | "radio" | "date" | "number"
    required: boolean
    options?: string[]
    placeholder?: string
  }[]
  createdAt: Date
  updatedAt: Date
}
