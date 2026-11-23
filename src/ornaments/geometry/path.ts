/**
 * Low-level vector helpers shared by the SVG ornament components and the
 * Three.js geometry builders. Everything here is pure and framework-free.
 */

export type Pt = readonly [number, number];
/** A cubic Bézier segment continuing from the previous end point: [c1, c2, end]. */
export type Seg = readonly [Pt, Pt, Pt];
export interface Outline {
  start: Pt;
  segs: Seg[];
}

/** Compact number formatting for path data (keeps SVG payloads small). */
export const f = (n: number): string => {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? '0' : String(r);
};

export const pt = (x: number, y: number): Pt => [x, y];

/** Outline → SVG path data (closed). */
export function outlineToPath(o: Outline, close = true): string {
  let d = `M${f(o.start[0])} ${f(o.start[1])}`;
  for (const [c1, c2, e] of o.segs) {
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(e[0])} ${f(e[1])}`;
  }
  return close ? `${d}Z` : d;
}

/** Sample an outline into a polyline (used to build THREE.Shape and for hit-testing). */
export function sampleOutline(o: Outline, perSeg = 10): Pt[] {
  const out: Pt[] = [o.start];
  let p0 = o.start;
  for (const [c1, c2, e] of o.segs) {
    for (let i = 1; i <= perSeg; i++) {
      const t = i / perSeg;
      const mt = 1 - t;
      const a = mt * mt * mt;
      const b = 3 * mt * mt * t;
      const c = 3 * mt * t * t;
      const d = t * t * t;
      out.push([a * p0[0] + b * c1[0] + c * c2[0] + d * e[0], a * p0[1] + b * c1[1] + c * c2[1] + d * e[1]]);
    }
    p0 = e;
  }
  return out;
}

/**
 * Builds a closed, bilaterally symmetric outline from its right half.
 * The half must start and end on the axis x = 0. Khmer ornament is
 * overwhelmingly symmetric, so most motifs are authored this way.
 */
export function mirrorClose(start: Pt, rightHalf: Seg[]): Outline {
  const pts: Pt[] = [start];
  for (const s of rightHalf) pts.push(s[2]);
  const left: Seg[] = [];
  for (let i = rightHalf.length - 1; i >= 0; i--) {
    const [c1, c2] = rightHalf[i];
    const from = pts[i];
    left.push([
      [-c2[0], c2[1]],
      [-c1[0], c1[1]],
      [-from[0], from[1]],
    ]);
  }
  return { start, segs: [...rightHalf, ...left] };
}

/** Transform an outline (scale then rotate (deg) then translate). */
export function transformOutline(o: Outline, tx: number, ty: number, rotDeg = 0, s = 1): Outline {
  const r = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const tp = (p: Pt): Pt => [tx + (p[0] * cos - p[1] * sin) * s, ty + (p[0] * sin + p[1] * cos) * s];
  return { start: tp(o.start), segs: o.segs.map(([a, b, c]) => [tp(a), tp(b), tp(c)] as Seg) };
}

/** Smooth open polyline through points using a Catmull-Rom → cubic conversion. */
export function smoothPath(pts: Pt[], tension = 1): string {
  if (pts.length < 2) return '';
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const k = tension / 6;
    const c1x = p1[0] + (p2[0] - p0[0]) * k;
    const c1y = p1[1] + (p2[1] - p0[1]) * k;
    const c2x = p2[0] - (p3[0] - p1[0]) * k;
    const c2y = p2[1] - (p3[1] - p1[1]) * k;
    d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/**
 * Logarithmic spiral (the "snail shell" kbach figure, KH-KB-02).
 * Returns points from the outer start inward.
 * @param dir 1 = clockwise on screen, -1 = counter-clockwise
 */
export function logSpiral(cx: number, cy: number, r0: number, turns: number, startAngle: number, dir: 1 | -1, endRatio = 0.16): Pt[] {
  const steps = Math.max(8, Math.round(turns * 18));
  const total = turns * Math.PI * 2;
  const k = Math.log(endRatio) / total;
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * total;
    const r = r0 * Math.exp(k * t);
    const a = startAngle + dir * t;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

/** Offset a polyline by its normals (used to give the naga body thickness). */
export function offsetPolyline(pts: Pt[], dist: number | ((i: number, n: number) => number)): Pt[] {
  const n = pts.length;
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const d = typeof dist === 'number' ? dist : dist(i, n);
    return [p[0] + (-dy / len) * d, p[1] + (dx / len) * d] as Pt;
  });
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
