/* Mechanical Medusa — a jellyfish built entirely from code (three.js r128).
   Every part registers an exploded pose; one value (explode) moves the whole creature between assembled and taken apart. */
(() => {
  const T = THREE;
  const q = new URLSearchParams(location.search);
  const STILL = q.has('still');
  const CUT = STILL && q.has('cut'); // transparent background, for placing the creature inside other scenes
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // language
  const setLang = l => { document.documentElement.lang = l === 'en' ? 'en' : 'zh-CN'; document.querySelectorAll('[data-l]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === l))); try { localStorage.setItem('dsy.lang', l); } catch {} };
  let lang0 = 'zh'; try { lang0 = q.get('lang') || localStorage.getItem('dsy.lang') || 'zh'; } catch {}
  setLang(lang0); document.querySelectorAll('[data-l]').forEach(b => b.onclick = () => setLang(b.dataset.l));
  if (STILL) { document.body.classList.add('still'); document.getElementById('load').remove(); }

  // renderer, scene, camera
  const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: STILL, alpha: CUT });
  if (CUT) { renderer.setClearColor(0x000000, 0); document.documentElement.style.background = document.body.style.background = 'transparent'; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.physicallyCorrectLights = false;
  document.body.prepend(renderer.domElement);
  const scene = new T.Scene();
  if (!CUT) { const c = document.createElement('canvas'); c.width = 16; c.height = 512; const g = c.getContext('2d'); const v = g.createLinearGradient(0, 0, 0, 512); v.addColorStop(0, '#eef0f4'); v.addColorStop(0.62, '#d9dce3'); v.addColorStop(1, '#b8bcc6'); g.fillStyle = v; g.fillRect(0, 0, 16, 512); const bgT = new T.CanvasTexture(c); bgT.encoding = T.sRGBEncoding; scene.background = bgT; }
  const cam = new T.PerspectiveCamera(38, 1, 0.1, 100); cam.position.set(6.2, 2.6, 8.4);
  const controls = new T.OrbitControls(cam, renderer.domElement);
  controls.target.set(0, -0.4, 0); controls.enableDamping = true; controls.dampingFactor = 0.06; controls.minDistance = 4.5; controls.maxDistance = 18; controls.enablePan = false;
  controls.autoRotate = !reduced && !STILL; controls.autoRotateSpeed = 0.45;

  // a soft studio environment painted on a canvas, so metal has something to reflect
  const envCanvas = document.createElement('canvas'); envCanvas.width = 1024; envCanvas.height = 512;
  { const g = envCanvas.getContext('2d'); const sky = g.createLinearGradient(0, 0, 0, 512); sky.addColorStop(0, '#c9ccd4'); sky.addColorStop(0.5, '#9a9ea8'); sky.addColorStop(1, '#3a3d45'); g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
    // softboxes: a big key, a strip on each side, a top light
    [[230, 150, 170, 90, 'rgba(255,255,255,1)'], [700, 120, 110, 160, 'rgba(255,255,255,.95)'], [920, 230, 60, 200, 'rgba(235,242,255,.9)'], [512, 20, 260, 40, 'rgba(255,255,255,.9)']].forEach(([x, y, w, h, c]) => { g.fillStyle = c; g.filter = 'blur(18px)'; g.fillRect(x - w / 2, y - h / 2, w, h); }); g.filter = 'none'; }
  const envTex = new T.CanvasTexture(envCanvas); envTex.mapping = T.EquirectangularReflectionMapping; envTex.encoding = T.sRGBEncoding;
  const pmrem = new T.PMREMGenerator(renderer); scene.environment = pmrem.fromEquirectangular(envTex).texture;

  // lights: warm key with soft shadow, cool fill, white rim
  scene.add(new T.HemisphereLight(0xffffff, 0x6d727e, 0.38));
  const key = new T.DirectionalLight(0xfff4e8, 2.6); key.position.set(5, 9, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -9, near: 1, far: 30 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; scene.add(key);
  const fill = new T.DirectionalLight(0xdfe8ff, 0.4); fill.position.set(-7, 3, 4); scene.add(fill);
  const rim = new T.DirectionalLight(0xffffff, 1.6); rim.position.set(-3, 5, -8); scene.add(rim);
  const coreLight = new T.PointLight(0x7ea6ff, 1.2, 5); coreLight.position.set(0, 1.1, 0); scene.add(coreLight);
  const ground = new T.Mesh(new T.PlaneGeometry(60, 60), new T.ShadowMaterial({ opacity: 0.16 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -6.4; ground.receiveShadow = true; if (!CUT) scene.add(ground);

  // materials
  const M = {
    steel: new T.MeshStandardMaterial({ color: 0xd3d8e2, metalness: 1, roughness: 0.2, envMapIntensity: 1.2 }),
    dark: new T.MeshStandardMaterial({ color: 0x2b2f3a, metalness: 0.9, roughness: 0.4 }),
    brass: new T.MeshStandardMaterial({ color: 0xd9b27a, metalness: 1, roughness: 0.26, envMapIntensity: 1.1 }),
    rubber: new T.MeshStandardMaterial({ color: 0x15171f, metalness: 0.2, roughness: 0.6 }),
    ceramic: new T.MeshPhysicalMaterial({ color: 0xf3f3f1, metalness: 0, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.22 }),
    shell: new T.MeshPhysicalMaterial({ color: 0xf4f4f2, metalness: 0, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.18, side: T.DoubleSide }),
    graphite: new T.MeshStandardMaterial({ color: 0x2a2d35, metalness: 0.6, roughness: 0.38 }),
    blue: new T.MeshStandardMaterial({ color: 0x3f6fe6, metalness: 0.6, roughness: 0.28 }),
    window: new T.MeshPhysicalMaterial({ color: 0x141a26, metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.82, clearcoat: 1, side: T.DoubleSide, depthWrite: false }),
    bead: new T.MeshPhysicalMaterial({ color: 0xcfe0ff, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.55, clearcoat: 1 }),
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

  // ── bell: eight sectors × three bands of ceramic panels with real seams; the middle band is a tinted window ──
  const R = 2, TH = 1.22, PET = 8;
  const BANDS = [[0.0, 0.36], [0.38, 0.38], [0.79, TH - 0.79]];
  const SEAM = 0.035, bolt = new T.CylinderGeometry(0.022, 0.022, 0.03, 10), ventG = new T.BoxGeometry(0.16, 0.035, 0.04);
  const onSphere = (th, ph, r = R) => new T.Vector3(Math.sin(th) * Math.sin(ph) * r, Math.cos(th) * r, Math.sin(th) * Math.cos(ph) * r);
  for (let k = 0; k < PET; k++) {
    const phi = (k / PET) * Math.PI * 2, dw = Math.PI * 2 / PET, mid = phi + dw / 2;
    const dir = new T.Vector3(Math.sin(mid), 0, Math.cos(mid));
    BANDS.forEach(([t0, tl], b) => {
      const panel = new T.Group();
      const isWin = b === 1;
      panel.add(new T.Mesh(new T.SphereGeometry(R, 20, 8, phi + SEAM / 2, dw - SEAM, t0 + (b ? SEAM / 2 : 0), tl - SEAM / 2), isWin ? M.window : M.shell));
      if (!isWin) panel.add(new T.Mesh(new T.SphereGeometry(R * 0.972, 20, 8, phi + SEAM / 2, dw - SEAM, t0 + (b ? SEAM / 2 : 0), tl - SEAM / 2), M.graphite));
      if (b === 2) for (let v = 0; v < 3; v++) { const vt = new T.Mesh(ventG, M.graphite); vt.position.copy(onSphere(t0 + tl * (0.3 + v * 0.18), mid, R + 0.012)); vt.lookAt(0, vt.position.y * 0.2, 0); vt.rotateY(Math.PI / 2); panel.add(vt); }
      if (b !== 1) [phi + 0.07, phi + dw - 0.07].forEach(ph => { const bl = new T.Mesh(bolt, M.steel); bl.position.copy(onSphere(t0 + tl - 0.06, ph, R + 0.01)); bl.lookAt(0, 0, 0); bl.rotateX(Math.PI / 2); panel.add(bl); });
      part(panel, { off: [dir.x * (1.5 + b * 0.5), 2.6 - b * 0.7, dir.z * (1.5 + b * 0.5)], rot: [dir.z * (0.5 + b * 0.15), 0, -dir.x * (0.5 + b * 0.15)], delay: b * 0.03 });
    });
  }
  // eight blue ribs sit in the seams between the sectors
  for (let k = 0; k < PET; k++) {
    const phi = (k / PET) * Math.PI * 2, pts = [];
    for (let i = 0; i <= 24; i++) pts.push(onSphere((i / 24) * TH, phi, R + 0.015));
    const rib = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 48, 0.03, 8), M.blue);
    const d = new T.Vector3(Math.sin(phi), 0, Math.cos(phi));
    part(rib, { off: [d.x * 2.6, 2.0, d.z * 2.6], rot: [d.z * 0.5, 0, -d.x * 0.5], delay: 0.06 });
  }
  const capGeo = new T.LatheGeometry([[0, 0], [0.34, 0], [0.34, 0.04], [0.26, 0.08], [0.24, 0.16], [0.16, 0.2], [0.1, 0.27], [0, 0.29]].map(([x, y]) => new T.Vector2(x, y)), 32);
  const cap = new T.Mesh(capGeo, M.steel); cap.position.y = R - 0.02; part(cap, { off: [0, 3.4, 0], delay: 0.02 });
  const capGlow = new T.Mesh(new T.SphereGeometry(0.08, 16, 12), M.glow); capGlow.position.y = R + 0.3; part(capGlow, { off: [0, 3.8, 0], delay: 0.02 });

  // ── rim: a brass ring, 32 bevelled plates, light beads between them ──
  const rimR = Math.sin(TH) * R, rimY = Math.cos(TH) * R;
  const ring = new T.Mesh(new T.TorusGeometry(rimR, 0.06, 14, 128), M.graphite); ring.rotation.x = Math.PI / 2; ring.position.y = rimY; part(ring, { off: [0, 0.6, 0], delay: 0.1 });
  const ring2 = new T.Mesh(new T.TorusGeometry(rimR + 0.04, 0.016, 8, 128), M.steel); ring2.rotation.x = Math.PI / 2; ring2.position.y = rimY - 0.07; part(ring2, { off: [0, 0.3, 0], delay: 0.11 });
  const plateGeo = (() => { const w = 0.15, h = 0.11, r = 0.03, sh = new T.Shape(); sh.moveTo(-w + r, -h); sh.lineTo(w - r, -h); sh.quadraticCurveTo(w, -h, w, -h + r); sh.lineTo(w, h - r); sh.quadraticCurveTo(w, h, w - r, h); sh.lineTo(-w + r, h); sh.quadraticCurveTo(-w, h, -w, h - r); sh.lineTo(-w, -h + r); sh.quadraticCurveTo(-w, -h, -w + r, -h);
    const g = new T.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 4 }); g.rotateX(-Math.PI / 2); return g; })();
  const beadGeo = new T.SphereGeometry(0.026, 12, 10);
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * Math.PI * 2, d = new T.Vector3(Math.sin(a), 0, Math.cos(a));
    const plate = new T.Mesh(plateGeo, k % 4 === 0 ? M.blue : M.ceramic);
    plate.position.set(d.x * (rimR + 0.1), rimY - 0.05, d.z * (rimR + 0.1)); plate.rotation.y = a; plate.rotation.x = 0.42;
    part(plate, { off: [d.x * rnd(1.4, 2.2), rnd(-0.4, 0.6), d.z * rnd(1.4, 2.2)], rot: [rnd(-2, 2), rnd(-2, 2), rnd(-2, 2)], delay: 0.12 + (k % 8) * 0.01 });
    const a2 = a + Math.PI / 32, d2 = new T.Vector3(Math.sin(a2), 0, Math.cos(a2));
    const bead = new T.Mesh(beadGeo, M.glow); bead.position.set(d2.x * (rimR + 0.02), rimY - 0.08, d2.z * (rimR + 0.02));
    part(bead, { off: [d2.x * 1.2, -0.3, d2.z * 1.2], delay: 0.14 });
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
  const gears = [[1.15, 30, 0.08, 0.72, M.graphite, 0.25, -1.4], [0.82, 22, 0.1, 1.58, M.steel, -0.4, 1.6], [0.55, 14, 0.12, 1.86, M.blue, 0.7, 2.6]].map(([r, n, h, y, mat, spin, oy], i) => {
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

  // gyroscope rings around the core, and cables from the core to the rim
  const gyros = [0.7, 0.78, 0.86].map((r, i) => { const g = new T.Mesh(new T.TorusGeometry(r, 0.012, 8, 96), i === 1 ? M.brass : M.steel); g.position.y = 1.15; g.userData.axis = [[1, 0.2, 0], [0.2, 1, 0.4], [0, 0.4, 1]][i]; part(g, { off: [0, 0, 0], rot: [i * 0.8, i * 0.5, 0], delay: 0.36 }); return g; });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + 0.13, d = new T.Vector3(Math.sin(a), 0, Math.cos(a));
    const p0 = new T.Vector3(d.x * 0.3, 1.0, d.z * 0.3), p3 = new T.Vector3(d.x * (rimR - 0.12), rimY + 0.02, d.z * (rimR - 0.12));
    const curve = new T.CubicBezierCurve3(p0, new T.Vector3(d.x * 0.7, 0.55, d.z * 0.7), new T.Vector3(d.x * 1.3, 0.45, d.z * 1.3), p3);
    const cable = new T.Mesh(new T.TubeGeometry(curve, 32, 0.014, 6), M.rubber);
    part(cable, { off: [d.x * 1.1, -0.5, d.z * 1.1], rot: [rnd(-0.4, 0.4), 0, rnd(-0.4, 0.4)], delay: 0.28 });
  }

  // ── tentacles: twelve chains of vertebrae with fins and light, four oral arms with ruffled frills ──
  const tentacles = [];
  const vert = new T.LatheGeometry([[0, -0.07], [0.05, -0.07], [0.066, -0.05], [0.045, -0.02], [0.042, 0.02], [0.066, 0.05], [0.05, 0.07], [0, 0.07]].map(([x, y]) => new T.Vector2(x, y)), 16);
  const armour = new T.CylinderGeometry(0.085, 0.078, 0.1, 18, 1, true, -Math.PI * 0.62, Math.PI * 1.24);
  const jointRing = new T.TorusGeometry(0.05, 0.012, 8, 20);
  const beadSm = new T.SphereGeometry(0.03, 10, 8);
  const finGeo = (() => { const sh = new T.Shape(); sh.moveTo(0, -0.05); sh.quadraticCurveTo(0.14, 0, 0, 0.06); sh.lineTo(0, -0.05); const g = new T.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: false }); g.translate(0.03, 0, -0.003); return g; })();
  const frillGeo = (() => { const g = new T.RingGeometry(0.04, 0.2, 48, 2); const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), a = Math.atan2(y, x), r = Math.hypot(x, y); pa.setZ(i, Math.sin(a * 9) * 0.035 * (r / 0.2)); } g.computeVertexNormals(); g.rotateX(-Math.PI / 2); return g; })();
  const chain = (ax, az, n, len, oral) => {
    const segs = [];
    for (let j = 0; j < n; j++) {
      const g = new T.Group();
      g.add(new T.Mesh(vert, M.graphite));
      if (!oral && j % 2 === 0) { const a = new T.Mesh(armour, M.shell); a.rotation.y = (j % 4) * Math.PI / 2; g.add(a); }
      const jr = new T.Mesh(jointRing, j % 5 === 4 ? M.glow : M.blue); jr.rotation.x = Math.PI / 2; jr.position.y = 0.08; g.add(jr);
      if (oral && j % 2 === 0) { const f = new T.Mesh(frillGeo, M.glass); f.scale.setScalar(1.15 - j / (n * 1.2)); g.add(f); }
      if (!oral && j % 4 === 1) { const f = new T.Mesh(finGeo, M.ceramic); f.rotation.y = (j % 8 === 1 ? 0 : Math.PI); g.add(f); }
      g.scale.setScalar(1 - (j / n) * 0.6);
      const out = new T.Vector3(ax, 0, az).normalize();
      part(g, { off: [out.x * (0.7 + j * 0.07) + rnd(-0.08, 0.08), -j * (oral ? 0.1 : 0.13) + rnd(-0.05, 0.05), out.z * (0.7 + j * 0.07) + rnd(-0.08, 0.08)], rot: [rnd(-0.6, 0.6), rnd(-1.5, 1.5), rnd(-0.6, 0.6)], delay: 0.4 + j * 0.011 });
      segs.push(g);
    }
    tentacles.push({ ax, az, segs, len, oral, phase: rnd(0, 6) });
  };
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; chain(Math.sin(a) * rimR * 0.92, Math.cos(a) * rimR * 0.92, 28, 0.135, false); }
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; chain(Math.sin(a) * 0.35, Math.cos(a) * 0.35, 18, 0.16, true); }

  // drifting dust
  const N = 900, P = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { P[i * 3] = rnd(-14, 14); P[i * 3 + 1] = rnd(-8, 8); P[i * 3 + 2] = rnd(-14, 6); }
  const dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(P, 3));
  const dust = new T.Points(dg, new T.PointsMaterial({ color: 0xcfd8ff, size: 0.03, transparent: true, opacity: 0.6, depthWrite: false })); scene.add(dust);

  const shaftTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d'); const v = g.createLinearGradient(0, 0, 0, 256); v.addColorStop(0, 'rgba(126,166,255,.35)'); v.addColorStop(1, 'rgba(126,166,255,0)'); g.fillStyle = v; g.fillRect(0, 0, 64, 256); const h = g.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.5, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = h; g.fillRect(0, 0, 64, 256); return new T.CanvasTexture(c); })();
  const shaft = new T.Mesh(new T.PlaneGeometry(7, 16), new T.MeshBasicMaterial({ map: shaftTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.5 })); shaft.position.set(0, 5, -4); scene.add(shaft);
  const NB = 140, BP = new Float32Array(NB * 3), BS = new Float32Array(NB);
  for (let i = 0; i < NB; i++) { BP[i * 3] = rnd(-2.5, 2.5); BP[i * 3 + 1] = rnd(-6, 5); BP[i * 3 + 2] = rnd(-2.5, 2.5); BS[i] = rnd(0.004, 0.012); }
  const bg = new T.BufferGeometry(); bg.setAttribute('position', new T.BufferAttribute(BP, 3));
  const bubbleTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); g.strokeStyle = 'rgba(220,232,255,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(16, 16, 12, 0, 7); g.stroke(); return new T.CanvasTexture(c); })();
  const bubbles = new T.Points(bg, new T.PointsMaterial({ map: bubbleTex, size: 0.09, transparent: true, opacity: 0.55, depthWrite: false })); scene.add(bubbles);
  jelly.traverse(o => { if (o.isMesh && o.material !== M.window && o.material !== M.glass) { o.castShadow = true; } });
  shaft.visible = false; dust.visible = false; bubbles.material.opacity = 0.25;
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
    gyros.forEach((g, i) => { const [ax, ay, az] = g.userData.axis, sp = 0.006 * (i + 1); g.userData.base.r.set(g.userData.base.r.x + ax * sp, g.userData.base.r.y + ay * sp, g.userData.base.r.z + az * sp); });
    { const a = bubbles.geometry.attributes.position; for (let i = 0; i < a.count; i++) { a.array[i * 3 + 1] += BS[i]; a.array[i * 3] += Math.sin(t + i) * 0.0015; if (a.array[i * 3 + 1] > 5) a.array[i * 3 + 1] = -6; } a.needsUpdate = true; }
    M.glow.emissiveIntensity = 1.0 + Math.sin(t * 2.2) * 0.35;

    parts.forEach(p => {
      const { base, ex, delay } = p.userData;
      const k = ease(Math.min(1, Math.max(0, (explode * 1.5 - delay) / 0.95)));
      p.position.set(base.p.x + ex.p.x * k, base.p.y + ex.p.y * k, base.p.z + ex.p.z * k);
      tmpE.set(base.r.x + ex.r.x * k, base.r.y + ex.r.y * k, base.r.z + ex.r.z * k); p.rotation.copy(tmpE);
    });
    // bell breathing (applied after the pose so it scales the assembled bell)
    const sy = 1 - pulse * 0.05 * live, sxz = 1 + pulse * 0.04 * live;
    parts.slice(0, PET * 3 + PET).forEach(p => { p.scale.set(sxz, sy, sxz); });

    dust.rotation.y = t * 0.01;
    controls.update();
    renderer.render(scene, cam);
    if (!STILL && frames < 30) { const f = document.querySelector('#load .ld-fill'), c = document.querySelector('#load .ld-pct'); const pc = Math.round((frames + 1) / 30 * 100); if (f) f.style.width = pc + '%'; if (c) c.textContent = String(pc).padStart(3, '0'); }
    if (++frames === 30 && !STILL) { document.getElementById('load').classList.add('out'); setTimeout(() => document.getElementById('load')?.remove(), 900); window.__ready = true; }
    requestAnimationFrame(frame);
  }
  if (STILL) cam.position.set(8.4, 2.6, 11.6);
  if (CUT) { cam.position.set(6.9, 2.0, 9.7); dust.visible = shaft.visible = bubbles.visible = false; }
  setTimeout(() => { const l = document.getElementById('load'); if (l) { l.classList.add('out'); setTimeout(() => l.remove(), 900); } }, 6000);
  frame();
})();
