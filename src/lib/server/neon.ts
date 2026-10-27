import { neon } from '@neondatabase/serverless';

export function getNeonSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required. Copy .env.example to .env.local and configure Neon.');
  }
  return neon(databaseUrl);
}
