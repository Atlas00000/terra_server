import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { E2ETestSetup } from './setup-e2e';

describe('Analytics & Search E2E Tests (Weeks 5-6)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await E2ETestSetup.createTestApp();
    authToken = await E2ETestSetup.getAuthToken(app);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('Analytics Dashboard', () => {
    it('should return dashboard overview with all metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('inquiries');
      expect(response.body).toHaveProperty('rfqs');
      expect(response.body).toHaveProperty('revenue');
      expect(response.body).toHaveProperty('conversionRates');
      expect(response.body.inquiries).toHaveProperty('total');
      expect(response.body.rfqs).toHaveProperty('total');
    });

    it('should return conversion funnel data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/conversion-funnel')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stages');
      expect(response.body).toHaveProperty('dropOffRates');
      expect(response.body.stages).toHaveLength(4);
      expect(response.body.stages[0].name).toBe('Inquiries');
    });

    it('should return lead sources breakdown', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/lead-sources')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('byCountry');
      expect(response.body).toHaveProperty('byType');
      expect(response.body).toHaveProperty('byLeadScore');
    });

    it('should return product performance analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('product');
      expect(response.body[0]).toHaveProperty('totalRfqs');
      expect(response.body[0]).toHaveProperty('conversionRate');
    });

    it('should return inquiries timeline', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/timeline/inquiries?days=30')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Global Search', () => {
    it('should search across all entities', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/global?q=test&limit=20')
        .expect(200);

      expect(response.body).toHaveProperty('inquiries');
      expect(response.body).toHaveProperty('rfqs');
      expect(response.body).toHaveProperty('news');
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
    });

    it('should return search suggestions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/suggestions?q=arc&limit=5')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter inquiries by lead score', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/inquiries?minScore=60&maxScore=100')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should filter RFQs by status and category', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/rfqs?statuses=won&categories=archer')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/inquiries?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });
  });

  describe('Health Checks', () => {
    it('should return liveness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/liveness')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should return readiness with all services', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/readiness')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('redis');
      expect(response.body.services).toHaveProperty('r2');
    });

    it('should return health metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('cpu');
      expect(response.body.memory).toHaveProperty('rss');
    });
  });
});

