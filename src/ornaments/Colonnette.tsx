import { useMemo } from 'react';
import { colonnetteProfile, OCTAGON_FACET_STOPS } from './geometry/colonnette';
import { lotusPetal } from './geometry/lotus';
import { outlineToPath, transformOutline } from './geometry/path';
import { INCISE, OrnamentSvg, useIds, type Tone } from './Ornament';

/**
 * KH-COL-01: octagonal ringed colonnette in elevation.
 * The octagon's three visible faces are hard-stop gradient bands placed at the
 * true projected facet edges (see OCTAGON_FACET_STOPS).
 */
export function Colonnette({ tone = 'gold', className, style }: { tone?: Tone; className?: string; style?: React.CSSProperties }) {
  const H = 400;
  const R = 17;
  const ids = useIds('facet', 'sheen');
  const g = useMemo(() => {
    const c = colonnetteProfile(H, R);
    const maxR = Math.max(...c.profile.map((p) => p[0]));
    const toY = (y: number) => H - y;
    const right = c.profile.map(([r, y]) => `${maxR + r} ${toY(y)}`);
    const left = [...c.profile].reverse().map(([r, y]) => `${maxR - r} ${toY(y)}`);
    const outline = `M${right.join('L')}L${left.join('L')}Z`;
    // Carved-leaf collars: small upward petals around each ring.
    const collars = c.rings
      .map((ry) => {
        const y = toY(ry) - R * 0.62;
        return [-0.7, 0, 0.7]
          .map((k) => outlineToPath(transformOutline(lotusPetal(R * 0.7, R * 1.05), maxR + k * R * 0.95, y)))
          .join('');
      })
      .join('');
    return { outline, collars, width: maxR * 2 };
  }, []);

  const [, a, b] = OCTAGON_FACET_STOPS;
  const shade = tone === 'light' ? ['#b99660', '#f8ecd0', '#cfae74'] : ['var(--c-gold-deep)', 'var(--c-gold-light)', 'var(--c-gold)'];
  return (
    <OrnamentSvg motifs={['KH-COL-01', 'KH-LOT-01']} viewBox={`0 0 ${g.width} ${H}`} className={className} style={style} preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id={ids.facet} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade[0]} />
          <stop offset={a} stopColor={shade[2]} />
          <stop offset={a} stopColor={shade[1]} />
          <stop offset={b} stopColor={shade[1]} />
          <stop offset={b} stopColor={shade[0]} />
          <stop offset="1" stopColor={shade[0]} />
        </linearGradient>
        <linearGradient id={ids.sheen} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <path d={g.outline} fill={`url(#${ids.facet})`} stroke={INCISE[tone]} strokeWidth="0.6" strokeOpacity="0.5" />
      <path d={g.outline} fill={`url(#${ids.sheen})`} />
      <path d={g.collars} fill={shade[1]} stroke={INCISE[tone]} strokeWidth="0.5" strokeOpacity="0.6" />
    </OrnamentSvg>
  );
}
