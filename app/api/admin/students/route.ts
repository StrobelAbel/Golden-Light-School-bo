import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Student, StudentFilters, StudentStats } from "@/lib/models/Student"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get filter parameters
    const filters: StudentFilters = {
      search: searchParams.get("search") || undefined,
      class: searchParams.get("class") || undefined,
      level: searchParams.get("level") || undefined,
      status: searchParams.get("status") || undefined,
      academicYear: searchParams.get("academicYear") || undefined,
      paymentStatus: searchParams.get("paymentStatus") || undefined,
    }

    // Build MongoDB query
    const query: any = {}

    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: "i" }
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { studentId: searchRegex },
        { parentName: searchRegex },
        { parentEmail: searchRegex },
        { parentPhone: searchRegex },
        { emergencyContactPhone: searchRegex },
      ]
    }

    if (filters.class) query.class = filters.class
    if (filters.level) query.level = filters.level
    if (filters.status) query.status = filters.status
    if (filters.academicYear) query.academicYear = filters.academicYear
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus

    const students = await db
      .collection("students")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection("students").countDocuments(query)

    // Get statistics
    const stats: StudentStats = {
      total: await db.collection("students").countDocuments(),
      active: await db.collection("students").countDocuments({ status: "active" }),
      inactive: await db.collection("students").countDocuments({ status: "inactive" }),
      graduated: await db.collection("students").countDocuments({ status: "graduated" }),
      transferred: await db.collection("students").countDocuments({ status: "transferred" }),
      suspended: await db.collection("students").countDocuments({ status: "suspended" }),
      byClass: {},
      byPaymentStatus: {},
      totalRevenue: 0,
      outstandingFees: 0,
    }

    // Get class distribution
    const classCounts = await db
      .collection("students")
      .aggregate([{ $group: { _id: "$class", count: { $sum: 1 } } }])
      .toArray()

    classCounts.forEach((item: any) => {
      stats.byClass[item._id] = item.count
    })

    // Get payment status distribution
    const paymentCounts = await db
      .collection("students")
      .aggregate([{ $group: { _id: "$paymentStatus", count: { $sum: 1 } } }])
      .toArray()

    paymentCounts.forEach((item: any) => {
      stats.byPaymentStatus[item._id] = item.count
    })

    // Calculate financial statistics
    const financialStats = await db
      .collection("students")
      .aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amountPaid" },
            outstandingFees: { $sum: "$amountDue" },
          },
        },
      ])
      .toArray()

    if (financialStats.length > 0) {
      stats.totalRevenue = financialStats[0].totalRevenue
      stats.outstandingFees = financialStats[0].outstandingFees
    }

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const studentData = await request.json()

    // Generate unique student ID
    const studentCount = await db.collection("students").countDocuments()
    const studentId = `GLS${(studentCount + 1).toString().padStart(4, "0")}`

    const newStudent = {
      ...studentData,
      studentId,
      paymentHistory: studentData.paymentHistory || [],
      disciplinaryActions: studentData.disciplinaryActions || [],
      achievements: studentData.achievements || [],
      medicalConditions: studentData.medicalConditions || [],
      allergies: studentData.allergies || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("students").insertOne(newStudent)

    return NextResponse.json({
      message: "Student created successfully",
      studentId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}