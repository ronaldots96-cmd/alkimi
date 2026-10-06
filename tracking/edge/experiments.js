// A/B tests served at the edge by functions/_middleware.js.
//
// How a test works:
// - Each landing page path maps to an `lp` (below). At most one experiment can be `running` per lp.
// - A visitor is assigned a variant once (weighted random) and keeps it for 400 days (cookie `_alk_ab_<id>`).
// - The variant's HTML is served at the ORIGINAL URL (no redirect, no flicker). `file: null` = the page itself.
// - Variant pages live in /variants/<name>/index.html, use ABSOLUTE asset paths (/assets/...),
//   and are never reachable directly (the middleware 404s /variants/*).
// - The variant is stamped on <html data-experiment data-variant>, read by the page context pushed to GTM,
//   sent with the lead to /tracker (D1) and to the n8n webhook.
// - QA: append ?ab=<variant id> to force a variant for that view (no cookie, not counted as exposure).
//
// To start a test: add an entry with status 'running'. To stop it: set status 'stopped' (everyone sees
// the page itself again; results stay in D1). Never reuse an experiment id.

export const LANDING_PAGES = {
  '/kids/': 'kids',
  '/women/': 'women',
};

export const EXPERIMENTS = [
  // Example (not running):
  // {
  //   id: 'kids-hero-2026-10',
  //   lp: 'kids',
  //   status: 'running',
  //   variants: [
  //     { id: 'control', file: null, weight: 50 },
  //     { id: 'b', file: '/variants/kids-hero-b/', weight: 50 },
  //   ],
  // },
];

export function lpForPath(pathname) {
  let p = pathname.replace(/index\.html$/, '');
  if (!p.endsWith('/')) p += '/';
  return LANDING_PAGES[p] || '';
}

export function runningExperiment(lp) {
  return EXPERIMENTS.find(e => e.lp === lp && e.status === 'running') || null;
}

export function pickVariant(experiment) {
  const total = experiment.variants.reduce((s, v) => s + (v.weight || 0), 0);
  let r = Math.random() * total;
  for (const v of experiment.variants) {
    r -= v.weight || 0;
    if (r < 0) return v;
  }
  return experiment.variants[0];
}
