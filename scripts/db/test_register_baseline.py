from contextlib import closing
import importlib.util
from pathlib import Path
import os
import sqlite3
import tempfile
import unittest
import json

HERE=Path(__file__).parent
spec=importlib.util.spec_from_file_location('registration',HERE/'register-baseline.py')
registration=importlib.util.module_from_spec(spec)
spec.loader.exec_module(registration)
audit=registration.audit
REPO=HERE.resolve().parents[1]

@unittest.skipUnless(len(json.loads((REPO/'drizzle/meta/_journal.json').read_text())['entries']) == 1, 'Historical initial-baseline rehearsal; superseded after migration 0001')
class RegisterTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='convoca-register-test-')
        self.root=Path(self.temp.name)
        self.source=self.root/'data'/'source.db'
        self.source.parent.mkdir()
        ref=self.root/'reference'
        ref.mkdir()
        (ref/'.convoca-migration-rehearsal').write_text('v1\n')
        self.assertTrue(audit.run_migrator(REPO,ref,os.environ.get('BUN_BIN','bun'),'reference')[0])
        self.reference=ref/'reference.db'
        with closing(audit.readonly(self.reference)) as source, closing(sqlite3.connect(self.source)) as target:
            source.backup(target)
            target.execute('delete from __drizzle_migrations')
            target.execute("insert into users(name,email,password) values ('Synthetic','test@example.invalid','synthetic-hash')")
            target.commit()
        self.before=self.source.read_bytes()
    def tearDown(self): self.temp.cleanup()
    def apply(self,folder='backup'):
        return registration.register(self.source,self.reference,REPO,self.root/folder)
    def test_register_preserves_business_and_repeat_is_rejected(self):
        with closing(audit.readonly(self.source)) as c: before=audit.data_state(c)
        self.assertTrue(self.apply()['baseline_registered'])
        with closing(audit.readonly(self.source)) as c:
            self.assertEqual(audit.data_state(c),before)
            self.assertEqual(c.execute('select hash,created_at from __drizzle_migrations').fetchall(),[registration.EXPECTED])
        after=self.source.read_bytes()
        with self.assertRaises(ValueError): self.apply('repeat')
        self.assertEqual(self.source.read_bytes(),after)
    def test_drift_rejected_without_ledger_write(self):
        with closing(sqlite3.connect(self.source)) as c: c.execute('alter table users add column unexpected text')
        before=self.source.read_bytes()
        with self.assertRaises(ValueError): self.apply()
        self.assertEqual(self.source.read_bytes(),before)
    def test_existing_backup_rejected(self):
        (self.root/'backup').mkdir()
        with self.assertRaises(ValueError): self.apply()
        self.assertEqual(self.source.read_bytes(),self.before)

if __name__=='__main__': unittest.main()
