import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexo – Gestión de Admisiones Académicas",
  description: "Plataforma de gestión de programas de posgrado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
