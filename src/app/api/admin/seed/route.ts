import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

const ADMIN_EMAIL = "admin@nexo.com";

async function createSuperAdmin() {
  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL));
  if (existing.length > 0) {
    return { alreadyExists: true, message: "Super admin ya existe" };
  }

  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!initialPassword) {
    throw new Error("ADMIN_INITIAL_PASSWORD no configurada");
  }

  const hashedPassword = await hashPassword(initialPassword);

  await db.insert(users).values({
    name: "Super Admin",
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "super_admin",
  });

  return {
    alreadyExists: false,
    message: "Super admin creado exitosamente",
  };
}

export async function GET() {
  try {
    const result = await createSuperAdmin();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await createSuperAdmin();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
