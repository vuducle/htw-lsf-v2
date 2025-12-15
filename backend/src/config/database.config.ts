import { registerAs } from '@nestjs/config';

/**
 * Datenbankkonfigurationsdatei für die Anwendung.
 * Diese Datei liest die Umgebungsvariablen und stellt
 * die Datenbankverbindungsdetails bereit.
 * @returns Ein Objekt mit den Datenbankkonfigurationsdetails.
 * @example
 * {
 *   host: 'localhost',
 *   port: 5432,
 *   username: 'postgres',
 *   password: 'password',
 *   database: 'mydb',
 *   schema: 'public',
 *   url: 'postgresql://postgres:password@localhost:5432/mydb?schema=public'
 * }
 */
export default registerAs('database', () => {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const username = process.env.DB_USERNAME || 'postgres';
  const password = process.env.DB_PASSWORD || 'password';
  const database = process.env.DB_NAME || 'mydb';
  const schema = process.env.DB_SCHEMA || 'public';

  return {
    host,
    port: parseInt(port, 10),
    username,
    password,
    database,
    schema,
    url: `postgresql://${username}:${password}@${host}:${port}/${database}?schema=${schema}`,
  };
});
