import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, universities } from '@/db/schema';
import { userRegisterSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validar datos con Zod
    const validation = userRegisterSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role, universityId } = validation.data;

    // 2. Verificar si el usuario ya existe
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // 3. Validaciones específicas por rol
    let finalUniversityId = null;

    if (role === 'university') {
      if (!universityId) {
        return NextResponse.json(
          { error: 'Debe seleccionar una universidad' },
          { status: 400 }
        );
      }
      // Verificar que la universidad exista
      const uni = await db.select().from(universities).where(eq(universities.id, Number(universityId))).limit(1);
      if (uni.length === 0) {
        return NextResponse.json(
          { error: 'La universidad seleccionada no existe' },
          { status: 400 }
        );
      }
      finalUniversityId = uni[0].id;
    }

    // 4. Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Insertar en DB
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: role || 'aspirant',
      universityId: finalUniversityId,
    }).returning();

    // 6. Responder sin enviar la contraseña
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}