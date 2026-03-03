"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Application {
  id: number;
  programId: number;
  status: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  academicInfo: string;
  professionalExperience: string;
  complementaryInfo: string;
  declarationAccepted: boolean;
  dataProcessingAccepted: boolean;
  digitalSignature: string;
  reviewNotes: string;
  score: number;
  submittedAt: string;
  history: Array<{ fromStatus: string; toStatus: string; notes: string; createdAt: string }>;
}

const statusLabels: Record<string, string> = {
  draft: "Borrador", submitted: "Enviada", under_review: "En Revisión",
  interview: "Entrevista", approved: "Aprobada", rejected: "Rechazada", waitlisted: "Lista de Espera",
};

const STATUS_FLOW = [
  { value: "under_review", label: "Marcar En Revisión", color: "bg-yellow-500" },
  { value: "interview", label: "Convocar a Entrevista", color: "bg-purple-500" },
  { value: "approved", label: "Aprobar", color: "bg-green-500" },
  { value: "rejected", label: "Rechazar", color: "bg-red-500" },
  { value: "waitlisted", label: "Lista de Espera", color: "bg-orange-500" },
];

export default function ReviewApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [score, setScore] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch(`/api/applications/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error === "No autorizado") { router.push("/login"); return; }
        setApp(data);
        setReviewNotes(data.reviewNotes || "");
        setScore(data.score?.toString() || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id, router]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`/api/applications/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes,
          score: score ? parseFloat(score) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Error al actualizar" });
      } else {
        setApp(prev => prev ? { ...prev, status: newStatus, reviewNotes, score: parseFloat(score) } : null);
        setMessage({ type: "success", text: `Estado actualizado a: ${statusLabels[newStatus]}` });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!app) return <div className="min-h-screen flex items-center justify-center">Solicitud no encontrada</div>;

  const academic = app.academicInfo ? JSON.parse(app.academicInfo) : {};
  const experience = app.professionalExperience ? JSON.parse(app.professionalExperience) : [];
  const complementary = app.complementaryInfo ? JSON.parse(app.complementaryInfo) : {};

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/university" className="text-slate-600 hover:text-blue-700">
              ← Panel Universidad
            </Link>
            <span className={`status-badge status-${app.status}`}>{statusLabels[app.status]}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h1 className="text-xl font-bold text-slate-800 mb-1">
                {app.firstName && app.lastName ? `${app.firstName} ${app.lastName}` : `Solicitud #${app.id}`}
              </h1>
              <p className="text-slate-500">{app.email} · {app.phone}</p>
              {app.submittedAt && (
                <p className="text-slate-400 text-sm mt-1">
                  Enviada el {new Date(app.submittedAt).toLocaleDateString("es-ES")}
                </p>
              )}
            </div>

            {/* Personal Info */}
            <div className="card">
              <h2 className="form-section-title">👤 Información Personal</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Fecha de nacimiento", value: app.birthDate ? new Date(app.birthDate).toLocaleDateString("es-ES") : "—" },
                  { label: "Nacionalidad", value: app.nationality || "—" },
                  { label: "Documento", value: app.documentNumber ? `${app.documentType}: ${app.documentNumber}` : "—" },
                  { label: "Ciudad/País", value: [app.city, app.country].filter(Boolean).join(", ") || "—" },
                  { label: "Dirección", value: app.address || "—" },
                ].map(f => (
                  <div key={f.label}>
                    <div className="text-slate-400 font-medium">{f.label}</div>
                    <div className="text-slate-700">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Info */}
            {Object.keys(academic).length > 0 && (
              <div className="card">
                <h2 className="form-section-title">🎓 Información Académica</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Título", value: academic.degree },
                    { label: "Universidad", value: academic.university },
                    { label: "País", value: academic.country },
                    { label: "Año graduación", value: academic.graduationYear },
                    { label: "Promedio", value: academic.gpa },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label}>
                      <div className="text-slate-400 font-medium">{f.label}</div>
                      <div className="text-slate-700">{f.value}</div>
                    </div>
                  ))}
                  {academic.otherStudies && (
                    <div className="col-span-2">
                      <div className="text-slate-400 font-medium">Otros estudios</div>
                      <div className="text-slate-700">{academic.otherStudies}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Professional Experience */}
            {experience.length > 0 && experience[0].company && (
              <div className="card">
                <h2 className="form-section-title">💼 Experiencia Profesional</h2>
                {experience.map((exp: Record<string, string>, i: number) => (
                  <div key={i} className="border-b border-slate-100 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                    <div className="font-semibold text-slate-800">{exp.position} en {exp.company}</div>
                    <div className="text-slate-500 text-sm">
                      {exp.startDate} – {exp.endDate || "Presente"}
                    </div>
                    {exp.description && <div className="text-slate-600 text-sm mt-1">{exp.description}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Complementary */}
            {Object.values(complementary).some(v => v) && (
              <div className="card">
                <h2 className="form-section-title">⭐ Información Complementaria</h2>
                <div className="space-y-2 text-sm">
                  {complementary.languages && (
                    <div><span className="font-medium text-slate-600">Idiomas:</span> {complementary.languages}</div>
                  )}
                  {complementary.certifications && (
                    <div><span className="font-medium text-slate-600">Certificaciones:</span> {complementary.certifications}</div>
                  )}
                  {complementary.publications && (
                    <div><span className="font-medium text-slate-600">Publicaciones:</span> {complementary.publications}</div>
                  )}
                  {complementary.research && (
                    <div><span className="font-medium text-slate-600">Investigación:</span> {complementary.research}</div>
                  )}
                </div>
              </div>
            )}

            {/* Status History */}
            {app.history && app.history.length > 0 && (
              <div className="card">
                <h2 className="form-section-title">📋 Historial</h2>
                <div className="space-y-2">
                  {app.history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400">{new Date(h.createdAt).toLocaleDateString("es-ES")}</span>
                      <span className={`status-badge status-${h.toStatus}`}>{statusLabels[h.toStatus] || h.toStatus}</span>
                      {h.notes && <span className="text-slate-500">{h.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Review Panel */}
          <div className="space-y-4">
            <div className="card border-2 border-blue-100">
              <h3 className="font-bold text-slate-800 mb-4">Panel de Evaluación</h3>

              {message.text && (
                <div className={`alert ${message.type === "error" ? "alert-error" : "alert-success"} mb-3`}>
                  {message.text}
                </div>
              )}

              <div className="mb-4">
                <label className="label">Puntaje (0-100)</label>
                <input type="number" min="0" max="100" className="input-field"
                  value={score} onChange={e => setScore(e.target.value)} />
              </div>

              <div className="mb-4">
                <label className="label">Notas de revisión</label>
                <textarea className="input-field" rows={3}
                  placeholder="Observaciones para el aspirante..."
                  value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} />
              </div>

              <div className="space-y-2">
                {STATUS_FLOW.map(s => (
                  <button
                    key={s.value}
                    onClick={() => handleStatusChange(s.value)}
                    disabled={updating || app.status === s.value}
                    className={`w-full py-2 px-4 rounded-lg text-white font-medium text-sm transition-opacity ${s.color} disabled:opacity-40`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export */}
            <div className="card">
              <h3 className="font-bold text-slate-700 mb-3">Exportar Solicitudes</h3>
              <a
                href={`/api/programs/${app.programId}/export?format=csv`}
                className="btn-secondary w-full justify-center text-sm"
              >
                📥 Exportar CSV
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
