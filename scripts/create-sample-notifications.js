// Sample script to create notifications for testing
// Run with: node scripts/create-sample-notifications.js

const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const client = new MongoClient(uri)

async function createSampleNotifications() {
  try {
    await client.connect()
    const db = client.db("golden-light-school")
    
    const sampleNotifications = [
      {
        type: "new_application",
        category: "admissions",
        title: "New Application Received",
        message: "New admission application from John Doe for Mathematics Program",
        isRead: false,
        createdAt: new Date(),
        priority: "high",
        actions: [{
          label: "Review",
          url: "/admin/applications/sample1",
          type: "primary"
        }],
        metadata: {
          applicantName: "John Doe",
          programName: "Mathematics Program"
        }
      },
      {
        type: "low_stock",
        category: "inventory",
        title: "Low Stock Alert",
        message: "School Uniform stock is running low (3 remaining)",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        priority: "high",
        actions: [{
          label: "Restock",
          url: "/admin/products/sample1",
          type: "primary"
        }],
        metadata: {
          productName: "School Uniform",
          stockLevel: 3
        }
      },
      {
        type: "new_order",
        category: "orders",
        title: "New Product Order",
        message: "New order from Jane Smith for School Books (Qty: 2)",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        priority: "medium",
        actions: [{
          label: "View Order",
          url: "/admin/orders/sample1",
          type: "primary"
        }],
        metadata: {
          customerName: "Jane Smith",
          productName: "School Books",
          amount: 15000
        }
      },
      {
        type: "payment_received",
        category: "payments",
        title: "Payment Received",
        message: "Payment of 25000 Frw received from Alice Johnson",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        priority: "medium",
        actions: [{
          label: "View Order",
          url: "/admin/orders/sample2",
          type: "primary"
        }],
        metadata: {
          customerName: "Alice Johnson",
          amount: 25000
        }
      },
      {
        type: "out_of_stock",
        category: "inventory",
        title: "Product Out of Stock",
        message: "School Bags is now out of stock",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        priority: "urgent",
        actions: [{
          label: "Restock",
          url: "/admin/products/sample2",
          type: "primary"
        }],
        metadata: {
          productName: "School Bags",
          stockLevel: 0
        }
      },
      {
        type: "system",
        category: "system",
        title: "System Maintenance Scheduled",
        message: "System maintenance is scheduled for tonight at 2 AM",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        priority: "low"
      }
    ]

    await db.collection("notifications").insertMany(sampleNotifications)
    console.log(`Created ${sampleNotifications.length} sample notifications`)
    
  } catch (error) {
    console.error("Error creating sample notifications:", error)
  } finally {
    await client.close()
  }
}

createSampleNotifications()