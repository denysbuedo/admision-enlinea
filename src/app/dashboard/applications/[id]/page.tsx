"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  User,
  GraduationCap,
  Briefcase,
  Star,
  FileText,
  CheckSquare,
  History,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Award,
  Languages,
  FileCheck,
  Shield,
  PenTool,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

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
  draft: "Borrador",
  submitted: "Enviada",
  under_review: "En Revisión",
  interview: "Entrevista",
  approved: "Aprobada",
  rejected: "Rechazada",
  waitlisted: "Lista de Espera",
};

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  interview: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  waitlisted: "bg-orange-100 text-orange-700",
};

const SECTIONS = [
  { name: "Personal", icon: User },
  { name: "Académica", icon: GraduationCap },
  { name: "Profesional", icon: Briefcase },
  { name: "Complementaria", icon: Star },
  { name: "Documentos", icon: FileText },
  { name: "Declaración", icon: CheckSquare },
];

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    nationality: "",
    documentType: "CC",
    documentNumber: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
  });

  const [academic, setAcademic] = useState({
    degree: "",
    university: "",
    country: "",
    graduationYear: "",
    gpa: "",
    otherStudies: "",
  });

  const [experience, setExperience] = useState([
    {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ]);

  const [complementary, setComplementary] = useState({
    languages: "",
    certifications: "",
    publications: "",
    research: "",
  });

  const [declaration, setDeclaration] = useState({
    declarationAccepted: false,
    dataProcessingAccepted: false,
    digitalSignature: "",
  });

  useEffect(() => {
    fetch(`/api/applications/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "No autorizado") {
          router.push("/login");
          return;
        }
        setApp(data);
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
          try {
            setAcademic(JSON.parse(data.academicInfo));
          } catch {}
        }
        if (data.professionalExperience) {
          try {
            setExperience(JSON.parse(data.professionalExperience));
          } catch {}
        }
        if (data.complementaryInfo) {
          try {
            setComplementary(JSON.parse(data.complementaryInfo));
          } catch {}
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
        setApp((prev) => (prev ? { ...prev, ...data } : data));
        setMessage({
          type: "success",
          text: submit ? "¡Solicitud enviada exitosamente!" : "Guardado correctamente",
        });
        if (submit) setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () =>
    setExperience([
      ...experience,
      { company: "", position: "", startDate: "", endDate: "", description: "" },
    ]);
  const removeExperience = (i: number) =>
    setExperience(experience.filter((_, idx) => idx !== i));

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Cargando formulario...</div>
      </div>
    );
  if (!app)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Solicitud no encontrada</div>
      </div>
    );

  const isEditable = app.status === "draft";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-600 hover:text-[#003f8f] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Mi Dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[app.status]}`}
              >
                {statusLabels[app.status]}
              </span>
              {isEditable && (
                <>
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg border-2 border-slate-200 text-slate-600 font-medium hover:border-[#003f8f] hover:text-[#003f8f] transition-all text-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={
                      saving ||
                      !declaration.declarationAccepted ||
                      !declaration.dataProcessingAccepted ||
                      !declaration.digitalSignature
                    }
                    className="flex items-center gap-2 bg-[#003f8f] text-white font-medium px-4 py-1.5 rounded-lg hover:bg-[#002e6b] transition-all text-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Enviar solicitud
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título y notas */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Formulario de solicitud</h1>
          {app.reviewNotes && (
            <div className="mt-3 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-800 text-sm">Nota del evaluador:</strong>
                <p className="text-amber-700 text-sm mt-1">{app.reviewNotes}</p>
              </div>
            </div>
          )}
          {app.score && (
            <div className="mt-3 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-center gap-3">
              <Award className="w-5 h-5 text-green-600" />
              <div>
                <strong className="text-green-800 text-sm">Puntaje obtenido:</strong>
                <span className="text-green-700 text-sm ml-2 font-semibold">{app.score}</span>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje de éxito/error */}
        {message.text && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

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

        {/* Section 1: Personal */}
        {activeSection === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Información personal</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nombres *
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  value={personal.firstName}
                  disabled={!isEditable}
                  onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Apellidos *
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  value={personal.lastName}
                  disabled={!isEditable}
                  onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Fecha de nacimiento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                    value={personal.birthDate}
                    disabled={!isEditable}
                    onChange={(e) => setPersonal({ ...personal, birthDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nacionalidad
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                    value={personal.nationality}
                    disabled={!isEditable}
                    onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tipo de documento
                </label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                  value={personal.documentType}
                  disabled={!isEditable}
                  onChange={(e) => setPersonal({ ...personal, documentType: e.target.value })}
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PASSPORT">Pasaporte</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Número de documento
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                  value={personal.documentNumber}
                  disabled={!isEditable}
                  onChange={(e) => setPersonal({ ...personal, documentNumber: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                    value={personal.address}
                    disabled={!isEditable}
                    onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Ciudad
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                  value={personal.city}
                  disabled={!isEditable}
                  onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  País
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                  value={personal.country}
                  disabled={!isEditable}
                  onChange={(e) => setPersonal({ ...personal, country: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                    value={personal.phone}
                    disabled={!isEditable}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                    value={personal.email}
                    disabled={!isEditable}
                    onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Academic */}
        {activeSection === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <GraduationCap className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Información académica</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Título universitario
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                  value={academic.degree}
                  disabled={!isEditable}
                  onChange={(e) => setAcademic({ ...academic, degree: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Universidad
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                    value={academic.university}
                    disabled={!isEditable}
                    onChange={(e) => setAcademic({ ...academic, university: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  País
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                    value={academic.country}
                    disabled={!isEditable}
                    onChange={(e) => setAcademic({ ...academic, country: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Año de graduación
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                  value={academic.graduationYear}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setAcademic({ ...academic, graduationYear: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Promedio (GPA)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                    value={academic.gpa}
                    disabled={!isEditable}
                    onChange={(e) => setAcademic({ ...academic, gpa: e.target.value })}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Otros estudios
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none disabled:bg-slate-50"
                  rows={3}
                  value={academic.otherStudies}
                  disabled={!isEditable}
                  onChange={(e) => setAcademic({ ...academic, otherStudies: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Professional */}
        {activeSection === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Briefcase className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Experiencia profesional</h2>
            </div>
            {experience.map((exp, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#003f8f]" />
                    Experiencia {i + 1}
                  </h3>
                  {isEditable && experience.length > 1 && (
                    <button
                      onClick={() => removeExperience(i)}
                      className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Empresa
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                      value={exp.company}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setExperience(
                          experience.map((x, idx) =>
                            idx === i ? { ...x, company: e.target.value } : x
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Cargo
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                      value={exp.position}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setExperience(
                          experience.map((x, idx) =>
                            idx === i ? { ...x, position: e.target.value } : x
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                      value={exp.startDate}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setExperience(
                          experience.map((x, idx) =>
                            idx === i ? { ...x, startDate: e.target.value } : x
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                      value={exp.endDate}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setExperience(
                          experience.map((x, idx) =>
                            idx === i ? { ...x, endDate: e.target.value } : x
                          )
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none disabled:bg-slate-50"
                      rows={3}
                      value={exp.description}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setExperience(
                          experience.map((x, idx) =>
                            idx === i ? { ...x, description: e.target.value } : x
                          )
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            {isEditable && (
              <button
                onClick={addExperience}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-slate-200 text-slate-600 font-medium hover:border-[#003f8f] hover:text-[#003f8f] transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar experiencia
              </button>
            )}
          </div>
        )}

        {/* Section 4: Complementary */}
        {activeSection === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Información complementaria</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Idiomas (nivel)
                </label>
                <div className="relative">
                  <Languages className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none disabled:bg-slate-50"
                    rows={2}
                    placeholder="Ej: Inglés B2, Francés A1..."
                    value={complementary.languages}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setComplementary({ ...complementary, languages: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Certificaciones
                </label>
                <div className="relative">
                  <FileCheck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none disabled:bg-slate-50"
                    rows={2}
                    value={complementary.certifications}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setComplementary({ ...complementary, certifications: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Publicaciones
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none disabled:bg-slate-50"
                  rows={3}
                  value={complementary.publications}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setComplementary({ ...complementary, publications: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Líneas de investigación previa
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all resize-none disabled:bg-slate-50"
                  rows={3}
                  value={complementary.research}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setComplementary({ ...complementary, research: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Documents */}
        {activeSection === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Documentos requeridos</h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Los documentos se gestionan de forma externa. Asegúrate de tener listos los siguientes documentos
                para enviarlos cuando sean solicitados por la universidad.
              </p>
            </div>
            <div className="space-y-2">
              {[
                { name: "CV / Hoja de vida", required: true },
                { name: "Título universitario", required: true },
                { name: "Certificado de notas", required: true },
                { name: "Carta de motivación", required: true },
                { name: "Cartas de recomendación", required: false },
                { name: "Documento de identidad", required: true },
                { name: "Portafolio (si aplica)", required: false },
              ].map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <FileText className="w-5 h-5 text-[#003f8f]" />
                  <span className="flex-1 font-medium text-slate-700">{doc.name}</span>
                  {doc.required && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                      Requerido
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Declaration */}
        {activeSection === 5 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckSquare className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Declaración y envío</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-[#003f8f]" />
                  <p className="font-semibold text-slate-800">Declaración de veracidad</p>
                </div>
                <p>
                  Declaro que toda la información proporcionada en este formulario es verídica y completa.
                  Entiendo que cualquier falsedad o inexactitud puede resultar en la descalificación de mi
                  solicitud o en la cancelación de mi admisión.
                </p>
              </div>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  declaration.declarationAccepted
                    ? "border-[#003f8f] bg-[#e6f0ff]"
                    : "border-slate-200 hover:border-slate-300"
                } ${!isEditable && "cursor-default"}`}
              >
                <input
                  type="checkbox"
                  checked={declaration.declarationAccepted}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setDeclaration({ ...declaration, declarationAccepted: e.target.checked })
                  }
                  className="mt-0.5 accent-[#003f8f]"
                />
                <span className="text-sm text-slate-700">
                  <strong>Acepto la declaración de veracidad</strong> y confirmo que toda la información es correcta.
                </span>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  declaration.dataProcessingAccepted
                    ? "border-[#003f8f] bg-[#e6f0ff]"
                    : "border-slate-200 hover:border-slate-300"
                } ${!isEditable && "cursor-default"}`}
              >
                <input
                  type="checkbox"
                  checked={declaration.dataProcessingAccepted}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setDeclaration({ ...declaration, dataProcessingAccepted: e.target.checked })
                  }
                  className="mt-0.5 accent-[#003f8f]"
                />
                <span className="text-sm text-slate-700">
                  <strong>Autorizo el tratamiento de mis datos personales</strong> conforme a la política de
                  privacidad y protección de datos (GDPR/LGPD).
                </span>
              </label>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Firma digital
                </label>
                <div className="relative">
                  <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all disabled:bg-slate-50"
                    placeholder="Escribe tu nombre completo como firma digital"
                    value={declaration.digitalSignature}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setDeclaration({ ...declaration, digitalSignature: e.target.value })
                    }
                  />
                </div>
              </div>

              {isEditable && (
                <button
                  onClick={() => handleSave(true)}
                  disabled={
                    saving ||
                    !declaration.declarationAccepted ||
                    !declaration.dataProcessingAccepted ||
                    !declaration.digitalSignature
                  }
                  className="w-full flex items-center justify-center gap-2 bg-[#003f8f] text-white font-semibold py-3 rounded-lg hover:bg-[#002e6b] transition-all disabled:opacity-50 text-base"
                >
                  {saving ? (
                    <>
                      <Send className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar solicitud
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Historial de estado */}
        {app.history && app.history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-[#003f8f]" />
              <h2 className="text-lg font-bold text-slate-800">Historial de cambios</h2>
            </div>
            <div className="space-y-3">
              {app.history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400 text-xs whitespace-nowrap">
                    {new Date(h.createdAt).toLocaleDateString("es-ES")}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[h.toStatus]}`}
                  >
                    {statusLabels[h.toStatus] || h.toStatus}
                  </span>
                  {h.notes && <span className="text-slate-500 text-xs">{h.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navegación */}
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
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#003f8f] text-white font-medium hover:bg-[#002e6b] transition-all"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}