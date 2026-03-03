"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Application {
  id: number;
  programId: number;
  status: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  academicInfo: string;
  professionalExperience: string;
  complementaryInfo: string;
  declarationAccepted: boolean;
  dataProcessingAccepted: boolean;
  digitalSignature: string;
  reviewNotes: string;
  score: number;
  submittedAt: string;
  history: Array<{ fromStatus: string; toStatus: string; notes: string; createdAt: string }>;
}

const statusLabels: Record<string, string> = {
  draft: "Borrador", submitted: "Enviada", under_review: "En Revisión",
  interview: "Entrevista", approved: "Aprobada", rejected: "Rechazada", waitlisted: "Lista de Espera",
};

const SECTIONS = ["Personal", "Académica", "Profesional", "Complementaria", "Documentos", "Declaración"];

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form state
  const [personal, setPersonal] = useState({
    firstName: "", lastName: "", birthDate: "", nationality: "",
    documentType: "CC", documentNumber: "", address: "", city: "", country: "", phone: "", email: "",
  });

  const [academic, setAcademic] = useState({
    degree: "", university: "", country: "", graduationYear: "", gpa: "", otherStudies: "",
  });

  const [experience, setExperience] = useState([{
    company: "", position: "", startDate: "", endDate: "", description: "",
  }]);

  const [complementary, setComplementary] = useState({
    languages: "", certifications: "", publications: "", research: "",
  });

  const [declaration, setDeclaration] = useState({
    declarationAccepted: false, dataProcessingAccepted: false, digitalSignature: "",
  });

  useEffect(() => {
    fetch(`/api/applications/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error === "No autorizado") { router.push("/login"); return; }
        setApp(data);
        // Populate form
        setPersonal({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split("T")[0] : "",
          nationality: data.nationality || "",
          documentType: data.documentType || "CC",
          documentNumber: data.documentNumber || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          phone: data.phone || "",
          email: data.email || "",
        });
        if (data.academicInfo) {
          try { setAcademic(JSON.parse(data.academicInfo)); } catch {}
        }
        if (data.professionalExperience) {
          try { setExperience(JSON.parse(data.professionalExperience)); } catch {}
        }
        if (data.complementaryInfo) {
          try { setComplementary(JSON.parse(data.complementaryInfo)); } catch {}
        }
        setDeclaration({
          declarationAccepted: data.declarationAccepted || false,
          dataProcessingAccepted: data.dataProcessingAccepted || false,
          digitalSignature: data.digitalSignature || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id, router]);

  const handleSave = async (submit = false) => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const body: Record<string, unknown> = {
        ...personal,
        academicInfo: academic,
        professionalExperience: experience,
        complementaryInfo: complementary,
        ...declaration,
      };
      if (submit) body.status = "submitted";

      const res = await fetch(`/api/applications/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Error al guardar" });
      } else {
        setApp(prev => prev ? { ...prev, ...data } : data);
        setMessage({ type: "success", text: submit ? "¡Solicitud enviada exitosamente!" : "Guardado correctamente" });
        if (submit) setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => setExperience([...experience, { company: "", position: "", startDate: "", endDate: "", description: "" }]);
  const removeExperience = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!app) return <div className="min-h-screen flex items-center justify-center">Solicitud no encontrada</div>;

  const isEditable = app.status === "draft";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="text-slate-600 hover:text-blue-700 flex items-center gap-2">
              ← Mi Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <span className={`status-badge status-${app.status}`}>{statusLabels[app.status]}</span>
              {isEditable && (
                <>
                  <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary text-sm">
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving || !declaration.declarationAccepted || !declaration.dataProcessingAccepted || !declaration.digitalSignature}
                    className="btn-primary text-sm"
                  >
                    Enviar Solicitud
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Formulario de Solicitud</h1>
          {app.reviewNotes && (
            <div className="alert alert-info mt-3">
              <strong>Nota del evaluador:</strong> {app.reviewNotes}
            </div>
          )}
          {app.score && (
            <div className="alert alert-success mt-3">
              <strong>Puntaje:</strong> {app.score}
            </div>
          )}
        </div>

        {message.text && (
          <div className={`alert ${message.type === "error" ? "alert-error" : "alert-success"} mb-4`}>
            {message.text}
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200">
          {SECTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => setActiveSection(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === i
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {/* Section 1: Personal */}
        {activeSection === 0 && (
          <div className="form-section">
            <h2 className="form-section-title">👤 Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombres *</label>
                <input className="input-field" value={personal.firstName} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, firstName: e.target.value })} />
              </div>
              <div>
                <label className="label">Apellidos *</label>
                <input className="input-field" value={personal.lastName} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, lastName: e.target.value })} />
              </div>
              <div>
                <label className="label">Fecha de nacimiento</label>
                <input type="date" className="input-field" value={personal.birthDate} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, birthDate: e.target.value })} />
              </div>
              <div>
                <label className="label">Nacionalidad</label>
                <input className="input-field" value={personal.nationality} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, nationality: e.target.value })} />
              </div>
              <div>
                <label className="label">Tipo de documento</label>
                <select className="input-field" value={personal.documentType} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, documentType: e.target.value })}>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PASSPORT">Pasaporte</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div>
                <label className="label">Número de documento</label>
                <input className="input-field" value={personal.documentNumber} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, documentNumber: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Dirección</label>
                <input className="input-field" value={personal.address} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, address: e.target.value })} />
              </div>
              <div>
                <label className="label">Ciudad</label>
                <input className="input-field" value={personal.city} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, city: e.target.value })} />
              </div>
              <div>
                <label className="label">País</label>
                <input className="input-field" value={personal.country} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, country: e.target.value })} />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input className="input-field" value={personal.phone} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Correo electrónico</label>
                <input type="email" className="input-field" value={personal.email} disabled={!isEditable}
                  onChange={e => setPersonal({ ...personal, email: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Academic */}
        {activeSection === 1 && (
          <div className="form-section">
            <h2 className="form-section-title">🎓 Información Académica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Título universitario</label>
                <input className="input-field" value={academic.degree} disabled={!isEditable}
                  onChange={e => setAcademic({ ...academic, degree: e.target.value })} />
              </div>
              <div>
                <label className="label">Universidad</label>
                <input className="input-field" value={academic.university} disabled={!isEditable}
                  onChange={e => setAcademic({ ...academic, university: e.target.value })} />
              </div>
              <div>
                <label className="label">País</label>
                <input className="input-field" value={academic.country} disabled={!isEditable}
                  onChange={e => setAcademic({ ...academic, country: e.target.value })} />
              </div>
              <div>
                <label className="label">Año de graduación</label>
                <input type="number" className="input-field" value={academic.graduationYear} disabled={!isEditable}
                  onChange={e => setAcademic({ ...academic, graduationYear: e.target.value })} />
              </div>
              <div>
                <label className="label">Promedio (GPA)</label>
                <input type="number" step="0.01" className="input-field" value={academic.gpa} disabled={!isEditable}
                  onChange={e => setAcademic({ ...academic, gpa: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Otros estudios</label>
                <textarea className="input-field" rows={3} value={academic.otherStudies} disabled={!isEditable}
                  onChange={e => setAcademic({ ...academic, otherStudies: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Professional */}
        {activeSection === 2 && (
          <div className="form-section">
            <h2 className="form-section-title">💼 Experiencia Profesional</h2>
            {experience.map((exp, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-700">Experiencia {i + 1}</h3>
                  {isEditable && experience.length > 1 && (
                    <button onClick={() => removeExperience(i)} className="text-red-500 text-sm hover:text-red-700">
                      Eliminar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Empresa</label>
                    <input className="input-field" value={exp.company} disabled={!isEditable}
                      onChange={e => setExperience(experience.map((x, idx) => idx === i ? { ...x, company: e.target.value } : x))} />
                  </div>
                  <div>
                    <label className="label">Cargo</label>
                    <input className="input-field" value={exp.position} disabled={!isEditable}
                      onChange={e => setExperience(experience.map((x, idx) => idx === i ? { ...x, position: e.target.value } : x))} />
                  </div>
                  <div>
                    <label className="label">Fecha inicio</label>
                    <input type="date" className="input-field" value={exp.startDate} disabled={!isEditable}
                      onChange={e => setExperience(experience.map((x, idx) => idx === i ? { ...x, startDate: e.target.value } : x))} />
                  </div>
                  <div>
                    <label className="label">Fecha fin</label>
                    <input type="date" className="input-field" value={exp.endDate} disabled={!isEditable}
                      onChange={e => setExperience(experience.map((x, idx) => idx === i ? { ...x, endDate: e.target.value } : x))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Descripción</label>
                    <textarea className="input-field" rows={3} value={exp.description} disabled={!isEditable}
                      onChange={e => setExperience(experience.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} />
                  </div>
                </div>
              </div>
            ))}
            {isEditable && (
              <button onClick={addExperience} className="btn-secondary text-sm">
                + Agregar experiencia
              </button>
            )}
          </div>
        )}

        {/* Section 4: Complementary */}
        {activeSection === 3 && (
          <div className="form-section">
            <h2 className="form-section-title">⭐ Información Complementaria</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Idiomas (nivel)</label>
                <textarea className="input-field" rows={2} value={complementary.languages} disabled={!isEditable}
                  placeholder="Ej: Inglés B2, Francés A1..."
                  onChange={e => setComplementary({ ...complementary, languages: e.target.value })} />
              </div>
              <div>
                <label className="label">Certificaciones</label>
                <textarea className="input-field" rows={2} value={complementary.certifications} disabled={!isEditable}
                  onChange={e => setComplementary({ ...complementary, certifications: e.target.value })} />
              </div>
              <div>
                <label className="label">Publicaciones</label>
                <textarea className="input-field" rows={3} value={complementary.publications} disabled={!isEditable}
                  onChange={e => setComplementary({ ...complementary, publications: e.target.value })} />
              </div>
              <div>
                <label className="label">Investigación previa</label>
                <textarea className="input-field" rows={3} value={complementary.research} disabled={!isEditable}
                  onChange={e => setComplementary({ ...complementary, research: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Documents */}
        {activeSection === 4 && (
          <div className="form-section">
            <h2 className="form-section-title">📎 Documentos Adjuntos</h2>
            <div className="alert alert-info mb-4">
              Los documentos se gestionan de forma externa. Asegúrate de tener listos los siguientes documentos para enviarlos cuando sean solicitados.
            </div>
            <div className="space-y-3">
              {[
                { name: "CV / Hoja de vida", icon: "📄", required: true },
                { name: "Título universitario", icon: "🎓", required: true },
                { name: "Certificado de notas", icon: "📊", required: true },
                { name: "Carta de motivación", icon: "✉️", required: true },
                { name: "Cartas de recomendación", icon: "📝", required: false },
                { name: "Documento de identidad", icon: "🪪", required: true },
                { name: "Portafolio (si aplica)", icon: "🗂️", required: false },
              ].map(doc => (
                <div key={doc.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="text-xl">{doc.icon}</span>
                  <span className="flex-1 font-medium text-slate-700">{doc.name}</span>
                  {doc.required && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Requerido</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Declaration */}
        {activeSection === 5 && (
          <div className="form-section">
            <h2 className="form-section-title">✍️ Declaración</h2>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800 mb-2">Declaración de Veracidad</p>
                <p>Declaro que toda la información proporcionada en este formulario es verídica y completa. Entiendo que cualquier falsedad o inexactitud puede resultar en la descalificación de mi solicitud o en la cancelación de mi admisión.</p>
              </div>

              <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                declaration.declarationAccepted ? "border-blue-500 bg-blue-50" : "border-slate-200"
              }`}>
                <input
                  type="checkbox"
                  checked={declaration.declarationAccepted}
                  disabled={!isEditable}
                  onChange={e => setDeclaration({ ...declaration, declarationAccepted: e.target.checked })}
                  className="mt-0.5"
                />
                <span className="text-sm text-slate-700">
                  <strong>Acepto la declaración de veracidad</strong> y confirmo que toda la información es correcta.
                </span>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                declaration.dataProcessingAccepted ? "border-blue-500 bg-blue-50" : "border-slate-200"
              }`}>
                <input
                  type="checkbox"
                  checked={declaration.dataProcessingAccepted}
                  disabled={!isEditable}
                  onChange={e => setDeclaration({ ...declaration, dataProcessingAccepted: e.target.checked })}
                  className="mt-0.5"
                />
                <span className="text-sm text-slate-700">
                  <strong>Autorizo el tratamiento de mis datos personales</strong> conforme a la política de privacidad y protección de datos (GDPR/LGPD).
                </span>
              </label>

              <div>
                <label className="label">Firma digital (escribe tu nombre completo)</label>
                <input
                  className="input-field"
                  placeholder="Nombre completo como firma"
                  value={declaration.digitalSignature}
                  disabled={!isEditable}
                  onChange={e => setDeclaration({ ...declaration, digitalSignature: e.target.value })}
                />
              </div>

              {isEditable && (
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || !declaration.declarationAccepted || !declaration.dataProcessingAccepted || !declaration.digitalSignature}
                  className="btn-primary w-full justify-center py-3 text-base"
                >
                  {saving ? "Enviando..." : "🚀 Enviar Solicitud"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status History */}
        {app.history && app.history.length > 0 && (
          <div className="form-section mt-6">
            <h2 className="form-section-title">📋 Historial de Estado</h2>
            <div className="space-y-2">
              {app.history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400">{new Date(h.createdAt).toLocaleDateString("es-ES")}</span>
                  <span className={`status-badge status-${h.toStatus}`}>{statusLabels[h.toStatus] || h.toStatus}</span>
                  {h.notes && <span className="text-slate-500">{h.notes}</span>}
                </div>
              ))}
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
            <button
              onClick={() => setActiveSection(activeSection + 1)}
              className="btn-primary"
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
