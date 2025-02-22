import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

test.describe('Sign In Flow', () => {
  test.beforeAll(async () => {
    // Clean up any existing test data first
    await prisma.storeStaff.deleteMany({
      where: {
        user: {
          email: {
            in: ['test.admin@example.com', 'test.sales@example.com']
          }
        }
      }
    });
    await prisma.product.deleteMany({
      where: {
        createdBy: {
          email: {
            in: ['test.admin@example.com', 'test.sales@example.com']
          }
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test.admin@example.com', 'test.sales@example.com']
        }
      }
    });

    // Create test users
    const adminPassword = await hash('admin123', 12);
    await prisma.user.upsert({
      where: { email: 'test.admin@example.com' },
      update: {
        name: 'Test Admin',
        password: adminPassword,
        role: 'ADMIN'
      },
      create: {
        email: 'test.admin@example.com',
        name: 'Test Admin',
        password: adminPassword,
        role: 'ADMIN'
      }
    });

    const salesPassword = await hash('sales123', 12);
    await prisma.user.upsert({
      where: { email: 'test.sales@example.com' },
      update: {
        name: 'Test Sales',
        password: salesPassword,
        role: 'SALES'
      },
      create: {
        email: 'test.sales@example.com',
        name: 'Test Sales',
        password: salesPassword,
        role: 'SALES'
      }
    });
  });

  test.afterAll(async () => {
    // Clean up test data
    await prisma.storeStaff.deleteMany({
      where: {
        user: {
          email: {
            in: ['test.admin@example.com', 'test.sales@example.com']
          }
        }
      }
    });
    await prisma.product.deleteMany({
      where: {
        createdBy: {
          email: {
            in: ['test.admin@example.com', 'test.sales@example.com']
          }
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test.admin@example.com', 'test.sales@example.com']
        }
      }
    });
    await prisma.$disconnect();
  });

  test('admin should be able to sign in and access dashboard', async ({ page }) => {
    // Go to signin page
    await page.goto('/auth/signin');
    
    // Fill in admin credentials
    await page.fill('input[name="email"]', 'test.admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    
    // Click sign in and wait for navigation
    await Promise.all([
      page.waitForURL('**/dashboard'),
      page.click('button[type="submit"]')
    ]);
    
    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Verify admin-specific content is visible
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
  });

  test('sales user should be able to sign in and access dashboard', async ({ page }) => {
    // Go to signin page
    await page.goto('/auth/signin');
    
    // Fill in sales credentials
    await page.fill('input[name="email"]', 'test.sales@example.com');
    await page.fill('input[name="password"]', 'sales123');
    
    // Click sign in and wait for navigation
    await Promise.all([
      page.waitForURL('**/dashboard'),
      page.click('button[type="submit"]')
    ]);
    
    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Verify sales-specific content is visible
    await expect(page.getByText('Sales Dashboard')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Go to signin page
    await page.goto('/auth/signin');
    
    // Fill in wrong credentials
    await page.fill('input[name="email"]', 'test.admin@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Click sign in
    await page.click('button[type="submit"]');
    
    // Verify error message
    const errorMessage = await page.textContent('.text-red-500');
    expect(errorMessage).toContain('Invalid email or password');
  });

  test('should protect dashboard from unauthenticated access', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should be redirected to signin
    expect(page.url()).toContain('/auth/signin');
  });
});
