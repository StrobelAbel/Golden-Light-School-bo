import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import type { Application } from "@/lib/models/Application"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid application ID",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const application = await db.collection<Application>("applications").findOne({ _id: new ObjectId(id) })

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      application,
    })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch application",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid application ID",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()

    const updateData: Partial<Application> = {}

    if (body.status) {
      updateData.status = body.status
      updateData.reviewedAt = new Date()
      updateData.reviewedBy = body.reviewedBy || "Admin"
    }

    if (body.notes) {
      updateData.notes = body.notes
    }

    const result = await db
      .collection<Application>("applications")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update application",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid application ID",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const result = await db.collection<Application>("applications").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete application",
      },
      { status: 500 },
    )
  }
}
