import { useMemo } from 'react';
import { lotusBudTower, quincunxLayout } from './geometry/tower';
import { OrnamentSvg, useIds } from './Ornament';

/**
 * KH-TWR-01: Angkor Wat's "ogival, redented towers shaped like lotus buds"
 * in a "central quincunx", shown in elevation on three stepped terraces.
 * Each tower is its own <g> with a CSS index (--i) so the closing animation
 * can raise them in sequence, outer towers first.
 */
export function TowerQuincunx({ className, glow = true }: { className?: string; glow?: boolean }) {
  const W = 400;
  const H = 220;
  const ids = useIds('stone', 'far', 'sky');
  const g = useMemo(() => {
    const q = quincunxLayout(W, H);
    return {
      terraces: q.terraceRects,
      towers: [...q.towers].sort((a, b) => b.depth - a.depth).map((t) => ({ ...t, p: lotusBudTower(t.w, t.h) })),
    };
  }, []);
  return (
    <OrnamentSvg motifs={['KH-TWR-01', 'KH-LOT-01']} viewBox={`0 0 ${W} ${H}`} className={className} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id={ids.stone} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--c-champagne)" />
          <stop offset="1" stopColor="var(--c-gold)" />
        </linearGradient>
        <linearGradient id={ids.far} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--c-gold)" />
          <stop offset="1" stopColor="var(--c-gold-deep)" />
        </linearGradient>
        <radialGradient id={ids.sky} cx="0.5" cy="0.85" r="0.6">
          <stop offset="0" stopColor="var(--c-champagne)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--c-champagne)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && <rect className="tq-glow" width={W} height={H} fill={`url(#${ids.sky})`} />}
      {g.towers.map((t, i) => (
        <g key={i} className="tq-tower" style={{ ['--i' as string]: i }} transform={`translate(${t.x} ${t.baseY})`}>
          <g fill={t.depth === 0 ? `url(#${ids.stone})` : `url(#${ids.far})`} opacity={1 - t.depth * 0.14}>
            <path d={t.p.body} />
            {t.p.tiers.map((d, j) => (
              <path key={j} d={d} />
            ))}
            <path d={t.p.finial} />
          </g>
          <path d={t.p.door} fill="var(--c-charcoal)" opacity="0.55" />
        </g>
      ))}
      {g.terraces.map((r, i) => (
        <rect key={i} className="tq-terrace" x={r.x} y={r.y} width={r.w} height={r.h} fill={`url(#${ids.far})`} opacity={0.85 + i * 0.05} />
      ))}
    </OrnamentSvg>
  );
}
