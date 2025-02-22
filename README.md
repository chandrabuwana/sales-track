# Sales Market Dashboard

A Next.js-based dashboard for managing sales and inventory across multiple stores.

## Features

- 🔐 **User Authentication**: Secure login for admin and sales users
- 🏪 **Store Management**: Track multiple store locations and their inventory
- 📦 **Product Management**: Manage products, prices, and stock levels
- 📊 **Sales Tracking**: Record and monitor sales transactions
- 📈 **Inventory Management**: Track stock levels across different stores
- 🔄 **Real-time Updates**: Live inventory and sales updates
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Testing**: Playwright for E2E tests
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/sales-market-dashboard.git
   cd sales-market-dashboard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set Up Environment**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Update environment variables in .env
   # - Database connection
   # - NextAuth secret
   # - Other configuration
   ```

4. **Set Up Database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed test data
   npx ts-node scripts/seed-test-data.ts
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Run Tests**
   ```bash
   # Run Playwright tests
   npm run test
   ```

## Project Structure

```
sales-market-dashboard/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── styles/          # Global styles
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── public/              # Static assets
├── scripts/            # Utility scripts
└── tests/             # Test files
```

## Development Workflow

1. Create feature branch from main
2. Make changes and test locally
3. Run tests: `npm run test`
4. Create pull request
5. Review and merge

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/stores/*` - Store operations
- `/api/products/*` - Product management
- `/api/sales/*` - Sales transactions

## Database Management

See [DATABASE.md](DATABASE.md) for detailed database setup and management instructions.

## Test Users

For development, you can use these test accounts:

**Admin User**:
- Email: admin@example.com
- Password: password123

**Sales User**:
- Email: sales@example.com
- Password: password123

## Deployment

1. **Prepare for Production**
   ```bash
   # Build the application
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

3. **Set Production Environment**
   - Set up production database
   - Configure environment variables
   - Run production migrations

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@example.com or create an issue in the repository.
