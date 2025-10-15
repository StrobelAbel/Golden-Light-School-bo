import { NextRequest, NextResponse } from "next/server"
import { sendOrderStatusEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email, customerName, productName, status, orderId, quantity, totalAmount } = await request.json()

    const result = await sendOrderStatusEmail(
      email,
      customerName,
      productName,
      status,
      orderId,
      quantity,
      totalAmount
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}