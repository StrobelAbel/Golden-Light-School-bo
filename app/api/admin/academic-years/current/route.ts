import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    // Try to find the active year
    let currentYear = await db.collection("academic-years").findOne({ isActive: true })

    // If no active year, try to find the default year
    if (!currentYear) {
      currentYear = await db.collection("academic-years").findOne({ isDefault: true })
    }

    // If still no year, find the year that includes today's date
    if (!currentYear) {
      const now = new Date()
      currentYear = await db.collection("academic-years").findOne({
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
    }

    // If still no year, return the most recent year
    if (!currentYear) {
      currentYear = await db.collection("academic-years").findOne({}, { sort: { startDate: -1 } })
    }

    if (!currentYear) {
      // Generate current academic year if none exists
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYearNum = now.getFullYear()
      const startYear = currentMonth >= 9 ? currentYearNum : currentYearNum - 1

      return NextResponse.json({
        year: `${startYear}-${startYear + 1}`,
        isGenerated: true,
      })
    }

    return NextResponse.json({
      _id: currentYear._id.toString(),
      year: currentYear.year,
      startDate: currentYear.startDate,
      endDate: currentYear.endDate,
      isActive: currentYear.isActive,
      isDefault: currentYear.isDefault,
    })
  } catch (error) {
    console.error("Error fetching current academic year:", error)
    return NextResponse.json({ error: "Failed to fetch current academic year" }, { status: 500 })
  }
}
