import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "university" && session.role !== "super_admin")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const statusFilter = searchParams.get("status");

    const [program] = await db.select().from(programs).where(eq(programs.id, parseInt(id)));
    if (!program) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    let appQuery = db.select().from(applications).where(eq(applications.programId, parseInt(id)));
    const allApps = await appQuery;

    const filtered = statusFilter ? allApps.filter(a => a.status === statusFilter) : allApps;

    if (format === "csv") {
      const headers = [
        "ID", "Nombre", "Apellido", "Email", "Teléfono", "Nacionalidad",
        "Documento", "Ciudad", "País", "Estado", "Puntaje", "Fecha Envío"
      ];

      const rows = filtered.map(app => [
        app.id,
        app.firstName || "",
        app.lastName || "",
        app.email || "",
        app.phone || "",
        app.nationality || "",
        app.documentNumber || "",
        app.city || "",
        app.country || "",
        app.status,
        app.score || "",
        app.submittedAt ? new Date(app.submittedAt).toLocaleDateString("es-ES") : "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="solicitudes-${program.title.replace(/\s+/g, "-")}.csv"`,
        },
      });
    }

    // JSON format
    return NextResponse.json({
      program: program.title,
      exportDate: new Date().toISOString(),
      totalApplications: filtered.length,
      applications: filtered.map(app => ({
        id: app.id,
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        phone: app.phone,
        nationality: app.nationality,
        documentNumber: app.documentNumber,
        city: app.city,
        country: app.country,
        status: app.status,
        score: app.score,
        submittedAt: app.submittedAt,
        academicInfo: app.academicInfo ? JSON.parse(app.academicInfo) : null,
        professionalExperience: app.professionalExperience ? JSON.parse(app.professionalExperience) : null,
      })),
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
