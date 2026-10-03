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

  // Scroll reveal (blur-in) and photo wipe, only on elements marked for it
  var targets = document.querySelectorAll('.reveal, .reveal-photo, .steps');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
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
