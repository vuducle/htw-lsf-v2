import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, QueryResult } from 'pg';

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema: string;
  url: string;
}

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDatabaseExists();
  }

  private async ensureDatabaseExists(): Promise<void> {
    const dbConfig = this.configService.get<DatabaseConfig>('database');

    if (!dbConfig) {
      this.logger.error('Database configuration not found');
      throw new Error('Database configuration is missing');
    }

    const { host, port, username, password, database } = dbConfig;
    const client = new Client({
      host,
      port,
      user: username,
      password,
      database: 'postgres',
    });

    let isConnected = false;
    try {
      await client.connect();
      isConnected = true;
      this.logger.log('Connected to PostgreSQL server');

      const result = await client.query<{ '1': number }>(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [database],
      );

      if (result.rows.length === 0) {
        this.logger.log(`Database "${database}" does not exist. Creating...`);
        await client.query(`CREATE DATABASE ${database}`);
        this.logger.log(`Database "${database}" created successfully`);
      } else {
        this.logger.log(`Database "${database}" already exists`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to ensure database exists: ${message}`);
      throw new Error(`Failed to ensure database exists: ${message}`);
    } finally {
      if (isConnected) {
        await client.end();
      }
    }
  }
}
