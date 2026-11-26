/* shared.js — behaviour common to portfolio.html and projects.html */
(() => {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ─── STARFIELD ──────────────────────────────────────────────
  const canvas = $('#starfield'), ctx = canvas.getContext('2d');
  let stars = [], W = 0, H = 0, lastW = 0, milky;

  function buildMilkyWay() {
    milky = ctx.createLinearGradient(0, H * 0.1, W, H * 0.9);
    milky.addColorStop(0, 'transparent');
    milky.addColorStop(0.3, 'rgba(10,26,74,0.04)');
    milky.addColorStop(0.5, 'rgba(26,63,160,0.06)');
    milky.addColorStop(0.7, 'rgba(10,26,74,0.04)');
    milky.addColorStop(1, 'transparent');
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);   // crisp on retina
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildMilkyWay();
  }
  function createStars() {
    const count = Math.floor((W * H) / 3500);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2, a: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.0003 + 0.0001, phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.85 ? '#a8c8ff' : Math.random() > 0.92 ? '#ffd87a' : '#e8f4ff'
    }));
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      // old code used t*speed*1000 (≈100–400 rad/s) which strobes; this is a ~2–6 s twinkle
      const tw = reduceMotion ? 1 : Math.sin(t * s.speed * 8 + s.phase) * 0.3 + 0.7;
      ctx.globalAlpha = s.a * tw;
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = milky; ctx.fillRect(0, 0, W, H);
  }
  const loop = t => { draw(t); requestAnimationFrame(loop); };

  lastW = innerWidth; resize(); createStars();
  reduceMotion ? draw(0) : requestAnimationFrame(loop);
  addEventListener('resize', () => {
    const widthChanged = innerWidth !== lastW;   // ignore mobile address-bar height jumps
    lastW = innerWidth; resize();
    if (widthChanged) createStars();
    if (reduceMotion) draw(0);
  });

  // ─── CURSOR (mouse only; one delegated listener instead of per-element ones) ───
  const HOVERABLE = 'a, button, .skill-node, .teaser-card, .stat-card, .filter-btn, .contact-link';
  if (finePointer) {
    const dot = $('#cursor'), ring = $('#cursor-ring');
    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    }, { passive: true });
    (function follow() {
      rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(follow);
    })();
    const body = document.body;
    document.addEventListener('mouseover', e => body.classList.toggle('cursor-hover', !!e.target.closest(HOVERABLE)));
    document.addEventListener('mousedown', () => body.classList.add('cursor-down'));
    document.addEventListener('mouseup',   () => body.classList.remove('cursor-down'));
    document.documentElement.addEventListener('mouseleave', () => body.classList.add('cursor-hidden'));
    document.documentElement.addEventListener('mouseenter', () => body.classList.remove('cursor-hidden'));

    // card spotlight follows the pointer
    document.addEventListener('pointermove', e => {
      const c = e.target.closest('.skill-node, .project-card, .teaser-card, .stat-card');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    // nebula parallax — uses `translate` (separate from the animated `transform`)
    if (!reduceMotion) {
      const nebulae = $$('.nebula');
      addEventListener('mousemove', e => {
        const dx = (e.clientX / innerWidth - 0.5) * 2, dy = (e.clientY / innerHeight - 0.5) * 2;
        nebulae.forEach((n, i) => { const f = (i + 1) * 14; n.style.translate = `${dx * f}px ${dy * f}px`; });
      }, { passive: true });
    }
  }

  // ─── SCROLL REVEAL (staggered, and hands transitions back to the element afterwards) ───
  // .reveal's `transition: opacity, transform` used to override every card's own hover
  // transition forever (slow 0.8s lift, no background/border fade). We drop the class once it has played.
  const io = new IntersectionObserver(entries => {
    let i = 0;
    entries.forEach(e => {
      if (!e.isIntersecting || !e.target.classList.contains('reveal')) return;
      e.target.style.transitionDelay = (i++ * 0.09) + 's';
      settle(e.target);
    });
  }, { threshold: 0.12 });
  function settle(el) {
    if (!el.classList.contains('reveal')) return;
    io.unobserve(el);
    el.classList.add('visible', 'in');
    const wait = 1600 + (parseFloat(el.style.transitionDelay) || 0) * 1000;
    setTimeout(() => { el.classList.remove('reveal', 'visible'); el.style.transitionDelay = ''; }, wait);
  }
  window.settleReveal = settle;
  $$('.reveal').forEach(el => io.observe(el));

  // ─── COUNT-UP for stat numbers ──────────────────────────────
  if (!reduceMotion) {
    const countIO = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target, m = el.textContent.trim().match(/^(\d+)(\D*)$/);
      if (!m) return;                                   // e.g. "∞"
      const target = +m[1], pad = m[1].length, suffix = m[2];
      const delay = el.closest('.page-stats') ? 1000 : 0; // wait for that bar's own fade-in
      el.textContent = String(0).padStart(pad, '0') + suffix;
      setTimeout(() => {
        const t0 = performance.now();
        (function tick(t) {
          const p = Math.min((t - t0) / 1200, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * eased)).padStart(pad, '0') + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      }, delay);
    }), { threshold: 0.6 });
    $$('.stat-num, .teaser-num, .stat-n').forEach(el => countIO.observe(el));
  }

  // ─── SHOOTING STARS (random gap each time — setInterval froze it to one value) ───
  function shootingStar() {
    if (!document.hidden) {
      const el = document.createElement('div');
      el.className = 'shooting-star';
      el.style.cssText = `left:${Math.random() * innerWidth * 0.6 + innerWidth * 0.2}px; top:${Math.random() * innerHeight * 0.4}px;`;
      document.body.appendChild(el);
      const angle = 30 + Math.random() * 20, dist = 200 + Math.random() * 200, dur = 600 + Math.random() * 400;
      el.animate([
        { transform: `rotate(${angle}deg) translate(0,0)`, opacity: 0 },
        { opacity: 1, offset: 0.1 },
        { transform: `rotate(${angle}deg) translate(${dist}px,0)`, opacity: 0 }
      ], { duration: dur, easing: 'ease-in' }).onfinish = () => el.remove();
    }
    setTimeout(shootingStar, 3500 + Math.random() * 4000);
  }
  if (!reduceMotion) setTimeout(shootingStar, 1000);

  // ─── NAV: scrolled state, hide on scroll-down, progress bar ─
  const nav = $('#nav');
  const bar = document.createElement('div'); bar.id = 'progress'; document.body.prepend(bar);
  let lastY = scrollY, ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      nav.classList.toggle('scrolled', y > 60);
      const menuOpen = !!$('.nav-links.open');
      if (y - lastY > 6 && y > 240 && !menuOpen) nav.classList.add('nav-hidden');
      else if (lastY - y > 6 || y <= 240) nav.classList.remove('nav-hidden');
      lastY = y; ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ─── PAGE TRANSITION between portfolio.html and projects.html ───
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const url = new URL(a.href, location.href);
    if (!/^(https?|file):$/.test(url.protocol) || url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.add('page-leave');
    setTimeout(() => { location.href = a.href; }, 350);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('page-leave'); });
})();
