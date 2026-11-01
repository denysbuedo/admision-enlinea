import { NextResponse } from "next/server";

// Intentionally independent of DB, session and environment configuration.
export async function GET() {
  return NextResponse.json({ error: "Inicialización web retirada" }, { status: 410, headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  return GET();
}
