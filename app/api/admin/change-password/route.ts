import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function PUT(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "All password fields are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("golden-light-school")

    const admin = await db.collection("admins").findOne({ _id: new ObjectId(decoded.id) })
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    const isValidPassword = await bcrypt.compare(currentPassword, admin.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await db.collection("admins").updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Password change error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
