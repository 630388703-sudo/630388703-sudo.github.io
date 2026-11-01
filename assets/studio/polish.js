/* Interaction polish (GSAP): line-by-line headline rise, pointer parallax, magnetic buttons, pointer follower,
   count-up index, file-preview shutter, thinking-card tilt/reveal. All of it is skipped under prefers-reduced-motion. */
(() => {
  if (!window.gsap) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const lang = () => document.documentElement.lang;

  // Contact items: words instead of emoji
  const labels = { zh: ['实习', '电话', '邮箱', '视频', '简历'], en: ['Dates', 'Phone', 'Email', 'Video', 'CV'] };
  const relabel = () => $$('#ct2Items .ct2-item-icon').forEach((el, i) => { const l = (labels[lang() === 'en' ? 'en' : 'zh'])[i]; if (l) el.textContent = l; });
  const ct = $('#ct2Items');
  if (ct) { new MutationObserver(relabel).observe(ct, { childList: true }); relabel(); }

  if (reduced) return;
  const ease = 'power3.out';
  const watch = (el, fn, o = { childList: true }) => { if (!el) return; let raf = 0; new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); }).observe(el, o); };
  const ready = window.dsyReady || (cb => cb());

  // ── Home headline: each line is masked, each letter rises ──
  function splitHeadline() {
    const h = $('#hero .home-copy h1');
    if (!h || h.querySelector('.mask')) return null;
    const lines = [];
    [...h.childNodes].forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const m = document.createElement('span'); m.className = 'mask'; m.textContent = n.textContent.trim(); n.replaceWith(m); lines.push(m);
      } else if (n.nodeName === 'EM') { const m = document.createElement('span'); m.className = 'mask'; n.replaceWith(m); m.append(n); lines.push(m); }
      else if (n.nodeName === 'BR') n.remove();
    });
    lines.forEach(m => {
      const target = m.firstElementChild || m;
      const txt = target.textContent; target.textContent = '';
      [...txt].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; target.append(s); });
    });
    return $$('.ch', h);
  }
  function headline() {
    const chars = splitHeadline() || $$('#hero .home-copy h1 .ch');
    if (!chars.length) return;
    gsap.fromTo(chars, { yPercent: 115, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1, ease: 'expo.out', stagger: 0.045, clearProps: 'transform' });
  }
  ready(() => setTimeout(headline, 80));
  watch($('#hero'), () => setTimeout(headline, 60));

  if (!fine) return;

  // ── Pointer follower ──
  const cur = document.createElement('div'); cur.className = 'dsy-cursor'; cur.setAttribute('aria-hidden', 'true'); document.body.append(cur);
  const cx = gsap.quickTo(cur, 'x', { duration: 0.35, ease }), cy = gsap.quickTo(cur, 'y', { duration: 0.35, ease });
  const hotSel = 'a,button,.file-item,.archive-cover,.thinking-card,.studio-button,input,textarea,video';
  addEventListener('pointermove', e => {
    cur.classList.add('on'); cx(e.clientX); cy(e.clientY);
    cur.classList.toggle('hot', !!e.target.closest?.(hotSel));
  }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.remove('on'));

  // ── Home: collage photos and notes drift against the pointer, at different depths ──
  const hero = $('#hero');
  const depth = [['.collage-photo:not(.second)', 14], ['.collage-photo.second', 28], ['.note-tag', 36], ['.home-collage .hand', 20], ['.home-collage .stamp', 22]];
  let movers = [];
  const bindParallax = () => { movers = depth.map(([sel, d]) => { const el = $(sel, hero); return el && { x: gsap.quickTo(el, 'x', { duration: 0.8, ease }), y: gsap.quickTo(el, 'y', { duration: 0.8, ease }), d }; }).filter(Boolean); };
  hero.addEventListener('pointermove', e => {
    if (!movers.length) bindParallax();
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    movers.forEach(m => { m.x(-nx * m.d); m.y(-ny * m.d); });
  });
  hero.addEventListener('pointerleave', () => movers.forEach(m => { m.x(0); m.y(0); }));
  watch(hero, () => { movers = []; });

  // ── Magnetic buttons ──
  const magnet = e => {
    $$('.studio-button, .preview-open, .ct2-send').forEach(b => {
      const r = b.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
      const dx = e.clientX - mx, dy = e.clientY - my, dist = Math.hypot(dx, dy), reach = Math.max(r.width, r.height) * 0.9;
      if (dist < reach) gsap.to(b, { x: dx * 0.22, y: dy * 0.22, duration: 0.4, ease, overwrite: 'auto' });
      else if (b._m) gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,.5)', overwrite: 'auto' });
      b._m = dist < reach;
    });
  };
  addEventListener('pointermove', magnet, { passive: true });

  // ── Archive: figures roll up, the preview opens like a shutter ──
  const countUp = () => {
    const n = $('#desk .index-ticket strong'); if (!n) return;
    const end = parseInt(n.textContent, 10) || 0, o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.1, ease, onUpdate: () => { n.textContent = String(Math.round(o.v)).padStart(2, '0'); } });
  };
  watch($('#desk'), countUp);
  const shutter = () => {
    const m = $('#filePreview .preview-img, #filePreview .preview-typographic'); if (!m) return;
    gsap.fromTo(m, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power4.inOut', clearProps: 'clipPath' });
  };
  const bindPreview = () => { const fp = $('#filePreview'); if (fp && !fp._w) { fp._w = 1; watch(fp, shutter); } };
  watch($('#desk'), bindPreview); bindPreview();

  // ── Thinking: cards reveal as they scroll, then tilt toward the pointer ──
  const cards = () => {
    const list = $$('#skills .thinking-card'); if (!list.length) return;
    gsap.registerPlugin(window.ScrollTrigger);
    gsap.set(list, { y: 50, opacity: 0 });
    ScrollTrigger.batch(list, { scroller: '#skills', start: 'top 94%', once: true, onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease, stagger: 0.1, clearProps: 'opacity,y' }) });
    list.forEach(c => {
      gsap.set(c, { transformPerspective: 900 });
      const rx = gsap.quickTo(c, 'rotationX', { duration: 0.5, ease }), ry = gsap.quickTo(c, 'rotationY', { duration: 0.5, ease });
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 7); rx(-((e.clientY - r.top) / r.height - 0.5) * 7); });
      c.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
    ScrollTrigger.refresh();
  };
  watch($('#skills'), cards);
})();
