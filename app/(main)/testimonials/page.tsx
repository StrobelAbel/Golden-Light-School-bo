import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Quote, Heart, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function TestimonialsPage() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Parent of Emma (Age 4)",
      image: "/placeholder.svg?height=100&width=100&text=Sarah",
      rating: 5,
      text: "Golden Light School has been absolutely wonderful for Emma. The teachers are caring, the facilities are excellent, and the interactive learning approach has made Emma excited about education. She comes home every day with new stories and skills!",
      highlight: "Interactive learning approach",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Parent & Educator",
      image: "/placeholder.svg?height=100&width=100&text=Michael",
      rating: 5,
      text: "As both a parent and an educator myself, I'm impressed by Golden Light School's commitment to quality education at affordable prices. The learning aids they provide have transformed our home learning experience too.",
      highlight: "Quality education at affordable prices",
    },
    {
      id: 3,
      name: "Lisa Williams",
      role: "Parent of twins Alex & Maya",
      image: "/placeholder.svg?height=100&width=100&text=Lisa",
      rating: 5,
      text: "Both my children love going to Golden Light School. The small class sizes mean they get individual attention, and the tech-enhanced learning keeps them engaged. The staff truly cares about each child's development.",
      highlight: "Individual attention and care",
    },
    {
      id: 4,
      name: "David Rodriguez",
      role: "Parent of Carlos (Age 3)",
      image: "/placeholder.svg?height=100&width=100&text=David",
      rating: 5,
      text: "The transition to Golden Light School was seamless. Carlos was shy at first, but the nurturing environment helped him blossom. Now he's confident, curious, and ready for the next step in his education.",
      highlight: "Nurturing environment",
    },
    {
      id: 5,
      name: "Amanda Thompson",
      role: "Parent of Sophie (Age 5)",
      image: "/placeholder.svg?height=100&width=100&text=Amanda",
      rating: 5,
      text: "The learning products from Golden Light School are fantastic! We've purchased several items for home use, and they're durable, educational, and reasonably priced. Sophie loves the interactive tablet especially.",
      highlight: "Quality learning products",
    },
    {
      id: 6,
      name: "James Park",
      role: "Parent of Oliver (Age 4)",
      image: "/placeholder.svg?height=100&width=100&text=James",
      rating: 5,
      text: "What sets Golden Light School apart is their motto: 'Attitude, Knowledge, Skills and Strength.' They truly develop the whole child, not just academic skills. Oliver has grown so much in confidence and social skills.",
      highlight: "Whole child development",
    },
  ]

  const stats = [
    { number: "98%", label: "Parent Satisfaction", icon: Heart },
    { number: "200+", label: "Happy Families", icon: Users },
    { number: "4.9/5", label: "Average Rating", icon: Star },
    { number: "3+", label: "Years of Excellence", icon: Quote },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-golden-50 via-cyan-50 to-purple-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-golden-100 text-golden-800 mb-4">Parent Reviews</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            What Parents
            <span className="text-golden-600"> Say</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Hear from the families who trust Golden Light School with their children's education and development
          </p>
          <div className="flex items-center justify-center space-x-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-8 w-8 fill-golden-400 text-golden-400" />
            ))}
            <span className="text-2xl font-bold text-gray-900 ml-4">4.9/5</span>
            <span className="text-gray-600">from 150+ reviews</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="text-center border-2 hover:border-golden-200 transition-colors">
                  <CardContent className="p-6">
                    <Icon className="h-8 w-8 text-golden-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Parent Testimonials</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real families about their Golden Light School experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-2 hover:border-golden-200 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-golden-400 text-golden-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Quote className="h-8 w-8 text-golden-200 absolute -top-2 -left-2" />
                    <p className="text-gray-700 italic mb-4 pl-6">"{testimonial.text}"</p>
                    <Badge className="bg-cyan-100 text-cyan-800 text-xs">{testimonial.highlight}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-golden-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Join Our Happy Family</h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the Golden Light School difference for your child. Join hundreds of satisfied families!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/admission">Apply for Admission</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-golden-600 bg-transparent"
            >
              <Link href="/contact">Schedule a Visit</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
