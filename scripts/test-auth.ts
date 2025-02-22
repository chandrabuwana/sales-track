import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuth() {
  try {
    // Create test users
    const adminPassword = await hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { password: adminPassword },
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
    });
    console.log('Admin user created:', admin.email);

    const salesPassword = await hash('sales123', 12);
    const sales = await prisma.user.upsert({
      where: { email: 'sales@example.com' },
      update: { password: salesPassword },
      create: {
        email: 'sales@example.com',
        name: 'Sales User',
        password: salesPassword,
        role: 'SALES',
      },
    });
    console.log('Sales user created:', sales.email);

    // Test admin credentials
    console.log('\nTesting admin credentials...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      }
    });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const isAdminPasswordValid = await compare('admin123', adminUser.password);
    console.log('Admin auth result:', {
      success: isAdminPasswordValid,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      }
    });

    // Test sales credentials
    console.log('\nTesting sales credentials...');
    const salesUser = await prisma.user.findUnique({
      where: { email: 'sales@example.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      }
    });

    if (!salesUser) {
      throw new Error('Sales user not found');
    }

    const isSalesPasswordValid = await compare('sales123', salesUser.password);
    console.log('Sales auth result:', {
      success: isSalesPasswordValid,
      user: {
        id: salesUser.id,
        email: salesUser.email,
        name: salesUser.name,
        role: salesUser.role,
      }
    });

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
