"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  stores: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
}

export function SalesDashboard() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.products || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchProducts();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Products List</h2>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Price</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Total Stock</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Store Distribution</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">{product.name}</td>
                  <td className="p-4 align-middle">{product.description}</td>
                  <td className="p-4 align-middle">${product.price.toFixed(2)}</td>
                  <td className="p-4 align-middle">{product.stock}</td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col gap-1">
                      {product.stores.map(store => (
                        <div key={store.id} className="text-sm">
                          {store.name}: {store.stock}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
