"""Register only the reviewed initial baseline. Requires a verified reference and new backup directory."""
import argparse
from contextlib import closing
import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3

spec = importlib.util.spec_from_file_location('audit', Path(__file__).with_name('audit-baseline.py'))
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
EXPECTED = ('6ecd3ac9a6848e5c30a8482ec14866f1c34b97752e158ee10fa38edcd30ede56', 1780709683240)

def register(source, reference, repo, backup):
    source, reference, repo = source.resolve(strict=True), reference.resolve(strict=True), repo.resolve(strict=True)
    backup = backup.resolve()
    if source == reference or backup.exists() or backup.is_relative_to(source.parent):
        raise ValueError('Invalid reference or backup directory')
    journal = json.loads((repo/'drizzle/meta/_journal.json').read_text())['entries']
    if len(journal) != 1 or journal[0]['tag'] != '0000_clammy_multiple_man' or journal[0]['when'] != EXPECTED[1]:
        raise ValueError('Unexpected journal')
    if hashlib.sha256((repo/'drizzle/0000_clammy_multiple_man.sql').read_bytes()).hexdigest() != EXPECTED[0]:
        raise ValueError('Unexpected SQL hash')
    with closing(audit.readonly(reference)) as ref:
        audit.check_integrity(ref)
        expected_schema = audit.schema(ref)
        if ref.execute('select hash,created_at from __drizzle_migrations').fetchall() != [EXPECTED]:
            raise ValueError('Reference ledger mismatch')
    backup.mkdir(mode=0o700)
    with closing(audit.readonly(source)) as live, closing(sqlite3.connect(backup/'before.db')) as saved:
        live.backup(saved)
    with closing(audit.readonly(backup/'before.db')) as saved:
        audit.check_integrity(saved)
        before = audit.data_state(saved, True)
    with closing(sqlite3.connect((source.as_uri()+'?mode=rw'), uri=True)) as live:
        try:
            live.execute('begin exclusive')
            audit.check_integrity(live)
            if audit.schema(live) != expected_schema or audit.data_state(live, True) != before:
                raise ValueError('Schema drift or concurrent writes since backup')
            if live.execute('select count(*) from __drizzle_migrations').fetchone()[0] != 0:
                raise ValueError('Ledger must be empty')
            business = audit.data_state(live)
            live.execute('insert into __drizzle_migrations(hash,created_at) values (?,?)', EXPECTED)
            if audit.data_state(live) != business or audit.schema(live) != expected_schema:
                raise RuntimeError('Unexpected schema/data change')
            if live.execute('select hash,created_at from __drizzle_migrations').fetchall() != [EXPECTED]:
                raise RuntimeError('Unexpected ledger')
            audit.check_integrity(live)
            live.commit()
        except BaseException:
            live.rollback()
            raise
    report = {'baseline_registered': True, 'business_data_and_sequences_unchanged': True, 'schema_unchanged': True,
              'integrity': 'ok', 'ledger_rows': 1, 'backup_verified': True}
    (backup/'result.json').write_text(json.dumps(report,indent=2)+'\n')
    return report

if __name__ == '__main__':
    p=argparse.ArgumentParser(description=__doc__)
    for name in ['source','reference','repo','backup']: p.add_argument('--'+name,type=Path,required=True)
    args=p.parse_args()
    try: print(json.dumps(register(args.source,args.reference,args.repo,args.backup)))
    except Exception: print('Baseline registration failed; transaction rolled back if not committed'); raise SystemExit(1)
