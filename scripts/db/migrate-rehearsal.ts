// Only operates on named files in a sandbox created by audit-baseline.py.
// Never reads DB_URL. This is not a production migration entry point.
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { readFileSync, existsSync, lstatSync, realpathSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

async function main() {
  const [directory, mode] = process.argv.slice(2);
  if (!directory || !['reference', 'unbaselined', 'reconciled'].includes(mode)) throw new Error('Invalid rehearsal arguments');
  const root = realpathSync(directory);
  if (readFileSync(join(root, '.convoca-migration-rehearsal'), 'utf8') !== 'v1\n') throw new Error('Missing sandbox marker');
  const file = join(root, `${mode}.db`);
  if (existsSync(file) && (lstatSync(file).isSymbolicLink() || dirname(realpathSync(file)) !== root)) throw new Error('Unsafe sandbox file');
  if (mode !== 'reference' && !existsSync(file)) throw new Error('Missing copy');
  if (mode === 'reference' && existsSync(file)) throw new Error('Reference already exists');
  const client = createClient({ url: pathToFileURL(file).href });
  try {
    await migrate(drizzle(client), { migrationsFolder: resolve('drizzle') });
    console.log(JSON.stringify({ migrated: true }));
  } catch {
    // Do not print driver SQL or data. Caller checks the resulting schema/data.
    console.log(JSON.stringify({ migrated: false }));
  } finally { client.close(); }
}
main().catch(() => { console.error('Rehearsal setup rejected'); process.exitCode = 1; });
