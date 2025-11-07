-- ============================================
-- RAILWAY POSTGRESQL - PRISMA SCHEMA MATCH
-- Creates tables matching Prisma @@map() directives
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop all existing tables
DROP TABLE IF EXISTS "activity_logs" CASCADE;
DROP TABLE IF EXISTS "media_files" CASCADE;
DROP TABLE IF EXISTS "email_queue" CASCADE;
DROP TABLE IF EXISTS "news_stories" CASCADE;
DROP TABLE IF EXISTS "product_specifications" CASCADE;
DROP TABLE IF EXISTS "rfq_requests" CASCADE;
DROP TABLE IF EXISTS "inquiries" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- ============================================
-- CREATE TABLES (matching Prisma @@map names)
-- ============================================

-- users table (matches @@map("users"))
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- inquiries table (matches @@map("inquiries"))
CREATE TABLE "inquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inquiry_type" TEXT NOT NULL DEFAULT 'general',
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "country" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "lead_score" INTEGER NOT NULL DEFAULT 0,
    "assigned_to" UUID,
    "metadata" JSONB,
    "source" TEXT NOT NULL DEFAULT 'website',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "inquiries_status_idx" ON "inquiries"("status");
CREATE INDEX "inquiries_created_at_idx" ON "inquiries"("created_at");
CREATE INDEX "inquiries_lead_score_idx" ON "inquiries"("lead_score");

-- rfq_requests table (matches @@map("rfq_requests"))
CREATE TABLE "rfq_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inquiry_id" UUID,
    "product_category" TEXT NOT NULL,
    "quantity" INTEGER,
    "budget_range" TEXT,
    "timeline" TEXT,
    "requirements" TEXT,
    "specifications" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "quote_amount" DECIMAL(15,2),
    "quote_sent_at" TIMESTAMP(3),
    "decision_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rfq_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "rfq_requests_status_idx" ON "rfq_requests"("status");
CREATE INDEX "rfq_requests_created_at_idx" ON "rfq_requests"("created_at");

-- email_queue table (matches @@map("email_queue"))
CREATE TABLE "email_queue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "to_email" TEXT NOT NULL,
    "from_email" TEXT NOT NULL DEFAULT 'noreply@terraindustries.com',
    "subject" TEXT NOT NULL,
    "html_body" TEXT NOT NULL,
    "text_body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_queue_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "email_queue_status_idx" ON "email_queue"("status");

-- media_files table (matches @@map("media_files"))
CREATE TABLE "media_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "thumbnail_path" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "uploaded_by" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- activity_logs table (matches @@map("activity_logs"))
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "changes" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- news_stories table (matches @@map("news_stories"))
CREATE TABLE "news_stories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "featured_image_id" UUID,
    "gallery_ids" UUID[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "author_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "news_stories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "news_stories_slug_key" ON "news_stories"("slug");
CREATE INDEX "news_stories_status_idx" ON "news_stories"("status");
CREATE INDEX "news_stories_published_at_idx" ON "news_stories"("published_at");

-- product_specifications table (matches @@map("product_specifications"))
CREATE TABLE "product_specifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specifications" JSONB NOT NULL,
    "features" TEXT[],
    "image_ids" UUID[],
    "document_ids" UUID[],
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "product_specifications_category_idx" ON "product_specifications"("category");

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
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assigned_to_fkey" 
    FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "rfq_requests" ADD CONSTRAINT "rfq_requests_inquiry_id_fkey" 
    FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_fkey" 
    FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "news_stories" ADD CONSTRAINT "news_stories_author_id_fkey" 
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_created_by_fkey" 
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Admin User (Password: SecurePass123!)
INSERT INTO "users" (id, email, password_hash, full_name, role, created_at, updated_at)
VALUES (
  'bb2a2351-adf7-46ac-9043-d457e113fb02'::uuid,
  'admin@terraindustries.com',
  '$2b$10$rKZH6YjGYxGxV7K5vXzHJeF8WZ3K9Qp7XvYN8Lm4Hj5kQ6tR8sU9W',
  'Admin User',
  'admin',
  NOW(),
  NOW()
);

-- Insert Sample Inquiries
INSERT INTO "inquiries" (inquiry_type, full_name, email, phone, company, country, message, lead_score, status, created_at, updated_at)
VALUES 
('product', 'John Smith', 'john@defensetech.com', '+1-555-0101', 'Defense Tech Solutions', 'United States', 'Interested in Artemis UAV for reconnaissance missions.', 85, 'new', NOW(), NOW()),
('product', 'Sarah Johnson', 'sarah@globalsec.com', '+44-20-7946-0958', 'Global Security Corp', 'United Kingdom', 'Require armored vehicles for peacekeeping operations.', 92, 'new', NOW(), NOW()),
('product', 'Michael Chen', 'mchen@techdefense.ca', '+1-416-555-0199', 'TechDefense Canada', 'Canada', 'Quote request for multiple VTOL drones.', 78, 'new', NOW(), NOW());

-- Insert News Stories
INSERT INTO "news_stories" (title, slug, excerpt, content, category, tags, status, is_featured, view_count, author_id, published_at, created_at, updated_at)
VALUES 
('Terra Industries Unveils Next-Gen Artemis UAV', 'artemis-uav-unveiled', 'Revolutionary reconnaissance platform', '<h2>Breaking New Ground</h2><p>Terra Industries has unveiled the Artemis UAV...</p>', 'Product Launch', ARRAY['UAV', 'Artemis'], 'published', true, 127, 'bb2a2351-adf7-46ac-9043-d457e113fb02'::uuid, NOW(), NOW(), NOW()),
('Terra Industries Secures Major Defense Contract', 'defense-contract-secured', 'Company announces $50M contract', '<h2>Strategic Partnership</h2><p>Major defense contract secured...</p>', 'Company News', ARRAY['Business', 'Contract'], 'published', false, 89, 'bb2a2351-adf7-46ac-9043-d457e113fb02'::uuid, NOW() - INTERVAL '2 days', NOW(), NOW()),
('Innovation in Modern Tactical Defense Systems', 'innovation-tactical-systems', 'Leading defense technology', '<h2>Pushing Boundaries</h2><p>Latest innovations...</p>', 'Technology', ARRAY['Innovation', 'R&D'], 'published', false, 156, 'bb2a2351-adf7-46ac-9043-d457e113fb02'::uuid, NOW() - INTERVAL '5 days', NOW(), NOW());

-- Insert Product Specifications
INSERT INTO "product_specifications" (name, category, description, specifications, features, created_by, created_at, updated_at)
VALUES 
('Artemis', 'UAV', 'Advanced tactical reconnaissance UAV', '{"weight": "25kg", "range": "50km", "endurance": "8 hours"}'::jsonb, ARRAY['Real-time video', 'Autonomous modes'], 'bb2a2351-adf7-46ac-9043-d457e113fb02'::uuid, NOW(), NOW()),
('Archer', 'UAV', 'VTOL-capable combat drone', '{"weight": "45kg", "range": "100km", "endurance": "12 hours"}'::jsonb, ARRAY['VTOL capability', 'Precision targeting'], 'bb2a2351-adf7-46ac-9043-d457e113fb02'::uuid, NOW(), NOW()),
('Iroko', 'Ground Vehicle', 'Heavy-duty armored personnel carrier', '{"capacity": "12 personnel", "armor": "Level IV"}'::jsonb, ARRAY['Mine resistant', 'NBC protection'], 'bb2a2351-adf7-46ac-9043-d457e113fb02'::uuid, NOW(), NOW()),
('Duma', 'Ground Vehicle', 'Light tactical vehicle', '{"capacity": "6 personnel", "speed": "120 km/h"}'::jsonb, ARRAY['All-terrain', 'Modular armor'], 'bb2a2351-adf7-46ac-9043-d457e113fb02'::uuid, NOW(), NOW()),
('Kallon', 'Ground Vehicle', 'Heavy armored combat vehicle', '{"capacity": "8 personnel", "armor": "Level V+"}'::jsonb, ARRAY['Enhanced armor', 'Active defense'], 'bb2a2351-adf7-46ac-9043-d457e113fb02'::uuid, NOW(), NOW());

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
SELECT '✅ Tables Created (Prisma format):' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;

SELECT '✅ Data Count:' as status;
SELECT 'users' as table_name, COUNT(*) as count FROM "users"
UNION ALL SELECT 'inquiries', COUNT(*) FROM "inquiries"
UNION ALL SELECT 'news_stories', COUNT(*) FROM "news_stories"
UNION ALL SELECT 'product_specifications', COUNT(*) FROM "product_specifications"
UNION ALL SELECT 'migrations', COUNT(*) FROM "_prisma_migrations";

