"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Program {
  id: number;
  title: string;
  programType: string;
  modality: string;
  duration: string;
  language: string;
  location: string;
  credits: number;
  description: string;
  openDate: string;
  deadlineDate: string;
  resultsDate: string;
  startDate: string;
  minDegree: string;
  minGpa: number;
  professionalExperience: string;
  languageRequirements: string;
  eligibilityNotes: string;
  requiredDocuments: string;
  totalCost: number;
  currency: string;
  paymentMethods: string;
  scholarshipsAvailable: boolean;
  scholarshipsInfo: string;
  refundPolicy: string;
  selectionProcess: string;
  hasInterview: boolean;
  hasExam: boolean;
  privacyPolicy: string;
  termsConditions: string;
  status: string;
  universityName: string;
  universityCountry: string;
  universityCity: string;
  universityWebsite: string;
}

const typeLabels: Record<string, string> = {
  curso: "Curso", diplomado: "Diplomado", especializacion: "Especialización",
  maestria: "Maestría", doctorado: "Doctorado",
};

const modalityLabels: Record<string, string> = {
  presencial: "Presencial", virtual: "Virtual", hibrido: "Híbrido",
};

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/programs/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setProgram(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleApply = async () => {
    setApplying(true);
    setMessage("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId: program?.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login`);
          return;
        }
        setMessage(data.error || "Error al postular");
      } else {
        router.push(`/dashboard/applications/${data.id}`);
      }
    } catch {
      setMessage("Error de conexión");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!program) return <div className="min-h-screen flex items-center justify-center">Programa no encontrado</div>;

  const docs = program.requiredDocuments ? JSON.parse(program.requiredDocuments) : [];
  const isOpen = program.status === "published" && (!program.deadlineDate || new Date() <= new Date(program.deadlineDate));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/programs" className="flex items-center gap-2 text-slate-600 hover:text-blue-700">
              ← Volver a programas
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold">G</div>
              <span className="text-lg font-bold text-slate-800">GradCall</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="card">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {program.universityName?.[0] || "U"}
                </div>
                <div>
                  <span className={`status-badge mb-2 ${
                    program.programType === "doctorado" ? "bg-red-100 text-red-700" :
                    program.programType === "maestria" ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {typeLabels[program.programType] || program.programType}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-800 mt-1">{program.title}</h1>
                  <p className="text-blue-700 font-semibold">{program.universityName}</p>
                  {program.universityCity && (
                    <p className="text-slate-500 text-sm">{program.universityCity}, {program.universityCountry}</p>
                  )}
                </div>
              </div>

              {program.description && (
                <p className="text-slate-600 leading-relaxed">{program.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Modalidad</div>
                  <div className="font-semibold text-slate-700">{modalityLabels[program.modality]}</div>
                </div>
                {program.duration && (
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Duración</div>
                    <div className="font-semibold text-slate-700">{program.duration}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-slate-400 font-medium">Idioma</div>
                  <div className="font-semibold text-slate-700">{program.language}</div>
                </div>
                {program.credits && (
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Créditos</div>
                    <div className="font-semibold text-slate-700">{program.credits}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Dates */}
            <div className="card">
              <h2 className="form-section-title">📅 Fechas Clave</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Apertura", date: program.openDate },
                  { label: "Cierre de postulaciones", date: program.deadlineDate },
                  { label: "Publicación de resultados", date: program.resultsDate },
                  { label: "Inicio del programa", date: program.startDate },
                ].filter(d => d.date).map(d => (
                  <div key={d.label} className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 font-medium">{d.label}</div>
                    <div className="font-semibold text-slate-700">
                      {new Date(d.date!).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div className="card">
              <h2 className="form-section-title">✅ Requisitos de Elegibilidad</h2>
              <div className="space-y-3">
                {program.minDegree && (
                  <div className="flex gap-3">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <div><span className="font-semibold">Título mínimo:</span> {program.minDegree}</div>
                  </div>
                )}
                {program.minGpa && (
                  <div className="flex gap-3">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <div><span className="font-semibold">Promedio mínimo:</span> {program.minGpa}</div>
                  </div>
                )}
                {program.professionalExperience && (
                  <div className="flex gap-3">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <div><span className="font-semibold">Experiencia profesional:</span> {program.professionalExperience}</div>
                  </div>
                )}
                {program.languageRequirements && (
                  <div className="flex gap-3">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <div><span className="font-semibold">Idiomas:</span> {program.languageRequirements}</div>
                  </div>
                )}
                {program.eligibilityNotes && (
                  <div className="flex gap-3">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <div>{program.eligibilityNotes}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Required Documents */}
            {docs.length > 0 && (
              <div className="card">
                <h2 className="form-section-title">📄 Documentos Requeridos</h2>
                <div className="grid grid-cols-2 gap-2">
                  {docs.map((doc: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-slate-600">
                      <span className="text-green-500">✓</span>
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selection Process */}
            {(program.selectionProcess || program.hasInterview || program.hasExam) && (
              <div className="card">
                <h2 className="form-section-title">🔍 Proceso de Selección</h2>
                {program.selectionProcess && <p className="text-slate-600 mb-3">{program.selectionProcess}</p>}
                <div className="flex gap-3">
                  {program.hasInterview && (
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      🎤 Incluye entrevista
                    </span>
                  )}
                  {program.hasExam && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                      📝 Incluye examen
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <div className="card border-2 border-blue-100">
              {program.totalCost && (
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-slate-800">
                    {program.currency} {program.totalCost.toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm">Costo total del programa</div>
                </div>
              )}

              {program.scholarshipsAvailable && (
                <div className="alert alert-success mb-4">
                  🏆 Becas disponibles
                  {program.scholarshipsInfo && <p className="text-xs mt-1">{program.scholarshipsInfo}</p>}
                </div>
              )}

              {message && <div className="alert alert-error">{message}</div>}

              {isOpen ? (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn-primary w-full justify-center py-3 text-base"
                >
                  {applying ? "Procesando..." : "Postularme ahora"}
                </button>
              ) : (
                <div className="text-center py-3 bg-slate-100 rounded-lg text-slate-500 font-medium">
                  Convocatoria cerrada
                </div>
              )}

              {program.deadlineDate && isOpen && (
                <p className="text-center text-xs text-slate-400 mt-2">
                  Cierra el {new Date(program.deadlineDate).toLocaleDateString("es-ES")}
                </p>
              )}
            </div>

            {/* Financial Info */}
            {program.paymentMethods && (
              <div className="card">
                <h3 className="font-bold text-slate-700 mb-2">💳 Formas de Pago</h3>
                <p className="text-slate-600 text-sm">{program.paymentMethods}</p>
              </div>
            )}

            {/* University Info */}
            <div className="card">
              <h3 className="font-bold text-slate-700 mb-3">🏛️ Universidad</h3>
              <p className="font-semibold text-slate-800">{program.universityName}</p>
              {program.universityCity && (
                <p className="text-slate-500 text-sm">{program.universityCity}, {program.universityCountry}</p>
              )}
              {program.universityWebsite && (
                <a href={program.universityWebsite} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline mt-1 block">
                  Visitar sitio web →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
