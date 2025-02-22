# Database Setup Guide

This guide explains how to set up and manage the database for the Sales Market Dashboard using Prisma ORM.

## Prerequisites

- PostgreSQL installed on your server
- Node.js and npm installed
- Basic understanding of SQL and database concepts

## Installation

1. Install Prisma CLI and dependencies:
```bash
npm install prisma --save-dev
npm install @prisma/client
```

2. Initialize Prisma in your project:
```bash
npx prisma init
```

## Database Configuration

1. Update your `.env` file with your PostgreSQL connection URL:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Replace:
- `USER`: Your database username
- `PASSWORD`: Your database password
- `HOST`: Your database host (e.g., localhost or IP address)
- `PORT`: PostgreSQL port (default: 5432)
- `DATABASE`: Your database name

## Schema

The `schema.prisma` file defines your database structure. Here's our current schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String       @id @default(cuid())
  name      String?
  email     String       @unique
  password  String
  role      Role         @default(SALES)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  stores    StoreStaff[]
}

model Store {
  id          String       @id @default(cuid())
  name        String
  address     String
  city        String
  province    String
  latitude    Float
  longitude   Float
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  staff       StoreStaff[]
  products    Product[]
  inventories Inventory[]
}

model StoreStaff {
  id        String   @id @default(cuid())
  userId    String
  storeId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@unique([userId, storeId])
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Float
  storeId     String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  store       Store       @relation(fields: [storeId], references: [id], onDelete: Cascade)
  inventories Inventory[]
}

model Inventory {
  id        String   @id @default(cuid())
  quantity  Int
  storeId   String
  productId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([storeId, productId])
}

enum Role {
  ADMIN
  SALES
}
```

## Database Migration

1. Create a new migration:
```bash
npx prisma migrate dev --name init
```

2. Apply migrations to production:
```bash
npx prisma migrate deploy
```

3. Reset database (WARNING: This will delete all data):
```bash
npx prisma migrate reset
```

## Seeding Data

1. Create a `prisma/seed.ts` file:
```typescript
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create sample store
  const store = await prisma.store.create({
    data: {
      name: 'Main Store',
      address: 'Jl. Sudirman No. 1',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      latitude: -6.2088,
      longitude: 106.8456,
    },
  })

  console.log({ admin, store })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

2. Add seed script to `package.json`:
```json
{
  "scripts": {
    "db:seed": "npx prisma db seed"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

3. Run the seed:
```bash
npm run db:seed
```

## Production Deployment

1. Build Prisma Client:
```bash
npx prisma generate
```

2. Apply migrations:
```bash
npx prisma migrate deploy
```

3. Environment variables needed in production:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

## Common Operations

### Connecting to Database
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
```

### Basic CRUD Operations
```typescript
// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword,
  },
})

// Read
const users = await prisma.user.findMany({
  include: {
    stores: true,
  },
})

// Update
const updatedUser = await prisma.user.update({
  where: { id: 'user_id' },
  data: {
    name: 'Jane Doe',
  },
})

// Delete
const deletedUser = await prisma.user.delete({
  where: { id: 'user_id' },
})
```

## Backup and Restore

### Backup Database
```bash
pg_dump -U USER -h HOST DATABASE > backup.sql
```

### Restore Database
```bash
psql -U USER -h HOST DATABASE < backup.sql
```

## Troubleshooting

1. **Migration Issues**
   - Run `npx prisma migrate reset` to reset the database
   - Check migration history with `npx prisma migrate status`

2. **Connection Issues**
   - Verify DATABASE_URL is correct
   - Check if PostgreSQL is running
   - Ensure firewall allows connections

3. **Performance Issues**
   - Use `include` selectively to avoid N+1 queries
   - Add indexes for frequently queried fields
   - Monitor query performance with Prisma Studio

## Useful Commands

```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Check database status
npx prisma migrate status

# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong passwords
   - Rotate credentials regularly

2. **Access Control**
   - Implement row-level security
   - Use connection pooling in production
   - Set appropriate user permissions

3. **Data Protection**
   - Encrypt sensitive data
   - Regularly backup database
   - Implement audit logging

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Schema Diagram](https://dbdiagram.io/)

For any questions or issues, please refer to the project maintainers or create an issue in the repository.
