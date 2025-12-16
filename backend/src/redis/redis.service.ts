import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

interface RedisConfig {
  host: string;
  port: number;
}

interface SessionData {
  id: string;
  email: string;
  [key: string]: any;
}

@Injectable()
export class RedisService {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = this.configService.get<RedisConfig>('redis');
    this.client = createClient({
      socket: {
        host: redisConfig?.host || 'localhost',
        port: redisConfig?.port || 6379,
      },
    });

    this.client.on('error', (err: Error) =>
      console.error('Redis Client Error', err),
    );
    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async flushAll(): Promise<void> {
    await this.client.flushAll();
  }

  // Session management
  async setUserSession(
    userId: string,
    sessionData: SessionData,
    ttl: number = 86400,
  ): Promise<void> {
    const key = `session:${userId}`;
    await this.set(key, JSON.stringify(sessionData), ttl);
  }

  async getUserSession(userId: string): Promise<SessionData | null> {
    const key = `session:${userId}`;
    const data = await this.get(key);
    return data ? (JSON.parse(data) as SessionData) : null;
  }

  async deleteUserSession(userId: string): Promise<void> {
    const key = `session:${userId}`;
    await this.del(key);
  }

  // Cache management - Generic version
  async setCache<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.set(`cache:${key}`, JSON.stringify(value), ttl);
  }

  async getCache<T>(key: string): Promise<T | null> {
    const data = await this.get(`cache:${key}`);
    return data ? (JSON.parse(data) as T) : null;
  }

  async deleteCache(key: string): Promise<void> {
    await this.del(`cache:${key}`);
  }

  async invalidateCache(key: string): Promise<void> {
    await this.del(`cache:${key}`);
  }

  // User data caching - Generic version
  async cacheUserData<T extends { id: string }>(
    userId: string,
    userData: T,
    ttl: number = 1800,
  ): Promise<void> {
    const key = `user:${userId}`;
    await this.set(key, JSON.stringify(userData), ttl);
  }

  async getCachedUserData<T extends { id: string }>(
    userId: string,
  ): Promise<T | null> {
    const key = `user:${userId}`;
    const data = await this.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const key = `user:${userId}`;
    await this.del(key);
  }
}
