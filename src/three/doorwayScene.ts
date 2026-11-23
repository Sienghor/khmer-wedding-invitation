/**
 * THE DOORWAY: ceremonial opening scene.
 *
 * A Khmer sanctuary doorway built entirely from code-generated geometry:
 *  - two octagonal ringed colonnettes (KH-COL-01): LatheGeometry with exactly
 *    8 radial segments, flat-shaded so the facets catch the light;
 *  - a sandstone lintel block carrying a gilt relief of the Banteay Srei-style
 *    lintel (KH-LIN-01): naga-bodied branches as tubes, vegetal loops as tubes
 *    ending in snail spirals (KH-KB-02), three-headed naga fans (KH-NAG-01) and
 *    lotus rosette (KH-LOT-02) as extruded shapes, and the lotus-petal row
 *    (KH-LOT-01) along the base;
 *  - above it, the Banteay Srei superposed fronton (KH-PED-01): frames as
 *    tubes rolling into terminal volutes, flame-leaf crests, tympanum foliage
 *    (KH-VIN-01) and rosette in relief on sandstone plates. The rear fronton is
 *    set back in depth, so the stacking is real, not drawn.
 * All 2D outlines come from src/ornaments/geometry, the same source the SVG
 * ornaments use.
 *
 * Choreography (seconds): colonnettes rise 0.2–1.9 · lintel settles 1.0–2.6 ·
 * raking light sweeps the relief 2.0–5.0 · camera breathes in throughout.
 * Rendering runs only while the gate is visible; dispose() frees GPU memory.
 */
import * as THREE from 'three';
import { colonnetteProfile } from '../ornaments/geometry/colonnette';
import { lintelLayout, SRALAO_ASPECT } from '../ornaments/geometry/lintel';
import { lotusPetal, lotusRosette } from '../ornaments/geometry/lotus';
import { nagaFan, nagaHeadOutline } from '../ornaments/geometry/naga';
import { pediment, superposedLayout } from '../ornaments/geometry/pediment';
import { transformOutline, type Outline, type Pt } from '../ornaments/geometry/path';
import { makeEnvironment, makeRenderer, mergeByMaterial, outlineShape, type SceneHandle } from './build';
import { ease, phase } from '../motion/tokens';
import { DOOR, DOOR_TOTAL_H, LINTEL_TOP, PED_K, PED_TIERS } from './doorwayGeometry';

export interface DoorwayOptions {
  canvas: HTMLCanvasElement;
  palette: { gold: string; champagne: string; sandstone: string; charcoal: string };
  reducedMotion: boolean;
  /** Measures the on-screen box the doorway must fill (CSS layout is the source of truth). */
  getFrameRect: () => DOMRect;
  /**
   * 'doorway': the full opening (colonnettes + lintel + threshold, assembly, pass-through).
   * 'lintel': the hero's lintel alone, which turns toward the pointer / with scroll
   * so raking light plays across the relief.
   */
  variant?: 'doorway' | 'lintel';
}

export class DoorwayScene implements SceneHandle {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  private pediment = new THREE.Group();
  /** Seconds since start(); null until the scene starts. */
  private t0: number | null = null;
  private elapsed = () => (this.t0 === null ? 0 : (performance.now() - this.t0) / 1000);
  private columns: THREE.Group[] = [];
  private lintel = new THREE.Group();
  private sweep: THREE.PointLight;
  private key: THREE.DirectionalLight;
  private disposables: { dispose(): void }[] = [];
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private baseDistance = 14;
  private opening: { start: number; resolve: () => void } | null = null;
  private running = false;
  private opts: DoorwayOptions;
  private ro: ResizeObserver;

  constructor(opts: DoorwayOptions) {
    this.opts = opts;
    const { canvas, palette } = opts;
    this.variant = opts.variant ?? 'doorway';
    this.renderer = makeRenderer(canvas);

    // Image-based lighting from a procedurally generated room: no texture files.
    this.scene.environment = makeEnvironment(this.renderer, this.disposables);
    this.scene.environmentIntensity = 0.42;
    // Turn the generated room so its brightest panels are not directly behind the camera:
    // flat gilt faces then read as gold, not white.
    this.scene.environmentRotation.set(0.55, 0.9, 0);

    const gold = new THREE.MeshStandardMaterial({ color: palette.champagne, metalness: 0.92, roughness: 0.42 });
    const goldDeep = new THREE.MeshStandardMaterial({ color: palette.gold, metalness: 0.9, roughness: 0.5 });
    const stone = new THREE.MeshStandardMaterial({ color: palette.sandstone, metalness: 0, roughness: 0.88 });
    const stoneDark = new THREE.MeshStandardMaterial({ color: new THREE.Color(palette.sandstone).multiplyScalar(0.62), roughness: 0.95 });
    this.disposables.push(gold, goldDeep, stone, stoneDark);

    if (this.variant === 'doorway') this.buildColumns(stone, goldDeep);
    this.buildLintel(stone, stoneDark, gold, goldDeep);
    if (this.variant === 'doorway') this.buildThreshold(stoneDark);
    if (this.variant === 'doorway') this.buildPediment(stone, stoneDark, gold, goldDeep);

    // Lighting: warm ambient + key from upper left + a raking sweep light for the relief.
    this.scene.add(new THREE.HemisphereLight(0xfff1da, 0x2a1a16, 0.55));
    this.key = new THREE.DirectionalLight(0xffe2b0, 2.2);
    this.key.position.set(-3, 6, 7);
    this.scene.add(this.key);
    const rim = new THREE.DirectionalLight(0xd5b77a, 1.2);
    rim.position.set(4, 2, -3);
    this.scene.add(rim);
    this.sweep = new THREE.PointLight(0xfff4dc, 0, 7, 1.6);
    this.sweep.position.set(-4, DOOR.threshold + DOOR.columnH + DOOR.lintelH * 0.5, 1.2);
    this.scene.add(this.sweep);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    window.addEventListener('pointermove', this.onPointer, { passive: true });
  }

  private buildColumns(stone: THREE.Material, rings: THREE.Material) {
    const prof = colonnetteProfile(DOOR.columnH, DOOR.columnR);
    const pts = prof.profile.map(([r, y]) => new THREE.Vector2(r, y));
    // 8 radial segments → a true octagon; rotate π/8 so a flat face meets the viewer.
    // Non-indexed geometry gives per-face normals: crisp, flat-shaded facets.
    const geo = new THREE.LatheGeometry(pts, 8, Math.PI / 8);
    geo.computeVertexNormals();
    const flat = geo.toNonIndexed();
    flat.computeVertexNormals();
    this.disposables.push(geo, flat);
    const ringGeo = new THREE.TorusGeometry(DOOR.columnR * 1.36, DOOR.columnR * 0.09, 6, 8);
    ringGeo.rotateX(Math.PI / 2);
    ringGeo.rotateY(Math.PI / 8);
    this.disposables.push(ringGeo);
    for (const side of [-1, 1]) {
      const g = new THREE.Group();
      const mesh = new THREE.Mesh(flat, stone);
      g.add(mesh);
      for (const ry of prof.rings) {
        const r = new THREE.Mesh(ringGeo, rings);
        r.position.y = ry;
        g.add(r);
      }
      g.position.set(side * DOOR.columnX, DOOR.threshold, 0);
      this.columns.push(g);
      this.scene.add(g);
    }
  }

  private buildLintel(stone: THREE.Material, stoneDark: THREE.Material, gold: THREE.Material, goldDeep: THREE.Material) {
    const W = DOOR.lintelW;
    const H = DOOR.lintelH;
    const depth = 0.5;
    // Sandstone block with softened arrises.
    const block = new THREE.Shape();
    block.moveTo(-W / 2, -H / 2);
    block.lineTo(W / 2, -H / 2);
    block.lineTo(W / 2, H / 2);
    block.lineTo(-W / 2, H / 2);
    const blockGeo = new THREE.ExtrudeGeometry(block, { depth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
    blockGeo.translate(0, 0, -depth);
    this.disposables.push(blockGeo);
    const blockMesh = new THREE.Mesh(blockGeo, stone);
    this.lintel.add(blockMesh);

    // Relief, laid out by the same function as the SVG lintel (units: 100 = H).
    const L = lintelLayout(100 * SRALAO_ASPECT, 100);
    const k = H / 100;
    const toW = ([x, y]: Pt, z = 0.03): THREE.Vector3 => new THREE.Vector3((x - L.W / 2) * k, (L.H / 2 - y) * k, z);
    const relief = new THREE.Group();

    const addTube = (pts: Pt[], radius: number, mat: THREE.Material, mirror = true) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => toW(p, 0.05)));
      const geo = new THREE.TubeGeometry(curve, Math.max(24, pts.length * 3), radius, 8, false);
      geo.scale(1, 1, 0.55); // flatten into relief
      this.disposables.push(geo);
      const m = new THREE.Mesh(geo, mat);
      relief.add(m);
      if (mirror) {
        const mm = new THREE.Mesh(geo, mat);
        mm.scale.x = -1;
        relief.add(mm);
      }
    };
    const addShape = (o: Outline, at: Pt, rotDeg: number, scale: number, thick: number, mat: THREE.Material, mirror = true, z = 0.03) => {
      const geo = new THREE.ExtrudeGeometry(outlineShape(o), { depth: thick, bevelEnabled: true, bevelSize: thick * 0.4, bevelThickness: thick * 0.5, bevelSegments: 2, curveSegments: 6 });
      this.disposables.push(geo);
      const place = (sx: number) => {
        const m = new THREE.Mesh(geo, mat);
        const p = toW(at, z);
        m.position.set(p.x * sx, p.y, p.z);
        m.rotation.z = ((-rotDeg * Math.PI) / 180) * sx;
        m.scale.set(scale * k * sx, scale * k, 1);
        relief.add(m);
      };
      place(1);
      if (mirror) place(-1);
    };

    // Fillets along the top
    for (const f of L.fillets) {
      const g = new THREE.BoxGeometry(W * 0.98, f.h * k, 0.06);
      this.disposables.push(g);
      const m = new THREE.Mesh(g, goldDeep);
      m.position.copy(toW([L.W / 2, f.y + f.h / 2], 0.03));
      relief.add(m);
    }
    // Naga-bodied branches and vegetal loops
    addTube(L.branch, (L.bodyThickness / 2) * k * 0.9, gold);
    for (const lp of L.loops) addTube(lp.pts, 0.012 * H * lp.weight, gold);
    // Three-headed naga fans: small along the branch, large at the ends
    const addFan = (at: Pt, rot: number, w: number, h: number, thick: number) => {
      const headOutline = nagaHeadOutline(w, h);
      // Eyes are left to the SVG rendering: as dark spheres on flat gilt they read
      // as cartoon faces, while the raised head layer alone carries the carved form.
      for (const hd of nagaFan(3, w, h)) {
        addShape(hd.outline, at, rot, 1, thick, gold); // hood
        addShape(transformOutline(headOutline, hd.x, hd.y, hd.rot, hd.scale), at, rot, 1, thick * 0.8, gold, true, 0.03 + thick * 1.6); // head over hood
      }
    };
    for (const c of L.crests) addFan(c, 0, L.crestSize.w, L.crestSize.h, 0.025);
    addFan([L.endFan.x, L.endFan.y], L.endFan.rot, L.endFan.w, L.endFan.h, 0.04);
    // Central lotus rosette in its ring
    const ringGeo = new THREE.TorusGeometry(L.medallion.R * k, 0.018 * H, 8, 64);
    this.disposables.push(ringGeo);
    const ring = new THREE.Mesh(ringGeo, gold);
    ring.position.copy(toW([L.medallion.cx, L.medallion.cy], 0.05));
    relief.add(ring);
    const ros = lotusRosette(L.medallion.R * 0.84);
    ros.layers.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        addShape(layer.petal, [L.medallion.cx, L.medallion.cy], layer.rotationOffset + (360 / layer.count) * i, 1, 0.02 + li * 0.012, li === 0 ? goldDeep : gold, false, 0.03 + li * 0.025);
      }
    });
    // Lotus-petal row along the base of the lintel (petals point up)
    const petal = lotusPetal(L.lotusRow.tileW * 0.92, L.lotusRow.h * 0.86);
    const count = Math.floor(L.W / L.lotusRow.tileW);
    const x0 = L.W / 2 - Math.floor(count / 2) * L.lotusRow.tileW;
    for (let i = 0; i < count; i++) addShape(petal, [x0 + i * L.lotusRow.tileW, L.lotusRow.y + L.lotusRow.h], 0, 1, 0.025, goldDeep, false);
    // Shadow band behind the lotus row to seat it in the stone
    const bandGeo = new THREE.BoxGeometry(W * 0.98, L.lotusRow.h * k, 0.02);
    this.disposables.push(bandGeo);
    const band = new THREE.Mesh(bandGeo, stoneDark);
    band.position.copy(toW([L.W / 2, L.lotusRow.y + L.lotusRow.h / 2], 0.005));
    relief.add(band);

    this.lintel.add(mergeByMaterial(relief, this.disposables));
    this.lintel.position.set(0, DOOR.threshold + DOOR.columnH + H / 2, 0.05);
    this.scene.add(this.lintel);
  }

  /** KH-PED-01 in relief: same geometry as the SVG <Pediment>, scaled by PED_K. */
  private buildPediment(stone: THREE.Material, stoneDark: THREE.Material, gold: THREE.Material, goldDeep: THREE.Material) {
    const W = 300;
    const p = pediment(W, W * 0.44);
    const k = PED_K;
    const toV = ([x, y]: Pt, z: number) => new THREE.Vector3(x * k, -y * k, z);
    const tier = (plate: THREE.Material) => {
      const g = new THREE.Group();
      const tube = (pts: Pt[], r: number, mat: THREE.Material, z = 0.04) => {
        const curve = new THREE.CatmullRomCurve3(pts.map((q) => toV(q, z)));
        const geo = new THREE.TubeGeometry(curve, Math.max(24, pts.length * 3), r, 8, false);
        geo.scale(1, 1, 0.6);
        this.disposables.push(geo);
        for (const sx of [1, -1]) {
          const m = new THREE.Mesh(geo, mat);
          m.scale.x = sx;
          g.add(m);
        }
      };
      const shape = (o: Outline, at: Pt, rotDeg: number, sy: number, thick: number, mat: THREE.Material, z: number, mirror = true) => {
        const geo = new THREE.ExtrudeGeometry(outlineShape(o), { depth: thick, bevelEnabled: true, bevelSize: thick * 0.4, bevelThickness: thick * 0.5, bevelSegments: 2, curveSegments: 6 });
        this.disposables.push(geo);
        for (const sx of mirror ? [1, -1] : [1]) {
          const m = new THREE.Mesh(geo, mat);
          const v = toV(at, z);
          m.position.set(v.x * sx, v.y, v.z);
          m.rotation.z = ((-rotDeg * Math.PI) / 180) * sx;
          m.scale.set(k * sx, k * sy, 1);
          g.add(m);
        }
      };
      // Sandstone tympanum plate, bounded by the frame's centreline.
      const slope = p.frame.slice(0, p.voluteStart + 1);
      const end = slope[slope.length - 1];
      const plateShape = new THREE.Shape();
      plateShape.moveTo(-end[0] * k, 0);
      [...slope].reverse().forEach(([x, y]) => plateShape.lineTo(-x * k, -y * k));
      slope.forEach(([x, y]) => plateShape.lineTo(x * k, -y * k));
      plateShape.lineTo(end[0] * k, 0);
      const plateGeo = new THREE.ExtrudeGeometry(plateShape, { depth: 0.16, bevelEnabled: false });
      plateGeo.translate(0, 0, -0.16);
      this.disposables.push(plateGeo);
      g.add(new THREE.Mesh(plateGeo, plate));
      // Frame: sweeping slope rolling into the terminal volute; flame-leaf crest; finial.
      tube(p.frame, (p.band / 2) * k, gold, 0.03);
      for (const l of p.crest) shape(l.outline, [l.x, l.y], l.rot, l.sy, 0.03, gold, 0.02);
      shape(p.finialOutline, [0, 0], 0, 1, 0.04, gold, 0.02, false);
      // Tympanum: volutes of foliage and leaves around a lotus rosette.
      p.foliage.forEach((pts, i) => tube(pts, (i === 0 ? 1.5 : 1.1) * k, goldDeep, 0.02));
      for (const l of p.foliageLeaves) shape(l.outline, [l.x, l.y], l.rot, l.sy, 0.02, goldDeep, 0.01);
      const ros = lotusRosette(p.rosette.r);
      ros.layers.forEach((layer, li) => {
        for (let i = 0; i < layer.count; i++) {
          shape(layer.petal, [p.rosette.cx, p.rosette.cy], layer.rotationOffset + (360 / layer.count) * i, 1, 0.015 + li * 0.01, li === 0 ? goldDeep : gold, 0.01 + li * 0.02, false);
        }
      });
      return g;
    };
    for (const t of superposedLayout(W * 0.44, PED_TIERS)) {
      const g = tier(t.depth ? stoneDark : stone);
      const merged = mergeByMaterial(g, this.disposables);
      merged.scale.setScalar(t.s);
      // Rear frontons step up and back: the stacking is real depth.
      merged.position.set(0, -t.dy * k, -t.depth * 0.32);
      this.pediment.add(merged);
    }
    this.pediment.position.set(0, LINTEL_TOP, -0.12);
    this.scene.add(this.pediment);
  }

  private buildThreshold(stoneDark: THREE.Material) {
    const g = new THREE.BoxGeometry(DOOR.lintelW * 1.04, DOOR.threshold, 0.9);
    this.disposables.push(g);
    const m = new THREE.Mesh(g, stoneDark);
    m.position.set(0, DOOR.threshold / 2, -0.1);
    this.scene.add(m);
  }

  private onPointer = (e: PointerEvent) => {
    this.pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };

  /** Fit the doorway exactly to the CSS frame box, so HTML overlays line up with the 3D opening. */
  private resize() {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const frame = this.opts.getFrameRect();
    const canvasRect = canvas.getBoundingClientRect();
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    // Distance at which the doorway's height spans the frame box's pixel height.
    this.baseDistance = (this.frameHeight() * h) / (frame.height * 2 * tan);
    // Shift so the doorway centre sits at the frame centre.
    const worldPerPx = (2 * this.baseDistance * tan) / h;
    const dy = (frame.top + frame.height / 2 - (canvasRect.top + h / 2)) * worldPerPx;
    const dx = (frame.left + frame.width / 2 - (canvasRect.left + w / 2)) * worldPerPx;
    this.viewOffset.set(-dx, dy);
    this.camera.updateProjectionMatrix();
    if (!this.running) this.renderFrame(this.elapsed());
  }
  private viewOffset = new THREE.Vector2();
  private variant: 'doorway' | 'lintel';
  private frameHeight = () => (this.variant === 'lintel' ? DOOR.lintelH * 1.12 : DOOR_TOTAL_H);
  private centreY = () => (this.variant === 'lintel' ? DOOR.threshold + DOOR.columnH + DOOR.lintelH / 2 : DOOR_TOTAL_H / 2);
  private progress = 0.5;
  /** Hero variant: scroll position tilts the lintel so light rakes across the carving. */
  setProgress(p: number) {
    this.progress = p;
  }

  start() {
    if (this.running) return;
    this.running = true;
    if (this.t0 === null) this.t0 = performance.now();
    this.renderer.setAnimationLoop(() => this.renderFrame(this.elapsed()));
  }

  stop() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  /** Camera passes through the doorway. Resolves when the move completes. */
  open(): Promise<void> {
    return new Promise((resolve) => {
      if (this.opts.reducedMotion) return resolve();
      this.opening = { start: this.elapsed(), resolve };
    });
  }

  private renderFrame(t: number) {
    const rm = this.opts.reducedMotion;
    const cy = this.centreY();
    if (this.variant === 'lintel') return this.renderLintelFrame(t, cy);

    // Assembly
    const colP = rm ? 1 : ease.ceremonial(phase(t, 0.2, 1.7));
    this.columns.forEach((c, i) => {
      const p = rm ? 1 : ease.ceremonial(phase(t, 0.2 + i * 0.12, 1.7));
      c.position.y = DOOR.threshold - (1 - p) * 1.6;
      c.scale.setScalar(0.96 + 0.04 * p);
    });
    const linP = rm ? 1 : ease.ceremonial(phase(t, 1.0, 1.6));
    this.lintel.position.y = DOOR.threshold + DOOR.columnH + DOOR.lintelH / 2 + (1 - linP) * 1.4;
    this.lintel.rotation.x = (1 - linP) * -0.25;
    // The fronton settles onto the lintel last.
    const pedP = rm ? 1 : ease.ceremonial(phase(t, 1.5, 1.6));
    this.pediment.position.y = LINTEL_TOP + (1 - pedP) * 1.2;
    this.pediment.rotation.x = (1 - pedP) * -0.3;
    this.pediment.visible = pedP > 0.001;

    // Raking light across the relief, then a slow idle drift
    const sw = phase(t, 2.0, 3.0);
    const idle = Math.sin((t - 5) * 0.35);
    this.sweep.position.x = rm ? 1.2 : t < 5 ? -3.2 + ease.silk(sw) * 6.4 : 3.2 * idle;
    this.sweep.intensity = rm ? 3 : (t < 5 ? Math.sin(Math.PI * sw) * 9 : 0) + phase(t, 4.6, 1.2) * 3.2;
    this.key.intensity = 0.6 + 1.6 * colP;

    // Camera: slow push-in, pointer parallax, then (on open) pass through the doorway
    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.05;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.05;
    const push = rm ? 1 : ease.silk(phase(t, 0, 5));
    let dist = this.baseDistance * (1.08 - 0.08 * push);
    let lift = 0;
    if (this.opening) {
      const p = ease.silk(phase(t, this.opening.start, 1.5));
      dist = dist * (1 - p) + -1.5 * p;
      lift = -p * (cy - DOOR.threshold - DOOR.columnH * 0.45);
      if (p >= 1) {
        const r = this.opening.resolve;
        this.opening = null;
        r();
      }
    }
    const px = rm ? 0 : this.pointer.x * 0.35;
    const py = rm ? 0 : this.pointer.y * 0.2;
    this.camera.position.set(this.viewOffset.x + px, cy + this.viewOffset.y - py + lift, dist);
    this.camera.lookAt(this.viewOffset.x, cy + this.viewOffset.y + lift, 0);
    this.renderer.render(this.scene, this.camera);
    if (!this.reported) {
      this.reported = true;
      // Exposed for QA (scripts/qa.mjs): draw calls and triangles of the first frame.
      this.renderer.domElement.dataset.drawCalls = String(this.renderer.info.render.calls);
      this.renderer.domElement.dataset.triangles = String(this.renderer.info.render.triangles);
    }
  }
  private reported = false;

  private renderLintelFrame(t: number, cy: number) {
    // A gentle settle, then the lintel turns with the pointer (desktop) or scroll (touch).
    const settle = ease.ceremonial(phase(t, 0, 1.6));
    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.06;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.06;
    const scrollTilt = (this.progress - 0.5) * 0.5;
    this.lintel.position.y = cy + (1 - settle) * 0.25;
    this.lintel.rotation.x = (1 - settle) * -0.3 + scrollTilt + this.pointer.y * 0.1;
    this.lintel.rotation.y = this.pointer.x * 0.22;
    // Raking light drifts slowly across the relief.
    this.sweep.position.x = Math.sin(t * 0.45) * 2.6;
    this.sweep.intensity = 3.6 * settle;
    this.key.intensity = 1.9;
    this.camera.position.set(this.viewOffset.x, cy + this.viewOffset.y, this.baseDistance);
    this.camera.lookAt(this.viewOffset.x, cy + this.viewOffset.y, 0);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.ro.disconnect();
    window.removeEventListener('pointermove', this.onPointer);
    for (const d of this.disposables) d.dispose();
    this.renderer.dispose();
  }
}
