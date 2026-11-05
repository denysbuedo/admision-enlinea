import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, programs, notifications, statusHistory, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSession, type CustomSession } from "@/lib/auth";
import { splitApplicantName } from "@/lib/applicant-profile";
import { APPLICATION_STATUS_TRANSITIONS } from "@/lib/application-status";

async function canAccessApplication(session: CustomSession, application: typeof applications.$inferSelect) {
  if (session.role === "super_admin") return true;
  if (session.role === "aspirant") return application.userId === session.userId;
  if (session.role !== "university" || !session.universityId) return false;

  const [program] = await db.select({ universityId: programs.universityId })
    .from(programs).where(eq(programs.id, application.programId));
  return program?.universityId === session.universityId;
}

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
    if ((session.role === 'university' || session.role === 'super_admin') && application.status === 'draft') {
      return NextResponse.json({ error: "La solicitud aún no ha sido enviada" }, { status: 404 });
    }

    // Check access
    if (!await canAccessApplication(session, application)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Get status history
    const history = await db
      .select()
      .from(statusHistory)
      .where(eq(statusHistory.applicationId, parseInt(id)));

    if (session.role === 'aspirant') {
      const [owner] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, session.userId));
      const identity = splitApplicantName(owner?.name || '');
      return NextResponse.json({ ...application, ...identity, email: owner?.email || application.email, history });
    }
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
    if (!await canAccessApplication(session, existing)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if ((session.role === 'university' || session.role === 'super_admin') && existing.status === 'draft') {
      return NextResponse.json({ error: "La solicitud aún no ha sido enviada" }, { status: 409 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    let statusToSave: string | undefined;

    // Aspirant can update their own application data
    if (session.role === "aspirant") {
      const [owner] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, session.userId));
      if (!owner) return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
      Object.assign(updateData, splitApplicantName(owner.name), { email: owner.email });
      if (body.birthDate !== undefined) updateData.birthDate = body.birthDate ? new Date(body.birthDate) : null;
      if (body.nationality !== undefined) updateData.nationality = body.nationality;
      if (body.documentType !== undefined) updateData.documentType = body.documentType;
      if (body.documentNumber !== undefined) updateData.documentNumber = body.documentNumber;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.city !== undefined) updateData.city = body.city;
      if (body.country !== undefined) updateData.country = body.country;
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.academicInfo !== undefined) updateData.academicInfo = JSON.stringify(body.academicInfo);
      if (body.professionalExperience !== undefined) updateData.professionalExperience = JSON.stringify(body.professionalExperience);
      if (body.complementaryInfo !== undefined) updateData.complementaryInfo = JSON.stringify(body.complementaryInfo);
      if (body.declarationAccepted !== undefined) updateData.declarationAccepted = body.declarationAccepted;
      if (body.dataProcessingAccepted !== undefined) updateData.dataProcessingAccepted = body.dataProcessingAccepted;
      if (body.digitalSignature !== undefined) updateData.digitalSignature = body.digitalSignature;

      if (body.status === "submitted") {
        if (!APPLICATION_STATUS_TRANSITIONS[existing.status]?.includes('submitted')) {
          return NextResponse.json({ error: 'Esta solicitud ya no se puede enviar en su estado actual' }, { status: 409 });
        }
        updateData.status = "submitted";
        updateData.submittedAt = new Date();
        statusToSave = 'submitted';
      }
      if (body.status !== undefined && body.status !== 'submitted') {
        return NextResponse.json({ error: 'Los aspirantes solo pueden enviar solicitudes en borrador' }, { status: 403 });
      }
    }

    // University/Admin can change status
    if (session.role === "university" || session.role === "super_admin") {
      if (body.status !== undefined) {
        if (!APPLICATION_STATUS_TRANSITIONS[existing.status]?.includes(body.status)) {
          return NextResponse.json({ error: `No se puede cambiar el estado de «${existing.status}» a «${body.status}»` }, { status: 409 });
        }
        updateData.status = body.status;
        statusToSave = body.status;

        if (body.reviewNotes !== undefined) updateData.reviewNotes = body.reviewNotes;
        if (body.score !== undefined) updateData.score = body.score;
      }
    }

    const updated = await db.transaction(async tx => {
      const [current] = await tx.select().from(applications).where(eq(applications.id, parseInt(id)));
      if (!current || current.status !== existing.status) throw new Error('APPLICATION_STATUS_CHANGED');
      if (statusToSave && !APPLICATION_STATUS_TRANSITIONS[current.status]?.includes(statusToSave)) {
        throw new Error('APPLICATION_STATUS_CHANGED');
      }
      const [saved] = await tx.update(applications).set(updateData).where(eq(applications.id, parseInt(id))).returning();
      if (statusToSave) {
        await tx.insert(statusHistory).values({
          applicationId: parseInt(id), fromStatus: current.status, toStatus: statusToSave,
          changedBy: session.userId,
          notes: session.role === 'aspirant' ? 'Solicitud enviada por el aspirante' : body.reviewNotes || null,
        });

        if (statusToSave === 'submitted' && session.role === 'aspirant') {
          await tx.insert(notifications).values({
            userId: session.userId, applicationId: parseInt(id), type: 'application_submitted',
            title: 'Solicitud enviada', message: 'Tu solicitud fue enviada a la universidad para su evaluación.',
          });
          const [program] = await tx.select({ id: programs.id, title: programs.title, universityId: programs.universityId })
            .from(programs).where(eq(programs.id, current.programId));
          if (program) {
            const reviewers = await tx.select({ id: users.id }).from(users)
              .where(and(eq(users.role, 'university'), eq(users.universityId, program.universityId), eq(users.isActive, true)));
            if (reviewers.length) await tx.insert(notifications).values(reviewers.map(reviewer => ({
              userId: reviewer.id, applicationId: parseInt(id), type: 'new_application',
              title: 'Nueva postulación recibida', message: `Se recibió una postulación para ${program.title}.`,
            })));
          }
        } else {
          const statusMessages: Record<string, string> = {
            under_review: 'Tu solicitud está siendo revisada por el comité académico.',
            interview: 'Has sido convocado a una entrevista. La universidad te comunicará los detalles.',
            approved: '¡Felicitaciones! Tu solicitud ha sido aprobada.',
            rejected: 'Lamentamos informarte que tu solicitud no fue aprobada en esta ocasión.',
            waitlisted: 'Tu solicitud ha sido colocada en lista de espera.',
          };
          const statusLabels: Record<string, string> = {
            under_review: 'En revisión', interview: 'Entrevista', approved: 'Aprobada', rejected: 'Rechazada', waitlisted: 'Lista de espera',
          };
          if (statusToSave && statusMessages[statusToSave]) await tx.insert(notifications).values({
            userId: current.userId, applicationId: parseInt(id), type: `status_${statusToSave}`,
            title: `Estado actualizado: ${statusLabels[statusToSave]}`, message: statusMessages[statusToSave],
          });
        }
      }
      return saved;
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === 'APPLICATION_STATUS_CHANGED') {
      return NextResponse.json({ error: 'La solicitud cambió de estado. Actualiza la página y vuelve a intentarlo.' }, { status: 409 });
    }
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
