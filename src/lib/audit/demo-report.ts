import type { AuditReport, Finding } from "./types";

const findings: Finding[] = [
  {
    id: "spacing-scale", category: "visual", severity: "medium",
    title: "Spacing scale is fragmented in repeated content blocks",
    impact: "Uneven spacing makes similar cards feel misaligned and adds maintenance overhead.",
    evidence: "14 visible spacing values were found across repeated cards; 13px, 17px and 22px occur outside the dominant 4px rhythm.",
    recommendation: "Define a small spacing scale and apply the same internal padding and gap to each card variant.",
    code: ":root { --space-2: 8px; --space-4: 16px; --space-6: 24px; }\n.card { padding: var(--space-6); gap: var(--space-4); }",
  },
  {
    id: "mobile-overflow", category: "layout", severity: "high",
    title: "Horizontal overflow appears at the mobile viewport",
    impact: "Visitors may need to scroll sideways and can miss content or actions on small screens.",
    evidence: "At 390px, page scroll width exceeds viewport width by 46px near a comparison section.",
    recommendation: "Stack comparison content at the mobile breakpoint or provide an intentional horizontally scrollable container with a clear affordance.",
    code: "@media (max-width: 640px) { .comparison { grid-template-columns: 1fr; } }",
  },
  {
    id: "contrast-muted", category: "accessibility", severity: "high",
    title: "Secondary text needs stronger contrast",
    impact: "Low-contrast labels are difficult to read, especially outdoors or for visitors with reduced vision.",
    evidence: "Several visible secondary-text samples are below the normal-text WCAG contrast target against a solid white surface.",
    recommendation: "Use one approved muted-text token that meets contrast requirements and reserve lighter values for non-essential decoration.",
    code: ":root { --color-text-muted: #526075; }",
  },
  {
    id: "heading-order", category: "typography", severity: "medium",
    title: "Heading hierarchy skips a level in one content section",
    impact: "A predictable outline helps readers scan the page and assists screen-reader navigation.",
    evidence: "The rendered heading sequence moves from H2 to H4 in one section.",
    recommendation: "Use headings for document structure, not visual size; preserve H2 → H3 → H4 order.",
  },
  {
    id: "metadata", category: "seo", severity: "opportunity",
    title: "Social share metadata can be completed",
    impact: "Complete Open Graph metadata improves preview quality when a page is shared in messages and social platforms.",
    evidence: "A page title and description were present; Open Graph image metadata was not detected during the bounded scan.",
    recommendation: "Add a relevant og:image, og:title and og:description for important public pages.",
  },
  {
    id: "source-boundary", category: "code", severity: "not_assessed",
    title: "Source-level class naming was not assessed",
    impact: "Public rendering can reveal style inconsistency, but not whether source components and class names are maintainable.",
    evidence: "No authorized repository, source map or source archive was supplied with this URL audit.",
    recommendation: "For a code audit, provide authorized repository access. Review semantic component names, design tokens, duplicated CSS and !important usage separately.",
  },
];

export function createDemoReport(url: string): AuditReport {
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return {
    id: `demo-${Date.now().toString(36)}`,
    url, finalUrl: url, createdAt, status: "completed", overallScore: 74,
    summary: "The website has a sound visual foundation, but mobile containment, contrast, and reusable spacing should be addressed before further visual polish.",
    strengths: ["The primary action is visually distinct from secondary controls.", "Desktop content has a readable hierarchy with consistent core surfaces.", "Basic crawl metadata is present on the inspected page."],
    priorities: findings.filter((f) => f.severity === "high" || f.severity === "medium").slice(0, 4),
    categories: [
      { category: "visual", label: "Visual consistency", score: 72, assessed: true },
      { category: "layout", label: "Layout & responsive", score: 68, assessed: true },
      { category: "typography", label: "Typography & readability", score: 78, assessed: true },
      { category: "accessibility", label: "Color & accessibility", score: 70, assessed: true },
      { category: "interaction", label: "Interaction & UX", score: 80, assessed: true },
      { category: "performance", label: "Technical performance", score: 76, assessed: true },
      { category: "seo", label: "SEO foundations", score: 82, assessed: true },
      { category: "code", label: "Code & design-system quality", score: 0, assessed: false },
    ],
    findings,
    aiReview: {
      hierarchy: "The hero establishes a clear reading order. Below it, several card groups compete at the same visual weight; stronger grouping and a more consistent vertical rhythm would make the page easier to scan.",
      mobileReadability: "The main content remains understandable on mobile, but the overflow finding should be resolved before relying on the current comparison layout.",
      ctaClarity: "The primary CTA is identifiable. Keep one dominant action per decision area and reduce nearby links that use equal visual emphasis.",
      limitations: "AI visual review is a suggestion based on the rendered view and measured evidence. It is not a brand, SEO, conversion, or WCAG certification.",
    },
    technical: { requests: 48, failedRequests: 0, consoleErrors: 1, loadIndicator: "Page-load indicators are within a reasonable range for this bounded scan." },
    screenshots: { desktop: "", mobile: "", expiresAt },
  };
}
