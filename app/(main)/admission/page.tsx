"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, BookOpen, Heart, Calendar, User, Phone, Mail, MapPin, Send } from "lucide-react"

export default function AdmissionPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    // Parent Information
    parentName: "",
    email: "",
    phone: "",
    address: "",

    // Child Information
    childName: "",
    childAge: "",
    childGender: "",
    dateOfBirth: "",

    // Application Details
    preferredStartDate: "",
    additionalInfo: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("") // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate required fields
      const requiredFields = [
        "parentName",
        "email",
        "phone",
        "address",
        "childName",
        "childAge",
        "childGender",
        "dateOfBirth",
        "preferredStartDate",
      ]
      const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

      if (missingFields.length > 0) {
        setError("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address")
        setIsSubmitting(false)
        return
      }

      // Validate age
      const age = Number.parseInt(formData.childAge)
      if (isNaN(age) || age < 2 || age > 6) {
        setError("Child age must be between 2 and 6 years")
        setIsSubmitting(false)
        return
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
          preferredStartDate: new Date(formData.preferredStartDate),
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Application Reference:</strong> We've sent a confirmation email to{" "}
                <strong>{formData.email}</strong> with your application details.
              </p>
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

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-blue-100 text-blue-800 mb-4">Admissions Open</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Join Our
            <span className="text-blue-600"> Learning Family</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Give your child the best start in their educational journey with our nurturing, tech-enhanced learning
            environment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <a href="#application-form">
                <Send className="mr-2 h-5 w-5" />
                Apply Now
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 bg-transparent"
            >
              <a href="/contact">
                <Phone className="mr-2 h-5 w-5" />
                Schedule Visit
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Golden Light School?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a unique blend of traditional nurturing and modern educational technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Small Class Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Maximum 12 students per class ensures individual attention and personalized learning for every child.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-indigo-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Interactive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Smart toys, educational tablets, and hands-on activities make learning engaging and fun for young
                  minds.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Affordable Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Quality education shouldn't break the bank. We offer competitive rates without compromising on care or
                  curriculum.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Application Form</h2>
            <p className="text-xl text-gray-600">
              Please fill out this form to apply for admission to Golden Light School
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <User className="mr-3 h-6 w-6" />
                Admission Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Parent Information */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Parent/Guardian Information
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentName">Full Name *</Label>
                      <Input
                        id="parentName"
                        value={formData.parentName}
                        onChange={(e) => handleInputChange("parentName", e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+250 786 376 459"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Home Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="123 Main Street, City, State"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Child Information */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Heart className="mr-2 h-5 w-5" />
                      Child Information
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="childName">Child's Full Name *</Label>
                      <Input
                        id="childName"
                        value={formData.childName}
                        onChange={(e) => handleInputChange("childName", e.target.value)}
                        placeholder="Enter child's full name"
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
                          <SelectItem value="2">2 years old</SelectItem>
                          <SelectItem value="3">3 years old</SelectItem>
                          <SelectItem value="4">4 years old</SelectItem>
                          <SelectItem value="5">5 years old</SelectItem>
                          <SelectItem value="6">6 years old</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                  </div>
                </div>

                {/* Application Details */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Application Details
                    </h3>
                  </div>

                  <div>
                    <Label htmlFor="preferredStartDate">Preferred Start Date *</Label>
                    <Input
                      id="preferredStartDate"
                      type="date"
                      value={formData.preferredStartDate}
                      onChange={(e) => handleInputChange("preferredStartDate", e.target.value)}
                      min={new Date().toISOString().split("T")[0]} // Prevent past dates
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                    <Textarea
                      id="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                      rows={4}
                      placeholder="Any special needs, allergies, or additional information you'd like us to know about your child..."
                    />
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="mr-2 h-5 w-5" />
                        Submit Application
                      </div>
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>
                    By submitting this form, you agree to our terms and conditions. We'll contact you within 2-3
                    business days.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions About Admission?</h2>
            <p className="text-xl text-gray-600">We're here to help you through the application process</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Admissions Office</p>
                <p className="font-semibold">+1 (555) 123-4568</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Admissions Team</p>
                <p className="font-semibold">admissions@goldenlightschool.com</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Visit Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Schedule a tour</p>
                <p className="font-semibold">123 Education Street</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
