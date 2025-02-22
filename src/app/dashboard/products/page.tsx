"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal
} from "lucide-react"
import { AddProductDialog } from "@/components/dialogs/add-product-dialog"

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  price: number
  stock: number
  minStockLevel: number
  category: string | null
  storeStocks: Array<{
    store: {
      id: string
      name: string
      latitude: number
      longitude: number
      status: string
    }
    quantity: number
  }>
  sales: Array<{
    quantity: number
    price: number
  }>
  createdBy: {
    id: string
    name: string | null
    email: string
  }
}

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      if (!data.products || !Array.isArray(data.products)) {
        throw new Error("Invalid data format received from API")
      }

      setProducts(data.products)
      setLoading(false)
      setError(null)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted && session?.user) {
      fetchProducts()
    }
  }, [session, mounted])

  if (!mounted || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[200px] glass rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl glass border-error/20 bg-error/10 p-4">
        <div className="flex items-center gap-2 text-error">
          <AlertCircle className="h-5 w-5" />
          <span>Error loading products: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <AddProductDialog onProductAdded={fetchProducts} />
      </div>

      <div className="rounded-xl border border-border glass">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex flex-1 items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted" />
              <input
                placeholder="Search products..."
                className="flex h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-background-light text-foreground h-10 px-4 py-2">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-background-dark">
              <tr className="border-b border-border">
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground">
                  <button className="inline-flex items-center gap-2 text-foreground">
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground">
                  <button className="inline-flex items-center gap-2 text-foreground">
                    SKU
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground">
                  <button className="inline-flex items-center gap-2 text-foreground">
                    Price
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground">
                  <button className="inline-flex items-center gap-2 text-foreground">
                    Stock
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground">
                  Category
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border transition-colors hover:bg-background-light"
                >
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">
                        {product.name}
                      </div>
                      <div className="text-sm text-muted">
                        {product.description}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{product.sku}</td>
                  <td className="p-4 text-foreground">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{product.stock}</span>
                      {product.stock <= product.minStockLevel && (
                        <span className="rounded-full bg-error/20 px-2 py-1 text-xs font-medium text-error">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-foreground">
                    {product.category || "—"}
                  </td>
                  <td className="p-4">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent p-0 text-sm font-medium text-foreground hover:bg-background-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
