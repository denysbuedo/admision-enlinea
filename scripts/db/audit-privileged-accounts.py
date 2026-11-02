"""Read-only application privilege inventory. Identity details stay in a protected server report."""
import argparse
from contextlib import closing
from datetime import datetime, timezone
import hashlib,json,os
from pathlib import Path
import sqlite3


def inventory(source, output):
    source=source.resolve(strict=True);output=output.resolve()
    if output.exists() or output.is_relative_to(source.parent): raise ValueError('Use a new protected report directory outside the database directory')
    os.umask(0o077);output.mkdir(mode=0o700)
    before=hashlib.sha256(source.read_bytes()).hexdigest()
    with closing(sqlite3.connect(source.as_uri()+'?mode=ro',uri=True)) as db:
        db.execute('pragma query_only=ON');db.execute('begin')
        db.row_factory=sqlite3.Row
        rows=[dict(row) for row in db.execute("""select u.id,u.name,u.email,u.role,u.university_id,u.is_active,
          u.institutional_status,u.session_revision,u.created_at,v.name university_name,v.is_active university_active,
          (select count(*) from institutional_reviews r where r.user_id=u.id) review_count
          from users u left join universities v on v.id=u.university_id
          where u.role in ('super_admin','university') order by u.role,u.id""")]
        review_anomalies=db.execute("""select count(*) from institutional_reviews r left join users reviewer on reviewer.id=r.reviewer_id
          left join users subject on subject.id=r.user_id where reviewer.id is null or subject.id is null""").fetchone()[0]
        totals={row['role']:row['n'] for row in db.execute('select role,count(*) n from users group by role')}
        for row in rows:
            row['flags']=[]
            if row['role']=='super_admin': row['flags'].append('owner_authorization_not_proven_by_database')
            elif row['institutional_status']=='approved' and row['review_count']==0: row['flags'].append('inherited_approval_without_recorded_review')
            if row['role']=='university' and (not row['university_id'] or row['university_name'] is None): row['flags'].append('missing_institution')
            if row['role']=='university' and row['is_active'] and row['university_name'] is not None and not row['university_active']: row['flags'].append('active_account_at_inactive_institution')
            if row['role']=='university' and row['is_active'] and row['institutional_status']!='approved': row['flags'].append('active_without_approval')
        ledger_rows=db.execute('select count(*) from __drizzle_migrations').fetchone()[0]
    summary={'created_at':datetime.now(timezone.utc).isoformat(),'total_accounts_by_role':totals,
      'privileged_accounts':len(rows),'active_admins':sum(r['role']=='super_admin' and bool(r['is_active']) for r in rows),
      'active_institutional_accounts':sum(r['role']=='university' and bool(r['is_active']) for r in rows),
      'inherited_institutional_without_review':sum('inherited_approval_without_recorded_review' in r['flags'] for r in rows),
      'review_orphan_records':review_anomalies,'ledger_rows':ledger_rows,
      'flag_counts':{flag:sum(flag in r['flags'] for r in rows) for flag in sorted({flag for r in rows for flag in r['flags']})},
      'source_main_file_unchanged':before==hashlib.sha256(source.read_bytes()).hexdigest(),
      'limits':'No passwords/hashes selected; no accounts changed. Ownership and legitimate representation require an authorized human decision. Main-file equality alone does not inspect WAL activity.'}
    (output/'inventory-private.json').write_text(json.dumps({'summary':summary,'accounts':rows},indent=2)+'\n',encoding='utf-8')
    (output/'summary.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
    return summary

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--source',type=Path,required=True);p.add_argument('--output',type=Path,required=True);args=p.parse_args()
    try: print(json.dumps(inventory(args.source,args.output),indent=2))
    except Exception: print('Privilege audit failed; no account changes requested');raise SystemExit(1)
