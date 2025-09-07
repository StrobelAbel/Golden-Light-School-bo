"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Eye, FileText, User, Phone, MapPin  } from "lucide-react"

interface Application {
  _id: string
  parentName?: string
  fatherName?: string
  fatherPhone?: number
  fatherId?: string
  motherName?: string
  motherPhone?: number
  motherId?: string
  province?: string
  district?: string
  sector?: string
  cell?: string
  village?: string
  childName: string
  childAge: number
  childGender: string
  childYear: string
  dateOfBirth: string
  // preferredStartDate: string
  additionalInfo?: string
  status: "pending" | "approved" | "rejected" | "under_review"
  createdAt: string
  updatedAt: string
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [statusNotes, setStatusNotes] = useState("")

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications")
      const data = await response.json()
      setApplications(data)
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (id: string, status: string, notes = "") => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      })

      if (response.ok) {
        fetchApplications()
        setIsViewDialogOpen(false)
        setSelectedApplication(null)
        setStatusNotes("")
      }
    } catch (error) {
      console.error("Error updating application:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return "✓"
      case "rejected":
        return "✗"
      case "under_review":
        return "⏳"
      default:
        return "📋"
    }
  }

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.motherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.fatherPhone?.toString().includes(searchTerm) ||
      application.motherPhone?.toString().includes(searchTerm) ||
      application.cell?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.village?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || application.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    approved: applications.filter((app) => app.status === "approved").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
    under_review: applications.filter((app) => app.status === "under_review").length,
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
        <p className="text-gray-600">Manage admission applications and student enrollment</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.pending}</p>
              </div>
              <div className="text-2xl">📋</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.under_review}</p>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
              </div>
              <div className="text-2xl">✓</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <div className="text-2xl">✗</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by parent name, child name, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Parents</th>
                  <th className="text-left p-4 font-medium text-gray-600">Contacts</th>
                  <th className="text-left p-4 font-medium text-gray-600">Child Details</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Applied Date</th>
                  <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-gray-600">Father: {application.fatherName}</p>
                        <br />
                        <p className="text-sm text-gray-600">Mother: {application.motherName}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={20} color="currentColor" className="h-3 w-3 mr-1" />
                          {application.fatherPhone}
                        </div><br />
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {application.motherPhone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Age: {application.childAge}</p>
                        <p className="text-sm text-gray-600">Gender: {application.childGender}</p>
                        <p className="text-sm text-gray-600">Year: {application.childYear}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusIcon(application.status)} {application.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">{new Date(application.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedApplication(application)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No applications have been submitted yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Father Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Father Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Father's Name</Label>
                    <p className="text-gray-900">{selectedApplication.fatherName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-gray-900">{selectedApplication.fatherPhone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">ID Number</Label>
                    <p className="text-gray-900">{selectedApplication.fatherId}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mother Information */}
              {selectedApplication.motherName && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Mother Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Mother's Name</Label>
                      <p className="text-gray-900">{selectedApplication.motherName}</p>
                    </div>
                    {selectedApplication.motherPhone && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Phone</Label>
                        <p className="text-gray-900">{selectedApplication.motherPhone}</p>
                      </div>
                    )}
                    {selectedApplication.motherId && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">ID Number</Label>
                        <p className="text-gray-900">{selectedApplication.motherId}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Child Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Child Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Child Name</Label>
                    <p className="text-gray-900">{selectedApplication.childName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Age</Label>
                    <p className="text-gray-900">{selectedApplication.childAge} years old</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Gender</Label>
                    <p className="text-gray-900">{selectedApplication.childGender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                    <p className="text-gray-900">{new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Year</Label>
                    <p className="text-gray-900">
                      {selectedApplication.childYear}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplication.province && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Province</Label>
                      <p className="text-gray-900">{selectedApplication.province}</p>
                    </div>
                  )}
                  {selectedApplication.district && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">District</Label>
                      <p className="text-gray-900">{selectedApplication.district}</p>
                    </div>
                  )}
                  {selectedApplication.sector && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Sector</Label>
                      <p className="text-gray-900">{selectedApplication.sector}</p>
                    </div>
                  )}
                  {selectedApplication.cell && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Cell</Label>
                      <p className="text-gray-900">{selectedApplication.cell}</p>
                    </div>
                  )}
                  {selectedApplication.village && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Village</Label>
                      <p className="text-gray-900">{selectedApplication.village}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              {selectedApplication.additionalInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900">{selectedApplication.additionalInfo}</p>
                  </CardContent>
                </Card>
              )}

              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedApplication.status)}>
                        {getStatusIcon(selectedApplication.status)}{" "}
                        {selectedApplication.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Add any notes about this application..."
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication._id, "under_review", statusNotes)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Mark Under Review
                    </Button>
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication._id, "approved", statusNotes)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve Application
                    </Button>
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication._id, "rejected", statusNotes)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reject Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
