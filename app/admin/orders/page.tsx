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
import { Search, Eye, ShoppingCart, User, Phone, Mail, Package } from "lucide-react"

interface Order {
  _id: string
  productId: string
  productName: string
  productPrice: number
  quantity: number
  parentName: string
  email: string
  phone: string
  status: "pending" | "ready_for_pickup" | "completed"
  totalAmount: number
  orderDate: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export default function AdminOrdersPage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (id: string, status: string, notes = "") => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      })

      if (response.ok) {
        // Send email notification for status changes
        if (selectedOrder && (status === "ready_for_pickup" || status === "completed")) {
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: selectedOrder.email,
              customerName: selectedOrder.parentName,
              productName: selectedOrder.productName,
              status: status === "ready_for_pickup" ? "ready" : "completed",
              orderId: selectedOrder._id,
              quantity: selectedOrder.quantity,
              totalAmount: selectedOrder.totalAmount
            })
          })
        }
        
        fetchOrders()
        setIsViewDialogOpen(false)
        setSelectedOrder(null)
        setAdminNotes("")
      }
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "ready_for_pickup":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓"
      case "ready_for_pickup":
        return "📦"
      default:
        return "⏳"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    total: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    ready_for_pickup: orders.filter((order) => order.status === "ready_for_pickup").length,
    completed: orders.filter((order) => order.status === "completed").length,
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
        <h1 className="text-3xl font-bold text-gray-900">{t("Manage Orders")}</h1>
        <p className="text-gray-600">{t("Manage product orders and track sales")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("Total Orders")}</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("pending")}</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("ready")}</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.ready_for_pickup}</p>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("completed")}</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
              </div>
              <div className="text-2xl">✓</div>
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
                <SelectValue placeholder={t("All Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Status")}</SelectItem>
                <SelectItem value="pending">{t("Pending")}</SelectItem>
                <SelectItem value="ready_for_pickup">{t("Ready for Pickup")}</SelectItem>
                <SelectItem value="completed">{t("Completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Orders")} ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-600">{t("Order Details")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Customer")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Product")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Amount")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Status")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Order Date")}</th>
                  <th className="text-left p-4 font-medium text-gray-600">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{t("Order")} #{order._id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">{t("Qty")}: {order.quantity}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{order.parentName}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-1" />
                          {order.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.productName}</p>
                        <p className="text-sm text-gray-600">{order.productPrice} {t("Rwf")} {t("each")}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-green-600">{order.totalAmount} {t("Rwf")}</p>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)} {order.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order)
                          setAdminNotes(order.adminNotes || "")
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

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("No orders found")}</h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== "all"
                  ? t("Try adjusting your search or filter criteria")
                  : t("No orders have been placed yet")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Order Details")}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {t("Order Details")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Order ID")}</Label>
                    <p className="text-gray-900">#{selectedOrder._id.slice(-8)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Order Date")}</Label>
                    <p className="text-gray-900">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Status")}</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {getStatusIcon(selectedOrder.status)} {selectedOrder.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Total Amount")}</Label>
                    <p className="text-gray-900 font-bold text-lg">{selectedOrder.totalAmount} Frw</p>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    {t("Customer Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Parent/Guardian Name")}</Label>
                    <p className="text-gray-900">{selectedOrder.parentName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-gray-900">{selectedOrder.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t("Phone")}</Label>
                    <p className="text-gray-900">{selectedOrder.phone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    {t("Product Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-lg">{selectedOrder.productName}</h4>
                      <span className="text-lg font-bold text-green-600">
                        {selectedOrder.productPrice}  {t("each")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t("Quantity")}: {selectedOrder.quantity}</span>
                      <span className="text-xl font-bold text-gray-900">
                        {t("Total")}: {selectedOrder.totalAmount} {t("Rwf")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("Admin Notes")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedOrder.adminNotes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Current Notes")}</Label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.adminNotes}</p>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="notes">{t("Update Notes")}</Label>
                    <Textarea
                      id="notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder={t("Add notes about this order...")}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("Update Order Status")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.status !== "ready_for_pickup" && (
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder._id, "ready_for_pickup", adminNotes)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {t("Mark Ready for Pickup")}
                      </Button>
                    )}
                    {selectedOrder.status !== "completed" && (
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder._id, "completed", adminNotes)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {t("Mark as Completed")}
                      </Button>
                    )}
                    {selectedOrder.status !== "pending" && (
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder._id, "pending", adminNotes)}
                        variant="outline"
                      >
                        {t("Mark as Pending")}
                      </Button>
                    )}
                  </div>
                  {selectedOrder.status === "completed" && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Note:</strong> Marking as completed will automatically reduce the product stock.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
