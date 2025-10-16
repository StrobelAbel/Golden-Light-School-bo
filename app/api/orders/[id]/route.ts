import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendOrderStatusEmail } from "@/lib/email-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const updates = await request.json()

    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const oldStatus = order.status
    const newStatus = updates.status

    // Handle stock updates based on status changes
    if (newStatus && newStatus !== oldStatus) {
      const product = await db.collection("products").findOne({ _id: new ObjectId(order.productId) })

      if (product) {
        // Deduct stock when order is confirmed
          if (
            (oldStatus === "pending" && newStatus === "confirmed") ||
            (oldStatus !== "completed" && newStatus === "completed")
          ) {
            await db.collection("products").updateOne(
              { _id: new ObjectId(order.productId) },
              {
                $inc: { stock: -order.quantity },
                $set: { updatedAt: new Date() },
              },
            )
        }

        // Restore stock if order is cancelled
        if ((oldStatus === "confirmed" || oldStatus === "pending") && newStatus === "cancelled") {
          await db.collection("products").updateOne(
            { _id: new ObjectId(order.productId) },
            {
              $inc: { stock: order.quantity },
              $set: { updatedAt: new Date() },
            },
          )
        }
      }
    }

    await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    // Send email notification to customer on important status changes
    if (newStatus && newStatus !== oldStatus && ["confirmed", "ready", "completed", "cancelled"].includes(newStatus)) {
      await sendOrderStatusEmail(
        order.email,
        order.parentName,
        order.productName,
        newStatus,
        id,
        order.quantity,
        order.totalAmount,
      )
    }

    const updatedOrder = await db.collection("orders").findOne({ _id: new ObjectId(id) })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Restore stock if order was confirmed
    if (order.status === "confirmed" || order.status === "ready") {
      await db.collection("products").updateOne(
        { _id: new ObjectId(order.productId) },
        {
          $inc: { stock: order.quantity },
          $set: { updatedAt: new Date() },
        },
      )
    }

    await db.collection("orders").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
