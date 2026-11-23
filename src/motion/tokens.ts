/**
 * Motion language: TS mirror of the CSS tokens in styles/tokens.css, for
 * the few animations driven from script (3D opening, countdown).
 */
export const ease = {
  /** Long deceleration, used for every entrance. */
  ceremonial: (t: number) => 1 - Math.pow(1 - t, 4),
  /** Symmetric, for crossfades and camera moves. */
  silk: (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2),
  /** Smoothstep for light sweeps. */
  smooth: (t: number) => t * t * (3 - 2 * t),
};

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Normalised progress of `t` within [start, start + dur]. */
export const phase = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

export const durations = { quick: 220, base: 520, slow: 900, reveal: 1100, draw: 1800 } as const;
