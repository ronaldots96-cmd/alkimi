// Helpers shared by the Pages Functions (adapted from the krob tracking stack).

export function parseCookies(header) {
  const cookies = {};
  (header || '').split(';').forEach(c => {
    const [name, ...rest] = c.trim().split('=');
    if (name) cookies[name.trim()] = rest.join('=');
  });
  return cookies;
}

// Raw value as it appears in the URL: Meta wants the exact fbclid, not the URL-decoded one.
export function getRawParam(search, name) {
  const m = (search || '').match(new RegExp('[?&]' + name + '=([^&]*)'));
  return m ? m[1] : '';
}

// Meta sub-domain index: labels in the ETLD+1 minus 1 (alkimi.com → 1).
const CC_TLDS = new Set(['com.br', 'com.mx', 'com.au', 'co.uk', 'co.jp', 'co.nz', 'co.za', 'co.in']);
export function subDomainIndex(host) {
  const parts = (host || '').split(':')[0].toLowerCase().split('.');
  if (parts.length < 2) return 1;
  return CC_TLDS.has(parts.slice(-2).join('.')) ? 2 : 1;
}

export function validFbCookie(v) {
  if (!v) return '';
  const p = v.split('.');
  if (p.length < 4 || p.length > 5 || p[0] !== 'fb' || !/^\d+$/.test(p[1]) || !/^\d+$/.test(p[2]) || !p[3]) return '';
  return v;
}

export async function sha256(value) {
  if (!value) return '';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(value).toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Digits with country code, as Meta Advanced Matching expects. US (1) by default.
export function normalizePhone(ph, countryCode) {
  const cc = String(countryCode || '1');
  const d = String(ph || '').replace(/\D/g, '').replace(/^0+/, '');
  if (!d) return '';
  if (d.startsWith(cc) && d.length >= cc.length + 8 && d.length <= cc.length + 11) return d;
  if (d.length >= 8 && d.length <= 11) return cc + d;
  return d;
}

export function detectBot(ua) {
  if (!ua || ua.length < 10) return 'Missing or short user-agent';
  const patterns = [
    [/googlebot|google-inspectiontool|bingbot|msnbot/i, 'Search crawler'],
    [/facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|whatsapp|telegrambot|discordbot/i, 'Link preview'],
    [/bot|crawler|spider|scraper|headless|lighthouse/i, 'Generic bot'],
    [/python-requests|axios|node-fetch|curl|wget|httpie|go-http-client/i, 'HTTP library'],
    [/phantomjs|selenium|puppeteer|playwright/i, 'Automation tool'],
  ];
  for (const [p, r] of patterns) if (p.test(ua)) return r;
  return '';
}

export function parseBrowser(ua) {
  const r = { browser: 'Unknown', os: 'Unknown', isMobile: /Mobile|Android|iPhone|iPad/i.test(ua || '') };
  if (!ua) return r;
  if (/Edg\//.test(ua)) r.browser = 'Edge';
  else if (/OPR\//.test(ua)) r.browser = 'Opera';
  else if (/FBAN|FBAV|Instagram/i.test(ua)) r.browser = 'Meta in-app';
  else if (/CriOS|Chrome\//.test(ua)) r.browser = 'Chrome';
  else if (/Safari\//.test(ua)) r.browser = 'Safari';
  else if (/Firefox\/|FxiOS/.test(ua)) r.browser = 'Firefox';
  if (/iPhone|iPad/.test(ua)) r.os = 'iOS';
  else if (/Android/.test(ua)) r.os = 'Android';
  else if (/Windows/.test(ua)) r.os = 'Windows';
  else if (/Mac OS X/.test(ua)) r.os = 'macOS';
  else if (/Linux/.test(ua)) r.os = 'Linux';
  return r;
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
