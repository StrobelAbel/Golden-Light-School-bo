"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, FileText } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import type { Application } from "@/lib/models/Application"

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications")
      const result = await response.json()

      if (result.success) {
        setApplications(result.applications)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredApplications(filtered)
  }

  const updateApplicationStatus = async (id: string, status: string, notes?: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes: notes || reviewNotes,
          reviewedBy: "Admin", // In a real app, get from auth context
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchApplications()
        setSelectedApplication(null)
        setReviewNotes("")
      }
    } catch (error) {
      console.error("Error updating application:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "pending":
        return <Badge className="bg-golden-100 text-golden-800">Pending</Badge>
      case "review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-2">Manage admission applications and enrollment requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{applications.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-golden-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golden-600">
                {applications.filter((app) => app.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {applications.filter((app) => app.status === "approved").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {applications.filter((app) => app.status === "review").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Management */}
        <Card>
          <CardHeader>
            <CardTitle>Application Management</CardTitle>
            <CardDescription>Review and manage all admission applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Applications Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parent & Child</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Child Details</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application._id?.toString()}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.parentName}</div>
                          <div className="text-sm text-gray-500">Child: {application.childName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{application.email}</div>
                          <div className="text-sm text-gray-500">{application.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">Age: {application.childAge}</div>
                          <div className="text-sm text-gray-500">DOB: {formatDate(application.childDOB)}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(application.submittedAt.toString())}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    setSelectedApplication(application)
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                            </Dialog>
                            <DropdownMenuItem
                              onClick={() => updateApplicationStatus(application._id!.toString(), "approved")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateApplicationStatus(application._id!.toString(), "review")}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Mark for Review
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => updateApplicationStatus(application._id!.toString(), "rejected")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No applications found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Details Dialog */}
        {selectedApplication && (
          <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>Review and manage this admission application</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Parent Name</Label>
                    <p className="text-sm">{selectedApplication.parentName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-sm">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-sm">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Child Name</Label>
                    <p className="text-sm">{selectedApplication.childName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Child Age</Label>
                    <p className="text-sm">{selectedApplication.childAge} years old</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                    <p className="text-sm">{formatDate(selectedApplication.childDOB)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Preferred Start Date</Label>
                    <p className="text-sm">{formatDate(selectedApplication.preferredStartDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                    <p className="text-sm">{selectedApplication.emergencyContact}</p>
                  </div>
                </div>

                {selectedApplication.previousSchool && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Previous School</Label>
                    <p className="text-sm">{selectedApplication.previousSchool}</p>
                  </div>
                )}

                {selectedApplication.specialNeeds && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Special Needs</Label>
                    <p className="text-sm">{selectedApplication.specialNeeds}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-500">Current Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                </div>

                <div>
                  <Label htmlFor="notes">Review Notes</Label>
                  <Textarea
                    id="notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateApplicationStatus(selectedApplication._id!.toString(), "rejected", reviewNotes)
                    }
                    disabled={isUpdating}
                    className="bg-transparent"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateApplicationStatus(selectedApplication._id!.toString(), "review", reviewNotes)}
                    disabled={isUpdating}
                    className="bg-transparent"
                  >
                    Mark for Review
                  </Button>
                  <Button
                    onClick={() =>
                      updateApplicationStatus(selectedApplication._id!.toString(), "approved", reviewNotes)
                    }
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? "Updating..." : "Approve"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}
