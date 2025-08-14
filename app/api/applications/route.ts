import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Application } from "@/lib/models/Application"

export async function GET() {
  try {
    const db = await getDatabase()
    const applications = await db.collection<Application>("applications").find({}).sort({ submittedAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch applications",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "parentName",
      "email",
      "phone",
      "childName",
      "childAge",
      "childDOB",
      "preferredStartDate",
      "emergencyContact",
      "emergencyPhone",
      "agreedToTerms",
    ]

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

    if (!body.agreedToTerms) {
      return NextResponse.json(
        {
          success: false,
          message: "You must agree to the terms and conditions",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()

    const application: Omit<Application, "_id"> = {
      parentName: body.parentName,
      email: body.email,
      phone: body.phone,
      childName: body.childName,
      childAge: body.childAge,
      childDOB: body.childDOB,
      preferredStartDate: body.preferredStartDate,
      previousSchool: body.previousSchool || "",
      specialNeeds: body.specialNeeds || "",
      emergencyContact: body.emergencyContact,
      emergencyPhone: body.emergencyPhone,
      agreedToTerms: body.agreedToTerms,
      status: "pending",
      submittedAt: new Date(),
    }

    const result = await db.collection<Application>("applications").insertOne(application)

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit application",
      },
      { status: 500 },
    )
  }
}
