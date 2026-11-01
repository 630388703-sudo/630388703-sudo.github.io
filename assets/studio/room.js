/* DSY / Memory Tunnel — the portfolio as one horizontal 3D journey (three.js, loaded on demand).
   The look comes from the Memory Tunnel TD film: points, lines and drifting numbers in the dark.
   Content is the site's own: every project opens its notebook, and Work / Thinking / About / Contact
   open as panels inside the tunnel. Every device gets the 3D site; the paper site only remains as the
   fallback when WebGL is missing or the scripts cannot load. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const zh = () => document.documentElement.lang !== 'en';
  const tr = (a, b) => (zh() ? a : b);
  const L = p => (zh() ? p[0] : p[1]);
  const V = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  const SCRIPTS = ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', V + 'shaders/CopyShader.js', V + 'shaders/LuminosityHighPassShader.js', V + 'postprocessing/EffectComposer.js', V + 'postprocessing/RenderPass.js', V + 'postprocessing/ShaderPass.js', V + 'postprocessing/UnrealBloomPass.js'];
  const webgl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
  if (!webgl) return;
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const q = new URLSearchParams(location.search);
  const small = () => innerWidth < 760 || innerHeight > innerWidth;
  const wantRoom = () => !q.has('static');
  store.set('dsy.view', 'room');

  // ── the journey: one station per section, same content as the 2D site ──
  const GAP = 14;
  const STATIONS = [
    { id: 'home', nav: 'home', kicker: ['刁思予 · 数字媒体艺术 · 昆明理工大学', 'Siyu Diao · Digital Media Art · KMUST'], title: ['Field notes.', 'Field notes.'], sub: ['想法，正在发生。在游戏、影像与交互之间，把好奇心变成可以感知的体验。', 'Ideas, in the making. Across games, moving images and interaction, I turn curiosity into experiences.'], actions: [['work', ['看全部作品档案', 'Open the work archive']]] },
    { id: 'memory', nav: 'work', key: 'memory', video: 'assets/memorydrift/MemoryDrift_2min15.mp4', ratio: 16 / 9, kicker: ['008 · 互动装置 + 像素游戏 + TD 影像 · 2026', '008 · Installation, pixel game, TD film · 2026'], title: ['忘了自己是什么', 'What Was I Again?'], sub: ['遗忘是缺陷，还是自我保护？看一张照片，收集它的碎片，再被反复问同一个问题。', 'Is forgetting a defect, or self-protection? Study one photograph, collect its fragments, answer the same question three times.'] },
    { id: 'zhixu', key: 'zhixu', image: 'assets/zhixu/cover.svg', ratio: 1.5, kicker: ['007 · UI / UX · 手机 App', '007 · UI / UX · Mobile app'], title: ['知序 · AIGC 知识库', 'Zhixu · AIGC Fieldnotes'], sub: ['让灵感先于生成。七页界面串联知识、工具、Prompt 和个人内容。', 'Understanding before generation. Seven screens connect knowledge, tools, prompts and personal content.'] },
    { id: 'afterimage', key: 'afterimage', image: '残像预览图.png', ratio: 1834 / 1037, kicker: ['001 · 莉莉丝 Game Jam · Unity 2D · 2026', '001 · Lilith Game Jam · Unity 2D · 2026'], title: ['残像', 'Afterimage'], sub: ['「我的 AI 队友」：你塑造了它，它也在重构你。', 'My AI Teammate: you shape it, and it reshapes you.'] },
    { id: 'growingpains', key: 'growingpains', image: 'assets/growingpains/page-1.jpg', ratio: 1684 / 618, kicker: ['002 · 叙事探索游戏 · 个人项目', '002 · Narrative exploration · Personal project'], title: ['生长痛', 'Growth Pain'], sub: ['压力，如何悄悄改变我们对自己的认识？', 'How does pressure quietly reshape the way we see ourselves?'] },
    { id: 'archive', key: 'archive', image: 'assets/archive/cover.jpg', ratio: 2200 / 3112, kicker: ['005 · 云南传统建筑 · 信息可视化 · 2025', '005 · Vernacular architecture · Information design · 2025'], title: ['马家大院档案', 'Courtyard Archive'], sub: ['让建筑结构成为可以阅读的信息。', 'Make architectural structure readable.'] },
    { id: 'aiwork', key: 'aiwork', image: 'assets/ai/jellyfish-cover.jpg', ratio: 1.6, kicker: ['009 · AI 协作 · Three.js · 2026', '009 · AI collaboration · Three.js · 2026'], title: ['机械水母', 'Mechanical Medusa'], sub: ['一只没有模型文件的水母：全部由代码生成，可以旋转、拆开再复原。', 'A jellyfish without a model file: all generated in code, to turn, take apart and reassemble.'], actions: [['ai', ['打开 3D 作品 ↗', 'Open the 3D piece ↗']]] },
    { id: 'thinking', nav: 'thinking', cards: true, kicker: ['能力与思考', 'How I think, how I make'], title: ['作品背后，还有这些思考。', 'Behind the work, a way of thinking.'], sub: ['创意与游戏策划 · 用户与产品思考 · AI 工作流 · 交互与技术实现 · 视觉与信息表达 · 反思与创作记录', 'Game & narrative · Product thinking · AI workflow · Interaction & making · Visual communication · Reflection'], actions: [['thinking', ['展开能力与思考', 'Read the full map']]] },
    { id: 'contact', nav: 'contact', portrait: 'assets/studio/siyu-portrait.jpg', ratio: 0.75, kicker: ['关于 · 联系', 'About · Contact'], title: ['Hi, 我是刁思予。', "Hi, I'm Siyu."], sub: ['可实习：2027 年 1 月 5 日至 3 月中旬 · 630388703@qq.com · 138-8899-7566', 'Internship: 5 Jan to mid-March 2027 · 630388703@qq.com · 138-8899-7566'], actions: [['about', ['关于我', 'About me']], ['contact', ['联系与留言', 'Contact & message']], ['cv', ['下载简历 PDF', 'Download CV']]] },
  ];
  STATIONS.forEach((s, i) => (s.x = i * GAP));

  let root, S = null, running = false, rafId = 0, building = null;
  const Sound = (() => {
    let ctx, master, music, src, buf, staticBuf, on = store.get('dsy.sound') === 'on', unlocked = false, ducked = false;
    const btn = () => root && root.querySelector('.rm-sound');
    const show = () => { const b = btn(); if (b) { b.setAttribute('aria-pressed', String(on)); b.classList.toggle('on', on); } };
    async function init() {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      music = ctx.createGain(); music.gain.value = 0.55; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; music.connect(lp).connect(master);
      const load = async u => ctx.decodeAudioData(await (await fetch(u)).arrayBuffer());
      try { [buf, staticBuf] = await Promise.all([load('assets/room/audio/pynchon-loop.mp3'), load('assets/room/audio/memory-static.mp3')]); } catch (e) { console.warn('audio', e); }
      if (buf) { src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(music); src.start(); }
    }
    const level = () => (on && !ducked ? 0.8 : 0);
    const ramp = () => { if (master) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.6); };
    return {
      async toggle() { on = !on; store.set('dsy.sound', on ? 'on' : 'off'); show(); if (on) { await init(); await ctx.resume(); } ramp(); },
      async unlock() { show(); if (unlocked || !on) return; unlocked = true; await init(); await ctx.resume(); ramp(); },
      duck(d) { ducked = d; ramp(); },
      forget() { if (!ctx || !on || ducked || !staticBuf) return; const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = staticBuf; s.playbackRate.value = 0.7 + Math.random() * 0.3; g.gain.value = 0.18; s.connect(g).connect(master); s.start(); },
    };
  })();

  const loadAll = async () => { for (const src of SCRIPTS) { if (src.includes('three.min') && window.THREE) continue; await new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); }); } };

  const origHero = window.goHero;
  window.goHero = function () { if (wantRoom()) showRoom(); else origHero.apply(this, arguments); };
  if (wantRoom()) document.documentElement.classList.add('dsy-3d');

  // ── panels: work archive, thinking, about and contact open inside the tunnel, not in another site ──
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CAPS = [['创意与游戏策划', 'Game & narrative', '从主题出发，组织核心规则、叙事分支与玩家选择。', 'Turn a theme into rules, narrative branches and player choices.', 'afterimage', '残像 / 生长痛', 'Afterimage / Growth Pain'], ['用户与产品思考', 'Product thinking', '整理使用场景、信息结构与内容路径，让界面服务于清楚的目标。', 'Organise scenarios, information and paths around a clear purpose.', 'zhixu', '知序 · AIGC 知识库', 'Zhixu · AIGC Fieldnotes'], ['AI 应用与工作流', 'AI workflow', '把素材生成、筛选与后期整合连接起来，关注最终表达。', 'Connect generation, selection and post-production around the intended expression.', 'aiwork', '残像 / 机械水母', 'Afterimage / Mechanical Medusa'], ['交互与技术实现', 'Interaction & making', '通过 Unity、TouchDesigner 与 Web，将叙事和视觉想法变成运行中的体验。', 'Turn narrative and visual ideas into running experiences with Unity, TouchDesigner and the web.', 'memory', '记忆漂移 / 残像', 'Memory Drift / Afterimage'], ['视觉与信息表达', 'Visual communication', '以构图、字体、层级与媒介选择，把复杂内容组织为可读的信息。', 'Use composition, type, hierarchy and media to make information readable.', 'archive', '马家大院档案', 'Courtyard Archive'], ['反思与创作记录', 'Reflection & process', '把作品放回问题与选择之中，说明设计意图、实现方式和可以继续探索的地方。', 'Connect the outcome to its questions, choices and directions for further exploration.', 'growingpains', '生长痛 / 创作手记', 'Growth Pain / Notebook']];
  const CONTACT = [['实习', 'Dates', ['2027 年 1 月 5 日至 3 月中旬', '5 January to mid-March 2027']], ['邮箱', 'Email', ['<a href="mailto:630388703@qq.com">630388703@qq.com</a>', '<a href="mailto:630388703@qq.com">630388703@qq.com</a>']], ['电话', 'Phone', ['138-8899-7566', '138-8899-7566']], ['视频', 'Video', ['<a href="https://www.bilibili.com/video/BV1D6dLBiExR" target="_blank" rel="noopener">B 站项目视频 ↗</a>', '<a href="https://www.bilibili.com/video/BV1D6dLBiExR" target="_blank" rel="noopener">Project video on Bilibili ↗</a>']], ['简历', 'CV', ['<a href="刁思予_简历.pdf?v=20260930-internship" target="_blank" rel="noopener">下载简历 PDF ↗</a>', '<a href="刁思予_简历.pdf?v=20260930-internship" target="_blank" rel="noopener">Download CV (PDF) ↗</a>']]];
  const aboutData = () => { try { return (typeof T !== 'undefined' && T[zh() ? 'zh' : 'en'] && T[zh() ? 'zh' : 'en'].about) || null; } catch { return null; } };
  const stationOf = key => STATIONS.findIndex(s => s.key === key);
  let panelKind = null;
  const PANELS = {
    work: () => `<h2>${tr('全部作品', 'All work')}</h2><p class="rm-lead">${tr('每件作品都在隧道里有一站。点作品名飞过去，点“打开”直接看项目手记。', 'Every project has a stop in the tunnel. Click a title to fly there, or Open to read its notebook.')}</p>
      <ol class="rm-works">${STATIONS.filter(s => s.key).map(s => `<li><button class="rm-work" data-fly="${s.key}"><img src="${s.video ? 'assets/studio/memory-tunnel.jpg' : s.image}" alt="" loading="lazy"><span><b>${esc(L(s.title))}</b><small>${esc(L(s.kicker))}</small></span></button><button class="rm-btn ghost" data-open="${s.key}">${tr('打开', 'Open')} ↗</button></li>`).join('')}</ol>`,
    thinking: () => `<h2>${tr('作品背后，还有这些思考。', 'Behind the work, a way of thinking.')}</h2><p class="rm-lead">${tr('从发现问题、组织想法，到做出原型与视觉表达。通过具体项目，了解我的创作方法和正在发展的能力。', 'From questions and ideas to prototypes and visual expression. Explore my approach through the work itself.')}</p>
      <ol class="rm-caps">${CAPS.map(c => `<li><h3>${esc(L([c[0], c[1]]))}</h3><p>${esc(L([c[2], c[3]]))}</p><button class="rm-link" data-fly="${c[4]}">${esc(L([c[5], c[6]]))} →</button></li>`).join('')}</ol>`,
    about: () => {
      const a = aboutData();
      const skills = a ? a.skills.map(s => `<li><h3>${esc(s.lbl)}</h3><p>${s.items.map(esc).join(' · ')}</p></li>`).join('') : '';
      const creds = a ? a.credentials.map(c => `<li><a href="${c.img}" target="_blank" rel="noopener"><img src="${c.img}" alt="" loading="lazy"></a><div><small>${esc(c.type)}</small><b>${esc(c.title)}</b><p>${esc(c.desc)}</p></div></li>`).join('') : '';
      return `<div class="rm-about-head"><img src="assets/studio/siyu-portrait.jpg" alt="${tr('刁思予', 'Siyu Diao')}"><div><h2>${tr('刁思予', 'Siyu Diao')}</h2><p class="rm-lead">${tr('昆明理工大学 · 数字媒体艺术 · 大三', 'KMUST · Digital Media Art · Third year')}</p></div></div>
        ${a ? `<p>${a.desc1}</p><p>${a.desc2}</p><h3 class="rm-sec">${esc(a.skill_label)}</h3><ul class="rm-skills">${skills}</ul><h3 class="rm-sec">${esc(a.cred_label)}</h3><ul class="rm-creds">${creds}</ul>` : ''}
        <div class="rm-acts"><button class="rm-btn" data-panel="contact">${tr('联系我', 'Contact me')}</button></div>`;
    },
    contact: () => `<h2>${tr('联系我', 'Contact')}</h2><p class="rm-lead">${tr('欢迎交流项目合作、展览与作品反馈。', 'Open to collaborations, exhibitions and portfolio feedback.')}</p>
      <dl class="rm-contact">${CONTACT.map(c => `<div><dt>${zh() ? c[0] : c[1]}</dt><dd>${L(c[2])}</dd></div>`).join('')}</dl>
      <h3 class="rm-sec">${tr('留言', 'Message')}</h3><textarea class="rm-field" rows="4" aria-label="${tr('留言内容', 'Message')}" placeholder="${tr('写下你的留言…', 'Write your message…')}"></textarea><input class="rm-field" aria-label="${tr('你的联系方式', 'Your contact')}" placeholder="${tr('你的联系方式', 'How to reach you')}">
      <div class="rm-acts"><button class="rm-btn" data-mail>${tr('通过邮件发送', 'Send by email')}</button></div>`,
  };
  function openPanel(kind) {
    if (!root) return;
    let p = $('.rm-panel', root);
    if (!p) { p = document.createElement('aside'); p.className = 'rm-panel'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-modal', 'false'); root.append(p); }
    panelKind = kind;
    p.innerHTML = `<button class="rm-close" aria-label="${tr('关闭', 'Close')}">${tr('关闭', 'Close')} ×</button><div class="rm-panel-body">${PANELS[kind]()}</div>`;
    root.classList.add('panel-open');
    $('.rm-close', p).onclick = closePanel;
    $$('[data-fly]', p).forEach(b => b.onclick = () => { const i = stationOf(b.dataset.fly); closePanel(); if (i >= 0) goTo(i); });
    $$('[data-open]', p).forEach(b => b.onclick = () => openW(b.dataset.open));
    $$('[data-panel]', p).forEach(b => b.onclick = () => openPanel(b.dataset.panel));
    const mail = $('[data-mail]', p);
    if (mail) mail.onclick = () => { const f = $$('.rm-field', p), text = f[0].value.trim(); if (!text) { f[0].focus(); return; } location.href = 'mailto:630388703@qq.com?subject=' + encodeURIComponent(tr('来自作品网站的联系', 'Portfolio enquiry')) + '&body=' + encodeURIComponent(text + '\n\n' + f[1].value.trim()); };
    if (window.gsap) gsap.fromTo(p, { xPercent: 8, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    $('.rm-close', p).focus();
  }
  function closePanel() { const p = root && $('.rm-panel', root); if (!p) return; root.classList.remove('panel-open'); panelKind = null; p.remove(); }

  const doAction = a => ({
    work: () => openPanel('work'), thinking: () => openPanel('thinking'), contact: () => openPanel('contact'), about: () => openPanel('about'),
    ai: () => { location.href = 'ai/jellyfish.html'; }, cv: () => window.open('刁思予_简历.pdf?v=20260930-internship', '_blank'),
  })[a]?.();

  async function showRoom() {
    if (root && S) { root.hidden = false; resume(); Sound.duck(false); return; }
    if (building) return building;
    building = (async () => {
      root = document.createElement('div'); root.id = 'room';
      root.innerHTML = `<canvas></canvas><div class="rm-load">${tr('正在进入记忆隧道…', 'Entering the memory tunnel…')}</div>
        <header class="rm-top"><button class="rm-brand" data-go="home">D<b>.</b>S<b>.</b>Y</button>
          <nav class="rm-nav">${[['home', ['首页', 'Home']], ['work', ['作品', 'Work']], ['thinking', ['能力与思考', 'Thinking']], ['about', ['关于', 'About']], ['contact', ['联系', 'Contact']]].map(([k, l]) => `<button data-go="${k}" data-l='${JSON.stringify(l)}'>${L(l)}</button>`).join('')}</nav>
          <div class="rm-tools"><button class="rm-sound" aria-pressed="false" data-l='["声音","Sound"]'>${tr('声音', 'Sound')}</button><button data-lang="zh">CN</button><button data-lang="en">EN</button></div></header>
        <section class="rm-cap" aria-live="polite"></section>
        <div class="rm-rail">${STATIONS.map((s, i) => `<button data-i="${i}" aria-label="${L(s.title)}" title="${L(s.title)}"><i></i></button>`).join('')}</div>
        <div class="rm-credit">${tr('音乐', 'Music')} · PYNCHON — James Gargette (CC0)</div>
        <div class="rm-tip" hidden></div>`;
      document.body.append(root);
      $$('[data-lang]', root).forEach(b => b.onclick = () => { if (typeof setLang === 'function') setLang(b.dataset.lang); relabel(); });
      $$('[data-go]', root).forEach(b => b.onclick = () => nav(b.dataset.go));
      $$('.rm-rail button', root).forEach(b => b.onclick = () => goTo(+b.dataset.i));
      $('.rm-sound', root).onclick = () => Sound.toggle();
      root.addEventListener('pointerdown', () => Sound.unlock(), { once: true });
      try { await loadAll(); build(); } catch (e) { console.error(e); root.remove(); root = null; building = null; document.documentElement.classList.remove('dsy-3d'); origHero(); return; }
      $('.rm-load', root).remove(); start();
    })();
    await building; building = null;
  }
  function hideRoom() { if (!root) return; root.hidden = true; pause(); Sound.duck(true); }
  function pause() { running = false; cancelAnimationFrame(rafId); S && S.videos.forEach(v => v.pause()); }
  function resume() { if (S && !running) start(); }
  function nav(where) {
    if (where === 'home') { closePanel(); goTo(0); return; }
    openPanel(where);
  }
  function goTo(i) { S.target = STATIONS[i].x; }
  function relabel() {
    $$('[data-l]', root).forEach(b => { b.textContent = L(JSON.parse(b.dataset.l)); });
    if (S) S.cur = -1;
    if (panelKind) openPanel(panelKind);
  }

  function caption(i) {
    const s = STATIONS[i], cap = $('.rm-cap', root);
    const acts = (s.actions || []).map(([a, l]) => `<button class="rm-btn${a === 'work' || a === 'thinking' || a === 'contact' ? '' : ' ghost'}" data-a="${a}">${L(l)}</button>`).join('');
    const open = s.key ? `<button class="rm-btn" data-open="${s.key}">${tr('打开作品 ↗', 'Open project ↗')}</button>` : '';
    cap.innerHTML = `<h1 class="${s.id === 'home' ? 'rm-hero' : ''}">${s.id === 'home' ? 'Field<br><em>notes.</em>' : L(s.title)}</h1><p class="rm-sub">${L(s.sub)}</p><div class="rm-acts">${open}${acts}</div>`;
    $$('[data-a]', cap).forEach(b => b.onclick = () => doAction(b.dataset.a));
    $$('[data-open]', cap).forEach(b => b.onclick = () => openW(b.dataset.open));
    if (window.gsap) gsap.fromTo(cap.children, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06 });
    $$('.rm-rail button', root).forEach((b, k) => b.classList.toggle('on', k === i));
  }

  function build() {
    const T = THREE, cv = $('canvas', root);
    const renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.outputEncoding = T.sRGBEncoding;
    const scene = new T.Scene(); scene.background = new T.Color(0x030305); scene.fog = new T.Fog(0x030305, 9, 34);
    const cam = new T.PerspectiveCamera(50, 1, 0.1, 80); cam.position.set(0, 0.4, 9);
    const srgb = t => { t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t; };
    const loader = new T.TextureLoader(), videos = [], frames = [];
    const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return srgb(new T.CanvasTexture(c)); };
    const END = STATIONS[STATIONS.length - 1].x;

    // point field + constellation lines, the Memory Tunnel look
    const N = small() ? 1100 : 2600, P = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = 4 + Math.pow(Math.random(), 0.6) * 9; P[i * 3] = -14 + Math.random() * (END + 28); P[i * 3 + 1] = Math.sin(a) * r * 0.55; P[i * 3 + 2] = -6 - Math.abs(Math.cos(a)) * r * 1.4 + (Math.random() < 0.12 ? 9 : 0); }
    const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(P, 3));
    const dot = canvasTex(32, 32, g => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, '#fff'); r.addColorStop(0.3, '#fff'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); });

    const FIELD = `
      uniform vec3 uMouse; uniform float uTime; uniform vec4 uRip;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      vec3 field(vec3 p, out float glow) {
        float r = hash(p.xy);
        p.y += sin(uTime * 0.35 + r * 6.2831) * 0.08;
        vec2 d = p.xy - uMouse.xy; float dist = length(d);
        float infl = smoothstep(4.6, 0.0, dist);
        p.xy += normalize(d + 1e-4) * infl * infl * 1.7;
        p.z += infl * 0.6;
        float rt = uRip.w, rd = length(p.xy - uRip.xy);
        float ring = rt < 0.0 ? 0.0 : exp(-pow((rd - rt * 7.0) * 1.4, 2.0)) * exp(-rt * 1.1);
        p.xy += normalize(p.xy - uRip.xy + 1e-4) * ring * 1.2;
        glow = clamp(infl + ring * 1.4, 0.0, 1.6);
        return p;
      }`;
    const uniforms = { uMouse: { value: new T.Vector3(0, 0, -6) }, uTime: { value: 0 }, uRip: { value: new T.Vector4(0, 0, 0, -1) }, uPx: { value: renderer.getPixelRatio() }, uDot: { value: dot } };
    const pointMat = new T.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: FIELD + `uniform float uPx; varying float vGlow; varying float vFade;
        void main() { float g; vec3 p = field(position, g); vGlow = g; vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFade = smoothstep(-36.0, -7.0, mv.z); gl_PointSize = (1.5 + g * 4.5 + hash(position.xz) * 1.4) * uPx * (11.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D uDot; varying float vGlow; varying float vFade;
        void main() { vec4 t = texture2D(uDot, gl_PointCoord); vec3 c = mix(vec3(0.9, 0.91, 0.94), vec3(0.49, 0.65, 1.0), clamp(vGlow, 0.0, 1.0));
          gl_FragColor = vec4(c * (0.9 + vGlow * 1.2), t.a * vFade * (0.7 + vGlow * 0.3)); }` });
    const lineMat = new T.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: FIELD + `varying float vGlow; varying float vFade;
        void main() { float g; vec3 p = field(position, g); vGlow = g; vec4 mv = modelViewMatrix * vec4(p, 1.0); vFade = smoothstep(-36.0, -7.0, mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vGlow; varying float vFade;
        void main() { vec3 c = mix(vec3(0.5, 0.52, 0.58), vec3(0.49, 0.65, 1.0), clamp(vGlow, 0.0, 1.0)); gl_FragColor = vec4(c, (0.12 + vGlow * 0.85) * vFade); }` });
    const points = new T.Points(pg, pointMat); scene.add(points);
    const haloTex = canvasTex(256, 256, g => { const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, 'rgba(126,166,255,.5)'); r.addColorStop(0.35, 'rgba(126,166,255,.14)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); });
    const halo = new T.Sprite(new T.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 })); halo.scale.set(9, 9, 1); scene.add(halo);
    const seg = [];
    for (let i = 0; i < 1100; i++) { const a = (Math.random() * N) | 0; let best = -1, bd = 1e9; for (let k = 0; k < 24; k++) { const b = (Math.random() * N) | 0; if (b === a) continue; const dx = P[a * 3] - P[b * 3], dy = P[a * 3 + 1] - P[b * 3 + 1], dz = P[a * 3 + 2] - P[b * 3 + 2], d = dx * dx + dy * dy + dz * dz; if (d < bd) { bd = d; best = b; } } if (best >= 0 && bd < 9) seg.push(P[a * 3], P[a * 3 + 1], P[a * 3 + 2], P[best * 3], P[best * 3 + 1], P[best * 3 + 2]); }
    const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(seg, 3));
    scene.add(new T.LineSegments(lg, lineMat));
    // receding rectangles: the tunnel itself
    const rings = new T.Group(); scene.add(rings);
    for (let i = 0; i < 12; i++) { const w = 22 - i * 1.4, h = 12 - i * 0.76; const m = new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(w, h)), new T.LineBasicMaterial({ color: 0x6b6f7c, transparent: true, opacity: 0.07 })); m.position.set(0, 0, -4 - i * 2.4); rings.add(m); }
    // drifting numbers
    const nums = [];
    for (let i = 0; i < 46; i++) { const txt = '0.' + String(Math.random()).slice(2, 10); const tex = canvasTex(256, 48, g => { g.fillStyle = '#e6e9ff'; g.font = '500 30px "JetBrains Mono",monospace'; g.fillText(txt, 6, 34); g.fillStyle = '#fff'; g.fillRect(0, 22, 4, 4); }); const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, opacity: 0.55, depthWrite: false })); sp.scale.set(1.1, 0.2, 1); sp.position.set(-10 + Math.random() * (END + 20), -3.5 + Math.random() * 7, -3 - Math.random() * 12); scene.add(sp); nums.push(sp); }

    // ── images that forget ──
    // Each picture is a cloud of points sampled from its own texture. Looked at, it gathers into the image;
    // left behind, it loosens from the edges, splits into five strips and drifts back into the field.
    // Each time it is put back together the strips land a little off, the way a recalled memory does.
    const MEM_PTS = `
      uniform sampler2D uTex; uniform float uA, uTime, uOp, uW, uH, uPx; uniform float uRes[5];
      attribute vec2 aUv; attribute vec3 aRnd;
      varying vec3 vCol; varying float vAlpha;
      void main() {
        float band = clamp(floor(aUv.x * 5.0), 0.0, 4.0); int bi = int(band);
        vec3 p = vec3((aUv.x - 0.5) * uW, (aUv.y - 0.5) * uH + uRes[bi], 0.0);
        float edge = max(abs(aUv.x - 0.5), abs(aUv.y - 0.5)) * 2.0;
        float k = smoothstep(0.0, 1.0, clamp((uA - 0.42 - edge * 0.26 - aRnd.z * 0.16) * 3.6, 0.0, 1.0));
        vec3 drift = vec3(sin(uTime * 0.21 + aRnd.x * 6.28), cos(uTime * 0.17 + aRnd.y * 6.28), sin(uTime * 0.13 + aRnd.z * 6.28)) * 0.5;
        vec3 scatter = (aRnd - 0.5) * vec3(uW * 1.5, uH * 1.7, 7.0) + drift + vec3(0.0, (band - 2.0) * 0.45, -1.2 - band * 0.35);
        p += (1.0 - k) * scatter;
        vCol = texture2D(uTex, aUv).rgb;
        vAlpha = uOp * (0.25 + 0.75 * k) * (1.0 - smoothstep(0.9, 1.0, uA) * 0.85);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uPx * (4.2 + (1.0 - k) * 0.8) * (10.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`;
    const MEM_PTS_F = `varying vec3 vCol; varying float vAlpha;
      void main() { float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(vCol * 0.92, vAlpha * smoothstep(0.5, 0.25, d)); }`;
    const MEM_PLANE_V = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    const MEM_PLANE_F = `uniform sampler2D uTex; uniform float uA, uOp, uH; uniform float uRes[5]; varying vec2 vUv;
      void main() {
        float b = floor(vUv.x * 5.0); float r = uRes[0];
        if (b > 0.5) r = uRes[1]; if (b > 1.5) r = uRes[2]; if (b > 2.5) r = uRes[3]; if (b > 3.5) r = uRes[4];
        vec2 uv = vec2(vUv.x, vUv.y - r / uH);
        if (uv.y < 0.0 || uv.y > 1.0) discard;
        float seam = (abs(r) > 0.001 && fract(vUv.x * 5.0) < 0.006) ? 0.0 : 1.0;
        gl_FragColor = vec4(texture2D(uTex, uv).rgb * 0.92, smoothstep(0.72, 1.0, uA) * uOp * seam);
      }`;
    const frame = (st, tex, w, h, x, y, z, ry, main, goto) => {
      const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g);
      const res = [0, 0, 0, 0, 0];
      const u = { uTex: { value: tex }, uA: { value: 0 }, uTime: { value: 0 }, uOp: { value: 0 }, uW: { value: w }, uH: { value: h }, uPx: { value: renderer.getPixelRatio() }, uRes: { value: res } };
      const dens = small() ? 15 : 24, nx = Math.max(16, Math.round(w * dens)), ny = Math.max(12, Math.round(h * dens)), n = nx * ny;
      const uvA = new Float32Array(n * 2), rndA = new Float32Array(n * 3), posA = new Float32Array(n * 3);
      for (let j = 0, q = 0; j < ny; j++) for (let i = 0; i < nx; i++, q++) { uvA[q * 2] = (i + 0.5) / nx; uvA[q * 2 + 1] = (j + 0.5) / ny; rndA[q * 3] = Math.random(); rndA[q * 3 + 1] = Math.random(); rndA[q * 3 + 2] = Math.random(); }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(posA, 3)); geo.setAttribute('aUv', new T.BufferAttribute(uvA, 2)); geo.setAttribute('aRnd', new T.BufferAttribute(rndA, 3));
      geo.boundingSphere = new T.Sphere(new T.Vector3(), Math.max(w, h) * 2 + 6);
      const cloud = new T.Points(geo, new T.ShaderMaterial({ uniforms: u, vertexShader: MEM_PTS, fragmentShader: MEM_PTS_F, transparent: true, depthWrite: false })); g.add(cloud);
      const plane = new T.Mesh(new T.PlaneGeometry(w, h), new T.ShaderMaterial({ uniforms: u, vertexShader: MEM_PLANE_V, fragmentShader: MEM_PLANE_F, transparent: true, depthWrite: false })); plane.position.z = 0.002; g.add(plane);
      g.userData = { st, main, goto, base: y, ry, phase: Math.random() * 6, u, res, plane, a: 0, seen: false };
      frames.push(g); return g;
    };
    const video = src => { const v = document.createElement('video'); v.src = src; v.loop = true; v.muted = true; v.playsInline = true; v.preload = 'auto'; videos.push(v); const t = srgb(new T.VideoTexture(v)); t.minFilter = T.LinearFilter; return t; };
    const typeTex = s => canvasTex(1200, 800, (g, w, h) => { g.fillStyle = '#33463d'; g.fillRect(0, 0, w, h); g.fillStyle = '#faf1df'; g.font = '700 220px "Noto Serif SC",serif'; g.textAlign = 'center'; g.fillText(s.type[0], w / 2, h / 2 + 40); g.font = '500 40px "JetBrains Mono",monospace'; g.fillText('MA COURTYARD · YUNNAN · 2025', w / 2, h / 2 + 140); });
    const texFor = s => s.video ? null : s.image ? srgb(loader.load(s.image)) : s.type ? typeTex(s) : null;
    STATIONS.forEach((s, i) => {
      const x = s.x + 5, W = 5.6;
      if (s.id === 'home') {
        // a loose collage of what lies ahead; each print takes you to its stop
        const picks = [[1, 'assets/studio/memory-tunnel.jpg', 3.0, 1.69, 0, 1.3, -1.6, -0.08], [3, '残像预览图.png', 2.4, 1.36, 2.9, -0.4, -2.6, -0.16], [2, 'assets/zhixu/cover.svg', 2.1, 1.4, -0.4, -1.5, -0.8, -0.04], [4, 'assets/growingpains/page-1.jpg', 2.8, 1.03, 3.4, 2.1, -3.6, -0.2], [7, 'assets/studio/siyu-portrait.jpg', 1.1, 1.47, 5.8, 0.4, -4.2, -0.25]];
        picks.forEach(([to, src, w, h, dx, y, z, ry]) => frame(i, srgb(loader.load(src)), w, h, x + dx, y, z, ry, false, to));
      } else if (s.video) {
        frame(i, video(s.video), W, W / s.ratio, x, 0.3, -1.2, -0.12, true);
        frame(i, srgb(loader.load('assets/studio/memory-tunnel.jpg')), 2.8, 1.58, x + 5.2, 1.9, -4.2, -0.3);
        for (let k = 1; k <= 5; k++) frame(i, srgb(loader.load(`assets/memorydrift/boards/board-${k}.jpg`)), 1.05, 1.49, x + 3.6 + k * 0.85, -1.4 + (k % 2) * 0.25, -3.2 - k * 0.7, -0.35);
        for (let k = 1; k <= 6; k++) frame(i, srgb(loader.load(`assets/room/photos/p${String(k).padStart(2, '0')}.jpg`)), 0.8, 0.6, x - 1.6 + k * 1.3, 2.9 + (k % 2) * 0.35, -6 - (k % 3) * 0.8, -0.1);
      } else if (s.cards) {
        const caps = [['创意与游戏策划', 'Game & narrative'], ['用户与产品思考', 'Product thinking'], ['AI 应用与工作流', 'AI workflow'], ['交互与技术实现', 'Interaction & making'], ['视觉与信息表达', 'Visual communication'], ['反思与创作记录', 'Reflection & process']];
        caps.forEach(([a, b], k) => frame(i, canvasTex(600, 400, (g, w, h) => { g.fillStyle = ['#f4f0e5', '#ede786', '#cfe0ff', '#f4f0e5', '#f2c9b8', '#dfe8d6'][k]; g.fillRect(0, 0, w, h); g.fillStyle = '#274bd4'; g.font = '400 64px "DM Serif Display",serif'; g.fillText('0' + (k + 1), 40, 90); g.fillStyle = '#252823'; g.font = '700 54px "Noto Serif SC",serif'; g.fillText(a, 40, 220); g.font = '500 30px sans-serif'; g.fillStyle = '#5c5a52'; g.fillText(b, 40, 280); }), 2.0, 1.33, x - 1.8 + (k % 3) * 2.35, 1.0 - Math.floor(k / 3) * 1.75, -1.6 - (k % 3) * 0.35, -0.12));
      } else if (s.portrait) {
        frame(i, srgb(loader.load(s.portrait)), 2.4, 3.2, x + 0.6, 0.1, -1.2, -0.15, true);
      } else {
        const fw = s.ratio < 1 ? 4.6 * s.ratio : W, fh = s.ratio < 1 ? 4.6 : W / s.ratio;
        frame(i, texFor(s), fw, fh, x, 0.2, -1.2, -0.12, true);
      }
    });

    // bloom
    const composer = new T.EffectComposer(renderer); composer.addPass(new T.RenderPass(scene, cam));
    composer.addPass(new T.UnrealBloomPass(new T.Vector2(innerWidth, innerHeight), 0.6, 0.45, 0.82));

    S = { T, renderer, composer, scene, cam, frames, nums, videos, points, rings, uniforms, halo, ripAt: -99, world: new T.Vector3(), ray: new T.Raycaster(), mouse: { x: 0, y: 0 }, pos: 0, target: 0, cur: -1, hover: null, tip: $('.rm-tip', root), END };
    onResize(); addEventListener('resize', onResize);
    cv.addEventListener('wheel', e => { e.preventDefault(); S.target = Math.max(0, Math.min(END, S.target + (e.deltaY + e.deltaX) * 0.012)); }, { passive: false });
    let drag = null;
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, t: S.target, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointerup', e => { const d = drag; drag = null; if (d && !d.moved) { const f = pick(e); if (f) openFrame(f); else { S.uniforms.uRip.value.set(S.world.x, S.world.y, 0, 0); S.ripAt = S.clockT; cursorPulse(); } } });
    cv.addEventListener('pointermove', e => {
      S.mouse.x = (e.clientX / innerWidth - 0.5) * 2; S.mouse.y = (e.clientY / innerHeight - 0.5) * 2; S.px = e.clientX; S.py = e.clientY; moveCursor(e);
      if (drag) { const dx = e.clientX - drag.x; if (Math.abs(dx) > 6) drag.moved = true; S.target = Math.max(0, Math.min(END, drag.t - dx * (S.narrow ? 0.045 : 0.02))); return; }
      setHover(pick(e), e);
    });
    cv.addEventListener('pointerleave', () => { setHover(null); S.px = null; S.halo.material.opacity = 0; if (S.cursor) S.cursor.style.opacity = 0; });
    cv.addEventListener('pointerenter', () => { if (S.cursor) S.cursor.style.opacity = 1; });
    addEventListener('keydown', e => { if (!root || root.hidden || document.querySelector('dialog[open]')) return; if (e.key === 'Escape' && panelKind) { closePanel(); return; } if (panelKind) return; const i = nearest(); if (e.key === 'ArrowRight' || e.key === 'PageDown') goTo(Math.min(STATIONS.length - 1, i + 1)); if (e.key === 'ArrowLeft' || e.key === 'PageUp') goTo(Math.max(0, i - 1)); });
  }
  const nearest = () => Math.round(S.pos / GAP);
  function moveCursor(e) {
    if (!S.cursor) { S.cursor = document.createElement('div'); S.cursor.className = 'rm-cursor'; S.cursor.innerHTML = '<i></i><b></b><span></span>'; root.append(S.cursor); S.coord = S.cursor.querySelector('span'); }
    S.cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  }
  function cursorPulse() { if (!S.cursor) return; S.cursor.classList.remove('pulse'); void S.cursor.offsetWidth; S.cursor.classList.add('pulse'); }
  function onResize() { if (!S) return; const w = innerWidth, h = innerHeight; S.narrow = small(); S.renderer.setSize(w, h, false); S.composer.setSize(w, h); S.cam.aspect = w / h; S.cam.fov = S.narrow ? 62 : 50; S.cam.position.z = S.narrow ? 15 : 9; S.cam.updateProjectionMatrix(); }
  function pick(e) { S.ray.setFromCamera({ x: (e.clientX / innerWidth) * 2 - 1, y: -(e.clientY / innerHeight) * 2 + 1 }, S.cam); const h = S.ray.intersectObjects(S.frames.filter(f => f.visible).map(f => f.userData.plane))[0]; if (!h) return null; let o = h.object; while (o && !S.frames.includes(o)) o = o.parent; return o; }
  function setHover(f, e) {
    S.hover = f; S.cursor && S.cursor.classList.toggle('hot', !!f);
    const st = f && STATIONS[f.userData.goto != null ? f.userData.goto : f.userData.st];
    if (st && e) { S.tip.hidden = false; S.tip.textContent = st.key ? `${L(st.title)} · ${tr('打开', 'open')} ↗` : L(st.title); S.tip.style.transform = `translate(${e.clientX + 16}px,${e.clientY + 14}px)`; } else S.tip.hidden = true;
  }
  function openFrame(f) {
    if (f.userData.goto != null) { goTo(f.userData.goto); return; }
    const st = STATIONS[f.userData.st];
    if (Math.abs(S.target - st.x) > 0.5) { S.target = st.x; return; }
    if (st.key) openW(st.key); else if (st.cards) openPanel('thinking'); else if (st.portrait) openPanel('about');
  }

  function start() {
    running = true; S.videos.forEach(v => v.play().catch(() => {}));
    const clock = new S.T.Clock();
    const loop = () => {
      if (!running || !S) return; rafId = requestAnimationFrame(loop);
      const t = clock.getElapsedTime(), { cam, mouse } = S;
      S.pos += (S.target - S.pos) * 0.075;
      cam.position.x += (S.pos + mouse.x * 0.6 - cam.position.x) * 0.08;
      cam.position.y += (0.4 - mouse.y * 0.35 - cam.position.y) * 0.08;
      if (S.narrow) cam.lookAt(S.pos + 5 + mouse.x * 0.3, -2.2, -3); else cam.lookAt(S.pos + 1.6 + mouse.x * 0.4, 0.1, -3);
      S.rings.position.x = S.pos * 0.92;
      S.clockT = t; S.uniforms.uTime.value = t;
      if (S.px != null) {
        S.ray.setFromCamera({ x: (S.px / innerWidth) * 2 - 1, y: -(S.py / innerHeight) * 2 + 1 }, cam);
        const o = S.ray.ray.origin, dir = S.ray.ray.direction, k = (-6 - o.z) / dir.z;
        S.world.set(o.x + dir.x * k, o.y + dir.y * k, -6);
        S.uniforms.uMouse.value.lerp(S.world, 0.18); S.halo.position.copy(S.uniforms.uMouse.value); S.halo.material.opacity += (0.55 - S.halo.material.opacity) * 0.05;
        if (S.coord) S.coord.textContent = (S.world.x / 100).toFixed(8).replace('-', '') + ' · ' + Math.abs(S.world.y / 10).toFixed(6);
      }
      S.uniforms.uRip.value.w = S.ripAt < 0 ? -1 : t - S.ripAt;
      S.frames.forEach(f => {
        f.position.y = f.userData.base + Math.sin(t * 0.6 + f.userData.phase) * 0.06;
        f.rotation.y += (f.userData.ry + mouse.x * 0.14 - f.rotation.y) * 0.06; f.rotation.x += (mouse.y * 0.08 - f.rotation.x) * 0.06;
        // keep the caption side clear: prints fade in from the right and out before they pass under the text
        const d = f.position.x - S.pos, op = S.narrow ? Math.max(0, Math.min(1, (d + 1) / 2.5, (12 - d) / 2.5)) : Math.max(0, Math.min(1, (d - 0.5) / 2.2, (16 - d) / 3)), U = f.userData;
        // looked at → whole; nearby → mostly there, edges loose; passed by → scattered
        const here = Math.abs(f.position.x - (S.pos + 5)) < 7.5;
        const want = !here ? 0 : S.hover === f ? 1 : U.main ? 0.92 : 0.88;
        U.a += (want - U.a) * (want > U.a ? 0.035 : 0.02);
        if (U.a > 0.6) U.seen = true;
        if (U.seen && U.a < 0.05) { U.seen = false; for (let k = 0; k < 5; k++) U.res[k] = (Math.random() - 0.5) * 0.07 * U.u.uH.value; if (U.main) Sound.forget(); }
        U.u.uA.value = U.a; U.u.uOp.value = op; U.u.uTime.value = t;
        f.visible = op > 0.01;
      });
      const mu = S.uniforms.uMouse.value; S.nums.forEach((n, i) => { const near = Math.max(0, 1 - Math.hypot(n.position.x - mu.x, n.position.y - mu.y) / 4); n.material.opacity = 0.2 + 0.3 * Math.abs(Math.sin(t * 0.7 + i)) + near * 0.6; });
      const i = nearest(); if (i !== S.cur) { S.cur = i; caption(i); }
      S.composer.render();
    };
    loop();
  }

  // old deep links (?view=work / ?view=contact) land on the matching panel
  if (wantRoom()) showRoom().then(() => { const v = q.get('view'); if (v === 'contact') openPanel('contact'); else if (v === 'work' && !q.has('project')) openPanel('work'); });
})();
