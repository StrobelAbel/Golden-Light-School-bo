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
import { Search, Eye, ShoppingCart, User, Phone, Mail, Package, Clock, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
      <div className="page-root">
        <div className="content-card">
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-40" />
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
          <div className="page-title">{t("Manage Orders")}</div>
          <div className="page-subtitle">{t("Manage product orders and track sales")}</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{statusCounts.total}</div><div className="stat-card-label">{t("Total Orders")}</div></div>
            <div className="stat-card-icon blue"><ShoppingCart size={18} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{statusCounts.pending}</div><div className="stat-card-label">{t("Pending")}</div></div>
            <div className="stat-card-icon yellow"><Clock size={18} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{statusCounts.ready_for_pickup}</div><div className="stat-card-label">{t("Ready for Pickup")}</div></div>
            <div className="stat-card-icon blue"><Package size={18} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{statusCounts.completed}</div><div className="stat-card-label">{t("Completed")}</div></div>
            <div className="stat-card-icon green"><CheckCircle size={18} /></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "hsl(var(--muted-foreground))" }} />
          <Input placeholder={t("Search orders...")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-44 h-8 text-sm">
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

      {/* Table */}
      <div className="content-card">
        <div className="content-card-header">
          <span className="content-card-title"><ShoppingCart size={15} />{t("Orders")} ({filteredOrders.length})</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Order")}</th>
                <th>{t("Customer")}</th>
                <th>{t("Product")}</th>
                <th>{t("Amount")}</th>
                <th>{t("Status")}</th>
                <th>{t("Date")}</th>
                <th>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>#{order._id.slice(-6)}</div>
                    <div className="cell-muted">{t("Qty")}: {order.quantity}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.parentName}</div>
                    <div className="cell-muted" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Mail size={11} />{order.email}
                    </div>
                    <div className="cell-muted" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Phone size={11} />{order.phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.productName}</div>
                    <div className="cell-muted">{order.productPrice} {t("Rwf")} {t("each")}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: "hsl(142 71% 35%)" }}>{order.totalAmount} {t("Rwf")}</td>
                  <td>
                    <span className={`status-badge ${
                      order.status === "completed" ? "approved" :
                      order.status === "ready_for_pickup" ? "review" : "pending"
                    }`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="cell-muted">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-outline-sm" onClick={() => { setSelectedOrder(order); setAdminNotes(order.adminNotes || ""); setIsViewDialogOpen(true) }}>
                      <Eye size={13} />{t("View")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="empty-state">
              <ShoppingCart size={32} />
              <span className="empty-state-title">{t("No orders found")}</span>
              <span className="empty-state-sub">{searchTerm || selectedStatus !== "all" ? t("Try adjusting your search or filter criteria") : t("No orders have been placed yet")}</span>
            </div>
          )}
        </div>
      </div>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Order Details")}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div className="dialog-section">
                <div className="dialog-section-header"><ShoppingCart size={14} />{t("Order Details")}</div>
                <div className="dialog-section-body grid-2">
                  <div className="form-field"><span className="form-label">{t("Order ID")}</span><span className="form-value">#{selectedOrder._id.slice(-8)}</span></div>
                  <div className="form-field"><span className="form-label">{t("Order Date")}</span><span className="form-value">{new Date(selectedOrder.orderDate).toLocaleDateString()}</span></div>
                  <div className="form-field">
                    <span className="form-label">{t("Status")}</span>
                    <span className={`status-badge ${
                      selectedOrder.status === "completed" ? "approved" :
                      selectedOrder.status === "ready_for_pickup" ? "review" : "pending"
                    }`} style={{ width: "fit-content" }}>
                      {selectedOrder.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="form-field"><span className="form-label">{t("Total Amount")}</span><span className="form-value" style={{ fontWeight: 700, color: "hsl(142 71% 35%)" }}>{selectedOrder.totalAmount} Frw</span></div>
                </div>
              </div>

              <div className="dialog-section">
                <div className="dialog-section-header"><User size={14} />{t("Customer Information")}</div>
                <div className="dialog-section-body grid-2">
                  <div className="form-field"><span className="form-label">{t("Parent/Guardian Name")}</span><span className="form-value">{selectedOrder.parentName}</span></div>
                  <div className="form-field"><span className="form-label">Email</span><span className="form-value">{selectedOrder.email}</span></div>
                  <div className="form-field"><span className="form-label">{t("Phone")}</span><span className="form-value">{selectedOrder.phone}</span></div>
                </div>
              </div>

              <div className="dialog-section">
                <div className="dialog-section-header"><Package size={14} />{t("Product Information")}</div>
                <div className="dialog-section-body grid-2">
                  <div className="form-field"><span className="form-label">{t("Product")}</span><span className="form-value">{selectedOrder.productName}</span></div>
                  <div className="form-field"><span className="form-label">{t("Unit Price")}</span><span className="form-value">{selectedOrder.productPrice} Rwf</span></div>
                  <div className="form-field"><span className="form-label">{t("Quantity")}</span><span className="form-value">{selectedOrder.quantity}</span></div>
                  <div className="form-field"><span className="form-label">{t("Total")}</span><span className="form-value" style={{ fontWeight: 700 }}>{selectedOrder.totalAmount} {t("Rwf")}</span></div>
                </div>
              </div>

              <div className="dialog-section">
                <div className="dialog-section-header">{t("Admin Notes")}</div>
                <div className="dialog-section-body">
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={t("Add notes about this order...")}
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="dialog-section">
                <div className="dialog-section-header">{t("Update Order Status")}</div>
                <div className="dialog-section-body">
                  <div className="status-action-bar">
                    {selectedOrder.status !== "ready_for_pickup" && (
                      <button className="btn-accent" onClick={() => updateOrderStatus(selectedOrder._id, "ready_for_pickup", adminNotes)}>{t("Mark Ready for Pickup")}</button>
                    )}
                    {selectedOrder.status !== "completed" && (
                      <button className="btn-success" onClick={() => updateOrderStatus(selectedOrder._id, "completed", adminNotes)}>{t("Mark as Completed")}</button>
                    )}
                    {selectedOrder.status !== "pending" && (
                      <button className="btn-outline-sm" onClick={() => updateOrderStatus(selectedOrder._id, "pending", adminNotes)}>{t("Mark as Pending")}</button>
                    )}
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