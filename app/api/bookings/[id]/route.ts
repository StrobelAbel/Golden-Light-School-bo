import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import type { Booking } from "@/lib/models/Booking"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const booking = await db.collection<Booking>("bookings").findOne({ _id: new ObjectId(id) })

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      booking,
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch booking",
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
          message: "Invalid booking ID",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()

    const updateData: Partial<Booking> = {}

    if (body.status) {
      updateData.status = body.status
      if (body.status === "confirmed") {
        updateData.confirmedAt = new Date()
        updateData.confirmedBy = body.confirmedBy || "Admin"
      }
    }

    if (body.notes) {
      updateData.notes = body.notes
    }

    if (body.date) {
      updateData.date = body.date
    }

    if (body.time) {
      updateData.time = body.time
    }

    const result = await db.collection<Booking>("bookings").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking",
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
          message: "Invalid booking ID",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const result = await db.collection<Booking>("bookings").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete booking",
      },
      { status: 500 },
    )
  }
}
