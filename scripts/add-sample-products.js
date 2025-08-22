const { MongoClient } = require("mongodb")

async function addSampleProducts() {
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
    const productsCollection = db.collection("products")

    // Check if products already exist
    const existingProducts = await productsCollection.countDocuments()
    if (existingProducts > 0) {
      console.log(`⚠️  ${existingProducts} products already exist in the database.`)
      console.log("Skipping sample data creation.")
      return
    }

    const sampleProducts = [
      {
        name: "Interactive Learning Tablet",
        description:
          "Child-friendly tablet with educational games, stories, and learning activities. Perfect for ages 3-6.",
        price: 89.99,
        image: "/placeholder.svg?height=300&width=300&text=Learning+Tablet",
        category: "Electronics",
        stock: 25,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Alphabet Building Blocks",
        description:
          "Colorful wooden blocks with letters, numbers, and pictures. Great for developing fine motor skills and early literacy.",
        price: 24.99,
        image: "/placeholder.svg?height=300&width=300&text=Building+Blocks",
        category: "Toys",
        stock: 50,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "My First Science Kit",
        description:
          "Safe and fun science experiments designed for young children. Includes magnifying glass, test tubes, and activity guide.",
        price: 34.99,
        image: "/placeholder.svg?height=300&width=300&text=Science+Kit",
        category: "Educational Games",
        stock: 15,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Watercolor Paint Set",
        description:
          "Non-toxic watercolor paints with brushes and paper. Perfect for encouraging creativity and artistic expression.",
        price: 19.99,
        image: "/placeholder.svg?height=300&width=300&text=Paint+Set",
        category: "Art Supplies",
        stock: 30,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Picture Story Books Collection",
        description:
          "Set of 10 beautifully illustrated story books perfect for bedtime reading and language development.",
        price: 45.99,
        image: "/placeholder.svg?height=300&width=300&text=Story+Books",
        category: "Books",
        stock: 20,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Shape Sorting Puzzle",
        description:
          "Wooden puzzle with different shapes and colors. Helps develop problem-solving skills and hand-eye coordination.",
        price: 16.99,
        image: "/placeholder.svg?height=300&width=300&text=Shape+Puzzle",
        category: "Educational Games",
        stock: 8, // Low stock to demonstrate the feature
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Musical Instruments Set",
        description:
          "Child-safe musical instruments including tambourine, maracas, and xylophone. Great for music exploration.",
        price: 29.99,
        image: "/placeholder.svg?height=300&width=300&text=Music+Set",
        category: "Toys",
        stock: 0, // Out of stock to demonstrate the feature
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Hidden Product (Admin Only)",
        description: "This product is hidden from public view and only visible to admins.",
        price: 99.99,
        image: "/placeholder.svg?height=300&width=300&text=Hidden+Product",
        category: "Other",
        stock: 10,
        isVisible: false, // Hidden product
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    console.log("📦 Adding sample products...")
    const result = await productsCollection.insertMany(sampleProducts)

    console.log(`✅ Successfully added ${result.insertedCount} sample products!`)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🛍️  Sample products include:")
    console.log("   • Interactive Learning Tablet ($89.99)")
    console.log("   • Alphabet Building Blocks ($24.99)")
    console.log("   • My First Science Kit ($34.99)")
    console.log("   • Watercolor Paint Set ($19.99)")
    console.log("   • Picture Story Books Collection ($45.99)")
    console.log("   • Shape Sorting Puzzle ($16.99) - Low Stock")
    console.log("   • Musical Instruments Set ($29.99) - Out of Stock")
    console.log("   • 1 Hidden Product (visible only to admins)")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🌐 Visit http://localhost:3000/products to see them!")
    console.log("🔧 Visit http://localhost:3000/admin/products to manage them!")
  } catch (error) {
    console.error("❌ Error adding sample products:", error.message)
  } finally {
    await client.close()
    console.log("🔌 Database connection closed.")
  }
}

// Run the setup
addSampleProducts().catch(console.error)
