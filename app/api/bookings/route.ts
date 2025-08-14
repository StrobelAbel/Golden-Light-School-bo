import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Booking } from "@/lib/models/Booking"

export async function GET() {
  try {
    const db = await getDatabase()
    const bookings = await db.collection<Booking>("bookings").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      bookings,
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["appointmentType", "date", "time", "parentName", "email", "phone"]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Validate appointment type
    const validTypes = ["school-tour", "admission-consultation", "parent-meeting", "product-demo"]
    if (!validTypes.includes(body.appointmentType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid appointment type",
        },
        { status: 400 },
      )
    }

    // Validate date is not in the past
    const appointmentDate = new Date(body.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (appointmentDate < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot book appointments in the past",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()

    // Check for existing booking at the same date/time
    const existingBooking = await db.collection<Booking>("bookings").findOne({
      date: body.date,
      time: body.time,
      status: { $in: ["pending", "confirmed"] },
    })

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "This time slot is already booked. Please choose another time.",
        },
        { status: 409 },
      )
    }

    const booking: Omit<Booking, "_id"> = {
      appointmentType: body.appointmentType,
      date: body.date,
      time: body.time,
      parentName: body.parentName,
      email: body.email,
      phone: body.phone,
      childName: body.childName || "",
      childAge: body.childAge || "",
      numberOfChildren: body.numberOfChildren || "1",
      specialRequests: body.specialRequests || "",
      status: "pending",
      createdAt: new Date(),
    }

    const result = await db.collection<Booking>("bookings").insertOne(booking)

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      bookingId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking",
      },
      { status: 500 },
    )
  }
}
