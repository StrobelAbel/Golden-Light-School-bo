"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

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
  status: "active" | "inactive" | "full"
  admissionStatus: "open" | "closed" | "scheduled"
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
  createdAt: string
  updatedAt: string
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
  socialMedia: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
  faqItems: {
    question: string
    answer: string
  }[]
}

export default function AdminAdmissionsPage() {
  const [programs, setPrograms] = useState<AdmissionProgram[]>([])
  const [settings, setSettings] = useState<AdmissionSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<AdmissionProgram | null>(null)
  const [activeTab, setActiveTab] = useState("programs")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ageRange: { min: 2, max: 6 },
    capacity: 20,
    fees: {
      applicationFee: 0,
      tuitionFee: 0,
      registrationFee: 0,
      otherFees: [] as { name: string; amount: number }[],
    },
    requirements: [""],
    documents: [""],
    status: "active" as "active" | "inactive" | "full",
    admissionStatus: "open" as "open" | "closed" | "scheduled",
    deadlines: {
      applicationStart: "",
      applicationEnd: "",
      interviewStart: "",
      interviewEnd: "",
      resultAnnouncement: "",
    },
    customFields: [] as any[],
  })

  useEffect(() => {
    fetchPrograms()
    fetchSettings()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/admin/admission-programs?includeInactive=true")
      const data = await response.json()
      setPrograms(data)
    } catch (error) {
      console.error("Error fetching programs:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/admission-settings")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProgram = async () => {
    try {
      const response = await fetch("/api/admin/admission-programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchPrograms()
        setIsCreateDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error creating program:", error)
    }
  }

  const handleUpdateProgram = async () => {
    if (!selectedProgram) return

    try {
      const response = await fetch(`/api/admin/admission-programs/${selectedProgram._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchPrograms()
        setIsEditDialogOpen(false)
        setSelectedProgram(null)
        resetForm()
      }
    } catch (error) {
      console.error("Error updating program:", error)
    }
  }

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return

    try {
      const response = await fetch(`/api/admin/admission-programs/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchPrograms()
      }
    } catch (error) {
      console.error("Error deleting program:", error)
    }
  }

  const handleUpdateSettings = async (newSettings: AdmissionSettings) => {
    try {
      const response = await fetch("/api/admin/admission-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      })

      if (response.ok) {
        setSettings(newSettings)
        setIsSettingsDialogOpen(false)
      }
    } catch (error) {
      console.error("Error updating settings:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      ageRange: { min: 2, max: 6 },
      capacity: 20,
      fees: {
        applicationFee: 0,
        tuitionFee: 0,
        registrationFee: 0,
        otherFees: [],
      },
      requirements: [""],
      documents: [""],
      status: "active",
      admissionStatus: "open",
      deadlines: {
        applicationStart: "",
        applicationEnd: "",
        interviewStart: "",
        interviewEnd: "",
        resultAnnouncement: "",
      },
      customFields: [],
    })
  }

  const openEditDialog = (program: AdmissionProgram) => {
    setSelectedProgram(program)
    setFormData({
      name: program.name,
      description: program.description,
      ageRange: program.ageRange,
      capacity: program.capacity,
      fees: program.fees,
      requirements: program.requirements,
      documents: program.documents,
      status: program.status,
      admissionStatus: program.admissionStatus,
      deadlines: {
        applicationStart: program.deadlines.applicationStart ?? "",
        applicationEnd: program.deadlines.applicationEnd ?? "",
        interviewStart: program.deadlines.interviewStart ?? "",
        interviewEnd: program.deadlines.interviewEnd ?? "",
        resultAnnouncement: program.deadlines.resultAnnouncement ?? "",
      },
      customFields: program.customFields,
    })
    setIsEditDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-red-100 text-red-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "full":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "closed":
      case "inactive":
        return <XCircle className="h-4 w-4" />
      case "scheduled":
        return <Clock className="h-4 w-4" />
      case "full":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admission Management</h1>
          <p className="text-gray-600">Manage admission programs, settings, and applications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsSettingsDialogOpen(true)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Program
          </Button>
        </div>
      </div>

      {/* Global Status Card */}
      {settings && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(settings.globalStatus)}
                  <span className="font-medium">Global Admission Status:</span>
                </div>
                <Badge className={getStatusColor(settings.globalStatus)}>{settings.globalStatus.toUpperCase()}</Badge>
              </div>
              <Button onClick={() => setIsSettingsDialogOpen(true)} variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-6">
          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card key={program._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{program.name}</CardTitle>
                    <div className="flex gap-1">
                      <Badge className={getStatusColor(program.status)}>
                        {getStatusIcon(program.status)}
                        <span className="ml-1">{program.status}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(program.admissionStatus)} variant="outline">
                      {program.admissionStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{program.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      <span>
                        {program.currentEnrollment}/{program.capacity}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-500" />
                      <span>
                        {program.ageRange.min}-{program.ageRange.max} years
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>{program.fees.tuitionFee} Frw</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-purple-500" />
                      <span>{program.requirements.length} requirements</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="font-semibold text-gray-800">Deadlines:</div>
                    <ul className="ml-2 list-disc">
                      {program.deadlines.applicationStart && (
                        <li>
                          <span className="font-medium">Application Start:</span>{" "}
                          {new Date(program.deadlines.applicationStart).toLocaleDateString()}
                        </li>
                      )}
                      {program.deadlines.applicationEnd && (
                        <li>
                          <span className="font-medium">Application End:</span>{" "}
                          {new Date(program.deadlines.applicationEnd).toLocaleDateString()}
                        </li>
                      )}
                      {program.deadlines.interviewStart && (
                        <li>
                          <span className="font-medium">Interview Start:</span>{" "}
                          {new Date(program.deadlines.interviewStart).toLocaleDateString()}
                        </li>
                      )}
                      {program.deadlines.interviewEnd && (
                        <li>
                          <span className="font-medium">Interview End:</span>{" "}
                          {new Date(program.deadlines.interviewEnd).toLocaleDateString()}
                        </li>
                      )}
                      {program.deadlines.resultAnnouncement && (
                        <li>
                          <span className="font-medium">Result Announcement:</span>{" "}
                          {new Date(program.deadlines.resultAnnouncement).toLocaleDateString()}
                        </li>
                      )}
                      {/* If no deadlines, show a fallback */}
                      {!program.deadlines.applicationStart &&
                        !program.deadlines.applicationEnd &&
                        !program.deadlines.interviewStart &&
                        !program.deadlines.interviewEnd &&
                        !program.deadlines.resultAnnouncement && (
                          <li className="text-gray-500">No deadlines set</li>
                        )}
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(program)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProgram(program._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {programs.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Programs Yet</h3>
                <p className="text-gray-600 mb-4">Create your first admission program to get started</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Program
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Applications Management</h3>
              <p className="text-gray-600 mb-4">View and manage all admission applications</p>
              <Button asChild>
                <a href="/admin/applications">
                  <Eye className="h-4 w-4 mr-2" />
                  View Applications
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Total Enrollment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{programs.reduce((sum, p) => sum + p.currentEnrollment, 0)}</div>
                <p className="text-sm text-gray-600">of {programs.reduce((sum, p) => sum + p.capacity, 0)} capacity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Active Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{programs.filter((p) => p.status === "active").length}</div>
                <p className="text-sm text-gray-600">of {programs.length} total programs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Revenue Potential
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {programs.reduce((sum, p) => sum + p.fees.tuitionFee * p.currentEnrollment, 0).toLocaleString()} Frw
                </div>
                <p className="text-sm text-gray-600">Current enrollment</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Program Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setIsEditDialogOpen(false)
            setSelectedProgram(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreateDialogOpen ? "Create New Program" : "Edit Program"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Program Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Nursery Program"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the program..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minAge">Minimum Age</Label>
                  <Input
                    id="minAge"
                    type="number"
                    value={formData.ageRange.min}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ageRange: { ...formData.ageRange, min: Number.parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxAge">Maximum Age</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    value={formData.ageRange.max}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ageRange: { ...formData.ageRange, max: Number.parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive" | "full") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Fees */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fees Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="applicationFee">Application Fee (Frw)</Label>
                  <Input
                    id="applicationFee"
                    type="number"
                    value={formData.fees.applicationFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fees: { ...formData.fees, applicationFee: Number.parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tuitionFee">Tuition Fee (Frw)</Label>
                  <Input
                    id="tuitionFee"
                    type="number"
                    value={formData.fees.tuitionFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fees: { ...formData.fees, tuitionFee: Number.parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="registrationFee">Registration Fee (Frw)</Label>
                  <Input
                    id="registrationFee"
                    type="number"
                    value={formData.fees.registrationFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fees: { ...formData.fees, registrationFee: Number.parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Admission Status and Deadlines */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Admission Timeline</h3>
              <div>
                <Label htmlFor="admissionStatus">Admission Status</Label>
                <Select
                  value={formData.admissionStatus}
                  onValueChange={(value: "open" | "closed" | "scheduled") =>
                    setFormData({ ...formData, admissionStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="applicationStart">Application Start Date</Label>
                  <Input
                    id="applicationStart"
                    type="date"
                    value={formData.deadlines.applicationStart}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deadlines: { ...formData.deadlines, applicationStart: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="applicationEnd">Application End Date</Label>
                  <Input
                    id="applicationEnd"
                    type="date"
                    value={formData.deadlines.applicationEnd}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deadlines: { ...formData.deadlines, applicationEnd: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Requirements</h3>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={req}
                    onChange={(e) => {
                      const newReqs = [...formData.requirements]
                      newReqs[index] = e.target.value
                      setFormData({ ...formData, requirements: newReqs })
                    }}
                    placeholder="Enter requirement..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newReqs = formData.requirements.filter((_, i) => i !== index)
                      setFormData({ ...formData, requirements: newReqs })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    ...formData,
                    requirements: [...formData.requirements, ""],
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setIsEditDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={isCreateDialogOpen ? handleCreateProgram : handleUpdateProgram}>
                {isCreateDialogOpen ? "Create Program" : "Update Program"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Admission Settings</DialogTitle>
          </DialogHeader>

          {settings && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="globalStatus">Global Admission Status</Label>
                <Select
                  value={settings.globalStatus}
                  onValueChange={(value: "open" | "closed" | "scheduled") =>
                    setSettings({ ...settings, globalStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="closedMessage">Closed Message</Label>
                <Textarea
                  id="closedMessage"
                  value={settings.closedMessage}
                  onChange={(e) => setSettings({ ...settings, closedMessage: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateSettings(settings)}>Save Settings</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
