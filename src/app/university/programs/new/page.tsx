"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  CheckSquare,
  DollarSign,
  Search,
  Scale,
  GraduationCap,
  MapPin,
  Clock,
  Globe,
  CreditCard,
  Award,
  Mic,
  PenTool,
  Shield,
  Send,
  BookOpen,
  Users,
  Briefcase,
  Languages,
} from "lucide-react";

const REQUIRED_DOCS = [
  "CV / Hoja de vida",
  "Título universitario",
  "Certificado de notas",
  "Carta de motivación",
  "Cartas de recomendación",
  "Documento de identidad",
  "Portafolio",
];

export default function NewProgramPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(0);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([
    "CV / Hoja de vida",
    "Título universitario",
    "Certificado de notas",
    "Carta de motivación",
    "Documento de identidad",
  ]);

  const [form, setForm] = useState({
    title: "",
    programType: "maestria",
    modality: "presencial",
    duration: "",
    language: "Español",
    location: "",
    credits: "",
    description: "",
    openDate: "",
    deadlineDate: "",
    resultsDate: "",
    startDate: "",
    minDegree: "",
    minGpa: "",
    professionalExperience: "",
    languageRequirements: "",
    eligibilityNotes: "",
    totalCost: "",
    currency: "USD",
    paymentMethods: "",
    scholarshipsAvailable: false,
    scholarshipsInfo: "",
    refundPolicy: "",
    selectionProcess: "",
    hasInterview: false,
    hasExam: false,
    privacyPolicy: "",
    termsConditions: "",
  });

  const SECTIONS = [
    { name: "General", icon: FileText },
    { name: "Fechas", icon: Calendar },
    { name: "Elegibilidad", icon: CheckSquare },
    { name: "Financiero", icon: DollarSign },
    { name: "Selección", icon: Search },
    { name: "Legal", icon: Scale },
  ];

  const handleSubmit = async () => {
    if (!form.title || !form.programType || !form.modality) {
      setError("Título, tipo y modalidad son requeridos");
      setActiveSection(0);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          credits: form.credits ? parseInt(form.credits) : null,
          minGpa: form.minGpa ? parseFloat(form.minGpa) : null,
          totalCost: form.totalCost ? parseFloat(form.totalCost) : null,
          requiredDocuments: selectedDocs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear el programa");
      } else {
        router.push("/university");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const toggleDoc = (doc: string) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/university"
              className="flex items-center gap-2 text-slate-600 hover:text-[#003f8f] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver al panel</span>
            </Link>
            <div className="flex items-center gap-4">
              {error && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 bg-[#003f8f] text-white font-medium px-5 py-2 rounded-lg hover:bg-[#002e6b] transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Save className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar para aprobación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Nuevo programa</h1>
          <p className="text-slate-500 mt-1">
            Complete la información del programa de posgrado
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
          {SECTIONS.map((section, i) => (
            <button
              key={section.name}
              onClick={() => setActiveSection(i)}
              className={`flex items-center gap-2 flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === i
                  ? "bg-[#003f8f] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.name}
            </button>
          ))}
        </div>

        {/* Section 1: General */}
        {activeSection === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Información general</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Título del programa *
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  placeholder="Ej: Maestría en Ciencias de Datos"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tipo de programa *
                </label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  value={form.programType}
                  onChange={(e) => setForm({ ...form, programType: e.target.value })}
                >
                  <option value="curso">Curso</option>
                  <option value="diplomado">Diplomado</option>
                  <option value="especializacion">Especialización</option>
                  <option value="maestria">Maestría</option>
                  <option value="doctorado">Doctorado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Modalidad *
                </label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  value={form.modality}
                  onChange={(e) => setForm({ ...form, modality: e.target.value })}
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Duración
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  placeholder="Ej: 2 años, 4 semestres"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Idioma
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                    placeholder="Ej: Bogotá, Colombia"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Créditos
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  placeholder="Número de créditos"
                  value={form.credits}
                  onChange={(e) => setForm({ ...form, credits: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none"
                  rows={4}
                  placeholder="Describa el programa, sus objetivos y perfil del egresado..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Dates */}
        {activeSection === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Fechas clave</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Apertura de programa
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  value={form.openDate}
                  onChange={(e) => setForm({ ...form, openDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Cierre de postulaciones
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  value={form.deadlineDate}
                  onChange={(e) => setForm({ ...form, deadlineDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Publicación de resultados
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  value={form.resultsDate}
                  onChange={(e) => setForm({ ...form, resultsDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Inicio del programa
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Eligibility */}
        {activeSection === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckSquare className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Requisitos de elegibilidad</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Título mínimo requerido
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                    placeholder="Ej: Título universitario de pregrado"
                    value={form.minDegree}
                    onChange={(e) => setForm({ ...form, minDegree: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Promedio mínimo (GPA)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  placeholder="Ej: 3.5"
                  value={form.minGpa}
                  onChange={(e) => setForm({ ...form, minGpa: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Experiencia profesional
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                    placeholder="Ej: Mínimo 2 años de experiencia"
                    value={form.professionalExperience}
                    onChange={(e) =>
                      setForm({ ...form, professionalExperience: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Requisitos de idioma
                </label>
                <div className="relative">
                  <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                    placeholder="Ej: Inglés B2 (IELTS 6.0)"
                    value={form.languageRequirements}
                    onChange={(e) =>
                      setForm({ ...form, languageRequirements: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Información adicional sobre elegibilidad..."
                  value={form.eligibilityNotes}
                  onChange={(e) => setForm({ ...form, eligibilityNotes: e.target.value })}
                />
              </div>
            </div>

            {/* Documentos requeridos */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Documentos requeridos
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {REQUIRED_DOCS.map((doc) => (
                  <label
                    key={doc}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDocs.includes(doc)
                        ? "border-[#003f8f] bg-[#e6f0ff]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc)}
                      onChange={() => toggleDoc(doc)}
                      className="accent-[#003f8f]"
                    />
                    <span className="text-sm font-medium text-slate-700">{doc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Financial */}
        {activeSection === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <DollarSign className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Información financiera</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Costo total
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                    placeholder="0.00"
                    value={form.totalCost}
                    onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Moneda
                </label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  <option value="USD">USD - Dólar estadounidense</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="COP">COP - Peso colombiano</option>
                  <option value="MXN">MXN - Peso mexicano</option>
                  <option value="BRL">BRL - Real brasileño</option>
                  <option value="ARS">ARS - Peso argentino</option>
                  <option value="CLP">CLP - Peso chileno</option>
                  <option value="PEN">PEN - Sol peruano</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Formas de pago
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none"
                    rows={2}
                    placeholder="Ej: Pago único, cuotas semestrales, financiamiento bancario..."
                    value={form.paymentMethods}
                    onChange={(e) => setForm({ ...form, paymentMethods: e.target.value })}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.scholarshipsAvailable
                      ? "border-amber-400 bg-amber-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.scholarshipsAvailable}
                    onChange={(e) =>
                      setForm({ ...form, scholarshipsAvailable: e.target.checked })
                    }
                    className="accent-[#003f8f]"
                  />
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-slate-700">Becas disponibles</span>
                  </div>
                </label>
              </div>
              {form.scholarshipsAvailable && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Información de becas
                  </label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Describa los tipos de becas, requisitos y montos disponibles..."
                    value={form.scholarshipsInfo}
                    onChange={(e) => setForm({ ...form, scholarshipsInfo: e.target.value })}
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Política de reembolso
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none"
                  rows={2}
                  placeholder="Condiciones para reembolsos y cancelaciones..."
                  value={form.refundPolicy}
                  onChange={(e) => setForm({ ...form, refundPolicy: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Selection */}
        {activeSection === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Search className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Proceso de selección</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Descripción del proceso
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none"
                  rows={4}
                  placeholder="Describa las etapas del proceso de selección..."
                  value={form.selectionProcess}
                  onChange={(e) => setForm({ ...form, selectionProcess: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.hasInterview
                      ? "border-purple-400 bg-purple-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.hasInterview}
                    onChange={(e) => setForm({ ...form, hasInterview: e.target.checked })}
                    className="accent-[#003f8f]"
                  />
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-semibold text-slate-700">Entrevista</div>
                      <div className="text-xs text-slate-500">Incluye entrevista personal</div>
                    </div>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.hasExam
                      ? "border-orange-400 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.hasExam}
                    onChange={(e) => setForm({ ...form, hasExam: e.target.checked })}
                    className="accent-[#003f8f]"
                  />
                  <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="font-semibold text-slate-700">Examen</div>
                      <div className="text-xs text-slate-500">Incluye examen de admisión</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Legal */}
        {activeSection === 5 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Scale className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Información legal</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Política de privacidad
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none"
                    rows={4}
                    placeholder="Describa cómo se tratarán los datos personales de los aspirantes..."
                    value={form.privacyPolicy}
                    onChange={(e) => setForm({ ...form, privacyPolicy: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Términos y condiciones
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none"
                    rows={4}
                    placeholder="Términos y condiciones del proceso de admisión..."
                    value={form.termsConditions}
                    onChange={(e) => setForm({ ...form, termsConditions: e.target.value })}
                  />
                </div>
              </div>

              {/* Alerta de aprobación */}
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  Al enviar este programa, será revisado por el equipo administrativo antes de ser publicado.
                </div>
              </div>

              {/* Botón final */}
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-[#003f8f] text-white font-semibold py-3 rounded-lg hover:bg-[#002e6b] transition-all disabled:opacity-50 text-base"
              >
                {saving ? (
                  <>
                    <Save className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar para aprobación
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Navegación entre secciones */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
            className="px-5 py-2 rounded-lg border-2 border-slate-200 text-slate-600 font-medium hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          {activeSection < SECTIONS.length - 1 && (
            <button
              onClick={() => setActiveSection(activeSection + 1)}
              className="px-5 py-2 rounded-lg bg-[#003f8f] text-white font-medium hover:bg-[#002e6b] transition-all"
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}