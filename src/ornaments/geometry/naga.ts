/**
 * Naga geometry.
 *  - KH-NAG-01  Multi-headed naga fan: heads "always uneven in number, arranged
 *               in a fan", each with "a flared hood, in the manner of a cobra".
 *  - KH-NAG-02  Naga balustrade (Angkor Wat causeway).
 */
import { mirrorClose, outlineToPath, smoothPath, transformOutline, offsetPolyline, type Outline, type Pt } from './path.ts';

/**
 * One hooded head: a rounded cobra head that opens into a flared hood and
 * narrows to the neck. Neck centred at (0, 0), crown at (0, -h).
 */
export function nagaHood(w: number, h: number): Outline {
  return mirrorClose([0, -h], [
    // pointed crown
    [[0.03 * w, -0.97 * h], [0.12 * w, -0.93 * h], [0.22 * w, -0.86 * h]],
    // the flare: widest point of the cobra hood
    [[0.37 * w, -0.76 * h], [0.51 * w, -0.6 * h], [0.49 * w, -0.41 * h]],
    // taper to the neck
    [[0.47 * w, -0.23 * h], [0.29 * w, -0.1 * h], [0.2 * w, 0]],
    [[0.13 * w, 0], [0.07 * w, 0], [0, 0]],
  ]);
}

export interface HoodDetail {
  /** The head itself, seen frontally, lying over the flared hood. */
  head: string;
  eyes: Pt[];
  eyeR: number;
  /** Hood markings down the centre line. */
  marks: Pt[];
  markR: number;
  /** Snout ridge and inner hood line (stroke only). */
  lines: string[];
}

/** The frontal head that lies over the hood (same local frame as nagaHood). */
export function nagaHeadOutline(w: number, h: number): Outline {
  return mirrorClose([0, -0.94 * h], [
    [[0.12 * w, -0.94 * h], [0.21 * w, -0.88 * h], [0.21 * w, -0.78 * h]],
    [[0.21 * w, -0.67 * h], [0.11 * w, -0.57 * h], [0, -0.55 * h]],
  ]);
}

/** Restrained carving detail: eyes, snout ridge, inner hood line. No mouth. */
export function nagaHoodDetail(w: number, h: number): HoodDetail {
  const lines = [
    smoothPath([
      [0, -0.9 * h],
      [0, -0.76 * h],
      [0, -0.6 * h],
    ]),
    smoothPath([
      [-0.26 * w, -0.68 * h],
      [-0.36 * w, -0.5 * h],
      [-0.27 * w, -0.28 * h],
      [0, -0.13 * h],
      [0.27 * w, -0.28 * h],
      [0.36 * w, -0.5 * h],
      [0.26 * w, -0.68 * h],
    ]),
  ];
  const head = outlineToPath(nagaHeadOutline(w, h));
  return {
    head,
    eyes: [
      [-0.1 * w, -0.8 * h],
      [0.1 * w, -0.8 * h],
    ],
    eyeR: 0.034 * w,
    marks: [
      [0, -0.46 * h],
      [0, -0.37 * h],
      [0, -0.28 * h],
    ],
    markR: 0.03 * w,
    lines,
  };
}

export interface FanHead {
  outline: Outline;
  path: string;
  /** Transform applied to the head's local detail (eyes, lines). */
  x: number;
  y: number;
  rot: number;
  scale: number;
  /** Draw order: outer heads first. */
  depth: number;
}

/**
 * Arrange `count` heads in a fan about a shared neck at the origin.
 * Throws on an even count: the source documents an odd number of heads.
 */
export function nagaFan(count: number, w: number, h: number): FanHead[] {
  if (count < 1 || count % 2 === 0) {
    throw new Error(`Khmer naga heads are always an odd number (got ${count}). See KH-NAG-01.`);
  }
  const mid = (count - 1) / 2;
  const step = count === 3 ? 27 : count === 5 ? 21 : 16;
  const base = nagaHood(w, h);
  const heads: FanHead[] = [];
  for (let i = 0; i < count; i++) {
    const k = i - mid;
    const rot = k * step;
    const scale = Math.pow(0.88, Math.abs(k));
    // Raise each head slightly along its own axis so the necks merge into one body.
    const lift = h * 0.18;
    const r = (rot * Math.PI) / 180;
    const x = Math.sin(r) * lift;
    const y = -Math.cos(r) * lift + h * 0.18;
    const outline = transformOutline(base, x, y, rot, scale);
    heads.push({ outline, path: outlineToPath(outline), x, y, rot, scale, depth: Math.abs(k) });
  }
  return heads.sort((a, b) => b.depth - a.depth);
}

/** Neck/body column under the fan (a tapering band). */
export function nagaNeck(w: number, h: number, length: number): string {
  // Tapering body that flows out of the fan and rounds off at the bottom.
  const top = -h * 0.06;
  const t = 0.19 * w;
  const bot = top + length;
  const b = 0.3 * w;
  return `M${-t} ${top}C${-t} ${top + length * 0.45} ${-b} ${bot - length * 0.3} ${-b} ${bot}Q0 ${bot + b * 0.6} ${b} ${bot}C${b} ${bot - length * 0.3} ${t} ${top + length * 0.45} ${t} ${top}Z`;
}

export interface Balustrade {
  bodyTop: string;
  bodyBottom: string;
  body: string;
  scales: Pt[];
  /** Causeway plinth the balustrade runs along. */
  plinth: { x: number; y: number; w: number; h: number };
  /** Where the head fan sits (neck point) and its outward rotation. */
  fanAt: Pt;
}

/**
 * Horizontal naga balustrade from x0 to x1 along y, rising at x1 into the fan.
 * Drawn for the right-hand side; mirror with a transform for the left.
 */
export function nagaBalustrade(x0: number, x1: number, y: number, thickness: number): Balustrade {
  const rise = thickness * 3.2;
  const center: Pt[] = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    // Flat run, then a smooth S-rise into the raised neck near the end.
    const e = Math.max(0, (t - 0.8) / 0.2);
    const yy = y - rise * (e * e * (3 - 2 * e));
    center.push([x, yy]);
  }
  const top = offsetPolyline(center, -thickness / 2);
  const bottom = offsetPolyline(center, thickness / 2);
  const body = `${smoothPath(top)}L${bottom[bottom.length - 1][0]} ${bottom[bottom.length - 1][1]}${smoothPath([...bottom].reverse()).replace(/^M[^C]+/, '')}Z`;
  const scales: Pt[] = [];
  for (let i = 1; i < n * 0.8; i += 2) scales.push(center[i]);
  const plinth = { x: x0, y: y + thickness * 0.55, w: (x1 - x0) * 0.86, h: thickness * 0.9 };
  return { bodyTop: smoothPath(top), bodyBottom: smoothPath(bottom), body, scales, plinth, fanAt: center[n] };
}
