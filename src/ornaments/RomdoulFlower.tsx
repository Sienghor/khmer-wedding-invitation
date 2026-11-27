import { useMemo } from 'react';
import { romdoul } from './geometry/romdoul';
import { Gilt, INCISE, OrnamentSvg, useIds, type Tone } from './Ornament';

/**
 * KH-ROM-01: romduol (រំដួល), Cambodia's national flower and, in Khmer
 * literature, a metaphor for women's beauty. Used for the couple's own moments
 * (between their names, the date seal, the blessing knot); the lotus rosette
 * (KH-LOT-02) stays wherever the ornament quotes temple carving or the rites.
 */
export function RomdoulFlower({ size = 48, tone = 'gold', className }: { size?: number; tone?: Tone; className?: string }) {
  const ids = useIds('g', 'h');
  const g = useMemo(() => romdoul(50), []);
  const stroke = INCISE[tone];
  return (
    <OrnamentSvg motifs={['KH-ROM-01']} viewBox="-52 -52 104 104" width={size} height={size} className={className}>
      <defs>
        <Gilt id={ids.g} tone={tone} />
        {/* The inner dome catches more light than the spreading outer petals. */}
        <Gilt id={ids.h} tone={tone === 'ink' ? 'gold' : 'light'} />
      </defs>
      <g>
        {g.outer.angles.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d={g.outer.d} fill={`url(#${ids.g})`} stroke={stroke} strokeWidth={0.9} strokeOpacity={0.65} />
            <path d={g.outer.rib} fill="none" stroke={stroke} strokeWidth={0.7} strokeOpacity={0.45} strokeLinecap="round" />
          </g>
        ))}
      </g>
      <g>
        {g.inner.angles.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d={g.inner.d} fill={`url(#${ids.h})`} stroke={stroke} strokeWidth={0.9} strokeOpacity={0.7} />
            <path d={g.inner.seam} fill="none" stroke={stroke} strokeWidth={0.6} strokeOpacity={0.35} strokeLinecap="round" />
          </g>
        ))}
      </g>
      <circle r={g.heartR} fill={stroke} opacity={0.55} />
    </OrnamentSvg>
  );
}
