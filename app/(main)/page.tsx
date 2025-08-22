import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, Lightbulb, ArrowRight, Star, Play, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-50 via-golden-50 to-cyan-100 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200">Founded in 2021 • Growing Strong</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Golden Light School
                  <span className="text-cyan-600"> Ltd</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Nurturing young minds with affordable, interactive, and tech-enhanced education. From our nursery
                  school to innovative learning aids, we're illuminating the path to better learning.
                </p>
                <p className="text-lg font-semibold text-golden-600 italic">Attitude, Knowledge, Skills and Strength</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-golden-500 hover:bg-golden-600">
                  <Link href="/admission">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Apply for Admission
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent"
                >
                  <Link href="/booking">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book a Visit
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">3+</div>
                  <div className="text-sm text-gray-600">Years of Excellence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">200+</div>
                  <div className="text-sm text-gray-600">Happy Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">50+</div>
                  <div className="text-sm text-gray-600">Learning Products</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/School.jpg?height=600&width=500"
                  alt="Golden Light School nursery classroom"
                  width={500}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Play className="h-4 w-4 text-cyan-600" />
                      Interactive Learning Environment
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Golden Light School?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine traditional nurturing with modern technology to create an engaging learning environment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-cyan-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-cyan-600" />
                </div>
                <CardTitle className="text-lg">Quality Education</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Comprehensive curriculum designed for early childhood development
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-golden-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-golden-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-6 w-6 text-golden-600" />
                </div>
                <CardTitle className="text-lg">Tech-Enhanced</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Interactive learning aids and sound systems for better engagement
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-cyan-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Affordable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Quality education and learning tools at accessible prices</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-golden-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Proven Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">3+ years of successful education and happy families</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Nursery School */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image src="/nursery.jpg?height=200&width=400" alt="Nursery School" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-white text-gray-900">Nursery School</Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Our Nursery School</CardTitle>
                <CardDescription className="text-base">
                  A nurturing environment where children aged 2-5 develop foundational skills through play-based
                  learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    Interactive curriculum and activities
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    Qualified and caring teachers
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    Safe and stimulating environment
                  </div>
                </div>
                <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <Link href="/nursery">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Learning Products */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src="/smart.jpg?height=200&width=400"
                  alt="Learning Products"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-white text-gray-900">Learning Aids</Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Interactive Learning Aids</CardTitle>
                <CardDescription className="text-base">
                  Smart toys, sound systems, and educational tools designed to enhance learning effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-golden-400 rounded-full" />
                    Smart educational toys and games
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-golden-400 rounded-full" />
                    Professional sound systems
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-golden-400 rounded-full" />
                    Affordable and effective solutions
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-golden-300 text-golden-700 hover:bg-golden-50 bg-transparent"
                >
                  <Link href="/products">
                    Shop Products <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What Parents Say</h2>
            <p className="text-xl text-gray-600">Hear from families who trust Golden Light School</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-golden-400 text-golden-400" />
                  ))}
                </div>
                <CardTitle className="text-lg">Sarah Johnson</CardTitle>
                <CardDescription>Parent of Emma, Age 4</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "Golden Light School has been amazing for Emma. The interactive learning approach has made her excited
                  about education!"
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-golden-400 text-golden-400" />
                  ))}
                </div>
                <CardTitle className="text-lg">Michael Chen</CardTitle>
                <CardDescription>Educator & Parent</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "The learning aids from Golden Light have transformed our home learning experience. Highly
                  recommended!"
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-golden-400 text-golden-400" />
                  ))}
                </div>
                <CardTitle className="text-lg">Lisa Williams</CardTitle>
                <CardDescription>Parent of twins</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "Affordable, quality education with caring teachers. Both my children love going to school here!"
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent"
            >
              <Link href="/testimonials">
                Read More Reviews <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-600 to-golden-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Join the Golden Light Family?</h2>
          <p className="text-xl mb-8 opacity-90">
            Give your child the best start in education with our nurturing environment and innovative learning tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/booking">Book a Visit</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-cyan-600 bg-transparent"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
