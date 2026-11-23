import { useMemo } from 'react';
import { nagaBalustrade } from './geometry/naga';
import { NagaFanGroup } from './NagaFan';
import { Gilt, INCISE, OrnamentSvg, useIds, type Tone } from './Ornament';

/**
 * KH-NAG-02: naga balustrade, after the Angkor Wat causeway ("naga shaped
 * balustrades"). Two mirrored balustrades whose bodies rise into three-headed
 * fans (KH-NAG-01) at the outer ends, as at a causeway entrance.
 */
export function NagaBalustrade({ tone = 'gold', className }: { tone?: Tone; className?: string }) {
  const W = 400;
  const H = 70;
  const ids = useIds('g', 'half');
  const b = useMemo(() => nagaBalustrade(W * 0.54, W * 0.93, H * 0.72, H * 0.13), []);
  const fill = `url(#${ids.g})`;
  const stroke = INCISE[tone];
  return (
    <OrnamentSvg motifs={['KH-NAG-02', 'KH-NAG-01']} viewBox={`0 0 ${W} ${H}`} className={className} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <Gilt id={ids.g} tone={tone} />
        <g id={ids.half}>
          <rect x={b.plinth.x} y={b.plinth.y} width={b.plinth.w} height={b.plinth.h} fill={fill} opacity="0.55" />
          <path d={b.body} fill={fill} stroke={stroke} strokeWidth="0.5" strokeOpacity="0.6" />
          {b.scales.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={H * 0.014} fill={stroke} opacity="0.5" />
          ))}
          <g transform={`translate(${b.fanAt[0]} ${b.fanAt[1]}) rotate(8)`}>
            <NagaFanGroup heads={3} w={H * 0.36} h={H * 0.56} fill={fill} stroke={stroke} />
          </g>
        </g>
      </defs>
      <use href={`#${ids.half}`} />
      <use href={`#${ids.half}`} transform={`translate(${W} 0) scale(-1 1)`} />
    </OrnamentSvg>
  );
}
