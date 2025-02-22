# Database Setup Guide

This guide explains how to set up and manage the database for the Sales Market Dashboard application.

## Prerequisites

- PostgreSQL 14+ installed
- Node.js 18+ installed
- npm or yarn package manager

## Local Development Setup

1. **Install PostgreSQL**
   ```bash
   # macOS (using Homebrew)
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql-14
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database
   CREATE DATABASE sales_market;
   CREATE USER sales_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE sales_market TO sales_user;
   ```

3. **Configure Environment**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Update DATABASE_URL in .env with your credentials
   DATABASE_URL="postgresql://sales_user:your_password@localhost:5432/sales_market?schema=public"
   ```

4. **Initialize Database**
   ```bash
   # Install dependencies
   npm install

   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed test data
   npx ts-node scripts/seed-test-data.ts
   ```

## Database Schema

Our application uses Prisma as the ORM with the following main models:

- **User**: Stores user accounts (Admin/Sales)
- **Store**: Manages store information
- **Product**: Tracks product inventory
- **Sale**: Records sales transactions
- **StoreStock**: Tracks store-specific inventory

View the complete schema in `prisma/schema.prisma`.

## Common Operations

### Reset Database
```bash
# Drop and recreate database
npx prisma migrate reset

# Run all migrations
npx prisma migrate dev
```

### View Data
```bash
# Launch Prisma Studio
npx prisma studio
```

### Update Schema
```bash
# After modifying schema.prisma
npx prisma generate
npx prisma migrate dev --name describe_your_changes
```

## Production Setup

1. **Create Production Database**
   - Use a managed PostgreSQL service (e.g., AWS RDS, DigitalOcean)
   - Set up proper firewall rules
   - Use strong passwords

2. **Configure Production Environment**
   ```bash
   # Set production environment variables
   DATABASE_URL="postgresql://user:password@your-production-host:5432/sales_market?schema=public"
   ```

3. **Run Migrations**
   ```bash
   # Deploy migrations to production
   npx prisma migrate deploy
   ```

## Backup and Restore

### Create Backup
```bash
pg_dump -U sales_user -d sales_market -F c -f backup.dump
```

### Restore Backup
```bash
pg_restore -U sales_user -d sales_market backup.dump
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if PostgreSQL is running
   - Verify credentials in .env
   - Ensure database exists

2. **Migration Failed**
   - Check migration files in prisma/migrations
   - Run `npx prisma migrate reset` to start fresh
   - Check for conflicts in schema changes

3. **Prisma Client Issues**
   - Run `npx prisma generate` after schema changes
   - Clear node_modules/.prisma
   - Reinstall dependencies

### Getting Help

1. Check Prisma documentation: https://www.prisma.io/docs/
2. Review PostgreSQL logs:
   ```bash
   tail -f /usr/local/var/log/postgresql@14.log  # macOS
   tail -f /var/log/postgresql/postgresql-14-main.log  # Ubuntu
   ```

## Security Best Practices

1. **Access Control**
   - Use least-privilege database users
   - Regularly rotate passwords
   - Use SSL for database connections

2. **Data Protection**
   - Enable PostgreSQL encryption
   - Regular backups
   - Audit sensitive operations

3. **Environment Security**
   - Never commit .env files
   - Use strong passwords
   - Restrict database access to necessary IPs

## Maintenance

Regular maintenance tasks:

1. **Database Optimization**
   ```bash
   # Analyze query performance
   ANALYZE;

   # Vacuum database
   VACUUM ANALYZE;
   ```

2. **Monitoring**
   - Monitor disk space
   - Check connection pools
   - Review slow queries

3. **Updates**
   - Keep PostgreSQL updated
   - Update Prisma dependencies
   - Review and apply security patches
