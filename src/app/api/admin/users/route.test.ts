// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { migrate } from 'drizzle-orm/libsql/migrator';
import bcrypt from 'bcryptjs';

const isolated = vi.hoisted(() => ({ client: null as import('@libsql/client').Client | null, cleanup: () => {}, token: undefined as string | undefined }));

// Use real transactions on a disposable SQLite file; no local/production database.
// No production/local DB URL or environment secret is used by these tests.
vi.mock('@/db', async () => {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const schema = await import('@/db/schema');
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join, dirname, basename, resolve } = await import('node:path');
  const { pathToFileURL } = await import('node:url');
  const directory = mkdtempSync(join(tmpdir(), 'convoca-admin-test-'));
  isolated.cleanup = () => {
    if (dirname(resolve(directory)) !== resolve(tmpdir()) || !basename(directory).startsWith('convoca-admin-test-')) throw new Error('Unexpected test directory');
    try { rmSync(directory, { recursive: true, force: true }); }
    catch (error) {
      // Windows libsql transaction handles may live until process exit; only synthetic data remains in TEMP.
      if ((error as NodeJS.ErrnoException).code !== 'EBUSY') throw error;
    }
  };
  isolated.client = createClient({ url: pathToFileURL(join(directory, 'test.db')).href });
  return { db: drizzle(isolated.client, { schema }) };
});

vi.mock('next/headers', () => ({ cookies: async () => ({ get: (name: string) => name === 'auth_token' && isolated.token ? { value: isolated.token } : undefined }) }));
import { db } from '@/db';
import { users, universities, institutionalReviews } from '@/db/schema';
import { PATCH } from './route';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';
import { signToken, verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
const credentials = { name: 'Institution applicant', email: 'institution@example.invalid', password: 'synthetic-password', role: 'university', universityId: 1 };
let applicantId: number;
beforeAll(async () => { await migrate(db, { migrationsFolder: './drizzle' }); });
afterAll(() => { isolated.client?.close(); isolated.cleanup(); vi.unstubAllEnvs(); });
beforeEach(async () => {
  isolated.token = undefined;
  vi.stubEnv('JWT_SECRET', 'isolated-institutional-approval-secret-32-bytes');
  await db.delete(institutionalReviews); await db.delete(users); await db.delete(universities);
  await db.insert(universities).values({ id: 1, name: 'Synthetic institution' });
  const [admin] = await db.insert(users).values({ id: 1, name: 'Admin', email: 'admin@example.invalid', password: 'unused', role: 'super_admin' }).returning();
  const response = await register(new Request('http://localhost/api/auth/register', { method: 'POST', body: JSON.stringify({ ...credentials, isActive: true, institutionalStatus: 'approved' }) }));
  expect(response.status).toBe(201);
  applicantId = (await response.json()).id;
  isolated.token = signToken(admin);
});
function review(extra: Record<string, unknown> = {}) {
  return PATCH(new Request('http://localhost/api/admin/users', { method: 'PATCH', body: JSON.stringify({ userId: applicantId, decision: 'approved', note: 'Verified through synthetic institutional contact', ...extra }) }));
}
function authenticate() { return login(new NextRequest('http://localhost/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })); }
async function applicant() { return (await db.select().from(users).where(eq(users.id, applicantId)))[0]; }
async function state() { return { users: await db.select().from(users), reviews: await db.select().from(institutionalReviews) }; }

describe('Institutional approval', () => {
  it('ignores forged approval/activation on registration and denies login until reviewed', async () => {
    const account = await applicant();
    expect(account).toMatchObject({ institutionalStatus: 'pending', isActive: false });
    expect((await authenticate()).status).toBe(403);
    await db.update(users).set({ isActive: true }).where(eq(users.id, applicantId));
    expect(() => signToken({ ...account, isActive: true })).toThrow();
    expect((await authenticate()).status).toBe(403);
  });
  it('approves with atomic audit, preserves institution/role and enables fresh login', async () => {
    expect((await review()).status).toBe(200);
    const account = await applicant();
    expect(account).toMatchObject({ role: 'university', universityId: 1, isActive: true, institutionalStatus: 'approved', sessionRevision: 1 });
    expect(await db.select().from(institutionalReviews)).toMatchObject([{ userId: applicantId, reviewerId: 1, universityId: 1, decision: 'approved' }]);
    const response = await authenticate();
    expect(response.status).toBe(200);
    expect(await verifyToken(response.cookies.get('auth_token')!.value)).not.toBeNull();
    const before = await state();
    expect((await review()).status).toBe(409);
    expect(await state()).toEqual(before);
  });
  it('rejects with audit and leaves login disabled', async () => {
    expect((await review({ decision: 'rejected' })).status).toBe(200);
    expect(await applicant()).toMatchObject({ isActive: false, institutionalStatus: 'rejected' });
    expect((await authenticate()).status).toBe(403);
    expect(await db.select().from(institutionalReviews)).toHaveLength(1);
  });
  it('requires authenticated administrator without side effects', async () => {
    const before = await state();
    isolated.token = undefined;
    expect((await review()).status).toBe(401);
    const [aspirant] = await db.insert(users).values({ name: 'Other', email: 'other@example.invalid', password: 'unused' }).returning();
    isolated.token = signToken(aspirant);
    expect((await review()).status).toBe(403);
    expect(await db.select().from(institutionalReviews)).toEqual([]);
    expect(await applicant()).toEqual(before.users.find(user => user.id === applicantId));
  });
  it.each([{ decision: 'pending' }, { userId: 0 }, { note: 'short' }, { role: 'super_admin' }, { universityId: 2 }, { isActive: true }])('rejects invalid review %j without side effects', async payload => {
    const before = await state(); expect((await review(payload)).status).toBe(400); expect(await state()).toEqual(before);
  });
  it('rejects approval of an inactive university', async () => {
    await db.update(universities).set({ isActive: false }).where(eq(universities.id, 1));
    const before = await state(); expect((await review()).status).toBe(409); expect(await state()).toEqual(before);
  });
  it('does not change existing approved, disabled or non-institutional accounts', async () => {
    for (const userId of [1, 999]) expect((await review({ userId })).status).toBe(userId === 1 ? 409 : 404);
    await db.update(users).set({ institutionalStatus: 'approved', isActive: false }).where(eq(users.id, applicantId));
    const before = await state(); expect((await review()).status).toBe(409); expect(await state()).toEqual(before);
  });
  it('revokes approved sessions when approval is withdrawn and does not revive them after restoration', async () => {
    await review(); const account = await applicant(); const token = signToken(account);
    await db.update(users).set({ institutionalStatus: 'rejected' }).where(eq(users.id, applicantId));
    expect(await verifyToken(token)).toBeNull();
    await db.update(users).set({ institutionalStatus: 'approved', updatedAt: account.updatedAt }).where(eq(users.id, applicantId));
    expect(await verifyToken(token)).toBeNull();
  });
});
