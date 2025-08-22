import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Award, Target, BookOpen, Lightbulb } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Nurturing Care",
      description:
        "We provide a warm, caring environment where every child feels valued and supported in their learning journey.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We embrace technology and innovative teaching methods to make learning engaging and effective.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "We build strong relationships with families and create a supportive community for all our students.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "We strive for excellence in education while maintaining affordability and accessibility for all families.",
    },
  ]

  const team = [
    {
      name: "Sarah Johnson",
      role: "Head Teacher & Founder",
      image: "/placeholder.svg?height=300&width=300&text=Sarah+Johnson",
      bio: "With over 15 years in early childhood education, Sarah founded Golden Light School to provide quality, affordable education.",
    },
    {
      name: "Michael Chen",
      role: "Educational Technology Specialist",
      image: "/placeholder.svg?height=300&width=300&text=Michael+Chen",
      bio: "Michael brings expertise in educational technology, helping integrate smart learning aids into our curriculum.",
    },
    {
      name: "Emily Rodriguez",
      role: "Child Development Specialist",
      image: "/placeholder.svg?height=300&width=300&text=Emily+Rodriguez",
      bio: "Emily specializes in child psychology and development, ensuring our approach meets each child's unique needs.",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-golden-50 via-cyan-50 to-purple-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-golden-100 text-golden-800">About Golden Light School</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Our Story &<span className="text-golden-600"> Mission</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Founded in 2021, Golden Light School Ltd was born from a vision to provide quality, affordable
                  education enhanced with modern technology. We believe every child deserves the best start in their
                  educational journey.
                </p>
                <p className="text-lg font-semibold text-cyan-600 italic">
                  "Attitude, Knowledge, Skills and Strength" - Our guiding motto
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/placeholder.svg?height=600&width=500&text=School+Building"
                  alt="Golden Light School building"
                  width={500}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="border-2 border-golden-200 bg-gradient-to-br from-golden-50 to-golden-100">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Target className="mr-3 h-8 w-8 text-golden-600" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To provide affordable, high-quality early childhood education that combines traditional nurturing with
                  innovative technology. We aim to develop well-rounded individuals with strong attitudes, comprehensive
                  knowledge, practical skills, and inner strength.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <BookOpen className="mr-3 h-8 w-8 text-cyan-600" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To be the leading provider of innovative, affordable early childhood education, where every child is
                  empowered to reach their full potential through personalized learning experiences and cutting-edge
                  educational technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at Golden Light School
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="text-center border-2 hover:border-golden-200 transition-colors">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-golden-100 to-golden-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-golden-600" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated professionals committed to your child's success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <Badge className="bg-cyan-100 text-cyan-800 mx-auto">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-gradient-to-r from-golden-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Why Choose Golden Light School?</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4">
              <div className="text-4xl font-bold">3+</div>
              <div className="text-golden-100">Years of Excellence</div>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-bold">200+</div>
              <div className="text-golden-100">Happy Students</div>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-bold">50+</div>
              <div className="text-golden-100">Learning Products</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/admission">Join Our Family</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-golden-600 bg-transparent"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
