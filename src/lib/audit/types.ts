export type Severity = "critical" | "high" | "medium" | "low" | "opportunity" | "not_assessed";

export type AuditCategory =
  | "visual"
  | "layout"
  | "typography"
  | "accessibility"
  | "interaction"
  | "performance"
  | "seo"
  | "code";

export type Finding = {
  id: string;
  category: AuditCategory;
  severity: Severity;
  title: string;
  impact: string;
  evidence: string;
  recommendation: string;
  code?: string;
};

export type CategoryScore = { category: AuditCategory; label: string; score: number; assessed: boolean };

export type AuditReport = {
  id: string;
  url: string;
  finalUrl: string;
  createdAt: string;
  status: "completed";
  overallScore: number;
  summary: string;
  strengths: string[];
  priorities: Finding[];
  categories: CategoryScore[];
  findings: Finding[];
  aiReview: {
    hierarchy: string;
    mobileReadability: string;
    ctaClarity: string;
    limitations: string;
  };
  technical: { requests: number; failedRequests: number; consoleErrors: number; loadIndicator: string };
  screenshots: { desktop: string; mobile: string; expiresAt: string };
};

export type AuditStatus =
  | { status: "queued"; id: string; position: number }
  | { status: "running"; id: string; phase: string; progress: number }
  | { status: "completed"; id: string; report: AuditReport }
  | { status: "failed"; id: string; message: string };

export const categoryLabels: Record<AuditCategory, string> = {
  visual: "Visual consistency",
  layout: "Layout & responsive",
  typography: "Typography & readability",
  accessibility: "Color & accessibility",
  interaction: "Interaction & UX",
  performance: "Technical performance",
  seo: "SEO foundations",
  code: "Code & design-system quality",
};
