import { NextResponse, NextRequest } from 'next/server';
import { POST as createUniversity } from '@/app/api/admin/universities/route';
import { db } from '@/db';
import { universities } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Listar universidades (Público para el formulario de registro, o protegido si prefieres)
export async function GET() {
  try {
    // Opcional: Proteger si solo quieres que usuarios logueados vean la lista
    // const session = await getSession();
    // if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const list = await db
      .select({
        id: universities.id,
        name: universities.name,
        country: universities.country,
        acronym: universities.faculty,
        website: universities.website,
      })
      .from(universities)
      .where(eq(universities.isActive, true))
      .orderBy(universities.name);
    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ error: 'Error al obtener universidades' }, { status: 500 });
  }
}

// POST: Crear universidad (Solo Super Admin)
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  return createUniversity(new NextRequest(request.url, { method: 'POST', headers: request.headers,
    body: JSON.stringify({ name: body.name, country: body.country, city: body.city, faculty: body.faculty ?? body.acronym,
      website: body.website, description: body.description }) }));
}
