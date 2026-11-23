import { useMemo } from 'react';
import { bodhiLeaf, bodhiLeafInterior } from './geometry/kbach';
import { outlineToPath } from './geometry/path';
import { Gilt, INCISE, OrnamentSvg, useIds, type Tone } from './Ornament';

/** Leaf group with its base notch at (0,0), pointing up. */
export function KbachLeafGroup({ w, h, fill, stroke }: { w: number; h: number; fill: string; stroke: string }) {
  const g = useMemo(() => ({ outline: outlineToPath(bodhiLeaf(w, h)), ...bodhiLeafInterior(w, h) }), [w, h]);
  const sw = w * 0.022;
  return (
    <g>
      <path d={g.outline} fill={fill} stroke={stroke} strokeWidth={sw} strokeOpacity="0.6" />
      <path d={g.midrib} fill="none" stroke={stroke} strokeWidth={sw} strokeOpacity="0.55" />
      {g.spirals.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={stroke} strokeWidth={sw * 1.1} strokeLinecap="round" strokeOpacity="0.7" />
      ))}
    </g>
  );
}

/** KH-KB-01 + KH-KB-02: Bodhi-leaf kbach figure with snail-spiral carving. */
export function KbachLeaf({ size = 40, tone = 'gold', rotate = 0, className }: { size?: number; tone?: Tone; rotate?: number; className?: string }) {
  const ids = useIds('g');
  return (
    <OrnamentSvg motifs={['KH-KB-01', 'KH-KB-02']} viewBox="-40 -102 80 108" width={(size * 80) / 108} height={size} className={className} style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}>
      <defs>
        <Gilt id={ids.g} tone={tone} />
      </defs>
      <KbachLeafGroup w={74} h={100} fill={`url(#${ids.g})`} stroke={INCISE[tone]} />
    </OrnamentSvg>
  );
}
