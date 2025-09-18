import type React from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import WhatsAppWidget from "@/components/whatsapp-widget"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppWidget />
    </div>
  )
}
