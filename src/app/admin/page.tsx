"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Program {
  id: number;
  title: string;
  programType: string;
  status: string;
  universityName: string;
  deadlineDate: string;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  universityName: string;
  createdAt: string;
}

interface Application {
  id: number;
  status: string;
  programTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  submittedAt: string;
}

const statusLabels: Record<string, string> = {
  draft: "Borrador", pending_approval: "Pendiente", published: "Publicado",
  closed: "Cerrado", rejected: "Rechazado",
};

const appStatusLabels: Record<string, string> = {
  draft: "Borrador", submitted: "Enviada", under_review: "En Revisión",
  interview: "Entrevista", approved: "Aprobada", rejected: "Rechazada", waitlisted: "Lista de Espera",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"programs" | "users" | "applications">("programs");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/programs").then(r => r.json()),
      fetch("/api/admin/users").then(r => r.json()),
      fetch("/api/applications").then(r => r.json()),
    ]).then(([progs, usrs, apps]) => {
      if (progs.error === "No autorizado" || usrs.error === "No autorizado") {
        router.push("/login");
        return;
      }
      setPrograms(Array.isArray(progs) ? progs : []);
      setUsers(Array.isArray(usrs) ? usrs : []);
      setApplications(Array.isArray(apps) ? apps : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleProgramStatus = async (id: number, status: string) => {
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPrograms(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        setMessage({ type: "success", text: `Programa ${status === "published" ? "publicado" : "rechazado"} exitosamente` });
      }
    } catch {
      setMessage({ type: "error", text: "Error al actualizar" });
    }
  };

  const stats = {
    totalPrograms: programs.length,
    pendingApproval: programs.filter(p => p.status === "pending_approval").length,
    published: programs.filter(p => p.status === "published").length,
    totalUsers: users.length,
    universities: users.filter(u => u.role === "university").length,
    aspirants: users.filter(u => u.role === "aspirant").length,
    totalApps: applications.length,
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
              <span className="text-slate-400 text-sm">/ Super Admin</span>
            </Link>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 text-sm">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Panel Super Admin</h1>
          <p className="text-slate-500">Gestión global de GradCall</p>
        </div>

        {message.text && (
          <div className={`alert ${message.type === "error" ? "alert-error" : "alert-success"} mb-4`}>
            {message.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {[
            { label: "Programas", value: stats.totalPrograms, icon: "📚", color: "bg-blue-50 text-blue-700" },
            { label: "Pendientes", value: stats.pendingApproval, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
            { label: "Publicados", value: stats.published, icon: "✅", color: "bg-green-50 text-green-700" },
            { label: "Usuarios", value: stats.totalUsers, icon: "👥", color: "bg-purple-50 text-purple-700" },
            { label: "Universidades", value: stats.universities, icon: "🏛️", color: "bg-indigo-50 text-indigo-700" },
            { label: "Aspirantes", value: stats.aspirants, icon: "🎓", color: "bg-pink-50 text-pink-700" },
            { label: "Solicitudes", value: stats.totalApps, icon: "📋", color: "bg-orange-50 text-orange-700" },
          ].map(s => (
            <div key={s.label} className="metric-card">
              <div className={`metric-icon ${s.color} text-xl`}>{s.icon}</div>
              <div>
                <div className="text-xl font-bold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Approval Alert */}
        {stats.pendingApproval > 0 && (
          <div className="alert alert-info mb-6">
            ⚠️ Hay <strong>{stats.pendingApproval}</strong> convocatoria{stats.pendingApproval > 1 ? "s" : ""} pendiente{stats.pendingApproval > 1 ? "s" : ""} de aprobación
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200 w-fit">
          {[
            { key: "programs", label: `📚 Programas (${programs.length})` },
            { key: "users", label: `👥 Usuarios (${users.length})` },
            { key: "applications", label: `📋 Solicitudes (${applications.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Programs Tab */}
        {activeTab === "programs" && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Programa</th>
                  <th>Universidad</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {programs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-400 py-8">No hay programas</td>
                  </tr>
                ) : programs.map(p => (
                  <tr key={p.id}>
                    <td className="font-semibold text-slate-800">{p.title}</td>
                    <td className="text-slate-500">{p.universityName}</td>
                    <td className="text-slate-500 capitalize">{p.programType}</td>
                    <td>
                      <span className={`status-badge status-${p.status}`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="text-slate-400 text-sm">
                      {new Date(p.createdAt).toLocaleDateString("es-ES")}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link href={`/programs/${p.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Ver
                        </Link>
                        {p.status === "pending_approval" && (
                          <>
                            <button
                              onClick={() => handleProgramStatus(p.id, "published")}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleProgramStatus(p.id, "rejected")}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {p.status === "published" && (
                          <button
                            onClick={() => handleProgramStatus(p.id, "closed")}
                            className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                          >
                            Cerrar
                          </button>
                        )}
                        <a
                          href={`/api/programs/${p.id}/export?format=csv`}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          CSV
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Universidad</th>
                  <th>Estado</th>
                  <th>Registrado</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-400 py-8">No hay usuarios</td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td className="font-semibold text-slate-800">{u.name}</td>
                    <td className="text-slate-500 text-sm">{u.email}</td>
                    <td>
                      <span className={`status-badge ${
                        u.role === "super_admin" ? "bg-red-100 text-red-700" :
                        u.role === "university" ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {u.role === "super_admin" ? "Super Admin" :
                         u.role === "university" ? "Universidad" : "Aspirante"}
                      </span>
                    </td>
                    <td className="text-slate-500">{u.universityName || "—"}</td>
                    <td>
                      <span className={`status-badge ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="text-slate-400 text-sm">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-ES") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Aspirante</th>
                  <th>Email</th>
                  <th>Programa</th>
                  <th>Estado</th>
                  <th>Enviada</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-8">No hay solicitudes</td>
                  </tr>
                ) : applications.map(a => (
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
                    <td className="text-slate-400 text-sm">
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString("es-ES") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
