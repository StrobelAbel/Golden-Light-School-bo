import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    // Get admission settings to check global status
    const settings = await db.collection("admissionSettings").findOne({})

    if (!settings || settings.globalStatus === "closed") {
      return NextResponse.json({
        programs: [],
        settings: settings || { globalStatus: "closed" },
      })
    }

    // Only return active programs with open admissions
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
