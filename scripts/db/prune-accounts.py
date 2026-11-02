"""Explicit, transactional account cleanup. Backup must be taken before applying to stopped production."""
import argparse,json,sqlite3
from contextlib import closing
from pathlib import Path

def prune(connection,keep_id,expected_email,apply=False):
    connection.execute('begin immediate')
    try:
        keeper=connection.execute('select id,email,role,is_active from users where id=?',(keep_id,)).fetchone()
        if keeper!=(keep_id,expected_email,'super_admin',1): raise ValueError('Selected account must be the expected active administrator')
        kept=connection.execute('select * from users where id=?',(keep_id,)).fetchone()
        catalog={table:connection.execute('select * from '+table+' order by id').fetchall() for table in ['universities','programs']}
        steps=[
          ('documents','user_id != ? OR application_id IN (SELECT id FROM applications WHERE user_id != ?)',(keep_id,keep_id)),
          ('notifications','user_id != ? OR application_id IN (SELECT id FROM applications WHERE user_id != ?)',(keep_id,keep_id)),
          ('status_history','changed_by != ? OR application_id IN (SELECT id FROM applications WHERE user_id != ?)',(keep_id,keep_id)),
          ('institutional_reviews','user_id != ? OR reviewer_id != ?',(keep_id,keep_id)),
          ('applications','user_id != ?',(keep_id,)),
          ('users','id != ?',(keep_id,)),
        ]
        removed={}
        for table,where,args in steps:
            removed[table]=connection.execute('delete from '+table+' where '+where,args).rowcount
        if connection.execute('select * from users').fetchall()!=[kept]: raise RuntimeError('Keeper changed')
        for table,rows in catalog.items():
            if connection.execute('select * from '+table+' order by id').fetchall()!=rows: raise RuntimeError('Catalog changed')
        if connection.execute('pragma integrity_check').fetchall()!=[('ok',)] or connection.execute('pragma foreign_key_check').fetchall(): raise RuntimeError('Integrity failed')
        checks=[('applications','user_id','users'),('documents','user_id','users'),('documents','application_id','applications'),('notifications','user_id','users'),('notifications','application_id','applications'),('status_history','application_id','applications'),('status_history','changed_by','users'),('institutional_reviews','user_id','users'),('institutional_reviews','reviewer_id','users')]
        for table,column,parent in checks:
            if connection.execute(f'SELECT count(*) FROM {table} child LEFT JOIN {parent} parent ON child.{column}=parent.id WHERE child.{column} IS NOT NULL AND parent.id IS NULL').fetchone()[0]: raise RuntimeError('Orphan records detected')
        result={'applied':apply,'retained_admin_id':keep_id,'deleted':removed,'keeper_unchanged':True,'catalog_unchanged':True,'integrity':'ok','logical_orphans':0}
        if apply: connection.commit()
        else: connection.rollback()
        return result
    except BaseException:
        connection.rollback();raise

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--database',type=Path,required=True);p.add_argument('--keep-id',type=int,required=True);p.add_argument('--expected-email',required=True);p.add_argument('--apply',action='store_true');a=p.parse_args()
    database=a.database.resolve(strict=True)
    with closing(sqlite3.connect(database.as_uri()+'?mode=rw',uri=True)) as c:
        print(json.dumps(prune(c,a.keep_id,a.expected_email,a.apply)))
