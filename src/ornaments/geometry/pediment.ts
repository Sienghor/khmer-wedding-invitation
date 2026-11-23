/**
 * KH-PED-01: Banteay Srei triangular fronton (pediment).
 *
 * Documented characteristics (Glaize, see registry):
 *  - "superposed triangular frontons which follow the slope of the roof,
 *    recalling architecture in timber"; "the stacking of superimposed frontons"
 *  - "The two diverging lines scroll at the extremities into large volutes."
 *  - "bordered frames in large terminal volutes are crowned with deeply cut motifs"
 *  - Classic pediment frame "indented with flaming leaves"
 *  - Tympanum "covered in a vegetal decoration with large volutes forming a
 *    single composition"
 *  - Wikipedia: pediments "take a sweeping gabled shape"
 *
 * Coordinates: base centre at (0, 0), apex at (0, -H), y negative upward.
 * Only the right half is generated; renderers mirror it, so the fronton is
 * exactly symmetric.
 */
import { bodhiLeaf } from './kbach.ts';
import { logSpiral, offsetPolyline, outlineToPath, smoothPath, transformOutline, type Outline, type Pt } from './path.ts';
import { flameLeaf, placeLeaf, type PlacedLeaf } from './vine.ts';

export interface PedimentGeometry {
  W: number;
  H: number;
  /** Frame band thickness. */
  band: number;
  /** Right-half frame centreline: sweeping slope, then the terminal volute. */
  frame: Pt[];
  /** Index in `frame` where the slope ends and the volute begins. */
  voluteStart: number;
  /** Flame leaves cresting the outer edge of the frame (right half). */
  crest: PlacedLeaf[];
  /** Apex finial (Bodhi-leaf kbach, KH-KB-01), closed path, full width. */
  finial: string;
  finialOutline: Outline;
  /** Tympanum field (full width, closed). */
  tympanum: string;
  /** Tympanum foliage, right half: stems rolling into volutes. */
  foliage: Pt[][];
  /** Tympanum leaves, right half. */
  foliageLeaves: PlacedLeaf[];
  /** Lotus rosette (KH-LOT-02) at the centre of the tympanum. */
  rosette: { cx: number; cy: number; r: number };
}

/** Sweeping slope: falls steeply from the apex and flattens toward the eaves. */
function slope(W: number, H: number, u: number): Pt {
  const xe = W * 0.4;
  const hb = H * 0.1;
  return [xe * u, -H + (H - hb) * (1 - Math.pow(1 - u, 1.55))];
}

export function pediment(W: number, H: number): PedimentGeometry {
  const band = H * 0.085;
  const n = 22;
  const slopePts: Pt[] = [];
  for (let i = 0; i <= n; i++) slopePts.push(slope(W, H, i / n));
  const end = slopePts[n];
  // Terminal volute: the frame turns outward, down, and rolls up into a coil.
  const r0 = H * 0.15;
  const c: Pt = [end[0] + r0 * 0.55, end[1] - r0 * 0.78];
  const coil = logSpiral(c[0], c[1], r0, 1.3, Math.PI * 0.62, -1, 0.2);
  const frame = [...slopePts, ...coil.slice(1)];

  // Crest of flame leaves along the outer edge of the slope.
  const outer = offsetPolyline(slopePts, -band * 0.55);
  const crest: PlacedLeaf[] = [];
  for (let i = 2; i < n - 1; i += 2) {
    const [x, y] = outer[i];
    const a = slopePts[i - 1];
    const b = slopePts[i + 1];
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI; // along the slope
    const len = band * (1.5 - (i / n) * 0.35);
    // Leaves rise from the frame and lean toward the apex like tongues of flame.
    crest.push(placeLeaf(flameLeaf(len, band * 0.75, 0.42), x, y, ang - 118));
  }

  const finialOutline = transformOutline(bodhiLeaf(band * 2.3, band * 2.9), 0, -H - band * 0.35);
  const finial = outlineToPath(finialOutline);

  // Tympanum: inside the frame centreline, closed along the base.
  const right = smoothPath(slopePts);
  const leftPts = slopePts.map(([x, y]) => [-x, y] as Pt).reverse();
  const tympanum = `${right}L${r2(end[0])} 0L${r2(-end[0])} 0L${r2(leftPts[0][0])} ${r2(leftPts[0][1])}${smoothPath(leftPts).replace(/^M[^C]+/, '')}Z`;

  // Foliage (right half): a stem rising from the base centre and rolling into a
  // large volute, with a smaller volute toward the eave and flame leaves at the branches.
  const rosette = { cx: 0, cy: -H * 0.4, r: H * 0.15 };
  const bigC: Pt = [W * 0.17, -H * 0.27];
  const bigCoil = logSpiral(bigC[0], bigC[1], H * 0.12, 1.25, Math.PI * 0.75, -1, 0.22);
  const stem1 = [[W * 0.012, -H * 0.02] as Pt, [W * 0.05, -H * 0.13] as Pt, [W * 0.08, -H * 0.3] as Pt, ...bigCoil];
  const smallC: Pt = [W * 0.3, -H * 0.12];
  const smallCoil = logSpiral(smallC[0], smallC[1], H * 0.065, 1.2, Math.PI * 0.95, -1, 0.25);
  const stem2 = [[W * 0.1, -H * 0.06] as Pt, [W * 0.19, -H * 0.05] as Pt, ...smallCoil];
  const foliageLeaves: PlacedLeaf[] = [
    placeLeaf(flameLeaf(H * 0.16, H * 0.07, 0.4), W * 0.075, -H * 0.3, -62, -1),
    placeLeaf(flameLeaf(H * 0.12, H * 0.055, 0.45), W * 0.1, -H * 0.06, -20),
    placeLeaf(flameLeaf(H * 0.1, H * 0.05, 0.4), W * 0.04, -H * 0.12, -75, -1),
  ];

  return { W, H, band, frame, voluteStart: n, crest, finial, finialOutline, tympanum, foliage: [stem1, stem2], foliageLeaves, rosette };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Shared proportions: the fronton's height is 0.44 of its base width. */
export const PEDIMENT_H_RATIO = 0.44;

/**
 * Bounding box of a (stacked) fronton in its own units, as [x, y, w, h] with
 * y negative upward. Shared by the SVG viewBox and the 3D layout so the two line up.
 */
export function pedimentBox(W: number, tiers: 1 | 2 | 3) {
  const H = W * PEDIMENT_H_RATIO;
  const band = H * 0.085;
  const s = 1 + (tiers - 1) * 0.1;
  const top = (tiers - 1) * H * 0.26 + (H + band * 3.3) * s;
  return { x: -W / 2 - band, y: -top, w: W + band * 2, h: top + band * 0.6, H, band };
}

/** Superposed frontons: the rear one larger and higher, the front one lower. */
export function superposedLayout(H: number, tiers: 1 | 2 | 3) {
  const out: { dx: number; dy: number; s: number; depth: number }[] = [];
  for (let i = tiers - 1; i >= 0; i--) out.push({ dx: 0, dy: -i * H * 0.26, s: 1 + i * 0.1, depth: i });
  return out; // back → front
}
