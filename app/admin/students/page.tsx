"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  Phone,
  Mail,
  MapPin,
  TrendingUp,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Student, StudentStats } from "@/lib/models/Student"

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
  const academicYears = ["2025-2026", "2024-2025", "2023-2024", "2022-2023"]

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
    fetchStudents()
  }, [fetchStudents])

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
          <h1 className="text-3xl font-bold">Students Management</h1>
          <p className="text-muted-foreground">Manage student records, payments, and academic information</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleImportApproved} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Approved
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              {/* Add Student Form - Implementation similar to edit form */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{stats.active} active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Frw {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This academic year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Frw {stats.outstandingFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Pending payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(((stats.byPaymentStatus.paid || 0) / stats.total) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Fully paid students</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.class} onValueChange={(value) => setFilters((prev) => ({ ...prev, class: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
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
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Gender</TableHead>
                  {/* <TableHead>Parent</TableHead> */}
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  {/* <TableHead>Admission Date</TableHead> */}
                  <TableHead>Actions</TableHead>
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
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student._id}>
                      {/* Student */}
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {`${student.firstName?.[0]}${student.lastName?.[0] || ""}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {student.studentId}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Class / Level */}
                      <TableCell>
                        <div>
                          {/* <div className="font-medium">{student.class}</div> */}
                          <div className="text-sm text-muted-foreground">{student.level}</div>
                        </div>
                      </TableCell>

                      {/* Age / Gender */}
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.childAge}</div>
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
                        <Badge variant={getStatusBadgeVariant(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>

                      {/* Payment */}
                      <TableCell>
                        <div>
                          <Badge variant={getPaymentStatusBadgeVariant(student.paymentStatus)}>
                            {student.paymentStatus?.replace("_", " ")}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            Due: Frw {student.amountDue?.toLocaleString()} | Paid: Frw{" "}
                            {student.amountPaid?.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>

                      {/* Admission */}
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(student.admissionDate).toLocaleDateString()}
                          </div>
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
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStudent(student)
                                setEditFormData(student)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStudent(student)
                                setIsPaymentDialogOpen(true)
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Add Payment
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
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Student Profile Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="records">Records</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                {/* Student Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-blue-600" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Student ID</Label>
                      <p className="text-gray-900 font-medium">{selectedStudent.studentId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                      <p className="text-gray-900 font-medium">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                      <p className="text-gray-900">
                        {selectedStudent.dateOfBirth
                          ? new Date(selectedStudent.dateOfBirth).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Gender</Label>
                      <p className="text-gray-900">
                        {selectedStudent.gender || selectedStudent.childGender || "—"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Age</Label>
                      <p className="text-gray-900">
                        {typeof selectedStudent.childAge !== "undefined" &&
                          selectedStudent.childAge !== null
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
                      Father Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="text-gray-900">{selectedStudent.fatherName || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ID</Label>
                      <p className="text-gray-900">{selectedStudent.fatherId || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-gray-900">{selectedStudent.fatherPhone || "—"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mother Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-pink-600" />
                      Mother Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="text-gray-900">{selectedStudent.motherName || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ID</Label>
                      <p className="text-gray-900">{selectedStudent.motherId || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-gray-900">{selectedStudent.motherPhone || "—"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Address / Location Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                      Location Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedStudent.province && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Province</Label>
                        <p className="text-gray-900 font-medium">{selectedStudent.province}</p>
                      </div>
                    )}
                    {selectedStudent.district && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">District</Label>
                        <p className="text-gray-900 font-medium">{selectedStudent.district}</p>
                      </div>
                    )}
                    {selectedStudent.sector && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Sector</Label>
                        <p className="text-gray-900 font-medium">{selectedStudent.sector}</p>
                      </div>
                    )}
                    {selectedStudent.cell && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Cell</Label>
                        <p className="text-gray-900 font-medium">{selectedStudent.cell}</p>
                      </div>
                    )}
                    {selectedStudent.village && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Village</Label>
                        <p className="text-gray-900 font-medium">{selectedStudent.village}</p>
                      </div>
                    )}
                    {selectedStudent.address && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-600">Additional Info</Label>
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
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Level</Label>
                      <p className="text-gray-900 font-medium">{selectedStudent.level}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Academic Year</Label>
                      <p className="text-gray-900 font-medium">{selectedStudent.academicYear}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Admission Date</Label>
                      <p className="text-gray-900">
                        {new Date(selectedStudent.admissionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge variant={getStatusBadgeVariant(selectedStudent.status)}>
                        {selectedStudent.status}
                      </Badge>
                    </div>
                    {selectedStudent.previousSchool && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-600">Previous School</Label>
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
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-muted rounded-md text-gray-800">
                        {selectedStudent.notes}
                      </div>
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
                        Total Fees
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        Frw {selectedStudent.totalFees?.toLocaleString() || "0"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-base text-gray-700">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Amount Paid
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        Frw {selectedStudent.amountPaid?.toLocaleString() || "0"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-base text-gray-700">
                        <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                        Amount Due
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        Frw {selectedStudent.amountDue?.toLocaleString() || "0"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-purple-600" />
                      Payment Status
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
                        Payment History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedStudent.paymentHistory.map((payment, index) => (
                              <TableRow key={index}>
                                <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium text-gray-900">
                                  Frw {payment.amount.toLocaleString()}
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
                    <Label>Achievements</Label>
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
                    <Label>Disciplinary Records</Label>
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
                          <div className="text-sm font-medium mt-1">Action: {action.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStudent.medicalConditions && selectedStudent.medicalConditions.length > 0 && (
                  <div className="space-y-2">
                    <Label>Medical Conditions</Label>
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
                    <Label>Allergies</Label>
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
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  Outstanding: Frw {selectedStudent.amountDue.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
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
                  <Label htmlFor="paymentMethod">Payment Method</Label>
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
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={paymentFormData.reference}
                  onChange={(e) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      reference: e.target.value,
                    }))
                  }
                  placeholder="Transaction reference"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicTerm">Academic Term</Label>
                <Input
                  id="academicTerm"
                  value={paymentFormData.academicTerm}
                  onChange={(e) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      academicTerm: e.target.value,
                    }))
                  }
                  placeholder="e.g., First Term 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={paymentFormData.description}
                  onChange={(e) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Payment description"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPayment}>Add Payment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
