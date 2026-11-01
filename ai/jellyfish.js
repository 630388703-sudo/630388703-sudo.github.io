/* Mechanical Medusa — a jellyfish built entirely from code (three.js r128), after a reference image:
   a lobed glass bell full of blue-violet light on a silver frame with cyan light lines, a mechanical hub,
   four armoured oral arms wrapped in translucent ribbons, and long glass filaments with glowing tips.
   Every part has an exploded pose; one value (explode) moves the whole creature between assembled and taken apart. */
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

  // ── renderer, studio scene, camera ──
  const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: STILL, alpha: CUT });
  if (CUT) { renderer.setClearColor(0x000000, 0); document.documentElement.style.background = document.body.style.background = 'transparent'; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  document.body.prepend(renderer.domElement);
  const scene = new T.Scene();
  if (!CUT) { const c = document.createElement('canvas'); c.width = 16; c.height = 512; const g = c.getContext('2d'); const v = g.createLinearGradient(0, 0, 0, 512); v.addColorStop(0, '#f6f7fa'); v.addColorStop(0.7, '#eceef3'); v.addColorStop(1, '#d6d9e1'); g.fillStyle = v; g.fillRect(0, 0, 16, 512); const bgT = new T.CanvasTexture(c); bgT.encoding = T.sRGBEncoding; scene.background = bgT; }
  const cam = new T.PerspectiveCamera(34, 1, 0.1, 100); cam.position.set(7.5, 1.2, 12.5);
  const controls = new T.OrbitControls(cam, renderer.domElement);
  controls.target.set(0, -1.7, 0); controls.enableDamping = true; controls.dampingFactor = 0.06; controls.minDistance = 6; controls.maxDistance = 24; controls.enablePan = false;
  controls.autoRotate = !reduced && !STILL; controls.autoRotateSpeed = 0.4;

  // softbox environment for the silver and the glass
  const envCanvas = document.createElement('canvas'); envCanvas.width = 1024; envCanvas.height = 512;
  { const g = envCanvas.getContext('2d'); const sky = g.createLinearGradient(0, 0, 0, 512); sky.addColorStop(0, '#d8dbe3'); sky.addColorStop(0.5, '#a3a8b4'); sky.addColorStop(1, '#2e313a'); g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
    g.filter = 'blur(16px)'; [[230, 140, 190, 90, '#ffffff'], [700, 110, 110, 170, '#ffffff'], [930, 240, 60, 220, '#e8efff'], [512, 18, 300, 40, '#ffffff'], [380, 330, 220, 30, '#9fb4ff']].forEach(([x, y, w, h, c]) => { g.fillStyle = c; g.fillRect(x - w / 2, y - h / 2, w, h); }); g.filter = 'none'; }
  const envTex = new T.CanvasTexture(envCanvas); envTex.mapping = T.EquirectangularReflectionMapping; envTex.encoding = T.sRGBEncoding;
  const pmrem = new T.PMREMGenerator(renderer); scene.environment = pmrem.fromEquirectangular(envTex).texture;

  scene.add(new T.HemisphereLight(0xffffff, 0x8088a0, 0.55));
  const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(5, 10, 7); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -10, near: 1, far: 34 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; scene.add(key);
  const fill = new T.DirectionalLight(0xe4ebff, 0.5); fill.position.set(-8, 2, 5); scene.add(fill);
  const rim = new T.DirectionalLight(0xffffff, 1.4); rim.position.set(-3, 6, -9); scene.add(rim);
  const innerLight = new T.PointLight(0x6f8cff, 2.2, 5); innerLight.position.set(0, 0.6, 0); scene.add(innerLight);
  const ground = new T.Mesh(new T.PlaneGeometry(60, 60), new T.ShadowMaterial({ opacity: 0.12 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -7.6; ground.receiveShadow = true; if (!CUT) scene.add(ground);

  // ── materials ──
  const M = {
    silver: new T.MeshStandardMaterial({ color: 0xc9ccd3, metalness: 1, roughness: 0.22, envMapIntensity: 1.25 }),
    gunmetal: new T.MeshStandardMaterial({ color: 0x5d606a, metalness: 1, roughness: 0.34 }),
    dark: new T.MeshStandardMaterial({ color: 0x23252c, metalness: 0.7, roughness: 0.4 }),
    cyan: new T.MeshStandardMaterial({ color: 0x29c9ff, emissive: 0x00b4ff, emissiveIntensity: 1.6, roughness: 0.3, toneMapped: false }),
    violet: new T.MeshStandardMaterial({ color: 0x9b6bff, emissive: 0x7a3dff, emissiveIntensity: 1.5, roughness: 0.3, toneMapped: false }),
    glass: new T.MeshPhysicalMaterial({ color: 0xeef3ff, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.4, clearcoat: 1, clearcoatRoughness: 0.04, side: T.DoubleSide, depthWrite: false, envMapIntensity: 1.6 }),
    filament: new T.MeshPhysicalMaterial({ color: 0xa9bfe8, metalness: 0.5, roughness: 0.12, transparent: true, opacity: 0.85, clearcoat: 1 }),
  };
  // the light inside the bell: a deep blue haze with bright cyan and violet filaments
  const nebula = (() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d');
    const base = g.createRadialGradient(256, 200, 20, 256, 256, 360); base.addColorStop(0, 'rgba(120,170,255,0.5)'); base.addColorStop(0.55, 'rgba(70,96,220,0.42)'); base.addColorStop(1, 'rgba(150,110,240,0.28)'); g.fillStyle = base; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) { const x = Math.random() * 512, y = Math.random() * 512, r = Math.random() * 2.2; g.fillStyle = Math.random() < 0.6 ? 'rgba(170,240,255,.8)' : 'rgba(205,170,255,.75)'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.lineCap = 'round';
    for (let i = 0; i < 110; i++) { g.strokeStyle = Math.random() < 0.6 ? 'rgba(150,240,255,.8)' : 'rgba(200,160,255,.75)'; g.lineWidth = 0.6 + Math.random() * 1.6; g.shadowColor = g.strokeStyle; g.shadowBlur = 8; g.beginPath(); let x = Math.random() * 512, y = Math.random() * 512; g.moveTo(x, y); for (let k = 0; k < 5; k++) { const nx = x + (Math.random() - 0.5) * 120, ny = y + (Math.random() - 0.5) * 120; g.quadraticCurveTo((x + nx) / 2 + (Math.random() - 0.5) * 60, (y + ny) / 2 + (Math.random() - 0.5) * 60, nx, ny); x = nx; y = ny; } g.stroke(); }
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
  })();
  M.nebula = new T.MeshBasicMaterial({ map: nebula, transparent: true, side: T.DoubleSide, depthWrite: false });
  const ribbonAlpha = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d'); const v = g.createLinearGradient(0, 0, 0, 256); v.addColorStop(0, 'rgba(255,255,255,0.15)'); v.addColorStop(0.15, 'rgba(255,255,255,1)'); v.addColorStop(0.8, 'rgba(255,255,255,0.9)'); v.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = v; g.fillRect(0, 0, 64, 256); const h = g.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,0.8)'); h.addColorStop(0.25, 'rgba(0,0,0,0)'); h.addColorStop(0.75, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,0.8)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = h; g.fillRect(0, 0, 64, 256); return new T.CanvasTexture(c); })();
  M.ribbon = new T.MeshPhysicalMaterial({ color: 0x5c6cff, emissive: 0x5a34ff, emissiveIntensity: 0.85, metalness: 0, roughness: 0.2, transparent: true, opacity: 0.6, alphaMap: ribbonAlpha, side: T.DoubleSide, depthWrite: false, clearcoat: 0.6 });

  // ── every part: an assembled pose and an exploded pose ──
  const jelly = new T.Group(); scene.add(jelly);
  const parts = [];
  const part = (mesh, { off = [0, 0, 0], rot = [0, 0, 0], delay = 0, parent = jelly } = {}) => {
    parent.add(mesh);
    mesh.userData.base = { p: mesh.position.clone(), r: mesh.rotation.clone() };
    mesh.userData.ex = { p: new T.Vector3(...off), r: new T.Euler(...rot) };
    mesh.userData.delay = delay; parts.push(mesh); return mesh;
  };
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ── bell: eight bulging glass lobes on a mushroom profile, each full of light ──
  const R = 2.1, TH = 1.78, LOBES = 8, FLAT = 0.98;
  const profile = th => (1 + 0.1 * Math.sin(th * 1.7)) * (th > 1.35 ? 1 - (th - 1.35) * 0.7 : 1);
  const bellPoint = (th, ph, r = R, bulge = 0) => { const f = profile(th) * (1 + bulge); return new T.Vector3(Math.sin(th) * Math.sin(ph) * r * f, Math.cos(th) * r * f * FLAT + 0.2, Math.sin(th) * Math.cos(ph) * r * f); };
  const lobeGeo = (phi0, dw, r, bulge) => {
    const ws = 22, hs = 30, g = new T.SphereGeometry(1, ws, hs, phi0, dw, 0, TH), pa = g.attributes.position;
    for (let row = 0; row <= hs; row++) for (let col = 0; col <= ws; col++) {
      const i = row * (ws + 1) + col, u = col / ws, th = (row / hs) * TH;
      const b = bulge * Math.sin(Math.PI * u) * Math.pow(Math.sin(Math.PI * Math.min(th / TH, 1)), 0.7);
      const v = bellPoint(th, phi0 + u * dw, r, b); pa.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals(); return g;
  };
  const dw = Math.PI * 2 / LOBES;
  for (let k = 0; k < LOBES; k++) {
    const phi0 = k * dw + 0.012, mid = k * dw + dw / 2, dir = new T.Vector3(Math.sin(mid), 0, Math.cos(mid));
    const lobe = new T.Group();
    lobe.add(new T.Mesh(lobeGeo(phi0, dw - 0.024, R, 0.16), M.glass));
    lobe.add(new T.Mesh(lobeGeo(phi0 + 0.03, dw - 0.084, R * 0.9, 0.08), M.nebula));
    part(lobe, { off: [dir.x * 2.3, 1.3, dir.z * 2.3], rot: [dir.z * 0.5, 0, -dir.x * 0.5], delay: 0 });
  }
  // the silver frame: a rib on every seam, a thin cyan light line along it, and a crown on top
  for (let k = 0; k < LOBES; k++) {
    const ph = k * dw, pts = [], light = [];
    for (let i = 0; i <= 30; i++) { const th = 0.12 + (i / 30) * (TH - 0.12); pts.push(bellPoint(th, ph, R + 0.03)); light.push(bellPoint(th, ph, R + 0.075)); }
    const rib = new T.Group();
    rib.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, 0.055, 10), M.silver));
    rib.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(light.slice(2, 24)), 40, 0.014, 6), M.cyan));
    for (let i = 4; i <= 26; i += 5) { const n = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 0.04, 12), M.gunmetal); n.position.copy(pts[i]).multiplyScalar(1.01); n.lookAt(0, 0.2, 0); n.rotateX(Math.PI / 2); rib.add(n); }
    const d = new T.Vector3(Math.sin(ph), 0, Math.cos(ph));
    part(rib, { off: [d.x * 3.0, 1.0, d.z * 3.0], rot: [d.z * 0.4, 0, -d.x * 0.4], delay: 0.05 });
  }
  const topY = bellPoint(0, 0).y;
  const crown = new T.Group(); crown.position.y = topY - 0.02;
  crown.add(new T.Mesh(new T.CylinderGeometry(0.3, 0.38, 0.12, 32), M.silver));
  const crownLight = new T.Mesh(new T.TorusGeometry(0.22, 0.025, 8, 40), M.cyan); crownLight.rotation.x = Math.PI / 2; crownLight.position.y = 0.07; crown.add(crownLight);
  const crownEye = new T.Mesh(new T.SphereGeometry(0.08, 16, 12), M.cyan); crownEye.position.y = 0.1; crown.add(crownEye);
  part(crown, { off: [0, 2.2, 0], delay: 0.02 });
  // a rim band where the lobes end
  const rimTh = TH - 0.04, rimP = bellPoint(rimTh, 0), rimR = Math.hypot(rimP.x, rimP.z), rimY = rimP.y;
  const rimBand = new T.Mesh(new T.TorusGeometry(rimR, 0.035, 10, 128), M.silver); rimBand.rotation.x = Math.PI / 2; rimBand.position.y = rimY; part(rimBand, { off: [0, 0.4, 0], delay: 0.1 });

  // ── hub under the bell: stacked silver plates with cyan light rings ──
  const hub = new T.Group(); hub.position.y = rimY + 0.25;
  hub.add(new T.Mesh(new T.CylinderGeometry(0.95, 0.8, 0.16, 48), M.silver));
  const hubDark = new T.Mesh(new T.CylinderGeometry(0.78, 0.7, 0.12, 48), M.dark); hubDark.position.y = -0.14; hub.add(hubDark);
  [[0.9, 0.06], [0.74, -0.07]].forEach(([r, y]) => { const ring = new T.Mesh(new T.TorusGeometry(r, 0.022, 8, 80), M.cyan); ring.rotation.x = Math.PI / 2; ring.position.y = y; hub.add(ring); });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, port = new T.Mesh(new T.BoxGeometry(0.1, 0.06, 0.05), M.gunmetal); port.position.set(Math.sin(a) * 0.96, 0, Math.cos(a) * 0.96); port.rotation.y = a; hub.add(port); }
  part(hub, { off: [0, -0.6, 0], delay: 0.3 });
  const spine = new T.Mesh(new T.CylinderGeometry(0.12, 0.16, 1.3, 20), M.gunmetal); spine.position.y = rimY + 0.75; part(spine, { off: [0, 0.8, 0], delay: 0.28 });
  const coreGlow = new T.Mesh(new T.IcosahedronGeometry(0.32, 2), M.cyan); coreGlow.position.y = rimY + 0.9; part(coreGlow, { off: [0, 1.15, 0], delay: 0.3 });

  // ── four armoured oral arms, twisting down, each wrapped by translucent ribbons ──
  const arms = [];
  const segCore = new T.CylinderGeometry(0.08, 0.085, 0.26, 12);
  const plateA = new T.CylinderGeometry(0.16, 0.142, 0.27, 20, 1, true, 0, Math.PI * 1.05);
  const plateB = new T.CylinderGeometry(0.152, 0.136, 0.25, 20, 1, true, Math.PI * 1.08, Math.PI * 0.86);
  const dotG = new T.SphereGeometry(0.025, 8, 6);
  for (let a = 0; a < 4; a++) {
    const ang = a / 4 * Math.PI * 2 + Math.PI / 4, ax = Math.sin(ang) * 0.42, az = Math.cos(ang) * 0.42, n = 26, segs = [];
    for (let j = 0; j < n; j++) {
      const g = new T.Group();
      g.add(new T.Mesh(segCore, M.dark));
      const pA = new T.Mesh(plateA, M.silver); pA.rotation.y = j * 0.12; g.add(pA);
      const pB = new T.Mesh(plateB, M.gunmetal); pB.rotation.y = j * 0.12; g.add(pB);
      if (j % 3 === 1) { const d = new T.Mesh(dotG, M.cyan); d.position.set(Math.sin(j * 0.35) * 0.152, 0, Math.cos(j * 0.35) * 0.152); g.add(d); }
      g.scale.setScalar(1 - (j / n) * 0.55);
      const out = new T.Vector3(ax, 0, az).normalize();
      part(g, { off: [out.x * (0.9 + j * 0.06), -j * 0.06, out.z * (0.9 + j * 0.06)], rot: [rnd(-0.5, 0.5), rnd(-1, 1), rnd(-0.5, 0.5)], delay: 0.38 + j * 0.01 });
      segs.push(g);
    }
    arms.push({ ax, az, ang, segs, phase: a * 1.7 });
  }
  // ribbons: 8 ruffled translucent strips; each follows one arm
  const ribbons = [];
  for (let r = 0; r < 8; r++) {
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 6, 90), M.ribbon); mesh.frustumCulled = false; jelly.add(mesh);
    ribbons.push({ mesh, arm: arms[r % 4], side: r < 4 ? 1 : -1, width: r < 4 ? 0.62 : 0.42, phase: rnd(0, 6), len: r < 4 ? 1 : 0.8 });
  }

  // ── long glass filaments with glowing tips (instanced) ──
  const FIL = 28, FSEG = 50, FLEN = 0.13;
  const filMesh = new T.InstancedMesh(new T.CylinderGeometry(0.011, 0.011, FLEN * 1.05, 6), M.filament, FIL * FSEG); filMesh.castShadow = true; filMesh.frustumCulled = false; jelly.add(filMesh);
  const tipMeshC = new T.InstancedMesh(new T.SphereGeometry(0.045, 12, 10), M.cyan, FIL / 2), tipMeshV = new T.InstancedMesh(new T.SphereGeometry(0.045, 12, 10), M.violet, FIL / 2);
  tipMeshC.frustumCulled = tipMeshV.frustumCulled = false; jelly.add(tipMeshC, tipMeshV);
  const fils = Array.from({ length: FIL }, (_, i) => { const a = i / FIL * Math.PI * 2 + rnd(-0.05, 0.05), rr = rimR * rnd(0.88, 0.98); return { a, x: Math.sin(a) * rr, z: Math.cos(a) * rr, phase: rnd(0, 6), len: rnd(0.75, 1), swing: rnd(0.6, 1.2) }; });

  // ── page bits ──
  let nMeshes = 0; jelly.traverse(o => { if (o.isMesh) nMeshes += o.isInstancedMesh ? o.count : 1; });
  document.getElementById('nParts').textContent = nMeshes;
  jelly.traverse(o => { if (o.isMesh && ![M.glass, M.nebula, M.ribbon].includes(o.material)) o.castShadow = true; });
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight;
    if (innerWidth > 760 && !STILL) cam.setViewOffset(innerWidth, innerHeight, -innerWidth * 0.17, 0, innerWidth, innerHeight); else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  };
  resize(); addEventListener('resize', resize);

  // ── explode control ──
  let explode = STILL ? +(q.get('e') ?? 0.38) : 0, target = 0, auto = !reduced && !STILL, cycleAt = 0;
  const btnEx = document.getElementById('explode'), btnAuto = document.getElementById('auto');
  const label = () => { btnEx.innerHTML = target > 0.5 ? '<span class="zh">复原</span><span class="en">Reassemble</span>' : '<span class="zh">拆解</span><span class="en">Explode</span>'; };
  btnEx.onclick = () => { target = target > 0.5 ? 0 : 1; auto = false; btnAuto.setAttribute('aria-pressed', 'false'); label(); };
  btnAuto.onclick = () => { auto = !auto; btnAuto.setAttribute('aria-pressed', String(auto)); cycleAt = clock.getElapsedTime(); };
  if (!auto) btnAuto.setAttribute('aria-pressed', 'false');

  const ease = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const stage = (e, delay) => ease(Math.min(1, Math.max(0, (e * 1.5 - delay) / 0.95)));
  const clock = new T.Clock(), dummy = new T.Object3D(), up = new T.Vector3(0, 1, 0), tmpQ = new T.Quaternion();
  let frames = 0;

  function armPose(arm, t, e) {
    const live = 1 - e, out = new T.Vector3(arm.ax, 0, arm.az).normalize();
    let x = arm.ax, y = rimY + 0.05, z = arm.az;
    arm.segs.forEach((g, j) => {
      const f = j / arm.segs.length;
      // a slow twist that grows along the arm, plus an outward drift
      const tw = Math.sin(t * 0.7 + arm.phase + j * 0.18) * 0.07 * f * live;
      x += out.x * 0.03 + Math.cos(arm.ang + j * 0.22) * tw;
      z += out.z * 0.03 - Math.sin(arm.ang + j * 0.22) * tw;
      y -= 0.2 * (1 - f * 0.15);
      g.userData.base.p.set(x, y, z);
      g.userData.base.r.set(Math.sin(j * 0.2 + arm.phase) * 0.25 * f, j * 0.18, Math.cos(j * 0.2 + arm.phase) * 0.25 * f);
    });
  }

  function ribbonPose(rb, t) {
    const segs = rb.arm.segs, pa = rb.mesh.geometry.attributes.position, cols = 7, rows = 91;
    const out = new T.Vector3(rb.arm.ax, 0, rb.arm.az).normalize(), side = new T.Vector3(-out.z, 0, out.x).multiplyScalar(rb.side);
    for (let r = 0; r < rows; r++) {
      const v = r / (rows - 1) * rb.len, fj = v * (segs.length - 1), j0 = Math.floor(fj), j1 = Math.min(segs.length - 1, j0 + 1), w = fj - j0;
      const p0 = segs[j0].position, p1 = segs[j1].position;
      const cx = p0.x + (p1.x - p0.x) * w, cy = p0.y + (p1.y - p0.y) * w, cz = p0.z + (p1.z - p0.z) * w;
      const width = rb.width * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, v * 1.15))) * (1 + 0.25 * Math.sin(v * 9 + t * 1.3 + rb.phase));
      for (let c = 0; c < cols; c++) {
        const u = c / (cols - 1), ruffle = Math.sin(v * 22 + u * 3 + t * 2.1 + rb.phase) * 0.09 * u;
        pa.setXYZ(r * cols + c, cx + side.x * (0.12 + u * width) + out.x * (ruffle + 0.06), cy - u * 0.08, cz + side.z * (0.12 + u * width) + out.z * (ruffle + 0.06));
      }
    }
    pa.needsUpdate = true; rb.mesh.geometry.computeVertexNormals();
  }

  function filamentPose(t, e) {
    let ic = 0, iv = 0;
    fils.forEach((f, i) => {
      const k = stage(e, 0.45 + (i % 8) * 0.01), out = new T.Vector3(f.x, 0, f.z).normalize();
      let x = f.x, y = rimY - 0.02, z = f.z, ang = 0, prev = new T.Vector3(x, y, z);
      for (let j = 0; j < FSEG; j++) {
        const s = j / FSEG;
        ang += (Math.sin(t * 0.9 + f.phase - j * 0.16) * 0.03 * f.swing + Math.sin(j * 0.13 + f.phase) * 0.018) * (1 - e);
        x += out.x * 0.022 * (1 - s * 0.7) + Math.sin(ang) * 0.09 * out.z;
        z += out.z * 0.022 * (1 - s * 0.7) - Math.sin(ang) * 0.09 * out.x;
        y -= FLEN * f.len * Math.cos(ang);
        const ex = (0.6 + j * 0.045) * k, cur = new T.Vector3(x + out.x * ex, y - j * 0.025 * k, z + out.z * ex);
        dummy.position.copy(prev).add(cur).multiplyScalar(0.5);
        tmpQ.setFromUnitVectors(up, cur.clone().sub(prev).normalize()); dummy.quaternion.copy(tmpQ); dummy.scale.set(1, 1, 1); dummy.updateMatrix();
        filMesh.setMatrixAt(i * FSEG + j, dummy.matrix);
        prev = cur;
      }
      dummy.position.copy(prev); dummy.quaternion.identity(); dummy.updateMatrix();
      if (i % 2) tipMeshV.setMatrixAt(iv++, dummy.matrix); else tipMeshC.setMatrixAt(ic++, dummy.matrix);
    });
    filMesh.instanceMatrix.needsUpdate = tipMeshC.instanceMatrix.needsUpdate = tipMeshV.instanceMatrix.needsUpdate = true;
  }

  function frame() {
    const t = clock.getElapsedTime();
    if (auto) { const c = (t - cycleAt) % 14; target = c > 6 && c < 11 ? 1 : 0; label(); }
    if (!STILL) explode += (target - explode) * 0.025;
    const live = 1 - explode, pulse = reduced ? 0 : Math.sin(t * 1.5);
    jelly.position.y = Math.sin(t * 0.7) * 0.15 * live;
    arms.forEach(a => armPose(a, t, explode));
    parts.forEach(p => {
      const { base, ex, delay } = p.userData, k = stage(explode, delay);
      p.position.set(base.p.x + ex.p.x * k, base.p.y + ex.p.y * k, base.p.z + ex.p.z * k);
      p.rotation.set(base.r.x + ex.r.x * k, base.r.y + ex.r.y * k, base.r.z + ex.r.z * k);
    });
    // the bell breathes: lobes and ribs (the first 16 parts) contract together
    const sy = 1 - pulse * 0.045 * live, sxz = 1 + pulse * 0.035 * live;
    for (let i = 0; i < LOBES * 2; i++) parts[i].scale.set(sxz, sy, sxz);
    ribbons.forEach(rb => ribbonPose(rb, t));
    filamentPose(t, explode);
    coreGlow.rotation.y = t * 0.5; M.cyan.emissiveIntensity = 1.7 + Math.sin(t * 2.2) * 0.3;
    controls.update();
    renderer.render(scene, cam);
    if (!STILL && frames < 30) { const f = document.querySelector('#load .ld-fill'), c = document.querySelector('#load .ld-pct'); const pc = Math.round((frames + 1) / 30 * 100); if (f) f.style.width = pc + '%'; if (c) c.textContent = String(pc).padStart(3, '0'); }
    if (++frames === 30 && !STILL) { const l = document.getElementById('load'); if (l) { l.classList.add('out'); setTimeout(() => l.remove(), 900); } window.__ready = true; }
    requestAnimationFrame(frame);
  }
  if (CUT) { cam.position.set(8.6, -0.6, 16.4); controls.target.set(0, -2.7, 0); }
  setTimeout(() => { const l = document.getElementById('load'); if (l) { l.classList.add('out'); setTimeout(() => l.remove(), 900); } }, 6000);
  frame();
})();
