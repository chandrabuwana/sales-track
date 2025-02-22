'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Map,
  Package,
  Store,
  Users,
  Settings,
  LogOut,
  ShoppingCart,
  Truck,
  Receipt,
} from 'lucide-react';

const adminRoutes = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/map', label: 'Map View', icon: Map },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/dashboard/deliveries', label: 'Deliveries', icon: Truck },
  { href: '/dashboard/stores', label: 'Stores', icon: Store },
  { href: '/dashboard/stores/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const salesRoutes = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/map', label: 'Map View', icon: Map },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/dashboard/stores', label: 'Stores', icon: Store },
  { href: '/dashboard/stores/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const routes = session?.user?.role === 'ADMIN' ? adminRoutes : salesRoutes;

  return (
    <div className="flex h-full flex-col gradient-bg">
      <div className="flex h-16 items-center px-4 glass border-b border-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Sales Market
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                isActive 
                  ? 'gradient-border bg-card text-primary' 
                  : 'text-muted hover:text-foreground hover:bg-card'
              }`}
            >
              <route.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
              {route.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 glass">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full gradient-border flex items-center justify-center bg-card">
            <span className="text-sm font-medium text-foreground">
              {session?.user?.name?.[0] || 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{session?.user?.name}</p>
            <p className="text-xs text-muted">{session?.user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-error hover:bg-card"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
