import { useMemo } from 'react';
import { pilasterTile, scrollTile } from './geometry/vine';
import { CarveFilter, Gilt, INCISE, OrnamentSvg, useIds, type Tone } from './Ornament';

/**
 * KH-VIN-01: Banteay Srei foliated scroll as a repeating band.
 *  - orientation "horizontal": a running scroll frieze ("a succession of foliated scrolls").
 *  - orientation "vertical": a pilaster ("long vertical bands … for the vertical
 *    repetition of identical motifs"), bilaterally symmetric, flowing upward.
 * The pattern is anchored at the band's centre so the composition stays symmetric.
 */
export function VineBand({
  orientation = 'horizontal',
  size = 28,
  tone = 'gold',
  carved = true,
  className,
}: {
  orientation?: 'horizontal' | 'vertical';
  /** Band thickness in px (height of a frieze, width of a pilaster). */
  size?: number;
  tone?: Tone;
  carved?: boolean;
  className?: string;
}) {
  const ids = useIds('g', 'p', 'c');
  const vertical = orientation === 'vertical';
  const t = useMemo(() => (vertical ? pilasterTile(size, size * 1.5) : scrollTile(size * 2.2, size)), [vertical, size]);
  const fill = `url(#${ids.g})`;
  const stroke = INCISE[tone];
  const sw = size * 0.075;
  return (
    <OrnamentSvg
      motifs={['KH-VIN-01']}
      className={className}
      width={vertical ? size : '100%'}
      height={vertical ? '100%' : size}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <Gilt id={ids.g} tone={tone} />
        {carved && <CarveFilter id={ids.c} dark={tone === 'light'} depth={0.8} />}
        <pattern id={ids.p} patternUnits="userSpaceOnUse" width={t.w} height={t.h} x={vertical ? 0 : '50%'} y={vertical ? '50%' : 0}>
          <path d={t.stem} fill="none" stroke={stroke} strokeOpacity="0.45" strokeWidth={sw * 1.5} />
          <path d={t.stem} fill="none" stroke={fill} strokeWidth={sw} />
          {t.volutes.map((d, i) => (
            <g key={i}>
              <path d={d} fill="none" stroke={stroke} strokeOpacity="0.45" strokeWidth={sw * 1.4} strokeLinecap="round" />
              <path d={d} fill="none" stroke={fill} strokeWidth={sw * 0.95} strokeLinecap="round" />
            </g>
          ))}
          {t.leaves.map((l, i) => (
            <path key={i} d={l.d} transform={l.transform} fill={fill} stroke={stroke} strokeWidth={sw * 0.25} strokeOpacity="0.6" />
          ))}
          {t.buds.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={sw * 0.9} fill={fill} stroke={stroke} strokeWidth={sw * 0.2} strokeOpacity="0.6" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${ids.p})`} filter={carved ? `url(#${ids.c})` : undefined} />
    </OrnamentSvg>
  );
}
