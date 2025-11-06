import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import * as request from 'supertest';

export class E2ETestSetup {
  static async createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Apply same configuration as main.ts
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );

    await app.init();
    return app;
  }

  static async getAuthToken(app: INestApplication): Promise<string> {
    // Try to register admin user
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test-admin@terraindustries.com',
        password: 'TestPass123!',
        fullName: 'Test Admin',
      })
      .catch(() => {}); // Ignore if exists

    // Login
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test-admin@terraindustries.com',
        password: 'TestPass123!',
      });

    return response.body.accessToken;
  }
}

