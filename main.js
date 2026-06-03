/* =============================================
   SYRA'S PORTFOLIO — main.js
   Handles: Loading, Nav, i18n, Scroll Reveal,
            Parallax, Character, Music
   ============================================= */

/* ── i18n strings ── */
const LANG = {
  en: {
    nav_home:     'HOME',
    nav_about:    'ABOUT',
    nav_projects: 'PROJECTS',
    nav_resume:   'RESUME',
    lang_btn:     '中文',

    hero_greeting: "Hi, I'm",
    hero_name:     'Syra',
    hero_role:     'UX Designer & Interactive Media Student',
    hero_desc:     'Designing meaningful experiences through storytelling, interaction and play.',
    hero_btn1:     'View Projects',
    hero_btn2:     'About Me',
    scroll_hint:   'SCROLL',

    about_label:   'About Me',
    about_title:   "Hello, I'm Syra!",
    about_sub:     'Interactive Media Student',
    about_school:  'Kunming University of Science and Technology City College',
    about_bio:     "I'm a designer who believes that great experiences emerge from the intersection of storytelling, empathy, and play. I craft interactive worlds, UX flows, and visual narratives that invite people to feel, explore, and discover.",
    about_name_display:    'Syra<br><span style="color:var(--coral)">Diao</span>',
    about_sub:             'Interactive Media Student',
    about_skills_label:    'Skills',
    about_skills_list:     ['Figma', 'Blender', 'Photoshop', 'After Effects', 'Procreate', 'HTML/CSS/JS', 'Unity', 'UE5'],
    about_interests_label: 'Interests',
    about_interests_list:  ['UX Design', 'Game Design', 'Interactive Storytelling', 'AI Experience Design'],
    about_resume_btn:      '⬇ Download Resume',

    projects_label: 'My Work',
    projects_title: 'Selected Projects',
    projects_sub:   'A collection of UX, game design, and interactive media work.',
    proj_view:      'View Project →',

    gp_title: 'Growth Pain',
    gp_desc:  'A visual novel exploring emotional growth, social pressure and self-discovery.',
    gp_tags:  ['Visual Novel', 'Game Design', 'Narrative'],

    ai_title: 'Afterimage',
    ai_desc:  'An AI companion narrative game exploring memory, identity and companionship.',
    ai_tags:  ['AI Design', 'Game UX', 'Interaction'],

    sr_title: 'Space Rights',
    sr_desc:  'A VR spatial experience revealing invisible labor through interactive storytelling.',
    sr_tags:  ['VR', 'UX Research', 'Social Design'],

    footer: 'Made with ♥ by Syra Diao · 2024',
    loading_title: "SYRA'S PORTFOLIO",
    loading_sub:   'Loading...',
  },
  zh: {
    nav_home:     '首页',
    nav_about:    '关于',
    nav_projects: '项目',
    nav_resume:   '简历',
    lang_btn:     'EN',

    hero_greeting: '你好，我是',
    hero_name:     'Syra',
    hero_role:     'UX 设计师 & 互动媒体学生',
    hero_desc:     '通过叙事、交互与游戏设计有意义的体验。',
    hero_btn1:     '查看作品',
    hero_btn2:     '关于我',
    scroll_hint:   '向下滑动',

    about_label:   '关于我',
    about_title:   '你好！我是思予',
    about_sub:     '互动媒体专业学生',
    about_school:  '昆明理工大学城市学院',
    about_bio:     '我相信，伟大的体验来自叙事、共情与游戏三者的交汇。我设计互动世界、用户旅程和视觉叙事，让人们感受、探索与发现。',
    about_name_display:    '<span style="color:var(--coral)">刁思予</span>',
    about_sub:             '互动媒体专业学生',
    about_skills_label:    '技能',
    about_skills_list:     ['Figma', 'Blender', 'Photoshop', 'After Effects', 'Procreate', 'HTML/CSS/JS', 'Unity', 'UE5'],
    about_interests_label: '兴趣方向',
    about_interests_list:  ['UX 设计', '游戏设计', '互动叙事', 'AI 体验设计'],
    about_resume_btn:      '⬇ 下载简历',

    projects_label: '我的作品',
    projects_title: '精选项目',
    projects_sub:   '涵盖 UX、游戏设计与互动媒体的作品集。',
    proj_view:      '查看项目 →',

    gp_title: '成长之痛',
    gp_desc:  '一款探索成长、社会压力与自我发现的视觉小说。',
    gp_tags:  ['视觉小说', '游戏设计', '叙事'],

    ai_title: '残像',
    ai_desc:  '一款以 AI 为伴侣的叙事游戏，探索记忆、身份与陪伴。',
    ai_tags:  ['AI 设计', '游戏 UX', '交互'],

    sr_title: '空间权利',
    sr_desc:  '一个 VR 空间体验，通过沉浸式叙事揭示隐形劳动。',
    sr_tags:  ['VR', 'UX 研究', '社会设计'],

    footer: '由 刁思予 用 ♥ 制作 · 2024',
    loading_title: "刁思予的作品集",
    loading_sub:   '加载中...',
  }
};

let currentLang = localStorage.getItem('syra_lang') || 'en';

function t(key) { return LANG[currentLang][key] || key; }

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (LANG[currentLang][key] !== undefined) {
      const val = LANG[currentLang][key];
      if (Array.isArray(val)) {
        const cls = el.dataset.i18nClass || 'tag';
        el.innerHTML = val.map(v => `<span class="${cls}">${v}</span>`).join('');
      } else {
        el.textContent = val;
      }
    }
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (LANG[currentLang][key] !== undefined) el.innerHTML = LANG[currentLang][key];
  });
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.textContent = t('lang_btn');
  });
  localStorage.setItem('syra_lang', currentLang);
}

function toggleLang() {
  currentLang = currentLang === 'en' ? 'zh' : 'en';
  applyLang();
}

/* ── Loading ── */
function initLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  // Apply lang to loading screen
  const title = screen.querySelector('[data-i18n="loading_title"]');
  const sub   = screen.querySelector('[data-i18n="loading_sub"]');
  if (title) title.innerHTML = t('loading_title').replace("SYRA'S", "<span>SYRA'S</span>").replace('刁思予的', '<span>刁思予的</span>');
  if (sub)   sub.textContent = t('loading_sub');

  const bar = screen.querySelector('.progress-bar');
  const pct = screen.querySelector('.progress-pct');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 6 + 2;
    if (p >= 100) { p = 100; clearInterval(iv); }
    if (bar) bar.style.width = p + '%';
    if (pct) pct.textContent = Math.floor(p) + '%';
    if (p >= 100) setTimeout(() => screen.classList.add('hidden'), 400);
  }, 50);
}

/* ── Nav ── */
function initNav() {
  const nav  = document.querySelector('nav');
  const ham  = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  if (ham && links) {
    ham.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html') ||
        (path.includes('index') && href === 'index.html') ||
        (path.includes('about') && href === 'about.html') ||
        (path.includes('projects') && href === 'projects.html')) {
      a.classList.add('active');
    }
  });
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
}

/* ── Parallax ── */
function initParallax() {
  const bg = document.querySelector('.hero-bg');
  if (!bg) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    bg.style.transform = `translateY(${y * 0.3}px)`;
  }, { passive: true });
}

/* ── Character ── */
function initCharacter() {
  const img = document.getElementById('char-img');
  if (!img) return;
  const src_default = img.dataset.default;
  const src_hover   = img.dataset.hover;
  const src_click   = img.dataset.click;
  const hearts = document.getElementById('hearts');
  let clickTimer;

  img.addEventListener('mouseenter', () => img.src = src_hover);
  img.addEventListener('mouseleave', () => { if (img.src !== src_click) img.src = src_default; });
  img.addEventListener('click', () => {
    img.src = src_click;
    spawnHearts();
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => img.src = src_default, 1000);
  });

  function spawnHearts() {
    if (!hearts) return;
    for (let i = 0; i < 5; i++) {
      const h = document.createElement('div');
      h.className = 'heart';
      h.textContent = ['💗','💕','💖','❤️','💓'][Math.floor(Math.random()*5)];
      h.style.left  = (30 + Math.random()*40) + '%';
      h.style.bottom = '60%';
      h.style.animationDelay = (i * 0.1) + 's';
      hearts.appendChild(h);
      setTimeout(() => h.remove(), 1200);
    }
  }
}

/* ── Music ── */
function initMusic() {
  const btn   = document.getElementById('music-btn');
  const audio = document.getElementById('bg-music');
  if (!btn || !audio) return;
  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      btn.classList.add('playing');
      btn.textContent = '🎵';
    } else {
      audio.pause();
      btn.classList.remove('playing');
      btn.textContent = '🎵';
    }
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  initLoading();
  initNav();
  initScrollReveal();
  initParallax();
  initCharacter();
  initMusic();

  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.addEventListener('click', toggleLang);
  });
});
