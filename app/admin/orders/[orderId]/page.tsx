"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) throw new Error("Order not found")
        const data = await res.json()
        setOrder(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch order")
      } finally {
        setLoading(false)
      }
    }
    if (orderId) fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-golden-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <Card className="max-w-2xl mx-auto mt-12 shadow-lg border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error || "Order not found."}</p>
          <Button variant="outline" className="mt-6" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    "ready for pickup": "bg-blue-100 text-blue-700 border-blue-300",
    completed: "bg-green-100 text-green-700 border-green-300",
  }

  return (
    <Card className="max-w-2xl mx-auto mt-12 shadow-xl border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Order Details</CardTitle>
        <Badge className={statusColors[order.status.toLowerCase()] || ""}>
          {order.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-gray-700">Product</p>
            <p>{order.productName}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-gray-700">Quantity</p>
            <p>{order.quantity}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-gray-700">Parent Name</p>
            <p>{order.parentName}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-gray-700">Phone</p>
            <p>{order.phone}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-gray-700">Email</p>
            <p>{order.email}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-gray-700">Total Amount</p>
            <p className="font-medium text-golden-700">{order.totalAmount} Frw</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="font-semibold text-gray-700">Order Date</p>
            <p>{new Date(order.orderDate).toLocaleString()}</p>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
