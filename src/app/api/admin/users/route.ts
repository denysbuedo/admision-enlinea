import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, universities } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

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