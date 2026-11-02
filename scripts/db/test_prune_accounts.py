import importlib.util,sqlite3,unittest
from pathlib import Path
HERE=Path(__file__).parent;REPO=HERE.resolve().parents[1]
spec=importlib.util.spec_from_file_location('prune',HERE/'prune-accounts.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class PruneTests(unittest.TestCase):
    def setUp(self):
        self.db=sqlite3.connect(':memory:')
        for sql in sorted((REPO/'drizzle').glob('*.sql')):self.db.executescript(sql.read_text(encoding='utf-8'))
        self.db.execute("insert into universities(id,name) values (1,'Synthetic')")
        self.db.execute("insert into programs(id,university_id,title,program_type,modality) values (1,1,'Synthetic','curso','virtual')")
        self.db.execute("insert into users(id,name,email,password,role) values (1,'Admin','keep@example.invalid','unchanged','super_admin'),(2,'Other','remove@example.invalid','unused','aspirant')")
        self.db.execute('insert into applications(id,user_id,program_id) values (1,2,1)')
        self.db.execute("insert into notifications(user_id,application_id,type,title,message) values (2,1,'test','test','test')")
        self.db.execute("insert into status_history(application_id,to_status,changed_by) values (1,'draft',2)")
        self.db.commit()
    def tearDown(self):self.db.close()
    def test_apply_keeps_exact_admin_and_catalog_and_removes_dependencies(self):
        result=module.prune(self.db,1,'keep@example.invalid',True)
        self.assertEqual(result['deleted']['users'],1);self.assertEqual(result['deleted']['applications'],1)
        self.assertEqual(self.db.execute('select email,password from users').fetchall(),[('keep@example.invalid','unchanged')])
    def test_dryrun_rolls_back_everything(self):
        before=list(self.db.iterdump());module.prune(self.db,1,'keep@example.invalid');self.assertEqual(list(self.db.iterdump()),before)
    def test_wrong_keeper_is_rejected_without_mutation(self):
        before=list(self.db.iterdump())
        for id,email in [(2,'remove@example.invalid'),(1,'wrong@example.invalid'),(99,'missing@example.invalid')]:
            with self.assertRaises(ValueError):module.prune(self.db,id,email,True)
        self.assertEqual(list(self.db.iterdump()),before)
if __name__=='__main__':unittest.main()
