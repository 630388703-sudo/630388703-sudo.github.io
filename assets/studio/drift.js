/* Drifting photo-fragment particles behind the archive. Pauses when the tab is hidden; static under reduced motion. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const bg = document.createElement('div');
  bg.className = 'drift-bg'; bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = '<div class="mesh"></div><div class="aurora a1"></div><div class="aurora a2"></div><canvas></canvas>';
  document.body.prepend(bg);
  const cv = bg.querySelector('canvas'), ctx = cv.getContext('2d');
  const palette = ['#7ea6ff', '#f2b84b', '#f08a73', '#f2a7cf', '#7fdcc0', '#274bd4'];
  let W, H, parts = [], raf = 0;
  const spawn = anywhere => {
    const z = 0.35 + Math.random() * 0.9;
    return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + 40, w: (5 + Math.random() * 9) * z, h: (14 + Math.random() * 26) * z,
      vx: (Math.random() - 0.5) * 0.12, vy: -(0.08 + Math.random() * 0.22) * z, rot: (Math.random() - 0.5) * 0.6, vr: (Math.random() - 0.5) * 0.003,
      c: palette[(Math.random() * palette.length) | 0], filled: Math.random() < 0.45, a: 0.16 + Math.random() * 0.28, flick: Math.random() < 0.18 ? Math.random() * 6 : -1 };
  };
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = Array.from({ length: Math.min(W < 700 ? 22 : 46, Math.round(W * H / 28000)) }, () => spawn(true));
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y < -60 || p.x < -60 || p.x > W + 60) Object.assign(p, spawn(false));
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = p.flick >= 0 ? p.a * (0.35 + 0.65 * Math.abs(Math.sin(t / 900 + p.flick))) : p.a;
      if (p.filled) { ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      ctx.strokeStyle = p.c; ctx.lineWidth = 1; ctx.strokeRect(-p.w / 2 + .5, -p.h / 2 + .5, p.w, p.h);
      ctx.restore();
    }
  }
  const loop = t => { draw(t); raf = requestAnimationFrame(loop); };
  const start = () => { cancelAnimationFrame(raf); reduced.matches ? draw(0) : (raf = requestAnimationFrame(loop)); };
  resize(); start();
  addEventListener('resize', () => { resize(); if (reduced.matches) draw(0); });
  document.addEventListener('visibilitychange', () => document.hidden ? cancelAnimationFrame(raf) : start());
})();
