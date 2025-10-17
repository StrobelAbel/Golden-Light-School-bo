import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const data = await request.json()

    // If this is set as active, deactivate all other years
    if (data.isActive) {
      await db
        .collection("academic-years")
        .updateMany({ _id: { $ne: new ObjectId(params.id) } }, { $set: { isActive: false } })
    }

    // If this is set as default, remove default from all other years
    if (data.isDefault) {
      await db
        .collection("academic-years")
        .updateMany({ _id: { $ne: new ObjectId(params.id) } }, { $set: { isDefault: false } })
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (data.year) updateData.year = data.year
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)
    if (typeof data.isActive !== "undefined") updateData.isActive = data.isActive
    if (typeof data.isDefault !== "undefined") updateData.isDefault = data.isDefault

    const result = await db
      .collection("academic-years")
      .updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Academic year updated successfully" })
  } catch (error) {
    console.error("Error updating academic year:", error)
    return NextResponse.json({ error: "Failed to update academic year" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    // Check if there are students enrolled in this year
    const year = await db.collection("academic-years").findOne({ _id: new ObjectId(params.id) })

    if (!year) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }

    const studentCount = await db.collection("students").countDocuments({ academicYear: year.year })

    if (studentCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete academic year with ${studentCount} enrolled students`,
        },
        { status: 400 },
      )
    }

    const result = await db.collection("academic-years").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Academic year deleted successfully" })
  } catch (error) {
    console.error("Error deleting academic year:", error)
    return NextResponse.json({ error: "Failed to delete academic year" }, { status: 500 })
  }
}
