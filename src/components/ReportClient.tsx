"use client";

import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { categoryLabels, type AuditReport, type Finding, type Severity } from "@/lib/audit/types";

function severityText(severity: Severity) { return severity.replace("_", " "); }
function FindingCard({ finding }: { finding: Finding }) {
  return <article className="finding">
    <div className="finding-top"><span className={`severity ${finding.severity}`}>{severityText(finding.severity)}</span><div><h3 className="finding-title">{finding.title}</h3></div></div>
    <div className="finding-meta"><div><b>Why it matters</b>{finding.impact}</div><div><b>Evidence</b>{finding.evidence}</div><div><b>Recommended action</b>{finding.recommendation}</div></div>
    {finding.code && <pre className="code"><code>{finding.code}</code></pre>}
  </article>;
}
export function ReportClient({ id }: { id: string }) {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [state, setState] = useState<{ status: string; position?: number; phase?: string; message?: string } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`report:${id}`);
    if (stored) {
      const timer = window.setTimeout(() => setReport(JSON.parse(stored)), 0);
      return () => window.clearTimeout(timer);
    }
    let cancelled = false;
    async function poll() {
      try {
        const response = await fetch(`/api/audits/${id}`, { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        if (data.status === "completed") { setReport(data.report); return; }
        if (data.status === "failed" || data.status === "timed_out") { setState({ status: data.status, message: data.error ?? "The audit could not complete safely." }); return; }
        setState(data);
        window.setTimeout(poll, 4000);
      } catch { if (!cancelled) setState({ status: "failed", message: "We could not reach the protected audit controller." }); }
    }
    poll(); return () => { cancelled = true; };
  }, [id]);

  if (!report) return <main className="shell report-wrap"><Link className="back-link" href="/"><ArrowLeft size={16} /> Back to audit</Link><section className="panel" style={{marginTop:24}}><div className="panel-inner"><h1 style={{margin:"0 0 12px",fontSize:"clamp(2rem,4vw,3.4rem)",letterSpacing:"-.05em"}}>{state?.status === "queued" ? "You are in the review queue" : state?.status === "running" ? "Your website is being reviewed" : "Preparing your audit"}</h1><p>{state?.status === "queued" ? `The AI reviewer is analyzing another website. You are number ${state.position ?? 1} in line.` : state?.status === "running" ? `Current phase: ${(state.phase ?? "reviewing").replaceAll("_", " ")}. Please keep this page open; a detailed review usually takes 1–2 minutes.` : state?.message ?? "Connecting to the audit controller…"}</p></div></section></main>;
  const grouped = report.findings.reduce<Record<string, Finding[]>>((all, item) => { (all[item.category] ??= []).push(item); return all; }, {});
  const now = new Date(); const expires = new Date(report.screenshots.expiresAt); const screenshotAvailable = expires > now;
  return <main className="shell report-wrap">
    <Link className="back-link" href="/"><ArrowLeft size={16} /> Start another review</Link>
    <header className="report-head"><div><h1>Website quality report</h1><p className="url-line">Audited: {report.finalUrl}</p></div><div className="score-card"><strong>{report.overallScore}</strong><span>Overall diagnostic score<br/>Needs attention</span></div></header>
    <div className="notice"><Clock3 size={19} /><div><b>Privacy window.</b> Screenshots and issue crops are automatically deleted within 24 hours. This report keeps only sanitized findings and expires after seven days.</div></div>
    <section className="overview"><article className="panel"><div className="panel-inner"><h2>Executive conclusion</h2><p>{report.summary}</p><h2 style={{marginTop: 26}}>What is working well</h2><ul className="strength-list">{report.strengths.map((item) => <li key={item}><CheckCircle2 size={17}/>{item}</li>)}</ul></div></article><article className="panel"><div className="panel-inner"><h2>Priority improvements</h2><ul className="priority-list">{report.priorities.map((item) => <li key={item.id}><AlertCircle size={17} color="var(--red)"/><span><b>{item.title}</b>{item.recommendation}</span></li>)}</ul></div></article></section>
    <section className="finding-section"><h2>Scorecard</h2><div className="score-grid">{report.categories.map((metric) => <article className="metric" key={metric.category}><div className="metric-top"><span className="metric-label">{metric.label}</span><span className="metric-value">{metric.assessed ? metric.score : "—"}</span></div><div className="meter"><span style={{transform: `scaleX(${metric.assessed ? metric.score / 100 : 0})`}}/></div></article>)}</div></section>
    <section className="finding-section"><h2>Detailed findings</h2>{Object.entries(grouped).map(([category, items]) => <div key={category} style={{marginTop: 28}}><h3 style={{margin:"0 0 12px",fontSize:18}}>{categoryLabels[category as keyof typeof categoryLabels]}</h3><div className="finding-list">{items.map((item) => <FindingCard key={item.id} finding={item}/>)}</div></div>)}</section>
    <section className="finding-section"><h2>Implementation roadmap</h2><div className="roadmap"><article className="roadmap-col"><h3>Now</h3><p>Resolve horizontal mobile overflow and strengthen low-contrast secondary text. These issues affect direct usability and reading comfort.</p></article><article className="roadmap-col"><h3>Next</h3><p>Consolidate spacing and heading patterns into reusable tokens/components so future pages stay consistent.</p></article><article className="roadmap-col"><h3>Later</h3><p>Complete social metadata and run a source-level code review when authorized repository access is available.</p></article></div></section>
    <section className="panel ai-panel"><div className="panel-inner"><h2><Lightbulb size={19} style={{verticalAlign:"-3px",marginRight:8}}/>AI visual review</h2><div className="ai-grid"><div><h3>Hierarchy</h3><p>{report.aiReview.hierarchy}</p></div><div><h3>Mobile readability</h3><p>{report.aiReview.mobileReadability}</p></div><div><h3>CTA clarity</h3><p>{report.aiReview.ctaClarity}</p></div></div><p style={{marginTop:18,fontSize:13}}><b>Limitation:</b> {report.aiReview.limitations}</p></div></section>
    <section className="finding-section"><h2>Technical appendix</h2><div className="score-grid"><article className="metric"><div className="metric-top"><span className="metric-label">Observed requests</span><span className="metric-value">{report.technical.requests}</span></div></article><article className="metric"><div className="metric-top"><span className="metric-label">Failed resources</span><span className="metric-value">{report.technical.failedRequests}</span></div></article><article className="metric"><div className="metric-top"><span className="metric-label">Console errors</span><span className="metric-value">{report.technical.consoleErrors}</span></div></article><article className="metric"><div className="metric-top"><span className="metric-label">Screenshots</span><span className="metric-value">{screenshotAvailable ? "24h" : "Expired"}</span></div></article></div><p style={{color:"var(--muted)",fontSize:14,marginTop:14}}>{report.technical.loadIndicator} Results are page-level indicators, not an official Google PageSpeed or WCAG certification.</p></section>
  </main>;
}
