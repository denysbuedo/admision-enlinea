"""Read-only source audit and initial Drizzle baseline rehearsal on NEW copies only.

The source is always opened mode=ro. There is no apply-to-source option.
Run on the database server: copies may contain personal data and remain protected.
"""
import argparse
from contextlib import closing
import hashlib
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import time

LEDGER = '__drizzle_migrations'


def readonly(path):
    connection = sqlite3.connect(path.resolve().as_uri() + '?mode=ro', uri=True)
    connection.execute('pragma query_only=ON')
    return connection


def quote(name):
    return '"' + name.replace('"', '""') + '"'


def schema(connection):
    # Strict comparison: no rewriting of SQL literals, defaults or constraints.
    return connection.execute(
        "select type,name,tbl_name,sql from sqlite_master "
        "where name not like 'sqlite_%' order by type,name"
    ).fetchall()


def data_state(connection, include_ledger=False):
    state = {}
    tables = connection.execute("select name from sqlite_master where type='table' order by name").fetchall()
    for (name,) in tables:
        if name == LEDGER and not include_ledger:
            continue
        digest = hashlib.sha256()
        count = 0
        for row in connection.execute('select * from ' + quote(name) + ' order by rowid'):
            digest.update(repr(row).encode('utf-8'))
            digest.update(b'\n')
            count += 1
        state[name] = (count, digest.hexdigest())
    return state


def check_integrity(connection):
    if connection.execute('pragma integrity_check').fetchall() != [('ok',)]:
        raise RuntimeError('SQLite integrity check failed')
    if connection.execute('pragma foreign_key_check').fetchall():
        raise RuntimeError('Foreign key check failed')


def run_migrator(repo, sandbox, bun, mode):
    start = time.monotonic()
    result = subprocess.run(
        [bun, 'run', str(repo / 'scripts/db/migrate-rehearsal.ts'), str(sandbox), mode],
        cwd=repo, capture_output=True, text=True, timeout=60, check=False,
    )
    if result.returncode != 0:
        raise RuntimeError('Rehearsal runner failed (output withheld)')
    # Runner emits only a boolean; never include subprocess output in audit reports.
    status = json.loads(result.stdout.strip())
    return status['migrated'], round(time.monotonic() - start, 4)


def rehearse(source, repo, output, bun):
    source = source.resolve(strict=True)
    repo = repo.resolve(strict=True)
    output = output.resolve()
    if not source.is_file() or output.exists() or output.is_relative_to(source.parent):
        raise ValueError('Use a NEW sandbox outside the source database directory')
    journal = json.loads((repo / 'drizzle/meta/_journal.json').read_text(encoding='utf-8'))
    entries = journal['entries']
    if len(entries) != 1 or entries[0]['idx'] != 0:
        raise ValueError('This rehearsal supports the initial one-migration baseline only')
    entry = entries[0]
    sql_file = (repo / 'drizzle' / (entry['tag'] + '.sql')).resolve(strict=True)
    if sql_file.parent != (repo / 'drizzle').resolve():
        raise ValueError('Invalid migration path')
    migration_hash = hashlib.sha256(sql_file.read_bytes()).hexdigest()
    os.umask(0o077)
    output.mkdir(mode=0o700)
    (output / '.convoca-migration-rehearsal').write_text('v1\n', encoding='utf-8')
    snapshot = output / 'snapshot.db'
    started = time.monotonic()
    source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
    with closing(readonly(source)) as live:
        with closing(sqlite3.connect(snapshot)) as destination:
            live.backup(destination)
    backup_seconds = round(time.monotonic() - started, 4)
    # reference.db is created by the actual installed Drizzle migrator.
    migrated, reference_seconds = run_migrator(repo, output, bun, 'reference')
    if not migrated:
        raise RuntimeError('Clean reference migration failed')
    with closing(readonly(snapshot)) as copy, closing(readonly(output / 'reference.db')) as reference:
        check_integrity(copy)
        check_integrity(reference)
        if schema(copy) != schema(reference):
            raise RuntimeError('Schema mismatch: no baseline recorded, inspect protected snapshot/reference')
        if copy.execute('select count(*) from ' + LEDGER).fetchone()[0] != 0:
            raise RuntimeError('Source ledger is not empty; no baseline recorded')
        expected_ledger = reference.execute('select hash,created_at from ' + LEDGER).fetchall()
        if expected_ledger != [(migration_hash, entry['when'])]:
            raise RuntimeError('Reference ledger does not match repository bytes/journal')
        before = data_state(copy)
        original_schema = schema(copy)
        original_all_data = data_state(copy, include_ledger=True)
        counts = {name: value[0] for name, value in before.items() if not name.startswith('sqlite_')}
        foreign_keys = sum(len(copy.execute('pragma foreign_key_list(' + quote(name) + ')').fetchall()) for name in counts)
        orphan_counts = {}
        for table, column, parent in [
            ('applications', 'user_id', 'users'), ('applications', 'program_id', 'programs'),
            ('programs', 'university_id', 'universities'), ('users', 'university_id', 'universities'),
            ('documents', 'application_id', 'applications'), ('documents', 'user_id', 'users'),
            ('notifications', 'user_id', 'users'), ('notifications', 'application_id', 'applications'),
            ('status_history', 'application_id', 'applications'), ('status_history', 'changed_by', 'users'),
        ]:
            orphan_counts[table + '.' + column] = copy.execute(
                f'SELECT count(*) FROM {quote(table)} child LEFT JOIN {quote(parent)} parent '
                f'ON child.{quote(column)}=parent.id WHERE child.{quote(column)} IS NOT NULL AND parent.id IS NULL'
            ).fetchone()[0]
    # First demonstrate that applying the current initial migration directly is unsafe.
    shutil.copy2(snapshot, output / 'unbaselined.db')
    migrated, rejected_seconds = run_migrator(repo, output, bun, 'unbaselined')
    if migrated:
        raise RuntimeError('Expected existing-schema migration rejection did not occur')
    with closing(readonly(output / 'unbaselined.db')) as rejected:
        if schema(rejected) != original_schema or data_state(rejected, True) != original_all_data:
            raise RuntimeError('Rejected migration changed its disposable copy')
    # The ONLY baseline write happens to this newly-created file, never the source.
    candidate = output / 'reconciled.db'
    shutil.copy2(snapshot, candidate)
    with closing(sqlite3.connect(candidate)) as copy:
        with copy:
            copy.execute('begin immediate')
            copy.execute('insert into ' + LEDGER + '(hash,created_at) values (?,?)', expected_ledger[0])
    durations = []
    for _ in range(2):
        migrated, duration = run_migrator(repo, output, bun, 'reconciled')
        if not migrated:
            raise RuntimeError('Reconciled copy migration failed')
        durations.append(duration)
        with closing(readonly(candidate)) as copy:
            check_integrity(copy)
            if schema(copy) != original_schema or data_state(copy) != before:
                raise RuntimeError('Schema or business data changed on reconciled copy')
            if copy.execute('select hash,created_at from ' + LEDGER).fetchall() != expected_ledger:
                raise RuntimeError('Ledger changed on repeated migration')
    shutil.copy2(snapshot, output / 'restore-drill.db')
    with closing(readonly(output / 'restore-drill.db')) as restored:
        check_integrity(restored)
        if schema(restored) != original_schema or data_state(restored, True) != original_all_data:
            raise RuntimeError('Restore drill mismatch')
    with closing(readonly(source)) as live:
        source_ledger_still_empty = live.execute('select count(*) from ' + LEDGER).fetchone()[0] == 0
    report = {
        'schema_exact_match': True, 'integrity': 'ok', 'table_counts': counts,
        'declared_foreign_keys': foreign_keys, 'logical_orphan_counts': orphan_counts,
        'direct_migration_rejected_without_changes': True,
        'baseline_on_copy_only': {'tag': entry['tag'], 'hash': migration_hash, 'created_at': entry['when']},
        'two_migrator_reruns_passed': True, 'business_data_and_sequences_preserved': True,
        'restore_verified': True, 'source_ledger_still_empty': source_ledger_still_empty,
        'source_main_file_unchanged': source_hash == hashlib.sha256(source.read_bytes()).hexdigest(),
        'seconds': {'snapshot': backup_seconds, 'clean_reference': reference_seconds,
                    'rejected_migration': rejected_seconds, 'reconciled_reruns': durations},
        'limitations': 'Protected non-anonymized copies remain on server. No production baseline applied. No new schema migration/load test. Main-file hash alone does not audit WAL activity. FK check cannot detect relationships without declared constraints.',
    }
    (output / 'report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--repo', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--bun', default='bun')
    args = parser.parse_args()
    try:
        print(json.dumps(rehearse(args.source, args.repo, args.output, args.bun), indent=2))
    except Exception as error:
        # Avoid leaking rows, SQL parameters or environment data from unexpected errors.
        print(json.dumps({'completed': False, 'error_type': type(error).__name__,
                          'reason': str(error) if isinstance(error, (ValueError, RuntimeError)) else 'Audit failed; inspect protected artifacts'}))
        raise SystemExit(1)
