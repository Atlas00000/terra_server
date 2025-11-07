# Changelog

All notable changes to the Terra Industries Backend API will be documented in this file.

## [1.0.0] - 2025-11-07

### 🎉 Initial Production Release

#### Added
- Complete NestJS backend with 60+ API endpoints
- JWT authentication with refresh tokens
- PostgreSQL database with Prisma ORM
- Global search across products, news, inquiries
- News story management system
- Product specification CRUD
- Inquiry and RFQ handling
- Analytics and event tracking
- Media upload and management
- Admin dashboard metrics
- Health check endpoints
- Swagger/OpenAPI documentation
- Rate limiting and security middleware
- Comprehensive error handling
- Activity logging system

#### Infrastructure
- Railway deployment configuration
- Multi-stage Docker build
- PostgreSQL database (Railway)
- Environment variable management
- Health check monitoring
- Production-ready error tracking

#### Security
- Bcrypt password hashing
- JWT token management
- Role-based access control
- CORS configuration
- Helmet security headers
- Request validation

---

## [0.2.0] - 2025-11-06

### Repository Separation & Deployment

#### Changed
- Separated from monorepo to standalone repository
- Updated package.json for independent deployment
- Configured Railway-specific Dockerfile
- Added railway.json deployment config

#### Fixed
- Database schema alignment (PascalCase → snake_case mapping)
- Prisma migration tracking
- Connection pooling configuration
- Health check endpoint reliability

#### Infrastructure
- Connected Railway PostgreSQL
- Configured environment variables
- Set up database migrations
- Seeded production data

---

## [0.1.0] - 2025-11-04

### Initial Development

#### Added
- Core NestJS architecture
- Authentication module
- User management
- News story features
- Product specifications
- Search functionality
- Analytics tracking
- Database schema design
- API documentation

---

## Deployment Notes

### Production URL
`https://terraserver-production.up.railway.app`

### API Documentation
`https://terraserver-production.up.railway.app/api-docs`

### Database
- **Provider:** Railway PostgreSQL
- **Version:** PostgreSQL 14
- **Migration Status:** All migrations applied
- **Seed Data:** Complete

---

## Upgrade Guide

### From Monorepo to Standalone

If migrating from the old monorepo structure:

1. Update environment variables
2. Run database migrations: `npm run prisma:migrate:deploy`
3. Seed database: `npm run prisma:seed`
4. Verify health check: `/api/v1/health/liveness`

---

**Maintained by:** Terra Industries Development Team  
**Last Updated:** November 7, 2025

