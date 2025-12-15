import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: PrismaClient;
  private pool: Pool;

  constructor(private configService: ConfigService) {
    const dbConfig = this.configService.get('database');

    // Erstelle PostgreSQL Connection Pool
    this.pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    // Erstelle Prisma Adapter
    const adapter = new PrismaPg(this.pool);

    // Initialisiere PrismaClient mit Adapter
    this.client = new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    await this.pool.end();
  }
}
