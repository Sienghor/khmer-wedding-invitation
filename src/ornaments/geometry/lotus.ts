/**
 * Lotus geometry.
 *  - KH-LOT-01  Upward lotus-petal moulding band (petals ALWAYS point up).
 *  - KH-LOT-02  Lotus rosette (frontal lotus), Angkor Wat gallery ceilings.
 */
import { mirrorClose, type Outline, type Pt } from './path.ts';

/**
 * A single upward lotus petal: pointed ogival form, base on y = 0, tip at y = -h.
 * Authored as a right half and mirrored, so it is exactly symmetric.
 */
export function lotusPetal(w: number, h: number): Outline {
  const start: Pt = [0, -h];
  return mirrorClose(start, [
    [[0.02 * w, -0.955 * h], [0.07 * w, -0.915 * h], [0.17 * w, -0.85 * h]],
    [[0.43 * w, -0.7 * h], [0.5 * w, -0.43 * h], [0.5 * w, 0]],
    [[0.33 * w, 0], [0.17 * w, 0], [0, 0]],
  ]);
}

export interface PetalBandTile {
  width: number;
  height: number;
  /** Petal outlines placed in tile coordinates (y down, baseline at `height`). */
  front: Outline;
  frontInner: Outline;
  back: Outline[];
  midrib: [Pt, Pt];
}

/**
 * Repeating tile for the lotus moulding band: one front petal centred in the
 * tile and the tips of two back petals straddling the tile edges.
 */
export function petalBandTile(w: number, h: number): PetalBandTile {
  const base = h;
  const place = (o: Outline, dx: number, dy: number, s = 1): Outline => ({
    start: [o.start[0] * s + dx, o.start[1] * s + dy],
    segs: o.segs.map(([a, b, c]) => [
      [a[0] * s + dx, a[1] * s + dy],
      [b[0] * s + dx, b[1] * s + dy],
      [c[0] * s + dx, c[1] * s + dy],
    ]),
  });
  const petal = lotusPetal(w * 0.92, h * 0.86);
  const inner = lotusPetal(w * 0.92, h * 0.86);
  const backPetal = lotusPetal(w * 0.8, h * 0.98);
  return {
    width: w,
    height: h,
    front: place(petal, w / 2, base),
    frontInner: place(inner, w / 2, base - h * 0.06, 0.62),
    back: [place(backPetal, 0, base), place(backPetal, w, base)],
    midrib: [
      [w / 2, base - h * 0.62],
      [w / 2, base - h * 0.12],
    ],
  };
}

export interface RosetteLayer {
  petal: Outline;
  count: number;
  rotationOffset: number;
}

/**
 * Lotus rosette (frontal view). Petals are authored pointing up from the
 * centre; each layer is rotated around the origin.
 */
export function lotusRosette(r: number): { layers: RosetteLayer[]; podR: number; seeds: Pt[] } {
  const radialPetal = (inner: number, outer: number, width: number): Outline => {
    const len = outer - inner;
    return mirrorClose([0, -outer], [
      [[0.03 * width, -outer + 0.04 * len], [0.12 * width, -outer + 0.09 * len], [0.22 * width, -outer + 0.17 * len]],
      [[0.5 * width, -outer + 0.42 * len], [0.48 * width, -inner - 0.18 * len], [0.18 * width, -inner]],
      [[0.12 * width, -inner + 0.02 * len], [0.06 * width, -inner], [0, -inner]],
    ]);
  };
  const podR = r * 0.2;
  const seeds: Pt[] = [[0, 0]];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    seeds.push([Math.cos(a) * podR * 0.55, Math.sin(a) * podR * 0.55]);
  }
  return {
    podR,
    seeds,
    layers: [
      { petal: radialPetal(r * 0.3, r, r * 0.62), count: 8, rotationOffset: 22.5 },
      { petal: radialPetal(r * 0.24, r * 0.84, r * 0.54), count: 8, rotationOffset: 0 },
      { petal: radialPetal(r * 0.2, r * 0.48, r * 0.2), count: 16, rotationOffset: 11.25 },
    ],
  };
}
