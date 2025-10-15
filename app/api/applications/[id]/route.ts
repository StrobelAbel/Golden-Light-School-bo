import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendApplicationStatusEmail } from "@/lib/email-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const application = await db.collection("applications").findOne({ _id: new ObjectId(id) })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const updates = await request.json()

    const application = await db.collection("applications").findOne({ _id: new ObjectId(id) })
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const oldStatus = application.status
    const newStatus = updates.status

    // If status is changing to rejected/cancelled, free up the spot
    if (
      (oldStatus === "pending" || oldStatus === "approved") &&
      (newStatus === "rejected" || newStatus === "cancelled")
    ) {
      const program = await db.collection("admissionPrograms").findOne({
        _id: new ObjectId(application.programId),
      })

      if (program) {
        const currentApplications = await db.collection("applications").countDocuments({
          programId: application.programId,
          status: { $in: ["pending", "approved"] },
        })

        await db.collection("admissionPrograms").updateOne(
          { _id: new ObjectId(application.programId) },
          {
            $inc: { currentEnrollment: -1 },
            $set: {
              updatedAt: new Date(),
              // Reopen program if it was full
              ...(program.status === "full" && currentApplications - 1 < program.capacity
                ? {
                    admissionStatus: "open",
                    status: "active",
                  }
                : {}),
            },
          },
        )
      }
    }

    await db.collection("applications").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    // Send email notification to parent on status change
    if (newStatus && newStatus !== oldStatus && (newStatus === "approved" || newStatus === "rejected")) {
      const program = await db.collection("admissionPrograms").findOne({
        _id: new ObjectId(application.programId),
      })

      await sendApplicationStatusEmail(
        application.email,
        application.fatherName,
        application.childName,
        newStatus,
        program?.name,
      )
    }

    const updatedApplication = await db.collection("applications").findOne({ _id: new ObjectId(id) })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const application = await db.collection("applications").findOne({ _id: new ObjectId(id) })
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Free up the spot if application was pending or approved
    if (application.status === "pending" || application.status === "approved") {
      const program = await db.collection("admissionPrograms").findOne({
        _id: new ObjectId(application.programId),
      })

      if (program) {
        const currentApplications = await db.collection("applications").countDocuments({
          programId: application.programId,
          status: { $in: ["pending", "approved"] },
        })

        await db.collection("admissionPrograms").updateOne(
          { _id: new ObjectId(application.programId) },
          {
            $inc: { currentEnrollment: -1 },
            $set: {
              updatedAt: new Date(),
              ...(program.status === "full" && currentApplications - 1 < program.capacity
                ? {
                    admissionStatus: "open",
                    status: "active",
                  }
                : {}),
            },
          },
        )
      }
    }

    await db.collection("applications").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
  }
}
