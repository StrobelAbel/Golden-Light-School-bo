import clientPromise from "@/lib/mongodb"
import { Notification } from "@/lib/models/Notification"

interface CreateNotificationParams {
  type: Notification["type"]
  category: Notification["category"]
  title: string
  message: string
  priority: Notification["priority"]
  relatedId?: string
  actions?: Notification["actions"]
  metadata?: Notification["metadata"]
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const client = await clientPromise
    const db = client.db("golden-light-school")

    const notification: Omit<Notification, "_id"> = {
      type: params.type,
      category: params.category,
      title: params.title,
      message: params.message,
      isRead: false,
      createdAt: new Date(),
      priority: params.priority,
      relatedId: params.relatedId,
      actions: params.actions,
      metadata: params.metadata,
    }

    const result = await db.collection("notifications").insertOne(notification)
    return result.insertedId
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Predefined notification templates
export const NotificationTemplates = {
  newApplication: (applicantName: string, programName: string, applicationId: string) => ({
    type: "new_application" as const,
    category: "admissions" as const,
    title: "New Application Received",
    message: `New admission application from ${applicantName} for ${programName}`,
    priority: "high" as const,
    relatedId: applicationId,
    actions: [{
      label: "Review",
      url: `/admin/applications/${applicationId}`,
      type: "primary" as const
    }],
    metadata: {
      applicantName,
      programName,
    }
  }),

  newOrder: (customerName: string, productName: string, quantity: number, orderId: string, amount: number) => ({
    type: "new_order" as const,
    category: "orders" as const,
    title: "New Product Order",
    message: `New order from ${customerName} for ${productName} (Qty: ${quantity})`,
    priority: "medium" as const,
    relatedId: orderId,
    actions: [{
      label: "View Order",
      url: `/admin/orders/${orderId}`,
      type: "primary" as const
    }],
    metadata: {
      customerName,
      productName,
      amount,
    }
  }),

  lowStock: (productName: string, stockLevel: number, productId: string) => ({
    type: "low_stock" as const,
    category: "inventory" as const,
    title: "Low Stock Alert",
    message: `"${productName}" stock is running low (${stockLevel} remaining)`,
    priority: "high" as const,
    relatedId: productId,
    actions: [{
      label: "Restock",
      url: `/admin/products/${productId}`,
      type: "primary" as const
    }],
    metadata: {
      productName,
      stockLevel,
    }
  }),

  outOfStock: (productName: string, productId: string) => ({
    type: "out_of_stock" as const,
    category: "inventory" as const,
    title: "Product Out of Stock",
    message: `"${productName}" is now out of stock`,
    priority: "urgent" as const,
    relatedId: productId,
    actions: [{
      label: "Restock",
      url: `/admin/products/${productId}`,
      type: "primary" as const
    }],
    metadata: {
      productName,
      stockLevel: 0,
    }
  }),

  paymentReceived: (customerName: string, amount: number, orderId: string) => ({
    type: "payment_received" as const,
    category: "payments" as const,
    title: "Payment Received",
    message: `Payment of ${amount} Frw received from ${customerName}`,
    priority: "medium" as const,
    relatedId: orderId,
    actions: [{
      label: "View Order",
      url: `/admin/orders/${orderId}`,
      type: "primary" as const
    }],
    metadata: {
      customerName,
      amount,
    }
  }),

  statusChange: (itemName: string, oldStatus: string, newStatus: string, itemId: string, category: "admissions" | "orders") => ({
    type: "status_change" as const,
    category,
    title: "Status Updated",
    message: `${itemName} status changed from ${oldStatus} to ${newStatus}`,
    priority: "medium" as const,
    relatedId: itemId,
    actions: [{
      label: "View Details",
      url: category === "admissions" ? `/admin/applications/${itemId}` : `/admin/orders/${itemId}`,
      type: "primary" as const
    }],
    metadata: {
      oldStatus,
      newStatus,
    }
  }),

  systemAlert: (title: string, message: string, priority: "low" | "medium" | "high" | "urgent" = "medium") => ({
    type: "system" as const,
    category: "system" as const,
    title,
    message,
    priority,
  })
}