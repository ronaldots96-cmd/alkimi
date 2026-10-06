/* Alkimi Austin LPs: small, dependency-free interactions */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav: solid background after scrolling past the top
  var nav = document.querySelector('.nav');
  var sticky = document.querySelector('.sticky-cta');
  var hero = document.querySelector('.hero');
  var finalSection = document.querySelector('#book');
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 40);
    if (sticky && hero) {
      var pastHero = y > hero.offsetHeight * 0.75;
      var atForm = finalSection && finalSection.getBoundingClientRect().top < window.innerHeight * 0.85;
      sticky.classList.toggle('is-on', pastHero && !atForm);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveal (blur-in) for text, only on elements marked for it
  var targets = document.querySelectorAll('.reveal, .steps');
  var photos = document.querySelectorAll('.reveal-photo');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
    photos.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });

    // Photos: start fetching well before they reach the screen, and only run the wipe
    // once the image is decoded, so the animation never plays over an empty frame.
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        pio.unobserve(e.target);
        var el = e.target, im = el.querySelector('img');
        if (im && im.loading === 'lazy') im.loading = 'eager';
        var ready = !im ? Promise.resolve()
          : (im.decode ? im.decode() : new Promise(function (r) { im.complete ? r() : im.addEventListener('load', r, { once: true }); }));
        ready.catch(function () {}).then(function () { el.classList.add('is-in'); });
      });
    }, { threshold: 0, rootMargin: '0px 0px 0px 0px' });
    photos.forEach(function (el) { pio.observe(el); });
  }

  // Marquee: duplicate the track once so the loop is seamless
  document.querySelectorAll('.marquee__track').forEach(function (track) {
    var clones = Array.prototype.map.call(track.children, function (node) {
      var c = node.cloneNode(true); c.setAttribute('aria-hidden', 'true');
      var img = c.querySelector('img'); if (img) img.alt = '';
      return c;
    });
    clones.forEach(function (c) { track.appendChild(c); });
  });

  // Marquee: its photos sit off-screen sideways, so native lazy loading would leave blank tiles.
  // Switch them to eager loading once the strip is about a screen away.
  document.querySelectorAll('.marquee').forEach(function (mq) {
    var go = function () { mq.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; }); };
    if (!('IntersectionObserver' in window)) return go();
    var mio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { go(); mio.disconnect(); } }, { rootMargin: '800px 0px' });
    mio.observe(mq);
  });

  // Attribution: read UTMs and click IDs from the ad URL. The first values seen in the visit are kept
  // (sessionStorage), so a reload without the query string still credits the right campaign.
  var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
  var attr = {};
  try { attr = JSON.parse(sessionStorage.getItem('alkimi_attr') || '{}') || {}; } catch (e) { attr = {}; }
  var qs = new URLSearchParams(window.location.search);
  if (ATTR_KEYS.some(function (k) { return qs.get(k); })) {
    attr = {};
    ATTR_KEYS.forEach(function (k) { if (qs.get(k)) attr[k] = qs.get(k); });
    attr.landing_page = window.location.href;
    attr.referrer = document.referrer || '';
  }
  if (!attr.landing_page) { attr.landing_page = window.location.href; attr.referrer = document.referrer || ''; }
  try { sessionStorage.setItem('alkimi_attr', JSON.stringify(attr)); } catch (e) {}

  // Tracking (GTM): the page context ({ lp, variant }) is pushed inline in <head> before GTM loads,
  // so every tag, PageView included, can read it. The helpers below add the funnel events.
  window.dataLayer = window.dataLayer || [];
  var dl = function (o) { window.dataLayer.push(o); };
  var ctx = function () {
    var c = {};
    window.dataLayer.forEach(function (e) { if (e && e.lp) { c.lp = e.lp; c.variant = e.variant || c.variant; } });
    return c;
  };
  var cookie = function (n) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  };
  var uuid = function () {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) {
      var r = Math.random() * 16 | 0;
      return (ch === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  };
  // E.164 for Meta Advanced Matching / Google Ads Enhanced Conversions. US numbers by default.
  var toE164 = function (raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.length === 10) return '+1' + d;
    if (d.length === 11 && d.charAt(0) === '1') return '+' + d;
    return '+' + d;
  };

  // CTA clicks, tagged with where on the page they sit (key metric for A/B tests).
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href="#book"]');
    if (!a) return;
    var where = a.closest('.nav') ? 'nav' : a.closest('.sticky-cta') ? 'sticky' : a.closest('.hero') ? 'hero' : 'section';
    dl({ event: 'cta_click', cta_location: where, cta_text: (a.textContent || '').trim() });
  });

  // Booking form: fill the hidden fields, post the lead to the webhook (n8n / Google Apps Script),
  // then show the confirmation. URL-encoded body + no-cors = a "simple" request with no CORS preflight,
  // which both n8n and Apps Script web apps accept.
  document.querySelectorAll('[data-booking-form]').forEach(function (form) {
    Object.keys(attr).forEach(function (k) {
      var f = form.querySelector('input[type="hidden"][name="' + k + '"]');
      if (f) f.value = attr[k];
    });
    // First interaction with the form (start of the form funnel), once per page view.
    form.addEventListener('focusin', function onStart() {
      form.removeEventListener('focusin', onStart);
      dl({ event: 'form_start' });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;

      var c = ctx();
      var eventId = uuid();
      var data = new URLSearchParams(new FormData(form));
      data.set('submitted_at', new Date().toISOString());
      // Same event_id as the browser tags: lets the server side (CAPI / offline conversions) dedupe later.
      data.set('event_id', eventId);
      data.set('variant', c.variant || '');
      // Ad-platform identifiers, so CRM stages (booked, attended, enrolled) can be sent back as conversions.
      data.set('fbp', cookie('_fbp'));
      data.set('fbc', cookie('_fbc'));
      data.set('ga_client_id', cookie('_ga').split('.').slice(2).join('.'));
      var hook = form.getAttribute('data-webhook');
      var sent = hook
        ? fetch(hook, { method: 'POST', mode: 'no-cors', keepalive: true, body: data }).catch(function () {})
        : Promise.resolve(console.warn('[Alkimi] data-webhook is empty: lead not sent', Object.fromEntries(data)));

      // For GTM: Meta Lead, GA4 generate_lead and the Google Ads conversion (with Enhanced Conversions)
      // all fire on this event and read the user data below.
      var fullName = (data.get('name') || '').trim().split(/\s+/);
      dl({
        event: 'generate_lead',
        lp: data.get('lp') || c.lp,
        variant: c.variant || '',
        event_id: eventId,
        user_data: {
          email: (data.get('email') || '').trim().toLowerCase(),
          phone_number: toE164(data.get('phone')),
          first_name: (fullName[0] || '').toLowerCase(),
          last_name: fullName.slice(1).join(' ').toLowerCase()
        }
      });

      sent.then(function () {
        var card = form.closest('.form-card');
        var first = (form.querySelector('[name="name"]') || {}).value || '';
        var nameSlot = card.querySelector('[data-first-name]');
        if (nameSlot) nameSlot.textContent = first.trim().split(' ')[0] || 'there';
        card.classList.add('is-done');
        var done = card.querySelector('.form-done');
        if (done) { done.setAttribute('tabindex', '-1'); done.focus(); }
      });
    });
  });
})();
