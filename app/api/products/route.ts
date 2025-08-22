import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models/Product"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const { searchParams } = new URL(request.url)

    const filters: any = {}

    // Apply filters
    if (searchParams.get("category")) {
      filters.category = searchParams.get("category")
    }

    if (searchParams.get("search")) {
      const search = searchParams.get("search")
      filters.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (searchParams.get("isVisible") !== null) {
      filters.isVisible = searchParams.get("isVisible") === "true"
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

    // Create notification for new product
    await db.collection("notifications").insertOne({
      type: "system",
      title: "New Product Added",
      message: `Product "${product.name}" has been added to the catalog`,
      isRead: false,
      createdAt: new Date(),
      relatedId: result.insertedId.toString(),
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
