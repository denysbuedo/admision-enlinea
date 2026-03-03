import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

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
              <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-lg">G</div>
              <span className="text-xl font-bold text-slate-800">GradCall</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/programs" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">
                Programas
              </Link>
              <Link href="/login" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-bg text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            🎓 Academic Admissions Cloud
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Convocatorias de Posgrado<br />
            <span className="text-blue-200">Simplificadas</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Plataforma integral para gestionar convocatorias de maestrías, doctorados y especializaciones.
            Conectamos universidades con los mejores aspirantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/programs" className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg">
              Ver Programas
            </Link>
            <Link href="/register?role=university" className="bg-white/20 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/30 transition-colors text-lg border border-white/30">
              Soy Universidad
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">
            Todo lo que necesitas para gestionar admisiones
          </h2>
          <p className="text-center text-slate-500 mb-12 text-lg">
            Una plataforma completa con estándares internacionales
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏛️",
                title: "Para Universidades",
                desc: "Crea y gestiona convocatorias con todos los campos estándar internacionales. Revisa solicitudes y gestiona el proceso de admisión.",
                color: "bg-blue-50",
              },
              {
                icon: "🎓",
                title: "Para Aspirantes",
                desc: "Explora programas de posgrado, completa tu solicitud con formulario estándar internacional y sigue el estado en tiempo real.",
                color: "bg-purple-50",
              },
              {
                icon: "⚡",
                title: "Gestión Inteligente",
                desc: "Dashboard con métricas, flujo de estados automatizado, notificaciones y exportación de datos en múltiples formatos.",
                color: "bg-green-50",
              },
            ].map((f) => (
              <div key={f.title} className={`${f.color} rounded-2xl p-8`}>
                <div className="text-4xl mb-4">{f.icon}</div>
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
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            Tipos de Programas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { type: "Curso", icon: "📚", color: "bg-blue-100 text-blue-700" },
              { type: "Diplomado", icon: "📜", color: "bg-purple-100 text-purple-700" },
              { type: "Especialización", icon: "🔬", color: "bg-green-100 text-green-700" },
              { type: "Maestría", icon: "🎓", color: "bg-orange-100 text-orange-700" },
              { type: "Doctorado", icon: "🏆", color: "bg-red-100 text-red-700" },
            ].map((p) => (
              <Link
                key={p.type}
                href={`/programs?type=${p.type.toLowerCase()}`}
                className={`${p.color} rounded-xl p-6 text-center hover:opacity-80 transition-opacity`}
              >
                <div className="text-3xl mb-2">{p.icon}</div>
                <div className="font-semibold text-sm">{p.type}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 gradient-bg text-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: "100%", label: "Estándar Internacional" },
              { value: "7", label: "Estados de Solicitud" },
              { value: "3", label: "Roles del Sistema" },
            ].map((s) => (
              <div key={s.label}>
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
            Únete a GradCall y simplifica tu proceso de admisiones
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base px-8 py-3">
              Crear cuenta gratis
            </Link>
            <Link href="/programs" className="btn-secondary text-base px-8 py-3">
              Explorar programas
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded gradient-bg flex items-center justify-center text-white font-bold text-sm">G</div>
            <span className="text-white font-semibold">GradCall</span>
            <span className="text-slate-500">– Academic Admissions Cloud</span>
          </div>
          <div className="text-sm">
            © 2024 GradCall. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
