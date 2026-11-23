/**
 * KH-VIN-01: Banteay Srei foliated scroll (rinceau).
 *
 * Glaize: "coiling vegetation … stretching in flames and rolling in volutes,
 * forming vertical bands or a succession of foliated scrolls". Pilasters
 * "formed long vertical bands, designed … for the vertical repetition of
 * identical motifs".
 *
 * Two tiles are generated:
 *  - scrollTile: one period of a horizontal running scroll (wave stem, a
 *    branch rolling into a volute in each hollow, a flame leaf at each branch).
 *  - pilasterTile: one repeat of a vertical, bilaterally symmetric motif
 *    (central stem, a pair of volutes, flame leaves rising).
 * Both are pure path data so SVG <pattern>s and Three.js tubes can share them.
 */
import { logSpiral, outlineToPath, smoothPath, type Outline, type Pt } from './path.ts';

/**
 * Flame leaf: a slender leaf whose tip bends over, like a tongue of flame.
 * Base at (0,0), pointing along +x, tip curling toward -y.
 */
export function flameLeafOutline(len: number, w: number, bend = 0.35): Outline {
  const b = len * bend;
  return {
    start: [0, 0],
    segs: [
      [[len * 0.25, -w * 0.62], [len * 0.7, -w * 0.55 - b * 0.55], [len, -b]],
      [[len * 0.85, -b * 0.4 + w * 0.1], [len * 0.35, w * 0.55], [0, 0]],
    ],
  };
}

export const flameLeaf = (len: number, w: number, bend = 0.35): Outline => flameLeafOutline(len, w, bend);

export interface ScrollTile {
  w: number;
  h: number;
  /** Stem across the whole tile (open path). */
  stem: string;
  /** Branches rolling into volutes (open paths). */
  volutes: string[];
  /** Flame leaves (closed paths with placement). */
  leaves: PlacedLeaf[];
  /** Small buds at volute centres. */
  buds: Pt[];
}

/**
 * One period of the running scroll. The second half is the first mirrored
 * across the band's centre line, so the volutes alternate above and below.
 */
export function scrollTile(w: number, h: number): ScrollTile {
  const cy = h / 2;
  const A = h * 0.17;
  const stemPts: Pt[] = [];
  for (let i = 0; i <= 32; i++) {
    const x = (i / 32) * w;
    stemPts.push([x, cy - A * Math.sin((2 * Math.PI * x) / w)]);
  }
  const volutes: string[] = [];
  const leaves: PlacedLeaf[] = [];
  const buds: Pt[] = [];
  for (const k of [0, 1] as const) {
    // k = 0: the stem arches up (crest at w/4) and the volute rolls in the space beneath the arch.
    const s = k === 0 ? 1 : -1;
    const ox = k * (w / 2);
    const r0 = h * 0.27;
    const c: Pt = [ox + w * 0.27, cy + s * h * 0.1];
    const spring: Pt = [ox + w * 0.06, cy - s * A * 0.36];
    const coil = logSpiral(c[0], c[1], r0, 1.3, s === 1 ? Math.PI * 1.05 : -Math.PI * 1.05, s === 1 ? -1 : 1, 0.22);
    volutes.push(smoothPath([spring, [ox + w * 0.09, cy + s * h * 0.08], ...coil]));
    buds.push(coil[coil.length - 1]);
    // Flame leaf rising from the crest of the stem, leaning forward.
    leaves.push(placeLeaf(flameLeaf(w * 0.17, h * 0.17, 0.5), ox + w * 0.25, cy - s * A, s === 1 ? -35 : 35, s));
    // Flame leaf springing back from the branch point.
    leaves.push(placeLeaf(flameLeaf(w * 0.13, h * 0.14, 0.45), ox + w * 0.05, cy - s * A * 0.3, s === 1 ? 205 : 155, -s));
  }
  return { w, h, stem: smoothPath(stemPts), volutes, leaves, buds };
}

export interface PlacedLeaf {
  outline: Outline;
  /** SVG path data of the outline (leaf coordinates). */
  d: string;
  x: number;
  y: number;
  /** Rotation in degrees (SVG convention, y down). */
  rot: number;
  /** −1 flips the leaf across its own axis. */
  sy: 1 | -1;
  /** SVG transform placing the leaf in tile coordinates. */
  transform: string;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Place a leaf: translate, rotate (degrees), and flip across its axis when s < 0. */
export function placeLeaf(outline: Outline, x: number, y: number, rot: number, s = 1): PlacedLeaf {
  const sy = s < 0 ? -1 : 1;
  return { outline, d: outlineToPath(outline), x, y, rot, sy, transform: `translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(1 ${sy})` };
}

export interface PilasterTile {
  w: number;
  h: number;
  stem: string;
  volutes: string[];
  leaves: PlacedLeaf[];
  buds: Pt[];
}

/**
 * Vertical pilaster repeat (axis x = w/2, flow bottom → top). Each tile holds
 * one symmetric "node": two branches leave the stem, sweep outward and roll
 * downward into volutes; flame leaves rise beside the stem above them.
 */
export function pilasterTile(w: number, h: number): PilasterTile {
  const cx = w / 2;
  const volutes: string[] = [];
  const leaves: PlacedLeaf[] = [];
  const buds: Pt[] = [];
  for (const side of [1, -1] as const) {
    const node: Pt = [cx, h * 0.62];
    const c: Pt = [cx + side * w * 0.26, h * 0.6];
    const r0 = w * 0.2;
    const coil = logSpiral(c[0], c[1], r0, 1.2, side === 1 ? -Math.PI * 0.55 : -Math.PI * 0.45, side === 1 ? 1 : -1, 0.24);
    volutes.push(smoothPath([node, [cx + side * w * 0.06, h * 0.44], ...coil]));
    buds.push(coil[coil.length - 1]);
    // Leaf rising and bending outward above the volute.
    leaves.push(placeLeaf(flameLeaf(h * 0.34, w * 0.2, 0.4), cx + side * w * 0.03, h * 0.4, side === 1 ? -70 : -110, side === 1 ? -1 : 1));
    // Small leaf hanging below the volute, toward the next node.
    leaves.push(placeLeaf(flameLeaf(h * 0.2, w * 0.13, 0.5), cx + side * w * 0.04, h * 0.9, side === 1 ? 35 : 145, side === 1 ? 1 : -1));
  }
  const stem = `M${cx} ${h}V0`;
  return { w, h, stem, volutes, leaves, buds };
}
