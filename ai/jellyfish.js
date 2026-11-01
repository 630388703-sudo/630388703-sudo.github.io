/* Mechanical Medusa — a jellyfish built entirely from code (three.js r128).
   Every part registers an exploded pose; one value (explode) moves the whole creature between assembled and taken apart. */
(() => {
  const T = THREE;
  const q = new URLSearchParams(location.search);
  const STILL = q.has('still');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // language
  const setLang = l => { document.documentElement.lang = l === 'en' ? 'en' : 'zh-CN'; document.querySelectorAll('[data-l]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === l))); try { localStorage.setItem('dsy.lang', l); } catch {} };
  let lang0 = 'zh'; try { lang0 = q.get('lang') || localStorage.getItem('dsy.lang') || 'zh'; } catch {}
  setLang(lang0); document.querySelectorAll('[data-l]').forEach(b => b.onclick = () => setLang(b.dataset.l));
  if (STILL) { document.body.classList.add('still'); document.getElementById('load').remove(); }

  // renderer, scene, camera
  const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: STILL });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  document.body.prepend(renderer.domElement);
  const scene = new T.Scene(); scene.background = new T.Color(0x030305); scene.fog = new T.FogExp2(0x030305, 0.035);
  const cam = new T.PerspectiveCamera(38, 1, 0.1, 100); cam.position.set(6.2, 2.6, 8.4);
  const controls = new T.OrbitControls(cam, renderer.domElement);
  controls.target.set(0, -0.4, 0); controls.enableDamping = true; controls.dampingFactor = 0.06; controls.minDistance = 4.5; controls.maxDistance = 18; controls.enablePan = false;
  controls.autoRotate = !reduced && !STILL; controls.autoRotateSpeed = 0.45;

  // a soft studio environment painted on a canvas, so metal has something to reflect
  const envCanvas = document.createElement('canvas'); envCanvas.width = 1024; envCanvas.height = 512;
  { const g = envCanvas.getContext('2d'); const sky = g.createLinearGradient(0, 0, 0, 512); sky.addColorStop(0, '#20263a'); sky.addColorStop(0.5, '#0a0c14'); sky.addColorStop(1, '#030305'); g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
    [[180, 120, 220, 70, 'rgba(255,248,235,.95)'], [640, 90, 160, 60, 'rgba(160,190,255,.9)'], [860, 260, 120, 160, 'rgba(126,166,255,.7)'], [380, 300, 90, 120, 'rgba(255,220,190,.5)']].forEach(([x, y, w, h, c]) => { const r = g.createRadialGradient(x, y, 0, x, y, Math.max(w, h)); r.addColorStop(0, c); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(x - w * 1.5, y - h * 1.5, w * 3, h * 3); }); }
  const envTex = new T.CanvasTexture(envCanvas); envTex.mapping = T.EquirectangularReflectionMapping; envTex.encoding = T.sRGBEncoding;
  const pmrem = new T.PMREMGenerator(renderer); scene.environment = pmrem.fromEquirectangular(envTex).texture;

  // lights
  scene.add(new T.HemisphereLight(0x8fa8ff, 0x0a0a12, 0.5));
  const key = new T.DirectionalLight(0xfff1e0, 1.6); key.position.set(5, 8, 6); scene.add(key);
  const rim = new T.DirectionalLight(0x7ea6ff, 1.8); rim.position.set(-6, 2, -6); scene.add(rim);
  const coreLight = new T.PointLight(0x7ea6ff, 1.6, 6); coreLight.position.set(0, 1.1, 0); scene.add(coreLight);

  // materials
  const M = {
    steel: new T.MeshStandardMaterial({ color: 0xc9ced8, metalness: 1, roughness: 0.28 }),
    dark: new T.MeshStandardMaterial({ color: 0x2b2f3a, metalness: 0.9, roughness: 0.4 }),
    brass: new T.MeshStandardMaterial({ color: 0xd6b47a, metalness: 1, roughness: 0.32 }),
    ceramic: new T.MeshStandardMaterial({ color: 0xeef0f4, metalness: 0.1, roughness: 0.35 }),
    glass: new T.MeshPhysicalMaterial({ color: 0xbfd3ff, metalness: 0, roughness: 0.08, transparent: true, opacity: 0.2, side: T.DoubleSide, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.1 }),
    glow: new T.MeshStandardMaterial({ color: 0x7ea6ff, emissive: 0x7ea6ff, emissiveIntensity: 1.1, metalness: 0, roughness: 0.4 }),
    glowSoft: new T.MeshStandardMaterial({ color: 0x9fbcff, emissive: 0x5b82e6, emissiveIntensity: 1.2, metalness: 0.2, roughness: 0.4 }),
  };

  // every part: an assembled pose and an exploded pose
  const jelly = new T.Group(); scene.add(jelly);
  const parts = [];
  const part = (mesh, { off = [0, 0, 0], rot = [0, 0, 0], delay = 0, parent = jelly } = {}) => {
    parent.add(mesh);
    mesh.userData.base = { p: mesh.position.clone(), r: mesh.rotation.clone() };
    mesh.userData.ex = { p: new T.Vector3(...off), r: new T.Euler(...rot) };
    mesh.userData.delay = delay; parts.push(mesh); return mesh;
  };
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ── bell: eight glass petals with steel ribs ──
  const R = 2, TH = 1.22, PET = 8;
  for (let k = 0; k < PET; k++) {
    const phi = (k / PET) * Math.PI * 2, dir = new T.Vector3(Math.sin(phi + Math.PI / PET), 0, Math.cos(phi + Math.PI / PET));
    const petal = new T.Mesh(new T.SphereGeometry(R, 24, 18, phi, Math.PI * 2 / PET * 0.985, 0, TH), M.glass);
    part(petal, { off: [dir.x * 1.9, 2.4, dir.z * 1.9], rot: [dir.z * 0.6, 0, -dir.x * 0.6], delay: 0 });
  }
  for (let k = 0; k < 16; k++) {
    const phi = (k / 16) * Math.PI * 2, pts = [];
    for (let i = 0; i <= 24; i++) { const th = (i / 24) * TH; pts.push(new T.Vector3(Math.sin(th) * Math.sin(phi) * (R + 0.02), Math.cos(th) * (R + 0.02), Math.sin(th) * Math.cos(phi) * (R + 0.02))); }
    const rib = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, k % 2 ? 0.018 : 0.03, 6), k % 2 ? M.steel : M.dark);
    const d = new T.Vector3(Math.sin(phi), 0, Math.cos(phi));
    part(rib, { off: [d.x * 2.6, 2.0, d.z * 2.6], rot: [d.z * 0.5, 0, -d.x * 0.5], delay: 0.06 });
  }
  const cap = new T.Mesh(new T.CylinderGeometry(0.22, 0.32, 0.18, 24), M.steel); cap.position.y = R + 0.06; part(cap, { off: [0, 3.4, 0], delay: 0.02 });
  const capGlow = new T.Mesh(new T.SphereGeometry(0.12, 16, 12), M.glow); capGlow.position.y = R + 0.2; part(capGlow, { off: [0, 3.8, 0], delay: 0.02 });

  // ── rim: a ring and 32 hinged plates ──
  const rimR = Math.sin(TH) * R, rimY = Math.cos(TH) * R;
  const ring = new T.Mesh(new T.TorusGeometry(rimR, 0.055, 10, 96), M.brass); ring.rotation.x = Math.PI / 2; ring.position.y = rimY; part(ring, { off: [0, 0.6, 0], delay: 0.1 });
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * Math.PI * 2, d = new T.Vector3(Math.sin(a), 0, Math.cos(a));
    const plate = new T.Mesh(new T.BoxGeometry(0.3, 0.05, 0.22), k % 2 ? M.ceramic : M.steel);
    plate.position.set(d.x * (rimR + 0.08), rimY - 0.04, d.z * (rimR + 0.08)); plate.rotation.y = a; plate.rotation.x = 0.35;
    part(plate, { off: [d.x * rnd(1.4, 2.2), rnd(-0.4, 0.6), d.z * rnd(1.4, 2.2)], rot: [rnd(-2, 2), rnd(-2, 2), rnd(-2, 2)], delay: 0.12 + (k % 8) * 0.01 });
  }

  // ── inside: spine, glowing core, three gears, six pistons ──
  const spine = new T.Mesh(new T.CylinderGeometry(0.09, 0.12, 1.9, 16), M.dark); spine.position.y = 1.05; part(spine, { off: [0, -0.2, 0], delay: 0.3 });
  const core = new T.Mesh(new T.IcosahedronGeometry(0.42, 1), M.glow); core.position.y = 1.15; part(core, { delay: 0.4 });
  const coreCage = new T.Mesh(new T.IcosahedronGeometry(0.56, 1), new T.MeshStandardMaterial({ color: 0xc9ced8, metalness: 1, roughness: 0.3, wireframe: true })); coreCage.position.y = 1.15; part(coreCage, { off: [0, 0, 0], rot: [0.8, 1.2, 0], delay: 0.35 });
  const gearGeo = (r, n, h) => {
    const s = new T.Shape(), depth = 0.11;
    for (let i = 0; i < n * 4; i++) { const a = (i / (n * 4)) * Math.PI * 2, rr = (i % 4 < 2) ? r : r - depth; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
    const hole = new T.Path(); hole.absarc(0, 0, r * 0.32, 0, Math.PI * 2, true); s.holes.push(hole);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, c = new T.Path(); c.absarc(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.13, 0, Math.PI * 2, true); s.holes.push(c); }
    const g = new T.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1, curveSegments: 6 }); g.rotateX(-Math.PI / 2); g.translate(0, -h / 2, 0); return g;
  };
  const gears = [[1.15, 30, 0.08, 0.72, M.brass, 0.25, -1.4], [0.82, 22, 0.1, 1.58, M.steel, -0.4, 1.6], [0.55, 14, 0.12, 1.86, M.brass, 0.7, 2.6]].map(([r, n, h, y, mat, spin, oy], i) => {
    const g = new T.Mesh(gearGeo(r, n, h), mat); g.position.y = y; g.userData.spin = spin; part(g, { off: [0, oy, 0], rot: [i ? 0.4 : -0.4, 0, i ? 0.3 : -0.3], delay: 0.24 + i * 0.04 }); return g;
  });
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3, d = new T.Vector3(Math.sin(a), 0, Math.cos(a));
    const piston = new T.Group(); piston.position.set(d.x * 0.85, 1.15, d.z * 0.85); piston.rotation.y = a;
    const barrel = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.6, 12), M.steel); barrel.rotation.x = Math.PI / 2; piston.add(barrel);
    const rod = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.5, 8), M.ceramic); rod.rotation.x = Math.PI / 2; rod.position.z = 0.45; piston.add(rod);
    const tip = new T.Mesh(new T.SphereGeometry(0.06, 12, 8), M.glowSoft); tip.position.z = 0.72; piston.add(tip);
    part(piston, { off: [d.x * 1.8, rnd(-0.3, 0.3), d.z * 1.8], rot: [rnd(-1, 1), rnd(-1, 1), 0], delay: 0.32 });
  }

  // ── tentacles: ten chains of 24 segments, four oral arms with frills ──
  const tentacles = [];
  const segGeo = new T.CylinderGeometry(0.045, 0.04, 0.15, 10), jointGeo = new T.TorusGeometry(0.052, 0.014, 6, 16), frillGeo = new T.CylinderGeometry(0.16, 0.16, 0.02, 18);
  const chain = (ax, az, n, len, oral) => {
    const segs = [];
    for (let j = 0; j < n; j++) {
      const g = new T.Group();
      const s = new T.Mesh(segGeo, j % 3 === 2 ? M.brass : M.steel); g.add(s);
      const jt = new T.Mesh(jointGeo, M.dark); jt.rotation.x = Math.PI / 2; jt.position.y = 0.08; g.add(jt);
      if (oral && j % 2 === 0) { const f = new T.Mesh(frillGeo, M.glass); f.scale.setScalar(1 - j / (n * 1.4)); g.add(f); }
      if (!oral && j % 6 === 5) { const l = new T.Mesh(new T.SphereGeometry(0.035, 8, 6), M.glow); l.position.y = -0.04; g.add(l); }
      const scale = 1 - (j / n) * 0.55; g.scale.setScalar(scale);
      const out = new T.Vector3(ax, 0, az).normalize();
      part(g, { off: [out.x * (0.7 + j * 0.07) + rnd(-0.08, 0.08), -j * (oral ? 0.1 : 0.13) + rnd(-0.05, 0.05), out.z * (0.7 + j * 0.07) + rnd(-0.08, 0.08)], rot: [rnd(-0.6, 0.6), rnd(-1.5, 1.5), rnd(-0.6, 0.6)], delay: 0.4 + j * 0.012 });
      segs.push(g);
    }
    tentacles.push({ ax, az, segs, len, oral, phase: rnd(0, 6) });
  };
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; chain(Math.sin(a) * rimR * 0.92, Math.cos(a) * rimR * 0.92, 24, 0.15, false); }
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; chain(Math.sin(a) * 0.35, Math.cos(a) * 0.35, 16, 0.17, true); }

  // drifting dust
  const N = 900, P = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { P[i * 3] = rnd(-14, 14); P[i * 3 + 1] = rnd(-8, 8); P[i * 3 + 2] = rnd(-14, 6); }
  const dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(P, 3));
  const dust = new T.Points(dg, new T.PointsMaterial({ color: 0xcfd8ff, size: 0.03, transparent: true, opacity: 0.6, depthWrite: false })); scene.add(dust);

  document.getElementById('nParts').textContent = (() => { let n = 0; jelly.traverse(o => { if (o.isMesh) n++; }); return n; })();

  // post
  const composer = new T.EffectComposer(renderer); composer.addPass(new T.RenderPass(scene, cam));
  const bloom = new T.UnrealBloomPass(new T.Vector2(innerWidth, innerHeight), 0.55, 0.45, 0.82); composer.addPass(bloom);
  const resize = () => { renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight;
    // keep the creature on the right half so the caption has its own side
    if (innerWidth > 760 && !STILL) cam.setViewOffset(innerWidth, innerHeight, -innerWidth * 0.17, 0, innerWidth, innerHeight); else cam.clearViewOffset();
    cam.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);

  // explode control: manual button, or an automatic cycle
  let explode = STILL ? +(q.get('e') ?? 0.38) : 0, target = 0, auto = !reduced && !STILL, cycleAt = 0;
  const btnEx = document.getElementById('explode'), btnAuto = document.getElementById('auto');
  const label = () => { btnEx.innerHTML = target > 0.5 ? '<span class="zh">复原</span><span class="en">Reassemble</span>' : '<span class="zh">拆解</span><span class="en">Explode</span>'; };
  btnEx.onclick = () => { target = target > 0.5 ? 0 : 1; auto = false; btnAuto.setAttribute('aria-pressed', 'false'); label(); };
  btnAuto.onclick = () => { auto = !auto; btnAuto.setAttribute('aria-pressed', String(auto)); cycleAt = clock.getElapsedTime(); };
  if (!auto) btnAuto.setAttribute('aria-pressed', 'false');

  const ease = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const clock = new T.Clock();
  const tmpQ = new T.Quaternion(), tmpE = new T.Euler();
  let frames = 0;

  function tentaclePose(tc, t, e) {
    // a hanging chain that sways; each segment hangs from the previous one
    let x = tc.ax, y = rimY - 0.05 - (tc.oral ? 0.9 : 0), z = tc.az, ang = 0;
    tc.segs.forEach((g, j) => {
      const sway = Math.sin(t * 1.3 - j * 0.32 + tc.phase) * (0.05 + j * 0.012) * (1 - e);
      const outward = (tc.oral ? 0.02 : 0.06) * (1 - j / tc.segs.length);
      ang += sway;
      const dir = new T.Vector3(tc.ax, 0, tc.az).normalize();
      x += dir.x * outward + Math.sin(ang) * 0.04 * dir.z;
      z += dir.z * outward - Math.sin(ang) * 0.04 * dir.x;
      y -= tc.len * Math.cos(ang) * (1 - j / tc.segs.length * 0.3);
      g.userData.base.p.set(x, y, z);
      g.userData.base.r.set(Math.sin(ang) * dir.z * 0.8, 0, -Math.sin(ang) * dir.x * 0.8);
    });
  }

  function frame() {
    const t = clock.getElapsedTime();
    if (auto) { const c = (t - cycleAt) % 14; target = c > 6 && c < 11 ? 1 : 0; label(); }
    if (!STILL) explode += (target - explode) * 0.025;

    // swimming: the bell contracts and the body bobs; quieter while taken apart
    const live = 1 - explode;
    const pulse = reduced ? 0 : Math.sin(t * 1.6);
    jelly.position.y = Math.sin(t * 0.8) * 0.18 * live;
    tentacles.forEach(tc => tentaclePose(tc, t, explode));
    gears.forEach(g => { g.rotation.y += g.userData.spin * 0.01; });
    core.rotation.y = t * 0.6; core.rotation.x = t * 0.3; coreCage.rotation.y = -t * 0.25;
    M.glow.emissiveIntensity = 1.0 + Math.sin(t * 2.2) * 0.35;

    parts.forEach(p => {
      const { base, ex, delay } = p.userData;
      const k = ease(Math.min(1, Math.max(0, (explode * 1.5 - delay) / 0.95)));
      p.position.set(base.p.x + ex.p.x * k, base.p.y + ex.p.y * k, base.p.z + ex.p.z * k);
      tmpE.set(base.r.x + ex.r.x * k, base.r.y + ex.r.y * k, base.r.z + ex.r.z * k); p.rotation.copy(tmpE);
    });
    // bell breathing (applied after the pose so it scales the assembled bell)
    const sy = 1 - pulse * 0.05 * live, sxz = 1 + pulse * 0.04 * live;
    parts.slice(0, PET + 16).forEach(p => { p.scale.set(sxz, sy, sxz); });

    dust.rotation.y = t * 0.01;
    controls.update();
    composer.render();
    if (++frames === 30 && !STILL) { document.getElementById('load').style.opacity = 0; setTimeout(() => document.getElementById('load')?.remove(), 900); window.__ready = true; }
    requestAnimationFrame(frame);
  }
  if (STILL) { cam.position.set(8.4, 2.6, 11.6); }
  frame();
})();
