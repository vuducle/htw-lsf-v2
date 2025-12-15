# Backend Setup Guide

## 🚀 Quick Start (Automatic Setup)

For new developers cloning the project:

### 1. Install Dependencies

```bash
cd backend
yarn install  # Automatically generates Prisma client
```

### 2. Configure Environment Variables

Copy the example file and edit with your credentials:

```bash
cp .env.example .env
```

Required variables in `.env`:

```env
# Database (Use either DATABASE_URL or individual credentials)
DATABASE_URL="postgresql://postgres:password@localhost:5432/dzemals_super_app"

# OR Individual credentials
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=dzemals_super_app

# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3001
```

### 3. Run Database Setup

```bash
yarn db:setup
```

This command:
- ✅ Creates database (if not exists)
- ✅ Applies all migrations
- ✅ Seeds demo data (teachers, students, courses with schedules)

### 4. Start Development Server

```bash
yarn start:dev
```

## 📊 Demo Credentials

Use these accounts to test the application:

### Teacher Account

- **Email:** julia.nguyen@example.com
- **Password:** Teacher123!

### Student Account

- **Email:** triesnha.ameilya@example.com
- **Password:** Student123!

## 🔧 Available Commands

### Database Management

```bash
# Setup database from scratch
yarn db:setup

# Regenerate Prisma Client
yarn prisma generate

# Seed demo data only
yarn prisma db seed
```

### Development

```bash
# Start with hot-reload
yarn start:dev

# Start in debug mode
yarn start:debug

# Production build
yarn build
yarn start:prod
```

### Code Quality

```bash
# Run ESLint
yarn lint

# Format with Prettier
yarn format

# Run tests
yarn test
yarn test:watch
yarn test:cov
yarn test:e2e
```

## 🗄️ Database Schema

PostgreSQL with Prisma ORM:

- **User**: All users (teachers & students)
- **Teacher**: Teacher profiles
- **Student**: Student profiles  
- **Course**: Courses with schedules (startDate, endDate, room)
- **Schedule**: Weekly timing (dayOfWeek, startTime, endTime)
- **Enrollment**: Student enrollments
- **Grade**: Student grades per course

## 📝 API Documentation

Swagger UI available after starting the server:

```
http://localhost:3000/api/docs
```

Test all endpoints with the demo credentials above.

## 🛠️ Features

- ✅ JWT Authentication (Access + Refresh Tokens)
- ✅ Redis Caching (login & session management)
- ✅ CORS Enabled
- ✅ Rate Limiting (100 req/min global, custom per endpoint)
- ✅ User Avatar Upload
- ✅ Swagger Documentation
- ✅ Automatic Database Setup
- ✅ Course Scheduling (dates, times, rooms)
- ✅ Type-Safe Caching with Generics

## ⚙️ Tech Stack

- **NestJS** 11 - Backend framework
- **Prisma** 7.1 - ORM with PostgreSQL adapter
- **Redis** 5.10 - Caching & session management
- **PostgreSQL** 15+ - Primary database
- **JWT** - Authentication tokens
- **Swagger/OpenAPI** - API documentation
- **TypeScript** - Type safety
- **bcrypt** - Password hashing

## 🐛 Troubleshooting

### Database Connection Failed

Make sure PostgreSQL is running and credentials in `.env` are correct:

```bash
# Check if PostgreSQL is running
pg_isready

# Or start PostgreSQL (macOS)
brew services start postgresql@15
```

### Redis Connection Issues

Redis is optional but recommended for caching. Install and start:

```bash
# Install Redis (macOS)
brew install redis

# Start Redis
brew services start redis
```

### Prisma Client Issues

Regenerate the Prisma client if you see type errors:

```bash
yarn prisma generate
```
