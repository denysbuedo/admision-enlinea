import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const client = createClient({
  url: process.env.DB_URL || 'file:sqlite.db',
});

const db = drizzle(client, { schema });

async function runMigrate() {
  console.log('Iniciando migraciones...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migraciones completadas');
  process.exit(0);
}

runMigrate().catch((err) => {
  console.error('Error en migraciones:', err);
  process.exit(1);
});