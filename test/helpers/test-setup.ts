import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class TestSetup {
  static async createAdminUser(app: INestApplication): Promise<string> {
    try {
      // Try to register admin user
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'admin@terraindustries.com',
          password: 'SecurePass123!',
          fullName: 'Admin User',
        });
    } catch (error) {
      // User might already exist, that's okay
    }

    // Login and get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@terraindustries.com',
        password: 'SecurePass123!',
      });

    return loginResponse.body.accessToken;
  }

  static async cleanup(app: INestApplication) {
    // Add cleanup logic here if needed
  }
}

