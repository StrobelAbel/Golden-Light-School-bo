import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const program = await db.collection("admissionPrograms").findOne({ _id: new ObjectId(params.id) })

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    return NextResponse.json(program)
  } catch (error) {
    console.error("Error fetching admission program:", error)
    return NextResponse.json({ error: "Failed to fetch admission program" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const body = await request.json()

    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    const result = await db
      .collection("admissionPrograms")
      .updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating admission program:", error)
    return NextResponse.json({ error: "Failed to update admission program" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const result = await db.collection("admissionPrograms").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting admission program:", error)
    return NextResponse.json({ error: "Failed to delete admission program" }, { status: 500 })
  }
}
