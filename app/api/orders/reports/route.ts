import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const { searchParams } = new URL(request.url)

    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const matchStage: any = {
      status: "completed",
    }

    if (dateFrom || dateTo) {
      matchStage.orderDate = {}
      if (dateFrom) {
        matchStage.orderDate.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        matchStage.orderDate.$lte = new Date(dateTo)
      }
    }

    const salesReport = await db
      .collection("orders")
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$productId",
            productName: { $first: "$productName" },
            totalQuantitySold: { $sum: "$quantity" },
            totalRevenue: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
          },
        },
        {
          $project: {
            productId: "$_id",
            productName: 1,
            totalQuantitySold: 1,
            totalRevenue: 1,
            orderCount: 1,
            _id: 0,
          },
        },
        { $sort: { totalRevenue: -1 } },
      ])
      .toArray()

    return NextResponse.json(salesReport)
  } catch (error) {
    console.error("Error generating sales report:", error)
    return NextResponse.json({ error: "Failed to generate sales report" }, { status: 500 })
  }
}
