#!/usr/bin/env python3
"""Single-process FIFO controller: one audit at a time, no cluster mode."""
import json, os, sqlite3, threading, time, uuid
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

ROOT=os.path.dirname(__file__); DATA=os.path.join(ROOT,"data"); os.makedirs(DATA,exist_ok=True)
DB=os.path.join(DATA,"audit.sqlite3"); TOKEN=os.environ.get("AUDIT_CONTROLLER_TOKEN","")

def db():
 c=sqlite3.connect(DB); c.row_factory=sqlite3.Row
 c.execute("CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, seq INTEGER UNIQUE, url TEXT, status TEXT, phase TEXT, progress INTEGER, created TEXT, started TEXT, completed TEXT, error TEXT, report TEXT)")
 return c

def valid(raw):
 try:
  p=urlparse(raw); h=(p.hostname or '').lower()
  return p.scheme in ('http','https') and not p.username and not p.password and (not p.port or p.port in (80,443)) and h not in ('localhost','metadata.google.internal') and not h.startswith(('127.','10.','192.168.','169.254.'))
 except ValueError:return False

def stamp(): return datetime.now(timezone.utc).isoformat()
def status(jid):
 c=db(); r=c.execute('SELECT * FROM jobs WHERE id=?',(jid,)).fetchone()
 if not r: c.close(); return None
 out=dict(r); out.pop('report',None)
 if r['status']=='queued': out['position']=c.execute("SELECT COUNT(*) FROM jobs WHERE status='queued' AND seq<?",(r['seq'],)).fetchone()[0]+1
 if r['status']=='completed' and r['report']: out['report']=json.loads(r['report'])
 c.close(); return out

class Handler(BaseHTTPRequestHandler):
 def sendj(self, code, obj):
  raw=json.dumps(obj).encode(); self.send_response(code); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(raw))); self.end_headers(); self.wfile.write(raw)
 def authorized(self): return bool(TOKEN) and self.headers.get('Authorization') == 'Bearer '+TOKEN
 def do_GET(self):
  if self.path=='/healthz': return self.sendj(200,{'ok':True,'mode':'single-fifo','active':False})
  if not self.authorized(): return self.sendj(401,{'error':'unauthorized'})
  if self.path.startswith('/internal/audits/'):
   item=status(self.path.rsplit('/',1)[1]); return self.sendj(200,item) if item else self.sendj(404,{'error':'not_found'})
  self.sendj(404,{'error':'not_found'})
 def do_POST(self):
  if not self.authorized(): return self.sendj(401,{'error':'unauthorized'})
  if self.path!='/internal/audits': return self.sendj(404,{'error':'not_found'})
  try: raw=json.loads(self.rfile.read(int(self.headers.get('Content-Length','0')))); url=str(raw.get('url',''))
  except Exception:return self.sendj(400,{'error':'invalid_payload'})
  if not valid(url): return self.sendj(400,{'error':'unsafe_or_invalid_url'})
  c=db(); waiting=c.execute("SELECT COUNT(*) FROM jobs WHERE status='queued'").fetchone()[0]
  if waiting>=3: c.close(); return self.sendj(429,{'error':'queue_full'})
  seq=c.execute('SELECT COALESCE(MAX(seq),0)+1 FROM jobs').fetchone()[0]; jid=str(uuid.uuid4())
  c.execute('INSERT INTO jobs VALUES (?,?,?,?,?,?,?,?,?,?,?)',(jid,seq,url,'queued','queued',0,stamp(),None,None,None,None));c.commit();c.close()
  self.sendj(202,{'id':jid,'status':'queued','position':waiting+1})
 def log_message(self,*args): pass

if __name__=='__main__': ThreadingHTTPServer(('0.0.0.0',int(os.environ.get('PORT','8788'))),Handler).serve_forever()
