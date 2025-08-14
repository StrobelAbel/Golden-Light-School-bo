import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Portal - Golden Light School Ltd",
  description: "Administrative dashboard for Golden Light School management",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
