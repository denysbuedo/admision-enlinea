"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Inbox,
  Trophy,
  Plus,
  LogOut,
  Eye,
  ClipboardList,
  Calendar,
  GraduationCap,
  MapPin,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface Program {
  id: number;
  title: string;
  programType: string;
  modality: string;
  status: string;
  deadlineDate: string;
  createdAt: string;
}

interface Application {
  id: number;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  programTitle: string;
  submittedAt: string;
}

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

const appStatusLabels: Record<string, string> = {
  draft: "Borrador",
  submitted: "Enviada",
  under_review: "En Revisión",
  interview: "Entrevista",
  approved: "Aprobada",
  rejected: "Rechazada",
  waitlisted: "Lista de Espera",
};

const appStatusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  interview: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  waitlisted: "bg-orange-100 text-orange-700",
};

export default function UniversityDashboard() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"programs" | "applications">("programs");

  useEffect(() => {
    Promise.all([
      fetch("/api/programs").then((r) => r.json()),
      fetch("/api/applications").then((r) => r.json()),
    ])
      .then(([progs, apps]) => {
        if (progs.error === "No autorizado" || apps.error === "No autorizado") {
          router.push("/login");
          return;
        }
        setPrograms(Array.isArray(progs) ? progs : []);
        setApplications(Array.isArray(apps) ? apps : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const stats = {
    total: programs.length,
    published: programs.filter((p) => p.status === "published").length,
    pending: programs.filter((p) => p.status === "pending_approval").length,
    totalApps: applications.length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    approved: applications.filter((a) => a.status === "approved").length,
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Cargando panel...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#003f8f] flex items-center justify-center text-white font-bold">
                N
              </div>
              <span className="text-lg font-bold text-slate-800">Nexo</span>
              <span className="text-slate-400 text-sm hidden sm:inline">/ Universidad</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/university/programs/new"
                className="flex items-center gap-2 bg-[#003f8f] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#002e6b] transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Nueva convocatoria
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-500 hover:text-red-600 text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-6 h-6 text-[#003f8f]" />
            <h1 className="text-2xl font-bold text-slate-800">Panel de control</h1>
          </div>
          <p className="text-slate-500 pl-8">
            Gestione sus convocatorias y solicitudes de admisión
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-[#003f8f]" />
              <span className="text-xl font-bold text-slate-800">{stats.total}</span>
            </div>
            <p className="text-xs text-slate-500">Convocatorias</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-xl font-bold text-slate-800">{stats.published}</span>
            </div>
            <p className="text-xs text-slate-500">Publicadas</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-xl font-bold text-slate-800">{stats.pending}</span>
            </div>
            <p className="text-xs text-slate-500">Pendientes</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-xl font-bold text-slate-800">{stats.totalApps}</span>
            </div>
            <p className="text-xs text-slate-500">Solicitudes</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Inbox className="w-5 h-5 text-orange-600" />
              <span className="text-xl font-bold text-slate-800">{stats.submitted}</span>
            </div>
            <p className="text-xs text-slate-500">Nuevas</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-emerald-600" />
              <span className="text-xl font-bold text-slate-800">{stats.approved}</span>
            </div>
            <p className="text-xs text-slate-500">Aprobadas</p>
          </div>
        </div>

        {/* Alertas */}
        {stats.pending > 0 && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 text-sm">
              Tiene <strong>{stats.pending}</strong> convocatoria{stats.pending > 1 ? "s" : ""}{" "}
              pendiente{stats.pending > 1 ? "s" : ""} de aprobación por el administrador
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("programs")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "programs"
                ? "bg-[#003f8f] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Convocatorias ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "applications"
                ? "bg-[#003f8f] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" />
            Solicitudes ({applications.length})
          </button>
        </div>

        {/* Programs Tab */}
        {activeTab === "programs" && (
          <>
            {programs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-12">
                <div className="flex justify-center mb-4">
                  <BookOpen className="w-16 h-16 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No tienes convocatorias aún
                </h3>
                <p className="text-slate-400 mb-4">
                  Crea tu primera convocatoria de posgrado
                </p>
                <Link
                  href="/university/programs/new"
                  className="inline-flex items-center gap-2 bg-[#003f8f] text-white font-medium px-5 py-2 rounded-lg hover:bg-[#002e6b] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Crear convocatoria
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Programa
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Modalidad
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Cierre
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {programs.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800">{p.title}</td>
                          <td className="px-6 py-4 text-slate-500 text-sm capitalize">
                            {p.programType}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm capitalize">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {p.modality}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                statusColors[p.status]
                              }`}
                            >
                              {statusLabels[p.status] || p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm">
                            {p.deadlineDate ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {new Date(p.deadlineDate).toLocaleDateString("es-ES")}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <Link
                                href={`/university/programs/${p.id}`}
                                className="flex items-center gap-1 text-[#003f8f] hover:text-[#002e6b] text-sm font-medium"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Ver
                              </Link>
                              <Link
                                href={`/university/programs/${p.id}/applications`}
                                className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                Solicitudes
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <>
            {applications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-12">
                <div className="flex justify-center mb-4">
                  <Inbox className="w-16 h-16 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No hay solicitudes aún
                </h3>
                <p className="text-slate-400">
                  Las solicitudes aparecerán aquí cuando los aspirantes se postulen
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Aspirante
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Programa
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {applications.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {a.firstName && a.lastName
                              ? `${a.firstName} ${a.lastName}`
                              : `Solicitud #${a.id}`}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm">{a.email || "—"}</td>
                          <td className="px-6 py-4 text-slate-600 text-sm">{a.programTitle}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                appStatusColors[a.status]
                              }`}
                            >
                              {appStatusLabels[a.status] || a.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm">
                            {a.submittedAt ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {new Date(a.submittedAt).toLocaleDateString("es-ES")}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/university/applications/${a.id}`}
                              className="flex items-center gap-1 text-[#003f8f] hover:text-[#002e6b] text-sm font-medium"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Revisar
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}