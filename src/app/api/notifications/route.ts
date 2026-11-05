import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.userId))
      .orderBy(desc(notifications.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = Number(body.id);
    await db.update(notifications).set({ isRead: true }).where(
      Number.isInteger(id) && id > 0
        ? and(eq(notifications.userId, session.userId), eq(notifications.id, id))
        : eq(notifications.userId, session.userId)
    );

    return NextResponse.json({ message: "Notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
