"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/applications").then(r => r.json()),
      fetch("/api/notifications").then(r => r.json()),
    ]).then(([apps, notifs]) => {
      if (apps.error === "No autorizado") {
        router.push("/login");
        return;
      }
      setApplications(Array.isArray(apps) ? apps : []);
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === "submitted").length,
    approved: applications.filter(a => a.status === "approved").length,
    pending: applications.filter(a => ["draft", "submitted", "under_review", "interview", "waitlisted"].includes(a.status)).length,
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold">G</div>
              <span className="text-lg font-bold text-slate-800">GradCall</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/programs" className="text-slate-600 hover:text-blue-700 text-sm font-medium">
                Ver Programas
              </Link>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {unreadCount} nuevas
                </span>
              )}
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 text-sm">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Mi Dashboard</h1>
          <p className="text-slate-500">Gestiona tus postulaciones a programas de posgrado</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Solicitudes", value: stats.total, icon: "📋", color: "bg-blue-50 text-blue-700" },
            { label: "Enviadas", value: stats.submitted, icon: "📤", color: "bg-purple-50 text-purple-700" },
            { label: "En Proceso", value: stats.pending, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
            { label: "Aprobadas", value: stats.approved, icon: "✅", color: "bg-green-50 text-green-700" },
          ].map(s => (
            <div key={s.label} className="metric-card">
              <div className={`metric-icon ${s.color}`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Mis Solicitudes</h2>
              <Link href="/programs" className="btn-primary text-sm">
                + Nueva Postulación
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No tienes solicitudes aún</h3>
                <p className="text-slate-400 mb-4">Explora los programas disponibles y postúlate</p>
                <Link href="/programs" className="btn-primary">Ver Programas</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <Link key={app.id} href={`/dashboard/applications/${app.id}`}
                    className="card block hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800">{app.programTitle}</h3>
                        <p className="text-slate-500 text-sm mt-0.5">
                          {app.submittedAt
                            ? `Enviada el ${new Date(app.submittedAt).toLocaleDateString("es-ES")}`
                            : `Creada el ${new Date(app.createdAt).toLocaleDateString("es-ES")}`}
                        </p>
                      </div>
                      <span className={`status-badge status-${app.status}`}>
                        {statusLabels[app.status] || app.status}
                      </span>
                    </div>
                    {app.score && (
                      <div className="mt-2 text-sm text-slate-500">
                        Puntaje: <span className="font-semibold text-slate-700">{app.score}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Notificaciones</h2>
            {notifications.length === 0 ? (
              <div className="card text-center py-8 text-slate-400">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm">Sin notificaciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 8).map(notif => (
                  <div key={notif.id} className={`card p-3 ${!notif.isRead ? "border-l-4 border-blue-500" : ""}`}>
                    <div className="font-semibold text-slate-700 text-sm">{notif.title}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{notif.message}</div>
                    <div className="text-slate-400 text-xs mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("es-ES")}
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
