import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

async function createSuperAdmin() {
  // Check if super admin already exists
  const existing = await db.select().from(users).where(eq(users.email, "admin@gradcall.com"));
  if (existing.length > 0) {
    return { alreadyExists: true, message: "Super admin ya existe" };
  }

  const hashedPassword = await hashPassword("Admin123!");

  await db.insert(users).values({
    name: "Super Admin",
    email: "admin@gradcall.com",
    password: hashedPassword,
    role: "super_admin",
  });

  return {
    alreadyExists: false,
    message: "Super admin creado exitosamente",
    credentials: {
      email: "admin@gradcall.com",
      password: "Admin123!",
    },
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
