/**
 * KH-LIN-01: Banteay Srei-style lintel layout, after the Sralao Temple lintel
 * (National Museum of Cambodia, Ka.1819).
 *
 * Source structure kept in code:
 *   centre motif → two symmetrical naga-bodied branches → small three-headed
 *   naga heads along the branches → large three-headed naga head at each end →
 *   tendrils curling down below the branches (pseudo-tympanum) → lotus row at
 *   the base.
 * The central deity is replaced by the Angkor Wat lotus rosette (see registry).
 *
 * Coordinates: origin top-left, y down. Only the RIGHT half is computed; the
 * renderer mirrors it about x = W/2 so symmetry is exact by construction.
 */
import { logSpiral, type Pt } from './path.ts';

export interface LintelLayout {
  W: number;
  H: number;
  /** Proportion of the NMC original (186 × 82 cm). */
  aspect: number;
  fillets: { y: number; h: number }[];
  medallion: { cx: number; cy: number; R: number };
  branch: Pt[];
  bodyThickness: number;
  /** Foliage tendrils, each ending in a snail spiral. `weight` scales stroke width. */
  loops: { pts: Pt[]; weight: number }[];
  crests: Pt[];
  crestSize: { w: number; h: number };
  endFan: { x: number; y: number; rot: number; w: number; h: number };
  lotusRow: { y: number; h: number; tileW: number };
}

export const SRALAO_ASPECT = 186 / 82;

export function lintelLayout(W: number, H: number): LintelLayout {
  const R = 0.27 * H;
  const cx = W / 2;
  const cy = 0.42 * H;
  const xs = cx + R * 1.08;
  // Keep the terminal fan (with its outer heads) inside the lintel block.
  const xe = W - 0.22 * H;
  const baseY = 0.4 * H;
  const A = 0.08 * H;
  const span = xe - xs;
  // One full undulation per ~1.1 × height keeps the rhythm consistent at any width.
  const waves = Math.max(1, Math.round(span / (1.1 * H)));
  const endY = 0.56 * H;

  const branch: Pt[] = [];
  const N = 28 * waves;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = xs + span * t;
    const wave = baseY + A * Math.sin(Math.PI * 2 * waves * t);
    // Ease the last 12% down to the neck of the terminal naga.
    const e = Math.max(0, (t - 0.88) / 0.12);
    const s = e * e * (3 - 2 * e);
    branch.push([x, wave * (1 - s) + endY * s]);
  }

  const bodyThickness = 0.095 * H;
  const loops: LintelLayout['loops'] = [];
  const crests: Pt[] = [];
  for (let k = 0; k < waves; k++) {
    // sin = +1 → lowest point (y down): the "pronounced loop" of vegetation hangs here.
    const tLow = (k + 0.25) / waves;
    // sin = -1 → highest point: a small three-headed naga rises here.
    const tHigh = (k + 0.75) / waves;
    if (tLow < 0.86) {
      const x = xs + span * tLow;
      const yb = baseY + A + bodyThickness / 2;
      const yt = baseY + A - bodyThickness / 2;
      // Primary loop: drops from the branch and coils back toward the centre.
      const pc: Pt = [x + 0.03 * H, 0.655 * H];
      const pr = 0.105 * H;
      const primaryStem: Pt[] = [
        [x + 0.02 * H, yb - 0.01 * H],
        [x + 0.05 * H, yb + 0.05 * H],
        [pc[0] + pr, pc[1] - 0.01 * H],
      ];
      loops.push({ pts: [...primaryStem, ...logSpiral(pc[0], pc[1], pr, 1.55, 0, 1, 0.16)], weight: 1 });
      // Secondary tendril: branches off toward the medallion and curls the other way.
      const sc: Pt = [x - 0.115 * H, 0.63 * H];
      const sr = 0.06 * H;
      loops.push({
        pts: [
          [x - 0.005 * H, yb - 0.005 * H],
          [x - 0.05 * H, yb + 0.03 * H],
          [sc[0] + sr * 0.2, sc[1] - sr],
          ...logSpiral(sc[0], sc[1], sr, 1.35, -Math.PI / 2, -1, 0.2).slice(1),
        ],
        weight: 0.7,
      });
      // Upward curl sprouting from the top of the branch at its lowest dip.
      const uc: Pt = [x + 0.05 * H, 0.245 * H];
      const ur = 0.045 * H;
      loops.push({
        pts: [[x - 0.015 * H, yt + 0.01 * H], [x - 0.01 * H, yt - 0.035 * H], [uc[0] - ur, uc[1] + 0.01 * H], ...logSpiral(uc[0], uc[1], ur, 1.3, Math.PI, 1, 0.22).slice(1)],
        weight: 0.6,
      });
    }
    if (tHigh < 0.86) {
      crests.push([xs + span * tHigh, baseY - A - bodyThickness / 2 + 0.012 * H]);
    }
  }

  return {
    W,
    H,
    aspect: W / H,
    fillets: [
      { y: 0, h: 0.045 * H },
      { y: 0.065 * H, h: 0.012 * H },
    ],
    medallion: { cx, cy, R },
    branch,
    bodyThickness,
    loops,
    crests,
    crestSize: { w: 0.085 * H, h: 0.13 * H },
    endFan: { x: xe, y: endY, rot: 10, w: 0.2 * H, h: 0.33 * H },
    lotusRow: { y: 0.82 * H, h: 0.18 * H, tileW: 0.13 * H },
  };
}
