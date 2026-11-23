import { createElement, useCallback, useRef, type CSSProperties, type ElementType, type ReactNode, type Ref } from 'react';
import s from './Glass.module.css';

/**
 * Liquid glass surface. Used selectively: navigation, countdown, blessings,
 * gallery controls and the opening call-to-action. Heritage ornament and
 * typography stay dominant; glass only holds interactive content.
 *
 * The specular highlight follows the pointer through CSS variables written
 * directly to the element (no React re-render per move).
 */
export function Glass({
  as = 'div',
  tone = 'dark',
  className,
  style,
  children,
  interactive = true,
  ref: outerRef,
  ...rest
}: {
  as?: ElementType;
  /** 'dark' sits on accent/charcoal grounds; 'light' sits on ivory. */
  tone?: 'dark' | 'light';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  interactive?: boolean;
  ref?: Ref<HTMLElement | null>;
  [k: string]: unknown;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const raf = useRef(0);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === 'touch') return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  }, []);
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      ref.current = el;
      if (typeof outerRef === 'function') outerRef(el);
      else if (outerRef) (outerRef as { current: HTMLElement | null }).current = el;
    },
    [outerRef],
  );
  return createElement(
    as,
    {
      ref: setRef,
      className: `${s.glass} ${className ?? ''}`,
      'data-tone': tone,
      style,
      onPointerMove: interactive ? onPointerMove : undefined,
      ...rest,
    },
    children,
  );
}
