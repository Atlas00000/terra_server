-- ============================================
-- COMPLETE SUPABASE DATABASE SETUP
-- Drop, Create, and Seed
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ============================================
DROP TABLE IF EXISTS "ActivityLog" CASCADE;
DROP TABLE IF EXISTS "EmailQueue" CASCADE;
DROP TABLE IF EXISTS "MediaFile" CASCADE;
DROP TABLE IF EXISTS "NewsStory" CASCADE;
DROP TABLE IF EXISTS "ProductSpecification" CASCADE;
DROP TABLE IF EXISTS "RfqRequest" CASCADE;
DROP TABLE IF EXISTS "Inquiry" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 2: CREATE ALL TABLES
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

-- Add Foreign Keys (after tables are created)
ALTER TABLE "MediaFile" ADD CONSTRAINT "MediaFile_uploadedBy_fkey" 
    FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- STEP 3: SEED DATABASE
-- ============================================

-- Insert Admin User (Password: SecurePass123!)
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

-- Insert Sample Inquiries
INSERT INTO "Inquiry" (id, "fullName", email, phone, company, country, category, message, budget, timeline, "leadScore", status, "createdAt", "updatedAt")
VALUES 
(gen_random_uuid()::text, 'John Smith', 'john@defensetech.com', '+1-555-0101', 'Defense Tech Solutions', 'United States', 'UAV', 'Interested in Artemis UAV for reconnaissance missions. Need detailed specifications and pricing.', '500000-1000000', '3-6 months', 85, 'new', NOW(), NOW()),
(gen_random_uuid()::text, 'Sarah Johnson', 'sarah@globalsec.com', '+44-20-7946-0958', 'Global Security Corp', 'United Kingdom', 'Ground Vehicle', 'Require armored vehicles for peacekeeping operations. Urgent inquiry with approved budget.', '1000000+', '6-12 months', 92, 'new', NOW(), NOW()),
(gen_random_uuid()::text, 'Michael Chen', 'mchen@techdefense.ca', '+1-416-555-0199', 'TechDefense Canada', 'Canada', 'UAV', 'Quote request for multiple VTOL drones. Budget approved and ready to proceed.', '250000-500000', '1-3 months', 78, 'new', NOW(), NOW());

-- Insert News Stories
INSERT INTO "NewsStory" (id, title, slug, excerpt, content, category, tags, status, "isFeatured", "viewCount", "publishedAt", "createdAt", "updatedAt")
VALUES 
(gen_random_uuid()::text, 
 'Terra Industries Unveils Next-Gen Artemis UAV', 
 'artemis-uav-unveiled', 
 'Revolutionary reconnaissance platform sets new standards in tactical UAV technology', 
 '<h2>Breaking New Ground in Aerial Reconnaissance</h2><p>Terra Industries has unveiled the Artemis UAV, a state-of-the-art reconnaissance platform that represents a quantum leap in tactical unmanned aerial vehicle technology. With extended range capabilities and advanced autonomous features, the Artemis is designed to meet the evolving needs of modern defense operations.</p>', 
 'Product Launch', 
 ARRAY['UAV', 'Artemis', 'Technology', 'Innovation'], 
 'published', 
 true, 
 127, 
 NOW(), 
 NOW(), 
 NOW()),
(gen_random_uuid()::text, 
 'Terra Industries Secures Major Defense Contract', 
 'defense-contract-secured', 
 'Company announces $50M contract for tactical vehicle systems', 
 '<h2>Strategic Partnership Milestone</h2><p>Terra Industries has secured a major defense contract valued at $50 million for the supply of advanced tactical vehicle systems.</p>', 
 'Company News', 
 ARRAY['Business', 'Contract', 'Growth'], 
 'published', 
 false, 
 89, 
 NOW() - INTERVAL '2 days', 
 NOW(), 
 NOW()),
(gen_random_uuid()::text, 
 'Innovation in Modern Tactical Defense Systems', 
 'innovation-tactical-systems', 
 'Terra Industries leads the way in next-generation defense technology', 
 '<h2>Pushing Boundaries in Defense Innovation</h2><p>Our latest innovations in tactical defense systems showcase Terra Industries commitment to advancing military technology.</p>', 
 'Technology', 
 ARRAY['Innovation', 'R&D', 'Future Tech'], 
 'published', 
 false, 
 156, 
 NOW() - INTERVAL '5 days', 
 NOW(), 
 NOW());

-- Insert Product Specifications
INSERT INTO "ProductSpecification" (id, name, category, description, specifications, features, "createdAt", "updatedAt")
VALUES 
(gen_random_uuid()::text, 
 'Artemis', 
 'UAV', 
 'Advanced tactical reconnaissance UAV with extended range and endurance capabilities', 
 '{"weight": "25kg", "range": "50km", "endurance": "8 hours", "max_altitude": "5000m", "payload": "3kg", "speed": "80 km/h"}'::jsonb,
 ARRAY['Real-time HD video transmission', 'Autonomous flight modes', 'Weather resistant', 'Silent operation'],
 NOW(), 
 NOW()),
(gen_random_uuid()::text, 
 'Archer', 
 'UAV', 
 'VTOL-capable combat drone with advanced targeting systems', 
 '{"weight": "45kg", "range": "100km", "endurance": "12 hours", "max_altitude": "6000m", "payload": "10kg", "speed": "120 km/h"}'::jsonb,
 ARRAY['VTOL capability', 'Precision targeting', 'Night vision', 'AI-assisted flight'],
 NOW(), 
 NOW()),
(gen_random_uuid()::text, 
 'Iroko', 
 'Ground Vehicle', 
 'Heavy-duty armored personnel carrier with advanced protection systems', 
 '{"capacity": "12 personnel", "armor": "Level IV", "engine": "450HP diesel", "weight": "18000kg", "range": "600km"}'::jsonb,
 ARRAY['Mine resistant', 'NBC protection', 'Advanced suspension', 'Communication suite'],
 NOW(), 
 NOW()),
(gen_random_uuid()::text, 
 'Duma', 
 'Ground Vehicle', 
 'Light tactical vehicle optimized for rapid deployment and reconnaissance', 
 '{"capacity": "6 personnel", "speed": "120 km/h", "engine": "280HP diesel", "weight": "6500kg", "range": "800km"}'::jsonb,
 ARRAY['All-terrain capability', 'Modular armor', 'Run-flat tires', 'GPS navigation'],
 NOW(), 
 NOW()),
(gen_random_uuid()::text, 
 'Kallon', 
 'Ground Vehicle', 
 'Heavy armored combat vehicle with superior firepower and protection', 
 '{"capacity": "8 personnel", "armor": "Level V+", "engine": "600HP diesel", "weight": "25000kg", "range": "500km"}'::jsonb,
 ARRAY['Enhanced armor protection', 'Active defense system', 'Thermal imaging', 'Advanced targeting'],
 NOW(), 
 NOW());

-- ============================================
-- VERIFICATION
-- ============================================
SELECT '✅ Tables Created' as status;
SELECT '✅ Admin User' as status, COUNT(*) as count FROM "User";
SELECT '✅ Inquiries' as status, COUNT(*) as count FROM "Inquiry";
SELECT '✅ News Stories' as status, COUNT(*) as count FROM "NewsStory";
SELECT '✅ Products' as status, COUNT(*) as count FROM "ProductSpecification";
SELECT '🎉 Database setup complete!' as message;

