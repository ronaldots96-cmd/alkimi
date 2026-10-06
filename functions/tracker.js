// POST /tracker: server-side copy of the browser Lead (adapted from the krob tracking stack).
// - Sends the Lead to Meta Conversions API with the SAME event_id as the GTM pixel tag → Meta dedupes,
//   and keeps the conversion when the pixel is blocked (ad blockers, ITP).
// - Logs the lead to D1 with lp / experiment / variant and the originating session (UTMs, click ids).
// GA4 is NOT sent from here: GA4 has no event dedup, and GTM already sends generate_lead.

import { parseCookies, validFbCookie, sha256, normalizePhone, detectBot, parseBrowser, json } from '../tracking/edge/lib.js';

const ALLOWED_EVENTS = new Set(['Lead']);

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'invalid json' }, 400);
  }
  if (!ALLOWED_EVENTS.has(body.event_name) || !body.event_id) return json({ error: 'invalid event' }, 400);

  const now = Math.floor(Date.now() / 1000);
  const eventTime = Math.abs(now - (body.event_time | 0)) < 3600 ? body.event_time | 0 : now;
  const cookies = parseCookies(request.headers.get('Cookie'));
  const ua = request.headers.get('user-agent') || '';
  const ip = request.headers.get('cf-connecting-ip') || '';
  const u = body.user_data || {};
  const c = body.custom_data || {};
  const sessionId = cookies._alk_sid || '';
  const bot = detectBot(ua);

  let session = {};
  if (sessionId && env.DB) {
    try {
      session = (await env.DB.prepare('SELECT * FROM sessions WHERE session_id = ?').bind(sessionId).first()) || {};
    } catch (e) {
      console.error('tracker session lookup error:', e.message);
    }
  }

  const fbp = validFbCookie(cookies._fbp) || validFbCookie(session.fbp);
  const fbc = validFbCookie(cookies._fbc) || validFbCookie(session.fbc);
  const externalId = cookies._alk_eid || session.external_id || '';
  const [em, ph, fn, ln, xid] = await Promise.all([
    sha256(u.em), sha256(normalizePhone(u.ph, env.DEFAULT_COUNTRY_CODE)), sha256(u.fn), sha256(u.ln), sha256(externalId),
  ]);

  let meta = { status: 0, ok: 0, body: '', payload: null };
  if (bot) {
    meta.body = 'skipped: bot';
  } else if (!env.META_PIXEL_ID || !env.META_ACCESS_TOKEN) {
    meta.body = 'skipped: missing META_PIXEL_ID / META_ACCESS_TOKEN';
  } else {
    const user_data = { client_ip_address: ip, client_user_agent: ua };
    if (em) user_data.em = [em];
    if (ph) user_data.ph = [ph];
    if (fn) user_data.fn = [fn];
    if (ln) user_data.ln = [ln];
    if (xid) user_data.external_id = [xid];
    if (fbp) user_data.fbp = fbp;
    if (fbc) user_data.fbc = fbc;
    const payload = {
      data: [{
        event_name: body.event_name,
        event_time: eventTime,
        event_id: body.event_id,
        event_source_url: body.event_source_url || '',
        action_source: 'website',
        user_data,
        custom_data: { content_name: c.lp || '', variant: c.variant || '' },
      }],
    };
    if (env.META_TEST_EVENT_CODE) payload.test_event_code = env.META_TEST_EVENT_CODE;
    meta.payload = JSON.stringify(payload);
    try {
      const r = await fetch(`https://graph.facebook.com/v25.0/${env.META_PIXEL_ID}/events?access_token=${env.META_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: meta.payload,
      });
      meta.status = r.status;
      meta.ok = r.ok ? 1 : 0;
      meta.body = (await r.text()).slice(0, 2000);
    } catch (e) {
      meta.body = 'fetch error: ' + e.message;
    }
  }

  if (env.DB) {
    const b = parseBrowser(ua);
    context.waitUntil(env.DB.prepare(`
      INSERT OR IGNORE INTO event_log (
        session_id, event_name, event_id, timestamp, lp, experiment, variant, is_qa,
        browser, os, is_mobile, pixel_loaded, fbp_source, fbc_present, is_bot, bot_reason,
        meta_status_code, meta_response_ok, meta_response_body, meta_payload_sent,
        has_email, has_phone, has_name, raw_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId, body.event_name, String(body.event_id), eventTime, c.lp || '', c.experiment || '', c.variant || 'default', c.qa ? 1 : 0,
      b.browser, b.os, b.isMobile ? 1 : 0, c.pixel_loaded ? 1 : 0,
      cookies._fbp ? 'cookie' : (session.fbp ? 'session' : 'none'), fbc ? 1 : 0, bot ? 1 : 0, bot,
      meta.status, meta.ok, meta.body, meta.payload,
      em ? 1 : 0, ph ? 1 : 0, (fn || ln) ? 1 : 0, String(u.em || '').trim().toLowerCase()
    ).run().catch(e => console.error('tracker D1 error:', e.message)));
  }

  return json({ ok: true, meta_ok: !!meta.ok });
}
