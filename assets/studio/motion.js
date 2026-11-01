/* GSAP motion layer: hero intro, archive entrance, and project-book page reveals.
   Uses gsap-core / gsap-scrolltrigger patterns; every effect is skipped under prefers-reduced-motion. */
(() => {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ease = 'power3.out';

    // Home: copy rises in, collage photos settle onto the page
    const intro = () => {
      const copy = $$('#hero .home-copy > *');
      if (!copy.length) return;
      const tl = gsap.timeline({ defaults: { ease }, delay: 0.15 });
      tl.from(copy, { y: 34, opacity: 0, duration: 0.9, stagger: 0.08, clearProps: 'transform,opacity' })
        .from('#hero .collage-photo', { y: 60, rotate: (i) => (i ? 6 : -6), opacity: 0, duration: 1.1, stagger: 0.14, clearProps: 'transform,opacity' }, 0.2)
        .from('#hero .note-tag, #hero .stamp, #hero .hand', { scale: 0.85, opacity: 0, duration: 0.7, stagger: 0.1, clearProps: 'transform,opacity' }, 0.7);
    };

    // Archive (work view): heading, sidebar, CRT and file list enter in sequence
    const archive = () => {
      const d = $('#desk');
      if (!d || !d.classList.contains('on')) return;
      const items = $$('.archive-heading > *, .archive-side > *, .crt, .archive-strip > *, .file-list > *', d);
      if (!items.length) return;
      gsap.from(items, { y: 28, opacity: 0, duration: 0.7, ease, stagger: 0.05, clearProps: 'transform,opacity' });
    };

    // Project book: reveal the leaves of whichever spread is showing; gallery images enter as they scroll into view
    let triggers = [];
    const killTriggers = () => { triggers.forEach(t => t.kill()); triggers = []; };
    const spread = () => {
      const dlg = $('dialog.book-dialog[open]');
      if (!dlg) return;
      const sp = $$('.book-spread', dlg).find(s => !s.inert);
      if (!sp) return;
      killTriggers();
      const leaves = $$('.leaf > *', sp).filter(el => !el.matches('.book-gallery'));
      gsap.fromTo(leaves, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease, stagger: 0.04, clearProps: 'transform,opacity', overwrite: 'auto' });
      const imgs = $$('.book-gallery a', sp);
      if (imgs.length) {
        gsap.set(imgs, { opacity: 0, y: 40 });
        triggers = ScrollTrigger.batch(imgs, {
          scroller: sp, start: 'top 92%', once: true,
          onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease, stagger: 0.12, clearProps: 'transform,opacity' }),
        });
        ScrollTrigger.refresh();
      }
    };

    // The site's own scripts re-render these regions, so watch them and animate after each render
    let last = '', raf = 0;
    const watch = (el, fn, opts) => el && new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); }).observe(el, opts);
    watch($('#hero'), intro, { childList: true });
    watch($('#desk'), archive, { childList: true });
    const dlg = $('dialog.book-dialog');
    if (dlg) {
      new MutationObserver(() => {
        const open = dlg.open, prog = $('.book-progress', dlg)?.textContent || '', title = $('.book-title', dlg)?.textContent || '';
        const key = open ? title + '|' + prog : '';
        if (key !== last) { last = key; if (open) requestAnimationFrame(spread); else killTriggers(); }
      }).observe(dlg, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['open'] });
    }
    intro();
    return () => killTriggers();
  });
})();
