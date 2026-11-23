import { useMemo } from 'react';
import { lotusRosette } from './geometry/lotus';
import { outlineToPath } from './geometry/path';
import { Gilt, INCISE, OrnamentSvg, useIds, type Tone } from './Ornament';

/** Rosette as an SVG group centred on (0,0), radius r. Reused inside other ornaments. */
export function RosetteGroup({ r, fill, stroke }: { r: number; fill: string; stroke: string }) {
  const g = useMemo(() => {
    const ros = lotusRosette(r);
    return { ...ros, paths: ros.layers.map((l) => ({ d: outlineToPath(l.petal), count: l.count, off: l.rotationOffset })) };
  }, [r]);
  return (
    <g>
      {g.paths.map((layer, li) => (
        <g key={li} opacity={li === 0 ? 0.62 : 1}>
          {Array.from({ length: layer.count }, (_, i) => (
            <path
              key={i}
              d={layer.d}
              transform={`rotate(${layer.off + (360 / layer.count) * i})`}
              fill={fill}
              stroke={stroke}
              strokeWidth={r * 0.012}
              strokeOpacity="0.6"
            />
          ))}
        </g>
      ))}
      <circle r={g.podR} fill={fill} stroke={stroke} strokeWidth={r * 0.016} />
      {g.seeds.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={g.podR * 0.16} fill={stroke} opacity="0.7" />
      ))}
    </g>
  );
}

/** KH-LOT-02: lotus rosette (frontal lotus), after the Angkor Wat gallery ceiling rosettes. */
export function LotusRosette({ size = 48, tone = 'gold', className }: { size?: number; tone?: Tone; className?: string }) {
  const ids = useIds('g');
  return (
    <OrnamentSvg motifs={['KH-LOT-02']} viewBox="-52 -52 104 104" width={size} height={size} className={className}>
      <defs>
        <Gilt id={ids.g} tone={tone} />
      </defs>
      <RosetteGroup r={50} fill={`url(#${ids.g})`} stroke={INCISE[tone]} />
    </OrnamentSvg>
  );
}
