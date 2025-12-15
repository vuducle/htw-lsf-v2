import 'dotenv/config';
import { defineConfig, PrismaConfig } from 'prisma/config';

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'dzemals_super_app'}`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: connectionString,
  },
} satisfies PrismaConfig);
