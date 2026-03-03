import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, universities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const results = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        universityId: users.universityId,
        universityName: universities.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(universities, eq(users.universityId, universities.id))
      .orderBy(desc(users.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
