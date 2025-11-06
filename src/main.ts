import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { winstonConfig } from './common/logger/winston.config';
import { initializeSentry } from './config/sentry.config';

async function bootstrap() {
  // Initialize Sentry first for error tracking
  initializeSentry();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS - Support multiple origins
  const allowedOrigins = [
    'http://localhost:3000',                           // Local development
    'https://terra-industries-drab.vercel.app',        // Production Vercel
    /https:\/\/.*\.vercel\.app$/,                      // Vercel preview deployments
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin matches allowed origins (string or regex)
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        }
        return allowedOrigin.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS: Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Allow extra properties for now (using Zod for validation)
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Terra Industries API')
    .setDescription('Backend API for Terra Industries defense technology platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('inquiries', 'Contact inquiries management')
    .addTag('rfq', 'Request for Quote management')
    .addTag('email', 'Email queue management')
    .addTag('media', 'Media file management (Cloudflare R2)')
    .addTag('activity-logs', 'Activity audit logs')
    .addTag('news', 'News/Stories CMS')
    .addTag('product-specs', 'Product Specifications')
    .addTag('analytics', 'Analytics & Dashboard')
    .addTag('search', 'Search & Advanced Filtering')
    .addTag('health', 'Health check endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`
🚀 Terra Industries Backend API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: ${process.env.NODE_ENV || 'development'}
Server:      http://localhost:${port}
API:         http://localhost:${port}/api/v1
Docs:        http://localhost:${port}/api-docs
Health:      http://localhost:${port}/api/v1/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

bootstrap();

