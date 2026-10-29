"use client";

import Brand from "@/components/Brand";
import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight,
  Database,
  UserPlus,
  LogIn,
  Settings,
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
          <div className="flex justify-center mb-4"><Brand /></div>
          <h1 className="text-2xl font-bold text-slate-800">Configuración inicial</h1>
          <p className="text-slate-500 mt-1">Prepara tu plataforma CONVOCA</p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E9FBF7] text-[#102B46] flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#102B46]" />
                <p className="font-medium text-slate-700">Crear Super Administrador</p>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Crea la cuenta de administrador principal del sistema
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E9FBF7] text-[#102B46] flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-[#102B46]" />
                <p className="font-medium text-slate-700">Iniciar sesión</p>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Usa las credenciales del administrador para acceder al sistema
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E9FBF7] text-[#102B46] flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#102B46]" />
                <p className="font-medium text-slate-700">Gestionar la plataforma</p>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Aprueba programas y gestiona usuarios
              </p>
            </div>
          </div>
        </div>

        {/* Action Button - Estado idle */}
        {status === "idle" && (
          <button
            onClick={handleSetup}
            className="w-full flex items-center justify-center gap-2 bg-[#102B46] hover:bg-[#0C1D30] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm"
          >
            <Database className="w-5 h-5" />
            Inicializar sistema
          </button>
        )}

        {/* Action Button - Estado loading */}
        {status === "loading" && (
          <div className="w-full flex items-center justify-center gap-2 bg-[#E9FBF7] text-[#102B46] font-semibold py-3 px-6 rounded-xl">
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

            {/* Botón ir al login */}
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 bg-[#102B46] hover:bg-[#0C1D30] text-white font-semibold py-3 px-6 rounded-xl transition-all text-center"
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
            <Link href="/login" className="text-[#102B46] hover:underline font-medium">
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
