import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GradCall – Academic Admissions Cloud",
  description: "Plataforma de convocatorias para programas de posgrado",
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
