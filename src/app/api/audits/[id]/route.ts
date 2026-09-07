import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const controllerUrl = process.env.AUDIT_CONTROLLER_URL;
  const controllerToken = process.env.AUDIT_CONTROLLER_TOKEN;
  if (!controllerUrl || !controllerToken) return NextResponse.json({ error: "The protected audit controller is not configured yet." }, { status: 503 });
  try {
    const response = await fetch(`${controllerUrl.replace(/\/$/, "")}/internal/audits/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${controllerToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: "The protected audit controller is unavailable. Please try again shortly." }, { status: 503 });
  }
}
