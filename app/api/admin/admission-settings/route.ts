import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { AdmissionSettings } from "@/lib/models/AdmissionSettings"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const settings = await db.collection("admissionSettings").findOne({})

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings: Omit<AdmissionSettings, "_id"> = {
        globalStatus: "open",
        welcomeMessage:
          "Welcome to Golden Light School admissions! We're excited to have you join our learning family.",
        closedMessage: "Admissions are currently closed. Please check back later for updates.",
        scheduledMessage: "Admissions will open soon. Stay tuned for updates!",
        contactInfo: {
          phone: "+250 786 376 459",
          email: "goldenlight4.school@gmail.com",
          address: "Musanze, Rwanda",
        },
        socialMedia: {},
        faqItems: [
          {
            question: "What age groups do you accept?",
            answer: "We accept children aged 2-6 years old.",
          },
          {
            question: "What documents are required?",
            answer: "Birth certificate, immunization records, and recent photos are required.",
          },
        ],
        updatedAt: new Date(),
        updatedBy: "system",
      }

      await db.collection("admissionSettings").insertOne(defaultSettings)
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching admission settings:", error)
    return NextResponse.json({ error: "Failed to fetch admission settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const body = await request.json()

    // Ensure contactInfo exists
    const updateData = {
      globalStatus: body.globalStatus || "open",
      welcomeMessage: body.welcomeMessage || "",
      closedMessage: body.closedMessage || "",
      scheduledMessage: body.scheduledMessage || "",
      contactInfo: {
        phone: body.contactInfo?.phone || "",
        email: body.contactInfo?.email || "",
        address: body.contactInfo?.address || ""
      },
      socialMedia: body.socialMedia || {},
      faqItems: body.faqItems || [],
      updatedAt: new Date(),
      updatedBy: "admin"
    }

    await db.collection("admissionSettings").updateOne({}, { $set: updateData }, { upsert: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating admission settings:", error)
    return NextResponse.json({ error: "Failed to update admission settings" }, { status: 500 })
  }
}
