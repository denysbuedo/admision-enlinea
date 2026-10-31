// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { NextRequest } from 'next/server';

const isolated = vi.hoisted(() => ({ client: null as import('@libsql/client').Client | null, token: undefined as string | undefined }));
vi.mock('@/db', async () => {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const schema = await import('@/db/schema');
  isolated.client = createClient({ url: 'file::memory:' });
  return { db: drizzle(isolated.client, { schema }) };
});
vi.mock('next/headers', () => ({ cookies: async () => ({ get: (name: string) => name === 'auth_token' && isolated.token ? { value: isolated.token } : undefined }) }));
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { signToken, verifyToken, getSession } from './auth';
import { POST as login } from '@/app/api/auth/login/route';
import bcrypt from 'bcryptjs';
import { GET as stream } from '@/app/api/notifications/stream/route';
import { POST as trigger } from '@/app/api/notifications/trigger/route';
import { notificationStore } from '@/lib/notification-store';
const secret = 'isolated-test-secret-with-at-least-32-bytes';
let user: typeof users.$inferSelect;
beforeAll(async () => { await migrate(db, { migrationsFolder: './drizzle' }); });
afterAll(() => { isolated.client?.close(); vi.unstubAllEnvs(); });
beforeEach(async () => {
  vi.stubEnv('JWT_SECRET', secret);
  isolated.token = undefined;
  await db.delete(users);
  [user] = await db.insert(users).values({ id: 1, name: 'Test', email: 'test@example.invalid', password: await bcrypt.hash('test-password', 4), role: 'university', universityId: 1 }).returning();
});
function issue() { return signToken(user); }
function altered(extra: Record<string, unknown>, algorithm: jwt.Algorithm = 'HS256') {
  const claims = jwt.decode(issue()) as jwt.JwtPayload;
  const payload = { ...claims, ...extra };
  for (const key of Object.keys(payload)) if (payload[key] === undefined) delete payload[key];
  return jwt.sign(payload, secret, { algorithm, noTimestamp: 'iat' in extra && extra.iat === undefined });
}
async function requestLogin(password = 'test-password') {
  return login(new NextRequest('http://localhost/api/auth/login', { method: 'POST', body: JSON.stringify({ email: user.email, password }) }));
}
describe('JWT validation and live session authorization', () => {
  it('validates the issued token and produces a live session without exposing password', async () => {
    isolated.token = issue();
    const verified = await verifyToken(isolated.token);
    expect(verified).toMatchObject({ userId: user.id, role: 'university', universityId: 1 });
    expect(jwt.decode(isolated.token)).not.toHaveProperty('password');
    expect(await getSession()).toMatchObject({ userId: user.id, user: { role: 'university', universityId: 1 } });
  });
  it.each(['', 'default_secret', 'short', 'x'.repeat(40)])('refuses missing/weak configuration %s', async value => {
    const token = issue();
    vi.stubEnv('JWT_SECRET', value);
    expect(() => issue()).toThrow();
    expect(await verifyToken(token)).toBeNull();
  });
  it('rejects absent configuration without falling back', async () => {
    const token = jwt.sign({ userId: 1 }, 'default_secret');
    vi.stubEnv('JWT_SECRET', undefined);
    expect(() => issue()).toThrow();
    expect(await verifyToken(token)).toBeNull();
  });
  it.each(['HS384', 'HS512', 'none'] as jwt.Algorithm[])('rejects algorithm %s', async algorithm => {
    expect(await verifyToken(altered({}, algorithm))).toBeNull();
  });
  it.each([
    { userId: '1' }, { userId: 0 }, { userId: 1.5 }, { role: 'admin' },
    { universityId: '1' }, { universityId: 0 }, { email: null },
    { exp: undefined }, { iat: undefined }, { iat: Math.floor(Date.now()/1000)+3600 },
    { exp: Math.floor(Date.now()/1000)-1 }, { sessionVersion: undefined },
    { sessionVersion: 'a'.repeat(64) },
  ])('rejects malformed/expired claims %j', async claims => {
    expect(await verifyToken(altered(claims))).toBeNull();
  });
  it('rejects wrong signature and rotated secret', async () => {
    const token = issue();
    expect(await verifyToken(jwt.sign({ userId: 1 }, 'wrong-signature-secret'))).toBeNull();
    vi.stubEnv('JWT_SECRET', secret + '-rotated');
    expect(await verifyToken(token)).toBeNull();
  });
  it('rejects legacy tokens even with correct signature', async () => {
    expect(await verifyToken(jwt.sign({ userId: 1, role: 'university', universityId: 1, email: user.email }, secret, { expiresIn: '7d' }))).toBeNull();
  });
  it.each([
    { isActive: false }, { role: 'aspirant' as const }, { universityId: 2 },
    { password: 'new-password-hash' }, { email: 'changed@example.invalid' },
    { updatedAt: new Date('2030-01-01') },
  ])('revokes token when account changes %j', async change => {
    isolated.token = issue();
    await db.update(users).set(change).where(eq(users.id, 1));
    expect(await verifyToken(isolated.token)).toBeNull();
    expect(await getSession()).toBeNull();
  });
  it('rejects deleted users and missing cookies', async () => {
    expect(await getSession()).toBeNull();
    isolated.token = issue();
    await db.delete(users);
    expect(await getSession()).toBeNull();
  });
  it('issues a working HTTP login cookie and keeps invalid/inactive login rejected', async () => {
    const response = await requestLogin();
    expect(response.status).toBe(200);
    const cookie = response.cookies.get('auth_token');
    expect(cookie).toBeDefined();
    expect(await verifyToken(cookie!.value)).toMatchObject({ userId: 1 });
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect((await requestLogin('wrong')).status).toBe(401);
    await db.update(users).set({ isActive: false }).where(eq(users.id, 1));
    expect((await requestLogin()).status).toBe(401);
  });
});

describe('Notification stream live authorization', () => {
  it('rejects absent/invalid stream credentials', async () => {
    expect((await stream(new NextRequest('http://localhost/api/notifications/stream'))).status).toBe(401);
    expect((await stream(new NextRequest('http://localhost/api/notifications/stream', { headers: { Authorization: 'Bearer invalid' } }))).status).toBe(401);
  });
  it('accepts the login cookie, delivers authorized events and closes before sending after revocation', async () => {
    const response = await stream(new NextRequest('http://localhost/api/notifications/stream', { headers: { Cookie: `auth_token=${issue()}` } }));
    expect(response.status).toBe(200);
    const reader = response.body!.getReader();
    expect(new TextDecoder().decode((await reader.read()).value)).toContain('connected');
    notificationStore.notify('1', { title: 'Allowed' });
    expect(new TextDecoder().decode((await reader.read()).value)).toContain('Allowed');
    await db.update(users).set({ isActive: false }).where(eq(users.id, 1));
    notificationStore.notify('1', { title: 'Must not arrive' });
    expect((await reader.read()).done).toBe(true);
  });
  it('cleans up when a client cancels or aborts', async () => {
    const abort = new AbortController();
    const response = await stream(new NextRequest('http://localhost/api/notifications/stream', { signal: abort.signal, headers: { Authorization: `Bearer ${issue()}` } }));
    const reader = response.body!.getReader();
    await reader.read();
    abort.abort();
    expect((await reader.read()).done).toBe(true);
    const second = await stream(new NextRequest('http://localhost/api/notifications/stream', { headers: { Cookie: `auth_token=${issue()}` } }));
    await expect(second.body!.cancel()).resolves.toBeUndefined();
  });
  it('closes an idle stream after revocation on the periodic check', async () => {
    vi.useFakeTimers();
    try {
      const response = await stream(new NextRequest('http://localhost/api/notifications/stream', { headers: { Cookie: `auth_token=${issue()}` } }));
      const reader = response.body!.getReader();
      await reader.read();
      await db.update(users).set({ isActive: false }).where(eq(users.id, 1));
      await vi.advanceTimersByTimeAsync(30000);
      expect((await reader.read()).done).toBe(true);
    } finally { vi.useRealTimers(); }
  });
});

describe('Notification trigger authorization', () => {
  it('rejects anonymous and institutional delivery, allowing only a live administrator', async () => {
    const send = vi.spyOn(notificationStore, 'notify');
    const request = () => new NextRequest('http://localhost/api/notifications/trigger', { method: 'POST', body: JSON.stringify({ userId: '1', title: 'Test', message: 'Synthetic' }) });
    try {
      expect((await trigger(request())).status).toBe(401);
      isolated.token = issue();
      expect((await trigger(request())).status).toBe(403);
      expect(send).not.toHaveBeenCalled();
      [user] = await db.update(users).set({ role: 'super_admin' }).where(eq(users.id, 1)).returning();
      isolated.token = issue();
      expect((await trigger(request())).status).toBe(200);
      expect(send).toHaveBeenCalledTimes(1);
    } finally { send.mockRestore(); }
  });
});
