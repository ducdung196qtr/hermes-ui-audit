# Design System

## Product Surface

The primary surface is an operational audit tool: visitors submit a URL, wait in a transparent queue, and read a long client-facing report.

## Visual World

**Field notebook for web quality.** The interface should feel like a precise editorial inspection sheet rather than a generic SaaS dashboard. A pale mineral background, blue-black ink, measured cobalt accents, and restrained warm signal colors make severity and evidence easy to read. The report uses a quiet grid, strong typographic hierarchy, and compact evidence labels.

## Color Strategy

Restrained: cool off-white ground, ink text, cobalt as the action color, amber/red only for findings and status. Color is never the only status signal.

## Type and Layout

- Workhorse system UI sans-serif for accessible, fast operational reading.
- Wider report reading measure; tabular numerals for scores and measurements.
- 4px spacing rhythm, 16px card radius, soft offset shadows.
- More space above headings than below.

## Components

- URL submission field with explicit validation and visible privacy note.
- Status rail: queued/running/completed states use icon, text, and a compact phase bar.
- Score tiles are rectangular and information-dense, not decorative progress rings.
- Findings use severity, evidence, impact, recommendation, and optional code guidance.
- Screenshots are secondary evidence and show a 24-hour expiry label.

## Motion

Only state transitions: a calm progress sweep and phase change. Use `transform`/`opacity` with ease-out; honor reduced motion. No bounce animation, layout-property transitions, or decorative parallax.

## Accessibility

Visible focus ring, 4.5:1 body-text contrast, semantic headings, keyboard usable form, sufficient button targets, and responsive stacked report groups.
