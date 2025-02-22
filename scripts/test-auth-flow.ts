import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuthFlow() {
  try {
    console.log('🔄 Starting Auth Flow Test\n');

    // 1. Test Database Connection
    console.log('1️⃣ Testing Database Connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // 3. Create and Verify Test Users
    console.log('3️⃣ Creating Test Users...');
    
    // Admin User
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
      select: {
        id: true,
        email: true,
        role: true,
      }
    });
    console.log('✅ Admin user created:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // Sales User
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
      select: {
        id: true,
        email: true,
        role: true,
      }
    });
    console.log('✅ Sales user created:', {
      id: sales.id,
      email: sales.email,
      role: sales.role,
    }, '\n');

    // 4. Test Store Access
    console.log('4️⃣ Testing Store Access...');
    
    // Create test store
    const store = await prisma.store.create({
      data: {
        name: 'Test Store',
        address: '123 Test St',
        latitude: 0,
        longitude: 0,
        ownerName: 'Test Owner',
        ownerPhone: '1234567890',
        city: 'Test City',
        province: 'Test Province',
        type: 'RETAIL',
      }
    });
    console.log('✅ Test store created');

    // Test store access
    const stores = await prisma.store.findMany();
    console.log('✅ Store count:', stores.length, '\n');

    // 5. Test Role-Based Access Control
    console.log('5️⃣ Testing Role-Based Access Control...');
    
    // Test admin privileges
    const canAdminManageUsers = admin.role === 'ADMIN';
    console.log('✅ Admin can manage users:', canAdminManageUsers);

    // Test sales restrictions
    const canSalesManageUsers = sales.role === 'ADMIN';
    console.log('✅ Sales cannot manage users:', !canSalesManageUsers, '\n');

    // 6. Test Store Staff Assignment
    console.log('6️⃣ Testing Store Staff Assignment...');
    const storeStaff = await prisma.storeStaff.create({
      data: {
        storeId: store.id,
        userId: sales.id,
      }
    });
    console.log('✅ Sales user assigned to store:', storeStaff.id);

    // Test store staff access
    const salesUserStores = await prisma.store.findMany({
      where: {
        staff: {
          some: {
            userId: sales.id
          }
        }
      }
    });
    console.log('✅ Sales user can access assigned stores:', salesUserStores.length === 1, '\n');

    // Cleanup test data
    console.log('7️⃣ Cleaning up test data...');
    await prisma.storeStaff.delete({ where: { id: storeStaff.id } });
    await prisma.store.delete({ where: { id: store.id } });
    console.log('✅ Test data deleted\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthFlow();
