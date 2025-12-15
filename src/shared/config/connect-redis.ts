//  NOTE : ioredis is better than node-redis or redis as it supports better features and is more robust for production use cases lso dont have to install types separately
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class ConnectRedis implements OnModuleDestroy {
      private redisClient: Redis;

      constructor() {
            this.redisClient = new Redis({
                  host: process.env.REDIS_HOST || 'localhost',
                  port: parseInt(process.env.REDIS_PORT || '6379'),
                  password: process.env.REDIS_PASSWORD || undefined,
                  db: parseInt(process.env.REDIS_DB || '0'),
                  retryStrategy: (times) => {
                        // Retry connection with exponential backoff, max 30 seconds
                        const delay = Math.min(times * 100, 30000);
                        return delay;
                  },
            });

            this.redisClient.on('connect', () => {
                  console.log('✅ Redis connected successfully');
            });

            this.redisClient.on('error', (error) => {
                  console.error('❌ Redis connection error:', error.message);
            });
      }

      getClient(): Redis {
            return this.redisClient;
      }

      // Cache helpers
      async get<T>(key: string): Promise<T | null> {
            const data = await this.redisClient.get(key);
            return data ? JSON.parse(data) : null;
      }

      async set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
            await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      }

      async del(key: string): Promise<void> {
            await this.redisClient.del(key);
      }

      async exists(key: string): Promise<boolean> {
            return (await this.redisClient.exists(key)) === 1;
      }

      // Cleanup on module destroy
      async onModuleDestroy(): Promise<void> {
            await this.redisClient.quit();
            console.log('Redis connection closed');
      }
}