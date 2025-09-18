import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    // Get admission settings to check global status
    const settings = await db.collection("admissionSettings").findOne({})

    // If global status is closed, return empty programs array
    if (!settings || settings.globalStatus === "closed") {
      return NextResponse.json({
        programs: [],
        settings: settings || {
          globalStatus: "closed",
          closedMessage: "Admissions are currently closed. Please check back later for updates.",
          contactInfo: {
            phone: "+250 786 376 459",
            email: "goldenlight4.school@gmail.com",
            address: "Musanze, Rwanda",
          },
        },
      })
    }

    // If global status is scheduled, return empty programs array
    if (settings.globalStatus === "scheduled") {
      return NextResponse.json({
        programs: [],
        settings,
      })
    }

    // Only return active programs when global status is "open"
    const programs = await db
      .collection("admissionPrograms")
      .find({
        status: "active",
        admissionStatus: { $in: ["open", "scheduled"] },
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ programs, settings })
  } catch (error) {
    console.error("Error fetching public admission programs:", error)
    return NextResponse.json({ error: "Failed to fetch admission programs" }, { status: 500 })
  }
}
