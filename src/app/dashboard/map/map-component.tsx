"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AlertCircle, Package, User, MapPin, Store as StoreIcon } from "lucide-react";

// Jakarta coordinates
const JAKARTA_CENTER = [-6.2088, 106.8456];
const JAKARTA_BOUNDS = {
  north: -6.1,
  south: -6.4,
  east: 107.0,
  west: 106.7,
};

// Fix for default marker icons in Next.js
const storeIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  status: string;
  stats: {
    totalProducts: number;
    totalSales: number;
    lastSale: string | null;
    lowStock: number;
  };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStockLevel: number;
  category: string | null;
}

interface MapState {
  stores: Store[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

const MapComponent = () => {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<MapState>({
    stores: [],
    products: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stores
        const storesResponse = await fetch("/api/stores");
        if (!storesResponse.ok) {
          throw new Error("Failed to fetch stores");
        }
        const storesData = await storesResponse.json();

        // Fetch products
        const productsResponse = await fetch("/api/products");
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await productsResponse.json();

        setState({
          stores: storesData.stores,
          products: productsData.products,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "An error occurred",
        }));
      }
    }

    if (mounted && session?.user) {
      fetchData();
    }
  }, [session, mounted]);

  if (!mounted || status === "loading" || state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] glass rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="rounded-xl glass border-border p-4">
        <div className="flex items-center gap-2 text-error">
          <AlertCircle className="h-5 w-5" />
          <span>Error loading map data: {state.error}</span>
        </div>
      </div>
    );
  }

  // Filter stores to only include those in Jakarta area
  const jakartaStores = state.stores.filter(store => 
    store.latitude >= JAKARTA_BOUNDS.south &&
    store.latitude <= JAKARTA_BOUNDS.north &&
    store.longitude >= JAKARTA_BOUNDS.west &&
    store.longitude <= JAKARTA_BOUNDS.east
  );

  return (
    <div className="space-y-6">
      <div className="h-[600px] w-full rounded-xl border-border glass shadow-lg overflow-hidden">
        <MapContainer
          center={JAKARTA_CENTER}
          zoom={12}
          className="h-full w-full rounded-xl"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {jakartaStores.map((store) => (
            <Marker
              key={store.id}
              position={[store.latitude, store.longitude]}
              icon={storeIcon}
            >
              <Popup>
                <div className="min-w-[300px] p-4">
                  {/* Store Header */}
                  <div className="border-b border-white/10 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${store.status === 'ACTIVE' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                        <StoreIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base">{store.name}</h3>
                        <p className="text-xs text-gray-400">{store.address}, {store.city}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full inline-block ${
                        store.status === 'ACTIVE' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                      }`}>
                        {store.status}
                      </span>
                    </div>
                  </div>

                  {/* Store Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">Total Products</p>
                      <p className="text-sm font-medium text-white">{store.stats.totalProducts}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">Total Sales</p>
                      <p className="text-sm font-medium text-white">{store.stats.totalSales}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">Low Stock Items</p>
                      <p className={`text-sm font-medium ${store.stats.lowStock > 0 ? 'text-error' : 'text-success'}`}>
                        {store.stats.lowStock}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">Last Sale</p>
                      <p className="text-sm font-medium text-white">
                        {store.stats.lastSale 
                          ? new Date(store.stats.lastSale).toLocaleDateString()
                          : 'No sales yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;
