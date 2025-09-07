"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Users, Heart, Calendar, User, Phone, Mail, MapPin, Send, Clock, AlertCircle } from "lucide-react"

interface AdmissionProgram {
  _id: string
  name: string
  description: string
  ageRange: { min: number; max: number }
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
  status: string
  admissionStatus: string
  deadlines: {
    applicationStart?: string
    applicationEnd?: string
    interviewStart?: string
    interviewEnd?: string
    resultAnnouncement?: string
  }
  customFields: {
    id: string
    label: string
    type: string
    required: boolean
    options?: string[]
    placeholder?: string
  }[]
}

interface AdmissionSettings {
  globalStatus: "open" | "closed" | "scheduled"
  welcomeMessage: string
  closedMessage: string
  scheduledMessage: string
  contactInfo: {
    phone: string
    email: string
    address: string
  }
  faqItems: {
    question: string
    answer: string
  }[]
}

export default function AdmissionPage() {
  const [programs, setPrograms] = useState<AdmissionProgram[]>([])
  const [settings, setSettings] = useState<AdmissionSettings | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<AdmissionProgram | null>(null)
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    programId: "",
    fatherName: "",
    fatherId: "",
    fatherPhone: "",
    motherName: "",
    motherId: "",
    motherPhone: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    childName: "",
    childAge: "",
    childGender: "",
    childYear: "",
    dateOfBirth: "",
    // preferredStartDate: "",
    additionalInfo: "",
    customFields: {} as Record<string, any>,
  })

  useEffect(() => {
    fetchAdmissionData()
    // Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchAdmissionData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchAdmissionData = async () => {
    try {
      const response = await fetch("/api/public/admission-programs")
      const data = await response.json()
      setPrograms(data.programs || [])
      setSettings(data.settings)
    } catch (error) {
      console.error("Error fetching admission data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      customFields: { ...prev.customFields, [fieldId]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate required fields
      const requiredFields = [
        "programId",
        "fatherName",
        "fatherId",
        "fatherPhone",
        "motherName",
        "motherId",
        "motherPhone",
        "province",
        "district",
        "sector",
        "cell",
        "village",
        "childName",
        "childAge",
        "childYear",
        "childGender",
        "dateOfBirth",
        // "preferredStartDate",
      ]
      const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

      if (missingFields.length > 0) {
        setError("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      // Validate custom fields
      if (selectedProgram) {
        for (const field of selectedProgram.customFields) {
          if (field.required && !formData.customFields[field.id]) {
            setError(`Please fill in the required field: ${field.label}`)
            setIsSubmitting(false)
            return
          }
        }
      }

      // Submit the application
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          childAge: Number.parseInt(formData.childAge),
          dateOfBirth: new Date(formData.dateOfBirth),
          // preferredStartDate: new Date(formData.preferredStartDate),
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setIsSubmitted(true)
      } else {
        setError(result.error || "Failed to submit application. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openApplicationDialog = (program: AdmissionProgram) => {
    setSelectedProgram(program)
    setFormData((prev) => ({ ...prev, programId: program._id }))
    setIsApplicationDialogOpen(true)
  }

  const renderCustomField = (field: any) => {
    const value = formData.customFields[field.id] || ""

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )
      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
          />
        )
      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleCustomFieldChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        )
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-600"></div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="bg-gray-50 flex items-center justify-center px-4 py-20">
        <Card className="max-w-2xl w-full text-center">
          <CardHeader>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-600 mb-4">Application Submitted Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
              <div className="text-left space-y-2 text-green-700">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>We'll review your application within 2-3 business days</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>You'll receive an email confirmation shortly</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>We may contact you to schedule a visit or interview</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-golden-500 hover:bg-golden-600">
                <a href="/">Return to Home</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show closed/scheduled message if admissions are not open
  if (!settings || settings.globalStatus !== "open" || programs.length === 0) {
    const message =
      settings?.globalStatus === "closed"
        ? settings.closedMessage
        : settings?.globalStatus === "scheduled"
          ? settings.scheduledMessage
          : "Admissions are currently not available."

    return (
      <div className="bg-gray-50">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-yellow-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Admissions Status</h1>
            <p className="text-xl text-gray-600 mb-8">{message}</p>

            {settings && (
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <Card className="text-center">
                  <CardHeader>
                    <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <CardTitle className="text-lg">Call Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">Admissions Office</p>
                    <p className="font-semibold">{settings.contactInfo.phone}</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <CardTitle className="text-lg">Email Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">Admissions Team</p>
                    <p className="font-semibold">{settings.contactInfo.email}</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <CardTitle className="text-lg">Visit Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">Schedule a tour</p>
                    <p className="font-semibold">{settings.contactInfo.address}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-green-100 text-green-800 mb-4">Admissions Open</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Join Our
            <span className="text-blue-600"> Learning Family</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {settings?.welcomeMessage ||
              "Give your child the best start in their educational journey with our nurturing, tech-enhanced learning environment"}
          </p>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Available Programs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect program for your child's educational journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <Card key={program._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{program.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">{program.admissionStatus}</Badge>
                  </div>
                  <p className="text-gray-600">{program.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      <span>
                        Ages {program.ageRange.min}-{program.ageRange.max}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-500" />
                      <span>{program.capacity - program.currentEnrollment} spot(s) left</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Application Fee:</span>
                      <span className="font-semibold">{program.fees.applicationFee} Frw</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tuition Fee:</span>
                      <span className="font-semibold">{program.fees.tuitionFee} Frw</span>
                    </div>
                  </div>

                  {program.deadlines.applicationEnd && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          Application deadline: {new Date(program.deadlines.applicationEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => openApplicationDialog(program)}
                    disabled={program.currentEnrollment >= program.capacity}
                  >
                    {program.currentEnrollment >= program.capacity ? "Program Full" : "Apply Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {settings?.faqItems && settings.faqItems.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-6">
              {settings.faqItems.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Application Dialog */}
      <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {selectedProgram?.name}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Father Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Parent/Guardian Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fatherName">Father's Name *</Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange("fatherName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fatherId">ID Number *</Label>
                  <Input
                    id="fatherId"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{16}"
                    maxLength={16}
                    value={formData.fatherId}
                    onChange={(e) => handleInputChange("fatherId", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fatherPhone">Phone Number *</Label>
                  <Input
                    id="fatherPhone"
                    type="tel"
                    inputMode="numeric"
                    pattern="\+?\d{10,15}"
                    value={formData.fatherPhone}
                    onChange={(e) => handleInputChange("fatherPhone", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Mother Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Mother/Guardian Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="motherName">Mother's Name *</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => handleInputChange("motherName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="motherId">ID Number *</Label>
                  <Input
                    id="motherId"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{16}"
                    maxLength={16}
                    value={formData.motherId}
                    onChange={(e) => handleInputChange("motherId", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="motherphone">Phone Number *</Label>
                  <Input
                    id="motherPhone"
                    type="tel"
                    inputMode="numeric"
                    pattern="\+?\d{10,15}"
                    value={formData.motherPhone}
                    onChange={(e) => handleInputChange("motherPhone", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Address Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">Province *</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleInputChange("province", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sector">Sector *</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => handleInputChange("sector", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cell">Cell *</Label>
                  <Input
                    id="cell"
                    value={formData.cell}
                    onChange={(e) => handleInputChange("cell", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="village">Village *</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => handleInputChange("village", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Child Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                Child Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childName">Child's Full Name *</Label>
                  <Input
                    id="childName"
                    value={formData.childName}
                    onChange={(e) => handleInputChange("childName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="childAge">Child's Age *</Label>
                  <Select value={formData.childAge} onValueChange={(value) => handleInputChange("childAge", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: selectedProgram?.ageRange.max! - selectedProgram?.ageRange.min! + 1 },
                        (_, i) => {
                          const age = selectedProgram?.ageRange.min! + i
                          return (
                            <SelectItem key={age} value={age.toString()}>
                              {age} years old
                            </SelectItem>
                          )
                        },
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="childGender">Gender *</Label>
                  <Select
                    value={formData.childGender}
                    onValueChange={(value) => handleInputChange("childGender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="childYear">Year *</Label>
                  <Select
                    value={formData.childYear}
                    onValueChange={(value) => handleInputChange("childYear", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baby">Baby</SelectItem>
                      <SelectItem value="Middle">Middle</SelectItem>
                      <SelectItem value="Top">Top</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div><br />

            {/* Custom Fields */}
            {selectedProgram?.customFields && selectedProgram.customFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                {selectedProgram.customFields.map((field) => (
                  <div key={field.id}>
                    <Label htmlFor={field.id}>
                      {field.label} {field.required && "*"}
                    </Label>
                    {renderCustomField(field)}
                  </div>
                ))}
              </div>
            )}

            {/* Application Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Application Details
              </h3>
              <div>
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                  rows={4}
                  placeholder="Any special needs, allergies, or additional information..."
                />
              </div>
            </div>

            {/* Requirements Display */}
            {selectedProgram?.requirements && selectedProgram.requirements.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Program Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                  {selectedProgram.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsApplicationDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </div>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
