import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, universities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = "aspirant", universityName } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    let universityId: number | undefined;

    // If registering as university, create university record
    if (role === "university" && universityName) {
      const [uni] = await db.insert(universities).values({
        name: universityName,
      }).returning();
      universityId = uni.id;
    }

    const [user] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role,
      universityId: universityId ?? null,
    }).returning();

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      universityId: user.universityId,
    });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      message: "Registro exitoso",
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
    console.error("Register error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
