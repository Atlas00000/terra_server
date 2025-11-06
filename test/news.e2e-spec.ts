import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { E2ETestSetup } from './setup-e2e';

describe('News CMS E2E Tests (Week 4)', () => {
  let app: INestApplication;
  let authToken: string;
  let newsId: string;
  let newsSlug: string;

  beforeAll(async () => {
    app = await E2ETestSetup.createTestApp();
    authToken = await E2ETestSetup.getAuthToken(app);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('News Publishing Workflow', () => {
    it('should create news story as draft', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/news')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'E2E Test News Story',
          content: 'This is a comprehensive E2E test for the news CMS system to verify all functionality works correctly.',
          excerpt: 'E2E test news story excerpt',
          category: 'company-news',
          tags: ['test', 'e2e'],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('draft');
      expect(response.body).toHaveProperty('slug');
      newsId = response.body.id;
      newsSlug = response.body.slug;
    });

    it('should update news story', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/news/${newsId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          excerpt: 'Updated E2E test excerpt',
        })
        .expect(200);

      expect(response.body.excerpt).toContain('Updated');
    });

    it('should publish news story', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/news/${newsId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('published');
      expect(response.body).toHaveProperty('publishedAt');
    });

    it('should access published story via public slug endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/news/slug/${newsSlug}`)
        .expect(200);

      expect(response.body.id).toBe(newsId);
      expect(response.body.status).toBe('published');
    });

    it('should increment view count on access', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/news/slug/${newsSlug}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/news/${newsId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.viewCount).toBeGreaterThan(0);
    });

    it('should unpublish story', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/news/${newsId}/unpublish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('draft');
    });

    it('should not allow public access to unpublished story', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/news/slug/${newsSlug}`)
        .expect(404);
    });

    it('should archive (delete) story', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/news/${newsId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('archived');
    });
  });

  describe('News Statistics', () => {
    it('should return accurate news statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/news/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('byStatus');
      expect(response.body).toHaveProperty('totalViews');
    });
  });
});

