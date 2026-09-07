"use client";

import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AuditForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setLoading(true);
    try {
      const response = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We could not start this audit.");
      if (data.mode === "live") {
        router.push(`/report/${data.job.id}`);
        return;
      }
      sessionStorage.setItem(`report:${data.report.id}`, JSON.stringify(data.report));
      router.push(`/report/${data.report.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "We could not start this audit."); }
    finally { setLoading(false); }
  }

  return <>
    <form className="audit-form" onSubmit={submit}>
      <input aria-label="Website URL" className="audit-input" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://yourwebsite.com" inputMode="url" required />
      <button className="primary-button" disabled={loading} type="submit">{loading ? <><LoaderCircle size={17} className="spin" /> Reviewing</> : <>Review website <ArrowRight size={17} /></>}</button>
    </form>
    {error && <p className="form-error" role="alert">{error}</p>}
    <p className="privacy"><ShieldCheck size={16} /> Public URLs only. We do not log credentials or form values. Audit screenshots are automatically deleted within 24 hours.</p>
  </>;
}
