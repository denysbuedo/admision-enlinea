import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, universities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [program] = await db
      .select({
        id: programs.id,
        title: programs.title,
        programType: programs.programType,
        modality: programs.modality,
        duration: programs.duration,
        language: programs.language,
        location: programs.location,
        credits: programs.credits,
        description: programs.description,
        openDate: programs.openDate,
        deadlineDate: programs.deadlineDate,
        resultsDate: programs.resultsDate,
        startDate: programs.startDate,
        minDegree: programs.minDegree,
        minGpa: programs.minGpa,
        professionalExperience: programs.professionalExperience,
        languageRequirements: programs.languageRequirements,
        eligibilityNotes: programs.eligibilityNotes,
        requiredDocuments: programs.requiredDocuments,
        totalCost: programs.totalCost,
        currency: programs.currency,
        paymentMethods: programs.paymentMethods,
        scholarshipsAvailable: programs.scholarshipsAvailable,
        scholarshipsInfo: programs.scholarshipsInfo,
        refundPolicy: programs.refundPolicy,
        selectionProcess: programs.selectionProcess,
        hasInterview: programs.hasInterview,
        hasExam: programs.hasExam,
        privacyPolicy: programs.privacyPolicy,
        termsConditions: programs.termsConditions,
        status: programs.status,
        universityId: programs.universityId,
        universityName: universities.name,
        universityCountry: universities.country,
        universityCity: universities.city,
        universityWebsite: universities.website,
        createdAt: programs.createdAt,
      })
      .from(programs)
      .leftJoin(universities, eq(programs.universityId, universities.id))
      .where(eq(programs.id, parseInt(id)));

    if (!program) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Get program error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const [existing] = await db.select().from(programs).where(eq(programs.id, parseInt(id)));
    if (!existing) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    if (session.role === "university" && existing.universityId !== session.universityId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Super admin can approve/reject
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.status !== undefined) updateData.status = body.status;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.programType !== undefined) updateData.programType = body.programType;
    if (body.modality !== undefined) updateData.modality = body.modality;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.language !== undefined) updateData.language = body.language;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.credits !== undefined) updateData.credits = body.credits;
    if (body.openDate !== undefined) updateData.openDate = body.openDate ? new Date(body.openDate) : null;
    if (body.deadlineDate !== undefined) updateData.deadlineDate = body.deadlineDate ? new Date(body.deadlineDate) : null;
    if (body.resultsDate !== undefined) updateData.resultsDate = body.resultsDate ? new Date(body.resultsDate) : null;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.totalCost !== undefined) updateData.totalCost = body.totalCost;
    if (body.scholarshipsAvailable !== undefined) updateData.scholarshipsAvailable = body.scholarshipsAvailable;

    const [updated] = await db.update(programs).set(updateData).where(eq(programs.id, parseInt(id))).returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update program error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(programs).where(eq(programs.id, parseInt(id)));

    return NextResponse.json({ message: "Programa eliminado" });
  } catch (error) {
    console.error("Delete program error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
