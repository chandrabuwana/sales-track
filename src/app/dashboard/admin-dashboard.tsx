"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  Store,
  Package,
  Users,
  DollarSign,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  minStockLevel: number;
  category: string | null;
  storeStocks: Array<{
    store: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      status: string;
    };
    quantity: number;
  }>;
  sales: Array<{
    quantity: number;
    price: number;
  }>;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalUsers: number;
  totalStores: number;
  isLoading: boolean;
  error: string | null;
}

export function AdminDashboard() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    totalUsers: 0,
    totalStores: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsRes, usersRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/users"),
        ]);

        if (!productsRes.ok || !usersRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [productsData, usersData] = await Promise.all([
          productsRes.json(),
          usersRes.json(),
        ]);

        const products = productsData.products || [];
        const users = usersData.users || [];

        // Calculate total sales from product sales history
        const totalSales = products.reduce((acc: number, product: Product) => {
          if (!product.sales) return acc;
          return acc + product.sales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
        }, 0);

        // Get unique stores from product store stocks
        const uniqueStores = new Set(
          products.flatMap((product: Product) => 
            product.storeStocks?.map(stock => stock.store.id) || []
          )
        );

        setStats({
          totalProducts: products.length || 0,
          totalSales,
          totalUsers: users.length || 0,
          totalStores: uniqueStores.size || 0,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Dashboard error:", error);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "An error occurred",
        }));
      }
    }

    if (mounted && session?.user) {
      fetchStats();
    }
  }, [session, mounted]);

  if (!mounted || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Error loading dashboard data: {stats.error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Revenue</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Products</h3>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Stores</h3>
            <Store className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.totalStores}</div>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Users</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </div>
      </div>
    </div>
  );
}
