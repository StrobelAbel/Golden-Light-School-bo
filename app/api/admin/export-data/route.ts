import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  try {
    return jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!) as { id: string }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const decoded = verifyToken(req)
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const admin = await db.collection("admins").findOne({ _id: new ObjectId(decoded.id) })
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    const exportData = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive,
      settings: admin.settings,
      sessions: admin.sessions ?? [],
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=account-data-${new Date().toISOString()}.json`,
      },
    })
  } catch (err) {
    console.error("Export data error:", err)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
