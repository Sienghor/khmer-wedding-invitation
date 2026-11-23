/**
 * KH-BAY-01: Bayon face tower, elevation.
 *
 * Glaize: "a variation on the theme of the square 'prasat', with four upper
 * tiers and a crowning lotus, - but sculpted on each axis with human faces …
 * within the rising of the first two tiers." Wikipedia: "serene, smiling stone faces".
 *
 * Authored in a 200 × 320 box (x right, y down, axis x = 100). Symmetric
 * features are authored on the left and mirrored, so the face is exactly
 * symmetric. The face is reduced to a few incised lines on purpose (see the
 * registry's adaptation notes).
 */
import { lotusPetal } from './lotus.ts';
import { outlineToPath, transformOutline } from './path.ts';

export const BAYON_W = 200;
export const BAYON_H = 320;
const AX = BAYON_W / 2;

/** Mirror an absolute M/C/L/H/V/Z path across the axis (x → 200 − x). */
export function mirrorPath(d: string): string {
  return d.replace(/([MCLHVZ])([^MCLHVZ]*)/g, (_, cmd: string, args: string) => {
    const n = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    if (cmd === 'H') return `H${n.map((x) => BAYON_W - x).join(' ')}`;
    if (cmd === 'V' || cmd === 'Z') return cmd + args;
    const out = n.map((v, i) => (i % 2 === 0 ? BAYON_W - v : v));
    return cmd + out.join(' ');
  });
}

const both = (left: string) => [left, mirrorPath(left)];

export interface BayonTowerGeometry {
  /** Stone masses, back to front. */
  base: string;
  body: string;
  sideRecess: string[];
  upperTiers: string[];
  antefixes: string;
  lotus: string;
  lotusRing: string;
  cornices: string[];
  diadem: string;
  diademPetals: string;
  /** The face panel (lighter: it projects from the tower). */
  face: string;
  shade: string[];
  /** Incised features. */
  brows: string[];
  lids: string[];
  lowerLids: string[];
  nose: string[];
  nostrils: string;
  lipLine: string;
  upperLip: string;
  lowerLip: string;
  smileCorners: string[];
  ears: string[];
}

export function bayonTower(): BayonTowerGeometry {
  // Two face tiers (y 122–300) on a moulded base; four upper tiers and a crowning lotus.
  const base = 'M8 300H192V320H8Z';
  const body = 'M20 300V212H26V122H174V212H180V300Z';
  const sideRecess = both('M20 300V212H26V122H38V300Z');
  const upperTiers = [
    'M34 122L38 98H162L166 122Z',
    'M46 98L50 76H150L154 98Z',
    'M58 76L61 58H139L142 76Z',
    'M68 58L71 44H129L132 58Z',
  ];
  // Upward lotus-petal antefixes on each upper tier: corners and centre (KH-LOT-01 geometry).
  const tierTops: [number, number, number][] = [
    [98, 56, 15],
    [76, 43, 12],
    [58, 32, 10],
    [44, 23, 8],
  ];
  let antefixes = '';
  for (const [y, half, size] of tierTops) {
    for (const x of [AX - half, AX, AX + half]) antefixes += outlineToPath(transformOutline(lotusPetal(size, size * 1.15), x, y + 2));
  }
  const lotus = outlineToPath(transformOutline(lotusPetal(46, 42), AX, 40));
  const lotusRing = 'M78 44H122V40H78Z';
  const cornices = both('M8 300H38M20 212H38M26 122H38');

  // Diadem band across the brow with a row of small upward petals.
  const diadem = 'M36 140C56 130 82 127 100 127C118 127 144 130 164 140L164 149C144 141 118 138 100 138C82 138 56 141 36 149Z';
  let diademPetals = '';
  for (let i = -5; i <= 5; i++) {
    const x = AX + i * 11.5;
    const y = 129 + i * i * 0.36;
    diademPetals += outlineToPath(transformOutline(lotusPetal(9, 11), x, y));
  }

  // The face fills the width of the tower, as on the Bayon, from the diadem to the base.
  const face = 'M38 147C36 202 46 254 70 278C84 290 116 290 130 278C154 254 164 202 162 147C140 140 118 138 100 138C82 138 60 140 38 147Z';
  // Soft relief shading (filled, low opacity): eye sockets, the shadow side of the nose, under the lip and chin.
  const shade = [
    ...both('M52 176C62 164 84 163 95 172C90 186 66 190 52 176Z'),
    'M103 170C105 188 109 204 117 214C111 213 105 209 102 203Z',
    'M84 255C94 262 106 262 116 255C110 266 90 266 84 255Z',
    'M78 280C90 287 110 287 122 280C112 293 88 293 78 280Z',
  ];
  // A continuous brow line that dips to the bridge of the nose.
  const brows = both('M46 172C58 158 82 156 95 165C97 166 99 167 100 167');
  const nose = both('M96 168C95 184 93 198 90 209');
  const nostrils = 'M82 213C80 221 88 225 94 222C97 225 103 225 106 222C112 225 120 221 118 213';
  // Lowered eyelids: a heavy upper lid and a faint lower line (eyes cast down).
  const lids = both('M58 183C66 175 84 174 93 183');
  const lowerLids = both('M61 185C70 190 84 190 91 185');
  // Full lips: filled shapes (an outline alone reads as a moustache), the corners turned up.
  const upperLip = 'M78 243C86 236 94 234 100 237C106 234 114 236 122 243C112 245 106 245 100 244C94 245 88 245 78 243Z';
  const lowerLip = 'M80 244C90 247 96 247 100 246C104 247 110 247 120 244C114 255 86 255 80 244Z';
  const lipLine = 'M76 242C86 247 94 246 100 245C106 246 114 247 124 242';
  const smileCorners = both('M76 242C73 240 72 237 72.5 234');
  const ears = both('M37 168C25 174 25 216 31 252C33 266 43 268 44 256C45 240 41 208 39 180');

  return {
    base,
    body,
    sideRecess,
    upperTiers,
    antefixes,
    lotus,
    lotusRing,
    cornices,
    diadem,
    diademPetals,
    face,
    shade,
    brows,
    lids,
    lowerLids,
    nose,
    nostrils,
    lipLine,
    upperLip,
    lowerLip,
    smileCorners,
    ears,
  };
}
