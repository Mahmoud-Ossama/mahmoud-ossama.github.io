/**
 * Modular Intelligence Machine — geometry.
 *
 * Builds the sculpture as a THREE.Group of named parts and named materials,
 * plus the animation metadata the animator needs: per-module anchors, idle
 * arrangements and dock poses.
 *
 * Units: meters, y-up, centered on origin. Outward-facing convention:
 * every module is modelled with its local +X pointing AWAY from the core.
 *
 * Palette: the material names are the site's own tokens, not generic greys —
 * ink #131e1a, shell #F4F6F4, petrol #0D5A4E, ember #BE5410, against a steel
 * neutral. The sculpture was authored against the brand, so nothing is
 * colour-remapped at import.
 */

export const CORE_RADIUS = 0.50;

export const CONFIGS = [
  {
    // input → intelligence → action  (opposed horizontal spine)
    chain: ['input', 'action'],
    accent: 'action',
    dock: {
      input: { p: [-1.12, 0.08, 0.14] },
      action: { p: [1.06, 0.00, -0.12] },
    },
    idle: {
      input: { a: 2.42, r: 1.34, y: 0.34 },
      analysis: { a: 4.05, r: 1.42, y: -0.52 },
      action: { a: 0.34, r: 1.38, y: 0.14 },
      prediction: { a: 5.30, r: 1.30, y: 0.58 },
    },
  },
  {
    // input → analysis → intelligence → prediction  (triangular fan)
    chain: ['input', 'analysis', 'prediction'],
    accent: 'prediction',
    dock: {
      input: { p: [-1.06, -0.44, 0.16] },
      analysis: { p: [0.04, 1.10, -0.08] },
      prediction: { p: [1.04, -0.40, -0.10] },
    },
    idle: {
      input: { a: 3.35, r: 1.30, y: -0.36 },
      analysis: { a: 1.15, r: 1.40, y: 0.60 },
      action: { a: 5.05, r: 1.44, y: -0.18 },
      prediction: { a: 0.05, r: 1.32, y: 0.42 },
    },
  },
  {
    // input → intelligence → decision  (rising diagonal)
    chain: ['input', 'prediction'],
    accent: 'prediction',
    dock: {
      input: { p: [-0.94, 0.68, 0.12] },
      prediction: { p: [0.82, -0.80, -0.08] },
    },
    idle: {
      input: { a: 1.60, r: 1.36, y: 0.54 },
      analysis: { a: 3.10, r: 1.30, y: -0.46 },
      action: { a: 4.55, r: 1.44, y: 0.36 },
      prediction: { a: 6.05, r: 1.34, y: -0.22 },
    },
  },
];

function roundedRect(THREE, w, h, r) {
  const x = -w / 2, y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Rounded block, centered, with a soft bevel on the extruded faces. */
function block(THREE, w, h, d, r = 0.02, bevel = 0.008) {
  const depth = Math.max(0.002, d - bevel * 2);
  const geo = new THREE.ExtrudeGeometry(roundedRect(THREE, w, h, Math.min(r, Math.min(w, h) / 2 - 0.001)), {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 6,
  });
  geo.center();
  return geo;
}

function mesh(geo, mat, name, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

let THREE = null;

export function buildMachine(three) {
  THREE = three;

  const mat = {
    ink: new THREE.MeshStandardMaterial({ color: 0x131e1a, roughness: 0.46, metalness: 0.18 }),
    graphite: new THREE.MeshStandardMaterial({ color: 0x24322c, roughness: 0.6, metalness: 0.12 }),
    petrol: new THREE.MeshStandardMaterial({ color: 0x0d5a4e, roughness: 0.36, metalness: 0.26 }),
    shell: new THREE.MeshStandardMaterial({ color: 0xf4f6f4, roughness: 0.46, metalness: 0.05 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xb2bcb8, roughness: 0.24, metalness: 0.40 }),
    ember: new THREE.MeshStandardMaterial({ color: 0xbe5410, roughness: 0.34, metalness: 0.12, emissive: 0xbe5410, emissiveIntensity: 0 }),
  };
  Object.keys(mat).forEach((k) => { mat[k].name = k; });

  const glow = (name) => {
    const m = new THREE.MeshStandardMaterial({
      color: 0x0d5a4e, roughness: 0.30, metalness: 0.08,
      emissive: 0x0d5a4e, emissiveIntensity: 0.25,
    });
    m.name = name;
    return m;
  };

  const root = new THREE.Group();
  root.name = 'ModularIntelligenceMachine';

  /* ---------------------------------------------------------------- core */

  const core = new THREE.Group();
  core.name = 'core_intelligence';
  root.add(core);

  // dome shell: profile runs from the axis out to a machined lip, so the
  // luminous equator between the two shells stays visible from any angle
  const capProfile = (radius, height) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 0.5;
      const k = Math.pow(Math.sin(a), 0.85);
      pts.push(new THREE.Vector2(k * radius, Math.cos(a * 0.98) * height));
    }
    pts.push(new THREE.Vector2(radius, -0.035), new THREE.Vector2(radius - 0.06, -0.075), new THREE.Vector2(0, -0.075));
    return new THREE.LatheGeometry(pts, 72);
  };

  const capTop = mesh(capProfile(0.40, 0.36), mat.ink, 'core_shell_upper', core);
  capTop.position.y = 0.115;
  const capBottom = mesh(capProfile(0.40, 0.32), mat.ink, 'core_shell_lower', core);
  capBottom.position.y = -0.115;
  capBottom.rotation.x = Math.PI;

  const coreGlow = glow('core_light');
  mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.20, 72, 1, true), coreGlow, 'core_light_band', core);
  const bandInner = mesh(new THREE.SphereGeometry(0.435, 48, 32), mat.graphite, 'core_kernel', core);
  bandInner.scale.set(1, 0.58, 1);

  for (const s of [-1, 1]) {
    const collar = mesh(new THREE.TorusGeometry(0.452, 0.022, 20, 104), mat.steel, 'core_collar_' + (s > 0 ? 'upper' : 'lower'), core);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = s * 0.086;
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.26;
    const key = mesh(block(THREE, 0.05, 0.13, 0.05, 0.014), mat.ink, 'core_key_' + (i + 1), core);
    key.position.set(Math.cos(a) * 0.455, 0, Math.sin(a) * 0.455);
    key.rotation.y = -a;
  }

  const gimbal1 = new THREE.Group();
  gimbal1.name = 'core_gimbal_outer';
  core.add(gimbal1);
  mesh(new THREE.TorusGeometry(0.68, 0.026, 18, 128), mat.petrol, 'gimbal_ring_outer', gimbal1);
  gimbal1.rotation.set(Math.PI * 0.46, 0, 0.28);

  const gimbal2 = new THREE.Group();
  gimbal2.name = 'core_gimbal_inner';
  core.add(gimbal2);
  mesh(new THREE.TorusGeometry(0.575, 0.019, 16, 112), mat.steel, 'gimbal_ring_inner', gimbal2);
  gimbal2.rotation.set(Math.PI * 0.34, 0.4, -0.5);

  /* ------------------------------------------------------------- modules */

  const modules = {};

  function shellModule(id, radius, scale = 1.16) {
    const group = new THREE.Group();
    group.name = 'module_' + id;
    const tilt = new THREE.Group();
    tilt.name = id + '_tilt';
    tilt.scale.setScalar(scale);
    group.add(tilt);
    const pivot = new THREE.Group();
    pivot.name = id + '_pivot';
    tilt.add(pivot);
    root.add(group);
    const light = glow(id + '_light');
    const m = { id, group, tilt, pivot, light, radius, parts: {} };
    modules[id] = m;
    return m;
  }

  /* input — a plate reader: signals land on the stack, light bleeds inward */
  {
    const m = shellModule('input', 0.40);
    const p = m.pivot;
    const yoke = new THREE.Group();
    yoke.name = 'input_yoke';
    p.add(yoke);
    const spine = mesh(block(THREE, 0.10, 0.60, 0.13, 0.03), mat.ink, 'input_spine', yoke);
    spine.position.set(-0.20, 0, 0);
    for (const s of [-1, 1]) {
      const arm = mesh(block(THREE, 0.34, 0.075, 0.10, 0.025), mat.ink, 'input_arm_' + (s > 0 ? 'top' : 'bottom'), yoke);
      arm.position.set(-0.03, s * 0.262, 0);
    }
    const plates = [];
    for (let i = 0; i < 4; i++) {
      const pl = mesh(block(THREE, 0.30, 0.030, 0.40, 0.012), i === 1 ? mat.petrol : mat.shell, 'input_plate_' + (i + 1), p);
      pl.rotation.z = Math.PI / 2;
      pl.position.set(0.02, -0.165 + i * 0.11, 0);
      plates.push(pl);
    }
    m.parts.plates = plates;
    const slit = mesh(new THREE.BoxGeometry(0.016, 0.42, 0.024), m.light, 'input_intake_light', p);
    slit.rotation.z = Math.PI / 2;
    slit.position.set(0.155, 0, 0);
    const heel = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 32), mat.steel, 'input_hub', p);
    heel.rotation.z = Math.PI / 2;
    heel.position.set(-0.30, 0, 0);
    m.anchor = new THREE.Vector3(-0.42, 0, 0);
  }

  /* analysis — a lens barrel: rings step outward, apertures counter-rotate */
  {
    const m = shellModule('analysis', 0.36);
    const p = m.pivot;
    const backplate = mesh(new THREE.CylinderGeometry(0.30, 0.33, 0.07, 56), mat.ink, 'analysis_backplate', p);
    backplate.rotation.z = Math.PI / 2;
    backplate.position.x = -0.115;
    const shoulder = mesh(new THREE.TorusGeometry(0.305, 0.026, 16, 72), mat.shell, 'analysis_shoulder', p);
    shoulder.rotation.y = Math.PI / 2;
    shoulder.position.x = -0.075;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.5;
      const rail = mesh(block(THREE, 0.40, 0.032, 0.05, 0.012), mat.ink, 'analysis_rail_' + (k + 1), p);
      rail.rotation.y = Math.PI / 2;
      rail.position.set(0.09, Math.sin(a) * 0.255, Math.cos(a) * 0.255);
      rail.rotation.x = -a;
    }
    const rings = [];
    const spec = [[0.255, 0.030, mat.steel, 0.03], [0.195, 0.026, mat.petrol, 0.125], [0.135, 0.022, mat.shell, 0.21]];
    spec.forEach(([R, r, material, x], i) => {
      const holder = new THREE.Group();
      holder.name = 'analysis_lens_' + (i + 1);
      holder.position.x = x;
      p.add(holder);
      const ring = mesh(new THREE.TorusGeometry(R, r, 16, 80), material, 'analysis_lens_ring_' + (i + 1), holder);
      ring.rotation.y = Math.PI / 2;
      for (let k = 0; k < 2; k++) {
        const spoke = mesh(block(THREE, R * 1.7, 0.018, 0.030, 0.007), mat.ink, 'analysis_lens_spoke_' + (i + 1) + '_' + (k + 1), holder);
        spoke.rotation.y = Math.PI / 2;
        spoke.position.set(0, (k ? -1 : 1) * R * 0.42, 0);
      }
      rings.push(holder);
    });
    m.parts.rings = rings;
    const lens = mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.035, 44), m.light, 'analysis_aperture_light', p);
    lens.rotation.z = Math.PI / 2;
    lens.position.x = 0.255;
    m.anchor = new THREE.Vector3(-0.35, 0, 0);
  }

  /* action — a machined actuator: pistons extend as work is done */
  {
    const m = shellModule('action', 0.36);
    const p = m.pivot;
    const body = mesh(new THREE.CapsuleGeometry(0.175, 0.34, 14, 48), mat.ink, 'action_body', p);
    body.rotation.z = Math.PI / 2;
    const collar = mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.085, 56), mat.steel, 'action_collar', p);
    collar.rotation.z = Math.PI / 2;
    collar.position.x = -0.02;
    const ring = mesh(new THREE.TorusGeometry(0.155, 0.017, 14, 64), m.light, 'action_light_ring', p);
    ring.rotation.y = Math.PI / 2;
    ring.position.x = 0.215;
    const pistons = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.3;
      const rod = mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.26, 20), mat.steel, 'action_piston_' + (i + 1), p);
      rod.rotation.z = Math.PI / 2;
      rod.position.set(0.10, Math.sin(a) * 0.145, Math.cos(a) * 0.145);
      pistons.push(rod);
      const cap = mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.03, 20), mat.ink, 'action_piston_cap_' + (i + 1), p);
      cap.rotation.z = Math.PI / 2;
      cap.position.set(0.235, Math.sin(a) * 0.145, Math.cos(a) * 0.145);
      pistons.push(cap);
    }
    m.parts.pistons = pistons;
    const heel = mesh(block(THREE, 0.09, 0.24, 0.24, 0.035), mat.graphite, 'action_heel', p);
    heel.position.x = -0.255;
    m.anchor = new THREE.Vector3(-0.36, 0, 0);
  }

  /* prediction — an aperture whose iris opens on a decision */
  {
    const m = shellModule('prediction', 0.36);
    const p = m.pivot;
    const ring = mesh(new THREE.TorusGeometry(0.30, 0.048, 22, 88), mat.ink, 'decision_ring', p);
    ring.rotation.y = Math.PI / 2;
    const rim = mesh(new THREE.TorusGeometry(0.30, 0.012, 12, 88), mat.steel, 'decision_rim', p);
    rim.rotation.y = Math.PI / 2;
    rim.position.x = 0.045;
    const blades = [];
    for (let i = 0; i < 3; i++) {
      const holder = new THREE.Group();
      holder.name = 'decision_blade_' + (i + 1);
      holder.rotation.x = (i / 3) * Math.PI * 2;
      p.add(holder);
      const blade = mesh(new THREE.TorusGeometry(0.215, 0.020, 10, 30, Math.PI * 0.55), mat.shell, 'decision_blade_arc_' + (i + 1), holder);
      blade.rotation.y = Math.PI / 2;
      blades.push(holder);
    }
    m.parts.blades = blades;
    const bead = mesh(new THREE.SphereGeometry(0.105, 44, 28), mat.shell, 'decision_bead', p);
    bead.position.x = 0.01;
    const beadCore = mesh(new THREE.SphereGeometry(0.062, 36, 24), m.light, 'decision_bead_light', p);
    beadCore.position.x = 0.055;
    m.parts.bead = bead;
    const stem = mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.16, 32), mat.graphite, 'decision_stem', p);
    stem.rotation.z = Math.PI / 2;
    stem.position.x = -0.20;
    m.anchor = new THREE.Vector3(-0.33, 0, 0);
  }

  /* --------------------------------------------------------------- links */

  const links = [];
  for (let i = 0; i < 3; i++) {
    const lm = new THREE.MeshStandardMaterial({
      color: 0x0d5a4e, roughness: 0.3, metalness: 0.1,
      emissive: 0x0d5a4e, emissiveIntensity: 0.5, transparent: true, opacity: 0,
    });
    lm.name = 'link_light_' + (i + 1);
    const sleeve = new THREE.MeshStandardMaterial({ color: 0x1b2723, roughness: 0.45, metalness: 0.3, transparent: true, opacity: 0 });
    sleeve.name = 'link_sleeve_' + (i + 1);
    const g = new THREE.Group();
    g.name = 'link_' + (i + 1);
    g.visible = false;
    root.add(g);
    const rod = mesh(new THREE.CylinderGeometry(0.034, 0.034, 1, 24, 1, true), sleeve, 'link_rod_' + (i + 1), g);
    rod.rotation.x = Math.PI / 2;
    rod.castShadow = false;
    const wire = mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 14, 1, true), lm, 'link_wire_' + (i + 1), g);
    wire.rotation.x = Math.PI / 2;
    wire.castShadow = false;
    const pulse = mesh(new THREE.SphereGeometry(0.05, 22, 16), lm, 'link_pulse_' + (i + 1), g);
    pulse.castShadow = false;
    links.push({ group: g, rod, wire, pulse, mats: [lm, sleeve] });
  }

  /* ------------------------------------------------------------- signals */

  const signalMat = new THREE.MeshStandardMaterial({ color: 0x0d5a4e, roughness: 0.35, metalness: 0.15, emissive: 0x0d5a4e, emissiveIntensity: 0.35, transparent: true, opacity: 0 });
  signalMat.name = 'signal';
  const signals = [];
  const signalGroup = new THREE.Group();
  signalGroup.name = 'signals';
  root.add(signalGroup);
  for (let i = 0; i < 12; i++) {
    const s = mesh(new THREE.SphereGeometry(0.03, 16, 12), signalMat, 'signal_' + (i + 1), signalGroup);
    s.castShadow = false;
    s.visible = false;
    signals.push(s);
  }

  const outMat = new THREE.MeshStandardMaterial({ color: 0xbe5410, roughness: 0.32, metalness: 0.1, emissive: 0xbe5410, emissiveIntensity: 0.8, transparent: true, opacity: 0 });
  outMat.name = 'output_signal';
  const output = mesh(new THREE.SphereGeometry(0.055, 24, 16), outMat, 'output_signal', root);
  output.castShadow = false;
  output.visible = false;

  /* ---------------------------------------------------------------- motes */

  const moteGeo = new THREE.BufferGeometry();
  const mp = new Float32Array(20 * 3);
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.15 + Math.random() * 1.0;
    const y = (Math.random() - 0.5) * 1.8;
    mp[i * 3] = Math.cos(a) * r;
    mp[i * 3 + 1] = y;
    mp[i * 3 + 2] = Math.sin(a) * r;
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const moteMat = new THREE.PointsMaterial({ color: 0x0d5a4e, size: 0.028, transparent: true, opacity: 0.3, depthWrite: false, sizeAttenuation: true });
  moteMat.name = 'motes';
  const motes = new THREE.Points(moteGeo, moteMat);
  motes.name = 'ambient_motes';
  root.add(motes);

  return {
    root, core, gimbal1, gimbal2, modules, links, signals, signalMat, output, outMat, motes,
    materials: mat, coreGlow,
    moduleIds: ['input', 'analysis', 'action', 'prediction'],
  };
}

const FORWARD = { x: 0, y: 0, z: 1 };

export function layoutLink(link, a, b) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  link.group.position.copy(mid);
  const dir = b.clone().sub(a).normalize();
  link.group.quaternion.setFromUnitVectors(new THREE.Vector3(FORWARD.x, FORWARD.y, FORWARD.z), dir);
  link.rod.scale.set(1, 1, Math.max(0.001, len));
  link.wire.scale.set(1, 1, Math.max(0.001, len));
}
