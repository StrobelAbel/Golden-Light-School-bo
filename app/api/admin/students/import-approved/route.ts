import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    // Get all approved applications that haven't been converted
    const approvedApplications = await db
      .collection("applications")
      .find({
        status: "approved",
        converted: { $ne: true },
      })
      .toArray()

    if (approvedApplications.length === 0) {
      return NextResponse.json({
        message: "No approved applications to import",
        count: 0,
      })
    }

    const studentsToCreate = []
    const currentYear = new Date().getFullYear()
    const academicYear = `${currentYear}-${currentYear + 1}`

    // Get admission programs for fee lookup
    const admissionPrograms = await db
      .collection("admission-programs")
      .find({ status: "active" })
      .toArray()
    
    // Create fee lookup map from admission programs
    const feeMap = new Map()
    admissionPrograms.forEach(program => {
      feeMap.set(program.name, program.fees?.tuitionFee)
    })
    
    // Fallback to fee structures if no programs found
    if (feeMap.size === 0) {
      const feeStructures = await db
        .collection("fee-structures")
        .find({ academicYear })
        .toArray()
      
      feeStructures.forEach(fee => {
        feeMap.set(fee.class, fee.totalFee)
      })
    }

    // Get last studentId instead of count
    const lastStudent = await db
      .collection("students")
      .find()
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray()

    let studentNumber =
      lastStudent.length > 0
        ? parseInt(lastStudent[0].studentId.replace("GLS", ""))
        : 0

    for (const application of approvedApplications) {
      studentNumber += 1
      const studentId: string = `GLS${studentNumber.toString().padStart(4, "0")}`

      // Normalize parent info
      const parentName =
        application.parentName ||
        application.fatherName ||
        application.motherName ||
        "Unknown Parent"

      const parentPhone =
        application.fatherPhone ||
        application.motherPhone ||
        "N/A"

      // Get fee for this student's program/class
      const classFee = feeMap.get(application.childYear)

      const student = {
        studentId,
        firstName: application.childName.split(" ")[0] || application.childName,
        lastName: application.childName.split(" ").slice(1).join(" ") || "",
        dateOfBirth: new Date(application.dateOfBirth),
        gender: application.childGender,

        parentName,
        parentPhone,

        fatherName: application.fatherName || "",
        fatherId: application.fatherId || "",
        fatherPhone: application.fatherPhone || "",
        motherName: application.motherName || "",
        motherId: application.motherId || "",
        motherPhone: application.motherPhone || "",

        province: application.province,
        district: application.district,
        sector: application.sector,
        cell: application.cell,
        village: application.village,

        emergencyContactRelation: "Parent",
        class: application.childYear,
        level: application.childYear, // add level for UI
        age: `Age ${application.childAge}`,
        academicYear,
        admissionDate: new Date(),
        status: "active",

        paymentStatus: "not_paid",
        amountPaid: 0,
        amountDue: classFee,
        totalFees: classFee,
        paymentHistory: [],
        disciplinaryActions: [],
        achievements: [],
        medicalConditions: [],
        allergies: [],

        applicationId: application._id.toString(),
        notes: application.additionalInfo || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      studentsToCreate.push(student)
    }

    // Insert all students
    const insertResult = await db.collection("students").insertMany(studentsToCreate)

    // Mark only the inserted applications as converted
    const insertedIds = studentsToCreate.map((s) => new ObjectId(s.applicationId))
    await db.collection("applications").updateMany(
      { _id: { $in: insertedIds } },
      { $set: { converted: true, convertedAt: new Date() } }
    )

    return NextResponse.json({
      message: `${insertResult.insertedCount} students imported successfully`,
      count: insertResult.insertedCount,
    })
  } catch (error) {
    console.error("Error importing approved applications:", error)
    return NextResponse.json(
      { error: "Failed to import approved applications" },
      { status: 500 }
    )
  }
}
