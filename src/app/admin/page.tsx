"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Users,
  Building2,
  GraduationCap,
  FileText,
  AlertCircle,
  LogOut,
  Eye,
  Check,
  X,
  Lock,
  Download,
  LayoutDashboard,
  UserCheck,
  FileCheck,
} from "lucide-react";

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
  draft: "Borrador",
  pending_approval: "Pendiente",
  published: "Publicado",
  closed: "Cerrado",
  rejected: "Rechazado",
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
      fetch("/api/programs").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/applications").then((r) => r.json()),
    ])
      .then(([progs, usrs, apps]) => {
        if (progs.error === "No autorizado" || usrs.error === "No autorizado") {
          router.push("/login");
          return;
        }
        setPrograms(Array.isArray(progs) ? progs : []);
        setUsers(Array.isArray(usrs) ? usrs : []);
        setApplications(Array.isArray(apps) ? apps : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        setPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
        setMessage({
          type: "success",
          text: `Programa ${status === "published" ? "publicado" : "rechazado"} exitosamente`,
        });
      }
    } catch {
      setMessage({ type: "error", text: "Error al actualizar" });
    }
  };

  const stats = {
    totalPrograms: programs.length,
    pendingApproval: programs.filter((p) => p.status === "pending_approval").length,
    published: programs.filter((p) => p.status === "published").length,
    totalUsers: users.length,
    universities: users.filter((u) => u.role === "university").length,
    aspirants: users.filter((u) => u.role === "aspirant").length,
    totalApps: applications.length,
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#003f8f] flex items-center justify-center text-white font-bold">
                N
              </div>
              <span className="text-lg font-bold text-slate-800">Nexo</span>
              <span className="text-slate-400 text-sm">/ Super Administrador</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <LayoutDashboard className="w-7 h-7 text-[#003f8f]" />
            <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
          </div>
          <p className="text-slate-500 pl-10">Gestión global de la plataforma Nexo</p>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-[#003f8f]" />
              <span className="text-2xl font-bold text-slate-800">{stats.totalPrograms}</span>
            </div>
            <p className="text-xs text-slate-500">Programas</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-2xl font-bold text-slate-800">{stats.pendingApproval}</span>
            </div>
            <p className="text-xs text-slate-500">Pendientes</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-slate-800">{stats.published}</span>
            </div>
            <p className="text-xs text-slate-500">Publicados</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-slate-800">{stats.totalUsers}</span>
            </div>
            <p className="text-xs text-slate-500">Usuarios</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span className="text-2xl font-bold text-slate-800">{stats.universities}</span>
            </div>
            <p className="text-xs text-slate-500">Universidades</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <GraduationCap className="w-5 h-5 text-pink-600" />
              <span className="text-2xl font-bold text-slate-800">{stats.aspirants}</span>
            </div>
            <p className="text-xs text-slate-500">Aspirantes</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold text-slate-800">{stats.totalApps}</span>
            </div>
            <p className="text-xs text-slate-500">Solicitudes</p>
          </div>
        </div>

        {/* Pending Approval Alert */}
        {stats.pendingApproval > 0 && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 text-sm">
              Hay <strong>{stats.pendingApproval}</strong> convocatoria
              {stats.pendingApproval > 1 ? "s" : ""} pendiente{stats.pendingApproval > 1 ? "s" : ""} de aprobación
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
            Programas ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "users"
                ? "bg-[#003f8f] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" />
            Usuarios ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "applications"
                ? "bg-[#003f8f] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Solicitudes ({applications.length})
          </button>
        </div>

        {/* Programs Tab */}
        {activeTab === "programs" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Programa
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Universidad
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {programs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-slate-400 py-12">
                        No hay programas registrados
                      </td>
                    </tr>
                  ) : (
                    programs.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{p.title}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{p.universityName}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm capitalize">{p.programType}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              p.status === "published"
                                ? "bg-green-100 text-green-700"
                                : p.status === "pending_approval"
                                ? "bg-amber-100 text-amber-700"
                                : p.status === "closed"
                                ? "bg-slate-100 text-slate-700"
                                : p.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {statusLabels[p.status] || p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {new Date(p.createdAt).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <Link
                              href={`/programs/${p.id}`}
                              className="flex items-center gap-1 text-[#003f8f] hover:text-[#002e6b] text-sm font-medium"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver
                            </Link>
                            {p.status === "pending_approval" && (
                              <>
                                <button
                                  onClick={() => handleProgramStatus(p.id, "published")}
                                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => handleProgramStatus(p.id, "rejected")}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Rechazar
                                </button>
                              </>
                            )}
                            {p.status === "published" && (
                              <button
                                onClick={() => handleProgramStatus(p.id, "closed")}
                                className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                Cerrar
                              </button>
                            )}
                            <a
                              href={`/api/programs/${p.id}/export?format=csv`}
                              className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                              <Download className="w-3.5 h-3.5" />
                              CSV
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Universidad
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Registrado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-slate-400 py-12">
                        No hay usuarios registrados
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{u.name}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{u.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              u.role === "super_admin"
                                ? "bg-red-100 text-red-700"
                                : u.role === "university"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {u.role === "super_admin"
                              ? "Super Admin"
                              : u.role === "university"
                              ? "Universidad"
                              : "Aspirante"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{u.universityName || "—"}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              u.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {u.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-ES") : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
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
                      Enviada
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-400 py-12">
                        No hay solicitudes registradas
                      </td>
                    </tr>
                  ) : (
                    applications.map((a) => (
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
                              a.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : a.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : a.status === "under_review"
                                ? "bg-blue-100 text-blue-700"
                                : a.status === "interview"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {appStatusLabels[a.status] || a.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {a.submittedAt
                            ? new Date(a.submittedAt).toLocaleDateString("es-ES")
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}