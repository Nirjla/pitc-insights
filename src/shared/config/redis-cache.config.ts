import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

export const RedisCacheOptions: CacheModuleAsyncOptions = {
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
            store: await redisStore({
                  host: configService.get<string>('REDIS_HOST') || 'localhost',
                  port: configService.get<number>('REDIS_PORT') || 6379,
                  password: configService.get<string>('REDIS_PASSWORD') || undefined,
                  db: configService.get<number>('REDIS_DB') || 0,
                  ttl: 60 * 60, // Default TTL: 1 hour in seconds
            }),
      }),
      inject: [ConfigService],
};
