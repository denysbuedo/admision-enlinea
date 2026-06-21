import { NextResponse } from 'next/server';
import { db } from '@/db';
import { universities } from '@/db/schema';
import { getSession } from '@/lib/auth';
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
      .orderBy(universities.name);
    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ error: 'Error al obtener universidades' }, { status: 500 });
  }
}

// POST: Crear universidad (Solo Super Admin)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado. Solo Super Admin.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, country, acronym, website } = body;

    if (!name) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Verificar duplicados
    const existing = await db.select().from(universities).where(eq(universities.name, name)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Ya existe una universidad con ese nombre' }, { status: 409 });
    }

        const [newUni] = await db.insert(universities).values({
      name,
      country: country || 'Cuba',
      faculty: acronym,
      website,
    }).returning();

    return NextResponse.json(newUni, { status: 201 });
  } catch (error) {
    console.error('Error creating university:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}