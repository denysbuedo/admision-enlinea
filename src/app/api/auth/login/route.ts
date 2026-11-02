import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, universities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    if (user.role === 'university' && user.institutionalStatus !== 'approved') {
      return NextResponse.json({ error: user.institutionalStatus === 'rejected' ? 'La solicitud institucional fue rechazada. Contacta con la administración' : 'Tu cuenta institucional está pendiente de aprobación administrativa' }, { status: 403 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Cuenta desactivada" }, { status: 401 });
    }

    if (user.role === 'university') {
      const [institution] = user.universityId ? await db.select().from(universities).where(eq(universities.id, user.universityId)) : [];
      if (!institution?.isActive) return NextResponse.json({ error: 'La universidad no está habilitada' }, { status: 403 });
    }
    const token = signToken(user);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, universityId: user.universityId },
      message: "Inicio de sesión exitoso",
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
