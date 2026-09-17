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
import { Search, Eye, FileText, User, Phone, MapPin, Clock, CheckCircle, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
      <div className="page-root">
        <div className="content-card">
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-8" />
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{t("Application Management")}</div>
          <div className="page-subtitle">{t("Manage admission applications and student enrollment")}</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{statusCounts.total}</div><div className="stat-card-label">{t("Total")}</div></div>
            <div className="stat-card-icon blue"><FileText size={18} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{statusCounts.pending}</div><div className="stat-card-label">{t("Pending")}</div></div>
            <div className="stat-card-icon blue"><FileText size={18} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{statusCounts.under_review}</div><div className="stat-card-label">{t("Under Review")}</div></div>
            <div className="stat-card-icon yellow"><Clock size={18} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{statusCounts.approved}</div><div className="stat-card-label">{t("Approved")}</div></div>
            <div className="stat-card-icon green"><CheckCircle size={18} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{statusCounts.rejected}</div><div className="stat-card-label">{t("Rejected")}</div></div>
            <div className="stat-card-icon red"><XCircle size={18} /></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "hsl(var(--muted-foreground))" }} />
          <Input placeholder={t("Search applications...")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue placeholder={t("All Status")} />
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

      {/* Bulk actions */}
      {selectedApplications.length > 0 && (
        <div className="content-card">
          <div className="content-card-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              {selectedApplications.length} {t("selected")}
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn-outline-sm" onClick={() => { updateBulkApplicationStatus(selectedApplications, "under_review", "Bulk updated"); setSelectedApplications([]) }}>{t("Mark Under Review")}</button>
              <button className="btn-accent" style={{ background: "hsl(142 71% 40%)" }} onClick={() => { updateBulkApplicationStatus(selectedApplications, "approved", "Bulk approved"); setSelectedApplications([]) }}>{t("Approve")}</button>
              <button className="btn-accent" style={{ background: "hsl(0 84% 55%)" }} onClick={() => { updateBulkApplicationStatus(selectedApplications, "rejected", "Bulk rejected"); setSelectedApplications([]) }}>{t("Reject")}</button>
              <button className="btn-outline-sm" onClick={() => setSelectedApplications([])}>{t("Clear")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="content-card">
        <div className="content-card-header">
          <span className="content-card-title"><FileText size={15} />{t("Applications")} ({filteredApplications.length})</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox"
                    checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                    onChange={handleSelectAllApplications}
                    style={{ borderRadius: 4 }}
                  />
                </th>
                <th>{t("Parents")}</th>
                <th>{t("Contacts")}</th>
                <th>{t("Child")}</th>
                <th>{t("Status")}</th>
                <th>{t("Date")}</th>
                <th>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application._id}>
                  <td>
                    <input type="checkbox"
                      checked={selectedApplications.includes(application._id)}
                      onChange={() => handleSelectApplication(application._id)}
                      style={{ borderRadius: 4 }}
                    />
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{t("Father")}: <span style={{ fontWeight: 500 }}>{application.fatherName}</span></div>
                    <div style={{ fontSize: 13 }}>{t("Mother")}: <span style={{ fontWeight: 500 }}>{application.motherName}</span></div>
                  </td>
                  <td>
                    <div className="cell-muted" style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} />{application.fatherPhone}</div>
                    <div className="cell-muted" style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} />{application.motherPhone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{application.childName}</div>
                    <div className="cell-muted">{application.childAge} yrs · {application.childGender} · {application.childYear}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      application.status === "approved" ? "approved" :
                      application.status === "rejected" ? "rejected" :
                      application.status === "under_review" ? "review" : "pending"
                    }`}>
                      {application.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="cell-muted">{new Date(application.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-outline-sm" onClick={() => { setSelectedApplication(application); setIsViewDialogOpen(true) }}>
                      <Eye size={13} />{t("View")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredApplications.length === 0 && (
            <div className="empty-state">
              <FileText size={32} />
              <span className="empty-state-title">{t("No applications found")}</span>
              <span className="empty-state-sub">{searchTerm || selectedStatus !== "all" ? t("Try adjusting your search or filter criteria") : t("No applications yet")}</span>
            </div>
          )}
        </div>
      </div>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Application Details")}</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div className="dialog-section">
                <div className="dialog-section-header"><User size={14} />{t("Father Information")}</div>
                <div className="dialog-section-body grid-2">
                  <div className="form-field"><span className="form-label">{t("Father's Name")}</span><span className="form-value">{selectedApplication.fatherName}</span></div>
                  <div className="form-field"><span className="form-label">{t("Phone")}</span><span className="form-value">{selectedApplication.fatherPhone}</span></div>
                  <div className="form-field"><span className="form-label">{t("ID Number")}</span><span className="form-value">{selectedApplication.fatherId}</span></div>
                  <div className="form-field"><span className="form-label">Email</span><span className="form-value">{selectedApplication.fatherEmail}</span></div>
                </div>
              </div>

              {selectedApplication.motherName && (
                <div className="dialog-section">
                  <div className="dialog-section-header"><User size={14} />{t("Mother Information")}</div>
                  <div className="dialog-section-body grid-2">
                    <div className="form-field"><span className="form-label">{t("Mother's Name")}</span><span className="form-value">{selectedApplication.motherName}</span></div>
                    {selectedApplication.motherPhone && <div className="form-field"><span className="form-label">{t("Phone")}</span><span className="form-value">{selectedApplication.motherPhone}</span></div>}
                    {selectedApplication.motherId && <div className="form-field"><span className="form-label">{t("ID Number")}</span><span className="form-value">{selectedApplication.motherId}</span></div>}
                    {selectedApplication.motherEmail && <div className="form-field"><span className="form-label">Email</span><span className="form-value">{selectedApplication.motherEmail}</span></div>}
                  </div>
                </div>
              )}

              <div className="dialog-section">
                <div className="dialog-section-header"><User size={14} />{t("Child Information")}</div>
                <div className="dialog-section-body grid-2">
                  <div className="form-field"><span className="form-label">{t("Child's Name")}</span><span className="form-value">{selectedApplication.childName}</span></div>
                  <div className="form-field"><span className="form-label">{t("Age")}</span><span className="form-value">{selectedApplication.childAge} {t("years old")}</span></div>
                  <div className="form-field"><span className="form-label">{t("Gender")}</span><span className="form-value">{selectedApplication.childGender}</span></div>
                  <div className="form-field"><span className="form-label">{t("Date of Birth")}</span><span className="form-value">{new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</span></div>
                  <div className="form-field"><span className="form-label">{t("Level")}</span><span className="form-value">{selectedApplication.childYear}</span></div>
                </div>
              </div>

              {(selectedApplication.province || selectedApplication.district) && (
                <div className="dialog-section">
                  <div className="dialog-section-header"><MapPin size={14} />{t("Location Information")}</div>
                  <div className="dialog-section-body grid-2">
                    {selectedApplication.province && <div className="form-field"><span className="form-label">{t("Province")}</span><span className="form-value">{selectedApplication.province}</span></div>}
                    {selectedApplication.district && <div className="form-field"><span className="form-label">{t("District")}</span><span className="form-value">{selectedApplication.district}</span></div>}
                    {selectedApplication.sector && <div className="form-field"><span className="form-label">{t("Sector")}</span><span className="form-value">{selectedApplication.sector}</span></div>}
                    {selectedApplication.cell && <div className="form-field"><span className="form-label">{t("Cell")}</span><span className="form-value">{selectedApplication.cell}</span></div>}
                    {selectedApplication.village && <div className="form-field"><span className="form-label">{t("Village")}</span><span className="form-value">{selectedApplication.village}</span></div>}
                  </div>
                </div>
              )}

              {selectedApplication.additionalInfo && (
                <div className="dialog-section">
                  <div className="dialog-section-header">{t("Additional Information")}</div>
                  <div className="dialog-section-body"><span className="form-value">{selectedApplication.additionalInfo}</span></div>
                </div>
              )}

              <div className="dialog-section">
                <div className="dialog-section-header">{t("Status Management")}</div>
                <div className="dialog-section-body">
                  <div style={{ marginBottom: 10 }}>
                    <span className="form-label" style={{ display: "block", marginBottom: 6 }}>{t("Current Status")}</span>
                    <span className={`status-badge ${
                      selectedApplication.status === "approved" ? "approved" :
                      selectedApplication.status === "rejected" ? "rejected" :
                      selectedApplication.status === "under_review" ? "review" : "pending"
                    }`}>
                      {selectedApplication.status.replace("_", " ")}
                    </span>
                  </div>
                  <Textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder={t("Add any notes about this application...")}
                    rows={3}
                    className="text-sm mb-3"
                  />
                  <div className="status-action-bar">
                    <button className="btn-warning" onClick={() => updateApplicationStatus(selectedApplication._id, "under_review", statusNotes)}>{t("Mark Under Review")}</button>
                    <button className="btn-success" onClick={() => updateApplicationStatus(selectedApplication._id, "approved", statusNotes)}>{t("Approve")}</button>
                    <button className="btn-danger" onClick={() => updateApplicationStatus(selectedApplication._id, "rejected", statusNotes)}>{t("Reject")}</button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}