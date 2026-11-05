/* Black Friday LP: countdown, offer video facade, offer-option wiring and page motion.
   Form submit, attribution, scroll reveals and tracking stay in assets/js/alkimi.js. */
(function () {
  // Countdown to the end of the offer. The deadline lives in the markup (data-deadline, with the Central offset).
  document.querySelectorAll('[data-countdown]').forEach(function (el) {
    var end = Date.parse(el.getAttribute('data-deadline'));
    var out = {
      d: el.querySelector('[data-unit="d"]'), h: el.querySelector('[data-unit="h"]'),
      m: el.querySelector('[data-unit="m"]'), s: el.querySelector('[data-unit="s"]')
    };
    var label = el.querySelector('.countdown__label');
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var set = function (node, v) {
      if (node.textContent === String(v)) return;
      node.textContent = v;
      node.classList.remove('tick'); void node.offsetWidth; node.classList.add('tick');
    };
    var timer;
    function tick() {
      var left = Math.max(0, end - Date.now());
      if (!left) {
        el.classList.add('is-over');
        if (label) label.textContent = 'This offer has ended.';
        var card = el.closest('.deadline');
        if (card) card.querySelector('.deadline__title').textContent = 'This offer has ended.';
        clearInterval(timer);
        return;
      }
      var s = Math.floor(left / 1000);
      set(out.d, pad(Math.floor(s / 86400)));
      set(out.h, pad(Math.floor(s % 86400 / 3600)));
      set(out.m, pad(Math.floor(s % 3600 / 60)));
      set(out.s, pad(s % 60));
    }
    tick();
    timer = setInterval(tick, 1000);
  });

  // Offer video: only the poster loads with the page. The video file loads on click.
  document.querySelectorAll('[data-video]').forEach(function (btn) {
    var src = btn.getAttribute('data-video-src');
    if (!src) { btn.disabled = true; return; }
    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-playing')) return;
      var v = document.createElement('video');
      v.controls = true;
      v.playsInline = true;
      v.preload = 'metadata';
      v.muted = false;
      v.volume = 1;
      var trackSrc = btn.getAttribute('data-video-track');
      if (trackSrc) {
        var track = document.createElement('track');
        track.kind = 'captions';
        track.srclang = 'en';
        track.label = 'English';
        track.src = trackSrc;
        v.appendChild(track);
      }
      v.src = src;
      btn.appendChild(v);
      btn.classList.add('is-playing');
      v.play().catch(function () {});
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'video_play', video: btn.getAttribute('data-video') });
    });
  });

  // "Start in November" / "Lock in for January" buttons pre-select the option in the form.
  var form = document.querySelector('[data-booking-form]');
  var card = form && form.closest('.form-card');
  function syncOption() {
    var picked = form.querySelector('input[name="offer_option"]:checked');
    if (card) card.dataset.option = picked ? picked.value : '';
  }
  if (form) {
    form.addEventListener('change', syncOption);
    document.querySelectorAll('[data-pick-option]').forEach(function (a) {
      a.addEventListener('click', function () {
        var r = form.querySelector('input[name="offer_option"][value="' + a.getAttribute('data-pick-option') + '"]');
        if (r) { r.checked = true; syncOption(); }
      });
    });
  }

  // Belt ticker: duplicate the group so the -50% marquee loops without a gap.
  document.querySelectorAll('.ticker__track').forEach(function (track) {
    var g = track.querySelector('.ticker__group');
    if (g) track.appendChild(g.cloneNode(true));
  });

  // Stagger reveals that sit side by side (cards, tiles, quotes).
  document.querySelectorAll('.offers, .classes, .quotes, .coaches, .gallery, .facts').forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll(':scope > .reveal'), function (el, i) {
      el.style.setProperty('--d', (i % 4) * 0.08 + 's');
    });
  });

  // How to reserve: cards rise into a sticky deck and the counter follows the active step.
  var steps = document.querySelectorAll('.step');
  var stepsWrap = document.querySelector('.steps');
  var num = document.querySelector('[data-step-num]');
  var of = document.querySelector('[data-step-of]');
  var meter = document.querySelector('.steps__meter');
  if (steps.length) {
    var reduceStepsMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    steps.forEach(function (s, i) { s.style.setProperty('--step-i', i); });
    if (stepsWrap && !reduceStepsMotion) stepsWrap.classList.add('is-scroll-stack');

    var activeStep = -1;
    var ticking = false;
    function updateSteps() {
      ticking = false;
      var focusLine = window.innerHeight * .58;
      var next = 0;
      steps.forEach(function (s, i) {
        if (s.getBoundingClientRect().top <= focusLine) next = i;
      });
      if (next === activeStep) return;
      activeStep = next;
      steps.forEach(function (s, i) {
        var active = i === next;
        s.classList.toggle('is-active', active);
        s.classList.toggle('is-past', i < next);
        if (active) s.setAttribute('aria-current', 'step');
        else s.removeAttribute('aria-current');
      });
      var n = next + 1;
      if (num) num.textContent = '0' + n;
      if (of) of.textContent = n;
      if (meter) meter.style.setProperty('--p', n / steps.length);
    }
    function requestStepUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateSteps);
    }
    window.addEventListener('scroll', requestStepUpdate, { passive: true });
    window.addEventListener('resize', requestStepUpdate);
    updateSteps();
  }
})();
