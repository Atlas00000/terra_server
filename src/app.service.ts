import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Terra Industries Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

