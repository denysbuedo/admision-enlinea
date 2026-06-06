import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Building2, GraduationCap, Gauge, BookOpen, ScrollText, Microscope, GraduationCap as Masters, Trophy, BarChart3, Users, Clock } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.role === "super_admin") redirect("/admin");
    if (session.role === "university") redirect("/university");
    if (session.role === "aspirant") redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#003f8f] flex items-center justify-center text-white font-bold text-lg">N</div>
              <span className="text-xl font-bold text-slate-800">Nexo</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/programs" className="text-slate-600 hover:text-[#003f8f] font-medium transition-colors">
                Programas
              </Link>
              <Link href="/login" className="text-slate-600 hover:text-[#003f8f] font-medium transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="bg-[#003f8f] text-white font-medium px-5 py-2 rounded-lg hover:bg-[#002e6b] transition-all">
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#003f8f] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Convocatorias de Posgrado
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Gestiona convocatorias de posgrado (cursos, diplomados, maestrías, especialidades, doctorados) y conecta a las universidades con los mejores aspirantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/programs" className="bg-white text-[#003f8f] font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-lg">
              Ver Programas
            </Link>
            <Link href="/register?role=university" className="bg-white/20 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/30 transition-colors text-lg border border-white/30">
              Soy Institución
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">
            Una plataforma diseñada para la gestión integral de admisiones
          </h2>
          <p className="text-center text-slate-500 mb-12 text-lg max-w-2xl mx-auto">
            Soluciones específicas para cada actor del proceso, con estándares internacionales y flujos automatizados.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: "Para instituciones",
                desc: "Diseñe y publique convocatorias con campos estandarizados. Gestione solicitudes, filtre candidatos y administre el flujo de admisión desde un solo lugar.",
                bg: "bg-[#e6f0ff]",
                iconColor: "text-[#003f8f]",
              },
              {
                icon: GraduationCap,
                title: "Para aspirantes",
                desc: "Descubra programas de posgrado, complete solicitudes con formularios internacionales y monitoree el estado de sus postulaciones en tiempo real.",
                bg: "bg-[#e6f0ff]",
                iconColor: "text-[#003f8f]",
              },
              {
                icon: Gauge,
                title: "Gestión inteligente",
                desc: "Dashboards analíticos, flujos de estado automatizados, notificaciones configurables y exportación de datos en múltiples formatos.",
                bg: "bg-[#e6f0ff]",
                iconColor: "text-[#003f8f]",
              },
            ].map((f) => (
              <div key={f.title} className={`${f.bg} rounded-2xl p-8 transition-all hover:shadow-lg`}>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Types */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">
            Tipos de programas
          </h2>
          <p className="text-center text-slate-500 mb-12 text-lg">
            Ofertas académicas para cada etapa de tu formación profesional
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { type: "Curso", icon: BookOpen, color: "bg-[#e6f0ff] text-[#003f8f] hover:bg-[#d4e4ff]" },
              { type: "Diplomado", icon: ScrollText, color: "bg-[#e6f0ff] text-[#003f8f] hover:bg-[#d4e4ff]" },
              { type: "Especialidad", icon: Microscope, color: "bg-[#e6f0ff] text-[#003f8f] hover:bg-[#d4e4ff]" },
              { type: "Maestría", icon: Masters, color: "bg-[#e6f0ff] text-[#003f8f] hover:bg-[#d4e4ff]" },
              { type: "Doctorado", icon: Trophy, color: "bg-[#e6f0ff] text-[#003f8f] hover:bg-[#d4e4ff]" },
            ].map((p) => (
              <Link
                key={p.type}
                href={`/programs?type=${p.type.toLowerCase()}`}
                className={`${p.color} rounded-xl p-6 text-center transition-all hover:scale-105`}
              >
                <div className="flex justify-center mb-3">
                  <p.icon className="w-8 h-8" />
                </div>
                <div className="font-semibold text-sm">{p.type}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-[#003f8f] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: BarChart3, value: "100%", label: "Estándar internacional" },
              { icon: Clock, value: "7", label: "Estados de solicitud" },
              { icon: Users, value: "3", label: "Roles del sistema" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="flex justify-center mb-4">
                  <s.icon className="w-10 h-10 text-blue-200" />
                </div>
                <div className="text-5xl font-bold mb-2">{s.value}</div>
                <div className="text-blue-200 text-lg">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-slate-500 mb-8 text-lg">
            Únete a Nexo y simplifica tu proceso de admisiones
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-[#003f8f] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#002e6b] transition-all shadow-md">
              Crear cuenta gratis
            </Link>
            <Link href="/programs" className="border-2 border-slate-200 text-slate-700 font-bold px-8 py-3 rounded-xl hover:border-[#003f8f] hover:text-[#003f8f] transition-all">
              Explorar programas
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#003f8f] flex items-center justify-center text-white font-bold text-sm">N</div>
            <span className="text-white font-semibold">Nexo</span>
            <span className="text-slate-500">– Plataforma de admisiones de posgrado</span>
          </div>
          <div className="text-sm">
            © 2026 Nexo. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}