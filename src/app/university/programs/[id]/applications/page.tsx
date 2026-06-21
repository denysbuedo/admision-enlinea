"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Users,
  Eye,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  Inbox,
} from "lucide-react";

interface Application {
  id: number;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  programTitle: string;
  submittedAt: string;
  score: number;
  reviewNotes: string;
}

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

export default function ProgramApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [programTitle, setProgramTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/applications").then((r) => r.json()),
      fetch(`/api/programs/${params.id}`).then((r) => r.json()),
    ])
      .then(([apps, program]) => {
        if (apps.error === "No autorizado" || program.error === "No autorizado") {
          router.push("/login");
          return;
        }
        if (program.error) {
          router.push("/university");
          return;
        }
        setProgramTitle(program.title || "");
        const filtered = Array.isArray(apps)
          ? apps.filter((a: Application & { programId: number }) => a.programId === Number(params.id))
          : [];
        setApplications(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id, router]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Cargando solicitudes...</div>
      </div>
    );

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
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-6 h-6 text-[#003f8f]" />
          <h1 className="text-2xl font-bold text-slate-800">Solicitudes</h1>
        </div>
        <p className="text-slate-500 pl-8 mb-6">
          {programTitle ? `Programa: ${programTitle}` : "Gestiona las postulaciones"}
        </p>

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-12">
            <div className="flex justify-center mb-4">
              <Inbox className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Sin solicitudes</h3>
            <p className="text-slate-400">Aún no hay postulaciones para este programa</p>
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
                      Estado
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Puntaje
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
                        {a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : `Solicitud #${a.id}`}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{a.email || "—"}</td>
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
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            Borrador
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {a.score ? (
                          <div className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-semibold text-slate-700">{a.score}</span>
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
      </div>
    </div>
  );
}
