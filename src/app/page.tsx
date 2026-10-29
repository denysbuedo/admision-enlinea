import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowUpRight, ArrowRight, BookOpen, Building2, ClipboardCheck, GraduationCap, Search } from "lucide-react";
import Brand from "@/components/Brand";

export const dynamic = "force-dynamic";

const programs = [
  { name: "Cursos", type: "curso", icon: "curso", detail: "Amplía tus conocimientos" },
  { name: "Diplomados", type: "diplomado", icon: "diplomado", detail: "Profundiza en tu especialidad" },
  { name: "Especialidades", type: "especializacion", icon: "especialidad", detail: "Desarrolla tu práctica profesional" },
  { name: "Maestrías", type: "maestria", icon: "maestria", detail: "Da el siguiente paso" },
  { name: "Doctorados", type: "doctorado", icon: "doctorado", detail: "Abre caminos en la investigación" },
];

export default async function HomePage() {
  const session = await getSession();
  if (session?.role === "super_admin") redirect("/admin");
  if (session?.role === "university") redirect("/university");
  if (session?.role === "aspirant") redirect("/dashboard");

  return (
    <div className="convoca-home">
      <main>
        <section className="home-hero">
          <div className="site-container hero-layout">
            <div className="hero-copy">
              <p className="eyebrow"><span /> EDUCACIÓN SUPERIOR · CUBA</p>
              <h1>Tu próxima oportunidad <em>comienza aquí.</em></h1>
              <p className="hero-description">Descubre cursos, diplomados, especialidades, maestrías y doctorados. Consulta programas, presenta tu solicitud y sigue el proceso de admisión desde un solo lugar.</p>
              <div className="hero-actions">
                <Link href="/programs" className="mint-button">Explorar programas <ArrowRight size={18} /></Link>
                <Link href="/login" className="outline-button">Soy institución <ArrowUpRight size={18} /></Link>
              </div>
              <p className="hero-signature">Conecta oportunidades. Impulsa trayectorias.</p>
            </div>
            <aside className="opportunity-panel" aria-label="Tu trayectoria académica">
              <div className="panel-heading"><span>EL SIGUIENTE PASO ES TUYO</span><GraduationCap size={24} /></div>
              <h2>Una oportunidad.<br />Nuevos caminos.</h2>
              <div className="journey-step"><span>01</span><div><strong>Encuentra tu programa</strong><p>Explora la oferta de las instituciones.</p></div><Search size={20} /></div>
              <div className="journey-step"><span>02</span><div><strong>Prepara tu postulación</strong><p>Consulta requisitos y fechas.</p></div><BookOpen size={20} /></div>
              <div className="journey-step"><span>03</span><div><strong>Sigue tu solicitud</strong><p>Acompaña cada etapa del proceso.</p></div><ClipboardCheck size={20} /></div>
              <div className="panel-footer"><span className="status-dot" /> TU FORMACIÓN, EN UN SOLO LUGAR</div>
            </aside>
          </div>
        </section>
        <section className="home-programs site-container">
          <div className="section-heading"><div><p className="section-kicker">ENCUENTRA TU CAMINO</p><h2>Formación para seguir creciendo</h2></div><Link href="/programs">Ver programas <ArrowUpRight size={18} /></Link></div>
          <div className="program-type-grid">{programs.map((p, i) => <Link key={p.type} href={`/programs?type=${p.type}`} className="program-type"><span className="type-number">0{i + 1}</span><span className="program-type-icon"><Image src={`/brand/programs/icono-${p.icon}.svg`} alt="" width={28} height={28} /></span><h3>{p.name}</h3><p>{p.detail}</p><ArrowUpRight size={19} className="type-arrow" /></Link>)}</div>
        </section>
        <section className="home-process" id="como-funciona"><div className="site-container">
          <div className="section-heading"><div><p className="section-kicker">CLARIDAD EN CADA ETAPA</p><h2>Explora. Postula. Avanza.</h2></div><p>Tu trayectoria académica merece un proceso organizado.</p></div>
          <div className="process-grid">{[
            { icon: Search, title: "Explora tus opciones", text: "Encuentra programas y revisa sus requisitos, modalidades y plazos antes de postular." },
            { icon: ClipboardCheck, title: "Presenta tu solicitud", text: "Crea tu cuenta y completa la información de tu postulación en un espacio organizado." },
            { icon: GraduationCap, title: "Consulta tu avance", text: "Accede a tus solicitudes y consulta el estado de tu proceso de admisión." },
          ].map((item, i) => <article key={item.title}><div className="process-icon"><item.icon size={24} /><span>0{i + 1}</span></div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
        </div></section>
        <section className="institution-section"><div className="site-container institution-card"><Building2 size={44} strokeWidth={1.3} /><div><p className="eyebrow">ESPACIO INSTITUCIONAL</p><h2>Publica programas.<br />Gestiona admisiones.</h2><p>Organiza tu oferta académica, revisa aspirantes y da seguimiento a las solicitudes desde una plataforma centralizada.</p></div><Link href="/login" className="mint-button">Acceso institucional <ArrowUpRight size={18} /></Link></div></section>
      </main>
      <footer className="public-footer"><div className="site-container"><Link href="/" aria-label="CONVOCA · Inicio"><Brand inverse /></Link><p>Una plataforma de RedUniv<br /><span>Ministerio de Educación Superior de Cuba</span></p><span>Conecta oportunidades.<br />Impulsa trayectorias.</span></div></footer>
    </div>
  );
}
