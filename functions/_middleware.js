// Runs on every request. For HTML pages it:
// 1. Sets 400-day first-party cookies from the edge (survive Safari ITP): visitor ids, _fbp, _fbc.
// 2. Assigns and serves the A/B variant (tracking/edge/experiments.js) at the original URL.
// 3. Records the visit (UTMs, click ids) and the A/B exposure in D1, in the background.
// Fail-safe: no D1 binding, no experiment or any error → the page is served exactly as before.

import { parseCookies, getRawParam, subDomainIndex, detectBot } from '../tracking/edge/lib.js';
import { lpForPath, runningExperiment, pickVariant } from '../tracking/edge/experiments.js';

const SKIP = /^\/(tracker|api\/|dash|scripts\/)/;
const PRIVATE = /^\/(functions|tracking|automation|variants|\.claude|\.git)(\/|$)|^\/(README\.md|\.gitignore|\.dev\.vars)$/i;
const COOKIE_MAX_AGE = 34560000; // 400 days

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // The repo root is the site root: keep source, docs and variant files off the public site.
  // (Variant files are only served through the experiment, never directly.)
  if (PRIVATE.test(url.pathname)) return new Response('Not found', { status: 404 });

  const isPage = request.method === 'GET'
    && !SKIP.test(url.pathname)
    && !/\.[a-z0-9]+$/i.test(url.pathname.replace(/\.html$/i, ''));
  if (!isPage) return next();

  let plan;
  try {
    plan = planVisit(context, url);
  } catch (e) {
    console.error('middleware plan error:', e.message);
    return next();
  }

  let response = null;
  if (plan.variant && plan.variant.file) {
    try {
      const r = await context.env.ASSETS.fetch(new URL(plan.variant.file, url.origin).toString());
      if (r.ok) response = r;
    } catch (e) {
      console.error('variant fetch error:', e.message);
    }
    if (!response) plan.variant = plan.experiment.variants.find(v => !v.file) || plan.variant; // fall back to the page itself
  }
  if (!response) response = await next();

  try {
    response = decorate(response, plan);
  } catch (e) {
    console.error('middleware decorate error:', e.message);
  }

  context.waitUntil(record(context.env, plan));
  return response;
}

function planVisit(context, url) {
  const { request } = context;
  const cookies = parseCookies(request.headers.get('Cookie'));
  const now = Math.floor(Date.now() / 1000);
  const idx = subDomainIndex(request.headers.get('host'));

  const plan = {
    now,
    url,
    cookies,
    sessionId: cookies._alk_sid || crypto.randomUUID(),
    externalId: cookies._alk_eid || crypto.randomUUID(),
    fbclid: getRawParam(url.search, 'fbclid'),
    gclid: getRawParam(url.search, 'gclid'),
    gbraid: getRawParam(url.search, 'gbraid'),
    wbraid: getRawParam(url.search, 'wbraid'),
    msclkid: getRawParam(url.search, 'msclkid'),
    utm: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].map(k => url.searchParams.get(k) || ''),
    referrer: request.headers.get('referer') || '',
    bot: detectBot(request.headers.get('user-agent') || ''),
    lp: lpForPath(url.pathname),
    experiment: null,
    variant: null,
    forced: false,
    newAssignment: false,
  };

  // _fbc from a new fbclid; _fbp created here if the pixel hasn't set one yet.
  plan.fbc = cookies._fbc || '';
  if (plan.fbclid && (!plan.fbc || plan.fbc.split('.')[3] !== plan.fbclid)) {
    plan.fbc = `fb.${idx}.${Date.now()}.${plan.fbclid}`;
  }
  plan.fbp = cookies._fbp || `fb.${idx}.${Date.now()}.${Math.floor(Math.random() * 9e9) + 1e9}`;

  if (plan.lp) {
    const exp = runningExperiment(plan.lp);
    if (exp) {
      plan.experiment = exp;
      const qa = exp.variants.find(v => v.id === url.searchParams.get('ab'));
      const kept = exp.variants.find(v => v.id === cookies['_alk_ab_' + exp.id]);
      plan.forced = !!qa;
      plan.variant = qa || kept || pickVariant(exp);
      plan.newAssignment = !qa && !kept;
    }
  }
  return plan;
}

function decorate(response, plan) {
  const isHtml = (response.headers.get('content-type') || '').includes('text/html');
  const headers = new Headers(response.headers);
  const base = `Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
  headers.append('Set-Cookie', `_alk_sid=${plan.sessionId}; ${base}`);
  headers.append('Set-Cookie', `_alk_eid=${plan.externalId}; ${base}`);
  headers.append('Set-Cookie', `_fbp=${plan.fbp}; ${base}`);
  if (plan.fbc) headers.append('Set-Cookie', `_fbc=${plan.fbc}; ${base}`);

  if (plan.experiment) {
    if (!plan.forced) headers.append('Set-Cookie', `_alk_ab_${plan.experiment.id}=${plan.variant.id}; ${base}`);
    // The same URL serves different HTML per visitor: never cache it in a shared cache.
    headers.set('Cache-Control', 'private, no-store');
    headers.delete('ETag');
    headers.delete('Last-Modified');
  }

  let out = new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  if (isHtml && plan.experiment && response.status === 200) {
    const exp = plan.experiment.id, variant = plan.variant.id, qa = plan.forced;
    out = new HTMLRewriter().on('html', {
      element(el) {
        el.setAttribute('data-experiment', exp);
        el.setAttribute('data-variant', variant);
        if (qa) el.setAttribute('data-ab-qa', '1'); // forced with ?ab=: leads are flagged and left out of results
      },
    }).transform(out);
  }
  return out;
}

async function record(env, plan) {
  if (!env.DB || plan.bot) return;
  try {
    const stmts = [env.DB.prepare(`
      INSERT INTO sessions (session_id, external_id, fbclid, gclid, gbraid, wbraid, msclkid, fbc, fbp, referrer, landing_url,
                            utm_source, utm_medium, utm_campaign, utm_content, utm_term, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        fbclid = CASE WHEN excluded.fbclid != '' THEN excluded.fbclid ELSE sessions.fbclid END,
        gclid = CASE WHEN excluded.gclid != '' THEN excluded.gclid ELSE sessions.gclid END,
        gbraid = CASE WHEN excluded.gbraid != '' THEN excluded.gbraid ELSE sessions.gbraid END,
        wbraid = CASE WHEN excluded.wbraid != '' THEN excluded.wbraid ELSE sessions.wbraid END,
        msclkid = CASE WHEN excluded.msclkid != '' THEN excluded.msclkid ELSE sessions.msclkid END,
        fbc = CASE WHEN excluded.fbc != '' THEN excluded.fbc ELSE sessions.fbc END,
        utm_source = CASE WHEN excluded.utm_source != '' THEN excluded.utm_source ELSE sessions.utm_source END,
        utm_medium = CASE WHEN excluded.utm_medium != '' THEN excluded.utm_medium ELSE sessions.utm_medium END,
        utm_campaign = CASE WHEN excluded.utm_campaign != '' THEN excluded.utm_campaign ELSE sessions.utm_campaign END,
        utm_content = CASE WHEN excluded.utm_content != '' THEN excluded.utm_content ELSE sessions.utm_content END,
        utm_term = CASE WHEN excluded.utm_term != '' THEN excluded.utm_term ELSE sessions.utm_term END,
        updated_at = excluded.updated_at
    `).bind(plan.sessionId, plan.externalId, plan.fbclid, plan.gclid, plan.gbraid, plan.wbraid, plan.msclkid, plan.fbc, plan.fbp,
      plan.referrer, plan.url.toString(), ...plan.utm, plan.now, plan.now)];

    // One row per visitor per landing page (and experiment): the denominator of the conversion rate.
    if (plan.lp && !plan.forced) {
      stmts.push(env.DB.prepare(`
        INSERT OR IGNORE INTO lp_exposures (session_id, lp, experiment, variant, first_seen, utm_source, utm_campaign)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(plan.sessionId, plan.lp, plan.experiment ? plan.experiment.id : '', plan.variant ? plan.variant.id : 'default',
        plan.now, plan.utm[0], plan.utm[2]));
    }
    await env.DB.batch(stmts);
  } catch (e) {
    console.error('middleware D1 error:', e.message);
  }
}
