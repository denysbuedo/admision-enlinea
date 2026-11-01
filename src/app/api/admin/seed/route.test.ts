// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { migrate } from 'drizzle-orm/libsql/migrator';

const isolated = vi.hoisted(() => ({ client: null as import('@libsql/client').Client | null }));

// Use the real schema/migrations and handler, with an isolated in-memory DB.
// No production/local DB URL or environment secret is used by these tests.
vi.mock('@/db', async () => {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const schema = await import('@/db/schema');
  isolated.client = createClient({ url: 'file::memory:' });
  return { db: drizzle(isolated.client, { schema }) };
});

import { db } from '@/db';
import { users } from '@/db/schema';
import { GET, POST } from './route';
beforeAll(async () => { await migrate(db, { migrationsFolder: './drizzle' }); });
beforeEach(async () => { await db.delete(users); vi.stubEnv('ADMIN_INITIAL_PASSWORD', 'isolated-seed-password'); });
afterAll(() => { isolated.client?.close(); vi.unstubAllEnvs(); });
describe('Retired HTTP administrator bootstrap', () => {
  it.each([['GET', GET], ['POST', POST]] as const)('returns 410 for %s without creating a user', async (_method, handler) => {
    expect((await handler()).status).toBe(410);
    expect(await db.select().from(users)).toHaveLength(0);
  });
  it('does not inspect or mutate existing accounts', async () => {
    await db.insert(users).values({ name: 'Existing', email: 'admin@nexo.com', password: 'untouched', role: 'aspirant' });
    const before = await db.select().from(users);
    expect((await POST()).status).toBe(410);
    expect(await db.select().from(users)).toEqual(before);
  });
});
