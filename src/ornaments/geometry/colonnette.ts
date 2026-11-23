/**
 * KH-COL-01: Octagonal ringed colonnette.
 * "round, rectangular, or octagonal in shape … often circled with molded rings
 * and decorated with carved leaves" (Khmer architecture).
 *
 * The profile is a list of (radius, y) pairs from the base (y = 0) upward.
 * Three.js spins it with exactly 8 radial segments to make a true octagon.
 * The SVG component draws its elevation.
 */
import type { Pt } from './path.ts';

export interface ColonnetteProfile {
  /** [radius, y] from base to top. */
  profile: Pt[];
  /** Ring centres (y), where the carved-leaf collars sit. */
  rings: number[];
  height: number;
  radius: number;
}

export function colonnetteProfile(height: number, radius: number, ringCount = 4): ColonnetteProfile {
  const H = height;
  const R = radius;
  const p: Pt[] = [];
  const push = (r: number, y: number) => p.push([r * R, y * H]);

  // Stepped base
  push(0, 0);
  push(1.4, 0);
  push(1.4, 0.035);
  push(1.22, 0.04);
  push(1.22, 0.065);
  push(1.08, 0.075);
  push(1.0, 0.09);

  // Shaft with moulded ring groups
  const rings: number[] = [];
  const bottom = 0.17;
  const top = 0.83;
  for (let i = 0; i < ringCount; i++) {
    const c = bottom + ((top - bottom) * (i + 0.5)) / ringCount;
    rings.push(c * H);
    push(1.0, c - 0.055);
    push(1.12, c - 0.042);
    push(1.34, c - 0.03);
    push(1.34, c - 0.012);
    push(1.1, c - 0.004);
    push(1.1, c + 0.004);
    push(1.34, c + 0.012);
    push(1.34, c + 0.03);
    push(1.12, c + 0.042);
    push(1.0, c + 0.055);
  }

  // Capital: flaring rings to an abacus that carries the lintel
  push(1.0, 0.9);
  push(1.12, 0.915);
  push(1.12, 0.93);
  push(1.28, 0.945);
  push(1.28, 0.965);
  push(1.45, 0.975);
  push(1.45, 1.0);
  push(0, 1.0);
  return { profile: p, rings, height: H, radius: R };
}

/**
 * Horizontal positions of the octagon's visible facet edges in elevation,
 * as fractions of the full width, for a face turned toward the viewer.
 * Vertices at 22.5° + k·45° give edges at ±cos(67.5°) and ±cos(22.5°).
 */
export const OCTAGON_FACET_STOPS = (() => {
  const outer = Math.cos(Math.PI / 8);
  const inner = Math.cos((3 * Math.PI) / 8);
  const toFrac = (x: number) => (x + outer) / (2 * outer);
  return [0, toFrac(-inner), toFrac(inner), 1];
})();
