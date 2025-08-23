const { MongoClient } = require("mongodb")

async function addSampleApplications() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://username:password@cluster.mongodb.net/golden-light-school?retryWrites=true&w=majority"

  if (!uri || uri.includes("username:password")) {
    console.error("❌ Please set your MONGODB_URI in .env.local file")
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    console.log("🔄 Connecting to MongoDB Atlas...")
    await client.connect()
    console.log("✅ Connected to MongoDB Atlas successfully!")

    const db = client.db("golden-light-school")
    const applicationsCollection = db.collection("applications")
    const notificationsCollection = db.collection("notifications")

    // Check if applications already exist
    const existingApplications = await applicationsCollection.countDocuments()
    if (existingApplications > 0) {
      console.log(`⚠️  ${existingApplications} applications already exist in the database.`)
      console.log("Skipping sample data creation.")
      return
    }

    const sampleApplications = [
      {
        // Parent Information
        parentName: "Mukamana Esperance",
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 123-4567",
        address: "123 Oak Street, Springfield, IL 62701",

        // Child Information
        childName: "Emma Johnson",
        childAge: 4,
        childGender: "Female",
        dateOfBirth: new Date("2020-03-15"),

        // Application Details
        preferredStartDate: new Date("2024-09-01"),
        additionalInfo: "Emma loves reading and drawing. She's very social and enjoys playing with other children.",
        status: "pending",

        // Timestamps
        createdAt: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z"),
      },
      {
        parentName: "Uwimana Grace",
        email: "michael.chen@email.com",
        phone: "+1 (555) 234-5678",
        address: "456 Pine Avenue, Springfield, IL 62702",

        childName: "Alex Chen",
        childAge: 3,
        childGender: "Male",
        dateOfBirth: new Date("2021-07-22"),

        preferredStartDate: new Date("2024-08-15"),
        additionalInfo:
          "Alex is very curious about science and loves building with blocks. He's learning to share and play cooperatively.",
        status: "approved",

        createdAt: new Date("2024-01-10T14:20:00Z"),
        updatedAt: new Date("2024-01-12T09:15:00Z"),
      },
      {
        parentName: "Byiringiro Emmanuel",
        email: "lisa.williams@email.com",
        phone: "+1 (555) 345-6789",
        address: "789 Maple Drive, Springfield, IL 62703",

        childName: "Nkusi Sophia",
        childAge: 5,
        childGender: "Female",
        dateOfBirth: new Date("2019-11-08"),

        preferredStartDate: new Date("2024-09-15"),
        additionalInfo:
          "Sophia is ready for kindergarten prep. She knows her letters and numbers and loves music and dancing.",
        status: "under_review",

        createdAt: new Date("2024-01-08T16:45:00Z"),
        updatedAt: new Date("2024-01-10T11:30:00Z"),
      },
      {
        parentName: "Manirumva David",
        email: "david.rodriguez@email.com",
        phone: "+1 (555) 456-7890",
        address: "321 Elm Street, Springfield, IL 62704",

        childName: "Habiyaremye Baptiste",
        childAge: 3,
        childGender: "Male",
        dateOfBirth: new Date("2021-05-12"),

        preferredStartDate: new Date("2024-10-01"),
        additionalInfo:
          "Carlos is bilingual (Spanish/English) and very energetic. He loves outdoor activities and animals.",
        status: "pending",

        createdAt: new Date("2024-01-05T13:15:00Z"),
        updatedAt: new Date("2024-01-05T13:15:00Z"),
      },
      {
        parentName: "Nkurunziza Nepo",
        email: "amanda.thompson@email.com",
        phone: "+1 (555) 567-8901",
        address: "654 Birch Lane, Springfield, IL 62705",

        childName: "Oliver Thompson",
        childAge: 4,
        childGender: "Male",
        dateOfBirth: new Date("2020-09-30"),

        preferredStartDate: new Date("2024-08-01"),
        additionalInfo: "Oliver has some food allergies (nuts, dairy). He's very creative and loves art projects.",
        status: "rejected",

        createdAt: new Date("2024-01-03T09:00:00Z"),
        updatedAt: new Date("2024-01-04T15:20:00Z"),
      },
      {
        parentName: "Karenzi Yannick",
        email: "jennifer.park@email.com",
        phone: "+1 (555) 678-9012",
        address: "987 Cedar Court, Springfield, IL 62706",

        childName: "Maya Park",
        childAge: 2,
        childGender: "Female",
        dateOfBirth: new Date("2022-02-14"),

        preferredStartDate: new Date("2024-11-01"),
        additionalInfo: "Maya is just turning 3 soon. She's very gentle and loves books and puzzles.",
        status: "pending",

        createdAt: new Date("2024-01-20T11:45:00Z"),
        updatedAt: new Date("2024-01-20T11:45:00Z"),
      },
    ]

    console.log("📝 Adding sample applications...")
    const result = await applicationsCollection.insertMany(sampleApplications)

    // Create notifications for new applications
    const notifications = sampleApplications
      .filter((app) => app.status === "pending")
      .map((app) => ({
        type: "new_application",
        title: "New Application Received",
        message: `New admission application from ${app.parentName} for ${app.childName}`,
        isRead: false,
        createdAt: app.createdAt,
        relatedId: null, // Will be updated with actual IDs
      }))

    if (notifications.length > 0) {
      await notificationsCollection.insertMany(notifications)
    }

    console.log(`✅ Successfully added ${result.insertedCount} sample applications!`)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📋 Sample applications include:")
    console.log("   • Emma Johnson (Age 4) - Pending")
    console.log("   • Alex Chen (Age 3) - Approved")
    console.log("   • Sophia Williams (Age 5) - Under Review")
    console.log("   • Carlos Rodriguez (Age 3) - Pending")
    console.log("   • Oliver Thompson (Age 4) - Rejected")
    console.log("   • Maya Park (Age 2) - Pending")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🌐 Visit http://localhost:3000/admission to submit new applications!")
    console.log("🔧 Visit http://localhost:3000/admin/applications to manage them!")
    console.log(`📬 Created ${notifications.length} notifications for pending applications`)
  } catch (error) {
    console.error("❌ Error adding sample applications:", error.message)
  } finally {
    await client.close()
    console.log("🔌 Database connection closed.")
  }
}

// Run the setup
addSampleApplications().catch(console.error)
