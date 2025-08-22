"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Phone } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/nursery", label: "Nursery School" },
    { href: "/products", label: "Learning Aids" },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About Us" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative w-10 h-10">
            <Image src="/images/logo.jpg" alt="Golden Light School Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-xl text-gray-900">Golden Light School</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 bg-transparent"
          >
            <Link href="/contact">
              <Phone className="mr-2 h-4 w-4" />
              Contact
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-golden-500 hover:bg-golden-600 text-white">
            <Link href="/admission">Apply Now</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium text-gray-600 hover:text-cyan-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-cyan-200 text-cyan-700 hover:bg-cyan-50 bg-transparent"
                >
                  <Link href="/contact" onClick={() => setIsOpen(false)}>
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Us
                  </Link>
                </Button>
                <Button asChild className="w-full bg-golden-500 hover:bg-golden-600">
                  <Link href="/admission" onClick={() => setIsOpen(false)}>
                    Apply Now
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
