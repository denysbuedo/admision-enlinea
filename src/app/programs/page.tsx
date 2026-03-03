"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Program {
  id: number;
  title: string;
  programType: string;
  modality: string;
  duration: string;
  language: string;
  location: string;
  totalCost: number;
  currency: string;
  scholarshipsAvailable: boolean;
  deadlineDate: string;
  startDate: string;
  universityName: string;
  universityCountry: string;
  status: string;
}

const typeLabels: Record<string, string> = {
  curso: "Curso",
  diplomado: "Diplomado",
  especializacion: "Especialización",
  maestria: "Maestría",
  doctorado: "Doctorado",
};

const modalityLabels: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  hibrido: "Híbrido",
};

function ProgramsContent() {
  const searchParams = useSearchParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [modalityFilter, setModalityFilter] = useState("");

  useEffect(() => {
    fetch("/api/programs")
      .then(r => r.json())
      .then(data => {
        setPrograms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = programs.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.universityName || "").toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || p.programType === typeFilter;
    const matchModality = !modalityFilter || p.modality === modalityFilter;
    return matchSearch && matchType && matchModality;
  });

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
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-slate-600 hover:text-blue-700 font-medium text-sm">Iniciar Sesión</Link>
              <Link href="/register" className="btn-primary text-sm">Registrarse</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="gradient-bg text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-3">Programas de Posgrado</h1>
          <p className="text-blue-100 mb-6">Encuentra el programa ideal para tu desarrollo profesional</p>
          <input
            type="text"
            placeholder="Buscar por programa o universidad..."
            className="w-full max-w-xl px-5 py-3 rounded-xl text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            className="input-field w-auto"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {Object.entries(typeLabels).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <select
            className="input-field w-auto"
            value={modalityFilter}
            onChange={e => setModalityFilter(e.target.value)}
          >
            <option value="">Todas las modalidades</option>
            {Object.entries(modalityLabels).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <div className="text-slate-500 text-sm flex items-center">
            {filtered.length} programa{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Cargando programas...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No hay programas disponibles</h3>
            <p className="text-slate-400">Intenta con otros filtros o vuelve más tarde</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(program => (
              <Link key={program.id} href={`/programs/${program.id}`} className="card hover:shadow-md transition-shadow block">
                <div className="flex items-start justify-between mb-3">
                  <span className={`status-badge ${
                    program.programType === "doctorado" ? "bg-red-100 text-red-700" :
                    program.programType === "maestria" ? "bg-orange-100 text-orange-700" :
                    program.programType === "especializacion" ? "bg-green-100 text-green-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {typeLabels[program.programType] || program.programType}
                  </span>
                  {program.scholarshipsAvailable && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                      🏆 Becas
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{program.title}</h3>
                <p className="text-blue-700 font-medium text-sm mb-3">{program.universityName}</p>

                <div className="space-y-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{program.location || program.universityCountry || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💻</span>
                    <span>{modalityLabels[program.modality] || program.modality}</span>
                  </div>
                  {program.duration && (
                    <div className="flex items-center gap-2">
                      <span>⏱️</span>
                      <span>{program.duration}</span>
                    </div>
                  )}
                  {program.deadlineDate && (
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>Cierre: {new Date(program.deadlineDate).toLocaleDateString("es-ES")}</span>
                    </div>
                  )}
                </div>

                {program.totalCost && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Costo total</span>
                    <span className="font-bold text-slate-700">
                      {program.currency} {program.totalCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ProgramsContent />
    </Suspense>
  );
}
