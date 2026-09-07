import { NextResponse } from "next/server";
import { createDemoReport } from "@/lib/audit/demo-report";
import { validateAuditUrl } from "@/lib/security/url-policy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.AUDIT_ENABLED === "false") {
    return NextResponse.json({ error: "Audits are temporarily paused for maintenance." }, { status: 503 });
  }
  const body = await request.json().catch(() => ({}));
  const validated = validateAuditUrl(String(body?.url ?? ""));
  if (!validated.ok) return NextResponse.json({ error: validated.message }, { status: 400 });

  const controllerUrl = process.env.AUDIT_CONTROLLER_URL;
  const controllerToken = process.env.AUDIT_CONTROLLER_TOKEN;
  if (controllerUrl && controllerToken) {
    try {
      const upstream = await fetch(`${controllerUrl.replace(/\/$/, "")}/internal/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${controllerToken}` },
        body: JSON.stringify({ url: validated.url }),
        signal: AbortSignal.timeout(10_000),
      });
      const payload = await upstream.json();
      if (!upstream.ok) return NextResponse.json({ error: payload.error ?? "The review queue is unavailable." }, { status: upstream.status });
      return NextResponse.json({ mode: "live", job: payload }, { status: 202 });
    } catch {
      return NextResponse.json({ error: "The protected audit controller is unavailable. Please try again shortly." }, { status: 503 });
    }
  }

  // Demo mode deliberately returns a clearly labeled sample report. It allows
  // Vercel UI QA before an authenticated HTTPS controller hostname is configured.
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "false") return NextResponse.json({ mode: "demo", report: createDemoReport(validated.url) });
  return NextResponse.json({ error: "The protected audit controller is not configured yet." }, { status: 503 });
}
