# Dzemals - Modern Learning Platform

A comprehensive learning management system built with modern web technologies. Features course management, student tracking, real-time updates, and a beautiful UI with shadcn/ui components.

## Project Structure

This is a monorepo using Yarn Workspaces with two main packages:

```
dzemals-super-app/
├── frontend/        # Next.js 16 + React 19 + shadcn/ui
├── backend/         # NestJS + Prisma + PostgreSQL
└── package.json     # Root workspace configuration
```

## Tech Stack

### Frontend

- **Next.js 16** - React framework with Turbopack
- **React 19** - Latest React features
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Beautiful icons

### Backend

- **NestJS** - Progressive Node.js framework
- **Prisma** - Modern ORM
- **PostgreSQL** - Database
- **Redis** - Caching and real-time features
- **JWT** - Authentication

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **Yarn** package manager
- **PostgreSQL** 14+ (for database)
- **Redis** (for real-time features, optional)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/vuducle/dzemals-super-app.git
cd dzemals-super-app
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
yarn install
```

### 3. Environment Variables

#### Backend Setup

Create `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dzemals"

# JWT
JWT_SECRET="your-secret-key-here-change-in-production"
JWT_EXPIRATION="24h"

# Server
PORT=3001
NODE_ENV=development

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

#### Frontend Setup

Create `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup (Backend)

First, ensure PostgreSQL is running. Then set up the database:

```bash
cd backend

# Create the database and run migrations
yarn prisma migrate dev

# (Optional) Seed the database with sample data
yarn prisma db seed
```

### 5. Run the Development Servers

#### Option A: Run Everything at Once

```bash
# From the root directory
yarn dev
```

This will start:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

#### Option B: Run Separately

```bash
# Terminal 1 - Frontend
yarn frontend:dev

# Terminal 2 - Backend
yarn backend:dev
```

#### Option C: Run Individual Services

```bash
# Frontend only
cd frontend
yarn dev

# Backend only
cd backend
yarn start:dev
```

## Available Scripts

### Root Commands

```bash
# Development - runs all services
yarn dev

# Build all packages
yarn build

# Run linting
yarn lint

# Frontend specific
yarn frontend:dev      # Start frontend dev server
yarn frontend:build    # Build frontend for production

# Backend specific
yarn backend:dev       # Start backend dev server
yarn backend:build     # Build backend for production
```

## Project Features

### Frontend

- ✅ Modern, responsive UI with shadcn/ui
- ✅ Server-side rendering with Next.js
- ✅ Type-safe API integration
- ✅ Dark mode support
- ✅ Mobile-friendly design

### Backend

- ✅ RESTful API with Swagger documentation
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Course management
- ✅ Student enrollment and tracking
- ✅ Real-time features with WebSockets (not inplemented)
- ✅ Database migrations with Prisma

## API Documentation

Once the backend is running, access the Swagger documentation at:

```
http://localhost:3001/api/docs
```

## Module Structure (Backend)

- **User Module** - User management and authentication
- **Teacher Module** - Teacher-specific features
- **Student Module** - Student-specific features
- **Enrollment Module** - Course enrollment management

## Development Workflow

### Adding Dependencies

```bash
# Add to a specific workspace
yarn workspace frontend add package-name
yarn workspace backend add package-name

# Add as dev dependency
yarn workspace frontend add -D package-name
```

### Creating New Components (Frontend)

Use shadcn/ui to add components:

```bash
cd frontend
npx shadcn@latest add [component-name]
```

### Database Migrations (Backend)

```bash
cd backend

# Create a new migration
yarn prisma migrate dev --name migration_name

# Push schema to database
yarn prisma migrate deploy

# Open Prisma Studio
yarn prisma studio
```

## Authentication

The application uses JWT-based authentication:

1. User logs in with email and password
2. Backend returns JWT token
3. Frontend stores token in localStorage/cookies
4. All subsequent requests include the token in Authorization header

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request

## Troubleshooting

### Frontend Issues

**Port 3000 already in use:**

```bash
# Kill the process using port 3000
lsof -i :3000
kill -9 <PID>
```

**Dependencies not installing:**

```bash
rm -rf node_modules yarn.lock
yarn install
```

### Backend Issues

**Database connection failed:**

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

**Port 3001 already in use:**

```bash
lsof -i :3001
kill -9 <PID>
```

**Migrations failed:**

```bash
# Reset database (development only!)
cd backend
yarn prisma migrate reset
```

## Performance Monitoring

### Frontend

- Use Next.js built-in analytics
- Check Core Web Vitals in production

### Backend

- Monitor request logs
- Use Redis for caching
- Database query optimization with Prisma

## Security Considerations

- 🔒 JWT tokens with expiration
- 🔒 Password hashing with bcrypt
- 🔒 CORS configuration
- 🔒 Environment variables for secrets
- 🔒 SQL injection prevention with Prisma

## Deployment

### Frontend (Vercel - Recommended)

```bash
# Push to GitHub and connect to Vercel
# Set environment variables in Vercel dashboard
# Auto-deploys on git push
```

### Backend (Railway, Render, or Docker)

```bash
# Build image
docker build -t dzemals-backend .

# Run container
docker run -p 3001:3001 dzemals-backend
```

## License

MIT License - feel free to use this project for personal and commercial purposes.

## Support

For issues and questions:

- 📧 Email: support@dzemals.com
- 🐛 GitHub Issues: [Create an issue](https://github.com/vuducle/dzemals-super-app/issues)
- 💬 Discord: [Join our community](https://discord.gg/dzemals)

## Roadmap

- [ ] Mobile app with React Native
- [ ] Advanced analytics dashboard
- [ ] Video streaming integration
- [ ] Live classroom features
- [ ] AI-powered tutoring
- [ ] Payment integration

---

**Happy Learning! 🚀**
