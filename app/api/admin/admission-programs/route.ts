import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { AdmissionProgram } from "@/lib/models/AdmissionProgram"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const { searchParams } = new URL(request.url)

    const includeInactive = searchParams.get("includeInactive") === "true"

    const filters: any = {}
    if (!includeInactive) {
      filters.status = { $ne: "inactive" }
    }

    const programs = await db.collection("admissionPrograms").find(filters).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(programs)
  } catch (error) {
    console.error("Error fetching admission programs:", error)
    return NextResponse.json({ error: "Failed to fetch admission programs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const body = await request.json()

    const program: Omit<AdmissionProgram, "_id"> = {
      ...body,
      currentEnrollment: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("admissionPrograms").insertOne(program)

    // Create notification
    await db.collection("notifications").insertOne({
      type: "system",
      title: "New Admission Program Created",
      message: `New admission program "${program.name}" has been created`,
      isRead: false,
      createdAt: new Date(),
      relatedId: result.insertedId.toString(),
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating admission program:", error)
    return NextResponse.json({ error: "Failed to create admission program" }, { status: 500 })
  }
}
