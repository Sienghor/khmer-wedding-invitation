import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { resolveTheme } from '../config/theme';
import { DoorwayScene } from './doorwayScene';

export interface DoorwayHandle {
  open: () => Promise<void>;
}

/**
 * React shell for the imperative Three.js scene. Loaded lazily, so three.js
 * stays out of the main bundle, and disposed when the opening unmounts.
 */
export default function Doorway3D({
  frameRef,
  handle,
  onReady,
  onError,
  className,
}: {
  frameRef: React.RefObject<HTMLElement | null>;
  handle: Ref<DoorwayHandle>;
  onReady: () => void;
  onError: () => void;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<DoorwayScene | null>(null);

  useImperativeHandle(handle, () => ({ open: () => scene.current?.open() ?? Promise.resolve() }), []);

  useEffect(() => {
    let s: DoorwayScene;
    try {
      const css = getComputedStyle(document.documentElement);
      const read = (v: string, fallback: string) => css.getPropertyValue(v).trim() || fallback;
      const theme = resolveTheme();
      s = new DoorwayScene({
        canvas: canvas.current!,
        palette: {
          gold: read('--c-gold', theme.palette.gold),
          champagne: read('--c-champagne', theme.palette.champagne),
          sandstone: read('--c-sandstone', theme.palette.sandstone),
          charcoal: read('--c-charcoal', theme.palette.charcoal),
        },
        reducedMotion: false,
        getFrameRect: () => frameRef.current!.getBoundingClientRect(),
      });
    } catch (e) {
      console.warn('3D doorway unavailable, using SVG doorway.', e);
      onError();
      return;
    }
    scene.current = s;
    s.start();
    onReady();
    const onVis = () => (document.hidden ? s.stop() : s.start());
    document.addEventListener('visibilitychange', onVis);
    const lost = (e: Event) => {
      e.preventDefault();
      onError();
    };
    canvas.current!.addEventListener('webglcontextlost', lost);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      s.dispose();
      scene.current = null;
    };
  }, [frameRef, onReady, onError]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
