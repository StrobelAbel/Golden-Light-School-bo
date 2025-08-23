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
      image: "/interact.jpg",
      author: "Uwimana Grace",
      date: "2024-01-15",
      category: "Education",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "Choosing the Right Learning Aids for Your Child",
      excerpt:
        "A comprehensive guide to selecting educational toys and tools that match your child's age, interests, and learning style.",
      image: "https://blogs.worldbank.org/content/dam/sites/blogs/img/detail/mgr/nasikiliza-24012024.jpg",
      author: "Niyonsenga Jean Claude",
      date: "2024-01-10",
      category: "Products",
      readTime: "7 min read",
    },
    {
      id: 3,
      title: "Preparing Your Child for School: A Parent's Guide",
      excerpt:
        "Essential tips and strategies to help your child transition smoothly from home to nursery school environment.",
      image: "/parenting.jpg",
      author: "Mukamana Esperance",
      date: "2024-01-05",
      category: "Parenting",
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "The Role of Technology in Modern Early Education",
      excerpt:
        "Exploring how educational technology is transforming the way young children learn and develop essential skills.",
      image: "https://iol-prod.appspot.com/image/66db5485e4925b9ca4fb4e57a35b7681206b0501=w700",
      author: "Habimana Patrick",
      date: "2023-12-28",
      category: "Technology",
      readTime: "8 min read",
    },
    {
      id: 5,
      title: "Building Social Skills in Nursery School",
      excerpt:
        "Understanding the importance of social development and how nursery school environments foster interpersonal skills.",
      image: "social.jpg",
      author: "Ingabire Christine",
      date: "2023-12-20",
      category: "Development",
      readTime: "5 min read",
    },
    {
      id: 6,
      title: "Creating a Learning-Rich Environment at Home",
      excerpt:
        "Simple ways to extend your child's learning beyond school hours with engaging activities and educational resources.",
      image: "data:image/jpeg;base64,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",
      author: "Byiringiro Emmanuel",
      date: "2023-12-15",
      category: "Home Learning",
      readTime: "6 min read",
    },
  ]

  const categories = ["All", "Education", "Products", "Parenting", "Technology", "Development", "Home Learning"]

  return (
    <div>
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
