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
import { users, universities, programs, applications, institutionalReviews } from '@/db/schema';
import { PATCH as edit, DELETE as remove } from '@/app/api/admin/users/[id]/route';
import { PATCH as editInstitution, DELETE as removeInstitution } from '@/app/api/admin/universities/[id]/route';
import { PATCH as legacyEditInstitution } from '@/app/api/admin/universities/route';
import { NextRequest } from 'next/server';
import { signToken, verifyToken } from './auth';
import { eq } from 'drizzle-orm';
let adminToken: string;
beforeAll(async () => { await migrate(db, { migrationsFolder: './drizzle' }); });
afterAll(() => { isolated.client?.close(); isolated.cleanup(); vi.unstubAllEnvs(); });
beforeEach(async () => {
  vi.stubEnv('JWT_SECRET', 'isolated-admin-management-secret-at-least32');
  await db.delete(institutionalReviews); await db.delete(applications); await db.delete(programs); await db.delete(users); await db.delete(universities);
  await db.insert(universities).values([{ id: 1, name: 'Institution A' }, { id: 2, name: 'Institution B' }]);
  await db.insert(users).values([
    { id: 1, name: 'Owner', email: 'owner@example.invalid', role: 'super_admin', password: 'unused' },
    { id: 2, name: 'Other admin', email: 'other@example.invalid', role: 'super_admin', password: 'unused' },
    { id: 3, name: 'Applicant', email: 'applicant@example.invalid', password: 'unused' },
    { id: 4, name: 'Institution', email: 'institution@example.invalid', role: 'university', universityId: 1, password: 'unused' },
  ]);
  const [admin] = await db.select().from(users).where(eq(users.id, 1)); adminToken = signToken(admin); isolated.token = adminToken;
});
const profile = { name: 'Changed', email: 'changed@example.invalid', role: 'aspirant', isActive: true, universityId: null };
function call(kind: 'users' | 'universities', id: string, body?: unknown) {
  const request = new Request(`http://localhost/api/admin/${kind}/${id}`, { method: body === undefined ? 'DELETE' : 'PATCH', ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return (kind === 'users' ? body === undefined ? remove : edit : body === undefined ? removeInstitution : editInstitution)(request, { params: Promise.resolve({ id }) });
}
async function state() { return { users: await db.select().from(users), institutions: await db.select().from(universities), reviews: await db.select().from(institutionalReviews) }; }
describe('Administrative management safeguards', () => {
  it.each(['users','universities'] as const)('rejects anonymous and non-admin mutations of %s', async kind => {
    const before = await state(); isolated.token = undefined;
    expect((await call(kind,'3')).status).toBe(401);
    const [applicant] = await db.select().from(users).where(eq(users.id,3)); isolated.token = signToken(applicant);
    expect((await call(kind,'3',kind === 'users' ? profile : { name: 'Changed' })).status).toBe(403);
    expect(await state()).toEqual(before);
  });
  it('edits account details, promotes/demotes other users and revokes their previous sessions', async () => {
    const [user] = await db.select().from(users).where(eq(users.id,3)); const token = signToken(user);
    expect((await call('users','3',{ ...profile, role:'super_admin' })).status).toBe(200);
    expect(await verifyToken(token)).toBeNull();
    expect((await call('users','3',profile)).status).toBe(200);
    expect((await db.select().from(users).where(eq(users.id,3)))[0]).toMatchObject(profile);
  });
  it('blocks self-delete, self-demotion and self-deactivation atomically', async () => {
    const before = await state();
    expect((await call('users','1')).status).toBe(409);
    expect((await call('users','1',profile)).status).toBe(409);
    expect((await call('users','1',{ ...profile, role:'super_admin', isActive:false })).status).toBe(409);
    expect(await state()).toEqual(before);
  });
  it('retains an active administrator after another administrator is removed', async () => {
    expect((await call('users','2')).status).toBe(200);
    expect((await call('users','1')).status).toBe(409);
    expect((await db.select().from(users).where(eq(users.role,'super_admin'))).map(user=>user.id)).toEqual([1]);
  });
  it('requires valid institution and verification note when assigning representation, and audits it', async () => {
    const body={ ...profile, role:'university', universityId:2 };
    expect((await call('users','3',body)).status).toBe(400);
    expect((await call('users','3',{ ...body, universityId:999,note:'Verified synthetic representation' })).status).toBe(409);
    expect((await call('users','3',{ ...body, note:'Verified synthetic representation' })).status).toBe(200);
    expect(await db.select().from(institutionalReviews)).toMatchObject([{userId:3,universityId:2,reviewerId:1,decision:'approved'}]);
    expect((await call('universities','2')).status).toBe(409);
  });
  it('does not bypass pending institutional approval via activation', async () => {
    await db.update(users).set({ institutionalStatus:'pending',isActive:false }).where(eq(users.id,4));
    expect((await call('users','4',{...profile,role:'university',universityId:1})).status).toBe(409);
  });
  it('blocks deletion of linked users and allows deactivation instead', async () => {
    await db.insert(programs).values({id:1,universityId:1,title:'Test',programType:'curso',modality:'virtual'});
    await db.insert(applications).values({programId:1,userId:3});
    expect((await call('users','3')).status).toBe(409);
    expect((await call('users','3',{...profile,isActive:false})).status).toBe(200);
    expect(await db.select().from(applications)).toHaveLength(1);
  });
  it('edits universities and permanently revokes mapped sessions on deactivation, including legacy endpoint', async () => {
    const [user]=await db.select().from(users).where(eq(users.id,4));const token=signToken(user);
    expect((await call('universities','1',{name:'Renamed',isActive:false})).status).toBe(200);
    expect(await verifyToken(token)).toBeNull();
    const result=await legacyEditInstitution(new NextRequest('http://localhost/api/admin/universities',{method:'PATCH',body:JSON.stringify({id:1,isActive:true})}));
    expect(result.status).toBe(200);expect(await verifyToken(token)).toBeNull();
    expect((await db.select().from(users).where(eq(users.id,4)))[0].sessionRevision).toBe(1);
  });
  it('deletes only unlinked universities; blocks linked ones', async () => {
    expect((await call('universities','1')).status).toBe(409);
    expect((await call('universities','2')).status).toBe(200);
    expect((await call('universities','999')).status).toBe(404);
  });
  it.each([{...profile,role:'owner'}, {...profile,password:'attempt'}, {...profile,email:'bad'}, {...profile,universityId:2}])('rejects invalid or incompatible user edit %j', async body => {
    const before=await state();expect((await call('users','3',body)).status).toBe(400);expect(await state()).toEqual(before);
  });
  it.each(['0','1abc','9007199254740992'])('rejects invalid identifier %s', async id => {expect((await call('users',id)).status).toBe(400);});
  it('rejects unsafe website and unknown university fields', async () => {
    expect((await call('universities','2',{website:'javascript:alert(1)'})).status).toBe(400);
    expect((await call('universities','2',{password:'attempt'})).status).toBe(400);
  });
});
