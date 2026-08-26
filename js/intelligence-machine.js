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
 * ── The choreography ──────────────────────────────────────────────────────
 * The machine stays assembled. An earlier version spent most of its cycle
 * pulling the modules apart and docking them again, which a visitor reads as
 * the object assembling itself rather than as work being processed — and it
 * left ~14s at a stretch where nothing entered or left. Positions are now
 * fixed for good and the story is carried entirely by light and mechanism:
 *
 *   ready 1.6s → input 1.4s → core 1.2s → process 3.0s → outcome 1.6s
 *   → settle 1.7s          (10.5s, and the first work lands at 1.6s)
 *
 * Work arrives at the intake on the left, a pulse runs inward along its link,
 * the core lights, a pulse runs back out to ONE capability, that capability's
 * own mechanism actuates, and an ember result leaves from it. The leading
 * capability rotates every loop — pistons, then lens rings, then iris — so
 * different work visibly takes a different route through the same machine.
 */

import * as THREE from 'three';
import { buildMachine, HOME, LEADS, CORE_RADIUS, layoutLink } from './machine-geometry.js?v=20260906';

const BEATS = [
  ['ready', 1.6],
  ['input', 1.4],
  ['core', 1.2],
  ['process', 3.0],
  ['outcome', 1.6],
  ['settle', 1.7],
];
const CYCLE = BEATS.reduce((a, b) => a + b[1], 0);
const TAU = Math.PI * 2;

/* Link i belongs to module LINK_ORDER[i]. Every module is linked, always. */
const LINK_ORDER = ['input', 'analysis', 'prediction', 'action'];

/* Framing: half-extents of the assembled pose in world units, and how much
   of the frame the sculpture may occupy on its binding axis. Measured by
   projecting every mesh's bounding box across a full cycle, motes excluded —
   they are meant to drift out of frame. */
const HALF_W = 1.88;
const HALF_H = 1.52;
const FILL = 0.92;

const smooth = (x) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};
/* rises 0→1 over [a,b] then falls back to 0 over [b,c] */
const hump = (p, a, b, c) => (p < b ? smooth((p - a) / (b - a)) : 1 - smooth((p - b) / (c - b)));
const damp = (cur, target, lambda, dt) => cur + (target - cur) * (1 - Math.exp(-lambda * dt));

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
    /* The assembled pose carries more mass above the core than below, so it
       projected high in the frame with dead space underneath. Translating the
       whole root is preferable to re-aiming the camera, which would skew the
       perspective; rotation still happens about the core because the root's
       own origin is the core. Measured: body ndc.y ran -0.56..+0.82. */
    machine.root.position.y = -0.22;
    scene.add(machine.root);

    /* Fixed pose, set once. Each module is modelled with its local +X facing
       away from the core, so yaw and tilt follow from its position. */
    this._state = {};
    machine.moduleIds.forEach((id, i) => {
      const h = HOME[id].p;
      const pos = new THREE.Vector3(h[0], h[1], h[2]);
      const dir = pos.clone().normalize();
      const mod = machine.modules[id];
      mod.group.position.copy(pos);
      mod.group.rotation.y = Math.atan2(-dir.z, dir.x);
      mod.tilt.rotation.z = Math.asin(Math.max(-1, Math.min(1, dir.y))) * 0.30;
      this._state[id] = { pos, dir, act: 0.1, accent: 0, mech: 0, spin: 0, seed: i * 1.7 + 0.4 };
    });

    this._linkAmt = [0, 0, 0, 0];
    this._flow = 0;
    this._coreLight = 0.16;
    this._gimbalBoost = 0;
    this._petrol = new THREE.Color(0x0d5a4e);
    this._ember = new THREE.Color(0xbe5410);
    this._ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    this._camDir = new THREE.Vector3(0.19, 0.34, 1).normalize();
    this._time = 0;
    this._first = true;

    /* the intake, and where work comes in from — off frame, upper left */
    const inSt = this._state.input;
    this._inFrom = new THREE.Vector3(-2.45, 0.62, 0.60);
    this._inTo = inSt.pos.clone().add(inSt.dir.clone().multiplyScalar(0.30));
    this._inCtrl = this._inFrom.clone().lerp(this._inTo, 0.5).add(new THREE.Vector3(0.1, 0.34, -0.15));

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
      /* one settled frame mid-process: links lit, core bright, the leading
         capability actuated — the machine working, not the machine idle */
      this._time = 6.0;
      this._step(0.016);
      for (let i = 0; i < 80; i++) this._step(0.05);
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
       the origin plane, which is what a box half-extent actually is. */
    this._dist = Math.max(
      HALF_H / (Math.tan(vFov / 2) * FILL),
      HALF_W / (Math.tan(hFov / 2) * FILL)
    );
    camera.updateProjectionMatrix();
  }

  _beat(t) {
    const loop = Math.floor(t / CYCLE);
    let u = t - loop * CYCLE;
    const lead = LEADS[((loop % LEADS.length) + LEADS.length) % LEADS.length];
    for (const [name, dur] of BEATS) {
      if (u < dur) return { name, p: u / dur, lead };
      u -= dur;
    }
    return { name: 'settle', p: 1, lead };
  }

  _step(dt) {
    const t = this._time;
    const b = this._beat(t);
    const m = this._machine;

    /* Announce the beat so the page can label it. Published as a sticky
       attribute as well as an event, for the same reason readiness is: this
       fires from the first frame, which can precede a deferred script. */
    const key = b.name + ':' + b.lead;
    if (key !== this._beatKey) {
      this._beatKey = key;
      this.setAttribute('data-beat', key);
      this.dispatchEvent(new CustomEvent('machine-beat', { bubbles: true, detail: { beat: b.name, lead: b.lead } }));
    }

    const snap = this._first;
    const lam = snap ? 40 : 3.4;

    const isIn = b.name === 'input';
    const isCore = b.name === 'core';
    const isProc = b.name === 'process';
    const isOut = b.name === 'outcome';

    /* work in flight, arriving at the intake */
    this._flow = damp(this._flow, isIn ? 1 : 0, snap ? 40 : (isIn ? 4.2 : 2.6), dt);

    /* the core: quiet, then lit from the moment work reaches it */
    const coreT = isCore ? 0.35 + smooth(b.p) * 0.65
      : isProc ? 1
        : isOut ? 0.8
          : b.name === 'settle' ? 1 - smooth(b.p) * 0.76
            : isIn ? 0.24 + smooth(b.p) * 0.16
              : 0.16;
    this._coreLight = damp(this._coreLight, coreT, snap ? 40 : 2.6, dt);
    /* the gimbals spin up while the core is thinking, then ease back */
    const boostT = isCore ? smooth(b.p) : isProc ? 1 - smooth(b.p) * 0.55 : isOut ? 0.3 : 0;
    this._gimbalBoost = damp(this._gimbalBoost, boostT, snap ? 40 : 2.2, dt);

    m.moduleIds.forEach((id) => {
      const s = this._state[id];
      const isLead = id === b.lead;

      /* activation — how lit the module is */
      let actT = 0.10;
      if (id === 'input') {
        actT = isIn ? 0.15 + smooth(b.p) * 0.85
          : isCore ? 0.95 - smooth(b.p) * 0.45
            : isProc ? 0.40 - smooth(b.p) * 0.18
              : isOut ? 0.20 : 0.10;
      } else if (isLead) {
        actT = isCore ? 0.14 + smooth(b.p) * 0.20
          : isProc ? 0.30 + smooth((b.p - 0.22) / 0.35) * 0.70
            : isOut ? 1 : 0.10;
      } else {
        /* the other capabilities acknowledge without taking over */
        actT = isCore ? 0.14 + smooth(b.p) * 0.14
          : isProc ? 0.30 : isOut ? 0.22 : 0.10;
      }
      s.act = damp(s.act, actT, lam, dt);

      /* the module's own mechanism — only the lead really works */
      const mechT = isLead
        ? (isProc ? smooth((b.p - 0.26) / 0.42) : isOut ? 1 - smooth((b.p - 0.5) / 0.5) * 0.35 : 0)
        : 0;
      s.mech = damp(s.mech, mechT, snap ? 40 : 2.8, dt);

      /* ember only on the lead, only as the result forms and leaves */
      const accT = isLead && isOut ? hump(b.p, 0, 0.3, 1) : 0;
      s.accent = damp(s.accent, accT, snap ? 40 : 3.0, dt);

      const mod = m.modules[id];
      mod.light.emissiveIntensity = 0.16 + s.act * 1.75;
      mod.light.color.copy(this._petrol).lerp(this._ember, s.accent);
      mod.light.emissive.copy(this._petrol).lerp(this._ember, s.accent * 0.9);

      /* a breath, so the assembly is alive at rest without drifting */
      mod.group.position.copy(s.pos);
      mod.group.position.y += Math.sin(t * 0.5 + s.seed * 2.1) * 0.016;
      /* the capabilities lean a few degrees while the system works */
      mod.tilt.rotation.x = Math.sin(t * 0.22 + s.seed) * 0.03 + (isLead ? 0.075 : 0.028) * s.act;

      /* ------------------------------------------------ the mechanisms */
      if (id === 'input') {
        /* plates spread apart as work lands on the stack */
        const spread = 0.10 + s.act * 0.085;
        mod.parts.plates.forEach((pl, i) => {
          pl.position.y = (i - 1.5) * spread;
          pl.position.x = 0.02 + Math.sin(t * 1.4 + i * 0.9) * 0.012 * s.act;
        });
      } else if (id === 'analysis') {
        /* lens rings counter-rotate and the barrel telescopes: an inspection */
        s.spin += dt * (0.10 + s.mech * 1.7);
        mod.parts.rings.forEach((r, i) => {
          if (r.userData.bx === undefined) r.userData.bx = r.position.x;
          r.rotation.x = s.spin * (i % 2 ? -1 : 1) * (1 + i * 0.35);
          r.position.x = r.userData.bx + s.mech * (i - 1) * 0.085;
        });
      } else if (id === 'action') {
        /* pistons drive out and hold: the machine acting on something */
        const ext = s.mech * 0.17 + Math.sin(t * 1.6) * 0.006 * s.mech;
        mod.parts.pistons.forEach((pn, i) => {
          pn.position.x = (i % 2 ? 0.235 : 0.10) + ext * (1 + (i % 2) * 0.5);
        });
      } else if (id === 'prediction') {
        /* The blades sit at radius 0.215 inside a 0.30 ring, so scaling them
           was invisible — this module was the one loop whose response could
           not be seen. The decision bead now pushes out THROUGH the ring
           while the blades sweep behind it: the call coming forward. */
        s.spin += dt * (0.08 + s.mech * 2.4);
        mod.parts.blades.forEach((bl, i) => {
          bl.rotation.x = (i / 3) * TAU + s.spin;
          bl.scale.setScalar(1 + s.mech * 0.22);
        });
        const push = s.mech * 0.18;
        mod.parts.bead.position.x = 0.01 + push;
        mod.parts.beadCore.position.x = 0.055 + push;
        mod.parts.bead.scale.setScalar(1 + s.mech * 0.30 + s.accent * 0.16);
      }
    });

    /* ------------------------------------------------------------- core */
    m.coreGlow.emissiveIntensity = 0.18 + this._coreLight * 2.1
      + Math.sin(t * 1.9) * 0.07 * this._coreLight * (isProc ? 1 : 0.3);
    m.gimbal1.rotation.z += dt * (0.05 + this._gimbalBoost * 0.55);
    m.gimbal2.rotation.y -= dt * (0.07 + this._gimbalBoost * 0.75);
    m.core.rotation.y += dt * 0.03;

    /* ------------------------------------------------------------ links */
    m.root.updateMatrixWorld(true);
    m.links.forEach((link, i) => {
      const id = LINK_ORDER[i];
      const mod = m.modules[id];
      const pa = mod.group.localToWorld(mod.anchor.clone());
      m.root.worldToLocal(pa);
      const pb = pa.clone().normalize().multiplyScalar(CORE_RADIUS + 0.015);
      layoutLink(link, pa, pb);
      link.group.visible = true;

      /* structure at rest, bright while carrying */
      const carrying = (id === 'input' && isCore) || (id === b.lead && isProc && b.p < 0.42);
      const amtT = carrying ? 1 : 0.30 + this._state[id].act * 0.30;
      this._linkAmt[i] = damp(this._linkAmt[i], amtT, snap ? 40 : 3.2, dt);
      const a = this._linkAmt[i];
      link.mats[0].opacity = 0.30 + a * 0.70;
      link.mats[1].opacity = 0.12 + a * 0.26;
      /* The sleeve is authored at 0.034 radius, which rendered as a pale grey
         tube thick enough to read as scaffolding. Thinned here rather than in
         the geometry so the export keeps its original proportions: a slim
         dark conduit with the live teal wire inside it. */
      link.rod.scale.x = link.rod.scale.y = 0.62;
      link.wire.scale.x = link.wire.scale.y = 0.62 + a * 0.38;

      /* one pulse, travelling the way the work travels: inward from the
         intake to the core, then outward from the core to the capability */
      let pu = -1;
      if (id === 'input' && isCore) pu = smooth(b.p);
      else if (id === b.lead && isProc && b.p < 0.45) pu = 1 - smooth(b.p / 0.42);
      link.pulse.visible = pu >= 0;
      if (pu >= 0) {
        link.pulse.position.lerpVectors(pa, pb, pu);
        link.pulse.scale.setScalar(1.15 + Math.sin(pu * Math.PI) * 0.85);
      }
    });

    /* --------------------------------------------------------- work in */
    const A = this._inFrom, C = this._inCtrl, B = this._inTo;
    const flowU = (t * 0.62) % 1;
    m.signals.forEach((sg, i) => {
      if (i >= 5) { sg.visible = false; return; }   /* five beads, not twelve */
      const vis = this._flow > 0.02;
      sg.visible = vis;
      if (!vis) return;
      const u = (flowU + i / 5) % 1;
      const mt = 1 - u;
      sg.position.set(
        mt * mt * A.x + 2 * mt * u * C.x + u * u * B.x,
        mt * mt * A.y + 2 * mt * u * C.y + u * u * B.y,
        mt * mt * A.z + 2 * mt * u * C.z + u * u * B.z
      );
      const fade = Math.min(1, u * 4) * Math.min(1, (1 - u) * 5);
      sg.scale.setScalar(1.5 + fade * 1.2);
    });
    m.signalMat.opacity = this._flow * 0.95;

    /* -------------------------------------------------------- result out */
    if (isOut) {
      const ls = this._state[b.lead];
      const u = smooth(b.p / 0.92);
      m.output.visible = true;
      m.output.position.copy(ls.pos).addScaledVector(ls.dir, 0.42 + u * 0.80);
      m.output.position.y += Math.sin(u * Math.PI) * 0.10;
      /* fades out well before the frame edge, so it reads as leaving rather
         than as being cut off */
      m.outMat.opacity = Math.min(1, u * 5) * (1 - smooth((u - 0.55) / 0.45)) * 0.98;
      m.output.scale.setScalar(1.35 + u * 0.5);
    } else {
      m.output.visible = false;
    }

    m.motes.rotation.y = t * 0.012;
    m.motes.material.opacity = 0.15 + Math.sin(t * 0.2) * 0.04;

    /* Whole-object drift, kept small on purpose. The story is the machine's
       state changes; a big swing moved those relationships around the frame
       and turned the piece back into a rotating object. */
    m.root.rotation.y = Math.sin(t * 0.09) * 0.13;
    m.root.rotation.x = Math.sin(t * 0.061) * 0.022;

    /* ----------------------------------------------------------- camera */
    const p = this._ptr;
    p.x = damp(p.x, p.tx, 2.2, dt);
    p.y = damp(p.y, p.ty, 2.2, dt);
    const cam = this._camera;
    const dir = this._camDir.clone();
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), -p.x * 0.06);
    dir.y += p.y * 0.04;
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
         performance.now() captured when the loop was scheduled. */
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
