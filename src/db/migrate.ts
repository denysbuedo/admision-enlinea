import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

const sqlite = new Database(process.env.DB_URL || 'sqlite.db');
const db = drizzle(sqlite, { schema });

console.log('Iniciando migraciones...');
await migrate(db, { migrationsFolder: './drizzle' });
console.log('Migraciones completadas exitosamente.');
