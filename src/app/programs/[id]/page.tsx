"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Globe,
  CreditCard,
  FileText,
  CheckCircle,
  Award,
  GraduationCap,
  BookOpen,
  Users,
  Mic,
  PenTool,
  Shield,
  AlertCircle,
  ChevronRight,
  DollarSign,
  ExternalLink,
  HelpCircle,
  CheckSquare,
} from "lucide-react";

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
  curso: "Curso",
  diplomado: "Diplomado",
  especializacion: "Especialización",
  maestria: "Maestría",
  doctorado: "Doctorado",
};

const typeColors: Record<string, string> = {
  curso: "bg-blue-100 text-blue-700",
  diplomado: "bg-teal-100 text-teal-700",
  especializacion: "bg-purple-100 text-purple-700",
  maestria: "bg-orange-100 text-orange-700",
  doctorado: "bg-red-100 text-red-700",
};

const modalityLabels: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  hibrido: "Híbrido",
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
      .then((r) => r.json())
      .then((data) => {
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Cargando programa...</div>
      </div>
    );
  if (!program)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Programa no encontrado</div>
      </div>
    );

  const docs = program.requiredDocuments ? JSON.parse(program.requiredDocuments) : [];
  const isOpen =
    program.status === "published" &&
    (!program.deadlineDate || new Date() <= new Date(program.deadlineDate));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/programs"
              className="flex items-center gap-2 text-slate-600 hover:text-[#003f8f] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver a programas</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#003f8f] flex items-center justify-center text-white font-bold">
                N
              </div>
              <span className="text-lg font-bold text-slate-800">Nexo</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tarjeta de encabezado */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#003f8f] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
                  {program.universityName?.[0] || "U"}
                </div>
                <div className="flex-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mb-2 ${
                      typeColors[program.programType] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {typeLabels[program.programType] || program.programType}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-800 mt-1">{program.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4 text-[#003f8f]" />
                    <p className="text-[#003f8f] font-semibold">{program.universityName}</p>
                  </div>
                  {program.universityCity && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-slate-500 text-sm">
                        {program.universityCity}, {program.universityCountry}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {program.description && (
                <p className="text-slate-600 leading-relaxed mt-4 pt-4 border-t border-slate-100">
                  {program.description}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-1">
                    <Clock className="w-3 h-3" />
                    Modalidad
                  </div>
                  <div className="font-semibold text-slate-700">
                    {modalityLabels[program.modality]}
                  </div>
                </div>
                {program.duration && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-1">
                      <Calendar className="w-3 h-3" />
                      Duración
                    </div>
                    <div className="font-semibold text-slate-700">{program.duration}</div>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-1">
                    <Globe className="w-3 h-3" />
                    Idioma
                  </div>
                  <div className="font-semibold text-slate-700">{program.language}</div>
                </div>
                {program.credits && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-1">
                      <BookOpen className="w-3 h-3" />
                      Créditos
                    </div>
                    <div className="font-semibold text-slate-700">{program.credits}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Fechas clave */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#003f8f]" />
                <h2 className="text-lg font-bold text-slate-800">Fechas clave</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Apertura de convocatoria", date: program.openDate, icon: Calendar },
                  { label: "Cierre de postulaciones", date: program.deadlineDate, icon: Clock },
                  { label: "Publicación de resultados", date: program.resultsDate, icon: Award },
                  { label: "Inicio del programa", date: program.startDate, icon: GraduationCap },
                ]
                  .filter((d) => d.date)
                  .map((d) => (
                    <div key={d.label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-1">
                        <d.icon className="w-3 h-3" />
                        {d.label}
                      </div>
                      <div className="font-semibold text-slate-700">
                        {new Date(d.date!).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Requisitos de elegibilidad */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-[#003f8f]" />
                <h2 className="text-lg font-bold text-slate-800">Requisitos de elegibilidad</h2>
              </div>
              <div className="space-y-3">
                {program.minDegree && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">Título mínimo:</span>{" "}
                      <span className="text-slate-600">{program.minDegree}</span>
                    </div>
                  </div>
                )}
                {program.minGpa && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">Promedio mínimo:</span>{" "}
                      <span className="text-slate-600">{program.minGpa}</span>
                    </div>
                  </div>
                )}
                {program.professionalExperience && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">Experiencia profesional:</span>{" "}
                      <span className="text-slate-600">{program.professionalExperience}</span>
                    </div>
                  </div>
                )}
                {program.languageRequirements && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">Requisitos de idioma:</span>{" "}
                      <span className="text-slate-600">{program.languageRequirements}</span>
                    </div>
                  </div>
                )}
                {program.eligibilityNotes && (
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-slate-600">{program.eligibilityNotes}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Documentos requeridos */}
            {docs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#003f8f]" />
                  <h2 className="text-lg font-bold text-slate-800">Documentos requeridos</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {docs.map((doc: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                      <FileText className="w-3.5 h-3.5 text-green-500" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proceso de selección */}
            {(program.selectionProcess || program.hasInterview || program.hasExam) && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#003f8f]" />
                  <h2 className="text-lg font-bold text-slate-800">Proceso de selección</h2>
                </div>
                {program.selectionProcess && (
                  <p className="text-slate-600 mb-4">{program.selectionProcess}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  {program.hasInterview && (
                    <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      <Mic className="w-3.5 h-3.5" />
                      Incluye entrevista
                    </div>
                  )}
                  {program.hasExam && (
                    <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      <PenTool className="w-3.5 h-3.5" />
                      Incluye examen
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Columna lateral */}
          <div className="space-y-4">
            {/* Tarjeta de postulación */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-[#003f8f]/20 p-6 sticky top-20">
              {program.totalCost && (
                <div className="text-center mb-4 pb-4 border-b border-slate-100">
                  <div className="text-3xl font-bold text-slate-800">
                    {program.currency} {program.totalCost.toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm">Costo total del programa</div>
                </div>
              )}

              {program.scholarshipsAvailable && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-1">
                    <Award className="w-4 h-4" />
                    Becas disponibles
                  </div>
                  {program.scholarshipsInfo && (
                    <p className="text-amber-600 text-xs">{program.scholarshipsInfo}</p>
                  )}
                </div>
              )}

              {message && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {message}
                </div>
              )}

              {isOpen ? (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full flex items-center justify-center gap-2 bg-[#003f8f] text-white font-semibold py-3 rounded-lg hover:bg-[#002e6b] transition-all disabled:opacity-50 text-base"
                >
                  {applying ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Postularme ahora
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center py-3 bg-slate-100 rounded-lg text-slate-500 font-medium flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Convocatoria cerrada
                </div>
              )}

              {program.deadlineDate && isOpen && (
                <p className="text-center text-xs text-slate-400 mt-3">
                  Cierra el{" "}
                  {new Date(program.deadlineDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* Formas de pago */}
            {program.paymentMethods && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[#003f8f]" />
                  <h3 className="font-bold text-slate-700">Formas de pago</h3>
                </div>
                <p className="text-slate-600 text-sm">{program.paymentMethods}</p>
              </div>
            )}

            {/* Información de la universidad */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-[#003f8f]" />
                <h3 className="font-bold text-slate-700">Universidad</h3>
              </div>
              <p className="font-semibold text-slate-800">{program.universityName}</p>
              {program.universityCity && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-slate-500 text-sm">
                    {program.universityCity}, {program.universityCountry}
                  </p>
                </div>
              )}
              {program.universityWebsite && (
                <a
                  href={program.universityWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#003f8f] text-sm hover:underline mt-2"
                >
                  Visitar sitio web
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Información legal */}
            {(program.privacyPolicy || program.termsConditions) && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-[#003f8f]" />
                  <h3 className="font-bold text-slate-700">Información legal</h3>
                </div>
                {program.privacyPolicy && (
                  <button
                    onClick={() => alert(program.privacyPolicy)}
                    className="text-slate-600 text-sm hover:text-[#003f8f] transition-colors block mb-1"
                  >
                    Política de privacidad →
                  </button>
                )}
                {program.termsConditions && (
                  <button
                    onClick={() => alert(program.termsConditions)}
                    className="text-slate-600 text-sm hover:text-[#003f8f] transition-colors block"
                  >
                    Términos y condiciones →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}