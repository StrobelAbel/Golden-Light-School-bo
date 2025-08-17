import type { Collection } from "mongodb"
import { connectToDatabase } from "../mongodb"

export interface Admin {
  _id?: string
  username: string
  password: string
  email: string
  role: "admin" | "super_admin"
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

export class AdminModel {
  private static collection: Collection<Admin> | null = null

  private static async getCollection(): Promise<Collection<Admin>> {
    if (!this.collection) {
      const { db } = await connectToDatabase()
      this.collection = db.collection<Admin>("admins")

      // Create unique index on username
      await this.collection.createIndex({ username: 1 }, { unique: true })
      await this.collection.createIndex({ email: 1 }, { unique: true })
    }
    return this.collection
  }

  static async findByUsername(username: string): Promise<Admin | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ username, isActive: true })
  }

  static async findByEmail(email: string): Promise<Admin | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ email, isActive: true })
  }

  static async create(adminData: Omit<Admin, "_id" | "createdAt">): Promise<Admin> {
    const collection = await this.getCollection()
    const admin: Admin = {
      ...adminData,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(admin)
    return { ...admin, _id: result.insertedId.toString() }
  }

  static async updateLastLogin(username: string): Promise<void> {
    const collection = await this.getCollection()
    await collection.updateOne({ username }, { $set: { lastLogin: new Date() } })
  }

  static async getAllAdmins(): Promise<Admin[]> {
    const collection = await this.getCollection()
    return await collection.find({ isActive: true }).toArray()
  }
}
