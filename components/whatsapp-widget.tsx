"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const whatsappNumber = "+250786376459" // Golden Light School WhatsApp number

  const quickMessages = [
    {
      title: "General Inquiry",
      message: "Hello! I would like to know more about Golden Light School.",
    },
    {
      title: "Admission Information",
      message: "Hi! I'm interested in admission information for my child.",
    },
    {
      title: "School Visit",
      message: "Hello! I would like to schedule a visit to your school.",
    },
    {
      title: "Fees Information",
      message: "Hi! Could you please provide information about school fees?",
    },
  ]

  const sendWhatsAppMessage = (message: string) => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <Card className="mb-4 w-80 shadow-lg">
          <CardHeader className="bg-green-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat with us
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-green-700 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-4">Hi there! 👋 How can we help you today?</p>
            <div className="space-y-2">
              {quickMessages.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3 text-sm bg-transparent"
                  onClick={() => sendWhatsAppMessage(item.message)}
                >
                  {item.title}
                </Button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => sendWhatsAppMessage("Hello! I have a question about Golden Light School.")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Start Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 shadow-lg"
        size="lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
