export interface AdmissionSettings {
  _id?: string
  globalStatus: "open" | "closed" | "scheduled"
  welcomeMessage: string
  closedMessage: string
  scheduledMessage: string
  contactInfo: {
    phone: string
    email: string
    address: string
  }
  socialMedia: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
  faqItems: {
    question: string
    answer: string
  }[]
  updatedAt: Date
  updatedBy: string
}
