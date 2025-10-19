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

    // Validate required fields
    if (!body.academicYear) {
      return NextResponse.json({ error: "Academic Year is required" }, { status: 400 })
    }

    // Verify academic year exists
    const academicYearExists = await db.collection("academic-years").findOne({ year: body.academicYear })
    if (!academicYearExists) {
      return NextResponse.json({ error: "Selected Academic Year does not exist" }, { status: 400 })
    }

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
      category: "admissions",
      title: "New Admission Program Created",
      message: `New admission program "${program.name}" has been created for ${program.academicYear}`,
      isRead: false,
      createdAt: new Date(),
      relatedId: result.insertedId.toString(),
      priority: "medium",
      actions: [{
        label: "View Program",
        url: `/admin/admissions`,
        type: "primary"
      }],
      metadata: {
        programName: program.name,
      },
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating admission program:", error)
    return NextResponse.json({ error: "Failed to create admission program" }, { status: 500 })
  }
}
