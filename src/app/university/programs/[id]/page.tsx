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
  Award,
  BookOpen,
  Users,
  Mic,
  PenTool,
  Shield,
  AlertCircle,
  ChevronRight,
  ClipboardList,
  CheckCircle,
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

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  pending_approval: "Pendiente",
  published: "Publicado",
  closed: "Cerrado",
  rejected: "Rechazado",
};

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending_approval: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-700",
  rejected: "bg-red-100 text-red-700",
};

export default function UniversityProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, submitted: 0, inReview: 0, approved: 0 });

  useEffect(() => {
    fetch(`/api/programs/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "No autorizado") {
          router.push("/login");
          return;
        }
        setProgram(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`/api/applications`)
      .then((r) => r.json())
      .then((apps) => {
        if (!Array.isArray(apps)) return;
        const programApps = apps.filter((a: { programId: number }) => a.programId === Number(params.id));
        setStats({
          total: programApps.length,
          submitted: programApps.filter((a: { status: string }) => a.status === "submitted").length,
          inReview: programApps.filter((a: { status: string }) => a.status === "under_review").length,
          approved: programApps.filter((a: { status: string }) => a.status === "approved").length,
        });
      })
      .catch(() => {});
  }, [params.id, router]);

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

  return (
    <div className="min-h-screen bg-slate-50">
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
          <div className="lg:col-span-2 space-y-6">
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
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    statusColors[program.status]
                  }`}
                >
                  {statusLabels[program.status] || program.status}
                </span>
              </div>
            </div>

            {program.description && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Descripción</h2>
                <p className="text-slate-600 leading-relaxed">{program.description}</p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Fechas clave</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Apertura", date: program.openDate },
                  { label: "Cierre", date: program.deadlineDate },
                  { label: "Resultados", date: program.resultsDate },
                  { label: "Inicio", date: program.startDate },
                ]
                  .filter((d) => d.date)
                  .map((d) => (
                    <div key={d.label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="text-xs text-slate-400 font-medium mb-1">{d.label}</div>
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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Información general</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Modalidad</div>
                  <div className="font-semibold text-slate-700">{modalityLabels[program.modality]}</div>
                </div>
                {program.duration && (
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">Duración</div>
                    <div className="font-semibold text-slate-700">{program.duration}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Idioma</div>
                  <div className="font-semibold text-slate-700">{program.language}</div>
                </div>
                {program.credits && (
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">Créditos</div>
                    <div className="font-semibold text-slate-700">{program.credits}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Requisitos</h2>
              <div className="space-y-3">
                {program.minDegree && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">
                      Título mínimo: <span className="font-semibold">{program.minDegree}</span>
                    </span>
                  </div>
                )}
                {program.minGpa && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">
                      Promedio mínimo: <span className="font-semibold">{program.minGpa}</span>
                    </span>
                  </div>
                )}
                {program.professionalExperience && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">
                      Experiencia: <span className="font-semibold">{program.professionalExperience}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#003f8f]" />
                Estadísticas de solicitudes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                  <div className="text-xs text-slate-500">Total</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-700">{stats.submitted}</div>
                  <div className="text-xs text-blue-600">Enviadas</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <div className="text-2xl font-bold text-amber-700">{stats.inReview}</div>
                  <div className="text-xs text-amber-600">En revisión</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
                  <div className="text-xs text-green-600">Aprobadas</div>
                </div>
              </div>
            </div>

            <Link
              href={`/university/programs/${program.id}/applications`}
              className="block bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-[#003f8f]/30 transition-all"
            >
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#003f8f]" />
                Ver solicitudes
              </h3>
              <p className="text-slate-500 text-sm mb-3">Revisar y evaluar postulaciones</p>
              <span className="inline-flex items-center gap-1 text-[#003f8f] text-sm font-medium">
                Ir a solicitudes <ChevronRight className="w-4 h-4" />
              </span>
            </Link>

            {docs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 mb-2">Documentos requeridos</h3>
                <ul className="space-y-1">
                  {docs.map((doc: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
