import { NextRequest, NextResponse } from "next/server"
import { sendApplicationStatusEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { applications, status } = await request.json()
    
    const emailPromises = applications.map((app: any) => {
      const emailStatus = status === "under_review" ? "submitted" : status
      
      return sendApplicationStatusEmail(
        app.fatherEmail,
        app.motherEmail,
        app.childName,
        emailStatus,
        app.childYear
      )
    })

    const results = await Promise.allSettled(emailPromises)
    
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length

    return NextResponse.json({ 
      success: true, 
      sent: successful,
      total: applications.length 
    })
  } catch (error) {
    console.error("Error sending bulk emails:", error)
    return NextResponse.json({ success: false, error: "Failed to send bulk emails" }, { status: 500 })
  }
}
