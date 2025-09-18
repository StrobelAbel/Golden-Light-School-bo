import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const application = await db.collection("applications").findOne({
      _id: new ObjectId(params.id),
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const body = await request.json()

    // Get current application
    const currentApplication = await db.collection("applications").findOne({
      _id: new ObjectId(params.id),
    })

    if (!currentApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const oldStatus = currentApplication.status
    const newStatus = body.status

    // Update application
    const result = await db.collection("applications").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
    )

    // Handle capacity changes when status changes
    if (oldStatus !== newStatus && currentApplication.programId) {
      const program = await db.collection("admissionPrograms").findOne({
        _id: new ObjectId(currentApplication.programId),
      })

      if (program) {
        let enrollmentChange = 0

        // If application was rejected/cancelled, free up a spot
        if (
          (oldStatus === "pending" || oldStatus === "approved") &&
          (newStatus === "rejected" || newStatus === "cancelled")
        ) {
          enrollmentChange = -1
        }
        // If application was approved from pending, no change needed (already counted)
        // If application was reactivated from rejected/cancelled
        else if (
          (oldStatus === "rejected" || oldStatus === "cancelled") &&
          (newStatus === "pending" || newStatus === "approved")
        ) {
          enrollmentChange = 1
        }

        if (enrollmentChange !== 0) {
          const newEnrollment = Math.max(0, program.currentEnrollment + enrollmentChange)

          // Update program enrollment and status
          const updateData: any = {
            currentEnrollment: newEnrollment,
            updatedAt: new Date(),
          }

          // If spots are now available, reopen the program
          if (newEnrollment < program.capacity && program.status === "full") {
            updateData.status = "active"
            updateData.admissionStatus = "open"
          }
          // If program is now full, close it
          else if (newEnrollment >= program.capacity) {
            updateData.status = "full"
            updateData.admissionStatus = "closed"
          }

          await db
            .collection("admissionPrograms")
            .updateOne({ _id: new ObjectId(currentApplication.programId) }, { $set: updateData })
        }
      }
    }

    // Create notification for status change
    if (oldStatus !== newStatus) {
      const statusMessages = {
        approved: "Your application has been approved!",
        rejected: "Your application has been reviewed.",
        pending: "Your application is under review.",
        cancelled: "Your application has been cancelled.",
      }

      await db.collection("notifications").insertOne({
        type: "application_status_change",
        title: "Application Status Update",
        message: `Application for ${currentApplication.childName}: ${statusMessages[newStatus as keyof typeof statusMessages] || "Status updated"}`,
        isRead: false,
        createdAt: new Date(),
        relatedId: params.id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    // Get application before deleting to update program capacity
    const application = await db.collection("applications").findOne({
      _id: new ObjectId(params.id),
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Delete application
    await db.collection("applications").deleteOne({
      _id: new ObjectId(params.id),
    })

    // Update program capacity if application was pending or approved
    if ((application.status === "pending" || application.status === "approved") && application.programId) {
      const program = await db.collection("admissionPrograms").findOne({
        _id: new ObjectId(application.programId),
      })

      if (program) {
        const newEnrollment = Math.max(0, program.currentEnrollment - 1)

        const updateData: any = {
          currentEnrollment: newEnrollment,
          updatedAt: new Date(),
        }

        // If spots are now available, reopen the program
        if (newEnrollment < program.capacity && program.status === "full") {
          updateData.status = "active"
          updateData.admissionStatus = "open"
        }

        await db
          .collection("admissionPrograms")
          .updateOne({ _id: new ObjectId(application.programId) }, { $set: updateData })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
  }
}
