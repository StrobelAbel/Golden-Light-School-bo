import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null

  try {
    const token = authHeader.split(" ")[1]
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
  } catch {
    return null
  }
}

// ✅ Get account settings
export async function GET(req: NextRequest) {
  const decoded = verifyToken(req)
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const client = await clientPromise
  const db = client.db("golden-light-school")

  const admin = await db.collection("admins").findOne({ _id: new ObjectId(decoded.id) })
  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 })
  }

  return NextResponse.json({
    _id: admin._id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt,
    lastLogin: admin.lastLogin,
    isActive: admin.isActive ?? true,
    permissions: admin.permissions ?? [],
    settings: admin.settings ?? {
      emailNotifications: true,
      pushNotifications: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      theme: "system",
      language: "en",
    },
    sessions: admin.sessions ?? [],
  })
}

// ✅ Update account settings
export async function PUT(req: NextRequest) {
  const decoded = verifyToken(req)
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { settings } = await req.json()

    const client = await clientPromise
    const db = client.db("golden-light-school")

    await db.collection("admins").updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { settings } }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update settings error:", err)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
