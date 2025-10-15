import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendAdminNotification } from "@/lib/email-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const product = await db.collection("products").findOne({ _id: new ObjectId(id) })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const updates = await request.json()

    const oldProduct = await db.collection("products").findOne({ _id: new ObjectId(id) })
    if (!oldProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const oldStock = oldProduct.stock
    const newStock = updates.stock !== undefined ? updates.stock : oldStock

    await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    // Check for stock alerts
    if (newStock !== oldStock) {
      if (newStock === 0 && oldStock > 0) {
        // Product out of stock
        await db.collection("notifications").insertOne({
          type: "out_of_stock",
          title: "Product Out of Stock",
          message: `"${oldProduct.name}" is now out of stock`,
          isRead: false,
          createdAt: new Date(),
          relatedId: id,
          priority: "urgent",
          metadata: {
            productName: oldProduct.name,
            stockLevel: 0,
          },
        })

        await sendAdminNotification(
          "⚠️ Product Out of Stock - Urgent",
          `The product "${oldProduct.name}" is now completely out of stock.`,
          {
            "Product Name": oldProduct.name,
            Category: oldProduct.category,
            "Previous Stock": oldStock,
            "Current Stock": 0,
            "Product ID": id,
            Action: "Please restock this product as soon as possible",
          },
        )
      } else if (newStock < 5 && newStock > 0 && oldStock >= 5) {
        // Low stock alert
        await db.collection("notifications").insertOne({
          type: "low_stock",
          title: "Low Stock Alert",
          message: `"${oldProduct.name}" stock is running low (${newStock} remaining)`,
          isRead: false,
          createdAt: new Date(),
          relatedId: id,
          priority: "high",
          metadata: {
            productName: oldProduct.name,
            stockLevel: newStock,
          },
        })

        await sendAdminNotification("⚠️ Low Stock Alert", `The product "${oldProduct.name}" is running low on stock.`, {
          "Product Name": oldProduct.name,
          Category: oldProduct.category,
          "Current Stock": newStock,
          "Product ID": id,
          Action: "Consider restocking this product soon",
        })
      }
    }

    const updatedProduct = await db.collection("products").findOne({ _id: new ObjectId(id) })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const result = await db.collection("products").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
