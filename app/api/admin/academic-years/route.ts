import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    // Fetch all academic years
    const academicYears = await db.collection("academic-years").find({}).sort({ startDate: -1 }).toArray()

    // Calculate student count, applicant count and status for each year
    const enrichedYears = await Promise.all(
      academicYears.map(async (year) => {
        // Get programs for this academic year
        const programs = await db.collection("admissionPrograms")
          .find({ academicYear: year.year })
          .project({ _id: 1 })
          .toArray()
        
        const programIds = programs.map(p => p._id.toString())
        
        // Get approved applications for these programs
        const applications = await db.collection("applications")
          .find({ 
            programId: { $in: programIds },
            status: "approved"
          })
          .project({ _id: 1 })
          .toArray()
        
        const applicationIds = applications.map(a => a._id.toString())
        
        // Count students: both manually added and from approved applications
        const studentCount = await db.collection("students").countDocuments({
          $or: [
            { academicYear: year.year },
            { applicationId: { $in: applicationIds } }
          ]
        })
        
        // Count all applicants (not just approved ones)
        const applicantCount = await db.collection("applications").countDocuments({
          programId: { $in: programIds }
        })

        const now = new Date()
        const startDate = new Date(year.startDate)
        const endDate = new Date(year.endDate)

        let status: "upcoming" | "active" | "completed"
        if (now < startDate) {
          status = "upcoming"
        } else if (now > endDate) {
          status = "completed"
        } else {
          status = "active"
        }

        return {
          ...year,
          _id: year._id.toString(),
          studentCount,
          applicantCount,
          status,
        }
      }),
    )

    return NextResponse.json(enrichedYears)
  } catch (error) {
    console.error("Error fetching academic years:", error)
    return NextResponse.json({ error: "Failed to fetch academic years" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const data = await request.json()

    // Validate required fields
    if (!data.year || !data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Year, start date, and end date are required" }, { status: 400 })
    }

    // Check if year already exists
    const existingYear = await db.collection("academic-years").findOne({ year: data.year })

    if (existingYear) {
      return NextResponse.json({ error: "Academic year already exists" }, { status: 400 })
    }

    // If this is set as active, deactivate all other years
    if (data.isActive) {
      await db.collection("academic-years").updateMany({}, { $set: { isActive: false } })
    }

    // If this is set as default, remove default from all other years
    if (data.isDefault) {
      await db.collection("academic-years").updateMany({}, { $set: { isDefault: false } })
    }

    const newYear = {
      year: data.year,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isActive: data.isActive || false,
      isDefault: data.isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("academic-years").insertOne(newYear)

    return NextResponse.json({
      message: "Academic year created successfully",
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating academic year:", error)
    return NextResponse.json({ error: "Failed to create academic year" }, { status: 500 })
  }
}
