const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

async function setupAdmin() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI environment variable is required")
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db("golden-light-school")
    const admins = db.collection("admins")

    // Check if admin already exists
    const existingAdmin = await admins.findOne({ username: "admin" })
    if (existingAdmin) {
      console.log("Admin user already exists")
      return
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash("admin123", 12)

    await admins.insertOne({
      username: "admin",
      password: hashedPassword,
      email: "admin@goldenlightschool.com",
      role: "super_admin",
      isActive: true,
      createdAt: new Date(),
    })

    console.log("✅ Default admin user created successfully!")
    console.log("Username: admin")
    console.log("Password: admin123")
    console.log("⚠️  Please change the password after first login")
  } catch (error) {
    console.error("Error setting up admin:", error)
  } finally {
    await client.close()
  }
}

setupAdmin()
