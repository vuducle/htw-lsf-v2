import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DatabaseInitService } from './database-init.service';
import { PrismaMigrationService } from './prisma-migration.service';

@Module({
  providers: [DatabaseInitService, PrismaMigrationService, PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
