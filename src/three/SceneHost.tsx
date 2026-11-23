import { useEffect, useRef } from 'react';
import { DoorwayScene } from './doorwayScene';
import { TempleScene } from './templeScene';
import { readPalette, type SceneHandle } from './build';

export type SceneKind = 'lintel' | 'temple';

/**
 * Lazily-loaded host for the in-page 3D scenes (hero lintel, closing temple).
 * Renders only while on screen, feeds scroll progress to the scene, pauses in
 * background tabs, and frees GPU memory on unmount.
 */
export default function SceneHost({
  kind,
  frameRef,
  className,
  onReady,
  onError,
}: {
  kind: SceneKind;
  frameRef: React.RefObject<HTMLElement | null>;
  className?: string;
  onReady?: () => void;
  onError?: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let scene: SceneHandle;
    try {
      scene =
        kind === 'temple'
          ? new TempleScene(canvas.current!)
          : new DoorwayScene({
              canvas: canvas.current!,
              palette: readPalette(),
              reducedMotion: false,
              variant: 'lintel',
              getFrameRect: () => frameRef.current!.getBoundingClientRect(),
            });
    } catch (e) {
      console.warn(`3D ${kind} unavailable, using the SVG rendering.`, e);
      onError?.();
      return;
    }
    let visible = false;
    let raf = 0;
    const progress = () => {
      const el = frameRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = (innerHeight - r.top) / (innerHeight + r.height);
      scene.setProgress?.(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(progress);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !document.hidden) scene.start();
      else scene.stop();
    });
    io.observe(canvas.current!);
    const onVis = () => (document.hidden || !visible ? scene.stop() : scene.start());
    document.addEventListener('visibilitychange', onVis);
    addEventListener('scroll', onScroll, { passive: true });
    progress();
    // Let the first frame render before revealing the canvas over its SVG stand-in.
    requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      scene.dispose();
    };
  }, [kind, frameRef, onReady, onError]);

  return <canvas ref={canvas} className={className} aria-hidden="true" data-scene={kind} />;
}
