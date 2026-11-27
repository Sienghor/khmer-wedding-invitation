/**
 * KH-ROM-01: romduol (រំដួល) flower, seen from the front.
 * The cited source describes "three outer and three inner petals", the inner
 * ones closing "in over the centre of the flower". So: three broad outer petals
 * spread at 120°, and three rounded inner petals, offset by 60°, whose tips meet
 * at the centre like a closed dome.
 * All paths are drawn pointing up (−y) from the origin and rotated into place.
 */
export interface RomdoulGeometry {
  outer: { d: string; rib: string; angles: number[] };
  inner: { d: string; seam: string; angles: number[] };
  heartR: number;
}

export function romdoul(r: number): RomdoulGeometry {
  // Outer petal: fleshy, broad, with a softly pointed tip.
  const L = r * 0.98;
  const w = r * 0.46;
  const outer = [
    `M0 ${-r * 0.1}`,
    `C ${w} ${-L * 0.18} ${w * 0.92} ${-L * 0.78} 0 ${-L}`,
    `C ${-w * 0.92} ${-L * 0.78} ${-w} ${-L * 0.18} 0 ${-r * 0.1}`,
    'Z',
  ].join(' ');
  const rib = `M0 ${-r * 0.42} L0 ${-L * 0.86}`;

  // Inner petal: tip at the centre, broad rounded back, so three of them close into a dome.
  // Thick and rounded (no shoulders): the back is close to a circular arc.
  const l = r * 0.6;
  const v = r * 0.36;
  const inner = [
    'M0 0',
    `C ${v * 1.05} ${-l * 0.02} ${v * 1.3} ${-l * 0.98} 0 ${-l}`,
    `C ${-v * 1.3} ${-l * 0.98} ${-v * 1.05} ${-l * 0.02} 0 0`,
    'Z',
  ].join(' ');
  const seam = `M0 ${-l * 0.12} Q ${v * 0.16} ${-l * 0.55} 0 ${-l * 0.9}`;

  return {
    outer: { d: outer, rib, angles: [0, 120, 240] },
    inner: { d: inner, seam, angles: [60, 180, 300] },
    heartR: r * 0.07,
  };
}
