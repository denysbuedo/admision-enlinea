import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { universities } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const results = await db
      .select()
      .from(universities)
      .orderBy(desc(universities.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { name, country, city, faculty, website, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre de la universidad es requerido' }, { status: 400 });
    }

    const [newUniversity] = await db
      .insert(universities)
      .values({
        name: name.trim(),
        country: country?.trim() || null,
        city: city?.trim() || null,
        faculty: faculty?.trim() || null,
        website: website?.trim() || null,
        description: description?.trim() || null,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newUniversity, { status: 201 });
  } catch (error) {
    console.error('Error creating university:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await db
      .update(universities)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(universities.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating university:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
