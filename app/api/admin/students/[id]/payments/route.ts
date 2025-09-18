import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    
    const paymentData = await request.json()

    const payment = {
      _id: new ObjectId(),
      ...paymentData,
      paymentDate: new Date(paymentData.paymentDate),
      createdBy: "admin", // TODO: Get from auth context
    }

    // Update student's payment information
    const student = await db.collection("students").findOne({ _id: new ObjectId(params.id) })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const newAmountPaid = student.amountPaid + payment.amount
    const newAmountDue = Math.max(0, student.totalFees - newAmountPaid)

    let paymentStatus = "not_paid"
    if (newAmountPaid >= student.totalFees) {
      paymentStatus = "paid"
    } else if (newAmountPaid > 0) {
      paymentStatus = "half_paid"
    }

    await db.collection("students").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $push: { paymentHistory: payment },
        $set: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          paymentStatus,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Payment added successfully" })
  } catch (error) {
    console.error("Error adding payment:", error)
    return NextResponse.json({ error: "Failed to add payment" }, { status: 500 })
  }
}
