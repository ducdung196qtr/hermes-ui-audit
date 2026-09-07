# Hermes Audit

A client-facing website quality report tool.

## MVP behavior

- The public UI is hosted on Vercel.
- The production audit controller is a protected VPS service with a strict FIFO queue: **one Chromium/Hermes audit at a time**.
- Screenshots and issue crops expire after **24 hours**. Raw DOM/style payloads are not persisted.
- Report summaries are retained for seven days in the MVP.
- Public URL audits report observable browser evidence. Source-level class naming and maintainability require separately authorized repository access.

## Local development

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

Copy `.env.example` for production configuration. Never commit secrets.

## Controller

The controller code lives in `apps/controller/`. See `docs/operations.md` for FIFO and deployment constraints.

> The initial Vercel deployment defaults to a clearly labeled UI/demo report until an authenticated HTTPS controller endpoint is configured. It does not expose the VPS browser runner or 9Router directly to public clients.

## Security

Only public HTTP(S) URLs on standard ports are accepted. Local/private/link-local targets and embedded URL credentials are blocked. The controller must be kept behind TLS and a server-side Vercel token.

## Limitations

This is a diagnostic tool, not a Google ranking guarantee, conversion prediction, WCAG certification, or complete source-code review.
