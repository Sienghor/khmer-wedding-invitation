import { lazy, Suspense, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { OpenedContext } from './openedContext';
import { shouldUse3D } from './capability';
import type { SceneKind } from './SceneHost';
import s from './LazyScene.module.css';

const SceneHost = lazy(() => import('./SceneHost'));

/**
 * Progressive 3D: the SVG rendering (`fallback`) shows immediately and is the
 * permanent rendering on devices that should not run WebGL. When the box nears
 * the viewport on a capable device, the 3D scene loads and crossfades in over it.
 * No three.js code is in the main bundle.
 */
export function LazyScene({ kind, fallback, className, style, bleed = '0px' }: { kind: SceneKind; fallback: ReactNode; className?: string; style?: CSSProperties; bleed?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [enabled] = useState(shouldUse3D);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const opened = useContext(OpenedContext);

  useEffect(() => {
    if (!enabled || !frame.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: '600px 0px' });
    io.observe(frame.current);
    return () => io.disconnect();
  }, [enabled]);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const live = enabled && opened && near && !failed;

  return (
    <div ref={frame} className={`${s.box} ${className ?? ''}`} style={{ ...style, ['--bleed' as string]: bleed }} data-ready={(live && ready) || undefined}>
      <div className={s.fallback}>{fallback}</div>
      {live && (
        <Suspense fallback={null}>
          <SceneHost kind={kind} frameRef={frame} className={s.canvas} onReady={onReady} onError={onError} />
        </Suspense>
      )}
    </div>
  );
}
