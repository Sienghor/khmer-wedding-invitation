import { createElement, useCallback, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { choreo } from './tokens';

/**
 * Two ways in, chosen per element when it mounts (before first paint):
 *
 *  - "scroll" (Chrome, Safari 26+): the entrance is a keyframe animation on a
 *    view() timeline. It tracks the scrollbar, reverses on scroll-up, and an
 *    element that is already on screen is already (mostly) there, so a fast
 *    jump never lands on a blank section. Static styles are the final state,
 *    so if the timeline is ever inactive the content is simply visible.
 *  - "time" (older Safari/iOS, Firefox, or when forced): the classic
 *    once-only transition, triggered by one shared IntersectionObserver.
 *
 * Time mode is also used when the element has an explicit `delay` (above-the-
 * fold choreography such as the hero cannot be scroll-linked), when `timed`
 * is set, or when an ancestor is a scroll container (`overflow: hidden/auto`),
 * because view() would bind to that box instead of the page and never move.
 * Prefer `overflow: clip` on sections so their content can scrub.
 *
 * The observer runs in both modes: it still sets `data-inview` once, which
 * other CSS uses as a hook (e.g. Closing's towers).
 */
let io: IntersectionObserver | null = null;
function observer() {
  if (io) return io;
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.inview = 'true';
          io!.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -4% 0px', threshold: 0.02 },
  );
  return io;
}

const scrollTimelines = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline: view()');

const SCROLLS = /(hidden|auto|scroll)/;
function insideScroller(el: HTMLElement) {
  for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
    const cs = getComputedStyle(p);
    if (SCROLLS.test(cs.overflowX) || SCROLLS.test(cs.overflowY)) return true;
  }
  return false;
}

export function useReveal<T extends HTMLElement>(timed = false) {
  return useCallback(
    (el: T | null) => {
      if (!el) return;
      el.dataset.revealMode = scrollTimelines && !timed && !insideScroller(el) ? 'scroll' : 'time';
      if (typeof IntersectionObserver === 'undefined') {
        el.dataset.inview = 'true';
        return;
      }
      const o = observer();
      o.observe(el);
      return () => o.unobserve(el);
    },
    [timed],
  );
}

/**
 * - rise    small lift (14px) + fade. The default.
 * - fade    opacity only; use for body copy.
 * - scale   settles from 0.97.
 * - unveil  children wipe in from the top (clip-path).
 * - draw    `.draw-path` strokes inside draw themselves; scrubbed with scroll.
 * - mask    each child line rises out of its own invisible window (headings).
 *           Lines are the element's children; a plain string is wrapped for
 *           you. Text is never split, so Khmer clusters stay intact.
 * - image   the first child opens from inset(10% 8%) while its img/video
 *           settles from 1.12×; later children (captions) fade.
 */
export type RevealVariant = 'rise' | 'fade' | 'unveil' | 'scale' | 'draw' | 'mask' | 'image';

/**
 * Wrap anything that should enter with the ceremonial motion language.
 * `i` orders siblings on a choreographed (non-uniform) curve: offsets are
 * 0, 1, 1.82, 2.49 … stagger steps. `at` sets the offset directly, in the same
 * units (e.g. 0.4 or 2.5), for hand-tuned rhythm. `delay` (ms) and `timed`
 * force the time-based path.
 */
export function Reveal({
  as = 'div',
  variant = 'rise',
  i = 0,
  at,
  delay,
  timed,
  className,
  style,
  children,
  ...rest
}: {
  as?: ElementType;
  variant?: RevealVariant;
  i?: number;
  at?: number;
  delay?: number;
  timed?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [k: string]: unknown;
}) {
  const ref = useReveal<HTMLElement>(Boolean(timed || delay));
  const content = variant === 'mask' && (typeof children === 'string' || typeof children === 'number') ? <span>{children}</span> : children;
  return createElement(
    as,
    {
      ref,
      'data-reveal': variant,
      className,
      style: {
        ['--i' as string]: i,
        ['--o' as string]: Number((at ?? choreo(i)).toFixed(3)),
        ...(delay ? { ['--delay' as string]: `${delay}ms` } : null),
        ...style,
      },
      ...rest,
    },
    content,
  );
}
