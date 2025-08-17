"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, FileText, TrendingUp, Clock, CheckCircle, Star, GraduationCap, BookOpen } from "lucide-react"

interface DashboardStats {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  recentApplications: any[]
  recentBookings: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    recentApplications: [],
    recentBookings: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, bookingsRes] = await Promise.all([fetch("/api/applications"), fetch("/api/bookings")])

      const applications = await applicationsRes.json()
      const bookings = await bookingsRes.json()

      setStats({
        totalApplications: applications.length,
        pendingApplications: applications.filter((app: any) => app.status === "pending").length,
        approvedApplications: applications.filter((app: any) => app.status === "approved").length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((booking: any) => booking.status === "pending").length,
        confirmedBookings: bookings.filter((booking: any) => booking.status === "confirmed").length,
        recentApplications: applications.slice(0, 5),
        recentBookings: bookings.slice(0, 5),
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-golden-500 to-cyan-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome to Golden Light School</h1>
            <p className="text-golden-100 mt-1">Admin Dashboard - Nurturing Young Minds</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-golden-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-golden-600">{stats.totalApplications}</p>
              </div>
              <div className="p-3 bg-golden-100 rounded-full">
                <FileText className="h-6 w-6 text-golden-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-3xl font-bold text-cyan-600">{stats.pendingApplications}</p>
              </div>
              <div className="p-3 bg-cyan-100 rounded-full">
                <Clock className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Needs Review
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalBookings}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{stats.confirmedBookings} confirmed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Students</p>
                <p className="text-3xl font-bold text-purple-600">{stats.approvedApplications}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-gray-600">Future leaders</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <Card className="shadow-lg border-golden-200">
          <CardHeader className="bg-gradient-to-r from-golden-50 to-golden-100 border-b border-golden-200">
            <CardTitle className="flex items-center gap-2 text-golden-800">
              <BookOpen className="h-5 w-5" />
              Recent Applications
            </CardTitle>
            <CardDescription className="text-golden-600">Latest admission applications</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentApplications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {stats.recentApplications.map((application, index) => (
                  <div key={index} className="p-4 hover:bg-golden-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{application.studentName}</p>
                        <p className="text-sm text-gray-500">
                          Grade: {application.grade} • Age: {application.age}
                        </p>
                      </div>
                      <Badge
                        variant={application.status === "approved" ? "default" : "secondary"}
                        className={
                          application.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : application.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No applications yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="shadow-lg border-cyan-200">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-b border-cyan-200">
            <CardTitle className="flex items-center gap-2 text-cyan-800">
              <Calendar className="h-5 w-5" />
              Recent Bookings
            </CardTitle>
            <CardDescription className="text-cyan-600">Latest appointment bookings</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentBookings.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {stats.recentBookings.map((booking, index) => (
                  <div key={index} className="p-4 hover:bg-cyan-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{booking.parentName}</p>
                        <p className="text-sm text-gray-500">
                          {booking.bookingType} • {new Date(booking.preferredDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={booking.status === "confirmed" ? "default" : "secondary"}
                        className={
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No bookings yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-golden-200">
        <CardHeader className="bg-gradient-to-r from-golden-50 to-cyan-50 border-b border-golden-200">
          <CardTitle className="text-golden-800">Quick Actions</CardTitle>
          <CardDescription className="text-golden-600">Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 text-left rounded-lg border border-golden-200 hover:bg-golden-50 transition-colors">
              <FileText className="h-6 w-6 text-golden-600 mb-2" />
              <p className="font-medium text-gray-900">Review Applications</p>
              <p className="text-sm text-gray-500">Process new admissions</p>
            </button>
            <button className="p-4 text-left rounded-lg border border-cyan-200 hover:bg-cyan-50 transition-colors">
              <Calendar className="h-6 w-6 text-cyan-600 mb-2" />
              <p className="font-medium text-gray-900">Manage Bookings</p>
              <p className="text-sm text-gray-500">Schedule appointments</p>
            </button>
            <button className="p-4 text-left rounded-lg border border-green-200 hover:bg-green-50 transition-colors">
              <Users className="h-6 w-6 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Student Records</p>
              <p className="text-sm text-gray-500">Manage student data</p>
            </button>
            <button className="p-4 text-left rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors">
              <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">School performance</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
