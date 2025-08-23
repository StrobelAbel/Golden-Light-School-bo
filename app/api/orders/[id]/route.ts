import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const order = await db.collection("orders").findOne({ _id: new ObjectId(params.id) })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const body = await request.json()

    const currentOrder = await db.collection("orders").findOne({ _id: new ObjectId(params.id) })
    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    // If status is being changed to completed, reduce stock
    if (body.status === "completed" && currentOrder.status !== "completed") {
      const product = await db.collection("products").findOne({ _id: new ObjectId(currentOrder.productId) })
      if (product) {
        const newStock = Math.max(0, product.stock - currentOrder.quantity)
        await db.collection("products").updateOne(
          { _id: new ObjectId(currentOrder.productId) },
          {
            $set: {
              stock: newStock,
              isVisible: newStock > 0 ? product.isVisible : false,
              updatedAt: new Date(),
            },
          },
        )
      }
    }

    const result = await db.collection("orders").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
