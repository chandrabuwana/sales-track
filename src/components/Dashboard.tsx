'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sales Market Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Total Products</h2>
          {loading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <p className="text-3xl font-bold">{products.length}</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Low Stock Items</h2>
          {loading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <p className="text-3xl font-bold">
              {products.filter(p => p.stock < 10).length}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Total Inventory Value</h2>
          {loading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <p className="text-3xl font-bold">
              ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
            </p>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))
          ) : (
            products.slice(0, 6).map(product => (
              <Card key={product.id} className="p-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">
                  Stock: {product.stock} | ${product.price}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
