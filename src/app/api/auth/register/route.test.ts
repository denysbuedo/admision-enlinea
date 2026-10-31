// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { migrate } from 'drizzle-orm/libsql/migrator';
import bcrypt from 'bcryptjs';

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
import { users, universities } from '@/db/schema';
import { POST } from './route';

const account = { name: 'Aspirante de prueba', email: 'test@example.invalid', password: 'test-only-password' };
function register(extra: Record<string, unknown> = {}) {
  return POST(new Request('http://localhost/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...account, ...extra }),
  }));
}

beforeAll(async () => { await migrate(db, { migrationsFolder: './drizzle' }); });
beforeEach(async () => { await db.delete(users); await db.delete(universities); });
afterAll(() => { isolated.client?.close(); });

describe('Public registration permissions', () => {
  it('rejects super_admin without creating any user', async () => {
    const response = await register({ role: 'super_admin' });
    expect(response.status).toBe(400);
    expect(await db.select().from(users)).toHaveLength(0);
  });

  it('does not affect an existing administrator when rejecting a new one', async () => {
    await db.insert(users).values({ name: 'Existing admin', email: 'admin@example.invalid', password: 'existing-hash', role: 'super_admin' });
    expect((await register({ role: 'super_admin' })).status).toBe(400);
    const rows = await db.select().from(users);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email: 'admin@example.invalid', role: 'super_admin', password: 'existing-hash' });
  });

  it('defaults to aspirant and hashes the password without exposing it', async () => {
    const response = await register();
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.role).toBe('aspirant');
    expect(body).not.toHaveProperty('password');
    const [row] = await db.select().from(users);
    expect(await bcrypt.compare(account.password, row.password)).toBe(true);
  });

  it('preserves explicit aspirant registration without institution privileges', async () => {
    const response = await register({ role: 'aspirant', universityId: 123 });
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ role: 'aspirant', universityId: null });
  });

  it('preserves the current university registration flow for an existing institution', async () => {
    const [university] = await db.insert(universities).values({ name: 'Test university' }).returning();
    const response = await register({ role: 'university', universityId: university.id });
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ role: 'university', universityId: university.id });
  });

  it('rejects a nonexistent university without creating a user', async () => {
    expect((await register({ role: 'university', universityId: 9876 })).status).toBe(400);
    expect(await db.select().from(users)).toHaveLength(0);
  });

  it('keeps duplicate email protection', async () => {
    expect((await register()).status).toBe(201);
    expect((await register()).status).toBe(409);
    expect(await db.select().from(users)).toHaveLength(1);
  });

  it.each(['admin', 'SUPER_ADMIN', '', null, 1])('rejects unsupported role %s', async (role) => {
    expect((await register({ role })).status).toBe(400);
    expect(await db.select().from(users)).toHaveLength(0);
  });
});
