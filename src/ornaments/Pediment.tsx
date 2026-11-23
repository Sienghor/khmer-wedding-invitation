import { useMemo } from 'react';
import { pediment, pedimentBox, superposedLayout } from './geometry/pediment';
import { smoothPath } from './geometry/path';
import { RosetteGroup } from './LotusRosette';
import { CarveFilter, Gilt, INCISE, OrnamentSvg, useIds, type Tone } from './Ornament';

/**
 * KH-PED-01: Banteay Srei triangular fronton, optionally superposed (stacked).
 * Frame scrolls into large terminal volutes and is crested with flame leaves;
 * the tympanum carries a single vegetal composition of volutes (KH-VIN-01)
 * around a lotus rosette (KH-LOT-02) in place of a narrative scene. The apex
 * finial is the Bodhi-leaf kbach (KH-KB-01). Right half mirrored with <use>.
 */
export function Pediment({
  width = 320,
  tiers = 2,
  tone = 'gold',
  stone = false,
  className,
  draw = false,
  children,
}: {
  width?: number | string;
  tiers?: 1 | 2 | 3;
  tone?: Tone;
  /** Fill the tympanum with warm sandstone (Banteay Srei's "rose tint"). */
  stone?: boolean;
  className?: string;
  /** Stroke-draw frame and foliage when revealed (pairs with [data-reveal=draw]). */
  draw?: boolean;
  /** Optional content drawn in the tympanum centre instead of the rosette (SVG, origin at rosette centre). */
  children?: React.ReactNode;
}) {
  const W = 300;
  const box = pedimentBox(W, tiers);
  const H = box.H;
  const ids = useIds('g', 'half', 'c', 's', 'ty', 'm');
  const geo = useMemo(() => {
    const p = pediment(W, H);
    return {
      p,
      slope: smoothPath(p.frame.slice(0, p.voluteStart + 1)),
      volute: smoothPath(p.frame.slice(p.voluteStart)),
      foliage: p.foliage.map((pts) => smoothPath(pts)),
    };
  }, []);
  const { p } = geo;
  const layout = superposedLayout(H, tiers);
  const vbX = box.x;
  const vbY = box.y;
  const vbW = box.w;
  const vbH = box.h;
  const fill = `url(#${ids.g})`;
  const stroke = INCISE[tone];
  const dark = tone === 'light';
  const dp = draw ? { pathLength: 1, className: 'draw-path' } : {};

  return (
    <OrnamentSvg
      motifs={['KH-PED-01', 'KH-VIN-01', 'KH-LOT-02', 'KH-KB-01']}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      className={className}
      style={{ width, height: 'auto', overflow: 'visible', display: 'block' }}
    >
      <defs>
        <Gilt id={ids.g} tone={tone} />
        <CarveFilter id={ids.c} dark={dark} />
        <linearGradient id={ids.s} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in oklab, var(--c-sandstone) 70%, var(--c-ivory))" />
          <stop offset="1" stopColor="var(--c-sandstone)" />
        </linearGradient>
        <g id={ids.half}>
          {/* tympanum foliage: volutes forming a single composition */}
          {geo.foliage.map((d, i) => (
            <g key={i}>
              <path d={d} fill="none" stroke={stroke} strokeOpacity="0.5" strokeWidth={i === 0 ? 4.2 : 3.2} strokeLinecap="round" {...dp} />
              <path d={d} fill="none" stroke={fill} strokeWidth={i === 0 ? 3 : 2.2} strokeLinecap="round" {...dp} />
            </g>
          ))}
          {p.foliageLeaves.map((l, i) => (
            <path key={i} d={l.d} transform={l.transform} fill={fill} stroke={stroke} strokeWidth="0.5" strokeOpacity="0.6" />
          ))}
          {/* frame: sweeping slope, then the large terminal volute */}
          <path d={geo.slope} fill="none" stroke={stroke} strokeOpacity="0.6" strokeWidth={p.band + 1.4} strokeLinecap="round" />
          <path d={geo.slope} fill="none" stroke={fill} strokeWidth={p.band} strokeLinecap="round" {...dp} />
          <path d={geo.volute} fill="none" stroke={stroke} strokeOpacity="0.6" strokeWidth={p.band * 0.82 + 1.2} strokeLinecap="round" />
          <path d={geo.volute} fill="none" stroke={fill} strokeWidth={p.band * 0.82} strokeLinecap="round" {...dp} />
          <path d={geo.slope} fill="none" stroke={stroke} strokeOpacity="0.55" strokeWidth="0.7" />
          <path d={geo.volute} fill="none" stroke={stroke} strokeOpacity="0.5" strokeWidth="0.6" />
          {/* crest of flame leaves */}
          {p.crest.map((l, i) => (
            <path key={i} d={l.d} transform={l.transform} fill={fill} stroke={stroke} strokeWidth="0.5" strokeOpacity="0.6" />
          ))}
        </g>
        <g id={ids.ty}>
          <path d={p.tympanum} fill={stone ? `url(#${ids.s})` : fill} opacity={stone ? 0.9 : 0.16} />
          <use href={`#${ids.half}`} />
          <use href={`#${ids.half}`} transform="scale(-1 1)" />
          <path d={p.finial} fill={fill} stroke={stroke} strokeWidth="0.6" strokeOpacity="0.6" />
          <g transform={`translate(${p.rosette.cx} ${p.rosette.cy})`}>{children ?? <RosetteGroup r={p.rosette.r} fill={fill} stroke={stroke} />}</g>
        </g>
        {/* Rear frontons are hidden wherever a fronton in front of them stands (no background colour needed). */}
        <mask id={ids.m} maskUnits="userSpaceOnUse" x={vbX - W} y={vbY - H} width={vbW + 2 * W} height={vbH + 2 * H}>
          <rect x={vbX - W} y={vbY - H} width={vbW + 2 * W} height={vbH + 2 * H} fill="#fff" />
          {layout
            .filter((t) => t.depth < tiers - 1)
            .map((t, i) => (
              <path key={i} d={p.tympanum} transform={`translate(${t.dx} ${t.dy}) scale(${t.s})`} fill="#000" />
            ))}
        </mask>
      </defs>
      <g filter={`url(#${ids.c})`}>
        {layout.map((t, i) => (
          <g key={i} mask={t.depth ? `url(#${ids.m})` : undefined}>
            <g transform={`translate(${t.dx} ${t.dy}) scale(${t.s})`} opacity={t.depth ? 0.72 - t.depth * 0.08 : 1}>
              <use href={`#${ids.ty}`} />
            </g>
          </g>
        ))}
      </g>
    </OrnamentSvg>
  );
}
