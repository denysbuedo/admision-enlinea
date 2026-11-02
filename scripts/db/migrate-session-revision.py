"""Guarded migration 0001; caller must stop production writes first. No rollback of live data."""
from contextlib import closing
import hashlib, importlib.util, json, os
from pathlib import Path
import sqlite3, subprocess
spec=importlib.util.spec_from_file_location('audit',Path(__file__).with_name('audit-baseline.py'))
audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)

def ledger(repo):
    entries=json.loads((repo/'drizzle/meta/_journal.json').read_text())['entries']
    if [e['tag'] for e in entries] != ['0000_clammy_multiple_man','0001_session_revision']: raise ValueError('Unexpected migrations')
    return [(hashlib.sha256((repo/'drizzle'/(e['tag']+'.sql')).read_bytes()).hexdigest(),e['when']) for e in entries]

def migrate_copy_or_stopped_database(database,repo,old_reference,new_reference,backup,bun):
    database=database.resolve(strict=True);repo=repo.resolve(strict=True);backup=backup.resolve()
    if backup.exists() or backup==database: raise ValueError('Backup must be new')
    expected=ledger(repo)
    with closing(audit.readonly(old_reference)) as old,closing(audit.readonly(new_reference)) as new:
        old_schema=audit.schema(old);new_schema=audit.schema(new)
        if new.execute('select hash,created_at from __drizzle_migrations order by created_at').fetchall()!=expected: raise ValueError('Reference ledger mismatch')
    with closing(audit.readonly(database)) as live,closing(sqlite3.connect(backup)) as saved:
        if audit.schema(live)!=old_schema or live.execute('select hash,created_at from __drizzle_migrations').fetchall()!=expected[:1]: raise ValueError('Unexpected source schema or ledger')
        live.backup(saved)
        audit.check_integrity(saved)
        columns={name:[row[1] for row in saved.execute('pragma table_info('+audit.quote(name)+')')] for (name,) in saved.execute("select name from sqlite_master where type='table' and name!='__drizzle_migrations'")}
        def data(c):
            return {name:c.execute('select '+','.join(audit.quote(col) for col in cols)+' from '+audit.quote(name)+' order by rowid').fetchall() for name,cols in columns.items()}
        before=data(saved)
    with closing(audit.readonly(database)) as live:
        if data(live)!=before: raise ValueError('Concurrent writes')
    result=subprocess.run([bun,'run','src/db/migrate.ts'],cwd=repo,env={**os.environ,'DB_URL':'file:'+str(database),'NODE_ENV':'production'},capture_output=True,timeout=60)
    if result.returncode: raise RuntimeError('Migration failed; inspect protected backup and database state')
    with closing(audit.readonly(database)) as live:
        audit.check_integrity(live)
        if audit.schema(live)!=new_schema or data(live)!=before: raise RuntimeError('Post-migration verification failed')
        if live.execute('select hash,created_at from __drizzle_migrations order by created_at').fetchall()!=expected: raise RuntimeError('Unexpected resulting ledger')
        if live.execute('select count(*) from users where session_revision != 0').fetchone()[0]: raise RuntimeError('Unexpected initial revisions')
    return {'migration_applied':True,'old_columns_and_sequences_identical':True,'initial_revisions_zero':True,'schema_matches_reference':True,'ledger_rows':2,'integrity':'ok'}
