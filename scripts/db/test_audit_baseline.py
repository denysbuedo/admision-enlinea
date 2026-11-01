"""Integration/safety tests on synthetic SQLite files; requires installed Bun + repo dependencies."""
from contextlib import closing
import hashlib
import importlib.util
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest

MODULE = Path(__file__).with_name('audit-baseline.py')
spec = importlib.util.spec_from_file_location('audit_baseline', MODULE)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
REPO = MODULE.resolve().parents[2]
BUN = os.environ.get('BUN_BIN', 'bun')


class BaselineRehearsalTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='convoca-baseline-test-')
        self.root = Path(self.temp.name)
        fixtures = self.root / 'fixtures'
        fixtures.mkdir()
        self.source = fixtures / 'source.db'
        with closing(sqlite3.connect(self.source)) as connection:
            connection.executescript((REPO / 'drizzle/0000_clammy_multiple_man.sql').read_text(encoding='utf-8'))
            connection.execute('CREATE TABLE "__drizzle_migrations" (\n\t\t\tid SERIAL PRIMARY KEY,\n\t\t\thash text NOT NULL,\n\t\t\tcreated_at numeric\n\t\t)')
            connection.execute("insert into users(name,email,password) values ('Synthetic','test@example.invalid','not-a-real-password')")
            connection.commit()
        self.before = hashlib.sha256(self.source.read_bytes()).hexdigest()

    def tearDown(self):
        self.assertEqual(hashlib.sha256(self.source.read_bytes()).hexdigest(), self.before)
        self.temp.cleanup()

    def test_full_rehearsal_preserves_source_data_and_restores(self):
        report = audit.rehearse(self.source, REPO, self.root / 'audit', BUN)
        self.assertTrue(report['two_migrator_reruns_passed'])
        self.assertTrue(report['restore_verified'])
        self.assertTrue(report['source_ledger_still_empty'])
        self.assertEqual(report['table_counts']['users'], 1)

    def test_schema_drift_is_rejected_without_baselining(self):
        with closing(sqlite3.connect(self.source)) as connection:
            connection.execute('alter table users add column unexpected text')
        self.before = hashlib.sha256(self.source.read_bytes()).hexdigest()
        with self.assertRaisesRegex(RuntimeError, 'Schema mismatch'):
            audit.rehearse(self.source, REPO, self.root / 'audit', BUN)
        self.assertFalse((self.root / 'audit/reconciled.db').exists())

    def test_nonempty_ledger_is_rejected(self):
        with closing(sqlite3.connect(self.source)) as connection:
            connection.execute("insert into __drizzle_migrations(hash,created_at) values ('unexpected',1)")
            connection.commit()
        self.before = hashlib.sha256(self.source.read_bytes()).hexdigest()
        with self.assertRaisesRegex(RuntimeError, 'not empty'):
            audit.rehearse(self.source, REPO, self.root / 'audit', BUN)
        self.assertFalse((self.root / 'audit/reconciled.db').exists())

    def test_rejects_existing_output_and_directory_inside_source(self):
        for output in [self.root, self.source.parent / 'new-audit']:
            with self.assertRaises(ValueError):
                audit.rehearse(self.source, REPO, output, BUN)

    def test_reference_runner_rejects_missing_marker(self):
        directory = self.root / 'unmarked'
        directory.mkdir()
        with self.assertRaises(RuntimeError):
            audit.run_migrator(REPO, directory, BUN, 'reference')
        self.assertEqual(list(directory.iterdir()), [])


if __name__ == '__main__':
    unittest.main()
