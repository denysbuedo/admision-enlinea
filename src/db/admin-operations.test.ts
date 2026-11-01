// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { migrate } from 'drizzle-orm/libsql/migrator';
import bcrypt from 'bcryptjs';

const isolated = vi.hoisted(() => ({ client: null as import('@libsql/client').Client | null, cleanup: () => {} }));

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

import { db } from '@/db';
import { users } from './schema';
import { initializeAdmin, resetAdminPassword } from './admin-operations';
import { validateOperatorDatabase } from './admin-cli';
import { signToken, verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';
const email = 'admin@example.invalid';
const password = 'synthetic-admin-password';
beforeAll(async () => { await migrate(db, { migrationsFolder: './drizzle' }); });
beforeEach(async () => { await db.delete(users); vi.stubEnv('JWT_SECRET', 'isolated-administrator-test-secret-with-32-bytes'); });
afterAll(() => { isolated.client?.close(); isolated.cleanup(); vi.unstubAllEnvs(); });
describe('Operator administrator commands', () => {
  it('creates only the initial administrator with a hashed password', async () => {
    await initializeAdmin(db, email, password);
    const rows = await db.select().from(users);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email, role: 'super_admin', isActive: true, universityId: null });
    expect(await bcrypt.compare(password, rows[0].password)).toBe(true);
  });
  it.each([true, false])('refuses another initialization even when existing admin isActive=%s', async isActive => {
    await db.insert(users).values({ name: 'Existing', email: 'other@example.invalid', password: 'untouched', role: 'super_admin', isActive });
    const before = await db.select().from(users);
    await expect(initializeAdmin(db, email, password)).rejects.toThrow('Ya existe');
    expect(await db.select().from(users)).toEqual(before);
  });
  it('refuses repeated initialization without resetting the password', async () => {
    await initializeAdmin(db, email, password);
    const before = await db.select().from(users);
    await expect(initializeAdmin(db, email, 'different-password')).rejects.toThrow();
    expect(await db.select().from(users)).toEqual(before);
  });
  it('does not promote or reset a non-administrative account occupying the email', async () => {
    await db.insert(users).values({ name: 'Aspirant', email, password: 'untouched', role: 'aspirant' });
    const before = await db.select().from(users);
    await expect(initializeAdmin(db, email, password)).rejects.toThrow('ocupado');
    await expect(resetAdminPassword(db, email, password)).rejects.toThrow('No existe');
    expect(await db.select().from(users)).toEqual(before);
  });
  it.each(['', 'short', 'x'.repeat(73), 'á'.repeat(37)])('rejects invalid password length without writing: %s', async value => {
    await expect(initializeAdmin(db, email, value)).rejects.toThrow();
    await expect(resetAdminPassword(db, email, value)).rejects.toThrow();
    expect(await db.select().from(users)).toEqual([]);
  });
  it('rejects malformed email and missing administrator without writing', async () => {
    await expect(initializeAdmin(db, 'invalid', password)).rejects.toThrow('ADMIN_EMAIL');
    await expect(resetAdminPassword(db, email, password)).rejects.toThrow('No existe');
    expect(await db.select().from(users)).toEqual([]);
  });
  it('resets only the selected administrator and invalidates its existing JWT', async () => {
    await initializeAdmin(db, email, password);
    const [admin] = await db.select().from(users);
    const token = signToken(admin);
    expect(await verifyToken(token)).not.toBeNull();
    await db.insert(users).values({ name: 'Other', email: 'other@example.invalid', password: 'untouched', role: 'super_admin' });
    await resetAdminPassword(db, email, 'new-synthetic-password');
    const rows = await db.select().from(users);
    const changed = rows.find(row => row.email === email)!;
    expect(await bcrypt.compare('new-synthetic-password', changed.password)).toBe(true);
    expect(await bcrypt.compare(password, changed.password)).toBe(false);
    expect(changed).toMatchObject({ role: admin.role, isActive: admin.isActive, universityId: admin.universityId });
    expect(rows.find(row => row.email !== email)?.password).toBe('untouched');
    expect(await verifyToken(token)).toBeNull();
    expect(await verifyToken(signToken(changed))).not.toBeNull();
  });
  it('does not reactivate disabled administrators', async () => {
    await initializeAdmin(db, email, password);
    await db.update(users).set({ isActive: false }).where(eq(users.email, email));
    await resetAdminPassword(db, email, 'new-synthetic-password');
    expect((await db.select().from(users))[0].isActive).toBe(false);
  });
  it.each([undefined, '', 'file:sqlite.db', 'file::memory:', 'https://database.invalid', 'file:/nonexistent/convoca-operator.db'])('requires an explicit existing local database: %s', url => {
    expect(() => validateOperatorDatabase(url)).toThrow();
  });
});
