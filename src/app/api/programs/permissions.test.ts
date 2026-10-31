// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { NextRequest } from 'next/server';
import type { CustomSession } from '@/lib/auth';

const isolated = vi.hoisted(() => ({ client: null as import('@libsql/client').Client | null, session: null as CustomSession | null }));
vi.mock('@/db', async () => {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const schema = await import('@/db/schema');
  isolated.client = createClient({ url: 'file::memory:' });
  return { db: drizzle(isolated.client, { schema }) };
});
vi.mock('@/lib/auth', () => ({ getSession: async () => isolated.session }));
import { db } from '@/db';
import { programs, universities } from '@/db/schema';
import { GET, PATCH } from './[id]/route';
import { GET as list, POST } from './route';

const states = ['draft', 'pending_approval', 'published', 'closed', 'rejected'] as const;
function login(role: CustomSession['role'], universityId: number | null = null) {
  isolated.session = { userId: 1, role, universityId, user: { id: '1', role, universityId, email: 'test@example.invalid' } };
}
function detail(id: number, body?: unknown) {
  const request = new NextRequest(`http://localhost/api/programs/${id}`, { method: body === undefined ? 'GET' : 'PATCH', ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return (body === undefined ? GET : PATCH)(request, { params: Promise.resolve({ id: String(id) }) });
}
function catalog() { return list(new NextRequest('http://localhost/api/programs?status=draft&universityId=2')); }
beforeAll(async () => { await migrate(db, { migrationsFolder: './drizzle' }); });
afterAll(() => { isolated.client?.close(); });
beforeEach(async () => {
  isolated.session = null;
  await db.delete(programs); await db.delete(universities);
  await db.insert(universities).values([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
  for (const universityId of [1, 2]) {
    await db.insert(programs).values(states.map((status, index) => ({ id: (universityId - 1) * 5 + index + 1, universityId, title: `${universityId}-${status}`, status, programType: 'maestria' as const, modality: 'virtual' as const })));
  }
});
describe('Program visibility', () => {
  it.each(['anonymous', 'aspirant', 'unknown'])('limits %s to published programs in list and detail', async role => {
    if (role !== 'anonymous') login(role as CustomSession['role']);
    expect((await (await catalog()).json()).map((p: { id: number }) => p.id).sort()).toEqual([3, 8]);
    for (let id = 1; id <= 10; id++) expect((await detail(id)).status).toBe([3, 8].includes(id) ? 200 : 404);
  });
  it.each([1, 2])('keeps institution %s private management and hides foreign private detail', async universityId => {
    login('university', universityId);
    const rows = await (await catalog()).json();
    expect(rows).toHaveLength(5);
    expect(rows.every((p: { universityId: number }) => p.universityId === universityId)).toBe(true);
    for (let id = 1; id <= 10; id++) expect((await detail(id)).status).toBe(Math.ceil(id / 5) === universityId || [3, 8].includes(id) ? 200 : 404);
  });
  it('does not expose private programs for an institution without assignment', async () => {
    login('university');
    expect(await (await catalog()).json()).toEqual([]);
    expect((await detail(1)).status).toBe(404);
  });
  it('preserves admin access and missing resource behavior', async () => {
    login('super_admin');
    expect(await (await catalog()).json()).toHaveLength(10);
    for (let id = 1; id <= 10; id++) expect((await detail(id)).status).toBe(200);
    expect((await detail(999)).status).toBe(404);
  });
});
describe('Program write permissions', () => {
  it.each(['anonymous', 'aspirant', 'unknown'])('blocks %s writes without changing any row', async role => {
    if (role !== 'anonymous') login(role as CustomSession['role']);
    const before = await db.select().from(programs);
    expect((await detail(1, { title: 'Attack', status: 'published' })).status).toBe(role === 'anonymous' ? 401 : 403);
    expect(await db.select().from(programs)).toEqual(before);
  });
  it.each([2, null])('blocks foreign/missing institution %s even with forged ownership', async universityId => {
    login('university', universityId);
    const before = await db.select().from(programs);
    expect((await detail(1, { universityId, title: 'Attack' })).status).toBe(403);
    expect(await db.select().from(programs)).toEqual(before);
  });
  it.each(['published', 'rejected', 'closed'])('prevents institution setting %s atomically', async status => {
    login('university', 1);
    const before = await db.select().from(programs);
    expect((await detail(1, { status, title: 'Attack' })).status).toBe(403);
    expect(await db.select().from(programs)).toEqual(before);
  });
  it.each([3, 4])('prevents changing approved/closed content or resetting status for %s', async id => {
    login('university', 1);
    const before = await db.select().from(programs);
    expect((await detail(id, { title: 'Unreviewed changes' })).status).toBe(403);
    expect((await detail(id, { status: 'draft' })).status).toBe(403);
    expect(await db.select().from(programs)).toEqual(before);
  });
  it.each([1, 2, 5])('allows editing unpublished own program %s and resubmitting', async id => {
    login('university', 1);
    const response = await detail(id, { title: 'Updated', status: 'pending_approval', universityId: 2 });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ title: 'Updated', status: 'pending_approval', universityId: 1 });
  });
  it.each(states)('allows administrator status %s', async status => {
    login('super_admin');
    expect((await detail(6, { status })).status).toBe(200);
  });
  it.each([null, 'invalid', '', 1])('rejects malformed status %s without mutation', async status => {
    login('super_admin');
    const before = await db.select().from(programs);
    expect((await detail(1, { title: 'Attack', status })).status).toBe(400);
    expect(await db.select().from(programs)).toEqual(before);
  });
  it('keeps new institutional programs pending despite forged status and ownership', async () => {
    login('university', 1);
    const response = await POST(new NextRequest('http://localhost/api/programs', { method: 'POST', body: JSON.stringify({ title: 'New', programType: 'maestria', modality: 'virtual', universityId: 2, status: 'published' }) }));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ universityId: 1, status: 'pending_approval' });
  });
});
