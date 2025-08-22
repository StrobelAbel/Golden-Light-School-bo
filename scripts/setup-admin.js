const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

async function setupAdmin() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://username:password@cluster.mongodb.net/golden-light-school?retryWrites=true&w=majority"

  if (!uri || uri.includes("username:password")) {
    console.error("❌ Please set your MONGODB_URI in .env.local file")
    console.log(
      "Example: MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/golden-light-school?retryWrites=true&w=majority",
    )
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    console.log("🔄 Connecting to MongoDB Atlas...")
    await client.connect()
    console.log("✅ Connected to MongoDB Atlas successfully!")

    const db = client.db("golden-light-school")
    const adminsCollection = db.collection("admins")

    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({ username: "admin" })

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!")
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.log("📧 Email: admin@goldenlightschool.com")
      console.log("👤 Username: admin")
      console.log("🔑 Password: admin123")
      console.log("🔒 Role: super_admin")
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.log("🌐 Login at: http://localhost:3000/admin/login")
      return
    }

    // Hash the password
    console.log("🔐 Hashing password...")
    const hashedPassword = await bcrypt.hash("admin123", 12)

    // Create admin user
    const adminUser = {
      username: "admin",
      email: "admin@goldenlightschool.com",
      password: hashedPassword,
      role: "super_admin",
      permissions: ["manage_products", "manage_applications", "manage_bookings", "view_dashboard", "manage_users"],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      lastLogin: null,
    }

    console.log("👤 Creating admin user...")
    await adminsCollection.insertOne(adminUser)

    // Create initial notification
    const notificationsCollection = db.collection("notifications")
    await notificationsCollection.insertOne({
      type: "system",
      title: "Welcome to Golden Light School Admin",
      message: "Admin panel has been set up successfully. You can now manage products and applications.",
      isRead: false,
      createdAt: new Date(),
    })

    console.log("✅ Admin user created successfully!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📧 Email: admin@goldenlightschool.com")
    console.log("👤 Username: admin")
    console.log("🔑 Password: admin123")
    console.log("🔒 Role: super_admin")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🌐 Login at: http://localhost:3000/admin/login")
    console.log("")
    console.log("⚠️  IMPORTANT: Change the password after first login!")
    console.log("🔐 The password is securely hashed in the database.")
  } catch (error) {
    console.error("❌ Error setting up admin:", error.message)

    if (error.message.includes("ENOTFOUND")) {
      console.log("💡 This looks like a network issue. Check your internet connection.")
    } else if (error.message.includes("authentication failed")) {
      console.log("💡 Check your MongoDB username and password in the connection string.")
    } else if (error.message.includes("IP")) {
      console.log("💡 Make sure your IP address is whitelisted in MongoDB Atlas.")
    }
  } finally {
    await client.close()
    console.log("🔌 Database connection closed.")
  }
}

// Run the setup
setupAdmin().catch(console.error)
