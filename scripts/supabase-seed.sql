-- ============================================
-- SUPABASE DATABASE SEED SCRIPT
-- ============================================

-- Clean existing data
TRUNCATE "User", "Inquiry", "NewsStory", "ProductSpecification" CASCADE;

-- ============================================
-- INSERT ADMIN USER
-- ============================================
-- Password: SecurePass123! (hashed with bcrypt)
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

-- ============================================
-- INSERT SAMPLE INQUIRIES
-- ============================================
INSERT INTO "Inquiry" (id, "fullName", email, phone, company, country, category, message, budget, timeline, "leadScore", status, "createdAt", "updatedAt")
VALUES 
(gen_random_uuid()::text, 'John Smith', 'john@defensetech.com', '+1-555-0101', 'Defense Tech Solutions', 'United States', 'UAV', 'Interested in Artemis UAV for reconnaissance missions. Need detailed specifications and pricing information.', '500000-1000000', '3-6 months', 85, 'new', NOW(), NOW()),
(gen_random_uuid()::text, 'Sarah Johnson', 'sarah@globalsec.com', '+44-20-7946-0958', 'Global Security Corp', 'United Kingdom', 'Ground Vehicle', 'Require armored vehicles for peacekeeping operations. This is an urgent inquiry with approved budget.', '1000000+', '6-12 months', 92, 'new', NOW(), NOW()),
(gen_random_uuid()::text, 'Michael Chen', 'mchen@techdefense.ca', '+1-416-555-0199', 'TechDefense Canada', 'Canada', 'UAV', 'Quote request for multiple VTOL drones. Budget has been approved and we are ready to proceed.', '250000-500000', '1-3 months', 78, 'new', NOW(), NOW());

-- ============================================
-- INSERT NEWS STORIES
-- ============================================
INSERT INTO "NewsStory" (id, title, slug, excerpt, content, category, tags, status, "isFeatured", "viewCount", "publishedAt", "createdAt", "updatedAt")
VALUES 
(gen_random_uuid()::text, 
 'Terra Industries Unveils Next-Gen Artemis UAV', 
 'artemis-uav-unveiled', 
 'Revolutionary reconnaissance platform sets new standards in tactical UAV technology', 
 '<h2>Breaking New Ground in Aerial Reconnaissance</h2><p>Terra Industries has unveiled the Artemis UAV, a state-of-the-art reconnaissance platform that represents a quantum leap in tactical unmanned aerial vehicle technology. With extended range capabilities and advanced autonomous features, the Artemis is designed to meet the evolving needs of modern defense operations.</p><p>The platform features real-time video transmission, autonomous flight modes, and weather-resistant construction, making it ideal for various operational environments.</p>', 
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
 '<h2>Strategic Partnership Milestone</h2><p>Terra Industries has secured a major defense contract valued at $50 million for the supply of advanced tactical vehicle systems. This landmark agreement underscores our commitment to delivering cutting-edge solutions for modern defense requirements.</p><p>The contract includes the delivery of multiple vehicle platforms including the Iroko APC, Duma light tactical vehicle, and Kallon heavy armored vehicle.</p>', 
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
 '<h2>Pushing Boundaries in Defense Innovation</h2><p>Our latest innovations in tactical defense systems showcase Terra Industries commitment to advancing military technology for the 21st century. From autonomous aerial platforms to next-generation ground vehicles, we continue to push the boundaries of what is possible.</p><p>Our R&D team works closely with defense partners to ensure our solutions meet real-world operational requirements while incorporating the latest technological advances.</p>', 
 'Technology', 
 ARRAY['Innovation', 'R&D', 'Future Tech'], 
 'published', 
 false, 
 156, 
 NOW() - INTERVAL '5 days', 
 NOW(), 
 NOW());

-- ============================================
-- INSERT PRODUCT SPECIFICATIONS
-- ============================================
INSERT INTO "ProductSpecification" (id, name, category, description, specifications, features, "createdAt", "updatedAt")
VALUES 
(gen_random_uuid()::text, 
 'Artemis', 
 'UAV', 
 'Advanced tactical reconnaissance UAV with extended range and endurance capabilities', 
 '{"weight": "25kg", "range": "50km", "endurance": "8 hours", "max_altitude": "5000m", "payload": "3kg", "speed": "80 km/h", "propulsion": "Electric", "control_range": "Line of sight + Satellite"}'::jsonb,
 ARRAY['Real-time HD video transmission', 'Autonomous flight modes', 'Weather resistant IP65', 'Silent operation', 'Night vision capable', 'GPS/GLONASS navigation'],
 NOW(), 
 NOW()),
(gen_random_uuid()::text, 
 'Archer', 
 'UAV', 
 'VTOL-capable combat drone with advanced targeting systems', 
 '{"weight": "45kg", "range": "100km", "endurance": "12 hours", "max_altitude": "6000m", "payload": "10kg", "speed": "120 km/h", "propulsion": "Hybrid", "armament": "Modular payload bay"}'::jsonb,
 ARRAY['VTOL capability', 'Precision targeting system', 'Night vision and thermal imaging', 'AI-assisted flight control', 'Autonomous return-to-base', 'Encrypted communications'],
 NOW(), 
 NOW()),
(gen_random_uuid()::text, 
 'Iroko', 
 'Ground Vehicle', 
 'Heavy-duty armored personnel carrier with advanced protection systems', 
 '{"capacity": "12 personnel", "armor": "Level IV STANAG 4569", "engine": "450HP turbocharged diesel", "weight": "18000kg", "range": "600km", "top_speed": "100 km/h", "fuel_capacity": "300L"}'::jsonb,
 ARRAY['Mine resistant hull design', 'NBC protection system', 'Independent suspension', 'Integrated communication suite', 'Run-flat tire system', 'Automatic fire suppression'],
 NOW(), 
 NOW()),
(gen_random_uuid()::text, 
 'Duma', 
 'Ground Vehicle', 
 'Light tactical vehicle optimized for rapid deployment and reconnaissance', 
 '{"capacity": "6 personnel", "speed": "120 km/h", "engine": "280HP turbocharged diesel", "weight": "6500kg", "range": "800km", "fuel_capacity": "180L", "payload": "1200kg"}'::jsonb,
 ARRAY['All-terrain capability', 'Modular armor system', 'Run-flat tires', 'Advanced GPS navigation', 'Winch system (4500kg)', 'Central tire inflation system'],
 NOW(), 
 NOW()),
(gen_random_uuid()::text, 
 'Kallon', 
 'Ground Vehicle', 
 'Heavy armored combat vehicle with superior firepower and protection', 
 '{"capacity": "8 personnel + 3 crew", "armor": "Level V+ composite", "engine": "600HP turbocharged diesel", "weight": "25000kg", "range": "500km", "top_speed": "85 km/h", "main_armament": "30mm autocannon"}'::jsonb,
 ARRAY['Enhanced composite armor protection', 'Active protection system', 'Thermal imaging and night vision', 'Advanced fire control system', 'Smoke grenade launchers', 'NBC filtered air system'],
 NOW(), 
 NOW());

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 'Admin User Created' as status, COUNT(*) as count FROM "User";
SELECT 'Inquiries Created' as status, COUNT(*) as count FROM "Inquiry";
SELECT 'News Stories Created' as status, COUNT(*) as count FROM "NewsStory";
SELECT 'Products Created' as status, COUNT(*) as count FROM "ProductSpecification";

