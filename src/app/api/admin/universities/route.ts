import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { universities } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc } from 'drizzle-orm';
import { universityEdit } from '@/lib/admin-management';
import { manage } from '@/lib/admin-management-route';

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

    const parsed = universityEdit.safeParse(await req.json().catch(() => null));
    if (!parsed.success || !parsed.data.name) return NextResponse.json({ error: 'Revisa los datos de la universidad' }, { status: 400 });
    const { name, country, city, faculty, website, description } = parsed.data;

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
  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (!Number.isSafeInteger(id) || id <= 0) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  const { id: _id, ...input } = body;
  return manage(new Request(req.url, { method: 'PATCH', headers: req.headers, body: JSON.stringify(input) }), Promise.resolve({ id: String(id) }), 'universities', 'PATCH');
}
