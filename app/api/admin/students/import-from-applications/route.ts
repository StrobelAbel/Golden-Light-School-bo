// import { type NextRequest, NextResponse } from "next/server"
// import clientPromise from "@/lib/mongodb" // Import the correct export

// export async function POST(request: NextRequest) {
//   try {
//     const client = await clientPromise
//     const db = client.db("golden-light-school") // Get the database

//     // Get all approved applications that haven't been converted to students
//     const approvedApplications = await db
//       .collection("applications")
//       .find({
//         status: "approved",
//         converted: { $ne: true },
//       })
//       .toArray()

//     const studentsToCreate = []

//     for (const application of approvedApplications) {
//       // Generate unique student ID
//       const studentId = await generateStudentId(db)

//       const student = {
//         // Child Information
//         childName: application.childName,
//         childAge: application.childAge,
//         childGender: application.childGender,
//         dateOfBirth: application.dateOfBirth,

//         // Parent Information
//         parentName: application.fatherName || application.motherName,
//         parentEmail: application.email,
//         parentPhone: application.fatherphone || application.motherPhone,
//         parentAddress: application.address,

//         // Academic Information
//         studentId,
//         class: "Pre-K", // Default class, can be updated later
//         level: "Nursery",
//         academicYear: new Date().getFullYear().toString(),
//         enrollmentDate: new Date(),

//         // Status Information
//         status: "active",
//         statusDate: new Date(),

//         // Financial Information
//         paymentStatus: "unpaid",
//         amountPaid: 0,
//         totalFees: 50000, // Default fee, can be updated
//         paymentHistory: [],

//         // Application Reference
//         applicationId: application._id.toString(),

//         // Timestamps
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }

//       studentsToCreate.push(student)
//     }

//     if (studentsToCreate.length > 0) {
//       // Insert all students
//       await db.collection("students").insertMany(studentsToCreate)

//       // Mark applications as converted
//       const applicationIds = approvedApplications.map((app) => app._id)
//       await db
//         .collection("applications")
//         .updateMany({ _id: { $in: applicationIds } }, { $set: { converted: true, convertedAt: new Date() } })
//     }

//     return NextResponse.json({
//       message: `Successfully imported ${studentsToCreate.length} students from approved applications`,
//       count: studentsToCreate.length,
//     })
//   } catch (error) {
//     console.error("Error importing students:", error)
//     return NextResponse.json({ error: "Failed to import students" }, { status: 500 })
//   }
// }

// async function generateStudentId(db: any): Promise<string> {
//   const currentYear = new Date().getFullYear()
//   const prefix = `GLS${currentYear}`

//   // Find the last student ID for this year
//   const lastStudent = await db
//     .collection("students")
//     .findOne({ studentId: { $regex: `^${prefix}` } }, { sort: { studentId: -1 } })

//   let nextNumber = 1
//   if (lastStudent) {
//     const lastNumber = Number.parseInt(lastStudent.studentId.replace(prefix, ""))
//     nextNumber = lastNumber + 1
//   }

//   return `${prefix}${nextNumber.toString().padStart(4, "0")}`
// }
