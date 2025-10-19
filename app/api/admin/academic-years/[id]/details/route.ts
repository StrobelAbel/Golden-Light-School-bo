import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    
    // Get the academic year
    const academicYear = await db.collection("academic-years").findOne({ _id: new ObjectId(params.id) })
    
    if (!academicYear) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }

    // Get programs for this academic year
    const programs = await db.collection("admissionPrograms")
      .find({ academicYear: academicYear.year })
      .toArray()

    const programIds = programs.map(p => p._id.toString())

    // Get applicants for programs in this academic year
    const applicants = await db.collection("applications")
      .find({ programId: { $in: programIds } })
      .sort({ createdAt: -1 })
      .toArray()

    // Enrich applicants with program information
    const enrichedApplicants = applicants.map(applicant => {
      const program = programs.find(p => p._id.toString() === applicant.programId)
      return {
        ...applicant,
        _id: applicant._id.toString(),
        programName: program?.name || "Unknown Program"
      }
    })

    return NextResponse.json({
      academicYear: {
        ...academicYear,
        _id: academicYear._id.toString()
      },
      programs: programs.map(p => ({ ...p, _id: p._id.toString() })),
      applicants: enrichedApplicants,
      stats: {
        totalPrograms: programs.length,
        totalApplicants: applicants.length,
        applicantsByStatus: {
          pending: applicants.filter(a => a.status === "pending").length,
          under_review: applicants.filter(a => a.status === "under_review").length,
          approved: applicants.filter(a => a.status === "approved").length,
          rejected: applicants.filter(a => a.status === "rejected").length,
        }
      }
    })
  } catch (error) {
    console.error("Error fetching academic year details:", error)
    return NextResponse.json({ error: "Failed to fetch academic year details" }, { status: 500 })
  }
}