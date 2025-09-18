import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const admin = await db.collection("admins").findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } } // don’t leak hashed password
    )

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json(admin)
  } catch (err: any) {
    console.error("Profile fetch error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
    const { username, email } = await req.json()

    if (!username || !email) {
      return NextResponse.json({ error: "Username and email are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("golden-light-school")

    await db.collection("admins").updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { username, email, updatedAt: new Date() } }
    )

    const updated = await db.collection("admins").findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } }
    )

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error("Profile update error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
