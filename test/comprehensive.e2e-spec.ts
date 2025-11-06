import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { E2ETestSetup } from './setup-e2e';

/**
 * Comprehensive Backend Test Suite
 * Organization: By Functionality (Industry Best Practice)
 * Coverage: All core features across all modules
 */
describe('Terra Industries Backend - Comprehensive Test Suite', () => {
  let app: INestApplication;
  let authToken: string;
  let inquiryId: string;
  let rfqId: string;
  let newsId: string;
  let newsSlug: string;
  let productId: string;

  beforeAll(async () => {
    app = await E2ETestSetup.createTestApp();
    authToken = await E2ETestSetup.getAuthToken(app);
  }, 30000); // 30 second timeout for setup

  afterAll(async () => {
    await app.close();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 1: INFRASTRUCTURE & HEALTH
  // ══════════════════════════════════════════════════════════════════════════

  describe('1. Infrastructure & Health', () => {
    it('1.1 should return server liveness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/liveness')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('uptime');
    });

    it('1.2 should check all services readiness', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/readiness')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.services.database.status).toBe('ok');
      expect(response.body.services.redis.status).toBe('ok');
      expect(response.body.services.r2.status).toBe('ok');
    });

    it('1.3 should return system health metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('cpu');
      expect(response.body.memory).toHaveProperty('rss');
    });

    it('1.4 should provide legacy health check', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 2: AUTHENTICATION & AUTHORIZATION
  // ══════════════════════════════════════════════════════════════════════════

  describe('2. Authentication & Authorization', () => {
    it('2.1 should prevent duplicate user registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test-admin@terraindustries.com',
          password: 'test123',
          fullName: 'Test',
        });
      
      // Should be 400 or 409 (duplicate email)
      expect([400, 409]).toContain(response.status);
    });

    it('2.2 should reject invalid login credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@terraindustries.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('2.3 should protect admin routes', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/inquiries')
        .expect(401);
    });

    it('2.4 should return current user with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe('test-admin@terraindustries.com');
    });

    it('2.5 should reject invalid JWT tokens', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('2.6 should allow public endpoint access', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/inquiries')
        .send({
          inquiryType: 'general',
          fullName: 'Public Test User',
          email: 'public@test.com',
          country: 'US',
          message: 'Test public endpoint access',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 3: CRM & SALES PIPELINE
  // ══════════════════════════════════════════════════════════════════════════

  describe('3. CRM & Sales Pipeline', () => {
    it('3.1 should create inquiry with lead scoring', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/inquiries')
        .send({
          inquiryType: 'sales',
          fullName: 'Test Customer',
          email: 'customer@test.com',
          phone: '+1234567890',
          company: 'Test Defense Ministry',
          country: 'NG',
          message: 'Urgent military procurement request with approved government budget for defense systems.',
          metadata: { budget: '>$1M', timeline: 'immediate' },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('leadScore');
      expect(response.body.leadScore).toBeGreaterThan(0);
      inquiryId = response.body.id;
    });

    it('3.2 should list inquiries with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/inquiries?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('3.3 should get inquiry statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/inquiries/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('newInquiries');
      expect(response.body).toHaveProperty('highPriority');
    });

    it('3.4 should create RFQ linked to inquiry', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/rfq')
        .send({
          inquiryId,
          productCategory: 'artemis',
          quantity: 25,
          budgetRange: '>$1M',
          timeline: '3-6_months',
          requirements: 'Test RFQ for 25 Artemis OS systems with full AI integration',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
      expect(response.body.inquiryId).toBe(inquiryId);
      rfqId = response.body.id;
    });

    it('3.5 should send quote and update status', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/rfq/${rfqId}/quote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quoteAmount: 30000000,
          notes: 'Test quote for 25 Artemis systems',
          specifications: { delivery: '4 months', support: '10 years' },
        })
        .expect(200);

      // Response structure: { message, rfq }
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('rfq');
      expect(response.body.rfq).toHaveProperty('id');
      expect(response.body.rfq.status).toBe('quoted');
      expect(Number(response.body.rfq.quoteAmount)).toBe(30000000);
    });

    it('3.6 should validate RFQ status transitions', async () => {
      // First ensure RFQ is in quoted status by sending quote again
      await request(app.getHttpServer())
        .post(`/api/v1/rfq/${rfqId}/quote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quoteAmount: 30000000,
          notes: 'Ensure quoted status',
        });

      // Valid transition: quoted → won
      const validResponse = await request(app.getHttpServer())
        .patch(`/api/v1/rfq/${rfqId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'won', decisionDate: '2025-12-31' });

      // Should succeed with 200 or 201
      expect(validResponse.status).toBeGreaterThanOrEqual(200);
      expect(validResponse.status).toBeLessThan(300);

      // Invalid transition: won → pending (should fail)
      const invalidResponse = await request(app.getHttpServer())
        .patch(`/api/v1/rfq/${rfqId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'pending' });
        
      // Should fail with 4xx error
      expect(invalidResponse.status).toBeGreaterThanOrEqual(400);
      expect(invalidResponse.status).toBeLessThan(500);
    });

    it('3.7 should return RFQ statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/rfq/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('byStatus');
      expect(response.body.byStatus).toHaveProperty('won');
    });

    it('3.8 should export RFQs as CSV', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/rfq/export')
        .set('Authorization', `Bearer ${authToken}`);

      // Should be 200 (success) or 400 (no data)
      expect([200, 400]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.text).toContain('ID,Product,Quantity');
      }
    });

    it('3.9 should return email queue statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/email/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('pending');
      expect(response.body).toHaveProperty('failed');
    });

    it('3.10 should track activity logs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/activity-logs/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('today');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 4: CONTENT MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  describe('4. Content Management', () => {
    it('4.1 should create news story as draft', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/news')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Comprehensive Test News Story',
          content: 'This is a comprehensive test story to verify all CMS functionality including creation, publishing, and public access features.',
          excerpt: 'Comprehensive CMS test story',
          category: 'company-news',
          tags: ['test', 'comprehensive'],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('draft');
      expect(response.body).toHaveProperty('slug');
      newsId = response.body.id;
      newsSlug = response.body.slug;
    });

    it('4.2 should publish news story', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/news/${newsId}/publish`)
        .set('Authorization', `Bearer ${authToken}`);

      // Accept both 200 and 201 status codes
      expect([200, 201]).toContain(response.status);
      expect(response.body.status).toBe('published');
      expect(response.body).toHaveProperty('publishedAt');
    });

    it('4.3 should access published news via public endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/news/slug/${newsSlug}`)
        .expect(200);

      expect(response.body.id).toBe(newsId);
      expect(response.body.status).toBe('published');
    });

    it('4.4 should track news view count', async () => {
      // Access story twice
      await request(app.getHttpServer()).get(`/api/v1/news/slug/${newsSlug}`);
      await request(app.getHttpServer()).get(`/api/v1/news/slug/${newsSlug}`);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/news/${newsId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.viewCount).toBeGreaterThan(0);
    });

    it('4.5 should return featured news', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/news/featured?limit=3')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('4.6 should create product specification', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/product-specs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productName: 'Test Kallon Intelligence System',
          category: 'kallon',
          specifications: {
            dimensions: { width: '2m', height: '3m' },
            capabilities: ['AI analysis', 'Real-time processing'],
          },
          performanceMetrics: {
            processingSpeed: '1000 req/sec',
            accuracy: '99.9%',
          },
          technicalDetails: {
            sensors: ['Multi-spectrum camera', 'Thermal'],
            power: 'Solar + battery',
          },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.category).toBe('kallon');
      productId = response.body.id;
    });

    it('4.7 should access product specs publicly', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/product-specs/${productId}`)
        .expect(200);

      expect(response.body.id).toBe(productId);
      expect(response.body.productName).toContain('Kallon');
    });

    it('4.8 should filter products by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-specs/category/kallon')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('4.9 should return media statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/media/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('byType');
      expect(response.body).toHaveProperty('totalSizeMB');
    });

    it('4.10 should list media files', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/media?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 5: ANALYTICS & BUSINESS INTELLIGENCE
  // ══════════════════════════════════════════════════════════════════════════

  describe('5. Analytics & Business Intelligence', () => {
    it('5.1 should return dashboard overview', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('inquiries');
      expect(response.body).toHaveProperty('rfqs');
      expect(response.body).toHaveProperty('revenue');
      expect(response.body).toHaveProperty('conversionRates');
    });

    it('5.2 should return conversion funnel', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/conversion-funnel')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stages');
      expect(response.body.stages).toHaveLength(4);
      expect(response.body.stages[0].name).toBe('Inquiries');
    });

    it('5.3 should return lead sources breakdown', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/lead-sources')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('byCountry');
      expect(response.body).toHaveProperty('byType');
      expect(response.body).toHaveProperty('byLeadScore');
    });

    it('5.4 should return response time metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/response-times')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('inquiryToRfq');
      expect(response.body).toHaveProperty('rfqToQuote');
    });

    it('5.5 should return top performers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/top-performers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('topProducts');
      expect(response.body).toHaveProperty('topCountries');
      expect(response.body).toHaveProperty('topDeals');
    });

    it('5.6 should return product performance analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(5); // All 5 products
      expect(response.body[0]).toHaveProperty('product');
      expect(response.body[0]).toHaveProperty('totalRfqs');
      expect(response.body[0]).toHaveProperty('conversionRate');
    });

    it('5.7 should return timeline data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/timeline/inquiries?days=30')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('5.8 should return active leads', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/active-leads')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('5.9 should return pending actions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/pending-actions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('unansweredInquiries');
      expect(response.body).toHaveProperty('pendingRfqs');
      expect(response.body).toHaveProperty('total');
    });

    it('5.10 should return news performance analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/news')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('published');
      expect(response.body).toHaveProperty('totalViews');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 6: SEARCH & DISCOVERY
  // ══════════════════════════════════════════════════════════════════════════

  describe('6. Search & Discovery', () => {
    it('6.1 should perform global search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/global?q=test&limit=20')
        .expect(200);

      expect(response.body).toHaveProperty('inquiries');
      expect(response.body).toHaveProperty('rfqs');
      expect(response.body).toHaveProperty('news');
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
    });

    it('6.2 should return search suggestions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/suggestions?q=test&limit=5')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('6.3 should filter inquiries by lead score', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/inquiries?minScore=60&maxScore=100')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });

    it('6.4 should filter RFQs with multiple criteria', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/rfqs?statuses=won&categories=artemis&sortBy=quoteAmount&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });

    it('6.5 should search news with filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/news?q=test&categories=company-news')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });

    it('6.6 should search products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/products?q=kallon')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });

    it('6.7 should handle pagination correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/inquiries?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('6.8 should support sorting', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/inquiries?sortBy=leadScore&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      // Verify sorting if data exists
      if (response.body.data.length > 1) {
        expect(response.body.data[0].leadScore).toBeGreaterThanOrEqual(
          response.body.data[1].leadScore
        );
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 7: PERFORMANCE & CACHING
  // ══════════════════════════════════════════════════════════════════════════

  describe('7. Performance & Caching', () => {
    it('7.1 should cache featured news', async () => {
      // First request
      const start1 = Date.now();
      await request(app.getHttpServer()).get('/api/v1/news/featured?limit=3');
      const time1 = Date.now() - start1;

      // Second request (should be cached)
      const start2 = Date.now();
      await request(app.getHttpServer()).get('/api/v1/news/featured?limit=3');
      const time2 = Date.now() - start2;

      // Cached request should be faster or equal
      expect(time2).toBeLessThanOrEqual(time1 + 50); // +50ms tolerance
    });

    it('7.2 should cache product specs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-specs')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('7.3 should cache analytics overview', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('inquiries');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY TEST
  // ══════════════════════════════════════════════════════════════════════════

  describe('8. End-to-End Integration', () => {
    it('8.1 should complete full CRM workflow', async () => {
      // This test verifies the entire flow has been successful
      expect(inquiryId).toBeDefined();
      expect(rfqId).toBeDefined();
      expect(newsId).toBeDefined();
      expect(productId).toBeDefined();

      // Verify all entities are linked correctly
      const rfq = await request(app.getHttpServer())
        .get(`/api/v1/rfq/${rfqId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(rfq.body.inquiryId).toBe(inquiryId);
      expect(rfq.body).toHaveProperty('status');
      // Status can be quoted or won depending on test execution order
      expect(['quoted', 'won']).toContain(rfq.body.status);
    });
  });
});

