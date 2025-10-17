import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    // Deactivate all other years
    await db.collection("academic-years").updateMany({}, { $set: { isActive: false } })

    // Activate this year
    const result = await db
      .collection("academic-years")
      .updateOne({ _id: new ObjectId(params.id) }, { $set: { isActive: true, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Active year updated successfully" })
  } catch (error) {
    console.error("Error setting active year:", error)
    return NextResponse.json({ error: "Failed to set active year" }, { status: 500 })
  }
}
