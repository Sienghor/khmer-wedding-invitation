import { useMemo } from 'react';
import { snailSpiral } from './geometry/kbach';
import { lotusRosette } from './geometry/lotus';
import { outlineToPath } from './geometry/path';
import { OrnamentSvg, useIds } from './Ornament';

/**
 * KH-WAL-01: Banteay Srei "wall tapestry with squares and motifs with foliated
 * scrolls". A grid of squares, each holding a four-petal frontal lotus
 * (KH-LOT-02) with snail-spiral volutes (KH-KB-02) toward the corners.
 * Low contrast: it is a ground, not a figure (the CSS mask in .wall-tapestry
 * softens it further behind text). Fills its positioned parent.
 */
export function WallTapestry({ cell = 64, opacity = 0.17, color = 'var(--c-gold)', className }: { cell?: number; opacity?: number; color?: string; className?: string }) {
  const ids = useIds('p');
  const t = useMemo(() => {
    const c = cell / 2;
    const r = cell * 0.2;
    const petal = outlineToPath(lotusRosette(r).layers[1].petal);
    const spirals = [45, 135, 225, 315].map((deg) => {
      const a = (deg * Math.PI) / 180;
      return snailSpiral(c + Math.cos(a) * cell * 0.31, c + Math.sin(a) * cell * 0.31, cell * 0.07, deg % 180 === 45 ? 1 : -1, a + Math.PI);
    });
    return { c, petal, spirals };
  }, [cell]);
  return (
    <OrnamentSvg motifs={['KH-WAL-01', 'KH-LOT-02', 'KH-KB-02']} className={className} width="100%" height="100%" style={{ position: 'absolute', inset: 0, display: 'block', pointerEvents: 'none' }}>
      <defs>
        <pattern id={ids.p} patternUnits="userSpaceOnUse" width={cell} height={cell} x="50%" y="0">
          <g fill="none" stroke={color} strokeWidth="1.25">
            <rect x="2" y="2" width={cell - 4} height={cell - 4} />
            {/* Petals lightly filled so the rosette reads as carved relief, not just an outline. */}
            {[0, 90, 180, 270].map((deg) => (
              <path key={deg} d={t.petal} fill={color} fillOpacity="0.28" transform={`translate(${t.c} ${t.c}) rotate(${deg + 45})`} />
            ))}
            <circle cx={t.c} cy={t.c} r={cell * 0.045} fill={color} fillOpacity="0.5" />
            {t.spirals.map((d, i) => (
              <path key={i} d={d} strokeLinecap="round" />
            ))}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${ids.p})`} opacity={opacity} />
    </OrnamentSvg>
  );
}
