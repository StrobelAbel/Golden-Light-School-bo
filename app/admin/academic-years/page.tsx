"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar, Plus, Edit, Trash2, GraduationCap, Users, CheckCircle, AlertCircle, Eye, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/useTranslation"
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

interface AcademicYear {
  _id: string
  year: string
  startDate: string
  endDate: string
  isActive: boolean
  isDefault: boolean
  studentCount: number
  applicantCount: number
  status: "upcoming" | "active" | "completed"
}

export default function AcademicYearsPage() {
  const { t } = useTranslation()
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null)
  const [deleteYearId, setDeleteYearId] = useState<string | null>(null)
  const [promoteYearId, setPromoteYearId] = useState<string | null>(null)
  const [viewDetailsYear, setViewDetailsYear] = useState<AcademicYear | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [yearDetails, setYearDetails] = useState<any>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [formData, setFormData] = useState({
    year: "",
    startDate: "",
    endDate: "",
    isActive: false,
    isDefault: false,
  })

  const fetchAcademicYears = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/academic-years")
      if (response.ok) {
        const data = await response.json()
        setAcademicYears(data)
      }
    } catch (error) {
      console.error("Error fetching academic years:", error)
      toast({
        title: "Error",
        description: "Failed to load academic years",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAcademicYears()
  }, [])

  const handleAddYear = async () => {
    try {
      const response = await fetch("/api/admin/academic-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchAcademicYears()
        setIsAddDialogOpen(false)
        setFormData({ year: "", startDate: "", endDate: "", isActive: false, isDefault: false })
        toast({ title: "Success", description: "Academic year added successfully" })
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Failed to add academic year", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add academic year", variant: "destructive" })
    }
  }

  const handleEditYear = async () => {
    if (!selectedYear) return

    try {
      const response = await fetch(`/api/admin/academic-years/${selectedYear._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchAcademicYears()
        setIsEditDialogOpen(false)
        setSelectedYear(null)
        toast({ title: "Success", description: "Academic year updated successfully" })
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Failed to update academic year", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update academic year", variant: "destructive" })
    }
  }

  const handleDeleteYear = async () => {
    if (!deleteYearId) return

    try {
      const response = await fetch(`/api/admin/academic-years/${deleteYearId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchAcademicYears()
        toast({ title: "Success", description: "Academic year deleted successfully" })
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Failed to delete academic year", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete academic year", variant: "destructive" })
    } finally {
      setDeleteYearId(null)
    }
  }

  const handleSetActive = async (yearId: string) => {
    try {
      const response = await fetch(`/api/admin/academic-years/${yearId}/set-active`, {
        method: "PUT",
      })

      if (response.ok) {
        fetchAcademicYears()
        toast({ title: "Success", description: "Active academic year updated" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to set active year", variant: "destructive" })
    }
  }

  const handlePromoteStudents = async () => {
    if (!promoteYearId) return

    try {
      const response = await fetch(`/api/admin/academic-years/${promoteYearId}/promote-students`, {
        method: "POST",
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: `${result.promotedCount} students promoted, ${result.graduatedCount} students graduated`,
        })
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Failed to promote students", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to promote students", variant: "destructive" })
    } finally {
      setPromoteYearId(null)
    }
  }

  const handleViewDetails = async (year: AcademicYear) => {
    setViewDetailsYear(year)
    setIsDetailsDialogOpen(true)
    setDetailsLoading(true)
    
    try {
      const response = await fetch(`/api/admin/academic-years/${year._id}/details`)
      if (response.ok) {
        const data = await response.json()
        setYearDetails(data)
      } else {
        toast({ title: "Error", description: "Failed to load year details", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load year details", variant: "destructive" })
    } finally {
      setDetailsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("Active")}
          </Badge>
        )
      case "upcoming":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            {t("Upcoming")}
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("Completed")}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Generate suggested academic year based on current date
  const generateSuggestedYear = () => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const startYear = currentMonth >= 9 ? currentYear : currentYear - 1

    const suggestedYear = `${startYear}-${startYear + 1}`
    const suggestedStartDate = `${startYear}-09-01`
    const suggestedEndDate = `${startYear + 1}-08-31`

    setFormData({
      year: suggestedYear,
      startDate: suggestedStartDate,
      endDate: suggestedEndDate,
      isActive: false,
      isDefault: false,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("Academic Year Management")}</h1>
          <p className="text-muted-foreground">{t("Manage academic years, terms, and student promotions")}</p>
        </div>
        <Button
          onClick={() => {
            generateSuggestedYear()
            setIsAddDialogOpen(true)
          }}
          className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Academic Year")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">{t("Total Years")}</CardTitle>
            <Calendar className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicYears.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">{t("Active Year")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicYears.find((y) => y.isActive)?.year || t("None")}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">{t("Total Students")}</CardTitle>
            <Users className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicYears.reduce((sum, year) => sum + year.studentCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Academic Years")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Academic Year")}</TableHead>
                  <TableHead>{t("Duration")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead>{t("Students")}</TableHead>
                  <TableHead>{t("Applicants")}</TableHead>
                  <TableHead>{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-600 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : academicYears.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">{t("No academic years found")}</p>
                        <Button
                          onClick={() => {
                            generateSuggestedYear()
                            setIsAddDialogOpen(true)
                          }}
                          variant="outline"
                        >
                          {t("Create First Academic Year")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  academicYears.map((year) => (
                    <TableRow key={year._id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{year.year}</span>
                          {year.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t("Default")}
                            </Badge>
                          )}
                          {year.isActive && (
                            <Badge className="bg-green-100 text-green-800 text-xs border-green-200">{t("Current")}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(year.startDate).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">{t("to")} {new Date(year.endDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(year.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          {year.studentCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                          {year.applicantCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(year)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedYear(year)
                              setFormData({
                                year: year.year,
                                startDate: year.startDate.split("T")[0],
                                endDate: year.endDate.split("T")[0],
                                isActive: year.isActive,
                                isDefault: year.isDefault,
                              })
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!year.isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetActive(year._id)}
                              title="Set as active year"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {year.status === "completed" && year.studentCount > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPromoteYearId(year._id)}
                              title="Promote students"
                            >
                              <GraduationCap className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteYearId(year._id)}
                            disabled={year.studentCount > 0}
                            title={year.studentCount > 0 ? "Cannot delete year with students" : "Delete year"}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("Add New Academic Year")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">{t("Academic Year")} *</Label>
                <Input
                  id="year"
                  placeholder="e.g., 2025-2026"
                  value={formData.year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("Start Date")} *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t("End Date")} *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">{t("Set as Active")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="isDefault">{t("Set as Default")}</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button onClick={handleAddYear} className="bg-gradient-to-r from-golden-500 to-golden-600">
                {t("Add Academic Year")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("Edit Academic Year")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year">{t("Academic Year")} *</Label>
                <Input
                  id="edit-year"
                  value={formData.year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">{t("Start Date")} *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">{t("End Date")} *</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="edit-isActive">{t("Set as Active")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="edit-isDefault">{t("Set as Default")}</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button onClick={handleEditYear} className="bg-gradient-to-r from-golden-500 to-golden-600">
                {t("Update Academic Year")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteYearId} onOpenChange={() => setDeleteYearId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Are you sure?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("This will permanently delete this academic year. This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteYear} className="bg-red-600 hover:bg-red-700">
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote Students Confirmation Dialog */}
      <AlertDialog open={!!promoteYearId} onOpenChange={() => setPromoteYearId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Promote Students")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("This will promote all active students to the next class level. Students in Top class will be graduated.")}
              {t("This action cannot be undone. Make sure you have created the next academic year before proceeding.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePromoteStudents}
              className="bg-gradient-to-r from-golden-500 to-golden-600"
            >
              {t("Promote Students")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Academic Year Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Academic Year Details")} - {viewDetailsYear?.year}</DialogTitle>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-600"></div>
            </div>
          ) : yearDetails ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("Programs")}</p>
                        <p className="text-2xl font-bold">{yearDetails.stats.totalPrograms}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("Total Applicants")}</p>
                        <p className="text-2xl font-bold">{yearDetails.stats.totalApplicants}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("Approved")}</p>
                        <p className="text-2xl font-bold">{yearDetails.stats.applicantsByStatus.approved}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("Pending")}</p>
                        <p className="text-2xl font-bold">{yearDetails.stats.applicantsByStatus.pending}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Applicants List */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("Applicants List")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Child Name")}</TableHead>
                          <TableHead>{t("Parent")}</TableHead>
                          <TableHead>{t("Program")}</TableHead>
                          <TableHead>{t("Status")}</TableHead>
                          <TableHead>{t("Applied Date")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {yearDetails.applicants.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              {t("No applicants found for this academic year")}
                            </TableCell>
                          </TableRow>
                        ) : (
                          yearDetails.applicants.map((applicant: any) => (
                            <TableRow key={applicant._id}>
                              <TableCell className="font-medium">{applicant.childName}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{applicant.fatherName}</div>
                                  <div className="text-sm text-muted-foreground">{applicant.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>{applicant.programName}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={applicant.status === 'approved' ? 'default' : 
                                          applicant.status === 'rejected' ? 'destructive' : 
                                          applicant.status === 'under_review' ? 'secondary' : 'outline'}
                                >
                                  {applicant.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(applicant.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("Failed to load details")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
