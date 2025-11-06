import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { E2ETestSetup } from './setup-e2e';

describe('Product Specifications E2E Tests (Week 4)', () => {
  let app: INestApplication;
  let authToken: string;
  let productId: string;

  beforeAll(async () => {
    app = await E2ETestSetup.createTestApp();
    authToken = await E2ETestSetup.getAuthToken(app);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('Product Specs CRUD Workflow', () => {
    it('should create product specification', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/product-specs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productName: 'E2E Test Kallon System',
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

    it('should get product spec by ID (public)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/product-specs/${productId}`)
        .expect(200);

      expect(response.body.id).toBe(productId);
      expect(response.body.productName).toContain('E2E Test');
    });

    it('should list product specs (public)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-specs')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-specs?category=kallon')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].category).toBe('kallon');
    });

    it('should get specs by category endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-specs/category/kallon')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should update product specification', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/product-specs/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          performanceMetrics: {
            processingSpeed: '2000 req/sec',
            accuracy: '99.95%',
          },
        })
        .expect(200);

      expect(response.body.performanceMetrics.processingSpeed).toBe('2000 req/sec');
    });

    it('should delete product specification', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/product-specs/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for deleted product', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/product-specs/${productId}`)
        .expect(404);
    });
  });

  describe('Product Specs Statistics', () => {
    it('should return product specs statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-specs/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('byCategory');
    });
  });
});

