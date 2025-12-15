import { registerAs } from '@nestjs/config';
/**
 * Redis configuration file for the application.
 * This file reads the environment variables and provides
 * the Redis connection details.
 * @returns An object with the Redis configuration details.
 * @example
 * {
 *   host: 'localhost',
 *   port: 6379
 * }
 */
export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}));
