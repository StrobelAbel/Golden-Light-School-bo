import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    // Get the academic year
    const year = await db.collection("academic-years").findOne({ _id: new ObjectId(params.id) })

    if (!year) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }

    // Get all active students in this year
    const students = await db
      .collection("students")
      .find({
        academicYear: year.year,
        status: "active",
      })
      .toArray()

    // Class promotion mapping
    const classPromotionMap: { [key: string]: string } = {
      Baby: "Middle",
      Middle: "Top",
      Top: "graduated", // Top class graduates
    }

    let promotedCount = 0
    let graduatedCount = 0

    // Get the next academic year (if exists)
    const nextYear = await db
      .collection("academic-years")
      .findOne({
        startDate: { $gt: year.endDate },
      })
      .sort({ startDate: 1 })

    const nextAcademicYear = nextYear?.year

    // Promote each student
    for (const student of students) {
      const currentClass = student.class
      const nextClass = classPromotionMap[currentClass]

      if (nextClass === "graduated") {
        // Graduate the student
        await db.collection("students").updateOne(
          { _id: student._id },
          {
            $set: {
              status: "graduated",
              statusDate: new Date(),
              statusReason: "Completed Top class",
              updatedAt: new Date(),
            },
          },
        )
        graduatedCount++
      } else if (nextClass && nextAcademicYear) {
        // Promote to next class
        await db.collection("students").updateOne(
          { _id: student._id },
          {
            $set: {
              class: nextClass,
              academicYear: nextAcademicYear,
              updatedAt: new Date(),
            },
          },
        )
        promotedCount++
      }
    }

    return NextResponse.json({
      message: "Students promoted successfully",
      promotedCount,
      graduatedCount,
      totalProcessed: promotedCount + graduatedCount,
    })
  } catch (error) {
    console.error("Error promoting students:", error)
    return NextResponse.json({ error: "Failed to promote students" }, { status: 500 })
  }
}
