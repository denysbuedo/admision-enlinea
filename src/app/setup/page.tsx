"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Mail,
  Lock,
  ArrowRight,
  Database,
  UserPlus,
  LogIn,
  Settings,
  Key,
} from "lucide-react";

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [alreadyExists, setAlreadyExists] = useState(false);

  async function handleSetup() {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setAlreadyExists(data.alreadyExists === true);
        setMessage(data.message);
        setStatus("success");
      } else {
        setMessage(data.error || "Error desconocido");
        setStatus("error");
      }
    } catch {
      setMessage("No se pudo conectar con el servidor");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#003f8f] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Configuración inicial</h1>
          <p className="text-slate-500 mt-1">Preparesu plataforma Nexo</p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#e6f0ff] text-[#003f8f] flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#003f8f]" />
                <p className="font-medium text-slate-700">Crear Super Administrador</p>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Crea la cuenta de administrador principal del sistema
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#e6f0ff] text-[#003f8f] flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-[#003f8f]" />
                <p className="font-medium text-slate-700">Iniciar sesión</p>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Usa las credenciales del administrador para acceder al sistema
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#e6f0ff] text-[#003f8f] flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#003f8f]" />
                <p className="font-medium text-slate-700">Gestionar la plataforma</p>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Aprueba universidades, convocatorias y gestiona usuarios
              </p>
            </div>
          </div>
        </div>

        {/* Action Button - Estado idle */}
        {status === "idle" && (
          <button
            onClick={handleSetup}
            className="w-full flex items-center justify-center gap-2 bg-[#003f8f] hover:bg-[#002e6b] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm"
          >
            <Database className="w-5 h-5" />
            Inicializar sistema
          </button>
        )}

        {/* Action Button - Estado loading */}
        {status === "loading" && (
          <div className="w-full flex items-center justify-center gap-2 bg-[#e6f0ff] text-[#003f8f] font-semibold py-3 px-6 rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin" />
            Creando administrador...
          </div>
        )}

        {/* Estado success */}
        {status === "success" && (
          <div className="space-y-4">
            <div
              className={`rounded-xl p-4 flex items-start gap-3 ${
                alreadyExists
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              {alreadyExists ? (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`font-semibold ${
                  alreadyExists ? "text-amber-800" : "text-green-800"
                }`}
              >
                {message}
              </p>
            </div>

            {/* Credenciales */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-[#003f8f]" />
                <p className="text-sm font-semibold text-slate-700">Credenciales de acceso</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">Email</span>
                  </div>
                  <code className="text-sm font-mono text-[#003f8f] font-semibold">
                    admin@nexo.com
                  </code>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">Contraseña</span>
                  </div>
                  <code className="text-sm font-mono text-[#003f8f] font-semibold">
                    Admin123!
                  </code>
                </div>
              </div>
            </div>

            {/* Botón ir al login */}
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 bg-[#003f8f] hover:bg-[#002e6b] text-white font-semibold py-3 px-6 rounded-xl transition-all text-center"
            >
              Ir al inicio de sesión
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Estado error */}
        {status === "error" && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="font-semibold text-red-800">{message}</p>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Footer links */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#003f8f] hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>

        {/* Mensaje de seguridad */}
        <div className="mt-4 pt-2 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
            <Shield className="w-3 h-3" />
            <span>Configuración segura del sistema</span>
          </div>
        </div>
      </div>
    </div>
  );
}