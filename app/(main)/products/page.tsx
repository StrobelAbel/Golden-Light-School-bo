"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, ShoppingCart, Package, Star, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

interface OrderForm {
  productId: string
  productName: string
  productPrice: number
  quantity: number
  parentName: string
  email: string
  phone: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [orderForm, setOrderForm] = useState<OrderForm>({
    productId: "",
    productName: "",
    productPrice: 0,
    quantity: 1,
    parentName: "",
    email: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const categories = ["Books", "Toys", "Art Supplies", "Educational Games", "Electronics", "Other"]

  useEffect(() => {
    fetchProducts()
    // Poll for products every 10 seconds
    const interval = setInterval(fetchProducts, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchProducts = async () => {
    try {
      // Only fetch visible products for public view
      const response = await fetch("/api/products?isVisible=true")
      const data = await response.json()
      // Filter out products with zero stock
      const availableProducts = data.filter((product: Product) => product.stock > 0)
      setProducts(availableProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product)
    setOrderForm({
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      quantity: 1,
      parentName: "",
      email: "",
      phone: "",
    })
    setIsOrderDialogOpen(true)
    setOrderSuccess(false)
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, Math.min(selectedProduct?.stock || 1, orderForm.quantity + change))
    setOrderForm({ ...orderForm, quantity: newQuantity })
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderForm),
      })

      if (response.ok) {
        setOrderSuccess(true)
        // Refresh products to update stock
        fetchProducts()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetOrderForm = () => {
    setOrderForm({
      productId: "",
      productName: "",
      productPrice: 0,
      quantity: 1,
      parentName: "",
      email: "",
      phone: "",
    })
    setSelectedProduct(null)
    setOrderSuccess(false)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-green-100 text-green-800 mb-4">Learning Products</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Educational
              <span className="text-green-600"> Learning Aids</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover our carefully curated collection of interactive learning tools and educational toys
            </p>
          </div>
        </section>

        {/* Loading State */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-green-100 text-green-800 mb-4">Learning Products</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Educational
            <span className="text-green-600"> Learning Aids</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover our carefully curated collection of interactive learning tools and educational toys designed to
            enhance your child's learning experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="#products">
                <Package className="mr-2 h-5 w-5" />
                Browse Products
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
            >
              <Link href="/contact">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Contact for Inquiries
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Quality Assured</h3>
              <p className="text-gray-600">All products are tested for safety and educational value</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Age Appropriate</h3>
              <p className="text-gray-600">Carefully selected for different developmental stages</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Easy Ordering</h3>
              <p className="text-gray-600">Simple online ordering with pickup at school</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Learning Products</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Interactive tools and educational aids to support your child's development
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full lg:w-64 h-12">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {searchTerm || selectedCategory !== "all" ? "No products found" : "No products available"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "We're working on adding new products to our catalog. Check back soon!"}
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/contact">Contact Us for Product Requests</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 bg-gray-100">
                    {product.image ? (
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=300&text=No+Image"
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-gray-900">{product.category}</Badge>
                    </div>
                    {product.stock < 10 && product.stock > 0 && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="destructive" className="text-xs">
                          Only {product.stock} left
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-green-600">{product.price} Frw</span>
                      <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>
                    <Button
                      onClick={() => handleOrderClick(product)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Order Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results Count */}
          {filteredProducts.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-gray-600">Showing {filteredProducts.length} available products</p>
            </div>
          )}
        </div>
      </section>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{orderSuccess ? "Order Placed Successfully!" : `Order ${selectedProduct?.name}`}</DialogTitle>
          </DialogHeader>

          {orderSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Confirmed!</h3>
              <p className="text-gray-600 mb-4">
                Your order for {orderForm.quantity} x {orderForm.productName} has been placed successfully.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Total: {(orderForm.quantity * orderForm.productPrice)} Frw
              </p>
              <p className="text-sm text-gray-600 mb-6">
                We'll contact you when your order is ready for pickup at the school.
              </p>
              <Button
                onClick={() => {
                  setIsOrderDialogOpen(false)
                  resetOrderForm()
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {selectedProduct && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{selectedProduct.name}</h4>
                    <span className="font-bold text-green-600">{selectedProduct.price} Frw</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Quantity:</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={orderForm.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{orderForm.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        disabled={orderForm.quantity >= selectedProduct.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-lg font-bold">
                      Total: {(orderForm.quantity * orderForm.productPrice)} Frw
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <Input
                  id="parentName"
                  value={orderForm.parentName}
                  onChange={(e) => setOrderForm({ ...orderForm, parentName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={orderForm.email}
                  onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p>
                  <strong>Pickup Information:</strong>
                </p>
                <p>• Orders are available for pickup at Golden Light School</p>
                <p>• We'll contact you when your order is ready</p>
                <p>• Payment can be made upon pickup</p>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOrderDialogOpen(false)
                    resetOrderForm()
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700">
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Enhance Your Child's Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Browse our collection and place your order for pickup at Golden Light School
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-green-600 bg-transparent"
            >
              <Link href="/nursery">Learn About Our School</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
