"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import {
  Package, FileText, ShoppingCart, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, Eye, Plus, AlertTriangle,
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
  outOfStockProducts: number
  recentApplications: any[]
  recentOrders: any[]
  lowStockItems: any[]
  outOfStockItems: any[]
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, totalApplications: 0, totalOrders: 0,
    pendingApplications: 0, pendingOrders: 0, approvedApplications: 0,
    rejectedApplications: 0, completedOrders: 0, lowStockProducts: 0,
    outOfStockProducts: 0, recentApplications: [], recentOrders: [],
    lowStockItems: [], outOfStockItems: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      const [productsRes, applicationsRes, ordersRes] = await Promise.all([
        fetch("/api/products"), fetch("/api/applications"), fetch("/api/orders"),
      ])
      const products = await productsRes.json()
      const applications = await applicationsRes.json()
      const orders = await ordersRes.json()
      const lowStockItems = products.filter((p: any) => p.stock > 0 && p.stock < 5)
      const outOfStockItems = products.filter((p: any) => p.stock === 0)
      setStats({
        totalProducts: products.length,
        totalApplications: applications.length,
        totalOrders: orders.length,
        pendingApplications: applications.filter((a: any) => a.status === "pending").length,
        pendingOrders: orders.filter((o: any) => o.status === "pending").length,
        approvedApplications: applications.filter((a: any) => a.status === "approved").length,
        rejectedApplications: applications.filter((a: any) => a.status === "rejected").length,
        completedOrders: orders.filter((o: any) => o.status === "completed").length,
        lowStockProducts: lowStockItems.length,
        outOfStockProducts: outOfStockItems.length,
        recentApplications: applications.slice(0, 5),
        recentOrders: orders.slice(0, 5),
        lowStockItems: lowStockItems.slice(0, 5),
        outOfStockItems: outOfStockItems.slice(0, 5),
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "approved": case "completed": return "status-badge approved"
      case "rejected": return "status-badge rejected"
      case "under_review": case "ready_for_pickup": return "status-badge review"
      default: return "status-badge pending"
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved": case "completed": return <CheckCircle size={11} />
      case "rejected": return <XCircle size={11} />
      case "under_review": case "ready_for_pickup": return <Clock size={11} />
      default: return <AlertCircle size={11} />
    }
  }

  if (loading) {
    return <div className="page-spinner"><div className="page-spinner-inner" /></div>
  }

  const criticalStockItems = [...stats.outOfStockItems, ...stats.lowStockItems].slice(0, 5)
  const totalCriticalStock = stats.lowStockProducts + stats.outOfStockProducts

  return (
    <div className="page-root">

      {/* Welcome banner */}
      <div className="welcome-banner">
        <h2>{t("Welcome to Golden Light School Admin")}</h2>
        <p>{t("Manage your school's products, orders, applications, and more from this dashboard.")}</p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-value">{stats.totalProducts}</div>
              <div className="stat-card-label">{t("Total Products")}</div>
            </div>
            <div className="stat-card-icon blue"><Package size={18} /></div>
          </div>
          {totalCriticalStock > 0 && (
            <div className="stat-card-sub">
              {stats.outOfStockProducts > 0 && `${stats.outOfStockProducts} empty`}
              {stats.outOfStockProducts > 0 && stats.lowStockProducts > 0 && " · "}
              {stats.lowStockProducts > 0 && `${stats.lowStockProducts} low`}
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-value">{stats.totalOrders}</div>
              <div className="stat-card-label">{t("Total Orders")}</div>
            </div>
            <div className="stat-card-icon green"><ShoppingCart size={18} /></div>
          </div>
          <div className="stat-card-sub">{stats.pendingOrders} {t("pending")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-value">{stats.totalApplications}</div>
              <div className="stat-card-label">{t("Applications")}</div>
            </div>
            <div className="stat-card-icon purple"><FileText size={18} /></div>
          </div>
          <div className="stat-card-sub">{stats.pendingApplications} {t("pending")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-value">{stats.pendingOrders}</div>
              <div className="stat-card-label">{t("Pending Orders")}</div>
            </div>
            <div className="stat-card-icon yellow"><Clock size={18} /></div>
          </div>
          <div className="stat-card-sub">{t("Need attention")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-value">{totalCriticalStock}</div>
              <div className="stat-card-label">
                {stats.outOfStockProducts > 0 ? t("Critical Stock") : t("Low Stock")}
              </div>
            </div>
            <div className="stat-card-icon red"><AlertTriangle size={18} /></div>
          </div>
          <div className="stat-card-sub">
            {stats.outOfStockProducts > 0
              ? `${stats.outOfStockProducts} empty · ${stats.lowStockProducts} low`
              : t("Items need restocking")}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="content-card">
        <div className="content-card-header">
          <span className="content-card-title"><TrendingUp size={15} />{t("Quick Actions")}</span>
        </div>
        <div className="content-card-body">
          <div className="quick-actions">
            <Link href="/admin/products" className="quick-action-btn">
              <Plus size={20} />{t("Add New Product")}
            </Link>
            <Link href="/admin/orders" className="quick-action-btn">
              <ShoppingCart size={20} />{t("Manage Orders")}
            </Link>
            <Link href="/admin/applications" className="quick-action-btn">
              <Eye size={20} />{t("Review Applications")}
            </Link>
            <Link href="/admin/reports" className="quick-action-btn">
              <TrendingUp size={20} />{t("View Reports")}
            </Link>
          </div>
        </div>
      </div>

      {/* Recent orders + stock alert */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>

        {/* Recent orders */}
        <div className="content-card">
          <div className="content-card-header">
            <span className="content-card-title"><ShoppingCart size={15} />{t("Recent Orders")}</span>
            <Link href="/admin/orders" className="btn-outline-sm">{t("View All")}</Link>
          </div>
          <div className="content-card-body" style={{ padding: 0 }}>
            {stats.recentOrders.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={32} />
                <span className="empty-state-sub">{t("No orders yet")}</span>
              </div>
            ) : (
              <table className="data-table">
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{order.parentName}</div>
                        <div className="cell-muted">{order.productName} · qty {order.quantity}</div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, color: "hsl(142 71% 35%)" }}>{order.totalAmount} Frw</div>
                        <span className={statusBadgeClass(order.status)}>
                          {statusIcon(order.status)} {order.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Stock alert */}
        <div className="content-card">
          <div className="content-card-header">
            <span className="content-card-title">
              <AlertTriangle size={15} style={{ color: stats.outOfStockProducts > 0 ? "hsl(0 84% 55%)" : "hsl(30 95% 50%)" }} />
              {stats.outOfStockProducts > 0 ? t("Critical Stock Alert") : t("Low Stock Alert")}
            </span>
            <Link href="/admin/products" className="btn-outline-sm">{t("Manage Stock")}</Link>
          </div>
          <div className="content-card-body" style={{ padding: 0 }}>
            {criticalStockItems.length === 0 ? (
              <div className="empty-state">
                <Package size={32} />
                <span className="empty-state-sub">{t("All products are well stocked")}</span>
              </div>
            ) : (
              <table className="data-table">
                <tbody>
                  {criticalStockItems.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{product.name}</div>
                        <div className="cell-muted">{product.category}</div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className={product.stock === 0 ? "status-badge out-stock" : "status-badge low-stock"}>
                          {product.stock === 0 ? t("Out of Stock") : `${product.stock} ${t("left")}`}
                        </span>
                        <div className="cell-muted" style={{ marginTop: 2 }}>{product.price} Frw</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Recent applications */}
      <div className="content-card">
        <div className="content-card-header">
          <span className="content-card-title"><FileText size={15} />{t("Recent Applications")}</span>
          <Link href="/admin/applications" className="btn-outline-sm">{t("View All")}</Link>
        </div>
        <div className="content-card-body" style={{ padding: 0 }}>
          {stats.recentApplications.length === 0 ? (
            <div className="empty-state">
              <FileText size={32} />
              <span className="empty-state-sub">{t("No applications yet")}</span>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("Parent")}</th>
                  <th>{t("Child")}</th>
                  <th>{t("Date")}</th>
                  <th>{t("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentApplications.map((app) => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 500 }}>{app.parentName}</td>
                    <td className="cell-muted">{app.childName}</td>
                    <td className="cell-muted">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={statusBadgeClass(app.status)}>
                        {statusIcon(app.status)} {app.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* System status */}
      <div className="content-card">
        <div className="content-card-header">
          <span className="content-card-title"><AlertCircle size={15} />{t("System Status")}</span>
        </div>
        <div className="content-card-body">
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {[t("Database"), t("API Services"), t("Orders System"), t("Notifications")].map((label) => (
              <div key={label} className="status-dot-row">
                <span className="status-dot online" />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "hsl(142 60% 35%)" }}>{t("Operational")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
