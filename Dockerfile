# Multi-stage build for NestJS backend
# Updated: 2025-11-06

# Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Development stage (optional, for local docker-compose)
FROM base AS development
# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run prisma:generate || echo "Prisma not configured yet"
EXPOSE 4000
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build
# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
# Install all dependencies using npm (no workspace issues)
RUN npm ci || npm install
COPY . .
# Verify node_modules exists and build
RUN ls -la node_modules/.bin/ && \
    npm run prisma:generate && \
    npm run build

# Production stage
FROM node:20-alpine AS production
# Install OpenSSL for Prisma
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json* ./
COPY --from=build /app/prisma ./prisma

# Install only production dependencies using npm
RUN npm ci --only=production || npm install --only=production

# Copy pre-generated Prisma Client from build stage
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000
CMD ["node", "dist/main.js"]

