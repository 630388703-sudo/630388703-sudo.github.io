/* DSY / vertical portfolio — background drift, scroll reveal, section rail, language. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  // ── language: ?lang=en, remembered per viewer ──
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  function setLang(l) {
    document.documentElement.classList.toggle('en', l === 'en');
    document.documentElement.lang = l === 'en' ? 'en' : 'zh-CN';
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    store.set('dsy.lang', l);
  }
  setLang(new URLSearchParams(location.search).get('lang') || store.get('dsy.lang') || 'zh');
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  // ── reveal on scroll ──
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  // ── rail: current section, Memory Drift mood, progress ──
  const links = $$('.toc a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));
  const moodIo = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) document.body.dataset.mood = e.target.dataset.mood || ''; }), { rootMargin: '-50% 0px -50% 0px' });
  $$('main > section').forEach(s => moodIo.observe(s));
  const bar = $('.progress i');
  let scrollV = 0, lastY = scrollY;
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? scrollY / max : 0);
    scrollV += (scrollY - lastY) * 0.04; lastY = scrollY;
  }, { passive: true });

  // ── fragment strips: the five pieces of the photo get lost and obscured, then repaired ──
  const strips = $$('.strips div');
  if (strips.length && !reduced.matches) {
    let t = 0;
    const script = [[], [4], [4, 'b1'], [4, 3, 'b1'], [3, 'b1'], ['b1'], []];
    setInterval(() => {
      const s = script[t++ % script.length];
      strips.forEach((d, i) => { d.classList.toggle('lost', s.includes(i)); d.classList.toggle('blur', s.includes('b' + i)); });
    }, 1600);
  }

  // ── drifting fragments canvas (particle system from the background-animations skill, in plain canvas) ──
  const cv = $('.drift-bg canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const palette = ['#7ea6ff', '#f2b84b', '#f08a73', '#f2a7cf', '#7fdcc0', '#274bd4'];
  let W, H, dpr, parts = [];
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(W < 700 ? 26 : 56, (W * H) / 26000));
    parts = Array.from({ length: n }, () => spawn(true));
  }
  function spawn(anywhere) {
    const z = 0.35 + Math.random() * 0.9; // depth: nearer pieces are bigger and move more
    return {
      x: Math.random() * W, y: anywhere ? Math.random() * H : H + 40,
      w: (5 + Math.random() * 9) * z, h: (14 + Math.random() * 26) * z, z,
      vx: (Math.random() - 0.5) * 0.12, vy: -(0.08 + Math.random() * 0.22) * z,
      rot: (Math.random() - 0.5) * 0.6, vr: (Math.random() - 0.5) * 0.003,
      c: palette[(Math.random() * palette.length) | 0], filled: Math.random() < 0.45,
      a: 0.18 + Math.random() * 0.32, flick: Math.random() < 0.18 ? Math.random() * 6 : -1
    };
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    scrollV *= 0.92;
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy - scrollV * p.z; p.rot += p.vr;
      if (p.y < -60 || p.y > H + 60 || p.x < -60 || p.x > W + 60) {
        const fromTop = p.y > H + 60; // scrolled back up: re-enter from the top instead
        Object.assign(p, spawn(false));
        if (fromTop) p.y = -40;
      }
      // some fragments flicker, like an obscured memory
      const alpha = p.flick >= 0 ? p.a * (0.35 + 0.65 * Math.abs(Math.sin(t / 900 + p.flick))) : p.a;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = alpha;
      if (p.filled) { ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      ctx.strokeStyle = p.c; ctx.lineWidth = 1; ctx.strokeRect(-p.w / 2 + 0.5, -p.h / 2 + 0.5, p.w, p.h);
      ctx.restore();
    }
  }
  let raf = 0;
  function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
  function start() { cancelAnimationFrame(raf); if (reduced.matches) draw(0); else raf = requestAnimationFrame(loop); }
  resize(); start();
  addEventListener('resize', () => { resize(); if (reduced.matches) draw(0); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else start(); });
  reduced.addEventListener?.('change', start);
})();
