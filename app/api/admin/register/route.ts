import { type NextRequest, NextResponse } from "next/server"
import { AdminModel } from "@/lib/models/Admin"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { username, password, email, role = "admin" } = await request.json()

    if (!username || !password || !email) {
      return NextResponse.json({ error: "Username, password, and email are required" }, { status: 400 })
    }

    // Check if admin already exists
    const existingAdmin = await AdminModel.findByUsername(username)
    if (existingAdmin) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin
    const admin = await AdminModel.create({
      username,
      password: hashedPassword,
      email,
      role: role as "admin" | "super_admin",
      isActive: true,
    })

    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Admin registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
