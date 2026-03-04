"use client";

import { useState } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GradCall Setup</h1>
          <p className="text-gray-500 mt-1">Configuración inicial del sistema</p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
            <div>
              <p className="font-medium text-gray-800">Crear Super Admin</p>
              <p className="text-sm text-gray-500">Crea la cuenta de administrador principal del sistema</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
            <div>
              <p className="font-medium text-gray-800">Iniciar sesión</p>
              <p className="text-sm text-gray-500">Usa las credenciales del admin para entrar al sistema</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
            <div>
              <p className="font-medium text-gray-800">Gestionar la plataforma</p>
              <p className="text-sm text-gray-500">Aprueba universidades, convocatorias y usuarios</p>
            </div>
          </div>
        </div>

        {/* Action */}
        {status === "idle" && (
          <button
            onClick={handleSetup}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            🚀 Inicializar Sistema
          </button>
        )}

        {status === "loading" && (
          <div className="w-full bg-indigo-100 text-indigo-600 font-semibold py-3 px-6 rounded-xl text-center">
            ⏳ Creando administrador...
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className={`rounded-xl p-4 ${alreadyExists ? "bg-yellow-50 border border-yellow-200" : "bg-green-50 border border-green-200"}`}>
              <p className={`font-semibold ${alreadyExists ? "text-yellow-800" : "text-green-800"}`}>
                {alreadyExists ? "⚠️ " : "✅ "}{message}
              </p>
            </div>

            {/* Credentials box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">🔑 Credenciales de acceso:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Email</span>
                  <code className="text-sm font-mono text-indigo-700">admin@gradcall.com</code>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Contraseña</span>
                  <code className="text-sm font-mono text-indigo-700">Admin123!</code>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-center"
            >
              Ir al Login →
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-semibold text-red-800">❌ Error: {message}</p>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Footer links */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
