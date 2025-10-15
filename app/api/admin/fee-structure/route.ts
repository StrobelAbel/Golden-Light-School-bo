import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    
    const feeStructures = await db.collection("fee-structures").find({}).toArray()
    return NextResponse.json(feeStructures)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fee structures" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")
    
    const feeStructure = await request.json()
    
    // Upsert fee structure by class and academic year
    const result = await db.collection("fee-structures").updateOne(
      { 
        class: feeStructure.class, 
        academicYear: feeStructure.academicYear 
      },
      { 
        $set: {
          ...feeStructure,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    )
    
    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save fee structure" }, { status: 500 })
  }
}