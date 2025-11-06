import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { E2ETestSetup } from './setup-e2e';

describe('RFQ System E2E Tests (Week 2)', () => {
  let app: INestApplication;
  let authToken: string;
  let inquiryId: string;
  let rfqId: string;

  beforeAll(async () => {
    app = await E2ETestSetup.createTestApp();
    authToken = await E2ETestSetup.getAuthToken(app);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('RFQ Workflow', () => {
    it('should create an inquiry first', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/inquiries')
        .send({
          inquiryType: 'sales',
          fullName: 'E2E Test User',
          email: 'e2e@test.com',
          company: 'E2E Test Co',
          country: 'NG',
          message: 'E2E test inquiry for RFQ workflow',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      inquiryId = response.body.id;
    });

    it('should create RFQ linked to inquiry', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/rfq')
        .send({
          inquiryId,
          productCategory: 'archer',
          quantity: 10,
          budgetRange: '>$1M',
          timeline: '3-6_months',
          requirements: 'E2E test RFQ for 10 Archer VTOL systems',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
      expect(response.body.inquiryId).toBe(inquiryId);
      rfqId = response.body.id;
    });

    it('should send quote and change status to quoted', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/rfq/${rfqId}/quote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quoteAmount: 15000000,
          notes: 'E2E test quote',
          specifications: { delivery: '6 months' },
        })
        .expect(200);

      expect(response.body.status).toBe('quoted');
      expect(Number(response.body.quoteAmount)).toBe(15000000);
    });

    it('should update RFQ status to won', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/rfq/${rfqId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'won',
          decisionDate: '2025-12-31',
        })
        .expect(200);

      expect(response.body.status).toBe('won');
    });

    it('should prevent invalid status transition', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/rfq/${rfqId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'pending' })
        .expect(400);
    });

    it('should export RFQs as CSV', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/rfq/export')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.text).toContain('ID,Product,Quantity');
      expect(response.text).toContain(rfqId);
    });
  });

  describe('RFQ Statistics', () => {
    it('should return accurate RFQ statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/rfq/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('won');
      expect(response.body.won).toBeGreaterThan(0);
    });
  });
});

