import { useMemo } from 'react';
import { petalBandTile } from './geometry/lotus';
import { outlineToPath, transformOutline } from './geometry/path';
import { Gilt, INCISE, OrnamentSvg, useIds, type Tone } from './Ornament';

/**
 * KH-LOT-01: upward lotus-petal moulding band.
 * Petals always point upward. There is deliberately no prop to flip them.
 * The pattern origin sits at 50%, and front petals sit at the tile edges, so a
 * front petal always lands on the axis of symmetry whatever the width.
 */
export function LotusPetalBand({ height = 18, tone = 'gold', className }: { height?: number; tone?: Tone; className?: string }) {
  const ids = useIds('g', 'p');
  const t = useMemo(() => {
    const tile = petalBandTile(height * 0.74, height);
    const half = tile.width / 2;
    const at = (dx: number) => (o: typeof tile.front) => outlineToPath(transformOutline(o, dx, 0));
    return {
      w: tile.width,
      back: at(half)(tile.back[0]),
      fronts: [-half, half].map((dx) => at(dx)(tile.front)),
      inners: [-half, half].map((dx) => at(dx)(tile.frontInner)),
      ribs: [-half, half].map((dx) => `M${tile.midrib[0][0] + dx} ${tile.midrib[0][1]}V${tile.midrib[1][1]}`),
    };
  }, [height]);

  return (
    <OrnamentSvg motifs={['KH-LOT-01']} className={className} width="100%" height={height} style={{ display: 'block' }}>
      <defs>
        <Gilt id={ids.g} tone={tone} />
        <pattern id={ids.p} patternUnits="userSpaceOnUse" width={t.w} height={height} x="50%" y="0">
          <path d={t.back} fill={`url(#${ids.g})`} opacity="0.5" />
          {t.fronts.map((d, i) => (
            <path key={i} d={d} fill={`url(#${ids.g})`} stroke={INCISE[tone]} strokeWidth="0.6" strokeOpacity="0.55" />
          ))}
          {t.inners.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={INCISE[tone]} strokeWidth="0.6" strokeOpacity="0.5" />
          ))}
          {t.ribs.map((d, i) => (
            <path key={i} d={d} stroke={INCISE[tone]} strokeWidth="0.5" strokeOpacity="0.4" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${ids.p})`} />
    </OrnamentSvg>
  );
}
