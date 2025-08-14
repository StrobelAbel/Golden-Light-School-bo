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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Calendar, MoreHorizontal, CheckCircle, XCircle, Clock, Phone, MapPin, Users, User } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import type { Booking } from "@/lib/models/Booking"

const appointmentTypeNames = {
  "school-tour": "School Tour",
  "admission-consultation": "Admission Consultation",
  "parent-meeting": "Parent Meeting",
  "product-demo": "Learning Aids Demo",
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter, typeFilter])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      const result = await response.json()

      if (result.success) {
        setBookings(result.bookings)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((booking) => booking.appointmentType === typeFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.childName && booking.childName.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredBookings(filtered)
  }

  const updateBookingStatus = async (id: string, status: string, notes?: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes: notes || reviewNotes,
          confirmedBy: "Admin", // In a real app, get from auth context
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchBookings()
        setSelectedBooking(null)
        setReviewNotes("")
      }
    } catch (error) {
      console.error("Error updating booking:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-golden-100 text-golden-800">Pending</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "school-tour":
        return <MapPin className="h-4 w-4" />
      case "admission-consultation":
        return <Users className="h-4 w-4" />
      case "parent-meeting":
        return <User className="h-4 w-4" />
      case "product-demo":
        return <Phone className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
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
            <p className="text-gray-600">Loading bookings...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-2">Manage appointments, tours, and consultations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter((b) => b.status === "confirmed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-golden-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golden-600">
                {bookings.filter((b) => b.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {bookings.filter((b) => new Date(b.date) >= new Date()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Management */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Management</CardTitle>
            <CardDescription>View and manage all appointment bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
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
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="school-tour">School Tour</SelectItem>
                  <SelectItem value="admission-consultation">Admission Consultation</SelectItem>
                  <SelectItem value="parent-meeting">Parent Meeting</SelectItem>
                  <SelectItem value="product-demo">Learning Aids Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bookings Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Child Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking._id?.toString()}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.parentName}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                          <div className="text-sm text-gray-500">{booking.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(booking.appointmentType)}
                          <span className="text-sm">{appointmentTypeNames[booking.appointmentType]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatDate(booking.date)}</div>
                          <div className="text-sm text-gray-500">{booking.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {booking.childName && (
                            <>
                              <div className="font-medium">{booking.childName}</div>
                              <div className="text-sm text-gray-500">Age {booking.childAge}</div>
                            </>
                          )}
                          <div className="text-sm text-gray-500">{booking.numberOfChildren} child(ren)</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateBookingStatus(booking._id!.toString(), "confirmed")}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateBookingStatus(booking._id!.toString(), "completed")}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              Call Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => updateBookingStatus(booking._id!.toString(), "cancelled")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No bookings found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details Dialog */}
        {selectedBooking && (
          <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription>Review and manage this appointment booking</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Parent Name</Label>
                    <p className="text-sm">{selectedBooking.parentName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-sm">{selectedBooking.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-sm">{selectedBooking.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Appointment Type</Label>
                    <p className="text-sm">{appointmentTypeNames[selectedBooking.appointmentType]}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date</Label>
                    <p className="text-sm">{formatDate(selectedBooking.date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Time</Label>
                    <p className="text-sm">{selectedBooking.time}</p>
                  </div>
                  {selectedBooking.childName && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Child Name</Label>
                        <p className="text-sm">{selectedBooking.childName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Child Age</Label>
                        <p className="text-sm">{selectedBooking.childAge}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Number of Children</Label>
                    <p className="text-sm">{selectedBooking.numberOfChildren}</p>
                  </div>
                </div>

                {selectedBooking.specialRequests && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Special Requests</Label>
                    <p className="text-sm">{selectedBooking.specialRequests}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-500">Current Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this booking..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => updateBookingStatus(selectedBooking._id!.toString(), "cancelled", reviewNotes)}
                    disabled={isUpdating}
                    className="bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateBookingStatus(selectedBooking._id!.toString(), "completed", reviewNotes)}
                    disabled={isUpdating}
                    className="bg-transparent"
                  >
                    Mark Complete
                  </Button>
                  <Button
                    onClick={() => updateBookingStatus(selectedBooking._id!.toString(), "confirmed", reviewNotes)}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? "Updating..." : "Confirm"}
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
