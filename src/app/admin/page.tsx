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
  FileCheck,
  Plus,
  Globe,
  MapPin,
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

interface University {
  id: number;
  name: string;
  country: string | null;
  city: string | null;
  faculty: string | null;
  website: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
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
  const [univList, setUnivList] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"programs" | "users" | "applications" | "universities">("programs");
  const [message, setMessage] = useState({ type: "", text: "" });

  // University modal state
  const [showUnivModal, setShowUnivModal] = useState(false);
  const [univForm, setUnivForm] = useState({ name: "", country: "", city: "", faculty: "", website: "", description: "" });
  const [univLoading, setUnivLoading] = useState(false);
  const [univMsg, setUnivMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUniversities = async () => {
    const res = await fetch("/api/admin/universities");
    if (res.ok) {
      const data = await res.json();
      setUnivList(Array.isArray(data) ? data : []);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/programs").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/applications").then((r) => r.json()),
      fetch("/api/admin/universities").then((r) => r.json()),
    ])
      .then(([progs, usrs, apps, univs]) => {
        if (progs.error === "No autorizado" || usrs.error === "No autorizado") {
          router.push("/login");
          return;
        }
        setPrograms(Array.isArray(progs) ? progs : []);
        setUsers(Array.isArray(usrs) ? usrs : []);
        setApplications(Array.isArray(apps) ? apps : []);
        setUnivList(Array.isArray(univs) ? univs : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleCreateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnivLoading(true);
    setUnivMsg(null);
    try {
      const res = await fetch("/api/admin/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(univForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUnivMsg({ type: "success", text: "Universidad creada correctamente" });
        setUnivForm({ name: "", country: "", city: "", faculty: "", website: "", description: "" });
        fetchUniversities();
        setTimeout(() => {
          setShowUnivModal(false);
          setUnivMsg(null);
        }, 1500);
      } else {
        setUnivMsg({ type: "error", text: data.error || "Error al crear universidad" });
      }
    } catch {
      setUnivMsg({ type: "error", text: "Error de conexión" });
    }
    setUnivLoading(false);
  };

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
              Hay <strong>{stats.pendingApproval}</strong> programa
              {stats.pendingApproval > 1 ? "s" : ""} pendiente{stats.pendingApproval > 1 ? "s" : ""} de aprobación
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-sm">
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
            onClick={() => setActiveTab("universities")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "universities"
                ? "bg-[#003f8f] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Universidades ({univList.length})
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

        {/* Universities Tab */}
        {activeTab === "universities" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-800">Universidades Registradas</h2>
              <button
                onClick={() => { setShowUnivModal(true); setUnivMsg(null); }}
                className="flex items-center gap-2 bg-[#003f8f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002e6b] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva Universidad
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Universidad</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Facultad</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">País / Ciudad</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Web</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {univList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-400 py-12">
                        No hay universidades registradas. ¡Crea la primera!
                      </td>
                    </tr>
                  ) : (
                    univList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{u.name}</div>
                          {u.description && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{u.description}</div>}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{u.faculty || "—"}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {[u.city, u.country].filter(Boolean).join(", ") || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {u.website ? (
                            <a href={u.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#003f8f] hover:underline">
                              <Globe className="w-3 h-3" />
                              Sitio web
                            </a>
                          ) : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {u.isActive ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* University Creation Modal */}
        {showUnivModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#003f8f]" />
                  <h2 className="text-lg font-semibold text-slate-800">Nueva Universidad</h2>
                </div>
                <button
                  onClick={() => { setShowUnivModal(false); setUnivMsg(null); setUnivForm({ name: "", country: "", city: "", faculty: "", website: "", description: "" }); }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateUniversity} className="px-6 py-5 space-y-4">
                {univMsg && (
                  <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    univMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {univMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {univMsg.text}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={univForm.name}
                    onChange={(e) => setUnivForm({ ...univForm, name: e.target.value })}
                    placeholder="Ej: Universidad de La Habana"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f8f] focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">País</label>
                    <input
                      type="text"
                      value={univForm.country}
                      onChange={(e) => setUnivForm({ ...univForm, country: e.target.value })}
                      placeholder="Ej: Cuba"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f8f] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={univForm.city}
                      onChange={(e) => setUnivForm({ ...univForm, city: e.target.value })}
                      placeholder="Ej: La Habana"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f8f] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facultad / Unidad</label>
                  <input
                    type="text"
                    value={univForm.faculty}
                    onChange={(e) => setUnivForm({ ...univForm, faculty: e.target.value })}
                    placeholder="Ej: Facultad de Ciencias Exactas"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f8f] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sitio Web</label>
                  <input
                    type="url"
                    value={univForm.website}
                    onChange={(e) => setUnivForm({ ...univForm, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f8f] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea
                    value={univForm.description}
                    onChange={(e) => setUnivForm({ ...univForm, description: e.target.value })}
                    placeholder="Breve descripción de la institución..."
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f8f] focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowUnivModal(false); setUnivMsg(null); setUnivForm({ name: "", country: "", city: "", faculty: "", website: "", description: "" }); }}
                    className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={univLoading}
                    className="flex-1 bg-[#003f8f] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#002e6b] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {univLoading ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
                    ) : (
                      <><Plus className="w-4 h-4" /> Crear Universidad</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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