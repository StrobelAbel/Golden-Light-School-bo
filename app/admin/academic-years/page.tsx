"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/useTranslation"

interface AcademicYear {
  _id: string
  year: string
  startDate: string
  endDate: string
  isActive: boolean
  isDefault: boolean
  studentCount: number
  status: "upcoming" | "active" | "completed"
}

export default function AcademicYearsPage() {
  const { t } = useTranslation()
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null)
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
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add academic year", variant: "destructive" })
    }
  }

  const handleEditYear = async () => {
    try {
      const response = await fetch(`/api/admin/academic-years/${selectedYear?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        fetchAcademicYears()
        setIsEditDialogOpen(false)
        setSelectedYear(null)
        toast({ title: "Success", description: "Academic year updated successfully" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update academic year", variant: "destructive" })
    }
  }

  const handleDeleteYear = async (yearId: string) => {
    if (!confirm("Are you sure you want to delete this academic year?")) return
    
    try {
      const response = await fetch(`/api/admin/academic-years/${yearId}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        fetchAcademicYears()
        toast({ title: "Success", description: "Academic year deleted successfully" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete academic year", variant: "destructive" })
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

  const handlePromoteStudents = async (yearId: string) => {
    if (!confirm("This will promote all eligible students to the next class. Continue?")) return
    
    try {
      const response = await fetch(`/api/admin/academic-years/${yearId}/promote-students`, {
        method: "POST",
      })
      
      if (response.ok) {
        const result = await response.json()
        toast({ 
          title: "Success", 
          description: `${result.promotedCount} students promoted successfully` 
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to promote students", variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('Academic Year Management')}</h1>
          <p className="text-muted-foreground">{t('Manage academic years, terms, and fee structures')}</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('Add Academic Year')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('Academic Years')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Academic Year')}</TableHead>
                  <TableHead>{t('Duration')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead>{t('Students')}</TableHead>
                  <TableHead>{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-600 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : academicYears.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {t('No academic years found')}
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
                              Default
                            </Badge>
                          )}
                          {year.isActive && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(year.startDate).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            to {new Date(year.endDate).toLocaleDateString()}
                          </div>
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
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedYear(year)
                              setFormData({
                                year: year.year,
                                startDate: year.startDate.split('T')[0],
                                endDate: year.endDate.split('T')[0],
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
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {year.status === "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePromoteStudents(year._id)}
                            >
                              <GraduationCap className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteYear(year._id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('Add New Academic Year')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">{t('Academic Year')} *</Label>
                <Input
                  id="year"
                  placeholder="e.g., 2025-2026"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('Start Date')} *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t('End Date')} *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">{t('Set as Active')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="isDefault">{t('Set as Default')}</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t('Cancel')}
              </Button>
              <Button onClick={handleAddYear} className="bg-gradient-to-r from-golden-500 to-golden-600">
                {t('Add Academic Year')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('Edit Academic Year')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year">{t('Academic Year')} *</Label>
                <Input
                  id="edit-year"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">{t('Start Date')} *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">{t('End Date')} *</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="edit-isActive">{t('Set as Active')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="edit-isDefault">{t('Set as Default')}</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t('Cancel')}
              </Button>
              <Button onClick={handleEditYear} className="bg-gradient-to-r from-golden-500 to-golden-600">
                {t('Update Academic Year')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}