# 🚀 Terra Industries - Backend API

<div align="center">

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

**Enterprise-grade REST API powering Terra Industries' defense technology platform**

[🌐 Live API](https://terraserver-production.up.railway.app) • [📚 API Docs](https://terraserver-production.up.railway.app/api-docs) • [🏥 Health Check](https://terraserver-production.up.railway.app/api/v1/health/liveness)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Performance](#-performance)
- [Security](#-security)

---

## 🎯 Overview

Terra Industries Backend is a production-ready NestJS API serving the defense technology showcase platform. Built with enterprise patterns, it provides secure authentication, comprehensive search, analytics tracking, and content management capabilities.

**Live Deployment:** Railway  
**Database:** PostgreSQL (Railway)  
**Cache Layer:** Redis (Optional)  
**API Version:** v1  
**Base URL:** `https://terraserver-production.up.railway.app/api/v1`

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, User)
- Secure password hashing with bcrypt
- Token blacklisting for logout
- Session management

### 📰 Content Management
- **News Stories:** Full CRUD with rich content, featured images
- **Product Specifications:** Technical specs, performance metrics, media galleries
- **Media Library:** S3-compatible file upload and management
- **Activity Logging:** Comprehensive audit trail

### 🔍 Search & Discovery
- **Global Search:** Cross-entity search (products, news, inquiries)
- **Full-text Search:** PostgreSQL FTS with ranking
- **Faceted Filtering:** Category, status, date range filters
- **Search Analytics:** Query tracking and performance metrics

### 📊 Analytics & Tracking
- **Event Tracking:** Page views, interactions, conversions
- **Search Analytics:** Popular queries, zero-result tracking
- **User Behavior:** Session tracking, engagement metrics
- **Performance Metrics:** API response times, error rates

### 💼 Business Operations
- **Inquiry Management:** Lead capture, scoring, workflow
- **RFQ Processing:** Quote request handling and tracking
- **Email Notifications:** Transactional emails via Resend
- **Admin Dashboard:** Comprehensive metrics and insights

### 🏥 Monitoring & Health
- **Health Checks:** Liveness, readiness, database status
- **Error Tracking:** Sentry integration for production
- **Performance Monitoring:** Request timing, slow query detection
- **Rate Limiting:** DDoS protection, API abuse prevention

---

## 🛠️ Tech Stack

### Core Framework
- **NestJS 10.3** - Progressive Node.js framework
- **TypeScript 5.3** - Type-safe development
- **Express** - HTTP server

### Database & ORM
- **PostgreSQL** - Primary database
- **Prisma 5.7** - Next-generation ORM
- **Redis** - Caching and session storage

### Authentication & Security
- **Passport JWT** - JWT strategy
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin configuration
- **Rate Limiting** - Throttler guard

### File Storage
- **AWS S3** - Media storage
- **Sharp** - Image processing
- **Multer** - File upload handling

### Validation & Documentation
- **Class Validator** - DTO validation
- **Class Transformer** - Data transformation
- **Swagger/OpenAPI** - API documentation
- **Zod** - Runtime type validation

### Monitoring & Logging
- **Winston** - Structured logging
- **Sentry** - Error tracking
- **Terminus** - Health checks

---

## 🏗️ Architecture

### Project Structure

```
server/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/            # Authentication & JWT
│   │   ├── users/           # User management
│   │   ├── news/            # News stories CRUD
│   │   ├── products/        # Product specifications
│   │   ├── inquiries/       # Lead management
│   │   ├── rfq/             # Quote requests
│   │   ├── search/          # Global search
│   │   ├── analytics/       # Event tracking
│   │   ├── media/           # File uploads
│   │   └── health/          # Health checks
│   ├── common/              # Shared utilities
│   │   ├── guards/          # Auth guards
│   │   ├── decorators/      # Custom decorators
│   │   ├── filters/         # Exception filters
│   │   ├── interceptors/    # Response interceptors
│   │   └── pipes/           # Validation pipes
│   ├── config/              # Configuration
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── s3.config.ts
│   └── main.ts              # Application entry
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Migration files
│   └── seed.ts              # Database seeding
├── test/                    # E2E tests
├── Dockerfile.railway       # Production build
├── railway.json             # Railway config
└── package.json
```

### Module Architecture

Each feature module follows the NestJS module pattern:
- **Controller** - HTTP endpoint handlers
- **Service** - Business logic
- **DTO** - Data transfer objects
- **Entity** - Prisma models
- **Guards** - Route protection
- **Interceptors** - Response transformation

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **PostgreSQL** 14.x or higher
- **Redis** (optional, for caching)
- **pnpm** (recommended) or npm

### Local Installation

1. **Clone the repository**
```bash
git clone https://github.com/Atlas00000/terra_server.git
cd terra_server
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start local database (optional)**
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
pnpm prisma:migrate
```

6. **Seed the database**
```bash
pnpm prisma:seed
```

7. **Start development server**
```bash
pnpm start:dev
```

The API will be available at `http://localhost:4000`

### Quick Start with Docker

```bash
# Build and run
docker-compose up --build

# Access API
curl http://localhost:4000/api/v1/health/liveness
```

---

## 📚 API Documentation

### Interactive API Docs

Visit the Swagger UI at:
- **Local:** http://localhost:4000/api-docs
- **Production:** https://terraserver-production.up.railway.app/api-docs

### Authentication

All protected endpoints require a JWT token:

```bash
# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@terra.com","password":"Admin123!"}'

# Use token in subsequent requests
curl http://localhost:4000/api/v1/news \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Core Endpoints

#### Authentication
```
POST   /api/v1/auth/register         # Register new user
POST   /api/v1/auth/login            # Login and get JWT
POST   /api/v1/auth/refresh          # Refresh access token
POST   /api/v1/auth/logout           # Logout (blacklist token)
GET    /api/v1/auth/me               # Get current user
```

#### News Stories
```
GET    /api/v1/news                  # List all news (paginated)
GET    /api/v1/news/:id              # Get single news story
POST   /api/v1/news                  # Create news (Admin only)
PATCH  /api/v1/news/:id              # Update news (Admin only)
DELETE /api/v1/news/:id              # Delete news (Admin only)
GET    /api/v1/news/slug/:slug       # Get by slug (public)
```

#### Product Specifications
```
GET    /api/v1/products              # List all products
GET    /api/v1/products/:id          # Get product details
POST   /api/v1/products              # Create product (Admin)
PATCH  /api/v1/products/:id          # Update product (Admin)
DELETE /api/v1/products/:id          # Delete product (Admin)
```

#### Global Search
```
GET    /api/v1/search/global?q=query # Search everything
GET    /api/v1/search/products?q=    # Search products only
GET    /api/v1/search/news?q=        # Search news only
```

#### Inquiries & RFQs
```
POST   /api/v1/inquiries             # Submit inquiry
GET    /api/v1/inquiries             # List inquiries (Admin)
POST   /api/v1/rfq                   # Submit RFQ
GET    /api/v1/rfq                   # List RFQs (Admin)
```

#### Analytics
```
POST   /api/v1/analytics/track       # Track event
GET    /api/v1/analytics/metrics     # Get metrics (Admin)
GET    /api/v1/analytics/search      # Search analytics
```

#### Media Management
```
POST   /api/v1/media/upload          # Upload file (Admin)
GET    /api/v1/media                 # List media files
DELETE /api/v1/media/:id             # Delete file (Admin)
```

#### Health & Monitoring
```
GET    /api/v1/health/liveness       # Liveness check
GET    /api/v1/health/readiness      # Readiness check
GET    /api/v1/health/database       # Database status
```

---

## 🗄️ Database Schema

### Core Models

#### User
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  firstName     String
  lastName      String
  role          Role     @default(USER)
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  newsStories   NewsStory[]
  products      ProductSpecification[]
  activityLogs  ActivityLog[]
}
```

#### NewsStory
```prisma
model NewsStory {
  id              String    @id @default(uuid())
  title           String
  slug            String    @unique
  content         String
  excerpt         String?
  authorId        String
  status          String    @default("draft")
  publishedAt     DateTime?
  featuredImageId String?
  category        String?
  tags            String[]
  viewCount       Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  author          User      @relation(...)
  featuredImage   MediaFile? @relation(...)
}
```

#### ProductSpecification
```prisma
model ProductSpecification {
  id                 String   @id @default(uuid())
  productName        String
  category           String
  specifications     Json
  performanceMetrics Json
  technicalDetails   Json
  mediaGalleryIds    String[]
  createdById        String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  createdBy          User     @relation(...)
}
```

### Migrations

```bash
# Create new migration
pnpm prisma migrate dev --name migration_name

# Apply migrations (production)
pnpm prisma migrate deploy

# Reset database (development only)
pnpm prisma migrate reset
```

---

## 🔧 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/database"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
NODE_ENV="development"
PORT=4000
API_PREFIX="api/v1"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="noreply@terra.com"

# AWS S3 (Media Storage)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET="terra-media"

# Redis (Optional)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

### Railway-Specific

When deploying to Railway, these are automatically provided:
- `DATABASE_URL` - Railway PostgreSQL connection string
- `PORT` - Assigned by Railway
- `RAILWAY_ENVIRONMENT` - production/staging

---

## 🚢 Deployment

### Railway Deployment

1. **Connect Repository**
```bash
# Link Railway project
railway link

# Set environment variables
railway variables set JWT_SECRET=your-secret
railway variables set CORS_ORIGIN=https://your-frontend.vercel.app
```

2. **Configure Database**
```bash
# Add PostgreSQL service
railway add postgresql

# Get connection string
railway variables
```

3. **Deploy**
```bash
# Automatic deployment on push
git push origin main

# Or manual deployment
railway up
```

4. **Run Migrations**
```bash
# SSH into Railway
railway run bash

# Run migrations
npm run prisma:migrate:deploy

# Seed database
npm run prisma:seed
```

### Docker Deployment

```bash
# Build image
docker build -f Dockerfile.railway -t terra-backend .

# Run container
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="secret" \
  terra-backend
```

### Health Check Configuration

Railway uses the health check endpoint for deployment verification:
```json
{
  "healthcheckPath": "/api/v1/health/liveness",
  "healthcheckTimeout": 100
}
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Specific test file
pnpm test:e2e auth.e2e-spec.ts
```

### API Testing with cURL

```bash
# Health check
curl https://terraserver-production.up.railway.app/api/v1/health/liveness

# Search
curl "https://terraserver-production.up.railway.app/api/v1/search/global?q=artemis"

# Login
curl -X POST https://terraserver-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@terra.com","password":"Admin123!"}'
```

---

## ⚡ Performance

### Optimization Features

- **Database Indexing:** Strategic indexes on frequently queried columns
- **Query Optimization:** Efficient Prisma queries with `select` and `include`
- **Caching:** Redis caching for expensive operations
- **Connection Pooling:** Prisma connection pool (10 connections)
- **Compression:** gzip compression for responses
- **Rate Limiting:** 100 requests/15min per IP

### Performance Metrics

- **Average Response Time:** < 100ms
- **P95 Response Time:** < 250ms
- **Database Query Time:** < 50ms average
- **Uptime:** 99.9%

### Monitoring

```bash
# View logs
railway logs

# Monitor performance
# Access Sentry dashboard for error tracking
# Use built-in analytics endpoints for metrics
```

---

## 🔒 Security

### Security Features

1. **Authentication & Authorization**
   - JWT with RS256 signing
   - Refresh token rotation
   - Password strength requirements
   - Role-based access control

2. **Data Protection**
   - Password hashing with bcrypt (12 rounds)
   - SQL injection prevention (Prisma)
   - XSS protection (Helmet)
   - CSRF protection

3. **API Security**
   - Rate limiting per endpoint
   - CORS configuration
   - Security headers (Helmet)
   - Request validation (class-validator)

4. **Infrastructure**
   - HTTPS only (production)
   - Environment variable encryption
   - Database connection encryption
   - Secure session management

### Security Best Practices

```typescript
// Always use DTOs for validation
@Post()
async create(@Body() createDto: CreateNewsDto) {
  return this.service.create(createDto);
}

// Protect sensitive routes
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin/analytics')
async getAnalytics() {
  return this.analyticsService.getMetrics();
}

// Sanitize inputs
@IsString()
@IsNotEmpty()
@MaxLength(255)
title: string;
```

---

## 📈 Roadmap

### Upcoming Features
- [ ] WebSocket support for real-time updates
- [ ] GraphQL API endpoint
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] Export functionality (PDF, Excel)
- [ ] Automated backup system
- [ ] Enhanced search with Elasticsearch
- [ ] API versioning (v2)

---

## 🤝 Contributing

This is a private repository for Terra Industries. For internal contributions:

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

---

## 📝 License

© 2025 Terra Industries. All rights reserved.

---

## 📞 Support

**Technical Issues:** Contact the development team  
**API Questions:** Refer to [API Documentation](https://terraserver-production.up.railway.app/api-docs)  
**Security Concerns:** Report immediately to security team

---

<div align="center">

**Built with ❤️ for Terra Industries**

[🌐 Production API](https://terraserver-production.up.railway.app) • [📚 Documentation](https://terraserver-production.up.railway.app/api-docs)

</div>
