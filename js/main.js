/* ==========================================================================
   THARA HOTEL REVEAL — interaction layer
   --------------------------------------------------------------------------
   Everything here is progressive enhancement. With JS disabled the page is a
   normal, fully readable vertical document: the storyboard ships with the
   .sb--static class and this script removes it only when it can drive the
   horizontal sequence properly.

   Native scroll is never hijacked. The horizontal run is a sticky viewport
   whose track is translated in step with real scroll position, so the mouse
   wheel, trackpad, keyboard (space / arrows / page keys) and touch all keep
   their normal behaviour.
   ========================================================================== */
(function () {
  'use strict';

  var root   = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp  = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  root.classList.add('js');

  /* ------------------------------------------------------------------ *
   * 1. Reveals
   * ------------------------------------------------------------------ */
  var revealables = document.querySelectorAll('.rv, .rv-line, .zoom');

  if (!('IntersectionObserver' in window) || reduce) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('in'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealIO.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(revealables, function (el) { revealIO.observe(el); });
  }

  /* ------------------------------------------------------------------ *
   * 2. Section tracking — counter, rail, and light/dark chrome inversion
   * ------------------------------------------------------------------ */
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));
  var railBars = document.querySelectorAll('[data-rail]');
  var curEl    = document.querySelector('[data-cur]');
  var pad2     = function (n) { return (n < 10 ? '0' : '') + n; };
  var activeSection = -1;

  function setSection(i) {
    if (i === activeSection) return;
    activeSection = i;

    if (curEl) curEl.textContent = pad2(i + 1);

    Array.prototype.forEach.call(railBars, function (bar, k) {
      bar.classList.toggle('is-on', k < i);
      bar.classList.toggle('is-here', k === i);
    });

    var sec  = sections[i];
    var tone = sec && sec.getAttribute('data-tone');
    document.body.setAttribute('data-tone', tone === 'light' ? 'light' : 'dark');
    document.body.setAttribute('data-in-sb', sec && sec.hasAttribute('data-sb') ? 'true' : 'false');
    document.body.setAttribute('data-sec', String(i));

    // keep the chrome scrim matched to this section's ground
    if (sec) {
      var bg = getComputedStyle(sec).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)') root.style.setProperty('--chrome-bg', bg);
    }
  }

  if ('IntersectionObserver' in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setSection(sections.indexOf(e.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (s) { sectionIO.observe(s); });
  }
  setSection(0);

  /* ------------------------------------------------------------------ *
   * 3. Horizontal storyboard
   * ------------------------------------------------------------------ */
  var sb      = document.querySelector('[data-sb]');
  var track   = document.querySelector('[data-sb-track]');
  var segs    = document.querySelector('[data-sb-segs]');
  var sbCur   = document.querySelector('[data-sb-cur]');
  var sticky  = sb ? sb.querySelector('.sb__sticky') : null;
  var frames  = sb ? Array.prototype.slice.call(sb.querySelectorAll('.panel:not(.panel--intro)')) : [];
  var segBars = segs ? Array.prototype.slice.call(segs.children) : [];

  var live = false;       // horizontal mode engaged
  var span = 0;           // horizontal distance the track travels, in px
  var sbTop = 0;          // document offset of the section
  var targetX = 0;
  var currentX = 0;
  var frameGeo = [];      // cached { left, width } per frame, relative to track
  var sbActive = -1;

  function canGoLive() {
    return !!(sb && track) && window.innerWidth > 900;
  }

  function measure() {
    if (!sb || !track) return;

    if (!canGoLive()) {
      if (live) {
        live = false;
        sb.classList.add('sb--static');
        sb.style.height = '';
        track.style.transform = '';
      }
      return;
    }

    // measure in static layout so scrollWidth is honest
    var wasLive = live;
    sb.classList.add('sb--static');
    sb.style.height = '';
    track.style.transform = '';

    // force the flex row back on to read its true width
    sb.classList.remove('sb--static');

    var vw = window.innerWidth;
    var vh = sticky ? sticky.offsetHeight : window.innerHeight;
    span = Math.max(0, track.scrollWidth - vw);

    if (span < 40) {                       // nothing to travel — stay vertical
      live = false;
      sb.classList.add('sb--static');
      sb.style.height = '';
      track.style.transform = '';
      return;
    }

    live = true;
    sb.style.height = (vh + span) + 'px';

    // transform is cleared above, so these rects are the untransformed layout
    var trackLeft = track.getBoundingClientRect().left;

    frameGeo = frames.map(function (f) {
      var r = f.getBoundingClientRect();
      return { left: r.left - trackLeft, width: r.width };
    });

    var box = sb.getBoundingClientRect();
    sbTop = box.top + window.pageYOffset;

    if (!wasLive) { currentX = 0; targetX = 0; }
    update(true);
  }

  function update(snap) {
    if (!live) return;

    var y = window.pageYOffset;
    var p = clamp((y - sbTop) / span, 0, 1);
    targetX = -p * span;

    if (snap || reduce) {
      currentX = targetX;
    } else {
      currentX += (targetX - currentX) * 0.16;
      if (Math.abs(targetX - currentX) < 0.4) currentX = targetX;
    }

    track.style.transform = 'translate3d(' + currentX.toFixed(2) + 'px,0,0)';

    // per-frame progress readout
    var vw = window.innerWidth;
    var line = vw * 0.62;
    var activeIdx = frameGeo.length - 1;
    var found = false;

    for (var i = 0; i < frameGeo.length; i++) {
      var g = frameGeo[i];
      var f = clamp((line - (g.left + currentX)) / g.width, 0, 1);
      if (segBars[i]) segBars[i].style.setProperty('--f', f.toFixed(3));
      if (!found && f < 1) { activeIdx = i; found = true; }

      // reveal frames as they come into the horizontal viewport
      if (g.left + currentX < vw * 0.94) frames[i].classList.add('in');
    }

    if (activeIdx !== sbActive) {
      sbActive = activeIdx;
      if (sbCur) sbCur.textContent = pad2(activeIdx + 1);
    }
  }

  /* ------------------------------------------------------------------ *
   * 4. Restrained parallax
   * ------------------------------------------------------------------ */
  var pxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'))
    .map(function (el) {
      return {
        el: el,
        img: el.querySelector('img'),
        k: parseFloat(el.getAttribute('data-parallax')) || 0.05,
        ready: false
      };
    })
    .filter(function (o) { return o.img; });

  // The parallax transform lives on the same <img> the .zoom reveal animates,
  // so parallax only takes over once that cinematic settle has finished.
  pxEls.forEach(function (o) {
    if (reduce) { o.ready = true; return; }
    o.img.addEventListener('transitionend', function once(e) {
      if (e.propertyName !== 'transform') return;
      o.img.removeEventListener('transitionend', once);
      o.img.style.transition = 'none';
      o.ready = true;
    });
  });

  function parallax() {
    if (reduce || window.innerWidth < 760) return;
    var vh = window.innerHeight;
    for (var i = 0; i < pxEls.length; i++) {
      var o = pxEls[i];
      if (!o.ready) continue;
      var r = o.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      var mid = (r.top + r.height / 2 - vh / 2) / vh;   // -1 … 1
      var shift = -mid * r.height * o.k;
      o.img.style.transform =
        'translate3d(0,' + shift.toFixed(1) + 'px,0) scale(' + (1 + o.k * 2).toFixed(3) + ')';
    }
  }

  /* ------------------------------------------------------------------ *
   * 5. Loop
   * ------------------------------------------------------------------ */
  var ticking = false;

  function frame() {
    ticking = false;
    update(false);
    parallax();
    if (live && Math.abs(targetX - currentX) > 0.4) request();
  }

  function request() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
  }

  window.addEventListener('scroll', request, { passive: true });

  var rzTimer;
  window.addEventListener('resize', function () {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () { measure(); parallax(); }, 140);
  }, { passive: true });

  window.addEventListener('orientationchange', function () {
    setTimeout(function () { measure(); parallax(); }, 300);
  });

  /* ------------------------------------------------------------------ *
   * 6. Boot — remeasure once fonts and images have settled
   * ------------------------------------------------------------------ */
  function boot() { measure(); parallax(); }

  boot();
  window.addEventListener('load', boot);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  setTimeout(boot, 900);
})();
