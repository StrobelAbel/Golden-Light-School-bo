"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, MapPin, CheckCircle, Phone, Mail, User } from "lucide-react"

const appointmentTypes = [
  {
    id: "school-tour",
    name: "School Tour",
    description: "Visit our facilities and see classrooms in action",
    duration: "45 minutes",
    icon: MapPin,
  },
  {
    id: "admission-consultation",
    name: "Admission Consultation",
    description: "Discuss enrollment process and requirements",
    duration: "30 minutes",
    icon: Users,
  },
  {
    id: "parent-meeting",
    name: "Parent Meeting",
    description: "Meet with teachers or administration",
    duration: "30 minutes",
    icon: User,
  },
  {
    id: "product-demo",
    name: "Learning Aids Demo",
    description: "See our educational products in action",
    duration: "30 minutes",
    icon: Phone,
  },
]

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
]

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    appointmentType: "",
    date: "",
    time: "",
    parentName: "",
    email: "",
    phone: "",
    childName: "",
    childAge: "",
    numberOfChildren: "1",
    specialRequests: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const selectedAppointment = appointmentTypes.find((type) => type.id === formData.appointmentType)

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-cyan-600" />
            </div>
            <CardTitle className="text-2xl text-cyan-600">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your appointment has been scheduled successfully. We'll send you a confirmation email with all the details
              shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">Appointment Details:</h4>
              <p className="text-sm text-gray-600">
                <strong>Type:</strong> {selectedAppointment?.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {formData.date}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Time:</strong> {formData.time}
              </p>
            </div>
            <Button asChild className="w-full bg-golden-500 hover:bg-golden-600">
              <a href="/">Return to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-50 via-golden-50 to-cyan-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Book an
            <span className="text-cyan-600"> Appointment</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Schedule a visit, tour our facilities, or meet with our team. We're here to help you discover what makes
            Golden Light School special.
          </p>
          <Badge className="bg-cyan-100 text-cyan-800 text-lg px-4 py-2">Available Monday - Friday, 9 AM - 5 PM</Badge>
        </div>
      </section>

      {/* Booking Steps */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? "text-cyan-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? "bg-cyan-600 text-white" : "bg-gray-200"
                  }`}
                >
                  1
                </div>
                <span className="ml-2 font-medium">Select Service</span>
              </div>
              <div className={`w-8 h-0.5 ${step >= 2 ? "bg-cyan-600" : "bg-gray-200"}`} />
              <div className={`flex items-center ${step >= 2 ? "text-cyan-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? "bg-cyan-600 text-white" : "bg-gray-200"
                  }`}
                >
                  2
                </div>
                <span className="ml-2 font-medium">Choose Date & Time</span>
              </div>
              <div className={`w-8 h-0.5 ${step >= 3 ? "bg-cyan-600" : "bg-gray-200"}`} />
              <div className={`flex items-center ${step >= 3 ? "text-cyan-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 3 ? "bg-cyan-600 text-white" : "bg-gray-200"
                  }`}
                >
                  3
                </div>
                <span className="ml-2 font-medium">Your Details</span>
              </div>
            </div>
          </div>

          {/* Step 1: Select Appointment Type */}
          {step === 1 && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What would you like to book?</h2>
                <p className="text-gray-600">Choose the type of appointment that best fits your needs</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {appointmentTypes.map((type) => {
                  const IconComponent = type.icon
                  return (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        formData.appointmentType === type.id
                          ? "border-2 border-cyan-500 bg-cyan-50"
                          : "border-2 border-gray-200 hover:border-cyan-300"
                      }`}
                      onClick={() => handleInputChange("appointmentType", type.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-cyan-600" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{type.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{type.duration}</span>
                            </div>
                          </div>
                          {formData.appointmentType === type.id && <CheckCircle className="h-6 w-6 text-cyan-600" />}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{type.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="text-center mt-8">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.appointmentType}
                  className="bg-cyan-600 hover:bg-cyan-700"
                  size="lg"
                >
                  Continue to Date & Time
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Date and Time */}
          {step === 2 && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Date & Time</h2>
                <p className="text-gray-600">Select your preferred date and time slot</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-cyan-600" />
                      Select Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-cyan-600" />
                      Select Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={formData.time === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleInputChange("time", time)}
                          className={
                            formData.time === time
                              ? "bg-cyan-600 hover:bg-cyan-700"
                              : "border-gray-300 hover:border-cyan-300 bg-transparent"
                          }
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {formData.date && formData.time && (
                <Card className="mt-8 bg-cyan-50 border-cyan-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Selected Appointment</h4>
                        <p className="text-gray-600">
                          {selectedAppointment?.name} on {formData.date} at {formData.time}
                        </p>
                      </div>
                      <Badge className="bg-cyan-100 text-cyan-800">{selectedAppointment?.duration}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(1)} className="bg-transparent">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.date || !formData.time}
                  className="bg-cyan-600 hover:bg-cyan-700"
                  size="lg"
                >
                  Continue to Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {step === 3 && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Information</h2>
                <p className="text-gray-600">Please provide your contact details to complete the booking</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                        <Input
                          id="parentName"
                          value={formData.parentName}
                          onChange={(e) => handleInputChange("parentName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Child Information (Optional)</CardTitle>
                    <CardDescription>Help us prepare for your visit</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="childName">Child's Name</Label>
                        <Input
                          id="childName"
                          value={formData.childName}
                          onChange={(e) => handleInputChange("childName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="childAge">Child's Age</Label>
                        <Select
                          value={formData.childAge}
                          onValueChange={(value) => handleInputChange("childAge", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select age" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under-2">Under 2 years</SelectItem>
                            <SelectItem value="2">2 years old</SelectItem>
                            <SelectItem value="3">3 years old</SelectItem>
                            <SelectItem value="4">4 years old</SelectItem>
                            <SelectItem value="5">5 years old</SelectItem>
                            <SelectItem value="over-5">Over 5 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberOfChildren">Number of Children</Label>
                      <Select
                        value={formData.numberOfChildren}
                        onValueChange={(value) => handleInputChange("numberOfChildren", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 child</SelectItem>
                          <SelectItem value="2">2 children</SelectItem>
                          <SelectItem value="3">3 children</SelectItem>
                          <SelectItem value="4+">4+ children</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Special Requests</CardTitle>
                    <CardDescription>Any specific questions or requirements?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                      placeholder="Please let us know if you have any specific questions, accessibility needs, or other requirements..."
                      rows={4}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="bg-transparent">
                    Back
                  </Button>
                  <Button type="submit" className="bg-golden-500 hover:bg-golden-600" size="lg">
                    Confirm Booking
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Booking?</h2>
            <p className="text-gray-600">Our team is here to assist you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-cyan-600" />
                </div>
                <CardTitle className="text-lg">Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-500">Monday - Friday, 9 AM - 5 PM</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-golden-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-golden-600" />
                </div>
                <CardTitle className="text-lg">Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">info@goldenlightschool.com</p>
                <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Visit Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">123 Education Street</p>
                <p className="text-sm text-gray-500">Learning City, LC 12345</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
