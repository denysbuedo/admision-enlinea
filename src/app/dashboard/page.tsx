"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Send,
  Clock,
  CheckCircle,
  Bell,
  LogOut,
  PlusCircle,
  Search,
  Award,
  AlertCircle,
  ChevronRight,
  Inbox,
} from "lucide-react";

interface Application {
  id: number;
  status: string;
  submittedAt: string;
  createdAt: string;
  programId: number;
  programTitle: string;
  programType: string;
  score: number;
  reviewNotes: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
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

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/applications").then((r) => r.json()),
      fetch("/api/notifications").then((r) => r.json()),
    ])
      .then(([apps, notifs]) => {
        if (apps.error === "No autorizado") {
          router.push("/login");
          return;
        }
        setApplications(Array.isArray(apps) ? apps : []);
        setNotifications(Array.isArray(notifs) ? notifs : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const stats = {
    total: applications.length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    approved: applications.filter((a) => a.status === "approved").length,
    pending: applications.filter((a) =>
      ["draft", "submitted", "under_review", "interview", "waitlisted"].includes(a.status)
    ).length,
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Cargando dashboard...</div>
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
              <span className="text-slate-400 text-sm hidden sm:inline">/ Aspirante</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/programs"
                className="hidden sm:flex items-center gap-1 text-slate-600 hover:text-[#003f8f] text-sm font-medium transition-colors"
              >
                <Search className="w-4 h-4" />
                Ver programas
              </Link>
              {unreadCount > 0 && (
                <div className="relative">
                  <Bell className="w-5 h-5 text-slate-500" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                </div>
              )}
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
            <h1 className="text-2xl font-bold text-slate-800">Mi Dashboard</h1>
          </div>
          <p className="text-slate-500 pl-8">
            Gestiona tus postulaciones a programas de posgrado
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-[#003f8f]" />
              <span className="text-2xl font-bold text-slate-800">{stats.total}</span>
            </div>
            <p className="text-xs text-slate-500">Total solicitudes</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Send className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-slate-800">{stats.submitted}</span>
            </div>
            <p className="text-xs text-slate-500">Enviadas</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-2xl font-bold text-slate-800">{stats.pending}</span>
            </div>
            <p className="text-xs text-slate-500">En proceso</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-slate-800">{stats.approved}</span>
            </div>
            <p className="text-xs text-slate-500">Aprobadas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sección de Solicitudes */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#003f8f]" />
                Mis solicitudes
              </h2>
              <Link
                href="/programs"
                className="flex items-center gap-1 bg-[#003f8f] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[#002e6b] transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Nueva postulación
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-12">
                <div className="flex justify-center mb-4">
                  <Inbox className="w-16 h-16 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No tienes solicitudes aún
                </h3>
                <p className="text-slate-400 mb-4">
                  Explora los programas disponibles y comienza tu postulación
                </p>
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 bg-[#003f8f] text-white font-medium px-5 py-2 rounded-lg hover:bg-[#002e6b] transition-all"
                >
                  <Search className="w-4 h-4" />
                  Ver programas
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/dashboard/applications/${app.id}`}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 block hover:shadow-md hover:border-[#003f8f]/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800">{app.programTitle}</h3>
                        <p className="text-slate-500 text-sm mt-1">
                          {app.submittedAt
                            ? `Enviada el ${new Date(app.submittedAt).toLocaleDateString("es-ES")}`
                            : `Creada el ${new Date(app.createdAt).tolocaleDateString("es-ES")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[app.status]}`}
                        >
                          {statusLabels[app.status] || app.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    {app.score !== undefined && app.score > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-slate-500">Puntaje:</span>
                        <span className="font-semibold text-slate-700">{app.score}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sección de Notificaciones */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#003f8f]" />
              Notificaciones
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {unreadCount} nuevas
                </span>
              )}
            </h2>
            {notifications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-8">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Sin notificaciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 8).map((notif) => (
                  <div
                    key={notif.id}
                    className={`bg-white rounded-xl p-3 shadow-sm border transition-all ${
                      !notif.isRead
                        ? "border-l-4 border-l-[#003f8f] border-slate-200"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#003f8f] mt-1.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-slate-700 text-sm">
                          {notif.title}
                        </div>
                        <div className="text-slate-500 text-xs mt-1 line-clamp-2">
                          {notif.message}
                        </div>
                        <div className="text-slate-400 text-xs mt-2">
                          {new Date(notif.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}