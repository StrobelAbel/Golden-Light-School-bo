import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const { searchParams } = new URL(request.url)
    
    const cleanup = searchParams.get("cleanup")
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    
    // Auto-cleanup old notifications (older than 30 days)
    if (cleanup === "true") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      await db.collection("notifications").deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isRead: true
      })
    }

    // Build filter query
    const filter: any = {}
    if (category && category !== "all") filter.category = category
    if (priority && priority !== "all") filter.priority = priority
    if (unreadOnly) filter.isRead = false

    const notifications = await db.collection("notifications")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    const response = NextResponse.json(notifications)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    const { id, isRead, markAllAsRead } = await request.json()

    if (markAllAsRead) {
      // Bulk update all unread notifications
      await db.collection("notifications").updateMany(
        { isRead: false },
        { $set: { isRead: true, updatedAt: new Date() } }
      )
    } else if (id) {
      // Update single notification
      await db.collection("notifications").updateOne(
        { _id: new ObjectId(id) },
        { $set: { isRead, updatedAt: new Date() } }
      )
    } else {
      return NextResponse.json({ error: "Missing id or markAllAsRead parameter" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
