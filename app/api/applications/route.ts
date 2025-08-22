import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Application } from "@/lib/models/Application"

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

    if (searchParams.get("search")) {
      const search = searchParams.get("search")
      filters.$or = [
        { parentName: { $regex: search, $options: "i" } },
        { childName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    const applications = await db.collection("applications").find(filters).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const body = await request.json()

    const application: Omit<Application, "_id"> = {
      ...body,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("applications").insertOne(application)

    // Create notification for new application
    await db.collection("notifications").insertOne({
      type: "new_application",
      title: "New Application Received",
      message: `New admission application from ${application.parentName} for ${application.childName}`,
      isRead: false,
      createdAt: new Date(),
      relatedId: result.insertedId.toString(),
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}
