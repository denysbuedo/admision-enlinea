import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://convocatorias.reduniv.edu.cu"),
  title: "CONVOCA · Convocatorias y admisiones académicas",
  description: "Conecta oportunidades. Impulsa trayectorias. Explora programas de posgrado y gestiona tu postulación con CONVOCA, una plataforma de RedUniv.",
  openGraph: {
    title: "CONVOCA · Conecta oportunidades. Impulsa trayectorias.",
    description: "Programas, postulaciones y seguimiento de admisiones en un solo lugar.",
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "CONVOCA" }],
    locale: "es_CU",
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/brand/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
