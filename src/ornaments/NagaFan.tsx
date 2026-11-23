import { useMemo } from 'react';
import { nagaFan, nagaHoodDetail, nagaNeck } from './geometry/naga';
import { Gilt, INCISE, OrnamentSvg, useIds, type Tone } from './Ornament';

export type NagaHeadCount = 1 | 3 | 5 | 7;

/** Fan of hooded heads as a group with its neck at (0,0). Reused by the lintel and balustrade. */
export function NagaFanGroup({ heads = 3, w, h, fill, stroke, neck = 0 }: { heads?: NagaHeadCount; w: number; h: number; fill: string; stroke: string; neck?: number }) {
  const g = useMemo(() => ({ fan: nagaFan(heads, w, h), detail: nagaHoodDetail(w, h), neck: neck > 0 ? nagaNeck(w, h, neck) : '' }), [heads, w, h, neck]);
  const sw = w * 0.025;
  return (
    <g>
      {g.neck && <path d={g.neck} fill={fill} stroke={stroke} strokeWidth={sw} strokeOpacity="0.5" />}
      {g.fan.map((head, i) => (
        <g key={i}>
          <path d={head.path} fill={fill} stroke={stroke} strokeWidth={sw} strokeOpacity="0.65" />
          <g transform={`translate(${head.x} ${head.y}) rotate(${head.rot}) scale(${head.scale})`}>
            <path d={g.detail.head} fill={fill} stroke={stroke} strokeWidth={sw} strokeOpacity="0.75" />
            {g.detail.lines.map((d, j) => (
              <path key={j} d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeOpacity="0.7" />
            ))}
            {g.detail.eyes.map(([x, y], j) => (
              <circle key={j} cx={x} cy={y} r={g.detail.eyeR} fill={stroke} />
            ))}
            {g.detail.marks.map(([x, y], j) => (
              <circle key={`m${j}`} cx={x} cy={y} r={g.detail.markR} fill={stroke} opacity="0.45" />
            ))}
          </g>
        </g>
      ))}
    </g>
  );
}

/** KH-NAG-01: multi-headed naga fan. Head count is restricted to odd numbers by type and at runtime. */
export function NagaFan({ heads = 3, size = 80, tone = 'gold', className }: { heads?: NagaHeadCount; size?: number; tone?: Tone; className?: string }) {
  const ids = useIds('g');
  return (
    <OrnamentSvg motifs={['KH-NAG-01']} viewBox="-90 -112 180 150" width={size} height={(size * 150) / 180} className={className}>
      <defs>
        <Gilt id={ids.g} tone={tone} />
      </defs>
      <NagaFanGroup heads={heads} w={60} h={92} fill={`url(#${ids.g})`} stroke={INCISE[tone]} neck={22} />
    </OrnamentSvg>
  );
}
