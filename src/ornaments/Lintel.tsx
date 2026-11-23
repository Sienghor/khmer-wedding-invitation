import { useMemo } from 'react';
import { lintelLayout, SRALAO_ASPECT } from './geometry/lintel';
import { petalBandTile } from './geometry/lotus';
import { offsetPolyline, outlineToPath, smoothPath, transformOutline } from './geometry/path';
import { NagaFanGroup } from './NagaFan';
import { RosetteGroup } from './LotusRosette';
import { Gilt, INCISE, OrnamentSvg, ReliefFilter, useIds, type Tone } from './Ornament';

/**
 * KH-LIN-01: Banteay Srei-style lintel after the Sralao Temple lintel (NMC).
 * Only the right half is generated; the left half is the same group mirrored
 * with <use>, so the composition is exactly symmetric, as in the source.
 */
export function Lintel({
  aspect = SRALAO_ASPECT,
  tone = 'gold',
  relief = false,
  sweep = false,
  className,
  draw = false,
}: {
  aspect?: number;
  tone?: Tone;
  /** Apply raking-light relief shading (heavier: use for hero placements only). */
  relief?: boolean;
  /** Animate the raking light once across the relief. */
  sweep?: boolean;
  className?: string;
  /** Stroke-draw the tendrils when revealed (pairs with [data-reveal=draw]). */
  draw?: boolean;
}) {
  const H = 100;
  const W = Math.round(H * aspect);
  const ids = useIds('g', 'half', 'f', 'p');
  const L = useMemo(() => {
    const l = lintelLayout(W, H);
    const top = offsetPolyline(l.branch, -l.bodyThickness / 2);
    const bot = offsetPolyline(l.branch, l.bodyThickness / 2);
    const body = `${smoothPath(top)}L${bot[bot.length - 1][0]} ${bot[bot.length - 1][1]}${smoothPath([...bot].reverse()).replace(/^M[^C]+/, '')}Z`;
    const scales = [-0.22, 0.22].flatMap((k) => offsetPolyline(l.branch, l.bodyThickness * k).filter((_, i) => i % 2 === (k < 0 ? 0 : 1) && i < l.branch.length * 0.92));
    const tile = petalBandTile(l.lotusRow.tileW, l.lotusRow.h);
    return {
      l,
      body,
      edge: smoothPath(l.branch),
      scales,
      loops: l.loops.map((lp) => ({ d: smoothPath(lp.pts), w: lp.weight })),
      tile: {
        w: tile.width,
        front: outlineToPath(transformOutline(tile.front, -tile.width / 2, 0)) + outlineToPath(transformOutline(tile.front, tile.width / 2, 0)),
        back: outlineToPath(tile.back[0]).length ? outlineToPath(transformOutline(tile.back[0], tile.width / 2, 0)) : '',
      },
    };
  }, [W]);
  const { l } = L;
  const fill = `url(#${ids.g})`;
  const stroke = INCISE[tone];

  return (
    <OrnamentSvg
      motifs={['KH-LIN-01', 'KH-NAG-01', 'KH-LOT-01', 'KH-LOT-02', 'KH-KB-02']}
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      style={{ width: '100%', height: 'auto', overflow: 'visible' }}
    >
      <defs>
        <Gilt id={ids.g} tone={tone} />
        {relief && <ReliefFilter id={ids.f} sweep={sweep} width={W} />}
        <pattern id={ids.p} patternUnits="userSpaceOnUse" width={L.tile.w} height={l.lotusRow.h} x={W / 2} y={l.lotusRow.y}>
          <path d={L.tile.back} fill={fill} opacity="0.5" />
          <path d={L.tile.front} fill={fill} stroke={stroke} strokeWidth="0.35" strokeOpacity="0.6" />
        </pattern>
        <g id={ids.half}>
          {/* naga-bodied branch */}
          <path d={L.body} fill={fill} stroke={stroke} strokeWidth="0.4" strokeOpacity="0.6" />
          <path d={L.edge} fill="none" stroke={stroke} strokeWidth="0.35" strokeOpacity="0.45" />
          {L.scales.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={l.bodyThickness * 0.085} fill={stroke} opacity="0.45" />
          ))}
          {/* descending loops of vegetation ending in snail spirals (pseudo-tympanum) */}
          {L.loops.map((lp, i) => (
            <g key={i}>
              <path d={lp.d} fill="none" stroke={stroke} strokeOpacity="0.35" strokeWidth={l.H * 0.03 * lp.w} strokeLinecap="round" pathLength={draw ? 1 : undefined} className={draw ? 'draw-path' : undefined} />
              <path d={lp.d} fill="none" stroke={fill} strokeWidth={l.H * 0.022 * lp.w} strokeLinecap="round" pathLength={draw ? 1 : undefined} className={draw ? 'draw-path' : undefined} />
            </g>
          ))}
          {/* small three-headed nagas along the branch */}
          {l.crests.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <NagaFanGroup heads={3} w={l.crestSize.w} h={l.crestSize.h} fill={fill} stroke={stroke} />
            </g>
          ))}
          {/* large three-headed naga at the branch end */}
          <g transform={`translate(${l.endFan.x} ${l.endFan.y}) rotate(${l.endFan.rot})`}>
            <NagaFanGroup heads={3} w={l.endFan.w} h={l.endFan.h} fill={fill} stroke={stroke} />
          </g>
        </g>
      </defs>

      <g filter={relief ? `url(#${ids.f})` : undefined}>
        {l.fillets.map((fl, i) => (
          <rect key={i} x="0" y={fl.y} width={W} height={fl.h} fill={fill} opacity={i === 0 ? 1 : 0.7} />
        ))}
        <use href={`#${ids.half}`} />
        <use href={`#${ids.half}`} transform={`translate(${W} 0) scale(-1 1)`} />
        {/* central medallion: lotus rosette in place of the deity (see registry KH-LIN-01) */}
        <circle cx={l.medallion.cx} cy={l.medallion.cy} r={l.medallion.R} fill="none" stroke={fill} strokeWidth={l.H * 0.018} />
        <circle cx={l.medallion.cx} cy={l.medallion.cy} r={l.medallion.R * 0.9} fill="none" stroke={stroke} strokeWidth={l.H * 0.004} strokeOpacity="0.5" />
        <g transform={`translate(${l.medallion.cx} ${l.medallion.cy})`}>
          <RosetteGroup r={l.medallion.R * 0.84} fill={fill} stroke={stroke} />
        </g>
        <rect x="0" y={l.lotusRow.y} width={W} height={l.lotusRow.h} fill={`url(#${ids.p})`} />
      </g>
    </OrnamentSvg>
  );
}
