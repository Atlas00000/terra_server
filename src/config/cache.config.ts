import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const cacheConfig = async (): Promise<CacheModuleOptions> => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    const store = await redisStore({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD,
    });

    return {
      store: store as any,
      ttl: 300000, // Default 5 minutes in milliseconds
      max: 100, // Maximum number of items in cache
    };
  } catch (error) {
    console.warn('⚠️  Redis connection failed, using in-memory cache fallback');
    return {
      ttl: 300000,
      max: 100,
    };
  }
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  NEWS_FEATURED: 300, // 5 minutes
  NEWS_SINGLE: 900, // 15 minutes
  PRODUCT_LIST: 900, // 15 minutes
  PRODUCT_SINGLE: 1800, // 30 minutes
  ANALYTICS_OVERVIEW: 120, // 2 minutes
  ANALYTICS_FUNNEL: 300, // 5 minutes
  SEARCH_RESULTS: 60, // 1 minute
  STATS: 180, // 3 minutes
};

