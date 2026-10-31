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
import { applications, programs, universities, users, notifications, statusHistory } from '@/db/schema';
import { GET, PATCH } from './[id]/route';
import { GET as exportApplications } from '../programs/[id]/export/route';

function login(role: CustomSession['role'], universityId: number | null = null, userId = 1) {
  isolated.session = { userId, role, universityId, user: { id: String(userId), role, universityId, email: 'test@example.invalid' } };
}
function detail(method = 'GET', id = '1', body = { status: 'approved', reviewNotes: 'Test review', score: 90 }) {
  const request = new NextRequest(`http://localhost/api/applications/${id}`, {
    method, ...(method === 'PATCH' ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
  });
  return (method === 'GET' ? GET : PATCH)(request, { params: Promise.resolve({ id }) });
}
function download(format = 'csv', id = '1') {
  return exportApplications(new NextRequest(`http://localhost/api/programs/${id}/export?format=${format}`), { params: Promise.resolve({ id }) });
}
async function snapshot() {
  return { applications: await db.select().from(applications), history: await db.select().from(statusHistory), notifications: await db.select().from(notifications) };
}
beforeAll(async () => { await migrate(db, { migrationsFolder: './drizzle' }); });
afterAll(() => { isolated.client?.close(); });
beforeEach(async () => {
  isolated.session = null;
  await db.delete(notifications); await db.delete(statusHistory); await db.delete(applications);
  await db.delete(programs); await db.delete(users); await db.delete(universities);
  await db.insert(universities).values([{ id: 1, name: 'University A' }, { id: 2, name: 'University B' }]);
  await db.insert(users).values([{ id: 1, name: 'Owner', email: 'owner@example.invalid', password: 'unused' }, { id: 2, name: 'Other', email: 'other@example.invalid', password: 'unused' }]);
  await db.insert(programs).values([1, 2].map(id => ({ id, universityId: id, title: `Program ${id}`, programType: 'maestria' as const, modality: 'virtual' as const })));
  await db.insert(applications).values([1, 2].map(id => ({ id, programId: id, userId: id, firstName: `Private applicant ${id}`, status: 'submitted' as const })));
  await db.insert(statusHistory).values({ applicationId: 1, toStatus: 'submitted', changedBy: 1, notes: 'Private history' });
});

describe('Application institution boundaries', () => {
  it.each(['GET', 'PATCH'])('requires authentication for %s', async method => {
    expect((await detail(method)).status).toBe(401);
  });
  it.each([2, null])('denies foreign or missing institution %s without side effects', async universityId => {
    login('university', universityId);
    const before = await snapshot();
    expect((await detail()).status).toBe(403);
    expect((await detail('PATCH')).status).toBe(403);
    expect(await snapshot()).toEqual(before);
  });
  it.each([1, 2])('allows institution %s only its own application and review', async id => {
    login('university', id);
    expect((await detail('GET', String(id))).status).toBe(200);
    expect((await detail('PATCH', String(id))).status).toBe(200);
    const state = await snapshot();
    expect(state.applications.find(a => a.id === id)).toMatchObject({ status: 'approved', score: 90 });
    expect(state.applications.find(a => a.id !== id)?.status).toBe('submitted');
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].userId).toBe(id);
    expect(state.history.filter(h => h.toStatus === 'approved')).toHaveLength(1);
    expect((await detail('GET', String(id === 1 ? 2 : 1))).status).toBe(403);
  });
  it('preserves administrator access across institutions', async () => {
    login('super_admin');
    for (const id of ['1', '2']) {
      expect((await detail('GET', id)).status).toBe(200);
      expect((await detail('PATCH', id)).status).toBe(200);
    }
  });
  it('preserves applicant ownership and prevents review privileges', async () => {
    login('aspirant');
    expect((await detail()).status).toBe(200);
    expect((await detail('PATCH')).status).toBe(200);
    const before = await snapshot();
    expect(before.applications[0].status).toBe('submitted');
    expect((await detail('GET', '2')).status).toBe(403);
    expect((await detail('PATCH', '2')).status).toBe(403);
    expect(await snapshot()).toEqual(before);
  });
  it('denies an unknown session role', async () => {
    login('unknown' as CustomSession['role']);
    expect((await detail()).status).toBe(403);
    expect((await detail('PATCH')).status).toBe(403);
  });
  it('denies institutional access when the application program is missing', async () => {
    await db.delete(programs);
    login('university', 1);
    expect((await detail()).status).toBe(403);
    expect((await detail('PATCH')).status).toBe(403);
  });
  it('keeps missing application responses', async () => {
    login('super_admin');
    expect((await detail('GET', '999')).status).toBe(404);
    expect((await detail('PATCH', '999')).status).toBe(404);
  });
});

describe('Export institution boundaries', () => {
  it.each(['csv', 'json'])('protects %s for both institutions and preserves admin export', async format => {
    expect((await download(format)).status).toBe(401);
    login('aspirant');
    expect((await download(format)).status).toBe(401);
    for (const id of [1, 2]) {
      login('university', id);
      const own = await download(format, String(id));
      expect(own.status).toBe(200);
      const content = await own.text();
      expect(content).toContain(`Private applicant ${id}`);
      expect(content).not.toContain(`Private applicant ${id === 1 ? 2 : 1}`);
      const denied = await download(format, String(id === 1 ? 2 : 1));
      expect(denied.status).toBe(403);
      expect(await denied.text()).not.toContain('Private applicant');
    }
    login('university', null);
    expect((await download(format)).status).toBe(403);
    login('super_admin');
    expect((await download(format, '1')).status).toBe(200);
    expect((await download(format, '2')).status).toBe(200);
    expect((await download(format, '999')).status).toBe(404);
  });
});
