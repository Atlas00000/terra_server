import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { E2ETestSetup } from './setup-e2e';

describe('Media Upload E2E Tests (Week 3)', () => {
  let app: INestApplication;
  let authToken: string;
  let mediaId: string;

  beforeAll(async () => {
    app = await E2ETestSetup.createTestApp();
    authToken = await E2ETestSetup.getAuthToken(app);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('Media Upload Workflow', () => {
    it('should get initial media statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/media/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('byType');
      expect(response.body).toHaveProperty('totalSize');
    });

    it('should list media files with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/media?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter media by file type', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/media?fileType=image')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });

    // Note: File upload testing requires multipart form data
    // Skipping actual upload test in E2E (tested in integration tests)
  });

  describe('Activity Logs', () => {
    it('should get activity log statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/activity-logs/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('today');
    });

    it('should list activity logs with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/activity-logs?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get recent activity (last 24 hours)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/activity-logs/recent?limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

