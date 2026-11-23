/**
 * Kbach leafy figures.
 *  - KH-KB-01  Ficus religiosa (Bodhi) leaf figure
 *  - KH-KB-02  Spiral snail-shell figure (kbach hien)
 */
import { logSpiral, mirrorClose, smoothPath, type Outline, type Pt } from './path.ts';

/**
 * Bodhi leaf: heart-shaped body with an elongated drip tip.
 * Base notch near y = 0, tip at y = -h, pointing up.
 */
export function bodhiLeaf(w: number, h: number): Outline {
  return mirrorClose([0, -h], [
    [[0.012 * w, -0.94 * h], [0.04 * w, -0.86 * h], [0.11 * w, -0.79 * h]],
    [[0.3 * w, -0.65 * h], [0.5 * w, -0.5 * h], [0.5 * w, -0.27 * h]],
    [[0.5 * w, -0.04 * h], [0.2 * w, 0.03 * h], [0, -0.07 * h]],
  ]);
}

/** Interior carving of the Bodhi leaf: midrib + paired inward spirals. */
export function bodhiLeafInterior(w: number, h: number): { midrib: string; spirals: string[] } {
  const midrib = smoothPath([
    [0, -0.12 * h],
    [0, -0.5 * h],
    [0, -0.84 * h],
  ]);
  const spirals = ([1, -1] as const).map((side) => {
    const cx = side * 0.2 * w;
    const cy = -0.3 * h;
    const r0 = 0.15 * w;
    // Begin near the midrib, sweep outward and coil inward: the snail figure.
    const lead: Pt[] = [
      [side * 0.02 * w, -0.46 * h],
      [side * 0.12 * w, -0.47 * h],
    ];
    const coil = logSpiral(cx, cy, r0, 1.35, -Math.PI / 2 - side * 0.2, side === 1 ? 1 : -1, 0.2);
    return smoothPath([...lead, ...coil]);
  });
  return { midrib, spirals };
}

/** A free-standing snail spiral as a path (used by dividers). */
export function snailSpiral(cx: number, cy: number, r: number, dir: 1 | -1, startAngle = -Math.PI / 2): string {
  return smoothPath(logSpiral(cx, cy, r, 1.6, startAngle, dir, 0.14));
}
