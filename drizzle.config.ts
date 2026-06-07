import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Cargar variables de entorno manualmente si es necesario en este contexto
// Aunque drizzle-kit a veces las lee automáticamente, es más seguro asegurar la ruta o usar process.env si está disponible en el entorno de ejecución del script
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});