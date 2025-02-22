"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  MapPin,
  Users,
  Package,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: "ACTIVE" | "LOW_STOCK" | "NO_STOCK" | "INACTIVE";
  _count?: {
    stocks: number;
  };
}

interface StoreWithStats extends Store {
  stats: {
    totalProducts: number;
    totalSales: number;
    lastSale: string | null;
    lowStock: number;
  };
}

export default function StoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<StoreWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch("/api/stores");
        if (!response.ok) {
          throw new Error("Failed to fetch stores");
        }
        const data = await response.json();
        setStores(data.stores);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchStores();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stores</h1>
          <p className="text-muted-foreground">View store inventory and distribution history</p>
        </div>
        {session?.user.role === "SALES" && (
          <Button
            onClick={() => router.push("/dashboard/stores/register")}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Store
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <Link
            href={`/dashboard/stores/${store.id}`}
            key={store.id}
            className="block p-6 rounded-lg border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{store.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {store.address}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  store.status === "ACTIVE"
                    ? "bg-success/10 text-success"
                    : store.status === "LOW_STOCK"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {store.status.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {store.stats.totalProducts}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Package className="h-3 w-3" />
                  Products
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-warning">
                  {store.stats.lowStock}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Low Stock
                </div>
              </div>
            </div>

            {store.stats.lastSale && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Last Sale: {new Date(store.stats.lastSale).toLocaleDateString()}
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
