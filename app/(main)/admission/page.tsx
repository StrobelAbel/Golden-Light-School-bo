"use client"

import { useState } from "react"

export default function AdmissionPage() {
  // ... state and logic stays the same ...

  const [isSubmitted, setIsSubmitted] = useState(false)

  if (isSubmitted) {
    return (
      <div className="bg-gray-50 flex items-center justify-center px-4 py-20">{/* ... rest stays the same ... */}</div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 px-4">
        {/* ... rest of the content stays the same ... */}
      </section>
      {/* ... other sections stay the same ... */}
    </div>
  )
}
