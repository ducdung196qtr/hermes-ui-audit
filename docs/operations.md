# Hermes Audit Controller Operations

- API and FIFO supervisor each run as **one PM2 fork instance**. Never use cluster mode.
- The supervisor permits exactly one active Chromium audit. It waits for the child runner to exit and job state to become terminal before claiming the next FIFO row.
- Screenshots/crops are stored under `apps/controller/data/artifacts/` and deleted at most 24 hours after creation. Sanitized reports expire separately after seven days in the product policy.
- Start: `pm2 start deploy/audit-controller.config.cjs`
- Stop: `pm2 delete hermes-audit-api hermes-audit-fifo`
- Health: `curl http://127.0.0.1:8788/healthz`
- Audit API endpoints require `Authorization: Bearer $AUDIT_CONTROLLER_TOKEN`. Do not expose this port publicly without a TLS reverse proxy/Cloudflare Tunnel and server-side Vercel token protection.
- Emergency safety: set `AUDIT_WORKER_ENABLED=false`, restart both processes, and show Vercel maintenance state.
- Never log raw DOM, form values, browser cookies, credentials or AI secrets.
