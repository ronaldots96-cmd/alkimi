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

  // Booking form: fill the hidden fields, post the lead to the webhook (n8n / Google Apps Script),
  // then show the confirmation. URL-encoded body + no-cors = a "simple" request with no CORS preflight,
  // which both n8n and Apps Script web apps accept.
  document.querySelectorAll('[data-booking-form]').forEach(function (form) {
    Object.keys(attr).forEach(function (k) {
      var f = form.querySelector('input[type="hidden"][name="' + k + '"]');
      if (f) f.value = attr[k];
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;

      var data = new URLSearchParams(new FormData(form));
      data.set('submitted_at', new Date().toISOString());
      var hook = form.getAttribute('data-webhook');
      var sent = hook
        ? fetch(hook, { method: 'POST', mode: 'no-cors', keepalive: true, body: data }).catch(function () {})
        : Promise.resolve(console.warn('[Alkimi] data-webhook is empty: lead not sent', Object.fromEntries(data)));

      // For GTM: Google Ads / Meta conversion tags can fire on this event.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'generate_lead', lp: data.get('lp') });

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
