import nodemailer from "nodemailer"

const ADMIN_EMAIL = "strobeleugames@gmail.com"

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || ADMIN_EMAIL,
    pass: process.env.SMTP_PASSWORD, // App password for Gmail
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Golden Light School" <${ADMIN_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    console.log("Email sent: %s", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Admin notification emails
export async function sendAdminNotification(subject: string, message: string, details?: any) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .details { background: white; padding: 15px; border-radius: 5px; margin-top: 15px; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 Golden Light School - Admin Notification</h2>
          </div>
          <div class="content">
            <h3>${subject}</h3>
            <p>${message}</p>
            ${details ? `<div class="details"><pre>${JSON.stringify(details, null, 2)}</pre></div>` : ""}
          </div>
          <div class="footer">
            <p>Golden Light School Admin System</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Admin Alert] ${subject}`,
    html,
    text: message,
  })
}

// Application status emails to parents
export async function sendApplicationStatusEmail(
  fatherEmail: string,
  motherEmail: string,
  childName: string,
  status: string,
  programName?: string,
) {
  const statusMessages = {
    submitted: {
      subject: "Application Submitted Successfully",
      message: `Dear Parents,

Thank you for submitting an admission application for ${childName} to Golden Light School${programName ? ` (${programName})` : ""}.

We have received your application and it is currently under review. Our admissions team will carefully evaluate the application and get back to you within 5-7 business days.

Application Status: Pending Review

What happens next:
1. Our team will review your application
2. We may contact you for additional information if needed
3. You will receive an update on your application status via email

If you have any questions, please don't hesitate to contact us.

Best regards,
Golden Light School Admissions Team`,
    },
    approved: {
      subject: "Application Approved - Congratulations!",
      message: `Dear Parents,

Congratulations! We are delighted to inform you that ${childName}'s application to Golden Light School${programName ? ` (${programName})` : ""} has been approved.

Application Status: APPROVED ✓

Next Steps:
1. Visit our school to complete the enrollment process
2. Bring all required documents (as listed in our admission requirements)
3. Pay the registration fee to secure your child's spot
4. Receive your child's schedule and orientation details

Please complete the enrollment process within 7 days to secure your child's place. Spots are limited and will be offered to other applicants if not confirmed.

We look forward to welcoming ${childName} to our school community!

Best regards,
Golden Light School Admissions Team`,
    },
    rejected: {
      subject: "Application Status Update",
      message: `Dear Parents,

Thank you for your interest in Golden Light School and for taking the time to submit an application for ${childName}${programName ? ` (${programName})` : ""}.

After careful consideration, we regret to inform you that we are unable to offer admission at this time. This decision was difficult as we received many qualified applications for limited spots.

Application Status: Not Approved

We encourage you to:
- Apply again in the next admission cycle
- Consider our other programs that might be a good fit
- Contact us if you have any questions about the decision

We appreciate your interest in Golden Light School and wish ${childName} all the best in their educational journey.

Best regards,
Golden Light School Admissions Team`,
    },
  }

  const statusInfo = statusMessages[status as keyof typeof statusMessages]
  if (!statusInfo) return { success: false, error: "Invalid status" }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
          .status-submitted { background: #fff3cd; color: #856404; }
          .status-approved { background: #d4edda; color: #155724; }
          .status-rejected { background: #f8d7da; color: #721c24; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; font-size: 14px; color: #666; }
          .logo { font-size: 24px; font-weight: bold; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌟 Golden Light School</div>
            <p style="margin: 10px 0 0 0;">Nurturing Young Minds</p>
          </div>
          <div class="content">
            <h2>${statusInfo.subject}</h2>
            <div style="white-space: pre-line;">${statusInfo.message}</div>
          </div>
          <div class="footer">
            <p><strong>Golden Light School</strong></p>
            <p>Email: strobeleugames@gmail.com</p>
            <p>Thank you for choosing Golden Light School!</p>
          </div>
        </div>
      </body>
    </html>
  `

  // Send email to both parents
  const results = await Promise.allSettled([
    sendEmail({
      to: fatherEmail,
      subject: `Golden Light School - ${statusInfo.subject}`,
      html,
      text: statusInfo.message,
    }),
    sendEmail({
      to: motherEmail,
      subject: `Golden Light School - ${statusInfo.subject}`,
      html,
      text: statusInfo.message,
    })
  ])

  return {
    success: results.some(result => result.status === 'fulfilled' && result.value.success),
    fatherEmailResult: results[0],
    motherEmailResult: results[1]
  }
}

// Order status emails to customers
export async function sendOrderStatusEmail(
  email: string,
  customerName: string,
  productName: string,
  status: string,
  orderId: string,
  quantity: number,
  totalAmount: number,
) {
  const statusMessages = {
    pending: {
      subject: "Order Received - Pending Confirmation",
      message: `Dear ${customerName},

Thank you for your order from Golden Light School!

Order Details:
- Order ID: ${orderId}
- Product: ${productName}
- Quantity: ${quantity}
- Total Amount: ${totalAmount} Frw
- Status: Pending Confirmation

Your order is currently being processed. We will confirm your order within 24 hours and notify you when it's ready for pickup.

You will receive another email once your order status is updated.

Thank you for your purchase!`,
    },
    confirmed: {
      subject: "Order Confirmed",
      message: `Dear ${customerName},

Great news! Your order has been confirmed.

Order Details:
- Order ID: ${orderId}
- Product: ${productName}
- Quantity: ${quantity}
- Total Amount: ${totalAmount} Frw
- Status: Confirmed

We are preparing your order. You will receive a notification when it's ready for pickup.

Thank you for your patience!`,
    },
    ready: {
      subject: "Order Ready for Pickup!",
      message: `Dear ${customerName},

Your order is ready for pickup!

Order Details:
- Order ID: ${orderId}
- Product: ${productName}
- Quantity: ${quantity}
- Total Amount: ${totalAmount} Frw
- Status: Ready for Pickup

Please visit Golden Light School to collect your order at your earliest convenience.

Pickup Location: Golden Light School Main Office
Office Hours: Monday - Friday, 8:00 AM - 5:00 PM

Please bring this email or your Order ID when picking up.

We look forward to seeing you!`,
    },
    completed: {
      subject: "Order Completed - Thank You!",
      message: `Dear ${customerName},

Thank you for completing your order!

Order Details:
- Order ID: ${orderId}
- Product: ${productName}
- Quantity: ${quantity}
- Total Amount: ${totalAmount} Frw
- Status: Completed

We hope you're satisfied with your purchase. If you have any questions or concerns about the product, please don't hesitate to contact us.

Thank you for choosing Golden Light School!`,
    },
    cancelled: {
      subject: "Order Cancelled",
      message: `Dear ${customerName},

Your order has been cancelled.

Order Details:
- Order ID: ${orderId}
- Product: ${productName}
- Quantity: ${quantity}
- Status: Cancelled

If you have any questions about this cancellation, please contact us.

We hope to serve you again in the future!`,
    },
  }

  const statusInfo = statusMessages[status as keyof typeof statusMessages]
  if (!statusInfo) return { success: false, error: "Invalid status" }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
          .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; font-size: 14px; color: #666; }
          .logo { font-size: 24px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌟 Golden Light School</div>
            <p style="margin: 10px 0 0 0;">Educational Products</p>
          </div>
          <div class="content">
            <h2>${statusInfo.subject}</h2>
            <div style="white-space: pre-line;">${statusInfo.message}</div>
          </div>
          <div class="footer">
            <p><strong>Golden Light School</strong></p>
            <p>Email: strobeleugames@gmail.com</p>
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `Golden Light School - ${statusInfo.subject}`,
    html,
    text: statusInfo.message,
  })
}
