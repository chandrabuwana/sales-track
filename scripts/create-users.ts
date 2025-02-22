import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: adminPassword,
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', admin);

  // Create sales user
  const salesPassword = await hash('sales123', 12);
  const sales = await prisma.user.upsert({
    where: { email: 'sales@example.com' },
    update: {
      password: salesPassword,
    },
    create: {
      email: 'sales@example.com',
      name: 'Sales User',
      password: salesPassword,
      role: 'SALES',
    },
  });

  console.log('Sales user created:', sales);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
