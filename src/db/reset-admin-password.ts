import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { users } from "./schema";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@nexo.com";

const client = createClient({
  url: process.env.DB_URL || "file:sqlite.db",
});

const db = drizzle(client);

async function resetAdminPassword() {
  const newPassword = process.env.ADMIN_PASSWORD;

  if (!newPassword) {
    throw new Error("Define ADMIN_PASSWORD con la nueva contrasena del admin");
  }

  if (newPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 12 caracteres");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const result = await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.email, ADMIN_EMAIL))
    .returning({ id: users.id, email: users.email });

  if (result.length === 0) {
    throw new Error(`No existe el usuario admin ${ADMIN_EMAIL}`);
  }

  console.log(`Contrasena actualizada para ${ADMIN_EMAIL}`);
  process.exit(0);
}

resetAdminPassword().catch((err) => {
  console.error("Error actualizando contrasena:", err.message);
  process.exit(1);
});
