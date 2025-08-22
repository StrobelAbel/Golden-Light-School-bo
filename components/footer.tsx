import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image src="/images/logo.jpg" alt="Golden Light School Logo" fill className="object-contain" />
              </div>
              <span className="font-bold text-xl">Golden Light School</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Nurturing young minds with affordable, interactive, and tech-enhanced education since 2021.
            </p>
            <p className="text-cyan-400 text-sm font-medium">Attitude, Knowledge, Skills and Strength</p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-cyan-400 p-2">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-cyan-400 p-2">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-cyan-400 p-2">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/nursery" className="block text-gray-300 hover:text-cyan-400 text-sm transition-colors">
                Nursery School
              </Link>
              <Link href="/products" className="block text-gray-300 hover:text-cyan-400 text-sm transition-colors">
                Learning Aids
              </Link>
              <Link href="/admission" className="block text-gray-300 hover:text-cyan-400 text-sm transition-colors">
                Admissions
              </Link>
              <Link href="/gallery" className="block text-gray-300 hover:text-cyan-400 text-sm transition-colors">
                Gallery
              </Link>
              <Link href="/testimonials" className="block text-gray-300 hover:text-cyan-400 text-sm transition-colors">
                Testimonials
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-golden-400" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-golden-400" />
                <span className="text-gray-300 text-sm">info@goldenlightschool.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-golden-400 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  123 Education Street
                  <br />
                  Learning City, LC 12345
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-gray-300 text-sm">
              Subscribe to our newsletter for updates on admissions and new products.
            </p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
              <Button className="w-full bg-golden-500 hover:bg-golden-600">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">© 2024 Golden Light School Ltd. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
