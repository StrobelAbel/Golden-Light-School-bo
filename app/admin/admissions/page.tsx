"use client"

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)
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
  AlertTriangle,
  Settings,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface Application {
  _id: string
  status: "pending" | "under_review" | "approved" | "rejected"
  updatedAt: string
  // Add other application properties as needed
}

export default function AdminAdmissionsPage() {
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [programs, setPrograms] = useState<AdmissionProgram[]>([])
  const [settings, setSettings] = useState<AdmissionSettings | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<AdmissionProgram | null>(null)
  const [activeTab, setActiveTab] = useState("programs")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<AdmissionProgram | null>(null)

  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: string;
    count: number;
  } | null>(null)

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
    fetchApplications()
  }, [])

  useEffect(() => {
    // Filter applications based on some criteria (you can modify this logic)
    setFilteredApplications(applications)
  }, [applications])

  // Add this useEffect for real-time deadline checking
  useEffect(() => {
    const checkDeadlinesInterval = setInterval(() => {
      if (programs.length > 0) {
        const updatedPrograms = programs.map(program => {
          const deadlineStatus = checkProgramDeadlines(program)
          if (deadlineStatus.status !== 'open' && program.admissionStatus === 'open') {
            // Auto-close program if deadline passed
            return { ...program, admissionStatus: 'closed' as const }
          }
          return program
        })

        if (JSON.stringify(updatedPrograms) !== JSON.stringify(programs)) {
          setPrograms(updatedPrograms)
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(checkDeadlinesInterval)
  }, [programs])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/admission-programs?includeInactive=true")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setPrograms(data)
      setErrorMessage("")
    } catch (error) {
      console.error("Error fetching programs:", error)
      setErrorMessage("Failed to fetch programs. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (program: AdmissionProgram) => {
    setProgramToDelete(program)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteCancel = () => {
    setProgramToDelete(null)
    setDeleteConfirmOpen(false)
  }

  const handleDeleteConfirm = async () => {
    if (programToDelete) {
      await handleDeleteProgram(programToDelete._id)
      setProgramToDelete(null)
      setDeleteConfirmOpen(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setApplications(data)
      setErrorMessage("")
    } catch (error) {
      console.error("Error fetching applications:", error)
      setErrorMessage("Failed to fetch applications.")
    }
  }

  // Add this helper function at the top of both files
  const checkProgramDeadlines = (program: AdmissionProgram) => {
    const now = new Date()

    // Check if application period has started
    if (program.deadlines.applicationStart) {
      const startDate = new Date(program.deadlines.applicationStart)
      if (now < startDate) {
        return { status: 'scheduled', message: `Applications open on ${startDate.toLocaleDateString()}` }
      }
    }

    // Check if application deadline has passed
    if (program.deadlines.applicationEnd) {
      const endDate = new Date(program.deadlines.applicationEnd)
      if (now > endDate) {
        return { status: 'closed', message: `Application deadline passed on ${endDate.toLocaleDateString()}` }
      }
    }

    // Check capacity
    if (program.currentEnrollment >= program.capacity) {
      return { status: 'full', message: 'Program is full' }
    }

    return { status: 'open', message: 'Applications are open' }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/admission-settings")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSettings(data)
      setErrorMessage("")
    } catch (error) {
      console.error("Error fetching settings:", error)
      setErrorMessage("Failed to fetch settings.")
    }
  }

  const handleCreateProgram = async () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.description.trim()) {
      setErrorMessage("Program name and description are required.")
      return
    }

    if (formData.ageRange.min >= formData.ageRange.max) {
      setErrorMessage("Minimum age must be less than maximum age.")
      return
    }

    if (formData.capacity <= 0) {
      setErrorMessage("Capacity must be greater than 0.")
      return
    }

    try {
      setLoading(true)
      setErrorMessage("")

      const response = await fetch("/api/admin/admission-programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success !== false) {
        await fetchPrograms()
        setIsCreateDialogOpen(false)
        resetForm()
        setSuccessMessage("Program created successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        throw new Error(result.error || "Failed to create program")
      }
    } catch (error) {
      console.error("Error creating program:", error)
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage("Error creating program. Please try again.")
      }
    } finally {
      setLoading(false)
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
    try {
      const response = await fetch(`/api/admin/admission-programs/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchPrograms()
        setSuccessMessage("Program deleted successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete program")
      }
    } catch (error) {
      console.error("Error deleting program:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete program.")
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

  const confirmBulkAction = (action: string) => {
    setBulkActionDialog({
      open: true,
      action,
      count: selectedApplications.length
    })
  }

  const executeBulkAction = async () => {
    if (bulkActionDialog) {
      await handleBulkStatusUpdate(bulkActionDialog.action)
      setBulkActionDialog(null)
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedApplications.length === 0) return

    try {
      const updatePromises = selectedApplications.map(id =>
        fetch(`/api/applications/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, notes: `Bulk updated to ${status}` }),
        })
      )

      await Promise.all(updatePromises)

      // Update local state
      setApplications((prevApps: Application[]) =>
        prevApps.map((app: Application) =>
          selectedApplications.includes(app._id)
            ? { ...app, status: status as any, updatedAt: new Date().toISOString() }
            : app
        )
      )

      setSelectedApplications([])
      fetchApplications() // Refresh to ensure consistency
    } catch (error) {
      console.error("Error bulk updating applications:", error)
      alert("Error updating applications. Please try again.")
    }
  }

  const handleSelectApplication = (id: string) => {
    setSelectedApplications(prev =>
      prev.includes(id)
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAllApplications = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(filteredApplications.map(app => app._id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{errorMessage}</p>
          </div>
        </div>
      )}

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
                    <div className="flex gap-2 mb-2">
                      <Badge className={getStatusColor(program.status)}>
                        {getStatusIcon(program.status)}
                        <span className="ml-1">{program.status}</span>
                      </Badge>
                      <Badge className={getStatusColor(checkProgramDeadlines(program).status)} variant="outline">
                        {checkProgramDeadlines(program).status}
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
                      onClick={() => handleDeleteClick(program)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>

                  </div>
                </CardContent>
                <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Delete Program
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{programToDelete?.name}"?
                        This action cannot be undone and will permanently remove the program.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={handleDeleteCancel}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteConfirm}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Program
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedApplications.length} application{selectedApplications.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusUpdate('under_review')}
                      className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                    >
                      Mark Under Review
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => confirmBulkAction('approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Bulk Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleBulkStatusUpdate('rejected')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Bulk Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApplications([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={bulkActionDialog?.open || false} onOpenChange={(open) => !open && setBulkActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to {bulkActionDialog?.action} {bulkActionDialog?.count} application{bulkActionDialog?.count !== 1 ? 's' : ''}?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setBulkActionDialog(null)}>
              Cancel
            </Button>
            <Button onClick={executeBulkAction}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    type="datetime-local"
                    value={formData.deadlines.applicationStart ?
                      new Date(formData.deadlines.applicationStart).toISOString().slice(0, 16) : ''}
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
                    type="datetime-local"
                    value={formData.deadlines.applicationEnd ?
                      new Date(formData.deadlines.applicationEnd).toISOString().slice(0, 16) : ''}
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
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newReqs = formData.requirements.filter((_, i) => i !== index)
                        setFormData({ ...formData, requirements: newReqs.length === 0 ? [""] : newReqs })
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
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