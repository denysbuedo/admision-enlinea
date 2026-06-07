"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GraduationCap, Building2, Mail, Lock, User, CheckCircle, AlertCircle } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "aspirant";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole,
    universityName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          universityName: form.universityName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrarse");
        return;
      }

      const role = data.user.role;
      if (role === "university") router.push("/university");
      else router.push("/dashboard");
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#003f8f] flex items-center justify-center text-white font-bold text-xl shadow-md">
              N
            </div>
            <span className="text-2xl font-bold text-slate-800">Nexo</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Crear cuenta</h1>
          <p className="text-slate-500 mt-1">Comienza tu camino académico</p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Selector de rol */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de cuenta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "aspirant", universityName: "" })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  form.role === "aspirant"
                    ? "border-[#003f8f] bg-[#e6f0ff] text-[#003f8f]"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <GraduationCap className={`w-8 h-8 mx-auto mb-2 ${
                  form.role === "aspirant" ? "text-[#003f8f]" : "text-slate-400"
                }`} />
                <div className="font-semibold text-sm">Aspirante</div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "university" })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  form.role === "university"
                    ? "border-[#003f8f] bg-[#e6f0ff] text-[#003f8f]"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Building2 className={`w-8 h-8 mx-auto mb-2 ${
                  form.role === "university" ? "text-[#003f8f]" : "text-slate-400"
                }`} />
                <div className="font-semibold text-sm">Universidad</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  placeholder="Tu nombre completo"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Nombre de universidad (solo para rol university) */}
            {form.role === "university" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nombre de la universidad
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                    placeholder="Universidad Nacional..."
                    value={form.universityName}
                    onChange={e => setForm({ ...form, universityName: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-[#003f8f] focus:ring-2 focus:ring-[#003f8f]/20 outline-none transition-all"
                  placeholder="Repite tu contraseña"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              className="w-full bg-[#003f8f] text-white font-semibold py-3 rounded-lg hover:bg-[#002e6b] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#003f8f] font-semibold hover:underline">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}