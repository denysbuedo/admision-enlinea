import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { existsSync, statSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { AdminOperationError, initializeAdmin, resetAdminPassword } from './admin-operations';
import * as schema from './schema';

export function validateOperatorDatabase(url: string | undefined): string {
  const path = url?.startsWith('file:') ? url.slice(5) : '';
  if (!path || !isAbsolute(path) || !existsSync(path) || !statSync(path).isFile()) {
    throw new AdminOperationError('DB_URL debe indicar un archivo SQLite local existente mediante file:ruta-absoluta');
  }
  return url!;
}

export async function runAdminCommand(operation: 'initialize' | 'reset') {
  let client: ReturnType<typeof createClient> | undefined;
  try {
    const url = validateOperatorDatabase(process.env.DB_URL);
    const email = process.env.ADMIN_EMAIL || 'dinfo@mes.gob.cu';
    const password = process.env[operation === 'initialize' ? 'ADMIN_INITIAL_PASSWORD' : 'ADMIN_PASSWORD'];
    if (!password) throw new AdminOperationError('Falta la contraseña operativa en el entorno');
    client = createClient({ url });
    const db = drizzle(client, { schema });
    if (operation === 'initialize') await initializeAdmin(db, email, password);
    else await resetAdminPassword(db, email, password);
    console.log(operation === 'initialize' ? 'Administrador inicial creado' : 'Contraseña administrativa actualizada; rol y estado de actividad conservados');
  } catch (error) {
    // Never log database errors/queries: drivers may include password hashes or inputs.
    console.error(error instanceof AdminOperationError ? error.message : 'Operación administrativa fallida; revise la base de datos y su esquema');
    process.exitCode = 1;
  } finally {
    client?.close();
  }
}
