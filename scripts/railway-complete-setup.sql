-- ============================================
-- RAILWAY POSTGRESQL - COMPLETE SETUP
-- Drop, Create, Seed (with correct PascalCase tables)
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if any
DROP TABLE IF EXISTS "ActivityLog" CASCADE;
DROP TABLE IF EXISTS "MediaFile" CASCADE;
DROP TABLE IF EXISTS "EmailQueue" CASCADE;
DROP TABLE IF EXISTS "NewsStory" CASCADE;
DROP TABLE IF EXISTS "ProductSpecification" CASCADE;
DROP TABLE IF EXISTS "RfqRequest" CASCADE;
DROP TABLE IF EXISTS "Inquiry" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Also drop snake_case versions if they exist
DROP TABLE IF EXISTS "activity_logs" CASCADE;
DROP TABLE IF EXISTS "media_files" CASCADE;
DROP TABLE IF EXISTS "email_queue" CASCADE;
DROP TABLE IF EXISTS "news_stories" CASCADE;
DROP TABLE IF EXISTS "product_specifications" CASCADE;
DROP TABLE IF EXISTS "rfq_requests" CASCADE;
DROP TABLE IF EXISTS "inquiries" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- ============================================
-- CREATE TABLES (PascalCase - Prisma Format)
-- ============================================

-- User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Inquiry table
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "country" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "budget" TEXT,
    "timeline" TEXT,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- RfqRequest table
CREATE TABLE "RfqRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "productCategory" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "specifications" TEXT NOT NULL,
    "budget" TEXT,
    "timeline" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "quotedAmount" DOUBLE PRECISION,
    "quotedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RfqRequest_pkey" PRIMARY KEY ("id")
);

-- EmailQueue table
CREATE TABLE "EmailQueue" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailQueue_pkey" PRIMARY KEY ("id")
);

-- MediaFile table
CREATE TABLE "MediaFile" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

-- ActivityLog table
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- NewsStory table
CREATE TABLE "NewsStory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "featuredImage" TEXT,
    "gallery" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsStory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NewsStory_slug_key" ON "NewsStory"("slug");

-- ProductSpecification table
CREATE TABLE "ProductSpecification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specifications" JSONB NOT NULL,
    "features" TEXT[],
    "images" TEXT[],
    "documents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductSpecification_pkey" PRIMARY KEY ("id")
);

-- Prisma migrations table
CREATE TABLE "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- Add Foreign Keys
ALTER TABLE "MediaFile" ADD CONSTRAINT "MediaFile_uploadedBy_fkey" 
    FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- SEED DATA
-- ============================================

-- Admin User (Password: SecurePass123!)
INSERT INTO "User" (id, email, "fullName", password, role, "createdAt", "updatedAt")
VALUES (
  'bb2a2351-adf7-46ac-9043-d457e113fb02',
  'admin@terraindustries.com',
  'Admin User',
  '$2b$10$rKZH6YjGYxGxV7K5vXzHJeF8WZ3K9Qp7XvYN8Lm4Hj5kQ6tR8sU9W',
  'admin',
  NOW(),
  NOW()
);

-- Sample Inquiries
INSERT INTO "Inquiry" (id, "fullName", email, phone, company, country, category, message, budget, timeline, "leadScore", status, "createdAt", "updatedAt")
VALUES 
(gen_random_uuid()::text, 'John Smith', 'john@defensetech.com', '+1-555-0101', 'Defense Tech Solutions', 'United States', 'UAV', 'Interested in Artemis UAV for reconnaissance missions.', '500000-1000000', '3-6 months', 85, 'new', NOW(), NOW()),
(gen_random_uuid()::text, 'Sarah Johnson', 'sarah@globalsec.com', '+44-20-7946-0958', 'Global Security Corp', 'United Kingdom', 'Ground Vehicle', 'Require armored vehicles for peacekeeping operations.', '1000000+', '6-12 months', 92, 'new', NOW(), NOW()),
(gen_random_uuid()::text, 'Michael Chen', 'mchen@techdefense.ca', '+1-416-555-0199', 'TechDefense Canada', 'Canada', 'UAV', 'Quote request for multiple VTOL drones.', '250000-500000', '1-3 months', 78, 'new', NOW(), NOW());

-- News Stories
INSERT INTO "NewsStory" (id, title, slug, excerpt, content, category, tags, status, "isFeatured", "viewCount", "publishedAt", "createdAt", "updatedAt")
VALUES 
(gen_random_uuid()::text, 'Terra Industries Unveils Next-Gen Artemis UAV', 'artemis-uav-unveiled', 'Revolutionary reconnaissance platform', '<h2>Breaking New Ground</h2><p>Terra Industries has unveiled the Artemis UAV...</p>', 'Product Launch', ARRAY['UAV', 'Artemis', 'Technology'], 'published', true, 127, NOW(), NOW(), NOW()),
(gen_random_uuid()::text, 'Terra Industries Secures Major Defense Contract', 'defense-contract-secured', 'Company announces $50M contract', '<h2>Strategic Partnership</h2><p>Major defense contract secured...</p>', 'Company News', ARRAY['Business', 'Contract'], 'published', false, 89, NOW() - INTERVAL '2 days', NOW(), NOW()),
(gen_random_uuid()::text, 'Innovation in Modern Tactical Defense Systems', 'innovation-tactical-systems', 'Leading the way in defense technology', '<h2>Pushing Boundaries</h2><p>Latest innovations in tactical systems...</p>', 'Technology', ARRAY['Innovation', 'R&D'], 'published', false, 156, NOW() - INTERVAL '5 days', NOW(), NOW());

-- Product Specifications
INSERT INTO "ProductSpecification" (id, name, category, description, specifications, features, "createdAt", "updatedAt")
VALUES 
(gen_random_uuid()::text, 'Artemis', 'UAV', 'Advanced tactical reconnaissance UAV', '{"weight": "25kg", "range": "50km", "endurance": "8 hours"}'::jsonb, ARRAY['Real-time video', 'Autonomous modes', 'Weather resistant'], NOW(), NOW()),
(gen_random_uuid()::text, 'Archer', 'UAV', 'VTOL-capable combat drone', '{"weight": "45kg", "range": "100km", "endurance": "12 hours"}'::jsonb, ARRAY['VTOL capability', 'Precision targeting', 'Night vision'], NOW(), NOW()),
(gen_random_uuid()::text, 'Iroko', 'Ground Vehicle', 'Heavy-duty armored personnel carrier', '{"capacity": "12 personnel", "armor": "Level IV"}'::jsonb, ARRAY['Mine resistant', 'NBC protection'], NOW(), NOW()),
(gen_random_uuid()::text, 'Duma', 'Ground Vehicle', 'Light tactical vehicle', '{"capacity": "6 personnel", "speed": "120 km/h"}'::jsonb, ARRAY['All-terrain', 'Modular armor'], NOW(), NOW()),
(gen_random_uuid()::text, 'Kallon', 'Ground Vehicle', 'Heavy armored combat vehicle', '{"capacity": "8 personnel", "armor": "Level V+"}'::jsonb, ARRAY['Enhanced armor', 'Active defense'], NOW(), NOW());

-- Mark migrations as applied
INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, finished_at, applied_steps_count)
VALUES 
(substring(gen_random_uuid()::text, 1, 36), '1', '20251104170819_init', NOW(), NOW(), 1),
(substring(gen_random_uuid()::text, 1, 36), '2', '20251104182037_add_rfq_and_email_queue', NOW(), NOW(), 1),
(substring(gen_random_uuid()::text, 1, 36), '3', '20251104190354_add_media_and_activity_logs', NOW(), NOW(), 1),
(substring(gen_random_uuid()::text, 1, 36), '4', '20251104224551_add_news_and_product_specs', NOW(), NOW(), 1);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT '✅ Table Check:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;

SELECT '✅ Data Count:' as status;
SELECT 'User' as table_name, COUNT(*) as count FROM "User"
UNION ALL SELECT 'Inquiry', COUNT(*) FROM "Inquiry"
UNION ALL SELECT 'NewsStory', COUNT(*) FROM "NewsStory"
UNION ALL SELECT 'ProductSpecification', COUNT(*) FROM "ProductSpecification"
UNION ALL SELECT 'Migrations', COUNT(*) FROM "_prisma_migrations";

