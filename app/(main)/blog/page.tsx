import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react"
import Image from "next/image"

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "The Benefits of Interactive Learning in Early Childhood",
      excerpt:
        "Discover how interactive learning tools and technology can enhance your child's educational experience and development.",
      image: "/placeholder.svg?height=300&width=400&text=Interactive+Learning",
      author: "Sarah Johnson",
      date: "2024-01-15",
      category: "Education",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "Choosing the Right Learning Aids for Your Child",
      excerpt:
        "A comprehensive guide to selecting educational toys and tools that match your child's age, interests, and learning style.",
      image: "/placeholder.svg?height=300&width=400&text=Learning+Aids",
      author: "Michael Chen",
      date: "2024-01-10",
      category: "Products",
      readTime: "7 min read",
    },
    {
      id: 3,
      title: "Preparing Your Child for School: A Parent's Guide",
      excerpt:
        "Essential tips and strategies to help your child transition smoothly from home to nursery school environment.",
      image: "/placeholder.svg?height=300&width=400&text=School+Preparation",
      author: "Emily Rodriguez",
      date: "2024-01-05",
      category: "Parenting",
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "The Role of Technology in Modern Early Education",
      excerpt:
        "Exploring how educational technology is transforming the way young children learn and develop essential skills.",
      image: "/placeholder.svg?height=300&width=400&text=Education+Technology",
      author: "David Park",
      date: "2023-12-28",
      category: "Technology",
      readTime: "8 min read",
    },
    {
      id: 5,
      title: "Building Social Skills in Nursery School",
      excerpt:
        "Understanding the importance of social development and how nursery school environments foster interpersonal skills.",
      image: "/placeholder.svg?height=300&width=400&text=Social+Skills",
      author: "Lisa Williams",
      date: "2023-12-20",
      category: "Development",
      readTime: "5 min read",
    },
    {
      id: 6,
      title: "Creating a Learning-Rich Environment at Home",
      excerpt:
        "Simple ways to extend your child's learning beyond school hours with engaging activities and educational resources.",
      image: "/placeholder.svg?height=300&width=400&text=Home+Learning",
      author: "Amanda Thompson",
      date: "2023-12-15",
      category: "Home Learning",
      readTime: "6 min read",
    },
  ]

  const categories = ["All", "Education", "Products", "Parenting", "Technology", "Development", "Home Learning"]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-50 via-golden-50 to-purple-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-cyan-100 text-cyan-800 mb-4">Educational Resources</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Golden Light
            <span className="text-cyan-600"> Blog</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Expert insights, parenting tips, and educational resources to support your child's learning journey
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className={category === "All" ? "bg-golden-500 hover:bg-golden-600" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-white/90 text-gray-900">{post.category}</Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <User className="h-4 w-4 mr-1" />
                    <span className="mr-4">{post.author}</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="mr-4">{new Date(post.date).toLocaleDateString()}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <CardTitle className="text-xl line-clamp-2 group-hover:text-golden-600 transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-golden-50 group-hover:border-golden-300 bg-transparent"
                  >
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-4 bg-gradient-to-r from-golden-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6 text-golden-100" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to our newsletter for the latest educational insights, parenting tips, and school updates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900" />
            <Button size="lg" variant="secondary">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
