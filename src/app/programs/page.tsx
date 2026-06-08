'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePrograms } from '@/hooks/usePrograms';
import {
  Search,
  Filter,
  GraduationCap,
  Clock,
  Building2,
  ArrowLeft,
  BookOpen,
  MapPin,
  Calendar,
  ChevronRight,
  AlertCircle,
  Layers,
} from 'lucide-react';

export default function ProgramsPage() {
  const { programs, loading, error } = usePrograms();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');
  const [maxDuration, setMaxDuration] = useState<number | ''>('');

  const universities = useMemo(
    () => Array.from(new Set(programs.map(p => p.university?.name || p.universityId))).filter(Boolean),
    [programs]
  );

  const degrees = useMemo(
    () => Array.from(new Set(programs.map(p => p.degree))),
    [programs]
  );

  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUniversity = !selectedUniversity ||
        (program.university?.name === selectedUniversity) ||
        (program.universityId === selectedUniversity);

      const matchesDegree = !selectedDegree || program.degree === selectedDegree;

      const matchesDuration = !maxDuration || program.duration <= Number(maxDuration);

      return matchesSearch && matchesUniversity && matchesDegree && matchesDuration;
    });
  }, [programs, searchTerm, selectedUniversity, selectedDegree, maxDuration]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Cargando programas académicos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>Error al cargar los programas: {error}</span>
        </div>
      </div>
    );
  }

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
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-slate-600 hover:text-[#003f8f] transition-colors">
                Inicio
              </Link>
              <Link href="/login" className="text-slate-600 hover:text-[#003f8f] transition-colors">
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="bg-[#003f8f] text-white px-4 py-2 rounded-lg hover:bg-[#002e6b] transition-all text-sm font-medium"
              >
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón volver */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#003f8f] hover:text-[#002e6b] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        {/* Título */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-7 h-7 text-[#003f8f]" />
            <h1 className="text-3xl font-bold text-slate-800">Programas académicos</h1>
          </div>
          <p className="text-slate-500 pl-9">
            Explora nuestra oferta de posgrados y encuentra el programa ideal para ti
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Filter className="w-4 h-4 text-[#003f8f]" />
            <span className="text-sm font-semibold text-slate-700">Filtros de búsqueda</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda por Texto */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all bg-white text-sm"
              />
            </div>

            {/* Filtro por Universidad */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none appearance-none bg-white text-sm"
              >
                <option value="">Todas las universidades</option>
                {universities.map((uni: any) => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
              </div>
            </div>

            {/* Filtro por Grado */}
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none appearance-none bg-white text-sm"
              >
                <option value="">Todos los grados</option>
                {degrees.map((deg: string) => (
                  <option key={deg} value={deg}>{deg}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
              </div>
            </div>

            {/* Filtro por Duración */}
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                placeholder="Duración máxima (semestres)"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all bg-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Resultados */}
        {filteredPrograms.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program: any) => (
                <div
                  key={program.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-[#003f8f]/30 transition-all overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Header del programa */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#003f8f] transition-colors line-clamp-2">
                          {program.name}
                        </h3>
                      </div>
                    </div>

                    {/* Universidad */}
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {program.university?.name || 'Universidad'}
                      </span>
                    </div>

                    {/* Detalles del programa */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {program.degree}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        {program.duration} semestres
                      </div>
                      {program.modality && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                          <Layers className="w-3.5 h-3.5" />
                          {program.modality === 'presencial' && 'Presencial'}
                          {program.modality === 'virtual' && 'Virtual'}
                          {program.modality === 'hibrido' && 'Híbrido'}
                        </div>
                      )}
                    </div>

                    {/* Descripción */}
                    {program.description && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                        {program.description}
                      </p>
                    )}

                    {/* Botón ver detalles */}
                    <Link
                      href={`/programs/${program.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-[#003f8f] text-white py-2.5 rounded-lg hover:bg-[#002e6b] transition-all font-medium text-sm"
                    >
                      Ver detalles
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Contador de resultados */}
            <div className="mt-8 text-center text-sm text-slate-500 bg-white rounded-lg p-4 border border-slate-200">
              Mostrando <span className="font-semibold text-slate-700">{filteredPrograms.length}</span> de{' '}
              <span className="font-semibold text-slate-700">{programs.length}</span> programas
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16">
            <div className="flex justify-center mb-4">
              <Search className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              No se encontraron programas
            </h3>
            <p className="text-slate-400">
              No hay programas que coincidan con los filtros seleccionados.
              <br />
              Intenta ajustar los criterios de búsqueda.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#003f8f] flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <span className="text-slate-700 font-semibold">Nexo</span>
              <span className="text-slate-400 text-sm">– Plataforma de admisiones de posgrado</span>
            </div>
            <div className="text-sm text-slate-400">
              © 2026 Nexo. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}