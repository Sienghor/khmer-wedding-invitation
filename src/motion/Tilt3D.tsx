import { useCallback, useRef, type CSSProperties, type ReactNode } from 'react';
import s from './Tilt3D.module.css';

/**
 * Real CSS 3D depth for photographs and cards.
 *  - Mouse/pen: the surface turns toward the pointer (±max°) with a moving
 *    specular sheen; it settles back with the ceremonial ease on leave.
 *  - Touch: a gentle scroll-linked rotateX as the element crosses the screen
 *    (CSS scroll-driven animation; no JavaScript, static where unsupported).
 *  - Reduced motion: flat.
 * Children can opt into depth layers with the `.z1`/`.z2` helper classes.
 */
export function Tilt3D({ children, max = 7, className, style }: { children: ReactNode; max?: number; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const move = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const el = ref.current;
      if (!el) return;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', `${(x - 0.5) * 2 * max}deg`);
        el.style.setProperty('--rx', `${(0.5 - y) * 2 * max}deg`);
        el.style.setProperty('--sx', `${x * 100}%`);
        el.style.setProperty('--sy', `${y * 100}%`);
        el.dataset.active = '';
      });
    },
    [max],
  );
  const leave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    delete el.dataset.active;
  }, []);
  return (
    <div ref={ref} className={`${s.tilt} ${className ?? ''}`} style={style} onPointerMove={move} onPointerLeave={leave}>
      <div className={s.inner}>
        {children}
        <span className={s.sheen} aria-hidden="true" />
      </div>
    </div>
  );
}
