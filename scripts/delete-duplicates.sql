-- ============================================
-- DELETE DUPLICATE SNAKE_CASE TABLES
-- ============================================
-- Keep the PascalCase quoted tables (e.g. "User")
-- Delete the snake_case duplicates (e.g. users)

-- Drop snake_case duplicates
DROP TABLE IF EXISTS "activity_logs" CASCADE;
DROP TABLE IF EXISTS "email_queue" CASCADE;
DROP TABLE IF EXISTS "media_files" CASCADE;
DROP TABLE IF EXISTS "news_stories" CASCADE;
DROP TABLE IF EXISTS "product_specifications" CASCADE;
DROP TABLE IF EXISTS "rfq_requests" CASCADE;
DROP TABLE IF EXISTS "inquiries" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Verify only PascalCase tables remain
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

