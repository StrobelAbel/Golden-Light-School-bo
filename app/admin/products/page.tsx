"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Package, AlertTriangle, Archive } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function AdminProductsPage() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "Books",
    stock: 0,
    isVisible: true,
  })

  const categories = ["Books", "Toys", "Art Supplies", "Educational Games", "Electronics", "Other"]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products"
      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchProducts()
        resetForm()
        setIsAddDialogOpen(false)
        setEditingProduct(null)
      }
    } catch (error) {
      console.error("Error saving product:", error)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return
    
    try {
      const response = await fetch(`/api/products/${productToDelete._id}`, { method: "DELETE" })
      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setDeleteConfirmOpen(false)
      setProductToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false)
    setProductToDelete(null)
  }

  const toggleVisibility = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !product.isVisible }),
      })
      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === product._id ? { ...p, isVisible: !product.isVisible } : p
          )
        )
      }
    } catch (error) {
      console.error("Error updating product visibility:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      image: "",
      category: "Books",
      stock: 0,
      isVisible: true,
    })
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock,
      isVisible: product.isVisible,
    })
    setIsAddDialogOpen(true)
  }

  // Enhanced filtering logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    
    let matchesStock = true
    switch (stockFilter) {
      case "out_of_stock":
        matchesStock = product.stock === 0
        break
      case "low_stock":
        matchesStock = product.stock > 0 && product.stock < 5
        break
      case "in_stock":
        matchesStock = product.stock >= 5
        break
      case "critical":
        matchesStock = product.stock < 5
        break
      default:
        matchesStock = true
    }
    
    return matchesSearch && matchesCategory && matchesStock
  })

  // Helper functions for stock display
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <Badge variant="destructive" className="bg-red-600">
          <Archive className="w-3 h-3 mr-1" />
          {t("Out of Stock")}
        </Badge>
      )
    } else if (stock < 5) {
      return (
        <Badge variant="destructive" className="bg-orange-500">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {t("Low Stock")}
        </Badge>
      )
    }
    return null
  }

  const getStockText = (stock: number) => {
    if (stock === 0) return "Empty"
    return `${stock} ${t("available")}`
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-600 font-semibold"
    if (stock < 5) return "text-orange-600 font-semibold" 
    return "text-gray-500"
  }

  // Calculate stats for display
  const outOfStockCount = products.filter(p => p.stock === 0).length
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 5).length
  const inStockCount = products.filter(p => p.stock >= 5).length

  if (loading) {
    return (
      <div className="page-root">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-root">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t("Delete Product")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("Are you sure you want to delete")} "{productToDelete?.name}"? {t("This action cannot be undone and will permanently remove the product from your inventory")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />{t("Delete Product")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{t("Products")}</div>
          <div className="page-subtitle">{t("Manage your learning aids and educational products")}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <span className="status-badge in-stock">{inStockCount} {t("in stock")}</span>
            <span className="status-badge low-stock">{lowStockCount} {t("Low Stock")}</span>
            <span className="status-badge out-stock">{outOfStockCount} {t("Empty")}</span>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-accent"><Plus size={15} />{t("Add New Product")}</button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? t("Edit") + " " + t("Products") : t("Add New Product")}</DialogTitle>
            </DialogHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
              <div className="form-grid-2">
                <div className="form-field">
                  <Label className="form-label" htmlFor="name">{t("Name")}</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-8 text-sm" />
                </div>
                <div className="form-field">
                  <Label className="form-label" htmlFor="category">{t("Category")}</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="description">{t("Description")}</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="text-sm" />
              </div>
              <div className="form-grid-3">
                <div className="form-field">
                  <Label className="form-label" htmlFor="price">{t("Price")} ({t("Rwf")})</Label>
                  <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="h-8 text-sm" />
                </div>
                <div className="form-field">
                  <Label className="form-label" htmlFor="stock">{t("Stock")}</Label>
                  <Input id="stock" type="number" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })} className="h-8 text-sm" />
                </div>
                <div className="form-field" style={{ justifyContent: "flex-end", paddingBottom: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                    <input type="checkbox" checked={formData.isVisible} onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })} />
                    {t("Visible to public")}
                  </label>
                </div>
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="image">{t("Image URL")}</Label>
                <Input id="image" type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://example.com/image.jpg" className="h-8 text-sm" />
              </div>
              <div className="dialog-footer">
                <button className="btn-outline-sm" onClick={() => { setIsAddDialogOpen(false); setEditingProduct(null); resetForm() }}>{t("Cancel")}</button>
                <button className="btn-accent" onClick={handleSubmit}>{editingProduct ? t("Save") : t("Add")}</button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "hsl(var(--muted-foreground))" }} />
          <Input placeholder={t("Search products...")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder={t("All Categories")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Categories")}</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="Stock Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Stock Levels")}</SelectItem>
            <SelectItem value="in_stock">{t("In Stock")} (5+)</SelectItem>
            <SelectItem value="low_stock">{t("Low Stock")} (1-4)</SelectItem>
            <SelectItem value="out_of_stock">{t("Out of Stock")} (0)</SelectItem>
            <SelectItem value="critical">{t("Critical")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product._id} className={`overflow-hidden transition-shadow hover:shadow-md ${
            product.stock === 0 ? "ring-1 ring-red-200" :
            product.stock < 5 ? "ring-1 ring-orange-200" : ""
          }`}>
            <div className="relative h-44 bg-gray-100">
              {product.image ? (
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <span className={`status-badge ${product.isVisible ? "in-stock" : "pending"}`}>
                  {product.isVisible ? t("Visible") : t("Hidden")}
                </span>
                {product.stock === 0 && <span className="status-badge out-stock">{t("Out of Stock")}</span>}
                {product.stock > 0 && product.stock < 5 && <span className="status-badge low-stock">{t("Low Stock")}</span>}
              </div>
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-white text-center"><Archive className="h-7 w-7 mx-auto mb-1" /><p className="text-sm font-semibold">{t("Out of Stock")}</p></div>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                <span className="text-sm font-bold" style={{ color: "hsl(30 95% 50%)", flexShrink: 0, marginLeft: 8 }}>{product.price} {t("Rwf")}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                <span>{product.category}</span>
                <span className={product.stock === 0 ? "text-red-600 font-semibold" : product.stock < 5 ? "text-orange-600 font-semibold" : ""}>
                  {getStockText(product.stock)}
                </span>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => startEdit(product)}><Edit className="h-3 w-3" /></Button>
                <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => toggleVisibility(product)}>
                  {product.isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-red-600 hover:bg-red-50" onClick={() => handleDeleteClick(product)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="content-card">
          <div className="empty-state">
            <Package size={36} />
            <span className="empty-state-title">{t("No products found")}</span>
            <span className="empty-state-sub">
              {searchTerm || selectedCategory !== "all" || stockFilter !== "all"
                ? t("Try adjusting your search or filter criteria")
                : t("Get started by adding your first product")}
            </span>
            {!searchTerm && selectedCategory === "all" && stockFilter === "all" && (
              <button className="btn-accent" style={{ marginTop: 8 }} onClick={() => setIsAddDialogOpen(true)}>
                <Plus size={15} />{t("Add Your First Product")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
