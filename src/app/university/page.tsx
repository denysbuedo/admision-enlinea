"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  draft: "Borrador", pending_approval: "Pendiente Aprobación", published: "Publicado",
  closed: "Cerrado", rejected: "Rechazado",
};

const appStatusLabels: Record<string, string> = {
  draft: "Borrador", submitted: "Enviada", under_review: "En Revisión",
  interview: "Entrevista", approved: "Aprobada", rejected: "Rechazada", waitlisted: "Lista de Espera",
};

export default function UniversityDashboard() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"programs" | "applications">("programs");

  useEffect(() => {
    Promise.all([
      fetch("/api/programs").then(r => r.json()),
      fetch("/api/applications").then(r => r.json()),
    ]).then(([progs, apps]) => {
      if (progs.error === "No autorizado" || apps.error === "No autorizado") {
        router.push("/login");
        return;
      }
      setPrograms(Array.isArray(progs) ? progs : []);
      setApplications(Array.isArray(apps) ? apps : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const stats = {
    total: programs.length,
    published: programs.filter(p => p.status === "published").length,
    pending: programs.filter(p => p.status === "pending_approval").length,
    totalApps: applications.length,
    submitted: applications.filter(a => a.status === "submitted").length,
    approved: applications.filter(a => a.status === "approved").length,
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold">G</div>
              <span className="text-lg font-bold text-slate-800">GradCall</span>
              <span className="text-slate-400 text-sm">/ Universidad</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/university/programs/new" className="btn-primary text-sm">
                + Nueva Convocatoria
              </Link>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 text-sm">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Panel Universidad</h1>
          <p className="text-slate-500">Gestiona tus convocatorias y solicitudes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Programas", value: stats.total, icon: "📚", color: "bg-blue-50 text-blue-700" },
            { label: "Publicados", value: stats.published, icon: "✅", color: "bg-green-50 text-green-700" },
            { label: "Pendientes", value: stats.pending, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
            { label: "Solicitudes", value: stats.totalApps, icon: "📋", color: "bg-purple-50 text-purple-700" },
            { label: "Nuevas", value: stats.submitted, icon: "📥", color: "bg-orange-50 text-orange-700" },
            { label: "Aprobadas", value: stats.approved, icon: "🏆", color: "bg-emerald-50 text-emerald-700" },
          ].map(s => (
            <div key={s.label} className="metric-card">
              <div className={`metric-icon ${s.color} text-2xl`}>{s.icon}</div>
              <div>
                <div className="text-xl font-bold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab("programs")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "programs" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            📚 Convocatorias ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "applications" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            📋 Solicitudes ({applications.length})
          </button>
        </div>

        {/* Programs Tab */}
        {activeTab === "programs" && (
          <div>
            {programs.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No tienes convocatorias aún</h3>
                <p className="text-slate-400 mb-4">Crea tu primera convocatoria de posgrado</p>
                <Link href="/university/programs/new" className="btn-primary">Crear Convocatoria</Link>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Programa</th>
                      <th>Tipo</th>
                      <th>Modalidad</th>
                      <th>Estado</th>
                      <th>Cierre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map(p => (
                      <tr key={p.id}>
                        <td className="font-semibold text-slate-800">{p.title}</td>
                        <td className="text-slate-500 capitalize">{p.programType}</td>
                        <td className="text-slate-500 capitalize">{p.modality}</td>
                        <td>
                          <span className={`status-badge status-${p.status}`}>
                            {statusLabels[p.status] || p.status}
                          </span>
                        </td>
                        <td className="text-slate-500 text-sm">
                          {p.deadlineDate ? new Date(p.deadlineDate).toLocaleDateString("es-ES") : "—"}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Link href={`/university/programs/${p.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Ver
                            </Link>
                            <Link href={`/university/programs/${p.id}/applications`} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                              Solicitudes
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div>
            {applications.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-slate-600">No hay solicitudes aún</h3>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Aspirante</th>
                      <th>Email</th>
                      <th>Programa</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(a => (
                      <tr key={a.id}>
                        <td className="font-semibold text-slate-800">
                          {a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : `Solicitud #${a.id}`}
                        </td>
                        <td className="text-slate-500 text-sm">{a.email || "—"}</td>
                        <td className="text-slate-600">{a.programTitle}</td>
                        <td>
                          <span className={`status-badge status-${a.status}`}>
                            {appStatusLabels[a.status] || a.status}
                          </span>
                        </td>
                        <td className="text-slate-500 text-sm">
                          {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString("es-ES") : "—"}
                        </td>
                        <td>
                          <Link href={`/university/applications/${a.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Revisar
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
