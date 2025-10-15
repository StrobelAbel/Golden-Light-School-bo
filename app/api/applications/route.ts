import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendApplicationStatusEmail, sendAdminNotification } from "@/lib/email-service"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const { searchParams } = new URL(request.url)

    const filters: any = {}

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

    if (program.status !== "active" || program.admissionStatus !== "open") {
      return NextResponse.json(
        {
          error: "Program admissions are closed",
          success: false,
        },
        { status: 400 },
      )
    }

    if (program.deadlines?.applicationEnd) {
      const deadline = new Date(program.deadlines.applicationEnd)
      if (new Date() > deadline) {
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

    // Check capacity
    const currentApplications = await db.collection("applications").countDocuments({
      programId: applicationData.programId,
      status: { $in: ["pending", "approved"] },
    })

    if (currentApplications >= program.capacity) {
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

    // Update program enrollment
    await db.collection("admissionPrograms").updateOne(
      { _id: new ObjectId(applicationData.programId) },
      {
        $inc: { currentEnrollment: 1 },
        $set: {
          updatedAt: new Date(),
          ...(currentApplications + 1 >= program.capacity
            ? {
                admissionStatus: "closed",
                status: "full",
              }
            : {}),
        },
      },
    )

    // Create ADMIN notification
    await db.collection("notifications").insertOne({
      type: "new_application",
      title: "New Application Received",
      message: `New admission application from ${application.fatherName} for ${application.childName} - ${program.name}`,
      isRead: false,
      createdAt: new Date(),
      relatedId: result.insertedId.toString(),
      priority: "high",
      metadata: {
        applicantName: `${application.fatherName} / ${application.childName}`,
        programName: program.name,
      },
    })

    // Send confirmation email to parent
    await sendApplicationStatusEmail(
      application.email,
      application.fatherName,
      application.childName,
      "submitted",
      program.name,
    )

    // Send admin notification email
    await sendAdminNotification("New Application Received", `A new admission application has been submitted.`, {
      Program: program.name,
      "Child Name": application.childName,
      "Father Name": application.fatherName,
      "Mother Name": application.motherName,
      Email: application.email,
      Phone: application.phone,
      "Application ID": result.insertedId.toString(),
      "Submitted At": new Date().toLocaleString(),
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
