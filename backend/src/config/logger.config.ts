import { registerAs } from '@nestjs/config';
/**
 * Logger configuration file for the application.
 * This file reads the environment variables and provides
 * the logger settings.
 * @returns An object with the logger configuration details.
 * @example
 * {
 *   level: 'info'
 * }
 */
export default registerAs('logger', () => ({
  level: process.env.LOG_LEVEL || 'info',
}));
