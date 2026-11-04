import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, universities, institutionalReviews } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const results = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        institutionalStatus: users.institutionalStatus,
        universityId: users.universityId,
        universityName: universities.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(universities, eq(users.universityId, universities.id))
      .orderBy(desc(users.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

const reviewSchema = z.object({
  userId: z.number().int().positive().safe(),
  decision: z.enum(['approved', 'rejected']),
  note: z.string().trim().min(10).max(1000),
}).strict();

class ReviewError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.role !== 'super_admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Indique usuario, decisión y una justificación de 10 a 1000 caracteres' }, { status: 400 });
    const { userId, decision, note } = parsed.data;
    await db.transaction(async tx => {
      const [account] = await tx.select().from(users).where(eq(users.id, userId));
      if (!account) throw new ReviewError(404, 'Cuenta no encontrada');
      if (account.role !== 'university' || account.institutionalStatus !== 'pending' || !account.universityId) {
        throw new ReviewError(409, 'La cuenta no tiene una solicitud institucional pendiente');
      }
      const [university] = await tx.select().from(universities).where(eq(universities.id, account.universityId));
      if (decision === 'approved' && !university?.isActive) throw new ReviewError(409, 'La universidad no está activa');
      await tx.update(users).set({ institutionalStatus: decision, isActive: decision === 'approved', updatedAt: new Date() })
        .where(and(eq(users.id, userId), eq(users.institutionalStatus, 'pending')));
      await tx.insert(institutionalReviews).values({ userId, reviewerId: session.userId,
        universityId: account.universityId, decision, note });
    });
    return NextResponse.json({ userId, institutionalStatus: decision });
  } catch (error) {
    if (error instanceof ReviewError) return NextResponse.json({ error: error.message }, { status: error.status });
    const reference = randomUUID();
    const details = error && typeof error === 'object' ? error as { code?: unknown; errno?: unknown } : {};
    const code = typeof details.code === 'string' && /^[A-Z0-9_]+$/.test(details.code) ? details.code : undefined;
    const errno = typeof details.errno === 'number' ? details.errno : undefined;
    console.error('Institutional review failed', {
      reference,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      code,
      errno,
    });
    return NextResponse.json({ error: 'No se pudo guardar la revisión', reference }, { status: 500 });
  }
}
