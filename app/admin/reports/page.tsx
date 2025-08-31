"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calendar, TrendingUp, Package, DollarSign, Download } from "lucide-react"

interface SalesReport {
  productId: string
  productName: string
  totalQuantitySold: number
  totalRevenue: number
  orderCount: number
}

export default function AdminReportsPage() {
  const [salesData, setSalesData] = useState<SalesReport[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalItemsSold, setTotalItemsSold] = useState(0)

  useEffect(() => {
    // Set default date range to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    setDateFrom(firstDay.toISOString().split("T")[0])
    setDateTo(lastDay.toISOString().split("T")[0])
  }, [])

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchSalesReport()
    }
  }, [dateFrom, dateTo])

  const fetchSalesReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)

      const response = await fetch(`/api/orders/reports?${params}`)
      const data = await response.json()
      setSalesData(data)

      // Calculate totals
      const revenue = data.reduce((sum: number, item: SalesReport) => sum + item.totalRevenue, 0)
      const orders = data.reduce((sum: number, item: SalesReport) => sum + item.orderCount, 0)
      const items = data.reduce((sum: number, item: SalesReport) => sum + item.totalQuantitySold, 0)

      setTotalRevenue(revenue)
      setTotalOrders(orders)
      setTotalItemsSold(items)
    } catch (error) {
      console.error("Error fetching sales report:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ["Product Name", "Quantity Sold", "Revenue", "Orders"]
    const csvContent = [
      headers.join(","),
      ...salesData.map((item) =>
        [`"${item.productName}"`, item.totalQuantitySold, item.totalRevenue, item.orderCount].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${dateFrom}-to-${dateTo}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const chartColors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#84CC16", "#F97316"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-gray-600">Track product sales and revenue over time</p>
        </div>
        <Button onClick={exportToCSV} disabled={salesData.length === 0} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label htmlFor="dateTo">To Date</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <Button onClick={fetchSalesReport} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">{totalRevenue} Frw</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold">{totalOrders}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Items Sold</p>
                <p className="text-3xl font-bold">{totalItemsSold}</p>
              </div>
              <Package className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {salesData.length > 0 ? (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Product</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} fontSize={12} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`Frw ${Number(value)}`, "Revenue"]} />
                    <Bar dataKey="totalRevenue" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quantity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Quantity Sold by Product</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ productName, totalQuantitySold }) => `${productName}: ${totalQuantitySold}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalQuantitySold"
                    >
                      {salesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Sales Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-gray-600">Product Name</th>
                      <th className="text-left p-4 font-medium text-gray-600">Quantity Sold</th>
                      <th className="text-left p-4 font-medium text-gray-600">Total Revenue</th>
                      <th className="text-left p-4 font-medium text-gray-600">Number of Orders</th>
                      <th className="text-left p-4 font-medium text-gray-600">Avg. Order Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((item, index) => (
                      <tr key={item.productId} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{item.productName}</td>
                        <td className="p-4 text-gray-600">{item.totalQuantitySold}</td>
                        <td className="p-4 font-bold text-green-600">{item.totalRevenue} Frw</td>
                        <td className="p-4 text-gray-600">{item.orderCount}</td>
                        <td className="p-4 text-gray-600">{(item.totalRevenue / item.orderCount).toFixed(2)} Frw</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Sales Data</h3>
            <p className="text-gray-600 mb-6">
              {loading ? "Loading sales data..." : "No completed orders found for the selected period"}
            </p>
            {!loading && (
              <Button onClick={fetchSalesReport} className="bg-blue-600 hover:bg-blue-700">
                Generate Report
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
