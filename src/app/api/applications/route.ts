import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, programs, users } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { splitApplicantName } from "@/lib/applicant-profile";

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
        .where(ne(applications.status, 'draft'))
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
        .where(and(eq(programs.universityId, session.user.universityId), ne(applications.status, 'draft')))
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
    const today = new Date();
    const localDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    const [program] = await db.select().from(programs).where(eq(programs.id, programId)).limit(1);
    if (!program) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    if (program.status !== "published") {
      return NextResponse.json({ error: "El programa no está disponible para postulaciones" }, { status: 400 });
    }

    const openDay = program.openDate ? new Date(Date.UTC(program.openDate.getUTCFullYear(), program.openDate.getUTCMonth(), program.openDate.getUTCDate())) : null;
    const closeDay = program.deadlineDate ? new Date(Date.UTC(program.deadlineDate.getUTCFullYear(), program.deadlineDate.getUTCMonth(), program.deadlineDate.getUTCDate())) : null;
    if (openDay && localDay < openDay) {
      return NextResponse.json({ error: "Las postulaciones aún no han abierto" }, { status: 400 });
    }
    if (closeDay && localDay > closeDay) {
      return NextResponse.json({ error: "El plazo de postulaciones ha cerrado" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.programId, programId), eq(applications.userId, session.userId)))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes una postulación para este programa", applicationId: existing.id, status: existing.status },
        { status: 409 }
      );
    }


    const [owner] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, session.userId));
    if (!owner) return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
    const identity = splitApplicantName(owner.name);

    const [newApp] = await db.insert(applications).values({
      programId, userId: session.userId, ...identity, email: owner.email, status: "draft",
    }).returning();

    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    console.error("Create application error:", error);
    const message = error instanceof Error ? error.message : "Error al crear aplicación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
