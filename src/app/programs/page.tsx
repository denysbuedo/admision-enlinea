'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link'; // 1. Importar Link para la navegación
import { usePrograms } from '@/hooks/usePrograms';
import { Search, Filter, GraduationCap, Clock, Building2, ArrowLeft } from 'lucide-react'; // 2. Importar ArrowLeft

export default function ProgramsPage() {
  const { programs, loading, error } = usePrograms();
  
  // Estados de los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');
  const [maxDuration, setMaxDuration] = useState<number | ''>('');

  // Extraer valores únicos para los selects
  const universities = useMemo(() => 
    Array.from(new Set(programs.map(p => p.university?.name || p.universityId))).filter(Boolean),
  [programs]);

  const degrees = useMemo(() => 
    Array.from(new Set(programs.map(p => p.degree))),
  [programs]);

  // Lógica de filtrado
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

  if (loading) return <div className="p-8 text-center">Cargando programas...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      {/* 3. Botón Volver agregado aquí */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-gray-900">Buscar Programas Académicos</h1>

      {/* Barra de Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border border-gray-200">
        
        {/* Búsqueda por Texto */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>

        {/* Filtro por Universidad */}
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
          >
            <option value="">Todas las universidades</option>
            {universities.map((uni: any) => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Grado */}
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <select
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
          >
            <option value="">Todos los grados</option>
            {degrees.map((deg: string) => (
              <option key={deg} value={deg}>{deg}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Duración */}
        <div className="relative">
          <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="number"
            placeholder="Duración máx (semestres)"
            value={maxDuration}
            onChange={(e) => setMaxDuration(e.target.value ? Number(e.target.value) : '')}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((program: any) => (
            <div key={program.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-100 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{program.name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                {program.university?.name || 'Universidad'}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  {program.degree}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {program.duration} semestres
                </span>
              </div>
              <p className="text-gray-700 mb-6 line-clamp-3 flex-grow">{program.description}</p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Ver Detalles
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
            No se encontraron programas con los filtros seleccionados.
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        Mostrando {filteredPrograms.length} de {programs.length} programas
      </div>
    </div>
  );
}