import { PrismaClient, StoreStatus, StoreType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create sales user
  const salesPassword = await hash('sales123', 12);
  const sales = await prisma.user.upsert({
    where: { email: 'sales@example.com' },
    update: {},
    create: {
      email: 'sales@example.com',
      name: 'Sales User',
      password: salesPassword,
      role: 'SALES',
    },
  });

  // Create products
  const products = [
    {
      name: 'MacBook Pro 16"',
      sku: 'MBPR-16-M2',
      description: 'Apple MacBook Pro 16" with M2 Pro chip',
      price: 2499.99,
      stock: 50,
      minStockLevel: 10,
      category: 'Laptops',
    },
    {
      name: 'iPhone 15 Pro',
      sku: 'IPH-15PRO-256',
      description: 'iPhone 15 Pro 256GB Titanium',
      price: 1199.99,
      stock: 100,
      minStockLevel: 20,
      category: 'Smartphones',
    },
    {
      name: 'iPad Air',
      sku: 'IPAD-AIR-5',
      description: 'iPad Air 5th Generation 256GB',
      price: 749.99,
      stock: 75,
      minStockLevel: 15,
      category: 'Tablets',
    },
    {
      name: 'AirPods Pro',
      sku: 'APP-2-WHT',
      description: 'AirPods Pro 2nd Generation',
      price: 249.99,
      stock: 200,
      minStockLevel: 30,
      category: 'Audio',
    },
    {
      name: 'Apple Watch Ultra',
      sku: 'AWU-2-TIT',
      description: 'Apple Watch Ultra 2nd Generation Titanium',
      price: 799.99,
      stock: 40,
      minStockLevel: 8,
      category: 'Wearables',
    },
    {
      name: 'Magic Keyboard',
      sku: 'AMK-3-BLK',
      description: 'Apple Magic Keyboard with Touch ID',
      price: 149.99,
      stock: 120,
      minStockLevel: 25,
      category: 'Accessories',
    },
  ];

  // Create store locations in Jakarta
  const stores = [
    {
      id: 'store-gandaria',
      name: 'Gandaria City',
      address: 'Gandaria City Mall, Jl. Sultan Iskandar Muda',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      status: 'ACTIVE' as StoreStatus,
      type: 'RETAIL' as StoreType,
      latitude: -6.244,
      longitude: 106.783,
      ownerName: 'John Doe',
      ownerPhone: '+6281234567890',
      ownerEmail: 'john.doe@example.com',
    },
    {
      id: 'store-pi',
      name: 'Pacific Place',
      address: 'Pacific Place Mall, Jl. Jend. Sudirman',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      status: 'ACTIVE' as StoreStatus,
      type: 'RETAIL' as StoreType,
      latitude: -6.224,
      longitude: 106.809,
      ownerName: 'Jane Smith',
      ownerPhone: '+6281234567891',
      ownerEmail: 'jane.smith@example.com',
    },
    {
      id: 'store-cp',
      name: 'Central Park',
      address: 'Central Park Mall, Jl. Letjen S. Parman',
      city: 'Jakarta Barat',
      province: 'DKI Jakarta',
      status: 'ACTIVE' as StoreStatus,
      type: 'RETAIL' as StoreType,
      latitude: -6.177,
      longitude: 106.790,
      ownerName: 'Bob Wilson',
      ownerPhone: '+6281234567892',
      ownerEmail: 'bob.wilson@example.com',
    },
  ];

  // Insert products
  const createdProducts = [];
  for (const product of products) {
    const createdProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        ...product,
        createdBy: {
          connect: { id: admin.id }
        }
      },
    });
    createdProducts.push(createdProduct);
  }

  // Insert stores
  const createdStores = [];
  for (const store of stores) {
    const createdStore = await prisma.store.upsert({
      where: { id: store.id },
      update: {},
      create: store,
    });
    createdStores.push(createdStore);
  }

  // Create store staff assignments
  for (const store of createdStores) {
    await prisma.storeStaff.upsert({
      where: {
        storeId_userId: {
          storeId: store.id,
          userId: sales.id,
        },
      },
      update: {},
      create: {
        storeId: store.id,
        userId: sales.id,
      },
    });
  }

  // Create store stocks
  for (const store of createdStores) {
    for (const product of createdProducts) {
      // Randomly assign stock quantities
      const quantity = Math.floor(Math.random() * 50) + 1;
      await prisma.storeStock.upsert({
        where: {
          storeId_productId: {
            storeId: store.id,
            productId: product.id,
          },
        },
        update: { quantity },
        create: {
          storeId: store.id,
          productId: product.id,
          quantity,
        },
      });
    }
  }

  // Create sample sales
  const pastDates = Array.from({ length: 10 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  });

  for (const store of createdStores) {
    for (const date of pastDates) {
      // Create 1-3 sales per day per store
      const numSales = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numSales; i++) {
        // Select 1-3 random products for this sale
        const saleProducts = createdProducts
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 3) + 1);

        const saleItems = saleProducts.map(product => ({
          productId: product.id,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: product.price,
        }));

        const total = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        await prisma.sale.create({
          data: {
            storeId: store.id,
            userId: sales.id,
            total,
            status: 'COMPLETED',
            createdAt: date,
            items: {
              create: saleItems,
            },
          },
        });
      }
    }
  }

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
