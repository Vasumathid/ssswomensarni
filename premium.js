/* ═══════════════════════════════════════════════════════════════
   PREMIUM INTERACTIONS — SSS College for Women, Arni
   Additive layer: does not touch main.js's header/footer/tab logic.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Header elevation on scroll ─────────────────────────── */
  var lastScrolled = false;
  function onScroll() {
    var scrolled = window.scrollY > 30;
    if (scrolled !== lastScrolled) {
      document.body.classList.toggle('scrolled', scrolled);
      lastScrolled = scrolled;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 2. Hero ambient sparks ────────────────────────────────── */
  document.querySelectorAll('.hero').forEach(function (hero) {
    if (hero.querySelector('.hero-atmosphere')) return;
    var wrap = document.createElement('div');
    wrap.className = 'hero-atmosphere';
    wrap.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 5; i++) wrap.appendChild(document.createElement('span'));
    hero.insertBefore(wrap, hero.firstChild);
  });

  /* ── 3. Tag sections + grids for reveal / stagger ──────────── */
  document.querySelectorAll('.section').forEach(function (el) {
    el.classList.add('reveal');
  });

  var groupSelectors = ['.card-grid', '.three-col', '.rank-grid', '.two-col'];
  groupSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (group) {
      group.classList.add('reveal-group');
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.transitionDelay = reduceMotion ? '0ms' : (i * 90) + 'ms';
      });
    });
  });

  document.querySelectorAll('.about-item, .gallery-strip').forEach(function (el) {
    el.classList.add('reveal');
  });

  /* ── 4. IntersectionObserver-driven reveals ────────────────── */
  var revealTargets = document.querySelectorAll('.reveal, .reveal-group');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ── 5. Count-up on achievement numbers ────────────────────── */
  function animateCount(el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    var suffix = match[2] || '';
    if (reduceMotion || !target) { return; }

    var start = null;
    var duration = 1100;
    el.textContent = '0' + suffix;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        var parentItem = el.closest('.ach-item');
        if (parentItem) parentItem.classList.add('counted');
      }
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.a-num');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var countIO = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { countIO.observe(el); });
    } else {
      counters.forEach(function (el) { el.classList.add('counted'); });
    }
  }

  /* ── 6. Subtle 3D tilt on cards (desktop pointer only) ─────── */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    document.querySelectorAll('.card, .facility-card, .rank-card').forEach(function (card) {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'translateY(-8px) rotateX(' + (y * -5) + 'deg) rotateY(' + (x * 6) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }
})();
