import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Order } from "@/lib/models/Order"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const { searchParams } = new URL(request.url)

    const filters: any = {}

    // Apply filters
    if (searchParams.get("status")) {
      filters.status = searchParams.get("status")
    }

    if (searchParams.get("productId")) {
      filters.productId = searchParams.get("productId")
    }

    if (searchParams.get("search")) {
      const search = searchParams.get("search")
      filters.$or = [
        { parentName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } },
      ]
    }

    // Date range filter
    if (searchParams.get("dateFrom") || searchParams.get("dateTo")) {
      filters.orderDate = {}
      if (searchParams.get("dateFrom")) {
        filters.orderDate.$gte = new Date(searchParams.get("dateFrom")!)
      }
      if (searchParams.get("dateTo")) {
        filters.orderDate.$lte = new Date(searchParams.get("dateTo")!)
      }
    }

    const orders = await db.collection("orders").find(filters).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const body = await request.json()

    // Verify product exists and has stock
    const product = await db.collection("products").findOne({ _id: new ObjectId(body.productId) })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.stock < body.quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    const order: Omit<Order, "_id"> = {
      productId: body.productId,
      productName: product.name,
      productPrice: product.price,
      quantity: body.quantity,
      parentName: body.parentName,
      email: body.email,
      phone: body.phone,
      status: "pending",
      totalAmount: product.price * body.quantity,
      orderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("orders").insertOne(order)

    // Create notification for new order
    await db.collection("notifications").insertOne({
      type: "new_order",
      title: "New Product Order",
      message: `New order from ${order.parentName} for ${order.productName} (Qty: ${order.quantity})`,
      isRead: false,
      createdAt: new Date(),
      relatedId: result.insertedId.toString(),
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
