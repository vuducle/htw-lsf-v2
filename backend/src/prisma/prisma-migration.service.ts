import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { execSync } from 'child_process';

@Injectable()
export class PrismaMigrationService implements OnModuleInit {
  private readonly logger = new Logger(PrismaMigrationService.name);

  async onModuleInit(): Promise<void> {
    await this.runPrismaMigration();
  }

  private async runPrismaMigration(): Promise<void> {
    try {
      this.logger.log('Starting Prisma schema synchronization...');

      // Setze die DATABASE_URL und führe prisma db push aus
      const env = process.env.DATABASE_URL
        ? process.env
        : {
            ...process.env,
            DATABASE_URL: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=${process.env.DB_SCHEMA}`,
          };

      execSync('npx prisma db push --skip-generate --accept-data-loss', {
        stdio: 'inherit',
        env,
        cwd: process.cwd(),
      });

      this.logger.log('Prisma schema synchronized successfully');
    } catch (error) {
      this.logger.warn(
        'Prisma migration skipped (this is normal if using adapters)',
      );
    }
  }
}
