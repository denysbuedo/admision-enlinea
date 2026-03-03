import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, universities } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const session = await getSession();

    let query = db
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
        totalCost: programs.totalCost,
        currency: programs.currency,
        scholarshipsAvailable: programs.scholarshipsAvailable,
        status: programs.status,
        universityId: programs.universityId,
        universityName: universities.name,
        universityCountry: universities.country,
        createdAt: programs.createdAt,
      })
      .from(programs)
      .leftJoin(universities, eq(programs.universityId, universities.id))
      .orderBy(desc(programs.createdAt));

    const results = await query;

    let filtered = results;

    // Filter by status
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    } else if (!session || session.role === "aspirant") {
      // Public: only show published programs
      filtered = filtered.filter(p => p.status === "published");
    } else if (session.role === "university") {
      // University: show their own programs
      filtered = filtered.filter(p => p.universityId === session.universityId);
    }

    // Filter by type
    if (type) {
      filtered = filtered.filter(p => p.programType === type);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Get programs error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "university" && session.role !== "super_admin")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const universityId = session.role === "university" ? session.universityId! : body.universityId;

    const [program] = await db.insert(programs).values({
      universityId,
      title: body.title,
      programType: body.programType,
      modality: body.modality,
      duration: body.duration,
      language: body.language || "Español",
      location: body.location,
      credits: body.credits,
      description: body.description,
      openDate: body.openDate ? new Date(body.openDate) : null,
      deadlineDate: body.deadlineDate ? new Date(body.deadlineDate) : null,
      resultsDate: body.resultsDate ? new Date(body.resultsDate) : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      minDegree: body.minDegree,
      minGpa: body.minGpa,
      professionalExperience: body.professionalExperience,
      languageRequirements: body.languageRequirements,
      eligibilityNotes: body.eligibilityNotes,
      requiredDocuments: body.requiredDocuments ? JSON.stringify(body.requiredDocuments) : null,
      totalCost: body.totalCost,
      currency: body.currency || "USD",
      paymentMethods: body.paymentMethods,
      scholarshipsAvailable: body.scholarshipsAvailable || false,
      scholarshipsInfo: body.scholarshipsInfo,
      refundPolicy: body.refundPolicy,
      selectionProcess: body.selectionProcess,
      hasInterview: body.hasInterview || false,
      hasExam: body.hasExam || false,
      privacyPolicy: body.privacyPolicy,
      termsConditions: body.termsConditions,
      status: "pending_approval",
    }).returning();

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Create program error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
