"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    "CV / Hoja de vida", "Título universitario", "Certificado de notas", "Carta de motivación", "Documento de identidad"
  ]);

  const [form, setForm] = useState({
    // General
    title: "",
    programType: "maestria",
    modality: "presencial",
    duration: "",
    language: "Español",
    location: "",
    credits: "",
    description: "",
    // Dates
    openDate: "",
    deadlineDate: "",
    resultsDate: "",
    startDate: "",
    // Eligibility
    minDegree: "",
    minGpa: "",
    professionalExperience: "",
    languageRequirements: "",
    eligibilityNotes: "",
    // Financial
    totalCost: "",
    currency: "USD",
    paymentMethods: "",
    scholarshipsAvailable: false,
    scholarshipsInfo: "",
    refundPolicy: "",
    // Selection
    selectionProcess: "",
    hasInterview: false,
    hasExam: false,
    // Legal
    privacyPolicy: "",
    termsConditions: "",
  });

  const SECTIONS = ["General", "Fechas", "Elegibilidad", "Financiero", "Selección", "Legal"];

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
    setSelectedDocs(prev =>
      prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/university" className="text-slate-600 hover:text-blue-700">
              ← Panel Universidad
            </Link>
            <div className="flex items-center gap-3">
              {error && <span className="text-red-600 text-sm">{error}</span>}
              <button onClick={handleSubmit} disabled={saving} className="btn-primary">
                {saving ? "Guardando..." : "Enviar para Aprobación"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Nueva Convocatoria</h1>
          <p className="text-slate-500">Completa la información del programa de posgrado</p>
        </div>

        {/* Section Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200">
          {SECTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => setActiveSection(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === i ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {/* Section 1: General */}
        {activeSection === 0 && (
          <div className="form-section">
            <h2 className="form-section-title">📋 Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Título del programa *</label>
                <input className="input-field" placeholder="Ej: Maestría en Ciencias de Datos"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Tipo de programa *</label>
                <select className="input-field" value={form.programType}
                  onChange={e => setForm({ ...form, programType: e.target.value })}>
                  <option value="curso">Curso</option>
                  <option value="diplomado">Diplomado</option>
                  <option value="especializacion">Especialización</option>
                  <option value="maestria">Maestría</option>
                  <option value="doctorado">Doctorado</option>
                </select>
              </div>
              <div>
                <label className="label">Modalidad *</label>
                <select className="input-field" value={form.modality}
                  onChange={e => setForm({ ...form, modality: e.target.value })}>
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="label">Duración</label>
                <input className="input-field" placeholder="Ej: 2 años, 4 semestres"
                  value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div>
                <label className="label">Idioma de instrucción</label>
                <input className="input-field" value={form.language}
                  onChange={e => setForm({ ...form, language: e.target.value })} />
              </div>
              <div>
                <label className="label">Ubicación / Ciudad</label>
                <input className="input-field" placeholder="Ej: Bogotá, Colombia"
                  value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <label className="label">Créditos académicos</label>
                <input type="number" className="input-field" value={form.credits}
                  onChange={e => setForm({ ...form, credits: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Descripción del programa</label>
                <textarea className="input-field" rows={4}
                  placeholder="Describe el programa, sus objetivos y perfil del egresado..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Dates */}
        {activeSection === 1 && (
          <div className="form-section">
            <h2 className="form-section-title">📅 Fechas Clave</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Fecha de apertura</label>
                <input type="date" className="input-field" value={form.openDate}
                  onChange={e => setForm({ ...form, openDate: e.target.value })} />
              </div>
              <div>
                <label className="label">Fecha límite de postulación</label>
                <input type="date" className="input-field" value={form.deadlineDate}
                  onChange={e => setForm({ ...form, deadlineDate: e.target.value })} />
              </div>
              <div>
                <label className="label">Fecha de publicación de resultados</label>
                <input type="date" className="input-field" value={form.resultsDate}
                  onChange={e => setForm({ ...form, resultsDate: e.target.value })} />
              </div>
              <div>
                <label className="label">Fecha de inicio del programa</label>
                <input type="date" className="input-field" value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Eligibility */}
        {activeSection === 2 && (
          <div className="form-section">
            <h2 className="form-section-title">✅ Requisitos de Elegibilidad</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Título mínimo requerido</label>
                <input className="input-field" placeholder="Ej: Título universitario de pregrado"
                  value={form.minDegree} onChange={e => setForm({ ...form, minDegree: e.target.value })} />
              </div>
              <div>
                <label className="label">Promedio mínimo (GPA)</label>
                <input type="number" step="0.1" min="0" max="5" className="input-field"
                  placeholder="Ej: 3.5" value={form.minGpa}
                  onChange={e => setForm({ ...form, minGpa: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Experiencia profesional requerida</label>
                <input className="input-field" placeholder="Ej: Mínimo 2 años de experiencia en el área"
                  value={form.professionalExperience}
                  onChange={e => setForm({ ...form, professionalExperience: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Requisitos de idioma</label>
                <input className="input-field" placeholder="Ej: Inglés B2 (IELTS 6.0 o TOEFL 80)"
                  value={form.languageRequirements}
                  onChange={e => setForm({ ...form, languageRequirements: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Notas adicionales de elegibilidad</label>
                <textarea className="input-field" rows={3} value={form.eligibilityNotes}
                  onChange={e => setForm({ ...form, eligibilityNotes: e.target.value })} />
              </div>
            </div>

            <div className="mt-6">
              <label className="label">Documentos requeridos</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {REQUIRED_DOCS.map(doc => (
                  <label key={doc} className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDocs.includes(doc) ? "border-blue-500 bg-blue-50" : "border-slate-200"
                  }`}>
                    <input type="checkbox" checked={selectedDocs.includes(doc)}
                      onChange={() => toggleDoc(doc)} />
                    <span className="text-sm font-medium text-slate-700">{doc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Financial */}
        {activeSection === 3 && (
          <div className="form-section">
            <h2 className="form-section-title">💰 Información Financiera</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Costo total del programa</label>
                <input type="number" className="input-field" placeholder="0.00"
                  value={form.totalCost} onChange={e => setForm({ ...form, totalCost: e.target.value })} />
              </div>
              <div>
                <label className="label">Moneda</label>
                <select className="input-field" value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}>
                  <option value="USD">USD - Dólar</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="BRL">BRL - Real Brasileño</option>
                  <option value="ARS">ARS - Peso Argentino</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Formas de pago</label>
                <textarea className="input-field" rows={2}
                  placeholder="Ej: Pago único, cuotas semestrales, financiamiento..."
                  value={form.paymentMethods}
                  onChange={e => setForm({ ...form, paymentMethods: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  form.scholarshipsAvailable ? "border-yellow-400 bg-yellow-50" : "border-slate-200"
                }`}>
                  <input type="checkbox" checked={form.scholarshipsAvailable}
                    onChange={e => setForm({ ...form, scholarshipsAvailable: e.target.checked })} />
                  <span className="font-semibold text-slate-700">🏆 Becas disponibles</span>
                </label>
              </div>
              {form.scholarshipsAvailable && (
                <div className="md:col-span-2">
                  <label className="label">Información sobre becas</label>
                  <textarea className="input-field" rows={3}
                    placeholder="Describe los tipos de becas, requisitos y montos..."
                    value={form.scholarshipsInfo}
                    onChange={e => setForm({ ...form, scholarshipsInfo: e.target.value })} />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="label">Política de devolución</label>
                <textarea className="input-field" rows={2} value={form.refundPolicy}
                  onChange={e => setForm({ ...form, refundPolicy: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Selection */}
        {activeSection === 4 && (
          <div className="form-section">
            <h2 className="form-section-title">🔍 Proceso de Selección</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Descripción del proceso de selección</label>
                <textarea className="input-field" rows={4}
                  placeholder="Describe las etapas del proceso de selección..."
                  value={form.selectionProcess}
                  onChange={e => setForm({ ...form, selectionProcess: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  form.hasInterview ? "border-purple-400 bg-purple-50" : "border-slate-200"
                }`}>
                  <input type="checkbox" checked={form.hasInterview}
                    onChange={e => setForm({ ...form, hasInterview: e.target.checked })} />
                  <div>
                    <div className="font-semibold text-slate-700">🎤 Entrevista</div>
                    <div className="text-xs text-slate-500">Incluye entrevista personal</div>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  form.hasExam ? "border-orange-400 bg-orange-50" : "border-slate-200"
                }`}>
                  <input type="checkbox" checked={form.hasExam}
                    onChange={e => setForm({ ...form, hasExam: e.target.checked })} />
                  <div>
                    <div className="font-semibold text-slate-700">📝 Examen</div>
                    <div className="text-xs text-slate-500">Incluye examen de admisión</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Legal */}
        {activeSection === 5 && (
          <div className="form-section">
            <h2 className="form-section-title">⚖️ Información Legal</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Política de privacidad</label>
                <textarea className="input-field" rows={4}
                  placeholder="Describe cómo se tratarán los datos personales de los aspirantes..."
                  value={form.privacyPolicy}
                  onChange={e => setForm({ ...form, privacyPolicy: e.target.value })} />
              </div>
              <div>
                <label className="label">Términos y condiciones</label>
                <textarea className="input-field" rows={4}
                  placeholder="Términos y condiciones del proceso de admisión..."
                  value={form.termsConditions}
                  onChange={e => setForm({ ...form, termsConditions: e.target.value })} />
              </div>
              <div className="alert alert-info">
                Al enviar esta convocatoria, será revisada por el Super Admin antes de ser publicada.
              </div>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary w-full justify-center py-3 text-base">
                {saving ? "Enviando..." : "🚀 Enviar para Aprobación"}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
            className="btn-secondary disabled:opacity-50"
          >
            ← Anterior
          </button>
          {activeSection < SECTIONS.length - 1 && (
            <button onClick={() => setActiveSection(activeSection + 1)} className="btn-primary">
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
