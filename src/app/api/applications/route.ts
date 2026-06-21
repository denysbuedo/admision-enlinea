import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, programs } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    let results;

    if (session.user.role === "super_admin") {
      results = await db
        .select({
          id: applications.id,
          status: applications.status,
          submittedAt: applications.submittedAt,
          createdAt: applications.createdAt,
          programId: applications.programId,
          programTitle: programs.title,
          firstName: applications.firstName,
          lastName: applications.lastName,
          email: applications.email,
          score: applications.score,
        })
        .from(applications)
        .leftJoin(programs, eq(applications.programId, programs.id))
        .orderBy(desc(applications.createdAt));
    } else if (session.user.role === "university" && session.user.universityId) {
      results = await db
        .select({
          id: applications.id,
          status: applications.status,
          submittedAt: applications.submittedAt,
          createdAt: applications.createdAt,
          programId: applications.programId,
          programTitle: programs.title,
          firstName: applications.firstName,
          lastName: applications.lastName,
          email: applications.email,
          score: applications.score,
        })
        .from(applications)
        .leftJoin(programs, eq(applications.programId, programs.id))
        .where(eq(programs.universityId, session.user.universityId))
        .orderBy(desc(applications.createdAt));
    } else {
      results = await db
        .select({
          id: applications.id,
          status: applications.status,
          submittedAt: applications.submittedAt,
          createdAt: applications.createdAt,
          programId: applications.programId,
          programTitle: programs.title,
          firstName: applications.firstName,
          lastName: applications.lastName,
          email: applications.email,
          score: applications.score,
        })
        .from(applications)
        .leftJoin(programs, eq(applications.programId, programs.id))
        .where(eq(applications.userId, session.userId))
        .orderBy(desc(applications.createdAt));
    }

    return NextResponse.json(results || []);
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "aspirant") {
      return NextResponse.json({ error: "Solo los aspirantes pueden postularse" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.programId || isNaN(Number(body.programId))) {
      return NextResponse.json({ error: "programId inválido" }, { status: 400 });
    }

    const programId = Number(body.programId);

    const [program] = await db.select().from(programs).where(eq(programs.id, programId)).limit(1);
    if (!program) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    if (program.status !== "published") {
      return NextResponse.json({ error: "El programa no está disponible para postulaciones" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.programId, programId), eq(applications.userId, session.userId)))
      .limit(1);

    console.log("[DuplicateCheck] userId:", session.userId, "programId:", programId, "duplicate:", existing?.id ?? "none");

    if (existing) {
      return NextResponse.json(
        { error: "Ya te has postulado a este programa", detail: existing.id },
        { status: 409 }
      );
    }

    const [newApp] = await db
      .insert(applications)
      .values({
        programId,
        userId: session.userId,
        status: "draft",
      })
      .returning();

    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    console.error("Create application error:", error);
    const message = error instanceof Error ? error.message : "Error al crear aplicación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}