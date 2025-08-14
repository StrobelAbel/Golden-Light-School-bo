"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, ShoppingCart, Calendar, TrendingUp, DollarSign, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin-layout"
import { useState, useEffect } from "react"

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    pendingApplications: 0,
    totalProducts: 48,
    pendingBookings: 0,
    monthlyRevenue: 15420,
    activeOrders: 23,
  })

  const [recentApplications, setRecentApplications] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, bookingsRes] = await Promise.all([fetch("/api/applications"), fetch("/api/bookings")])

      const applicationsData = await applicationsRes.json()
      const bookingsData = await bookingsRes.json()

      if (applicationsData.success && bookingsData.success) {
        const applications = applicationsData.applications
        const bookings = bookingsData.bookings

        setDashboardStats((prev) => ({
          ...prev,
          totalStudents: applications.filter((app) => app.status === "approved").length,
          pendingApplications: applications.filter((app) => app.status === "pending").length,
          pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
        }))

        setRecentApplications(applications.slice(0, 4))
        setRecentBookings(bookings.slice(0, 3))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const recentOrders = [
    { id: 1, customer: "John Smith", product: "Interactive Learning Tablet", amount: 89.99, status: "shipped" },
    { id: 2, customer: "Amy Johnson", product: "Bluetooth Sound System", amount: 149.99, status: "processing" },
    { id: 3, customer: "Tom Wilson", product: "Math Learning Kit", amount: 59.99, status: "delivered" },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening at Golden Light School.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{dashboardStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">+12 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <BookOpen className="h-4 w-4 text-golden-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golden-600">{dashboardStats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground">Requires review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardStats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Learning aids available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{dashboardStats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${dashboardStats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">Processing & shipped</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-600" />
                Recent Applications
              </CardTitle>
              <CardDescription>Latest admission applications requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{application.parentName}</p>
                      <p className="text-sm text-gray-600">
                        Child: {application.childName}, Age {application.childAge}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(application.submittedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "default"
                            : application.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          application.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : application.status === "pending"
                              ? "bg-golden-100 text-golden-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {application.status}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/admin/applications">View All Applications</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Recent Bookings
              </CardTitle>
              <CardDescription>Upcoming appointments and visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{booking.parentName}</p>
                      <p className="text-sm text-gray-600">
                        {booking.appointmentType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.date)} at {booking.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={booking.status === "confirmed" ? "default" : "secondary"}
                        className={
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-golden-100 text-golden-800"
                        }
                      >
                        {booking.status}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/admin/bookings">View All Bookings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest product orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-sm text-gray-600">{order.product}</p>
                    <p className="text-sm font-semibold text-green-600">${order.amount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        order.status === "delivered" ? "default" : order.status === "shipped" ? "secondary" : "outline"
                      }
                      className={
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-golden-100 text-golden-800"
                      }
                    >
                      {order.status}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                <Link href="/admin/products/new">Add New Product</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/admin/applications">Review Applications</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/admin/bookings">Manage Bookings</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/admin/school-info">Update School Info</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
