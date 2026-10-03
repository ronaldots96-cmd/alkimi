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

  // Booking form: prototype submit state.
  // TODO (integration): connect to the real booking + $20 payment flow (KickSite / Acuity / Stripe) and fire the
  // Google Ads + Meta conversion events here before showing the confirmation.
  document.querySelectorAll('[data-booking-form]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      var card = form.closest('.form-card');
      var first = (form.querySelector('[name="name"]') || {}).value || '';
      var nameSlot = card.querySelector('[data-first-name]');
      if (nameSlot) nameSlot.textContent = first.trim().split(' ')[0] || 'there';
      card.classList.add('is-done');
      var done = card.querySelector('.form-done');
      if (done) { done.setAttribute('tabindex', '-1'); done.focus(); }
    });
  });
})();
