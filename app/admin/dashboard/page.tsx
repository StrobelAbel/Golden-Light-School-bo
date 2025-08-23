"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  FileText,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Plus,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProducts: number
  totalApplications: number
  totalOrders: number
  pendingApplications: number
  pendingOrders: number
  approvedApplications: number
  rejectedApplications: number
  completedOrders: number
  lowStockProducts: number
  recentApplications: any[]
  recentProducts: any[]
  recentOrders: any[]
  lowStockItems: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalApplications: 0,
    totalOrders: 0,
    pendingApplications: 0,
    pendingOrders: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    completedOrders: 0,
    lowStockProducts: 0,
    recentApplications: [],
    recentProducts: [],
    recentOrders: [],
    lowStockItems: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [productsRes, applicationsRes, ordersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/applications"),
        fetch("/api/orders"),
      ])

      const products = await productsRes.json()
      const applications = await applicationsRes.json()
      const orders = await ordersRes.json()

      const lowStockItems = products.filter((product: any) => product.stock < 5)

      const dashboardStats: DashboardStats = {
        totalProducts: products.length,
        totalApplications: applications.length,
        totalOrders: orders.length,
        pendingApplications: applications.filter((app: any) => app.status === "pending").length,
        pendingOrders: orders.filter((order: any) => order.status === "pending").length,
        approvedApplications: applications.filter((app: any) => app.status === "approved").length,
        rejectedApplications: applications.filter((app: any) => app.status === "rejected").length,
        completedOrders: orders.filter((order: any) => order.status === "completed").length,
        lowStockProducts: lowStockItems.length,
        recentApplications: applications.slice(0, 5),
        recentProducts: products.slice(0, 5),
        recentOrders: orders.slice(0, 5),
        lowStockItems: lowStockItems.slice(0, 5),
      }

      setStats(dashboardStats)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "under_review":
      case "ready_for_pickup":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "under_review":
      case "ready_for_pickup":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-golden-500 to-cyan-500 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Golden Light School Admin</h1>
        <p className="text-golden-100">
          Manage your school's products, orders, applications, and more from this dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
                <p className="text-blue-100 text-xs mt-1">
                  {stats.lowStockProducts > 0 && `${stats.lowStockProducts} low stock`}
                </p>
              </div>
              <Package className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
                <p className="text-green-100 text-xs mt-1">{stats.pendingOrders} pending</p>
              </div>
              <ShoppingCart className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Applications</p>
                <p className="text-3xl font-bold">{stats.totalApplications}</p>
                <p className="text-purple-100 text-xs mt-1">{stats.pendingApplications} pending</p>
              </div>
              <FileText className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                <p className="text-yellow-100 text-xs mt-1">Need attention</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Low Stock</p>
                <p className="text-3xl font-bold">{stats.lowStockProducts}</p>
                <p className="text-red-100 text-xs mt-1">Items need restocking</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin/products">
              <Button className="w-full h-20 bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 flex flex-col items-center justify-center space-y-2">
                <Plus className="h-6 w-6" />
                <span>Add New Product</span>
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button className="w-full h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex flex-col items-center justify-center space-y-2">
                <ShoppingCart className="h-6 w-6" />
                <span>Manage Orders</span>
              </Button>
            </Link>
            <Link href="/admin/applications">
              <Button className="w-full h-20 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 flex flex-col items-center justify-center space-y-2">
                <Eye className="h-6 w-6" />
                <span>Review Applications</span>
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button className="w-full h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 flex flex-col items-center justify-center space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Recent Orders
            </CardTitle>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{order.parentName}</p>
                      <p className="text-sm text-gray-600">
                        {order.productName} (Qty: {order.quantity})
                      </p>
                      <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{order.totalAmount.toFixed(2)} Frw</p>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status.replace("_", " ")}</span>
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
              Low Stock Alert
            </CardTitle>
            <Link href="/admin/products">
              <Button variant="outline" size="sm">
                Manage Stock
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowStockItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">All products are well stocked</p>
              ) : (
                stats.lowStockItems.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="mb-1">
                        {product.stock} left
                      </Badge>
                      <p className="text-sm font-bold text-green-600">{product.price} Frw</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Recent Applications
          </CardTitle>
          <Link href="/admin/applications">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-4 col-span-full">No applications yet</p>
            ) : (
              stats.recentApplications.map((application) => (
                <div key={application._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-900">{application.parentName}</p>
                    <Badge className={getStatusColor(application.status)}>{getStatusIcon(application.status)}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Child: {application.childName}</p>
                  <p className="text-xs text-gray-500">{new Date(application.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">Database</p>
                <p className="text-sm text-green-700">Connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">API Services</p>
                <p className="text-sm text-green-700">Operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">Orders System</p>
                <p className="text-sm text-green-700">Active</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">Notifications</p>
                <p className="text-sm text-green-700">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
