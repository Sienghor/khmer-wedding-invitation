/**
 * KH-TWR-01: "ogival, redented towers shaped like lotus buds" in a
 * "central quincunx of towers" (Angkor Wat).
 *
 * Elevation silhouette only. Coordinates: x centred on the tower axis,
 * y = 0 at the base of the tower and negative upward.
 */
import { lotusPetal } from './lotus.ts';
import { outlineToPath, transformOutline } from './path.ts';

export interface TowerPaths {
  body: string;
  door: string;
  tiers: string[];
  finial: string;
}

export function lotusBudTower(w: number, h: number, tierCount = 6): TowerPaths {
  const bodyH = 0.3 * h;
  const body = `M${-w / 2} 0V${-bodyH}H${w / 2}V0Z`;
  const door = `M${-w * 0.12} 0V${-bodyH * 0.62}Q0 ${-bodyH * 0.8} ${w * 0.12} ${-bodyH * 0.62}V0Z`;
  const tiers: string[] = [];
  const upper = 0.58 * h;
  const th = upper / tierCount;
  for (let i = 0; i < tierCount; i++) {
    const t = i / tierCount;
    // Ogival envelope: slight swell above the body, then a pointed taper.
    const env = Math.pow(Math.cos((t * Math.PI) / 2), 0.62) * (1 + 0.08 * Math.sin(t * Math.PI));
    const tw = w * 0.96 * env;
    const y0 = -bodyH - i * th;
    const inset = tw * 0.06;
    // Redented tier: a band that steps in at the top...
    let d = `M${-tw / 2} ${y0}L${-tw / 2 + inset * 0.4} ${y0 - th * 0.62}H${tw / 2 - inset * 0.4}L${tw / 2} ${y0}Z`;
    // ...crowned by upward lotus-petal antefixes at both corners and centre.
    const pw = tw * 0.26;
    const ph = th * 0.78;
    for (const x of [-tw / 2 + pw * 0.45, 0, tw / 2 - pw * 0.45]) {
      d += outlineToPath(transformOutline(lotusPetal(pw, ph), x, y0 - th * 0.5));
    }
    tiers.push(d);
  }
  const finialBase = -bodyH - upper;
  const finial = outlineToPath(transformOutline(lotusPetal(w * 0.22, h * 0.14), 0, finialBase + th * 0.2));
  return { body, door, tiers, finial };
}

export interface QuincunxTower {
  x: number;
  baseY: number;
  w: number;
  h: number;
  depth: number;
}

/** Elevation of the quincunx: centre tallest, flanking pairs, on three stepped terraces. */
export function quincunxLayout(W: number, H: number) {
  const ground = H;
  const terraces = [
    { w: W * 0.86, h: H * 0.07 },
    { w: W * 0.66, h: H * 0.07 },
    { w: W * 0.48, h: H * 0.06 },
  ];
  let y = ground;
  const terraceRects = terraces.map((t) => {
    y -= t.h;
    return { x: (W - t.w) / 2, y, w: t.w, h: t.h };
  });
  const top = y;
  const towers: QuincunxTower[] = [
    { x: W * 0.17, baseY: terraceRects[0].y, w: W * 0.085, h: H * 0.5, depth: 2 },
    { x: W * 0.83, baseY: terraceRects[0].y, w: W * 0.085, h: H * 0.5, depth: 2 },
    { x: W * 0.32, baseY: terraceRects[1].y, w: W * 0.095, h: H * 0.6, depth: 1 },
    { x: W * 0.68, baseY: terraceRects[1].y, w: W * 0.095, h: H * 0.6, depth: 1 },
    { x: W * 0.5, baseY: top, w: W * 0.12, h: H * 0.76, depth: 0 },
  ];
  return { terraceRects, towers };
}
