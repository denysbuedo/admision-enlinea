import { db } from '@/db';
import { users, universities, applications, documents, notifications, statusHistory, institutionalReviews, programs } from '@/db/schema';
import { and, eq, or, sql } from 'drizzle-orm';
import { z } from 'zod';

export class ManagementError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const userEdit = z.object({
  name: z.string().trim().min(2).max(150), email: z.string().trim().email().max(254),
  role: z.enum(['aspirant', 'university', 'super_admin']), isActive: z.boolean(),
  universityId: z.number().int().positive().safe().nullable(), note: z.string().trim().max(1000).optional(),
}).strict();
export const universityEdit = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  country: z.string().trim().max(100).nullable().optional(), city: z.string().trim().max(100).nullable().optional(),
  faculty: z.string().trim().max(200).nullable().optional(), description: z.string().trim().max(5000).nullable().optional(),
  website: z.union([z.literal(''), z.string().url().max(500).refine(value => /^https?:\/\//i.test(value))]).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict().refine(value => Object.keys(value).length > 0);
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
async function actor(tx: Tx, id: number) {
  const [user] = await tx.select().from(users).where(eq(users.id, id));
  if (!user?.isActive || user.role !== 'super_admin') throw new ManagementError(403, 'No autorizado');
}
async function protectAdmin(tx: Tx, id: number, actorId: number) {
  if (id === actorId) throw new ManagementError(409, 'No puedes eliminar, desactivar ni quitar el rol de tu propia cuenta administrativa');
  const admins = await tx.select({ id: users.id }).from(users).where(and(eq(users.role, 'super_admin'), eq(users.isActive, true)));
  if (admins.length <= 1 && admins.some(user => user.id === id)) throw new ManagementError(409, 'Debe quedar al menos un administrador activo');
}
export async function editUser(id: number, actorId: number, input: z.infer<typeof userEdit>) {
  await db.transaction(async tx => {
    await actor(tx, actorId);
    const [existing] = await tx.select().from(users).where(eq(users.id, id));
    if (!existing) throw new ManagementError(404, 'Usuario no encontrado');
    if (existing.role === 'super_admin' && (input.role !== 'super_admin' || !input.isActive)) await protectAdmin(tx, id, actorId);
    const [duplicate] = await tx.select({ id: users.id }).from(users).where(eq(users.email, input.email));
    if (duplicate && duplicate.id !== id) throw new ManagementError(409, 'El correo ya está registrado');
    let institutionalStatus = existing.institutionalStatus;
    if (input.role === 'university') {
      if (!input.universityId) throw new ManagementError(400, 'Selecciona una universidad');
      const [institution] = await tx.select().from(universities).where(eq(universities.id, input.universityId));
      if (!institution?.isActive) throw new ManagementError(409, 'La universidad debe estar activa');
      if (existing.role !== 'university' || existing.universityId !== input.universityId) {
        if (!input.note || input.note.length < 10) throw new ManagementError(400, 'Justifica la representación institucional con al menos 10 caracteres');
        institutionalStatus = 'approved';
        await tx.insert(institutionalReviews).values({ userId: id, reviewerId: actorId, universityId: input.universityId, decision: 'approved', note: input.note });
      } else if (existing.institutionalStatus !== 'approved' && input.isActive) {
        throw new ManagementError(409, 'Usa la revisión institucional para aprobar esta solicitud');
      }
    } else {
      if (input.universityId !== null) throw new ManagementError(400, 'Este rol no admite una universidad asignada');
      institutionalStatus = 'approved';
    }
    const { note: _note, ...values } = input;
    await tx.update(users).set({ ...values, institutionalStatus, updatedAt: new Date() }).where(eq(users.id, id));
  });
}
export async function deleteUser(id: number, actorId: number) {
  await db.transaction(async tx => {
    await actor(tx, actorId);
    const [user] = await tx.select().from(users).where(eq(users.id, id));
    if (!user) throw new ManagementError(404, 'Usuario no encontrado');
    await protectAdmin(tx, id, actorId);
    const links = [
      await tx.select({ id: applications.id }).from(applications).where(eq(applications.userId, id)).limit(1),
      await tx.select({ id: documents.id }).from(documents).where(eq(documents.userId, id)).limit(1),
      await tx.select({ id: notifications.id }).from(notifications).where(eq(notifications.userId, id)).limit(1),
      await tx.select({ id: statusHistory.id }).from(statusHistory).where(eq(statusHistory.changedBy, id)).limit(1),
      await tx.select({ id: institutionalReviews.id }).from(institutionalReviews).where(or(eq(institutionalReviews.userId, id), eq(institutionalReviews.reviewerId, id))).limit(1),
    ];
    if (links.some(rows => rows.length)) throw new ManagementError(409, 'El usuario tiene datos vinculados. Desactívalo para conservar el historial');
    await tx.delete(users).where(eq(users.id, id));
  });
}
export async function editUniversity(id: number, actorId: number, input: z.infer<typeof universityEdit>) {
  await db.transaction(async tx => {
    await actor(tx, actorId);
    const [old] = await tx.select().from(universities).where(eq(universities.id, id));
    if (!old) throw new ManagementError(404, 'Universidad no encontrada');
    await tx.update(universities).set({ ...input, updatedAt: new Date() }).where(eq(universities.id, id));
    if (old.isActive && input.isActive === false) await tx.update(users).set({ sessionRevision: sql`${users.sessionRevision} + 1` }).where(and(eq(users.universityId, id), eq(users.role, 'university')));
  });
}
export async function deleteUniversity(id: number, actorId: number) {
  await db.transaction(async tx => {
    await actor(tx, actorId);
    const [institution] = await tx.select().from(universities).where(eq(universities.id, id));
    if (!institution) throw new ManagementError(404, 'Universidad no encontrada');
    const links = [await tx.select({ id: programs.id }).from(programs).where(eq(programs.universityId, id)).limit(1),
      await tx.select({ id: users.id }).from(users).where(eq(users.universityId, id)).limit(1),
      await tx.select({ id: institutionalReviews.id }).from(institutionalReviews).where(eq(institutionalReviews.universityId, id)).limit(1)];
    if (links.some(rows => rows.length)) throw new ManagementError(409, 'La universidad tiene usuarios, programas o revisiones. Desactívala para conservarlos');
    await tx.delete(universities).where(eq(universities.id, id));
  });
}
