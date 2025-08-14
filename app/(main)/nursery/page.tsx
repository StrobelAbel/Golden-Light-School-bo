import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Clock, Award, Heart, Shield, Play, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function NurseryPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Ages 2-5 • Nurturing Environment</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Our Nursery
                  <span className="text-blue-600"> School</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  A warm, caring environment where your child's educational journey begins. We focus on holistic
                  development through play-based learning and interactive activities.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/admission">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Apply for Admission
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/gallery">
                    <Play className="mr-2 h-5 w-5" />
                    Virtual Tour
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/placeholder.svg?height=600&width=500"
                  alt="Nursery classroom with children and teacher"
                  width={500}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Overview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Nursery?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a foundation for lifelong learning in a safe, nurturing, and stimulating environment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Caring Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Qualified, experienced educators who genuinely care about each child's development
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Safe Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Secure facilities with child-proofed areas and constant supervision
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Play className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Play-Based Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Learning through play, exploration, and hands-on activities</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Small Class Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Low teacher-to-student ratios ensuring personalized attention
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg">Flexible Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Convenient scheduling options to fit working parents' needs</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">School Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Preparing children for a smooth transition to primary school
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Curriculum Highlights */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Curriculum</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive program designed to develop the whole child
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Language & Literacy</h3>
                    <p className="text-gray-600">
                      Building communication skills through storytelling, phonics, and interactive reading activities
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Mathematics & Logic</h3>
                    <p className="text-gray-600">
                      Early math concepts through counting, patterns, shapes, and problem-solving games
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Social & Emotional</h3>
                    <p className="text-gray-600">
                      Developing empathy, cooperation, and emotional intelligence through group activities
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Play className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Creative Arts</h3>
                    <p className="text-gray-600">
                      Expressing creativity through art, music, dance, and imaginative play
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Children learning activities"
                width={600}
                height={500}
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Facilities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern, child-friendly spaces designed for learning and growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=200&width=400" alt="Classroom" fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle>Interactive Classrooms</CardTitle>
                <CardDescription>
                  Bright, spacious rooms equipped with educational technology and learning materials
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=200&width=400" alt="Playground" fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle>Safe Playground</CardTitle>
                <CardDescription>
                  Secure outdoor area with age-appropriate equipment for physical development
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=200&width=400" alt="Library" fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle>Reading Corner</CardTitle>
                <CardDescription>
                  Cozy library space filled with age-appropriate books and storytelling area
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Enrollment Information */}
      <section className="py-20 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Ready to Enroll Your Child?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our nurturing community and give your child the best start in their educational journey
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Age Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Ages 2-5 years</p>
                <p className="text-sm text-gray-500 mt-2">Mixed-age learning environment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">School Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">8:00 AM - 3:00 PM</p>
                <p className="text-sm text-gray-500 mt-2">Extended care available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class Size</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Max 12 students</p>
                <p className="text-sm text-gray-500 mt-2">2 teachers per class</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/admission">Start Application</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Schedule Visit</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
