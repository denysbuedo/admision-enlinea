import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, programs, users, notifications, statusHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");

    let results;

    if (session.role === "aspirant") {
      // Aspirants see their own applications
      results = await db
        .select({
          id: applications.id,
          status: applications.status,
          submittedAt: applications.submittedAt,
          createdAt: applications.createdAt,
          programId: applications.programId,
          programTitle: programs.title,
          programType: programs.programType,
          universityId: programs.universityId,
          score: applications.score,
          reviewNotes: applications.reviewNotes,
        })
        .from(applications)
        .leftJoin(programs, eq(applications.programId, programs.id))
        .where(eq(applications.userId, session.userId))
        .orderBy(desc(applications.createdAt));
    } else if (session.role === "university") {
      // Universities see applications for their programs
      const uniPrograms = await db
        .select({ id: programs.id })
        .from(programs)
        .where(eq(programs.universityId, session.universityId!));

      const programIds = uniPrograms.map(p => p.id);

      if (programIds.length === 0) {
        return NextResponse.json([]);
      }

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
          reviewNotes: applications.reviewNotes,
        })
        .from(applications)
        .leftJoin(programs, eq(applications.programId, programs.id))
        .where(programId ? eq(applications.programId, parseInt(programId)) : eq(programs.universityId, session.universityId!))
        .orderBy(desc(applications.createdAt));
    } else {
      // Super admin sees all
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
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "aspirant") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Check if program exists and is published
    const [program] = await db.select().from(programs).where(eq(programs.id, body.programId));
    if (!program) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }
    if (program.status !== "published") {
      return NextResponse.json({ error: "El programa no está disponible para postulaciones" }, { status: 400 });
    }

    // Check deadline
    if (program.deadlineDate && new Date() > program.deadlineDate) {
      return NextResponse.json({ error: "La fecha límite de postulación ha pasado" }, { status: 400 });
    }

    // Check if already applied
    const existing = await db
      .select()
      .from(applications)
      .where(eq(applications.programId, body.programId));

    const alreadyApplied = existing.find(a => a.userId === session.userId);
    if (alreadyApplied) {
      return NextResponse.json({ error: "Ya tienes una solicitud para este programa" }, { status: 400 });
    }

    const [application] = await db.insert(applications).values({
      programId: body.programId,
      userId: session.userId,
      status: "draft",
    }).returning();

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Create application error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
