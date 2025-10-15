import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models/Product"
import { sendAdminNotification } from "@/lib/email-service"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const { searchParams } = new URL(request.url)

    const filters: any = {}

    if (searchParams.get("category")) {
      filters.category = searchParams.get("category")
    }

    if (searchParams.get("search")) {
      const search = searchParams.get("search")
      filters.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const isVisibleParam = searchParams.get("isVisible")
    if (isVisibleParam !== null) {
      filters.isVisible = isVisibleParam === "true"
    }

    const products = await db.collection("products").find(filters).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const body = await request.json()

    const product: Omit<Product, "_id"> = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("products").insertOne(product)

    // Create ADMIN notification for new product
    await db.collection("notifications").insertOne({
      type: "new_product",
      title: "New Product Added",
      message: `Product "${product.name}" has been added to the catalog`,
      isRead: false,
      createdAt: new Date(),
      relatedId: result.insertedId.toString(),
      priority: "low",
      metadata: {
        productName: product.name,
        stockLevel: product.stock,
      },
    })

    // Send admin notification email
    await sendAdminNotification("New Product Added to Catalog", `A new product has been added to your store.`, {
      "Product Name": product.name,
      Category: product.category,
      Price: `${product.price} Frw`,
      "Stock Level": product.stock,
      Visibility: product.isVisible ? "Visible to public" : "Hidden",
      "Product ID": result.insertedId.toString(),
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
