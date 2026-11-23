import { useMemo } from 'react';
import { BAYON_H, BAYON_W, bayonTower } from './geometry/bayon';
import { CarveFilter, OrnamentSvg, useIds } from './Ornament';

/**
 * KH-BAY-01: Bayon face tower in low relief. Square prasat with four upper
 * tiers and a crowning lotus; a serene face carved within the first two tiers.
 * Features are incised grooves: a dark upper edge and a lit lower edge, as raking light shows them.
 */
export function BayonTower({ width = 220, dark = true, className }: { width?: number | string; dark?: boolean; className?: string }) {
  const ids = useIds('stone', 'face', 'side', 'c', 'gilt');
  const g = useMemo(bayonTower, []);
  // Grooves stay soft: the face is carved stone, not a drawing.
  const groove = dark ? 'rgb(62 36 24 / 0.58)' : 'rgb(80 50 30 / 0.6)';
  const lit = dark ? 'rgb(255 236 205 / 0.3)' : 'rgb(255 248 235 / 0.75)';
  const incise = (d: string, w = 1.5, key?: string | number) => (
    <g key={key}>
      <path d={d} fill="none" stroke={lit} strokeWidth={w * 0.8} strokeLinecap="round" transform="translate(0.5 0.9)" />
      <path d={d} fill="none" stroke={groove} strokeWidth={w} strokeLinecap="round" />
    </g>
  );
  return (
    <OrnamentSvg motifs={['KH-BAY-01', 'KH-LOT-01']} viewBox={`0 0 ${BAYON_W} ${BAYON_H}`} className={className} style={{ width, height: 'auto', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={ids.stone} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="color-mix(in oklab, var(--c-sandstone) 72%, var(--c-ivory))" />
          <stop offset="0.55" stopColor="var(--c-sandstone)" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--c-sandstone) 70%, var(--c-charcoal))" />
        </linearGradient>
        <radialGradient id={ids.face} cx="0.42" cy="0.38" r="0.75">
          <stop offset="0" stopColor="color-mix(in oklab, var(--c-sandstone) 55%, var(--c-ivory))" />
          <stop offset="0.7" stopColor="color-mix(in oklab, var(--c-sandstone) 88%, var(--c-ivory))" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--c-sandstone) 80%, var(--c-charcoal))" />
        </radialGradient>
        <linearGradient id={ids.side} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="color-mix(in oklab, var(--c-sandstone) 55%, var(--c-charcoal))" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--c-sandstone) 75%, var(--c-charcoal))" />
        </linearGradient>
        <linearGradient id={ids.gilt} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--c-gold-light)" />
          <stop offset="1" stopColor="var(--c-gold)" />
        </linearGradient>
        <CarveFilter id={ids.c} dark={dark} depth={1.6} />
      </defs>
      <g filter={`url(#${ids.c})`}>
        {g.upperTiers.map((d, i) => (
          <path key={i} d={d} fill={`url(#${ids.stone})`} />
        ))}
        <path d={g.lotusRing} fill={`url(#${ids.gilt})`} />
        <path d={g.lotus} fill={`url(#${ids.gilt})`} />
        <path d={g.antefixes} fill={`url(#${ids.stone})`} />
        <path d={g.base} fill={`url(#${ids.stone})`} />
        <path d={g.body} fill={`url(#${ids.stone})`} />
        {g.sideRecess.map((d, i) => (
          <path key={i} d={d} fill={`url(#${ids.side})`} />
        ))}
        <path d={g.face} fill={`url(#${ids.face})`} />
        {g.shade.map((d, i) => (
          <path key={i} d={d} fill={groove} opacity="0.16" />
        ))}
        <path d={g.upperLip} fill={`url(#${ids.side})`} opacity="0.32" />
        <path d={g.lowerLip} fill={`url(#${ids.face})`} />
        <path d={g.diadem} fill={`url(#${ids.stone})`} />
        <path d={g.diademPetals} fill={`url(#${ids.stone})`} />
      </g>
      {g.cornices.map((d, i) => incise(d, 1, `c${i}`))}
      {g.ears.map((d, i) => incise(d, 1, `e${i}`))}
      {g.brows.map((d, i) => incise(d, 1.3, `b${i}`))}
      {g.nose.map((d, i) => incise(d, 1.1, `n${i}`))}
      {incise(g.nostrils, 1.3)}
      {g.lids.map((d, i) => incise(d, 1.7, `l${i}`))}
      {g.lowerLids.map((d, i) => incise(d, 0.7, `ll${i}`))}
      {incise(g.lipLine, 1.6)}
      {g.smileCorners.map((d, i) => incise(d, 1.2, `s${i}`))}
    </OrnamentSvg>
  );
}
