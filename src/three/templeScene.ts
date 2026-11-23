/**
 * THE SANCTUARY: closing scene.
 *
 * Angkor Wat's "ogival, redented towers shaped like lotus buds" rising in a
 * "central quincunx of towers" above "three progressively elevated galleries"
 * (KH-TWR-01), reached by a causeway with "naga shaped balustrades" (KH-NAG-02)
 * ending in three-headed naga fans (KH-NAG-01). All geometry is generated:
 *  - each tower tier is an ExtrudeGeometry of a redented (stepped-corner)
 *    square plan, scaled along the same ogival envelope as the 2D towers;
 *  - each finial is a lotus petal profile spun on a lathe: a lotus bud;
 *  - the balustrades are tubes along the causeway that rise into extruded fans.
 *
 * Dusk lighting; the camera orbits gently as the guest scrolls through the
 * section. Towers rise outer-first the first time the scene is shown.
 * Simplified massing: an evocation for an invitation, not a survey model.
 */
import * as THREE from 'three';
import { lotusPetal } from '../ornaments/geometry/lotus';
import { nagaFan, nagaHeadOutline } from '../ornaments/geometry/naga';
import { sampleOutline, transformOutline } from '../ornaments/geometry/path';
import { ease, phase } from '../motion/tokens';
import { makeEnvironment, makeRenderer, mergeByMaterial, outlineShape, readPalette, type Disposable, type SceneHandle } from './build';

/** Square plan with two re-entrant steps at each corner (redented), centred at 0. */
function redentedPlan(half: number, step = half * 0.16): THREE.Shape {
  const b = half;
  const s = step;
  // One corner (top-right), walked from the right edge to the top edge.
  const corner: [number, number][] = [
    [b, b - 2 * s],
    [b - s, b - 2 * s],
    [b - s, b - s],
    [b - 2 * s, b - s],
    [b - 2 * s, b],
  ];
  const pts: [number, number][] = [];
  for (let q = 0; q < 4; q++) {
    const a = (q * Math.PI) / 2;
    const c = Math.cos(a);
    const si = Math.sin(a);
    for (const [x, y] of corner) pts.push([x * c - y * si, x * si + y * c]);
  }
  const shape = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  return shape;
}

/** Ogival envelope shared with the 2D tower (src/ornaments/geometry/tower.ts). */
const envelope = (t: number) => Math.pow(Math.cos((t * Math.PI) / 2), 0.62) * (1 + 0.08 * Math.sin(t * Math.PI));

export class TempleScene implements SceneHandle {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
  private bag: Disposable[] = [];
  private towers: { group: THREE.Group; order: number }[] = [];
  private sun: THREE.DirectionalLight;
  private t0: number | null = null;
  private running = false;
  private progress = 0.5;
  private smooth = 0.5;
  private ro: ResizeObserver;
  private fitDistance = 22;

  constructor(private canvas: HTMLCanvasElement) {
    const pal = readPalette();
    this.renderer = makeRenderer(canvas, 1.5);
    this.scene.environment = makeEnvironment(this.renderer, this.bag);
    this.scene.environmentIntensity = 0.3;
    const night = new THREE.Color(pal.night);
    this.scene.fog = new THREE.Fog(night.clone().lerp(new THREE.Color(pal.accent), 0.12), 18, 40);

    // Angkor Wat's stone reads grey-gold at dusk: the theme sandstone, cooled toward grey.
    const stone = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.sandstone).lerp(new THREE.Color('#8f8676'), 0.55), roughness: 0.92 });
    const stoneShade = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.sandstone).lerp(new THREE.Color('#756c5f'), 0.6), roughness: 0.95 });
    const gilt = new THREE.MeshStandardMaterial({ color: pal.champagne, metalness: 0.9, roughness: 0.38 });
    const ground = new THREE.MeshStandardMaterial({ color: night.clone().lerp(new THREE.Color(pal.sandstone), 0.1), roughness: 1 });
    this.bag.push(stone, stoneShade, gilt, ground);

    this.buildGround(ground);
    this.buildTerraces(stone, stoneShade);
    this.buildTowers(stone, stoneShade, gilt);
    this.buildCauseway(stone, stoneShade, gilt);

    // Dusk: warm sky, dark earth, a low sun raking from behind-left, a soft front fill.
    this.scene.add(new THREE.HemisphereLight(0xffd6a0, 0x241a14, 0.75));
    this.sun = new THREE.DirectionalLight(0xffb26a, 3.2);
    this.sun.position.set(-9, 7, -10);
    this.scene.add(this.sun);
    const fill = new THREE.DirectionalLight(0xffe6c4, 0.9);
    fill.position.set(6, 8, 14);
    this.scene.add(fill);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
  }

  private buildGround(mat: THREE.Material) {
    const g = new THREE.CircleGeometry(40, 48);
    g.rotateX(-Math.PI / 2);
    this.bag.push(g);
    this.scene.add(new THREE.Mesh(g, mat));
  }

  /** Three progressively elevated galleries, simplified to stepped terraces. */
  private buildTerraces(stone: THREE.Material, shade: THREE.Material) {
    const levels = [
      { w: 13, d: 10, h: 0.7 },
      { w: 9.6, d: 7.4, h: 0.7 },
      { w: 6.6, d: 5.2, h: 0.65 },
    ];
    const group = new THREE.Group();
    let y = 0;
    for (const [i, l] of levels.entries()) {
      const g = new THREE.BoxGeometry(l.w, l.h, l.d);
      this.bag.push(g);
      const m = new THREE.Mesh(g, i % 2 ? shade : stone);
      m.position.y = y + l.h / 2;
      group.add(m);
      // Cornice lip on each terrace
      const lip = new THREE.BoxGeometry(l.w + 0.18, 0.08, l.d + 0.18);
      this.bag.push(lip);
      const lm = new THREE.Mesh(lip, stone);
      lm.position.y = y + l.h;
      group.add(lm);
      y += l.h;
    }
    this.scene.add(mergeByMaterial(group, this.bag));
  }

  private tower(height: number, half: number, stone: THREE.Material, shade: THREE.Material, gilt: THREE.Material) {
    const group = new THREE.Group();
    const bodyH = 0.24 * height;
    const bodyGeo = new THREE.ExtrudeGeometry(redentedPlan(half), { depth: bodyH, bevelEnabled: false });
    bodyGeo.rotateX(-Math.PI / 2);
    this.bag.push(bodyGeo);
    group.add(new THREE.Mesh(bodyGeo, stone));
    // Tiers: each a redented band and a slightly inset neck, following the ogive.
    const tiers = 10;
    const upper = 0.64 * height;
    const th = upper / tiers;
    for (let i = 0; i < tiers; i++) {
      const t = i / tiers;
      const hw = half * 1.04 * envelope(t);
      const band = new THREE.ExtrudeGeometry(redentedPlan(hw), { depth: th * 0.7, bevelEnabled: true, bevelSize: hw * 0.025, bevelThickness: th * 0.05, bevelSegments: 1 });
      band.rotateX(-Math.PI / 2);
      band.translate(0, bodyH + i * th, 0);
      const neck = new THREE.ExtrudeGeometry(redentedPlan(hw * 0.92), { depth: th * 0.3, bevelEnabled: false });
      neck.rotateX(-Math.PI / 2);
      neck.translate(0, bodyH + i * th + th * 0.7, 0);
      this.bag.push(band, neck);
      group.add(new THREE.Mesh(band, i % 2 ? shade : stone), new THREE.Mesh(neck, shade));
    }
    // Finial: a lotus petal profile spun on a lathe makes the lotus bud.
    const petal = sampleOutline(lotusPetal(half * 0.5, height * 0.13), 10)
      .filter(([x]) => x >= -1e-6)
      .map(([x, y]) => new THREE.Vector2(Math.max(0, x), -y))
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const finial = new THREE.LatheGeometry(petal, 12);
    finial.translate(0, bodyH + upper, 0);
    this.bag.push(finial);
    group.add(new THREE.Mesh(finial, gilt));
    // Doorway on the front face
    const door = new THREE.BoxGeometry(half * 0.5, bodyH * 0.62, 0.1);
    door.translate(0, bodyH * 0.31, half - 0.02);
    this.bag.push(door);
    const dm = new THREE.Mesh(door, new THREE.MeshBasicMaterial({ color: 0x2a1d16 }));
    this.bag.push(dm.material as THREE.Material);
    group.add(dm);
    return mergeByMaterial(group, this.bag);
  }

  private buildTowers(stone: THREE.Material, shade: THREE.Material, gilt: THREE.Material) {
    const top = 0.7 + 0.7 + 0.65;
    // Quincunx: four corner towers and a taller central tower on a raised plinth.
    const corner = [
      [-2.55, -1.85],
      [2.55, -1.85],
      [-2.55, 1.85],
      [2.55, 1.85],
    ];
    corner.forEach(([x, z], i) => {
      const g = new THREE.Group();
      g.add(this.tower(4.8, 0.5, stone, shade, gilt));
      g.position.set(x, top, z);
      this.scene.add(g);
      this.towers.push({ group: g, order: i < 2 ? 1 : 0 });
    });
    const plinthGeo = new THREE.BoxGeometry(2.4, 0.55, 2.4);
    plinthGeo.translate(0, top + 0.275, 0);
    this.bag.push(plinthGeo);
    this.scene.add(new THREE.Mesh(plinthGeo, shade));
    const c = new THREE.Group();
    c.add(this.tower(6.6, 0.68, stone, shade, gilt));
    c.position.set(0, top + 0.55, 0);
    this.scene.add(c);
    this.towers.push({ group: c, order: 2 });
  }

  /** Causeway toward the viewer, lined by naga balustrades that rise into three-headed fans. */
  private buildCauseway(stone: THREE.Material, shade: THREE.Material, gilt: THREE.Material) {
    const group = new THREE.Group();
    const path = new THREE.BoxGeometry(3.4, 0.22, 10);
    path.translate(0, 0.11, 10);
    this.bag.push(path);
    group.add(new THREE.Mesh(path, shade));
    const fanOutlines = nagaFan(3, 0.42, 0.62).map((h) => ({ hood: h.outline, head: transformOutline(nagaHeadOutline(0.42, 0.62), h.x, h.y, h.rot, h.scale) }));
    for (const side of [-1, 1]) {
      const x = side * 1.55;
      const pts = [new THREE.Vector3(x, 0.55, 5.4), new THREE.Vector3(x, 0.55, 9), new THREE.Vector3(x, 0.55, 12.6), new THREE.Vector3(x, 0.75, 13.8), new THREE.Vector3(x, 1.25, 14.4)];
      const body = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.13, 10, false);
      this.bag.push(body);
      group.add(new THREE.Mesh(body, stone));
      // Low plinth the body runs along
      const rail = new THREE.BoxGeometry(0.34, 0.42, 8);
      rail.translate(x, 0.21, 9);
      this.bag.push(rail);
      group.add(new THREE.Mesh(rail, shade));
      // Fan of heads, facing the approaching guest (+z)
      for (const f of fanOutlines) {
        for (const [o, d, z] of [
          [f.hood, 0.06, 0],
          [f.head, 0.05, 0.05],
        ] as const) {
          const geo = new THREE.ExtrudeGeometry(outlineShape(o), { depth: d, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.012, bevelSegments: 1, curveSegments: 4 });
          this.bag.push(geo);
          const m = new THREE.Mesh(geo, gilt);
          m.position.set(x, 1.25, 14.4 + z);
          group.add(m);
        }
      }
    }
    this.scene.add(mergeByMaterial(group, this.bag));
  }

  private resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Fit the temple: ~14 units wide on landscape screens, ~10 on portrait (the causeway may crop).
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const halfW = this.camera.aspect < 1 ? 5 : 7;
    this.fitDistance = Math.max(halfW / (tan * this.camera.aspect), 5.2 / tan);
    this.camera.updateProjectionMatrix();
    if (!this.running) this.render(0);
  }

  setProgress(p: number) {
    this.progress = p;
  }

  start() {
    if (this.running) return;
    this.running = true;
    if (this.t0 === null) this.t0 = performance.now();
    this.renderer.setAnimationLoop(() => this.render((performance.now() - this.t0!) / 1000));
  }

  stop() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  private render(t: number) {
    // Towers rise outer-first on first view.
    for (const { group, order } of this.towers) {
      const p = this.t0 === null ? 0 : ease.ceremonial(phase(t, 0.2 + order * 0.35, 1.8));
      group.scale.set(1, Math.max(0.001, p), 1);
    }
    // Scroll orbits the camera from the left of the causeway to the right; dusk deepens.
    this.smooth += (this.progress - this.smooth) * 0.06;
    const az = THREE.MathUtils.lerp(-0.42, 0.32, this.smooth) + Math.sin(t * 0.12) * 0.03;
    const dist = this.fitDistance;
    const height = THREE.MathUtils.lerp(4.2, 2.6, this.smooth);
    this.camera.position.set(Math.sin(az) * dist, height, 3 + Math.cos(az) * dist);
    this.camera.lookAt(0, 3.6, 0);
    this.sun.position.set(-9, THREE.MathUtils.lerp(8, 3.5, this.smooth), -10);
    this.sun.intensity = THREE.MathUtils.lerp(3.4, 2.2, this.smooth);
    this.renderer.render(this.scene, this.camera);
    if (!this.reported) {
      this.reported = true;
      this.canvas.dataset.drawCalls = String(this.renderer.info.render.calls);
      this.canvas.dataset.triangles = String(this.renderer.info.render.triangles);
    }
  }
  private reported = false;

  dispose() {
    this.stop();
    this.ro.disconnect();
    for (const d of this.bag) d.dispose();
    this.renderer.dispose();
  }
}
