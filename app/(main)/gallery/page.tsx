import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Play, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function GalleryPage() {
  const galleryItems = [
    {
      id: 1,
      title: "Nursery Classroom Activities",
      category: "Classroom",
      image: "/activity.jpg?height=300&width=400&text=Classroom+Activities",
      description: "Children engaged in interactive learning activities",
    },
    {
      id: 2,
      title: "Outdoor Playground Fun",
      category: "Playground",
      image: "/outdor.jpg?height=300&width=400&text=Playground+Fun",
      description: "Safe outdoor play area with modern equipment",
    },
    {
      id: 3,
      title: "Art and Creativity Time",
      category: "Activities",
      image: "/art.jpg?height=300&width=400&text=Art+Time",
      description: "Students expressing creativity through art projects",
    },
    {
      id: 4,
      title: "Reading Corner",
      category: "Learning",
      image: "/reading.jpg?height=300&width=400&text=Reading+Corner",
      description: "Cozy reading space with educational books",
    },
    {
      id: 5,
      title: "Interactive Learning Aids",
      category: "Technology",
      image: "/smart.jpg?height=300&width=400&text=Learning+Aids",
      description: "Smart toys and educational technology in action",
    },
    {
      id: 6,
      title: "Group Learning Sessions",
      category: "Classroom",
      image: "group.jpg?height=300&width=400&text=Group+Learning",
      description: "Collaborative learning and social development",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-50 via-golden-50 to-purple-50 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="bg-cyan-100 text-cyan-800 mb-4">Photo Gallery</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our School
            <span className="text-cyan-600"> Gallery</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Take a visual journey through Golden Light School and see our students learning, playing, and growing in our
            nurturing environment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-golden-500 hover:bg-golden-600">
              <Link href="/admission">
                <Heart className="mr-2 h-5 w-5" />
                Apply for Admission
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent"
            >
              <Link href="/contact">
                <Camera className="mr-2 h-5 w-5" />
                Schedule a Visit
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Badge className="bg-white/90 text-gray-900 mb-2">{item.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Tour CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-600 to-golden-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Want to See More?</h2>
          <p className="text-xl mb-8 opacity-90">
            Schedule a virtual tour or visit us in person to experience Golden Light School firsthand
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">
                <Play className="mr-2 h-5 w-5" />
                Virtual Tour
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-cyan-600 bg-transparent"
            >
              <Link href="/contact">
                <Camera className="mr-2 h-5 w-5" />
                Schedule Visit
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
