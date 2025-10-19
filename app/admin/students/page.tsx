"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  User,
  History,
  GraduationCap,
  Wallet,
  CreditCard,
  UserPlus,
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Edit,
  StickyNote,
  Upload,
  DollarSign,
  AlertTriangle,
  MapPin,
  TrendingUp,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Student, StudentStats } from "@/lib/models/Student"
import { useTranslation } from "@/hooks/useTranslation"

interface StudentsResponse {
  students: Student[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: StudentStats
}

export default function StudentsPage() {
  const { t } = useTranslation()
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    class: "all",
    level: "all",
    status: "all",
    academicYear: "all",
    paymentStatus: "all",
  })

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Student>>({})
  const [addFormData, setAddFormData] = useState<Partial<Student>>({
    studentId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    gender: "Male",
    childAge: 0,
    fatherName: "",
    fatherId: "",
    fatherPhone: "",
    fatherEmail: "",
    motherName: "",
    motherId: "",
    motherPhone: "",
    motherEmail: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    address: "",
    level: "",
    academicYear: "",
    admissionDate: new Date(),
    previousSchool: "",
    status: "active",
    paymentStatus: "not_paid",
    amountPaid: 0,
    amountDue: 0,
    totalFees: 0,
    paymentHistory: [],
    notes: "",
  })
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    paymentMethod: "cash",
    reference: "",
    description: "",
    academicTerm: "",
  })

  const classes = ["Baby", "Middle", "Top"]
  const levels = ["Age 2", "Age 3", "Age 4", "Age 5", "Age 6"]
  const statuses = ["active", "inactive", "graduated", "transferred", "suspended"]
  const paymentStatuses = ["paid", "not_paid", "half_paid", "overdue"]
  const [currentAcademicYear, setCurrentAcademicYear] = useState("")
  const [academicYears, setAcademicYears] = useState<any[]>([])
  
  const fetchAcademicYears = async () => {
    try {
      const response = await fetch("/api/admin/academic-years")
      if (response.ok) {
        const data = await response.json()
        setAcademicYears(data)
        
        // Set current academic year to the active one or the first one
        const activeYear = data.find((year: any) => year.isActive)
        if (activeYear) {
          setCurrentAcademicYear(activeYear.year)
        } else if (data.length > 0) {
          setCurrentAcademicYear(data[0].year)
        }
      }
    } catch (error) {
      console.error("Error fetching academic years:", error)
    }
  }

  // Add this helper function at the top of the component, after the state declarations
  const handleDialogClose = (setter: (value: boolean) => void) => {
    return (open: boolean) => {
      setter(open)
      if (!open) {
        // Ensure pointer-events are restored when closing
        setTimeout(() => {
          document.body.style.pointerEvents = ""
        }, 100)
      }
    }
  }

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filters.class && filters.class !== "all" && { class: filters.class }),
        ...(filters.level && filters.level !== "all" && { level: filters.level }),
        ...(filters.status && filters.status !== "all" && { status: filters.status }),
        ...(filters.academicYear && filters.academicYear !== "all" && { academicYear: filters.academicYear }),
        ...(filters.paymentStatus && filters.paymentStatus !== "all" && { paymentStatus: filters.paymentStatus }),
      })

      const response = await fetch(`/api/admin/students?${queryParams}`)
      if (response.ok) {
        const data: StudentsResponse = await response.json()
        setStudents(data.students)
        setPagination(data.pagination)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchTerm, filters])

  useEffect(() => {
    fetchAcademicYears()
  }, [])
  
  useEffect(() => {
    if (currentAcademicYear) {
      fetchStudents()
    }
  }, [fetchStudents, currentAcademicYear])

  const handleStatusChange = async (studentId: string, newStatus: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          statusReason: reason,
          statusDate: new Date(),
        }),
      })

      if (response.ok) {
        fetchStudents()
        toast({
          title: "Success",
          description: "Student status updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update student status",
        variant: "destructive",
      })
    }
  }

  const handleAddStudent = async () => {
    try {
      // Generate student ID if not provided
      const studentId = addFormData.studentId || `STU${Date.now()}`

      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addFormData,
          studentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      })

      if (response.ok) {
        fetchStudents()
        setIsAddDialogOpen(false)
        setAddFormData({
          studentId: "",
          firstName: "",
          lastName: "",
          dateOfBirth: new Date(),
          gender: "Male",
          childAge: 0,
          fatherName: "",
          fatherId: "",
          fatherPhone: "",
          fatherEmail: "",
          motherName: "",
          motherId: "",
          motherPhone: "",
          motherEmail: "",
          province: "",
          district: "",
          sector: "",
          cell: "",
          village: "",
          address: "",
          level: "",
          academicYear: currentAcademicYear,
          admissionDate: new Date(),
          previousSchool: "",
          status: "active",
          paymentStatus: "not_paid",
          amountPaid: 0,
          amountDue: 0,
          totalFees: 0,
          paymentHistory: [],
          notes: "",
        })
        toast({
          title: "Success",
          description: "Student added successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to add student",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding student:", error)
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      })
    }
  }

  const handleEditStudent = async () => {
    if (!selectedStudent || !editFormData._id) return

    try {
      const { _id, ...updateData } = editFormData
      const response = await fetch(`/api/admin/students/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updateData,
          updatedAt: new Date(),
        }),
      })

      if (response.ok) {
        fetchStudents()
        setIsEditDialogOpen(false)
        setSelectedStudent(null)
        setEditFormData({})
        toast({
          title: "Success",
          description: "Student updated successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to update student",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating student:", error)
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      })
    }
  }

  const handleAddPayment = async () => {
    if (!selectedStudent || !paymentFormData.amount) return

    try {
      const response = await fetch(`/api/admin/students/${selectedStudent._id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentFormData,
          amount: Number.parseFloat(paymentFormData.amount),
        }),
      })

      if (response.ok) {
        fetchStudents()
        setIsPaymentDialogOpen(false)
        setSelectedStudent(null)
        setPaymentFormData({
          amount: "",
          paymentMethod: "cash",
          reference: "",
          description: "",
          academicTerm: "",
        })
        toast({
          title: "Success",
          description: "Payment added successfully",
        })
      }
    } catch (error) {
      console.error("Error adding payment:", error)
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive",
      })
    }
  }

  const handleImportApproved = async () => {
    try {
      const response = await fetch("/api/admin/students/import-approved", {
        method: "POST",
      })

      if (response.ok) {
        const result = await response.json()
        fetchStudents()
        toast({
          title: "Success",
          description: `${result.count} students imported successfully`,
        })
      }
    } catch (error) {
      console.error("Error importing students:", error)
      toast({
        title: "Error",
        description: "Failed to import approved applications",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "graduated":
        return "outline"
      case "transferred":
        return "secondary"
      case "suspended":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "half_paid":
        return "secondary"
      case "not_paid":
        return "destructive"
      case "overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const clearFilters = () => {
    setFilters({
      class: "all",
      level: "all",
      status: "all",
      academicYear: "all",
      paymentStatus: "all",
    })
    setSearchTerm("")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("Students Management")}</h1>
          <p className="text-muted-foreground">{t("Manage student records, payments, and academic information")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleImportApproved} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {t("Import Approved")}
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t("Add Student")}
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose(setIsAddDialogOpen)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("Add New Student")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">{t("Basic Info")}</TabsTrigger>
                    <TabsTrigger value="academic">{t("Academic")}</TabsTrigger>
                    <TabsTrigger value="financial">{t("Financial")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    {/* Student Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="mr-2 h-5 w-5 text-blue-600" />
                          {t("Student Information")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="studentId">{t("Student ID")}</Label>
                          <Input
                            id="studentId"
                            value={addFormData.studentId || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, studentId: e.target.value }))}
                            placeholder={t("Leave empty for auto-generation")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t("First Name")} *</Label>
                          <Input
                            id="firstName"
                            value={addFormData.firstName || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                            placeholder={t("Enter first name")}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t("Last Name")} *</Label>
                          <Input
                            id="lastName"
                            value={addFormData.lastName || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                            placeholder={t("Enter last name")}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">{t("Date of Birth")} *</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={
                              addFormData.dateOfBirth
                                ? new Date(addFormData.dateOfBirth).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) => {
                              const dob = new Date(e.target.value)

                              // Function to calculate age
                              const calculateAge = (dateOfBirth: Date) => {
                                const today = new Date()
                                let age = today.getFullYear() - dateOfBirth.getFullYear()
                                const m = today.getMonth() - dateOfBirth.getMonth()
                                if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
                                  age--
                                }
                                return age
                              }

                              setAddFormData((prev) => ({
                                ...prev,
                                dateOfBirth: dob,
                                childAge: calculateAge(dob),
                              }))
                            }}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">{t("Gender")} *</Label>
                          <Select
                            value={addFormData.gender || "Male"}
                            onValueChange={(value) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                gender: value as "Male" | "Female",
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">{t("Male")}</SelectItem>
                              <SelectItem value="Female">{t("Female")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="childAge">{t("Age")} *</Label>
                          <Input
                            id="childAge"
                            type="number"
                            value={addFormData.childAge || ""}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                childAge: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                            placeholder={t("Enter age")}
                            required
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Father Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="mr-2 h-5 w-5 text-green-600" />
                          {t("Father Information")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fatherName">{t("Father Name")}</Label>
                          <Input
                            id="fatherName"
                            value={addFormData.fatherName || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, fatherName: e.target.value }))}
                            placeholder={t("Enter father name")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatherId">{t("Father ID")}</Label>
                          <Input
                            id="fatherId"
                            value={addFormData.fatherId || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, fatherId: e.target.value }))}
                            placeholder={t("Enter father ID")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatherPhone">{t("Father Phone")}</Label>
                          <Input
                            id="fatherPhone"
                            value={addFormData.fatherPhone || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, fatherPhone: e.target.value }))}
                            placeholder={t("Enter father phone")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatherEmail">{t("Father Email")}</Label>
                          <Input
                            id="fatherEmail"
                            type="email"
                            value={addFormData.fatherEmail || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, fatherEmail: e.target.value }))}
                            placeholder={t("Enter father email")}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Mother Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="mr-2 h-5 w-5 text-pink-600" />
                          {t("Mother Information")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="motherName">{t("Mother Name")}</Label>
                          <Input
                            id="motherName"
                            value={addFormData.motherName || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, motherName: e.target.value }))}
                            placeholder={t("Enter mother name")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherId">{t("Mother ID")}</Label>
                          <Input
                            id="motherId"
                            value={addFormData.motherId || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, motherId: e.target.value }))}
                            placeholder={t("Enter mother ID")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherPhone">{t("Mother Phone")}</Label>
                          <Input
                            id="motherPhone"
                            value={addFormData.motherPhone || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, motherPhone: e.target.value }))}
                            placeholder={t("Enter mother phone")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherEmail">{t("Mother Email")}</Label>
                          <Input
                            id="motherEmail"
                            type="email"
                            value={addFormData.motherEmail || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, motherEmail: e.target.value }))}
                            placeholder={t("Enter mother email")}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Location Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                          {t("Location Information")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="province">{t("Province")}</Label>
                          <Input
                            id="province"
                            value={addFormData.province || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, province: e.target.value }))}
                            placeholder={t("Enter province")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="district">{t("District")}</Label>
                          <Input
                            id="district"
                            value={addFormData.district || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, district: e.target.value }))}
                            placeholder={t("Enter district")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sector">{t("Sector")}</Label>
                          <Input
                            id="sector"
                            value={addFormData.sector || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, sector: e.target.value }))}
                            placeholder={t("Enter sector")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cell">{t("Cell")}</Label>
                          <Input
                            id="cell"
                            value={addFormData.cell || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, cell: e.target.value }))}
                            placeholder={t("Enter cell")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="village">{t("Village")}</Label>
                          <Input
                            id="village"
                            value={addFormData.village || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, village: e.target.value }))}
                            placeholder={t("Enter village")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">{t("Additional Address Info")}</Label>
                          <Textarea
                            id="address"
                            value={addFormData.address || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, address: e.target.value }))}
                            placeholder={t("Enter additional address information")}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="academic" className="space-y-6">
                    {/* Academic Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <GraduationCap className="mr-2 h-5 w-5 text-indigo-600" />
                          {t("Academic Information")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="level">{t("Level")} *</Label>
                          <Select
                            value={addFormData.class || ""}
                            onValueChange={(value) => setAddFormData((prev) => ({ ...prev, class: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select level")} />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls} value={cls}>
                                  {cls}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="academicYear">{t("Academic Year")} *</Label>
                          <Select
                            value={addFormData.academicYear || ""}
                            onValueChange={(value) => setAddFormData((prev) => ({ ...prev, academicYear: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {academicYears.map((year) => (
                                <SelectItem key={year._id} value={year.year}>
                                  {year.year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admissionDate">{t("Admission Date")} *</Label>
                          <Input
                            id="admissionDate"
                            type="date"
                            value={
                              addFormData.admissionDate
                                ? new Date(addFormData.admissionDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                admissionDate: new Date(e.target.value),
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">{t("Status")} *</Label>
                          <Select
                            value={addFormData.status || "active"}
                            onValueChange={(value) => setAddFormData((prev) => ({ ...prev, status: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="previousSchool">{t("Previous School")}</Label>
                          <Input
                            id="previousSchool"
                            value={addFormData.previousSchool || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, previousSchool: e.target.value }))}
                            placeholder={t("Enter previous school (if any)")}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <StickyNote className="mr-2 h-5 w-5 text-yellow-600" />
                          {t("Additional Notes")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label htmlFor="notes">{t("Notes")}</Label>
                          <Textarea
                            id="notes"
                            value={addFormData.notes || ""}
                            onChange={(e) => setAddFormData((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder={t("Enter any additional notes about the student")}
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="financial" className="space-y-6">
                    {/* Financial Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                          {t("Financial Information")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalFees">{t("Total Fees")} ({t("Rwf")}) *</Label>
                          <Input
                            id="totalFees"
                            type="number"
                            value={addFormData.totalFees || ""}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                totalFees: Number.parseFloat(e.target.value) || 0,
                                amountDue: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder={t("Enter total fees")}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amountPaid">{t("Amount Paid")} ({t("Rwf")})</Label>
                          <Input
                            id="amountPaid"
                            type="number"
                            value={addFormData.amountPaid || ""}
                            onChange={(e) => {
                              const paid = Number.parseFloat(e.target.value) || 0
                              const total = addFormData.totalFees || 0
                              setAddFormData((prev) => ({
                                ...prev,
                                amountPaid: paid,
                                amountDue: total - paid,
                                paymentStatus: paid === 0 ? "not_paid" : paid === total ? "paid" : "half_paid",
                              }))
                            }}
                            placeholder={t("Enter amount paid")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentStatus">{t("Payment Status")}</Label>
                          <Select
                            value={addFormData.paymentStatus || "not_paid"}
                            onValueChange={(value) =>
                              setAddFormData((prev) => ({ ...prev, paymentStatus: value as any }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t("Amount Due")} ({t("Rwf")})</Label>
                          <Input value={addFormData.amountDue || 0} disabled className="bg-muted" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    {t("Cancel")}
                  </Button>
                  <Button
                    onClick={handleAddStudent}
                    className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700"
                  >
                    {t("Add Student")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">{t("Total Students")}</CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-blue-100">
                {stats.active} {t("Active Students")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">{t("Total Revenue")}</CardTitle>
              <DollarSign className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t("Rwf")} {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-100">{t("This Academic Year")}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">{t("Outstanding Fees")}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t("Rwf")} {stats.outstandingFees.toLocaleString()}</div>
              <p className="text-xs text-red-100">{t("Pending Payments")}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-golden-500 to-golden-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-golden-100">{t("Payment Rate")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-golden-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(((stats.byPaymentStatus.paid || 0) / stats.total) * 100)}%
              </div>
              <p className="text-xs text-golden-100">{t("Fully Paid Students")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("Search & Filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search students...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.class} onValueChange={(value) => setFilters((prev) => ({ ...prev, class: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select Class")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Classes")}</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Statuses")}</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.academicYear}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, academicYear: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Academic Year")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Years")}</SelectItem>
                {academicYears.map((year) => (
                  <SelectItem key={year._id} value={year.year}>
                    {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Payment Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Payment Status")}</SelectItem>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              {t("Clear Filters")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Students List")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Student")}</TableHead>
                  <TableHead>{t("Level")}</TableHead>
                  <TableHead>{t("Gender")}</TableHead>
                  {/* <TableHead>Parent</TableHead> */}
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead>{t("Payment")}</TableHead>
                  {/* <TableHead>Admission Date</TableHead> */}
                  <TableHead>{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-600"></div>
                        {/* <span>Loading students...</span> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {t("No students found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student._id}>
                      {/* Student */}
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="bg-gradient-to-br from-golden-400 to-golden-600">
                            <AvatarFallback className="bg-gradient-to-br from-golden-400 to-golden-600 text-white font-semibold">
                              {`${student.firstName?.[0]}${student.lastName?.[0] || ""}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">ID: {student.studentId}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Class / Level */}
                      <TableCell>
                        <div>
                          {/* <div className="font-medium">{student.class}</div> */}
                          <div className="text-sm text-muted-foreground">{student.class}</div>
                        </div>
                      </TableCell>

                      {/* Age / Gender */}
                      <TableCell>
                        <div>
                          {/* <div className="font-medium">{student.childAge}</div> */}
                          <div className="text-sm text-muted-foreground">{student.gender}</div>
                        </div>
                      </TableCell>

                      {/* Parent */}
                      {/* <TableCell>
                        <div>
                          <div className="font-medium">{student.parentName}</div>
                          <div className="text-sm text-muted-foreground">{student.parentPhone}</div>
                        </div>
                      </TableCell> */}

                      {/* Status */}
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(student.status)}>{student.status}</Badge>
                      </TableCell>

                      {/* Payment */}
                      <TableCell>
                        <div>
                          <Badge variant={getPaymentStatusBadgeVariant(student.paymentStatus)}>
                            {student.paymentStatus?.replace("_", " ")}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {t("Due")}: {t("Rwf")} {student.amountDue?.toLocaleString()} | {t("Paid")}: {t("Rwf")}{" "}
                            {student.amountPaid?.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>

                      {/* Admission */}
                      <TableCell>
                        <div>
                          <div className="font-medium">{new Date(student.admissionDate).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">{student.academicYear}</div>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStudent(student)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t("View Profile")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStudent(student)
                                setEditFormData(student)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {t("Edit Student")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStudent(student)
                                setIsPaymentDialogOpen(true)
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              {t("Add Payment")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              {t("Showing")} {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} {t("to")}{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} {t("of")} {pagination.total} {t("students")}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                {t("Previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
              >
                {t("Next")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Student Profile Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={handleDialogClose(setIsViewDialogOpen)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Student Profile")}</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">{t("Basic Info")}</TabsTrigger>
                <TabsTrigger value="academic">{t("Academic")}</TabsTrigger>
                <TabsTrigger value="financial">{t("Financial")}</TabsTrigger>
                <TabsTrigger value="records">{t("Records")}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                {/* Student Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-blue-600" />
                      {t("Student Information")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Student ID")}</Label>
                      <p className="text-gray-900 font-medium">{selectedStudent.studentId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Full Name")}</Label>
                      <p className="text-gray-900 font-medium">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Date of Birth")}</Label>
                      <p className="text-gray-900">
                        {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Gender")}</Label>
                      <p className="text-gray-900">{selectedStudent.gender || selectedStudent.childGender || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Age")}</Label>
                      <p className="text-gray-900">
                        {typeof selectedStudent.childAge !== "undefined" && selectedStudent.childAge !== null
                          ? selectedStudent.childAge
                          : selectedStudent.dateOfBirth
                            ? Math.floor(
                                (Date.now() - new Date(selectedStudent.dateOfBirth).getTime()) /
                                  (365.25 * 24 * 60 * 60 * 1000),
                              )
                            : "—"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Father Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-green-600" />
                      {t("Father Information")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Name")}</Label>
                      <p className="text-gray-900">{selectedStudent.fatherName || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ID</Label>
                      <p className="text-gray-900">{selectedStudent.fatherId || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Phone")}</Label>
                      <p className="text-gray-900">{selectedStudent.fatherPhone || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-gray-900">{selectedStudent.fatherEmail || "—"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mother Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-pink-600" />
                      {t("Mother Information")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Name")}</Label>
                      <p className="text-gray-900">{selectedStudent.motherName || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ID</Label>
                      <p className="text-gray-900">{selectedStudent.motherId || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Phone")}</Label>
                      <p className="text-gray-900">{selectedStudent.motherPhone || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-gray-900">{selectedStudent.motherEmail || "—"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Address / Location Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                      {t("Location Information")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedStudent.province && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t("Province")}</Label>
                        <p className="text-gray-900 font-medium">{selectedStudent.province}</p>
                      </div>
                    )}
                    {selectedStudent.district && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t("District")}</Label>
                        <p className="text-gray-900 font-medium">{selectedStudent.district}</p>
                      </div>
                    )}
                    {selectedStudent.sector && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t("Sector")}</Label>
                        <p className="text-gray-900 font-medium">{selectedStudent.sector}</p>
                      </div>
                    )}
                    {selectedStudent.cell && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t("Cell")}</Label>
                        <p className="text-gray-900 font-medium">{selectedStudent.cell}</p>
                      </div>
                    )}
                    {selectedStudent.village && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t("Village")}</Label>
                        <p className="text-gray-900 font-medium">{selectedStudent.village}</p>
                      </div>
                    )}
                    {selectedStudent.address && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-600">{t("Additional Info")}</Label>
                        <p className="text-gray-900">{selectedStudent.address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="academic" className="space-y-6">
                {/* Academic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5 text-indigo-600" />
                      {t("Academic Information")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Level")}</Label>
                      <p className="text-gray-900 font-medium">{selectedStudent.class}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Academic Year")}</Label>
                      <p className="text-gray-900 font-medium">{selectedStudent.academicYear}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Admission Date")}</Label>
                      <p className="text-gray-900">{new Date(selectedStudent.admissionDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Status")}</Label>
                      <Badge variant={getStatusBadgeVariant(selectedStudent.status)}>{selectedStudent.status}</Badge>
                    </div>
                    {selectedStudent.previousSchool && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-600">{t("Previous School")}</Label>
                        <p className="text-gray-900">{selectedStudent.previousSchool}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes (if any) */}
                {selectedStudent.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <StickyNote className="mr-2 h-5 w-5 text-yellow-600" />
                        {t("Notes")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-muted rounded-md text-gray-800">{selectedStudent.notes}</div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="financial" className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-base text-gray-700">
                        <Wallet className="mr-2 h-4 w-4 text-blue-600" />
                        {t("Total Fees")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {t("Rwf")} {selectedStudent.totalFees?.toLocaleString() || "0"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-base text-gray-700">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        {t("Amount Paid")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {t("Rwf")} {selectedStudent.amountPaid?.toLocaleString() || "0"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-base text-gray-700">
                        <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                        {t("Amount Due")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {t("Rwf")} {selectedStudent.amountDue?.toLocaleString() || "0"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-purple-600" />
                      {t("Payment Status")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getPaymentStatusBadgeVariant(selectedStudent.paymentStatus)}>
                      {selectedStudent.paymentStatus?.replace("_", " ")}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Payment History */}
                {selectedStudent.paymentHistory?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <History className="mr-2 h-5 w-5 text-orange-600" />
                        {t("Payment History")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead>{t("Date")}</TableHead>
                              <TableHead>{t("Amount")}</TableHead>
                              <TableHead>{t("Method")}</TableHead>
                              <TableHead>{t("Description")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedStudent.paymentHistory.map((payment, index) => (
                              <TableRow key={index}>
                                <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium text-gray-900">
                                  {t("Rwf")} {payment.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>{payment.paymentMethod}</TableCell>
                                <TableCell>{payment.description}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="records" className="space-y-4">
                {selectedStudent.achievements && selectedStudent.achievements.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("Achievements")}</Label>
                    <div className="space-y-2">
                      {selectedStudent.achievements.map((achievement, index) => (
                        <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-md">
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStudent.disciplinaryActions && selectedStudent.disciplinaryActions.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("Disciplinary Records")}</Label>
                    <div className="space-y-2">
                      {selectedStudent.disciplinaryActions.map((action, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="destructive">{action.type}</Badge>
                            <div className="text-sm text-muted-foreground">
                              {new Date(action.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-sm">{action.description}</div>
                          <div className="text-sm font-medium mt-1">{t("Action")}: {action.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStudent.medicalConditions && selectedStudent.medicalConditions.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("Medical Conditions")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.medicalConditions.map((condition, index) => (
                        <Badge key={index} variant="secondary">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStudent.allergies && selectedStudent.allergies.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("Allergies")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={handleDialogClose(setIsPaymentDialogOpen)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Add Payment")}</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("Outstanding")}: {t("Rwf")} {selectedStudent.amountDue?.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("Amount")}</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentFormData.amount}
                    onChange={(e) =>
                      setPaymentFormData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">{t("Payment Method")}</Label>
                  <Select
                    value={paymentFormData.paymentMethod}
                    onValueChange={(value) =>
                      setPaymentFormData((prev) => ({
                        ...prev,
                        paymentMethod: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t("Cash")}</SelectItem>
                      <SelectItem value="bank_transfer">{t("Bank Transfer")}</SelectItem>
                      <SelectItem value="card">{t("Card")}</SelectItem>
                      <SelectItem value="check">{t("Check")}</SelectItem>
                      <SelectItem value="other">{t("Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">{t("Reference")}</Label>
                <Input
                  id="reference"
                  value={paymentFormData.reference}
                  onChange={(e) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      reference: e.target.value,
                    }))
                  }
                  placeholder={t("Transaction reference")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicTerm">{t("Academic Term")}</Label>
                <Input
                  id="academicTerm"
                  value={paymentFormData.academicTerm}
                  onChange={(e) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      academicTerm: e.target.value,
                    }))
                  }
                  placeholder={t("e.g., First Term 2024")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("Description")}</Label>
                <Textarea
                  id="description"
                  value={paymentFormData.description}
                  onChange={(e) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={t("Payment description")}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button
                  onClick={handleAddPayment}
                  className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700"
                >
                  {t("Add Payment")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleDialogClose(setIsEditDialogOpen)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Edit Student")}</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">{t("Basic Info")}</TabsTrigger>
                  <TabsTrigger value="academic">{t("Academic")}</TabsTrigger>
                  <TabsTrigger value="financial">{t("Financial")}</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  {/* Student Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5 text-blue-600" />
                        {t("Student Information")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-studentId">{t("Student ID")}</Label>
                        <Input
                          id="edit-studentId"
                          value={editFormData.studentId || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, studentId: e.target.value }))}
                          placeholder="Enter student ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-firstName">{t("First Name")} *</Label>
                        <Input
                          id="edit-firstName"
                          value={editFormData.firstName || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                          placeholder={t("Enter first name")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-lastName">{t("Last Name")} *</Label>
                        <Input
                          id="edit-lastName"
                          value={editFormData.lastName || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                          placeholder={t("Enter last name")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-dateOfBirth">{t("Date of Birth")} *</Label>
                        <Input
                          id="edit-dateOfBirth"
                          type="date"
                          value={
                            editFormData.dateOfBirth
                              ? new Date(editFormData.dateOfBirth).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const dob = new Date(e.target.value)
                            const today = new Date()
                            let age = today.getFullYear() - dob.getFullYear()
                            const m = today.getMonth() - dob.getMonth()

                            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                              age--
                            }

                            setEditFormData((prev) => ({
                              ...prev,
                              dateOfBirth: dob,
                              childAge: age >= 0 ? age : 0, // prevent negative values
                            }))
                          }}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-gender">{t("Gender")} *</Label>
                        <Select
                          value={editFormData.gender || "Male"}
                          onValueChange={(value) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              gender: value as "Male" | "Female",
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">{t("Male")}</SelectItem>
                            <SelectItem value="Female">{t("Female")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-childAge">{t("Age")} *</Label>
                        <Input
                          id="edit-childAge"
                          type="number"
                          value={editFormData.childAge || ""}
                          readOnly // makes it non-editable
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Father Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5 text-green-600" />
                        {t("Father Information")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-fatherName">{t("Father Name")}</Label>
                        <Input
                          id="edit-fatherName"
                          value={editFormData.fatherName || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, fatherName: e.target.value }))}
                          placeholder={t("Enter father name")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-fatherId">{t("Father ID")}</Label>
                        <Input
                          id="edit-fatherId"
                          value={editFormData.fatherId || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, fatherId: e.target.value }))}
                          placeholder={t("Enter father ID")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-fatherPhone">{t("Father Phone")}</Label>
                        <Input
                          id="edit-fatherPhone"
                          value={editFormData.fatherPhone || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, fatherPhone: e.target.value }))}
                          placeholder={t("Enter father phone")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-fatherEmail">{t("Father Email")}</Label>
                        <Input
                          id="edit-fatherEmail"
                          type="email"
                          value={editFormData.fatherEmail || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, fatherEmail: e.target.value }))}
                          placeholder={t("Enter father email")}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mother Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5 text-pink-600" />
                        {t("Mother Information")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-motherName">{t("Mother Name")}</Label>
                        <Input
                          id="edit-motherName"
                          value={editFormData.motherName || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, motherName: e.target.value }))}
                          placeholder={t("Enter mother name")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-motherId">{t("Mother ID")}</Label>
                        <Input
                          id="edit-motherId"
                          value={editFormData.motherId || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, motherId: e.target.value }))}
                          placeholder={t("Enter mother ID")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-motherPhone">{t("Mother Phone")}</Label>
                        <Input
                          id="edit-motherPhone"
                          value={editFormData.motherPhone || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, motherPhone: e.target.value }))}
                          placeholder={t("Enter mother phone")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-motherEmail">{t("Mother Email")}</Label>
                        <Input
                          id="edit-motherEmail"
                          type="email"
                          value={editFormData.motherEmail || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, motherEmail: e.target.value }))}
                          placeholder={t("Enter mother email")}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                        {t("Location Information")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-province">{t("Province")}</Label>
                        <Input
                          id="edit-province"
                          value={editFormData.province || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, province: e.target.value }))}
                          placeholder={t("Enter province")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-district">{t("District")}</Label>
                        <Input
                          id="edit-district"
                          value={editFormData.district || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, district: e.target.value }))}
                          placeholder={t("Enter district")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-sector">{t("Sector")}</Label>
                        <Input
                          id="edit-sector"
                          value={editFormData.sector || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, sector: e.target.value }))}
                          placeholder={t("Enter sector")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-cell">{t("Cell")}</Label>
                        <Input
                          id="edit-cell"
                          value={editFormData.cell || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, cell: e.target.value }))}
                          placeholder={("Enter cell")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-village">{t("Village")}</Label>
                        <Input
                          id="edit-village"
                          value={editFormData.village || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, village: e.target.value }))}
                          placeholder={t("Enter village")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-address">{t("Additional Address Info")}</Label>
                        <Textarea
                          id="edit-address"
                          value={editFormData.address || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, address: e.target.value }))}
                          placeholder={t("Enter additional address information")}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="academic" className="space-y-6">
                  {/* Academic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GraduationCap className="mr-2 h-5 w-5 text-indigo-600" />
                        {t("Academic Information")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-level">{t("Level")} *</Label>
                        <Select
                          value={editFormData.class || ""}
                          onValueChange={(value) => setEditFormData((prev) => ({ ...prev, class: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select level")} />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls} value={cls}>
                                {cls}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-academicYear">{t("Academic Year")} *</Label>
                        <Select
                          value={editFormData.academicYear || "2025-2026"}
                          onValueChange={(value) => setEditFormData((prev) => ({ ...prev, academicYear: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYears.map((year) => (
                              <SelectItem key={year._id} value={year.year}>
                                {year.year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-admissionDate">{t("Admission Date")} *</Label>
                        <Input
                          id="edit-admissionDate"
                          type="date"
                          value={
                            editFormData.admissionDate
                              ? new Date(editFormData.admissionDate).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              admissionDate: new Date(e.target.value),
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-status">{t("Status")} *</Label>
                        <Select
                          value={editFormData.status || "active"}
                          onValueChange={(value) => setEditFormData((prev) => ({ ...prev, status: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="edit-previousSchool">{t("Previous School")}</Label>
                        <Input
                          id="edit-previousSchool"
                          value={editFormData.previousSchool || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, previousSchool: e.target.value }))}
                          placeholder={t("Enter previous school (if any)")}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <StickyNote className="mr-2 h-5 w-5 text-yellow-600" />
                        {t("Additional Notes")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="edit-notes">{("Notes")}</Label>
                        <Textarea
                          id="edit-notes"
                          value={editFormData.notes || ""}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder={("Enter any additional notes about the student")}
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                  {/* Financial Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                        {t("Financial Information")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-totalFees">{t("Total Fees")} ({t("Rwf")}) *</Label>
                        <Input
                          id="edit-totalFees"
                          type="number"
                          value={editFormData.totalFees || ""}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              totalFees: Number.parseFloat(e.target.value) || 0,
                              amountDue: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          placeholder={t("Enter total fees")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-amountPaid">{t("Amount Paid")} ({t("Rwf")})</Label>
                        <Input
                          id="edit-amountPaid"
                          type="number"
                          value={editFormData.amountPaid || ""}
                          onChange={(e) => {
                            const paid = Number.parseFloat(e.target.value) || 0
                            const total = editFormData.totalFees || 0
                            const due = Math.max(0, total - paid)

                            let paymentStatus: "paid" | "not_paid" | "half_paid" | "overdue"
                            if (paid === 0) {
                              paymentStatus = "not_paid"
                            } else if (paid >= total) {
                              paymentStatus = "paid"
                            } else {
                              // For partial payments, check if overdue based on admission date
                              const admissionDate = editFormData.admissionDate
                                ? new Date(editFormData.admissionDate)
                                : new Date()
                              const monthsSinceAdmission =
                                (Date.now() - admissionDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

                              // Consider overdue if more than 3 months since admission and less than 50% paid
                              if (monthsSinceAdmission > 3 && paid / total < 0.5) {
                                paymentStatus = "overdue"
                              } else {
                                paymentStatus = "half_paid"
                              }
                            }

                            setEditFormData((prev) => ({
                              ...prev,
                              amountPaid: paid,
                              amountDue: due,
                              paymentStatus,
                            }))
                          }}
                          placeholder={t("Enter amount paid")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-paymentStatus">{t("Payment Status")}</Label>
                        <Select
                          value={editFormData.paymentStatus || "not_paid"}
                          onValueChange={(value) =>
                            setEditFormData((prev) => ({ ...prev, paymentStatus: value as any }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Amount Due")} ({t("Rwf")})</Label>
                        <Input value={editFormData.amountDue || 0} disabled className="bg-muted" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button
                  onClick={handleEditStudent}
                  className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700"
                >
                  {t("Update Student")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
