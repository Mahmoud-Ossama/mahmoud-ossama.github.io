/**
 * <intelligence-machine> — the hero sculpture.
 *
 * Transparent canvas, no chrome, no page-background dependency: the element
 * is sized entirely by CSS and composites straight onto the page ground.
 *
 * Attributes: speed (default 1), shadow="off", parallax="off", paused.
 * Honours prefers-reduced-motion (renders one assembled frame) and pauses
 * itself when scrolled out of view or the tab is hidden.
 *
 * Readiness (added for this site, so the hero can hold its reveal until
 * there is something finished to reveal). Published as BOTH a one-shot event
 * and a sticky attribute, because the element upgrades as soon as its module
 * evaluates and can draw its first frame before a deferred script has run —
 * a listener alone loses that race. Check the attribute, then subscribe:
 *   data-ready  / machine-ready  — the first valid frame has been drawn
 *   data-failed / machine-error  — WebGL unavailable; show the fallback
 *
 * Read the sculpture as the business model: work arrives at the input
 * module, capabilities dock around a central intelligence and link to it,
 * an outcome leaves from whichever module the job called for, and then the
 * assembly rearranges for a different kind of job. Three configurations
 * cycle, so the shape a visitor sees is not the shape they left.
 */

import * as THREE from 'three';
import { buildMachine, CONFIGS, CORE_RADIUS, layoutLink } from './machine-geometry.js?v=20260904';

const PHASES = [
  ['drift', 4.2],
  ['arrive', 3.6],
  ['dock', 4.8],
  ['link', 2.6],
  ['hold', 4.2],
  ['release', 2.8],
  ['rearrange', 4.8],
];
const CYCLE = PHASES.reduce((a, p) => a + p[1], 0);
const TAU = Math.PI * 2;
/* Framing. The original fit treated the sculpture as a sphere of radius 1.52,
   which is what left it small with a band of dead space above and below: the
   assembly is not a ball but a landscape volume, and across all three
   configurations it never exceeds these half-extents (measured by projecting
   every mesh's bounding box over a full 81s cycle, excluding the ambient
   motes, which are meant to drift out of frame). FILL is how much of the
   frame the sculpture may occupy on its binding axis. */
const HALF_W = 1.95;
const HALF_H = 1.64;
const FILL = 0.92;

/* Where the cycle starts on load. t=0 is 'drift', where the four modules
   float unconnected and read as four separate objects rather than one
   system. This lands instead in the 'hold' of the second configuration —
   the three-module fan, links lit, core bright — so the first thing a
   visitor sees is the assembly working. The first rearrangement is then
   ~11s away, well inside a normal first visit. */
const START_T = 43.0;

const smooth = (x) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};
const damp = (cur, target, lambda, dt) => cur + (target - cur) * (1 - Math.exp(-lambda * dt));
const shortest = (d) => {
  let x = d % TAU;
  if (x > Math.PI) x -= TAU;
  if (x < -Math.PI) x += TAU;
  return x;
};

function studioEnv(renderer) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 32;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 32);
  grad.addColorStop(0.0, '#ffffff');
  grad.addColorStop(0.45, '#eef2ef');
  grad.addColorStop(0.52, '#cfd6d2');
  grad.addColorStop(1.0, '#9aa5a0');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 32);
  g.fillStyle = 'rgba(255,255,255,0.95)';
  g.beginPath();
  g.ellipse(20, 7, 12, 5, 0, 0, TAU);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose();
  tex.dispose();
  return env;
}

class IntelligenceMachine extends HTMLElement {
  connectedCallback() {
    if (this._booted) return;
    this._booted = true;

    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' +
      ':host{display:block;position:relative;contain:layout paint;}' +
      'canvas{display:block;width:100%;height:100%;pointer-events:none;}' +
      '</style>';

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch (err) {
      this.setAttribute('data-failed', '');
      this.dispatchEvent(new CustomEvent('machine-error', { bubbles: true }));
      return;
    }
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = this.getAttribute('shadow') !== 'off';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    root.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    scene.environment = studioEnv(renderer);
    scene.environmentIntensity = 0.78;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    this._camera = camera;
    this._scene = scene;

    const hemi = new THREE.HemisphereLight(0xffffff, 0xdfe5e1, 0.7);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 2.3);
    key.position.set(2.4, 4.0, 2.8);
    key.castShadow = renderer.shadowMap.enabled;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 5;
    key.shadow.bias = -0.0015;
    const sc = key.shadow.camera;
    sc.left = -3.2; sc.right = 3.2; sc.top = 3.2; sc.bottom = -3.2; sc.near = 0.5; sc.far = 14;
    sc.updateProjectionMatrix();
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8efec, 0.95);
    fill.position.set(-3.2, 1.2, 1.6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.7);
    rim.position.set(-1.0, 0.6, -3.4);
    scene.add(rim);

    const machine = buildMachine(THREE);
    this._machine = machine;
    scene.add(machine.root);

    this._state = {};
    machine.moduleIds.forEach((id, i) => {
      const idle = CONFIGS[0].idle[id];
      this._state[id] = {
        pos: new THREE.Vector3(Math.cos(idle.a) * idle.r, idle.y, Math.sin(idle.a) * idle.r),
        yaw: 0, tilt: 0, act: 0.12, accent: 0, spin: 0, seed: i * 1.7 + 0.4,
      };
    });
    this._linkAmt = [0, 0, 0];
    this._flow = 0;
    this._coreLight = 0.25;
    this._petrol = new THREE.Color(0x0d5a4e);
    this._ember = new THREE.Color(0xbe5410);
    this._tmpA = new THREE.Vector3();
    this._tmpB = new THREE.Vector3();
    this._ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    this._camDir = new THREE.Vector3(0.19, 0.34, 1).normalize();
    this._time = START_T;
    this._first = true;

    this._resize = () => this._fit();
    const ro = new ResizeObserver(this._resize);
    ro.observe(this);
    this._ro = ro;
    this._fit();

    this._reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.getAttribute('parallax') !== 'off' && !this._reduced) {
      this._onMove = (e) => {
        const r = this.getBoundingClientRect();
        if (!r.width) return;
        this._ptr.tx = Math.max(-1.5, Math.min(1.5, ((e.clientX - r.left) / r.width - 0.5) * 2));
        this._ptr.ty = Math.max(-1.5, Math.min(1.5, ((e.clientY - r.top) / r.height - 0.5) * 2));
      };
      addEventListener('pointermove', this._onMove, { passive: true });
    }

    this._visible = true;
    const io = new IntersectionObserver((es) => { this._visible = es[0].isIntersecting; }, { threshold: 0 });
    io.observe(this);
    this._io = io;
    this._onVis = () => { this._hidden = document.hidden; };
    document.addEventListener('visibilitychange', this._onVis);

    if (this._reduced) {
      /* One settled frame of the same pose: _time is held still while the
         dampers converge, so nothing animates but nothing is half-formed. */
      this._step(0.016);
      for (let i = 0; i < 90; i++) this._step(0.05);
      renderer.render(scene, camera);
      this._announce();
      return;
    }
    this._loop();
  }

  /* Called after the first valid frame is on the canvas. The attribute is set
     before the event is dispatched so a late subscriber can still read it. */
  _announce() {
    if (this._announced) return;
    this._announced = true;
    this.setAttribute('data-ready', '');
    this.dispatchEvent(new CustomEvent('machine-ready', { bubbles: true }));
  }

  disconnectedCallback() {
    cancelAnimationFrame(this._raf);
    this._ro?.disconnect();
    this._io?.disconnect();
    if (this._onMove) removeEventListener('pointermove', this._onMove);
    document.removeEventListener('visibilitychange', this._onVis);
    this._renderer?.dispose();
  }

  _fit() {
    const w = this.clientWidth || 800;
    const h = this.clientHeight || 600;
    const { _renderer: renderer, _camera: camera } = this;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    /* tan, not sin: sin fits a sphere tangentially, tan fits a flat extent at
       the origin plane, which is what a box half-extent actually is. Whichever
       axis needs the camera further back wins. */
    const dist = Math.max(
      HALF_H / (Math.tan(vFov / 2) * FILL),
      HALF_W / (Math.tan(hFov / 2) * FILL)
    );
    this._dist = dist;
    camera.updateProjectionMatrix();
  }

  _phase(t) {
    const cycle = Math.floor(t / CYCLE);
    let u = t - cycle * CYCLE;
    /* Floor-mod, not %: a negative cycle must still land inside CONFIGS. */
    const cfg = ((cycle % CONFIGS.length) + CONFIGS.length) % CONFIGS.length;
    const next = ((cycle + 1) % CONFIGS.length + CONFIGS.length) % CONFIGS.length;
    for (const [name, dur] of PHASES) {
      if (u < dur) return { name, p: u / dur, cfg, next };
      u -= dur;
    }
    return { name: 'rearrange', p: 1, cfg, next };
  }

  _idlePos(id, ph, t, out) {
    const cfg = CONFIGS[ph.cfg].idle[id];
    let a = cfg.a, r = cfg.r, y = cfg.y;
    if (ph.name === 'rearrange') {
      const nx = CONFIGS[ph.next].idle[id];
      const k = smooth(ph.p);
      a = cfg.a + shortest(nx.a - cfg.a) * k;
      r = cfg.r + (nx.r - cfg.r) * k;
      y = cfg.y + (nx.y - cfg.y) * k;
    }
    const s = this._state[id];
    const ang = a + t * 0.052 + Math.sin(t * 0.11 + s.seed) * 0.06;
    const bob = Math.sin(t * 0.29 + s.seed * 2.1) * 0.075;
    return out.set(Math.cos(ang) * r, y + bob, Math.sin(ang) * r);
  }

  _step(dt) {
    const t = this._time;
    const ph = this._phase(t);
    const cfg = CONFIGS[ph.cfg];
    const m = this._machine;
    const snap = this._first;

    const docking = ph.name === 'dock' || ph.name === 'link' || ph.name === 'hold' || ph.name === 'release';
    const chain = cfg.chain;

    const flowTarget = ph.name === 'arrive' ? 1 : ph.name === 'dock' ? 0.55 : 0;
    this._flow = damp(this._flow, flowTarget, 1.6, dt);

    m.moduleIds.forEach((id) => {
      const s = this._state[id];
      const idx = chain.indexOf(id);
      const member = idx >= 0;
      let dockAmt = 0;
      if (member) {
        if (ph.name === 'dock') dockAmt = smooth((ph.p - idx * 0.14) / 0.7);
        else if (docking) dockAmt = 1;
        else if (ph.name === 'rearrange') dockAmt = 1 - smooth((ph.p - idx * 0.10) / 0.62);
      }

      const idle = this._idlePos(id, ph, t, this._tmpA);
      let target = idle;
      if (dockAmt > 0.001) {
        const d = cfg.dock[id].p;
        this._tmpB.set(d[0], d[1], d[2]);
        this._tmpB.y += Math.sin(t * 0.34 + s.seed) * 0.022;
        target = idle.lerp(this._tmpB, smooth(dockAmt));
      }

      const lambda = 1.5;
      if (snap) s.pos.copy(target);
      else {
        s.pos.x = damp(s.pos.x, target.x, lambda, dt);
        s.pos.y = damp(s.pos.y, target.y, lambda, dt);
        s.pos.z = damp(s.pos.z, target.z, lambda, dt);
      }

      const dir = this._tmpB.copy(s.pos).normalize();
      const yawT = Math.atan2(-dir.z, dir.x);
      const tiltT = Math.asin(Math.max(-1, Math.min(1, dir.y))) * 0.5;
      s.yaw = snap ? yawT : s.yaw + shortest(yawT - s.yaw) * (1 - Math.exp(-2.0 * dt));
      s.tilt = snap ? tiltT : damp(s.tilt, tiltT, 2.0, dt);

      // activation: idle hum, input lights on arrival, members light while docked
      let actT = 0.10;
      if (id === 'input' && (ph.name === 'arrive' || docking)) actT = ph.name === 'arrive' ? 0.25 + smooth(ph.p) * 0.7 : 0.9;
      else if (member && docking) actT = ph.name === 'dock' ? 0.2 + smooth(ph.p) * 0.7 : 0.9;
      else if (member && ph.name === 'rearrange') actT = 0.35 * (1 - smooth(ph.p));
      s.act = damp(s.act, actT, snap ? 40 : 1.9, dt);

      const isAccent = id === cfg.accent;
      const accentT = isAccent && ph.name === 'hold' ? smooth((ph.p - 0.2) / 0.3) * (1 - smooth((ph.p - 0.72) / 0.28)) : 0;
      s.accent = damp(s.accent, accentT, snap ? 40 : 2.2, dt);

      const mod = m.modules[id];
      mod.group.position.copy(s.pos);
      mod.group.rotation.y = s.yaw;
      mod.tilt.rotation.z = s.tilt;

      const lit = 0.16 + s.act * 1.5;
      mod.light.emissiveIntensity = lit;
      mod.light.color.copy(this._petrol).lerp(this._ember, s.accent);
      mod.light.emissive.copy(this._petrol).lerp(this._ember, s.accent * 0.9);

      // module-specific internal life
      if (id === 'input') {
        const spread = 0.10 + s.act * 0.055;
        mod.parts.plates.forEach((pl, i) => {
          pl.position.y = (i - 1.5) * spread;
          pl.position.x = 0.02 + Math.sin(t * 0.6 + i * 0.9) * 0.006 * s.act;
        });
        mod.pivot.rotation.x = Math.sin(t * 0.18 + s.seed) * 0.06;
      } else if (id === 'analysis') {
        s.spin += dt * (0.09 + s.act * 0.34);
        mod.parts.rings.forEach((r, i) => { r.rotation.x = s.spin * (i % 2 ? -1 : 1) * (1 + i * 0.35); });
      } else if (id === 'action') {
        const ext = s.act * 0.075 + Math.sin(t * 0.9) * 0.008 * s.act;
        mod.parts.pistons.forEach((p, i) => {
          const base = i % 2 ? 0.235 : 0.10;
          p.position.x = base + ext * (1 + (i % 2) * 0.6);
        });
        mod.pivot.rotation.x = Math.sin(t * 0.22 + s.seed) * 0.08;
      } else if (id === 'prediction') {
        const open = 0.22 + s.act * 0.5 + s.accent * 0.35;
        mod.parts.blades.forEach((b, i) => {
          b.rotation.x = (i / 3) * TAU + s.spin * 0.2 + open * 0.9;
        });
        s.spin += dt * (0.08 + s.act * 0.2);
        mod.parts.bead.scale.setScalar(1 + s.accent * 0.10);
      }
    });

    /* core */
    const coreT = ph.name === 'link' || ph.name === 'hold' ? 1 : ph.name === 'dock' ? 0.55 : ph.name === 'arrive' ? 0.4 : 0.22;
    this._coreLight = damp(this._coreLight, coreT, snap ? 40 : 1.7, dt);
    m.coreGlow.emissiveIntensity = 0.22 + this._coreLight * 1.35 + Math.sin(t * 0.7) * 0.05 * this._coreLight;
    m.gimbal1.rotation.z += dt * (0.055 + this._coreLight * 0.06);
    m.gimbal2.rotation.y -= dt * (0.075 + this._coreLight * 0.09);
    m.core.rotation.y += dt * 0.035;

    /* links: module anchor → core surface */
    m.root.updateMatrixWorld(true);
    m.links.forEach((link, i) => {
      const id = chain[i];
      if (!id) { this._linkAmt[i] = 0; link.group.visible = false; return; }
      let amt = 0;
      if (ph.name === 'link') amt = smooth((ph.p - i * 0.16) / 0.7);
      else if (ph.name === 'hold') amt = 1;
      else if (ph.name === 'release') amt = 1 - smooth(ph.p / 0.85);
      this._linkAmt[i] = damp(this._linkAmt[i], amt, snap ? 40 : 2.4, dt);
      const a = this._linkAmt[i];
      link.group.visible = a > 0.01;
      if (!link.group.visible) return;
      const mod = m.modules[id];
      const pa = mod.group.localToWorld(mod.anchor.clone());
      m.root.worldToLocal(pa);
      const pb = pa.clone().normalize().multiplyScalar(CORE_RADIUS + 0.015);
      layoutLink(link, pa, pb);
      link.mats[0].opacity = a;
      link.mats[1].opacity = a * 0.92;
      link.wire.scale.x = link.wire.scale.y = 0.6 + a * 0.4;
      const pulseU = ((t / 2.0 + i * 0.33) % 1);
      const u = i === 0 ? pulseU : 1 - pulseU;
      link.pulse.position.lerpVectors(pa, pb, u);
      const k = Math.sin(pulseU * Math.PI);
      link.pulse.scale.setScalar(0.5 + k * 0.9);
      link.pulse.visible = a > 0.35;
    });

    /* arriving signals */
    const inputPos = this._state.input.pos;
    const outward = this._tmpA.copy(inputPos).normalize();
    const start = outward.clone().multiplyScalar(2.0).add(new THREE.Vector3(0, 0.34, 0.22));
    const intake = inputPos.clone().add(outward.clone().multiplyScalar(0.28));
    const ctrl = start.clone().lerp(intake, 0.55).add(new THREE.Vector3(0, 0.30, -0.18));
    const flowU = (t * 0.30) % 1;
    m.signals.forEach((s, i) => {
      const u = (flowU + i / m.signals.length) % 1;
      const vis = this._flow > 0.03;
      s.visible = vis;
      if (!vis) return;
      const mt = 1 - u;
      const x = mt * mt * start.x + 2 * mt * u * ctrl.x + u * u * intake.x;
      const y = mt * mt * start.y + 2 * mt * u * ctrl.y + u * u * intake.y;
      const z = mt * mt * start.z + 2 * mt * u * ctrl.z + u * u * intake.z;
      s.position.set(x, y, z);
      const fade = Math.min(1, u * 5) * Math.min(1, (1 - u) * 6);
      s.scale.setScalar(0.6 + fade * 0.7);
    });
    m.signalMat.opacity = this._flow * 0.9;

    /* output signal from the accent module */
    const accentState = this._state[cfg.accent];
    let outAmt = 0;
    if (ph.name === 'hold') outAmt = smooth((ph.p - 0.32) / 0.62);
    if (outAmt > 0.001 && outAmt < 0.999) {
      const dir = accentState.pos.clone().normalize();
      const from = accentState.pos.clone().add(dir.clone().multiplyScalar(0.38));
      m.output.visible = true;
      m.output.position.copy(from).add(dir.multiplyScalar(outAmt * 1.05));
      m.output.position.y += Math.sin(outAmt * Math.PI) * 0.12;
      m.outMat.opacity = Math.sin(Math.min(1, outAmt * 1.05) * Math.PI) * 0.95;
      m.output.scale.setScalar(0.7 + (1 - outAmt) * 0.5);
    } else {
      m.output.visible = false;
    }

    m.motes.rotation.y = t * 0.014;
    m.motes.material.opacity = 0.16 + Math.sin(t * 0.2) * 0.05;

    /* whole-sculpture drift: slow oscillating yaw, never a constant spin */
    m.root.rotation.y = Math.sin(t * 0.045) * 0.42 + Math.sin(t * 0.017) * 0.18;
    m.root.rotation.x = Math.sin(t * 0.031) * 0.035;

    /* camera */
    const p = this._ptr;
    p.x = damp(p.x, p.tx, 2.2, dt);
    p.y = damp(p.y, p.ty, 2.2, dt);
    const cam = this._camera;
    const dir = this._camDir.clone();
    const yaw = -p.x * 0.075;
    const pitch = p.y * 0.05;
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    dir.y += pitch;
    dir.normalize().multiplyScalar(this._dist);
    cam.position.copy(dir);
    cam.lookAt(0, -0.02, 0);

    this._first = false;
  }

  _loop() {
    let last = performance.now();
    const tick = (now) => {
      this._raf = requestAnimationFrame(tick);
      /* Clamped at zero as well as at the top: the timestamp handed to a rAF
         callback is the frame's start time, which can predate the
         performance.now() captured when the loop was scheduled. That made the
         first dt negative, drove _time below zero, and JS's sign-preserving %
         then indexed CONFIGS[-1]. */
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      if (!this._visible || this._hidden || this.hasAttribute('paused')) return;
      const speed = parseFloat(this.getAttribute('speed') || '1') || 1;
      this._time += dt * speed;
      this._step(dt * speed);
      this._renderer.render(this._scene, this._camera);
      this._announce();
    };
    this._raf = requestAnimationFrame(tick);
  }
}

if (!customElements.get('intelligence-machine')) {
  customElements.define('intelligence-machine', IntelligenceMachine);
}
