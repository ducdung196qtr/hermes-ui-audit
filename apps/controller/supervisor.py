#!/usr/bin/env python3
"""Strict FIFO supervisor: starts the next browser only after current process exits."""
import json, os, sqlite3, subprocess, sys, time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DB = ROOT / "data" / "audit.sqlite3"

def stamp(): return datetime.now(timezone.utc).isoformat()
def db():
    con = sqlite3.connect(DB); con.row_factory = sqlite3.Row
    return con

def update(job_id, **values):
    con=db(); columns=", ".join(f"{key}=?" for key in values)
    con.execute(f"UPDATE jobs SET {columns} WHERE id=?", (*values.values(), job_id)); con.commit(); con.close()

def cleanup_artifacts():
    cutoff=time.time() - 24*60*60; base=ROOT/"data"/"artifacts"
    if not base.exists(): return
    for path in base.rglob("*"):
        if path.is_file() and path.stat().st_mtime < cutoff: path.unlink(missing_ok=True)
    for path in sorted(base.glob("*")):
        if path.is_dir() and not any(path.iterdir()): path.rmdir()

def next_job():
    con=db()
    # BEGIN IMMEDIATE makes claiming the first queue item atomic.
    con.execute("BEGIN IMMEDIATE")
    active=con.execute("SELECT id FROM jobs WHERE status='running' LIMIT 1").fetchone()
    job=None if active else con.execute("SELECT * FROM jobs WHERE status='queued' ORDER BY seq ASC LIMIT 1").fetchone()
    if job:
        con.execute("UPDATE jobs SET status='running', phase='desktop_review', progress=15, started=? WHERE id=?",(stamp(),job['id']))
    con.commit(); con.close(); return job

def main():
    while True:
        cleanup_artifacts()
        job=next_job()
        if not job:
            time.sleep(1); continue
        result=ROOT/"data"/f"{job['id']}.json"
        try:
            proc=subprocess.run([sys.executable,str(ROOT/'runner.py'),job['id'],job['url'],str(result)],timeout=120)
            if proc.returncode != 0: raise RuntimeError("Browser audit runner failed")
            update(job['id'], status='completed', phase='completed', progress=100, completed=stamp(), report=result.read_text())
        except subprocess.TimeoutExpired:
            update(job['id'], status='timed_out', phase='timed_out', progress=100, completed=stamp(), error='This website took too long to inspect.')
        except Exception:
            update(job['id'], status='failed', phase='failed', progress=100, completed=stamp(), error='The browser audit could not complete safely.')
        finally:
            result.unlink(missing_ok=True)
            # Only now (child exited + terminal DB state) can the loop claim next FIFO job.
            cleanup_artifacts()

if __name__ == '__main__': main()
