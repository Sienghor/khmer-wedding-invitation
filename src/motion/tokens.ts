/**
 * Motion language: TS mirror of the CSS tokens in styles/tokens.css, for
 * the few animations driven from script (3D opening, countdown).
 */

/** Critically damped spring (ζ = 1): no overshoot. ω = 9.2 settles to 0.999 at t = 1. */
const SPRING_W = 9.2;

export const ease = {
  /** Long deceleration (cubic-bezier fallback of the spring). */
  ceremonial: (t: number) => 1 - Math.pow(1 - t, 4),
  /** Entrances: critically damped spring, mirrors --ease-spring. Never exceeds 1. */
  spring: (t: number) => (t >= 1 ? 1 : 1 - (1 + SPRING_W * t) * Math.exp(-SPRING_W * t)),
  /** Symmetric, for crossfades and camera moves. */
  silk: (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2),
  /** Smoothstep for light sweeps. */
  smooth: (t: number) => t * t * (3 - 2 * t),
};

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Normalised progress of `t` within [start, start + dur]. */
export const phase = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

/** Milliseconds. `hero`/`heroDraw` are reserved for the hero and the doorway. */
export const durations = { quick: 220, base: 520, slow: 900, reveal: 700, draw: 1400, hero: 1100, heroDraw: 1800 } as const;

/** Base stagger step (ms); see `choreo()` for how steps accumulate. */
export const stagger = 70;

/**
 * Choreographed offset for the i-th sibling, in stagger units. Steps shrink
 * geometrically (1, 0.82, 0.67 …) so a group gathers instead of ticking out
 * at a metronome pace: 0, 1, 1.82, 2.49, 3.04 …
 */
export const choreo = (i: number) => (i <= 0 ? 0 : (1 - Math.pow(0.82, i)) / 0.18);
