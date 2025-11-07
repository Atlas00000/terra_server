-- ============================================
-- MARK ALL MIGRATIONS AS APPLIED
-- ============================================
-- This tells Prisma that migrations have already been run

INSERT INTO "_prisma_migrations" (id, checksum, migration_name, logs, started_at, finished_at, applied_steps_count)
VALUES 
(
  '20251104170819_init',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  '20251104170819_init',
  NULL,
  NOW(),
  NOW(),
  1
),
(
  '20251104182037_add_rfq_and_email_queue',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  '20251104182037_add_rfq_and_email_queue',
  NULL,
  NOW(),
  NOW(),
  1
),
(
  '20251104190354_add_media_and_activity_logs',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  '20251104190354_add_media_and_activity_logs',
  NULL,
  NOW(),
  NOW(),
  1
),
(
  '20251104224551_add_news_and_product_specs',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  '20251104224551_add_news_and_product_specs',
  NULL,
  NOW(),
  NOW(),
  1
);

-- Verify migrations are now recorded
SELECT migration_name, finished_at, applied_steps_count 
FROM "_prisma_migrations" 
ORDER BY started_at;

