import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
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

    if (searchParams.get("search")) {
      const search = searchParams.get("search")
      filters.$or = [
        { fatherName: { $regex: search, $options: "i" } },
        { motherName: { $regex: search, $options: "i" } },
        { childName: { $regex: search, $options: "i" } },
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
    const applicationData = await request.json()

    // Check global admission settings first
    const settings = await db.collection("admissionSettings").findOne({})
    if (!settings || settings.globalStatus !== "open") {
      return NextResponse.json(
        {
          error: "Admissions are currently closed",
          success: false,
        },
        { status: 400 },
      )
    }

    // Check if program exists and has capacity
    const program = await db.collection("admissionPrograms").findOne({
      _id: new ObjectId(applicationData.programId),
    })

    if (!program) {
      return NextResponse.json(
        {
          error: "Program not found",
          success: false,
        },
        { status: 404 },
      )
    }

    // Check if program is still active and open
    if (program.status !== "active" || program.admissionStatus !== "open") {
      return NextResponse.json(
        {
          error: "Program admissions are closed",
          success: false,
        },
        { status: 400 },
      )
    }

    // Check deadline
    if (program.deadlines?.applicationEnd) {
      const deadline = new Date(program.deadlines.applicationEnd)
      if (new Date() > deadline) {
        // Auto-close the program if deadline has passed
        await db
          .collection("admissionPrograms")
          .updateOne({ _id: new ObjectId(applicationData.programId) }, { $set: { admissionStatus: "closed" } })
        return NextResponse.json(
          {
            error: "Application deadline has passed",
            success: false,
          },
          { status: 400 },
        )
      }
    }

    // Check capacity - count pending and approved applications
    const currentApplications = await db.collection("applications").countDocuments({
      programId: applicationData.programId,
      status: { $in: ["pending", "approved"] },
    })

    if (currentApplications >= program.capacity) {
      // Auto-close program if full
      await db
        .collection("admissionPrograms")
        .updateOne(
          { _id: new ObjectId(applicationData.programId) },
          { $set: { admissionStatus: "closed", status: "full" } },
        )
      return NextResponse.json(
        {
          error: "Program is full",
          success: false,
        },
        { status: 400 },
      )
    }

    // Create application
    const application = {
      ...applicationData,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("applications").insertOne(application)

    // Update current enrollment count
    await db.collection("admissionPrograms").updateOne(
      { _id: new ObjectId(applicationData.programId) },
      {
        $inc: { currentEnrollment: 1 },
        $set: {
          updatedAt: new Date(),
          // Close program if it reaches capacity
          ...(currentApplications + 1 >= program.capacity
            ? {
                admissionStatus: "closed",
                status: "full",
              }
            : {}),
        },
      },
    )

    // Create notification for new application
    await db.collection("notifications").insertOne({
      type: "new_application",
      title: "New Application Received",
      message: `New admission application from ${application.fatherName} for ${application.childName}`,
      isRead: false,
      createdAt: new Date(),
      relatedId: result.insertedId.toString(),
    })

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      {
        error: "Failed to submit application",
        success: false,
      },
      { status: 500 },
    )
  }
}
