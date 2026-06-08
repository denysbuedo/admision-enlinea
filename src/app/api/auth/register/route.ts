import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { userRegisterSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm'; // 1. Importar 'eq' de drizzle-orm

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 2. Validar datos con Zod
    const validation = userRegisterSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Errores de validación:', validation.error.flatten());
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    // 3. Verificar si el usuario ya existe usando 'eq' correctamente
    // Esta es la corrección clave
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      console.log('Usuario existente encontrado:', existingUser[0].email);
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // 4. Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Determinar el rol (asegurarse de que sea válido para el schema)
    // El schema acepta: 'super_admin', 'university', 'aspirant'
    // Si viene undefined, usamos 'aspirant' por defecto, NO 'student'
    const finalRole = role || 'aspirant';

    // 6. Insertar en DB
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      // Si es universidad, podrías necesitar guardar el nombre aquí o en otra tabla
      // universityName no está en la tabla users según tu schema, así que lo ignoramos o lo manejamos después
    }).returning();

    // 7. Responder sin enviar la contraseña
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}