import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.storeStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // Create test stores
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        id: 'store-gandaria',
        name: 'Gandaria Store',
        address: 'Jl. Gandaria No. 1',
        status: 'ACTIVE',
      },
    }),
    prisma.store.create({
      data: {
        id: 'store-kemang',
        name: 'Kemang Store',
        address: 'Jl. Kemang Raya No. 10',
        status: 'ACTIVE',
      },
    }),
  ]);

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sales@example.com',
        name: 'Sales User',
        password: hashedPassword,
        role: 'SALES',
      },
    }),
  ]);

  // Create test products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Product A',
        description: 'Test Product A',
        price: 100,
        stock: 100,
        sku: 'SKU-A',
        userId: users[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Product B',
        description: 'Test Product B',
        price: 200,
        stock: 50,
        sku: 'SKU-B',
        userId: users[0].id,
      },
    }),
  ]);

  // Create test sales
  await Promise.all([
    prisma.sale.create({
      data: {
        storeId: stores[0].id,
        userId: users[1].id,
        total: 300,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2,
              price: 100,
            },
            {
              productId: products[1].id,
              quantity: 1,
              price: 100,
            },
          ],
        },
      },
    }),
    prisma.sale.create({
      data: {
        storeId: stores[1].id,
        userId: users[1].id,
        total: 400,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: 100,
            },
            {
              productId: products[1].id,
              quantity: 2,
              price: 150,
            },
          ],
        },
      },
    }),
  ]);

  // Create store stocks
  await Promise.all([
    prisma.storeStock.create({
      data: {
        storeId: stores[0].id,
        productId: products[0].id,
        quantity: 20,
      },
    }),
    prisma.storeStock.create({
      data: {
        storeId: stores[0].id,
        productId: products[1].id,
        quantity: 10,
      },
    }),
    prisma.storeStock.create({
      data: {
        storeId: stores[1].id,
        productId: products[0].id,
        quantity: 15,
      },
    }),
    prisma.storeStock.create({
      data: {
        storeId: stores[1].id,
        productId: products[1].id,
        quantity: 25,
      },
    }),
  ]);

  console.log('Test data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
