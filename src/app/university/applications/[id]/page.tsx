"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Briefcase,
  Star,
  History,
  Download,
  Award,
  BookOpen,
  Building2,
  Globe,
  GraduationCap,
  Languages,
  FileCheck,
  Send,
  Users,
  AlertCircle,
} from "lucide-react";

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
  draft: "Borrador",
  submitted: "Enviada",
  under_review: "En Revisión",
  interview: "Entrevista",
  approved: "Aprobada",
  rejected: "Rechazada",
  waitlisted: "Lista de Espera",
};

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  interview: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  waitlisted: "bg-orange-100 text-orange-700",
};

const STATUS_FLOW = [
  { value: "under_review", label: "Marcar en revisión", color: "bg-amber-600 hover:bg-amber-700", icon: Clock },
  { value: "interview", label: "Convocar a entrevista", color: "bg-purple-600 hover:bg-purple-700", icon: Users },
  { value: "approved", label: "Aprobar solicitud", color: "bg-green-600 hover:bg-green-700", icon: CheckCircle },
  { value: "rejected", label: "Rechazar solicitud", color: "bg-red-600 hover:bg-red-700", icon: AlertCircle },
  { value: "waitlisted", label: "Lista de espera", color: "bg-orange-600 hover:bg-orange-700", icon: Clock },
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
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "No autorizado") {
          router.push("/login");
          return;
        }
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
        setApp((prev) =>
          prev ? { ...prev, status: newStatus, reviewNotes, score: parseFloat(score) } : null
        );
        setMessage({ type: "success", text: `Estado actualizado a: ${statusLabels[newStatus]}` });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Cargando solicitud...</div>
      </div>
    );
  if (!app)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Solicitud no encontrada</div>
      </div>
    );

  const academic = app.academicInfo ? JSON.parse(app.academicInfo) : {};
  const experience = app.professionalExperience ? JSON.parse(app.professionalExperience) : [];
  const complementary = app.complementaryInfo ? JSON.parse(app.complementaryInfo) : {};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/university"
              className="flex items-center gap-2 text-slate-600 hover:text-[#003f8f] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver al panel</span>
            </Link>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[app.status]}`}
              >
                {statusLabels[app.status]}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Información */}
          <div className="lg:col-span-2 space-y-6">
            {/* Encabezado del aspirante */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">
                    {app.firstName && app.lastName
                      ? `${app.firstName} ${app.lastName}`
                      : `Solicitud #${app.id}`}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <Mail className="w-3.5 h-3.5" />
                      {app.email}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <Phone className="w-3.5 h-3.5" />
                      {app.phone || "—"}
                    </div>
                  </div>
                  {app.submittedAt && (
                    <div className="flex items-center gap-1 mt-2 text-slate-400 text-xs">
                      <Calendar className="w-3 h-3" />
                      Enviada el {new Date(app.submittedAt).toLocaleDateString("es-ES")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#003f8f]" />
                <h2 className="text-lg font-bold text-slate-800">Información personal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Fecha de nacimiento", value: app.birthDate ? new Date(app.birthDate).toLocaleDateString("es-ES") : "—", icon: Calendar },
                  { label: "Nacionalidad", value: app.nationality || "—", icon: Globe },
                  { label: "Documento", value: app.documentNumber ? `${app.documentType}: ${app.documentNumber}` : "—", icon: FileText },
                  { label: "Ubicación", value: [app.city, app.country].filter(Boolean).join(", ") || "—", icon: MapPin },
                  { label: "Dirección", value: app.address || "—", icon: MapPin },
                ].map((f) => (
                  <div key={f.label} className="flex items-start gap-2">
                    <f.icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">{f.label}</div>
                      <div className="text-sm text-slate-700">{f.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información Académica */}
            {Object.keys(academic).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-[#003f8f]" />
                  <h2 className="text-lg font-bold text-slate-800">Información académica</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Título obtenido", value: academic.degree, icon: Award },
                    { label: "Institución", value: academic.university, icon: Building2 },
                    { label: "País", value: academic.country, icon: Globe },
                    { label: "Año de graduación", value: academic.graduationYear, icon: Calendar },
                    { label: "Promedio / GPA", value: academic.gpa, icon: Star },
                  ]
                    .filter((f) => f.value)
                    .map((f) => (
                      <div key={f.label} className="flex items-start gap-2">
                        <f.icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-slate-400 font-medium">{f.label}</div>
                          <div className="text-sm text-slate-700">{f.value}</div>
                        </div>
                      </div>
                    ))}
                </div>
                {academic.otherStudies && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-400 font-medium mb-1">Otros estudios</div>
                    <div className="text-sm text-slate-700">{academic.otherStudies}</div>
                  </div>
                )}
              </div>
            )}

            {/* Experiencia Profesional */}
            {experience.length > 0 && experience[0]?.company && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-[#003f8f]" />
                  <h2 className="text-lg font-bold text-slate-800">Experiencia profesional</h2>
                </div>
                <div className="space-y-4">
                  {experience.map((exp: Record<string, string>, i: number) => (
                    <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="font-semibold text-slate-800">
                        {exp.position} en {exp.company}
                      </div>
                      <div className="text-slate-500 text-sm mt-1">
                        {exp.startDate} – {exp.endDate || "Actualidad"}
                      </div>
                      {exp.description && (
                        <div className="text-slate-600 text-sm mt-2">{exp.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información Complementaria */}
            {Object.values(complementary).some((v) => v) && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-[#003f8f]" />
                  <h2 className="text-lg font-bold text-slate-800">Información complementaria</h2>
                </div>
                <div className="space-y-3">
                  {complementary.languages && (
                    <div className="flex items-start gap-2">
                      <Languages className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Idiomas</div>
                        <div className="text-sm text-slate-700">{complementary.languages}</div>
                      </div>
                    </div>
                  )}
                  {complementary.certifications && (
                    <div className="flex items-start gap-2">
                      <FileCheck className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Certificaciones</div>
                        <div className="text-sm text-slate-700">{complementary.certifications}</div>
                      </div>
                    </div>
                  )}
                  {complementary.publications && (
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Publicaciones</div>
                        <div className="text-sm text-slate-700">{complementary.publications}</div>
                      </div>
                    </div>
                  )}
                  {complementary.research && (
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Líneas de investigación</div>
                        <div className="text-sm text-slate-700">{complementary.research}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Historial de cambios */}
            {app.history && app.history.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-[#003f8f]" />
                  <h2 className="text-lg font-bold text-slate-800">Historial de cambios</h2>
                </div>
                <div className="space-y-3">
                  {app.history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400 text-xs whitespace-nowrap">
                        {new Date(h.createdAt).toLocaleDateString("es-ES")}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[h.toStatus]}`}
                      >
                        {statusLabels[h.toStatus] || h.toStatus}
                      </span>
                      {h.notes && <span className="text-slate-500 text-xs">{h.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna lateral - Panel de evaluación */}
          <div className="space-y-4">
            {/* Panel de acciones */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-20">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#003f8f]" />
                Panel de evaluación
              </h3>

              {message.text && (
                <div
                  className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
                    message.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  {message.type === "error" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {message.text}
                </div>
              )}

              {/* Puntaje */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Puntaje (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
              </div>

              {/* Notas */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Notas de revisión
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Observaciones sobre esta solicitud..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              {/* Botones de acción */}
              <div className="space-y-2">
                {STATUS_FLOW.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleStatusChange(s.value)}
                    disabled={updating || app.status === s.value}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white font-medium text-sm transition-all ${s.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <s.icon className="w-4 h-4" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exportar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-[#003f8f]" />
                Exportar datos
              </h3>
              <a
                href={`/api/programs/${app.programId}/export?format=csv`}
                className="flex items-center justify-center gap-2 w-full border-2 border-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-lg hover:border-[#003f8f] hover:text-[#003f8f] transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar solicitudes (CSV)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}