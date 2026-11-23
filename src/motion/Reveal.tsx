import { createElement, useCallback, type CSSProperties, type ElementType, type ReactNode } from 'react';

/**
 * One shared IntersectionObserver for the whole page: cheaper than one per
 * element and never touches scroll events. Elements reveal once.
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
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );
  return io;
}

export function useReveal<T extends HTMLElement>() {
  return useCallback((el: T | null) => {
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.dataset.inview = 'true';
      return;
    }
    observer().observe(el);
  }, []);
}

export type RevealVariant = 'rise' | 'fade' | 'unveil' | 'scale' | 'draw';

/**
 * Wrap anything that should enter with the ceremonial motion language.
 * `i` staggers siblings by the --stagger token.
 */
export function Reveal({
  as = 'div',
  variant = 'rise',
  i = 0,
  delay,
  className,
  style,
  children,
  ...rest
}: {
  as?: ElementType;
  variant?: RevealVariant;
  i?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [k: string]: unknown;
}) {
  const ref = useReveal<HTMLElement>();
  return createElement(
    as,
    {
      ref,
      'data-reveal': variant,
      className,
      style: { ['--i' as string]: i, ...(delay ? { ['--delay' as string]: `${delay}ms` } : null), ...style },
      ...rest,
    },
    children,
  );
}
