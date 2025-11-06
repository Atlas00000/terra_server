import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { RfqModule } from './modules/rfq/rfq.module';
import { EmailModule } from './modules/email/email.module';
import { MediaModule } from './modules/media/media.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { NewsModule } from './modules/news/news.module';
import { ProductSpecsModule } from './modules/product-specs/product-specs.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SearchModule } from './modules/search/search.module';
import { HealthModule } from './modules/health/health.module';
import { cacheConfig } from './config/cache.config';

@Module({
  imports: [
    // Configuration module (loads .env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),

    // Cache module (Redis)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: cacheConfig,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '10'),
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    InquiriesModule,
    RfqModule,
    EmailModule,
    MediaModule,
    ActivityLogsModule,
    NewsModule,
    ProductSpecsModule,
    AnalyticsModule,
    SearchModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

