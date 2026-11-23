/**
 * Shared Three.js builders for the code-generated scenes (doorway, hero lintel, temple).
 * Every shape here comes from src/ornaments/geometry: no textures, no model files.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sampleOutline, type Outline } from '../ornaments/geometry/path';

export type Disposable = { dispose(): void };

/** 2D outline (y down, SVG convention) → THREE.Shape (y up). */
export function outlineShape(o: Outline, flipY = true, per = 8) {
  const pts = sampleOutline(o, per);
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, flipY ? -y : y) : s.moveTo(x, flipY ? -y : y)));
  return s;
}

/** Procedural studio environment for metal reflections (RoomEnvironment, generated in code). */
export function makeEnvironment(renderer: THREE.WebGLRenderer, bag: Disposable[]) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  bag.push(pmrem, env);
  return env;
}

export function makeRenderer(canvas: HTMLCanvasElement, maxDpr = 1.75) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.setClearColor(0x000000, 0);
  return r;
}

/** Read the live theme palette from CSS custom properties. */
export function readPalette() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fb: string) => css.getPropertyValue(name).trim() || fb;
  return {
    gold: v('--c-gold', '#A77B42'),
    champagne: v('--c-champagne', '#D5B77A'),
    sandstone: v('--c-sandstone', '#B48474'),
    charcoal: v('--c-charcoal', '#24201C'),
    night: v('--c-night', '#1B1714'),
    accent: v('--c-accent', '#632E32'),
  };
}

/**
 * Bake every mesh under `group` into one mesh per material: a handful of draw
 * calls instead of hundreds. Mirrored parts (negative scale) get their triangle
 * winding flipped back so they stay front-facing.
 */
export function mergeByMaterial(group: THREE.Object3D, bag: Disposable[]): THREE.Group {
  group.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    const local = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
    g.applyMatrix4(local);
    if (local.determinant() < 0) {
      for (const attr of [g.attributes.position, g.attributes.normal, g.attributes.uv]) {
        if (!attr) continue;
        for (let i = 0; i < attr.count; i += 3) {
          for (let c = 0; c < attr.itemSize; c++) {
            const a = attr.getComponent(i + 1, c);
            attr.setComponent(i + 1, c, attr.getComponent(i + 2, c));
            attr.setComponent(i + 2, c, a);
          }
        }
      }
    }
    g.clearGroups();
    const mat = m.material as THREE.Material;
    if (!buckets.has(mat)) buckets.set(mat, []);
    buckets.get(mat)!.push(g);
  });
  const out = new THREE.Group();
  for (const [mat, geos] of buckets) {
    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (!merged) continue;
    bag.push(merged);
    out.add(new THREE.Mesh(merged, mat));
  }
  return out;
}

/** Minimal interface every scene exposes to its React host. */
export interface SceneHandle {
  start(): void;
  stop(): void;
  dispose(): void;
  /** Scroll progress of the host element through the viewport: 0 entering, 1 leaving. */
  setProgress?(p: number): void;
}
