import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { users } from './schema';

export class AdminOperationError extends Error {}

function validate(email: string, password: string) {
  if (!z.string().email().safeParse(email).success) throw new AdminOperationError('ADMIN_EMAIL inválido');
  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new AdminOperationError('La contraseña debe tener al menos 12 caracteres y como máximo 72 bytes UTF-8');
  }
}

export async function initializeAdmin(db: LibSQLDatabase<typeof import('./schema')>, email: string, password: string) {
  validate(email, password);
  const hash = await bcrypt.hash(password, 10);
  await db.transaction(async tx => {
    const [admin] = await tx.select({ id: users.id }).from(users).where(eq(users.role, 'super_admin')).limit(1);
    if (admin) throw new AdminOperationError('Ya existe un administrador; use el procedimiento de recuperación');
    const [account] = await tx.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (account) throw new AdminOperationError('El correo ya está ocupado; no se modifica ni promueve esa cuenta');
    await tx.insert(users).values({ name: 'Super Admin', email, password: hash, role: 'super_admin' });
  });
}

export async function resetAdminPassword(db: LibSQLDatabase<typeof import('./schema')>, email: string, password: string) {
  validate(email, password);
  const hash = await bcrypt.hash(password, 10);
  const changed = await db.update(users).set({ password: hash, updatedAt: new Date() })
    .where(and(eq(users.email, email), eq(users.role, 'super_admin'))).returning({ id: users.id });
  if (!changed.length) throw new AdminOperationError('No existe un administrador con ese correo; no se crea ni promueve una cuenta');
}
