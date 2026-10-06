// GET /api/report?days=30 (header X-Dash-Key or ?key=): data for /dash.
// Visitors come from lp_exposures (one per visitor per page per experiment), leads from event_log.

import { json } from '../../tracking/edge/lib.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = request.headers.get('X-Dash-Key') || url.searchParams.get('key') || '';
  if (!env.DASH_KEY || key !== env.DASH_KEY) return json({ error: 'unauthorized' }, 401);
  if (!env.DB) return json({ error: 'D1 binding "DB" missing' }, 500);

  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '30', 10) || 30, 1), 365);
  const since = Math.floor(Date.now() / 1000) - days * 86400;

  try {
    const [visitors, leads, sources, recent, health] = await env.DB.batch([
      env.DB.prepare(`
        SELECT lp, experiment, variant, COUNT(*) AS visitors
        FROM lp_exposures WHERE first_seen >= ?
        GROUP BY lp, experiment, variant`).bind(since),
      env.DB.prepare(`
        SELECT lp, experiment, variant, COUNT(*) AS leads
        FROM event_log WHERE event_name = 'Lead' AND is_bot = 0 AND is_qa = 0 AND timestamp >= ?
        GROUP BY lp, experiment, variant`).bind(since),
      env.DB.prepare(`
        SELECT x.lp, COALESCE(NULLIF(x.utm_source, ''), '(direct)') AS source,
               COALESCE(NULLIF(x.utm_campaign, ''), '-') AS campaign,
               COUNT(DISTINCT x.session_id) AS visitors, COUNT(DISTINCT e.id) AS leads
        FROM lp_exposures x
        LEFT JOIN event_log e ON e.session_id = x.session_id AND e.lp = x.lp
             AND e.event_name = 'Lead' AND e.is_bot = 0 AND e.is_qa = 0
        WHERE x.first_seen >= ?
        GROUP BY x.lp, source, campaign ORDER BY visitors DESC LIMIT 50`).bind(since),
      env.DB.prepare(`
        SELECT e.timestamp, e.lp, e.experiment, e.variant, e.is_qa, e.is_bot, e.raw_email, e.browser, e.os, e.is_mobile, e.pixel_loaded,
               e.meta_response_ok, e.meta_status_code, substr(e.meta_response_body, 1, 300) AS meta_response_body,
               s.utm_source, s.utm_medium, s.utm_campaign, s.utm_content, s.gclid != '' AS has_gclid, s.fbc != '' AS has_fbc
        FROM event_log e LEFT JOIN sessions s ON s.session_id = e.session_id
        WHERE e.event_name = 'Lead' AND e.timestamp >= ?
        ORDER BY e.timestamp DESC LIMIT 50`).bind(since),
      env.DB.prepare(`
        SELECT COUNT(*) AS leads,
               SUM(meta_response_ok) AS meta_ok,
               SUM(CASE WHEN pixel_loaded = 0 AND is_bot = 0 THEN 1 ELSE 0 END) AS pixel_missing,
               SUM(is_bot) AS bots,
               SUM(CASE WHEN fbc_present = 1 THEN 1 ELSE 0 END) AS with_fbc
        FROM event_log WHERE event_name = 'Lead' AND timestamp >= ?`).bind(since),
    ]);

    return json({
      days,
      visitors: visitors.results,
      leads: leads.results,
      sources: sources.results,
      recent: recent.results,
      health: health.results[0] || {},
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
