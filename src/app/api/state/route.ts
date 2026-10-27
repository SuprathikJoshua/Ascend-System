import { getNeonSql } from '@/lib/server/neon';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' };

interface StateRow {
  data: Record<string, unknown>;
  version: number;
}

function response(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers });
}

function isStateData(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readCurrentState(): Promise<StateRow | null> {
  const sql = getNeonSql();
  const rows = await sql`
    SELECT data, version
    FROM app_state
    WHERE id = 'main'
    LIMIT 1
  ` as unknown as StateRow[];
  return rows[0] ?? null;
}

export async function GET(): Promise<Response> {
  try {
    const current = await readCurrentState();
    if (!current) return response({ error: 'state_not_found' }, 404);
    return response({ data: current.data, version: current.version });
  } catch {
    return response({ error: 'state_unavailable' }, 503);
  }
}

export async function PUT(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return response({ error: 'invalid_json' }, 400);
  }

  if (!isStateData(body) || !isStateData(body.data) || !Number.isInteger(body.baseVersion) || (body.baseVersion as number) < 0) {
    return response({ error: 'invalid_state_payload' }, 400);
  }

  const data = body.data;
  const baseVersion = body.baseVersion as number;

  try {
    const sql = getNeonSql();
    if (baseVersion === 0) {
      const inserted = await sql`
        INSERT INTO app_state (id, data, version, updated_at)
        VALUES ('main', ${JSON.stringify(data)}::jsonb, 1, now())
        ON CONFLICT (id) DO NOTHING
        RETURNING data, version
      ` as unknown as StateRow[];
      if (inserted[0]) return response({ data: inserted[0].data, version: inserted[0].version });
    } else {
      const updated = await sql`
        UPDATE app_state
        SET data = ${JSON.stringify(data)}::jsonb,
            version = version + 1,
            updated_at = now()
        WHERE id = 'main' AND version = ${baseVersion}
        RETURNING data, version
      ` as unknown as StateRow[];
      if (updated[0]) return response({ data: updated[0].data, version: updated[0].version });
    }

    const current = await readCurrentState();
    return response({
      data: current?.data ?? null,
      version: current?.version ?? 0,
    }, 409);
  } catch {
    return response({ error: 'state_unavailable' }, 503);
  }
}
