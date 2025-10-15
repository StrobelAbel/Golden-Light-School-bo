import { NextRequest, NextResponse } from "next/server"
import { sendApplicationStatusEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { fatherEmail, motherEmail, childName, status, programName } = await request.json()

    const result = await sendApplicationStatusEmail(
      fatherEmail,
      motherEmail,
      childName,
      status,
      programName
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending application email:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}