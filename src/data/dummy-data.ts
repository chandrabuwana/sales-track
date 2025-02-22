// Simple UUID generator
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES';
  region: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  description: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Distribution {
  id: string;
  productId: string;
  storeId: string;
  salesId: string;
  quantity: number;
  distributionDate: string;
  price: number;
  notes?: string;
}

// Dummy Users (Sales Team)
export const users: User[] = [
  {
    id: generateId(),
    name: "Budi Santoso",
    email: "budi.s@example.com",
    role: "SALES",
    region: "Jakarta Selatan"
  },
  {
    id: generateId(),
    name: "Dewi Putri",
    email: "dewi.p@example.com",
    role: "SALES",
    region: "Jakarta Barat"
  },
  {
    id: generateId(),
    name: "Eko Prasetyo",
    email: "eko.p@example.com",
    role: "SALES",
    region: "Jakarta Timur"
  },
  {
    id: generateId(),
    name: "Siti Rahma",
    email: "siti.r@example.com",
    role: "SALES",
    region: "Jakarta Utara"
  }
];

// Dummy Products
export const products: Product[] = [
  {
    id: generateId(),
    name: "Indomie Goreng",
    sku: "INDO-001",
    price: 3500,
    category: "Instant Noodles",
    description: "Popular instant fried noodles"
  },
  {
    id: generateId(),
    name: "Aqua 600ml",
    sku: "AQU-001",
    price: 4000,
    category: "Beverages",
    description: "Mineral water 600ml bottle"
  },
  {
    id: generateId(),
    name: "Good Day Cappuccino",
    sku: "GD-001",
    price: 7500,
    category: "Beverages",
    description: "Ready to drink coffee"
  },
  {
    id: generateId(),
    name: "Chitato Classic",
    sku: "CHT-001",
    price: 9500,
    category: "Snacks",
    description: "Potato chips classic flavor"
  },
  {
    id: generateId(),
    name: "Ultra Milk",
    sku: "ULT-001",
    price: 6000,
    category: "Beverages",
    description: "UHT milk 250ml"
  }
];

// Dummy Stores (Jakarta area)
export const stores: Store[] = [
  {
    id: generateId(),
    name: "Toko Sejahtera",
    address: "Jl. Fatmawati No. 10, Cilandak",
    area: "Jakarta Selatan",
    latitude: -6.2884,
    longitude: 106.7977,
    status: "ACTIVE"
  },
  {
    id: generateId(),
    name: "Warung Barokah",
    address: "Jl. Kebon Jeruk Raya No. 55",
    area: "Jakarta Barat",
    latitude: -6.1897,
    longitude: 106.7683,
    status: "ACTIVE"
  },
  {
    id: generateId(),
    name: "Mini Market Jaya",
    address: "Jl. Rawamangun No. 15",
    area: "Jakarta Timur",
    latitude: -6.2088,
    longitude: 106.8845,
    status: "ACTIVE"
  },
  {
    id: generateId(),
    name: "Toko Lima Saudara",
    address: "Jl. Sunter Raya No. 88",
    area: "Jakarta Utara",
    latitude: -6.1544,
    longitude: 106.8670,
    status: "ACTIVE"
  },
  {
    id: generateId(),
    name: "Warung Berkah",
    address: "Jl. Menteng Raya No. 25",
    area: "Jakarta Pusat",
    latitude: -6.1967,
    longitude: 106.8345,
    status: "ACTIVE"
  }
];

// Generate dummy distributions (last 30 days)
export const generateDistributions = (): Distribution[] => {
  const distributions: Distribution[] = [];
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

  // For each store
  stores.forEach(store => {
    // Each salesperson visits 2-3 times in 30 days
    users.forEach(user => {
      const visitCount = Math.floor(Math.random() * 2) + 2; // 2-3 visits
      
      for (let i = 0; i < visitCount; i++) {
        // Random date within last 30 days
        const distributionDate = new Date(
          thirtyDaysAgo.getTime() + Math.random() * (today.getTime() - thirtyDaysAgo.getTime())
        );

        // Distribute 2-4 products per visit
        const productCount = Math.floor(Math.random() * 3) + 2;
        const selectedProducts = [...products]
          .sort(() => Math.random() - 0.5)
          .slice(0, productCount);

        selectedProducts.forEach(product => {
          distributions.push({
            id: generateId(),
            productId: product.id,
            storeId: store.id,
            salesId: user.id,
            quantity: Math.floor(Math.random() * 50) + 10, // 10-60 units
            distributionDate: distributionDate.toISOString(),
            price: product.price * (1 + Math.random() * 0.2), // Random markup up to 20%
            notes: Math.random() > 0.7 ? "Promotional price" : undefined
          });
        });
      }
    });
  });

  return distributions.sort((a, b) => 
    new Date(b.distributionDate).getTime() - new Date(a.distributionDate).getTime()
  );
};

export const distributions = generateDistributions();
