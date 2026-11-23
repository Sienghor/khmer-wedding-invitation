import { useId, type CSSProperties, type ReactNode } from 'react';
import type { MotifId } from '../heritage/registry';

export type Tone = 'gold' | 'light' | 'ink';

/**
 * Root wrapper for every code-rendered ornament.
 * - Declares the heritage motif IDs it renders (data-motif, development builds only), so any ornament
 *   on screen can be traced to src/heritage/registry.ts.
 * - Ornaments are decorative: hidden from assistive technology.
 */
export function OrnamentSvg({
  motifs,
  viewBox,
  className,
  style,
  width,
  height,
  preserveAspectRatio,
  children,
}: {
  motifs: MotifId[];
  viewBox?: string;
  className?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
  preserveAspectRatio?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={style}
      width={width}
      height={height}
      preserveAspectRatio={preserveAspectRatio}
      aria-hidden="true"
      focusable="false"
      data-motif={import.meta.env.DEV ? motifs.join(' ') : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

/** Stable, selector-safe ids for gradients/filters inside one ornament. */
export function useIds<const K extends string>(...keys: K[]): Record<K, string> {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return Object.fromEntries(keys.map((k) => [k, `o${base}${k}`])) as Record<K, string>;
}

const STOPS: Record<Tone, [string, string, string]> = {
  gold: ['var(--c-gold-light)', 'var(--c-champagne)', 'var(--c-gold)'],
  light: ['#fff7e6', 'var(--c-gold-light)', 'var(--c-champagne)'],
  ink: ['var(--c-gold)', 'var(--c-gold-deep)', 'var(--c-gold-deep)'],
};

/** Vertical gilt gradient: light catches the upper edge as on carved relief. */
export function Gilt({ id, tone = 'gold', horizontal = false }: { id: string; tone?: Tone; horizontal?: boolean }) {
  const [a, b, c] = STOPS[tone];
  return (
    <linearGradient id={id} x1="0" y1="0" x2={horizontal ? '1' : '0'} y2={horizontal ? '0' : '1'}>
      <stop offset="0" stopColor={a} />
      <stop offset="0.45" stopColor={b} />
      <stop offset="1" stopColor={c} />
    </linearGradient>
  );
}

/** Stroke colour paired with each tone for incised detail lines. */
export const INCISE: Record<Tone, string> = {
  gold: 'var(--c-gold-deep)',
  light: 'var(--c-gold)',
  ink: 'var(--c-charcoal)',
};

/**
 * Carved-relief lighting: a specular point light raked across the motif's
 * alpha, like low sun across sandstone. `sweep` animates the light (SMIL) for
 * the "light moving across ornament" moment. Off under reduced motion.
 */
export function ReliefFilter({ id, sweep = false, width = 400 }: { id: string; sweep?: boolean; width?: number }) {
  return (
    <filter id={id} x="-5%" y="-10%" width="110%" height="120%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.9" result="blur" />
      <feSpecularLighting in="blur" surfaceScale="2.4" specularConstant="0.85" specularExponent="22" lightingColor="#fff6df" result="spec">
        <fePointLight x={sweep ? -width * 0.2 : width * 0.3} y="-60" z="90">
          {sweep && <animate attributeName="x" values={`${-width * 0.2};${width * 1.2}`} dur="5.5s" begin="0.8s" fill="freeze" calcMode="spline" keySplines="0.65 0 0.35 1" />}
        </fePointLight>
      </feSpecularLighting>
      <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
      <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.75" k4="0" />
    </filter>
  );
}

/**
 * Cheap carved-stone filter (no blur, no lighting maths): a cast shadow
 * below-right and a lit edge on the upper-left of every shape, as low sun
 * rakes across a bas-relief. Safe for many instances on a page.
 */
export function CarveFilter({ id, depth = 1, dark = false }: { id: string; depth?: number; dark?: boolean }) {
  const shadow = dark ? 'rgb(0 0 0 / 0.55)' : 'rgb(70 45 25 / 0.32)';
  const light = dark ? 'rgb(255 240 210 / 0.55)' : 'rgb(255 250 235 / 0.85)';
  return (
    <filter id={id} x="-6%" y="-6%" width="112%" height="114%" colorInterpolationFilters="sRGB">
      <feOffset in="SourceAlpha" dx={0.7 * depth} dy={1.2 * depth} result="off" />
      <feFlood floodColor={shadow} result="sc" />
      <feComposite in="sc" in2="off" operator="in" result="shadow" />
      <feOffset in="SourceAlpha" dx={0.55 * depth} dy={0.75 * depth} result="off2" />
      <feComposite in="SourceAlpha" in2="off2" operator="out" result="rim" />
      <feFlood floodColor={light} result="lc" />
      <feComposite in="lc" in2="rim" operator="in" result="lit" />
      <feMerge>
        <feMergeNode in="shadow" />
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="lit" />
      </feMerge>
    </filter>
  );
}
