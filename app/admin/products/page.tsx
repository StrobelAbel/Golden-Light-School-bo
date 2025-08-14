"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin-layout"

// Mock products data
const products = [
  {
    id: 1,
    name: "Interactive Learning Tablet",
    category: "Smart Toys",
    price: 89.99,
    stock: 25,
    status: "active",
    sales: 124,
  },
  {
    id: 2,
    name: "Bluetooth Sound System",
    category: "Sound Systems",
    price: 149.99,
    stock: 12,
    status: "active",
    sales: 89,
  },
  {
    id: 3,
    name: "Alphabet Learning Blocks",
    category: "Smart Toys",
    price: 34.99,
    stock: 45,
    status: "active",
    sales: 156,
  },
  {
    id: 4,
    name: "Math Learning Kit",
    category: "Educational Kits",
    price: 59.99,
    stock: 8,
    status: "low_stock",
    sales: 98,
  },
  {
    id: 5,
    name: "Interactive Whiteboard",
    category: "Classroom Tech",
    price: 299.99,
    stock: 3,
    status: "low_stock",
    sales: 67,
  },
  {
    id: 6,
    name: "Story Time Speaker",
    category: "Sound Systems",
    price: 79.99,
    stock: 0,
    status: "out_of_stock",
    sales: 143,
  },
]

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string, stock: number) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
    }
    if (status === "low_stock" || stock < 10) {
      return <Badge className="bg-golden-100 text-golden-800">Low Stock</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">Manage your learning aids and educational products</p>
          </div>
          <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {products.filter((p) => p.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golden-600">
                {products.filter((p) => p.stock < 10 && p.stock > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{products.filter((p) => p.stock === 0).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>View and manage all your educational products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{getStatusBadge(product.status, product.stock)}</TableCell>
                      <TableCell>{product.sales}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
