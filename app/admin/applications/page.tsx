"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Eye, FileText, User, Phone, MapPin } from "lucide-react"

interface Application {
  _id: string
  parentName?: string
  fatherName?: string
  fatherPhone?: number
  fatherId?: string
  fatherEmail?: string
  motherName?: string
  motherPhone?: number
  motherId?: string
  motherEmail?: string
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
  const { t } = useTranslation()
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
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

  const updateBulkApplicationStatus = async (ids: string[], status: string, notes = "") => {
    try {
      // Get applications data for email sending
      const selectedApps = applications.filter(app => ids.includes(app._id))
      
      // Update all applications
      const updatePromises = ids.map(id => 
        fetch(`/api/applications/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, notes }),
        })
      )
      
      const responses = await Promise.allSettled(updatePromises)
      
      // Send bulk emails
      if (selectedApps.length > 0 && (status === "under_review" || status === "approved" || status === "rejected")) {
        await fetch("/api/send-bulk-application-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applications: selectedApps,
            status
          })
        })
      }
      
      // Update local state
      setApplications(prevApps =>
        prevApps.map(app =>
          ids.includes(app._id)
            ? { ...app, status: status as any, updatedAt: new Date().toISOString() }
            : app
        )
      )
      
      fetchApplications()
    } catch (error) {
      console.error("Error updating applications:", error)
      alert("Error updating application status. Please try again.")
    }
  }

  const updateApplicationStatus = async (id: string, status: string, notes = "") => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      })

      const result = await response.json()

      if (response.ok) {
        // Send email notification for status changes
        const application = applications.find(app => app._id === id)
        if (application && (status === "under_review" || status === "approved" || status === "rejected")) {
          const emailStatus = status === "under_review" ? "submitted" : status
          
          await fetch("/api/send-application-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fatherEmail: application.fatherEmail,
              motherEmail: application.motherEmail,
              childName: application.childName,
              status: emailStatus,
              programName: application.childYear
            })
          })
        }

        // Update local applications state
        setApplications(prevApps =>
          prevApps.map(app =>
            app._id === id
              ? { ...app, status: status as any, updatedAt: new Date().toISOString() }
              : app
          )
        )

        setIsViewDialogOpen(false)
        setSelectedApplication(null)
        setStatusNotes("")

        // Optionally refetch to ensure data consistency
        fetchApplications()
      } else {
        throw new Error(result.error || "Failed to update application status")
      }
    } catch (error) {
      console.error("Error updating application:", error)
      // Add error handling UI here
      alert("Error updating application status. Please try again.")
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
    if (selectedApplications.length === filteredApplications.length && filteredApplications.length > 0) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(filteredApplications.map(app => app._id))
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

  const filteredApplications = applications?.filter((application) => {
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
        <h1 className="text-3xl font-bold text-gray-900">{t("Application Management")}</h1>
        <p className="text-gray-600">{t("Manage admission applications and student enrollment")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("Applications")}</p>
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
                <p className="text-sm font-medium text-gray-600">{t("pending")}</p>
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
                <p className="text-sm font-medium text-gray-600">{t("under_review")}</p>
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
                <p className="text-sm font-medium text-gray-600">{t("approved")}</p>
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
                <p className="text-sm font-medium text-gray-600">{t("rejected")}</p>
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
                  placeholder={t("Search by parent or child name, contact, location...")}
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
                <SelectItem value="all">{t("All Status")}</SelectItem>
                <SelectItem value="pending">{t("Pending")}</SelectItem>
                <SelectItem value="under_review">{t("Under Review")}</SelectItem>
                <SelectItem value="approved">{t("Approved")}</SelectItem>
                <SelectItem value="rejected">{t("Rejected")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="text-sm text-gray-600">
                {selectedApplications.length} {t("application")}{selectedApplications.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateBulkApplicationStatus(selectedApplications, 'under_review', 'Bulk updated to under review')
                    setSelectedApplications([])
                  }}
                  className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                >
                  {t("Mark as Under Review")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    updateBulkApplicationStatus(selectedApplications, 'approved', 'Bulk approved')
                    setSelectedApplications([])
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {t("Approve")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    updateBulkApplicationStatus(selectedApplications, 'rejected', 'Bulk rejected')
                    setSelectedApplications([])
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {t("Reject")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedApplications([])}
                >
                  {t("Clear Selection")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Applications")} ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                      onChange={handleSelectAllApplications}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Parents")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Contacts")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Child Details")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Status")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Applied Date")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(application._id)}
                        onChange={() => handleSelectApplication(application._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-gray-600">{t("Father")}: {application.fatherName}</p>
                        <br />
                        <p className="text-sm text-gray-600">{t("Mother")}: {application.motherName}</p>
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
                        <p className="text-sm text-gray-600">{t("Name")}: {application.childName}</p>
                        <p className="text-sm text-gray-600">{t("Age")}: {application.childAge}</p>
                        <p className="text-sm text-gray-600">{t("Gender")}: {application.childGender}</p>
                        <p className="text-sm text-gray-600">{t("Level")}: {application.childYear}</p>
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
                        {t("View")}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("No applications found")}</h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== "all"
                  ? t("Try adjusting your search or filter criteria")
                  : t("No applications yet")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Application Details")}</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Father Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    {t("Father Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Father's Name")}</Label>
                    <p className="text-gray-900">{selectedApplication.fatherName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Phone")}</Label>
                    <p className="text-gray-900">{selectedApplication.fatherPhone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("ID Number")}</Label>
                    <p className="text-gray-900">{selectedApplication.fatherId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-gray-900">{selectedApplication.fatherEmail}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mother Information */}
              {selectedApplication.motherName && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      {t("Mother Information")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Mother's Name")}</Label>
                      <p className="text-gray-900">{selectedApplication.motherName}</p>
                    </div>
                    {selectedApplication.motherPhone && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t("Phone")}</Label>
                        <p className="text-gray-900">{selectedApplication.motherPhone}</p>
                      </div>
                    )}
                    {selectedApplication.motherId && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t("ID Number")}</Label>
                        <p className="text-gray-900">{selectedApplication.motherId}</p>
                      </div>
                    )}
                    {selectedApplication.motherEmail && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="text-gray-900">{selectedApplication.motherEmail}</p>
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
                    {t("Child Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Child's Name")}</Label>
                    <p className="text-gray-900">{selectedApplication.childName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Age")}</Label>
                    <p className="text-gray-900">{selectedApplication.childAge} {t("years old")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Gender")}</Label>
                    <p className="text-gray-900">{selectedApplication.childGender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Date of Birth")}</Label>
                    <p className="text-gray-900">{new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Level")}</Label>
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
                    {t("Location Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplication.province && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Province")}</Label>
                      <p className="text-gray-900">{selectedApplication.province}</p>
                    </div>
                  )}
                  {selectedApplication.district && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("District")}</Label>
                      <p className="text-gray-900">{selectedApplication.district}</p>
                    </div>
                  )}
                  {selectedApplication.sector && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Sector")}</Label>
                      <p className="text-gray-900">{selectedApplication.sector}</p>
                    </div>
                  )}
                  {selectedApplication.cell && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Cell")}</Label>
                      <p className="text-gray-900">{selectedApplication.cell}</p>
                    </div>
                  )}
                  {selectedApplication.village && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Village")}</Label>
                      <p className="text-gray-900">{selectedApplication.village}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              {selectedApplication.additionalInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Additional Information")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900">{selectedApplication.additionalInfo}</p>
                  </CardContent>
                </Card>
              )}

              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("Status Management")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Current Status")}</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedApplication.status)}>
                        {getStatusIcon(selectedApplication.status)}{" "}
                        {selectedApplication.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">{t("Notes")} ({t("optional")})</Label>
                    <Textarea
                      id="notes"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder={t("Add any notes about this application...")}
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication._id, "under_review", statusNotes)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {t("Mark Under Review")}
                    </Button>
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication._id, "approved", statusNotes)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {t("Approve")}
                    </Button>
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication._id, "rejected", statusNotes)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {t("Reject")}
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
