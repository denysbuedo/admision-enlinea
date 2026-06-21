import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, universities } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    // Construir consulta base con join
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
        createdAt: programs.createdAt,
      })
      .from(programs)
      .leftJoin(universities, eq(programs.universityId, universities.id))
      .orderBy(desc(programs.createdAt));

    const results = await query;

    // Filtrado por roles si es necesario (ejemplo básico)
    let filtered = results;

    if (session?.user.role === 'university') {
      filtered = results.filter(p => p.universityId === session.user.universityId);
    } else if (session?.user.role === 'aspirant') {
      // Aspirantes solo ven programas publicados
      filtered = results.filter(p => p.status === 'published');
    }
    // Super admin ve todo

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Get programs error:", error);
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}

// Helper: convierte string de fecha a Date o null
function toDate(val: unknown): Date | null {
  if (!val || val === "") return null;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'university' && session.user.role !== 'super_admin')) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();

    // Validar que la universidad tenga ID si es rol university
    const universityId = session.user.role === "university"
      ? session.user.universityId
      : body.universityId;

    if (!universityId) {
      return NextResponse.json({ error: "Universidad no válida" }, { status: 400 });
    }

    if (!body.title || !body.programType || !body.modality) {
      return NextResponse.json({ error: "Faltan campos obligatorios: title, programType, modality" }, { status: 400 });
    }

    const [newProgram] = await db.insert(programs).values({
      universityId,
      title:                  body.title,
      programType:            body.programType,
      modality:               body.modality,
      duration:               body.duration               ?? null,
      language:               body.language               ?? "Español",
      location:               body.location               ?? null,
      credits:                body.credits != null ? Number(body.credits) : null,
      description:            body.description            ?? null,
      // Fechas: convertir string → Date
      openDate:               toDate(body.openDate),
      deadlineDate:           toDate(body.deadlineDate),
      resultsDate:            toDate(body.resultsDate),
      startDate:              toDate(body.startDate),
      // Elegibilidad
      minDegree:              body.minDegree              ?? null,
      minGpa:                 body.minGpa != null ? Number(body.minGpa) : null,
      professionalExperience: body.professionalExperience ?? null,
      languageRequirements:   body.languageRequirements   ?? null,
      eligibilityNotes:       body.eligibilityNotes       ?? null,
      // Documentos requeridos: array → JSON string
      requiredDocuments: Array.isArray(body.requiredDocuments)
        ? JSON.stringify(body.requiredDocuments)
        : body.requiredDocuments ?? null,
      // Financiero
      totalCost:              body.totalCost != null ? Number(body.totalCost) : null,
      currency:               body.currency               ?? "USD",
      paymentMethods:         body.paymentMethods         ?? null,
      scholarshipsAvailable:  body.scholarshipsAvailable  ?? false,
      scholarshipsInfo:       body.scholarshipsInfo        ?? null,
      refundPolicy:           body.refundPolicy           ?? null,
      // Proceso de selección
      selectionProcess:       body.selectionProcess       ?? null,
      hasInterview:           body.hasInterview            ?? false,
      hasExam:                body.hasExam                ?? false,
      // Legal
      privacyPolicy:          body.privacyPolicy          ?? null,
      termsConditions:        body.termsConditions        ?? null,
      // Estado
      status: "pending_approval",
    }).returning();

    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    console.error("Create program error:", error);
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}