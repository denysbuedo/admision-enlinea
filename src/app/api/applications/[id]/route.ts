import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, programs, notifications, statusHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, parseInt(id)));

    if (!application) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    // Check access
    if (session.role === "aspirant" && application.userId !== session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Get status history
    const history = await db
      .select()
      .from(statusHistory)
      .where(eq(statusHistory.applicationId, parseInt(id)));

    return NextResponse.json({ ...application, history });
  } catch (error) {
    console.error("Get application error:", error);
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

    const [existing] = await db.select().from(applications).where(eq(applications.id, parseInt(id)));
    if (!existing) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    // Check access
    if (session.role === "aspirant" && existing.userId !== session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    // Aspirant can update their own application data
    if (session.role === "aspirant") {
      if (body.firstName !== undefined) updateData.firstName = body.firstName;
      if (body.lastName !== undefined) updateData.lastName = body.lastName;
      if (body.birthDate !== undefined) updateData.birthDate = body.birthDate ? new Date(body.birthDate) : null;
      if (body.nationality !== undefined) updateData.nationality = body.nationality;
      if (body.documentType !== undefined) updateData.documentType = body.documentType;
      if (body.documentNumber !== undefined) updateData.documentNumber = body.documentNumber;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.city !== undefined) updateData.city = body.city;
      if (body.country !== undefined) updateData.country = body.country;
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.academicInfo !== undefined) updateData.academicInfo = JSON.stringify(body.academicInfo);
      if (body.professionalExperience !== undefined) updateData.professionalExperience = JSON.stringify(body.professionalExperience);
      if (body.complementaryInfo !== undefined) updateData.complementaryInfo = JSON.stringify(body.complementaryInfo);
      if (body.declarationAccepted !== undefined) updateData.declarationAccepted = body.declarationAccepted;
      if (body.dataProcessingAccepted !== undefined) updateData.dataProcessingAccepted = body.dataProcessingAccepted;
      if (body.digitalSignature !== undefined) updateData.digitalSignature = body.digitalSignature;

      // Submit application
      if (body.status === "submitted" && existing.status === "draft") {
        updateData.status = "submitted";
        updateData.submittedAt = new Date();

        // Create notification
        await db.insert(notifications).values({
          userId: session.userId,
          applicationId: parseInt(id),
          type: "application_submitted",
          title: "Solicitud enviada",
          message: "Tu solicitud ha sido enviada exitosamente y está siendo revisada.",
        });

        // Record status change
        await db.insert(statusHistory).values({
          applicationId: parseInt(id),
          fromStatus: "draft",
          toStatus: "submitted",
          changedBy: session.userId,
          notes: "Solicitud enviada por el aspirante",
        });
      }
    }

    // University/Admin can change status
    if (session.role === "university" || session.role === "super_admin") {
      if (body.status !== undefined) {
        const oldStatus = existing.status;
        updateData.status = body.status;

        if (body.reviewNotes !== undefined) updateData.reviewNotes = body.reviewNotes;
        if (body.score !== undefined) updateData.score = body.score;

        // Record status change
        await db.insert(statusHistory).values({
          applicationId: parseInt(id),
          fromStatus: oldStatus,
          toStatus: body.status,
          changedBy: session.userId,
          notes: body.reviewNotes || null,
        });

        // Notify applicant
        const statusMessages: Record<string, string> = {
          under_review: "Tu solicitud está siendo revisada por el comité académico.",
          interview: "Has sido seleccionado para una entrevista. Revisa tu correo para más detalles.",
          approved: "¡Felicitaciones! Tu solicitud ha sido aprobada.",
          rejected: "Lamentamos informarte que tu solicitud no fue aprobada en esta ocasión.",
          waitlisted: "Tu solicitud ha sido colocada en lista de espera.",
        };

        if (statusMessages[body.status]) {
          await db.insert(notifications).values({
            userId: existing.userId,
            applicationId: parseInt(id),
            type: `status_${body.status}`,
            title: `Estado actualizado: ${body.status}`,
            message: statusMessages[body.status],
          });
        }
      }
    }

    const [updated] = await db.update(applications).set(updateData).where(eq(applications.id, parseInt(id))).returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
