import { getNeonSql } from '../src/lib/server/neon';

const sql = getNeonSql();

await sql`CREATE TABLE IF NOT EXISTS app_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  version integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

console.log('Ensured app_state table exists.');
