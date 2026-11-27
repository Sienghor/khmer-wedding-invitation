import { useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { Photo } from '../config/photos';
import { Glass } from '../glass/Glass';
import { PhotoFrame } from './PhotoFrame';
import s from './Lightbox.module.css';

/** Shared view-transition-name: the gallery tile hands it to the viewer's photo. */
export const LIGHTBOX_PHOTO = 'lightbox-photo';

/**
 * Accessible lightbox on the native <dialog> element: focus trapping, Esc and
 * inert background come from the platform. Arrow keys and horizontal swipes
 * change photo; the change uses a View Transition crossfade where supported.
 * The dialog opens in a layout effect so that, when the gallery wraps the
 * mount in startViewTransition + flushSync, it is already in the top layer
 * when the new state is captured (the tile → viewer morph).
 */
export function Lightbox({ photos, index, onIndex, onClose }: { photos: Photo[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const d = ref.current!;
    d.showModal();
    document.body.classList.add('is-locked');
    return () => {
      document.body.classList.remove('is-locked');
      if (d.open) d.close();
    };
  }, []);

  const go = (delta: number) => {
    const next = (index + delta + photos.length) % photos.length;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
    if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Fast arrow presses skip the previous transition; its rejected promises are expected.
      const t = doc.startViewTransition(() => flushSync(() => onIndex(next)));
      t.ready.catch(() => undefined);
      t.finished.catch(() => undefined);
    } else onIndex(next);
  };

  const photo = photos[index];
  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-label="Photo viewer"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
    >
      <div
        className={s.stage}
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const st = start.current;
          start.current = null;
          if (!st) return;
          const dx = e.clientX - st.x;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - st.y)) go(dx < 0 ? 1 : -1);
        }}
      >
        <div className={s.photo} style={{ viewTransitionName: LIGHTBOX_PHOTO }}>
          <PhotoFrame photo={photo} priority instant sizes="100vw" />
        </div>
      </div>
      <Glass className={s.controls} tone="dark">
        <button type="button" onClick={() => go(-1)} aria-label="Previous photo">
          ‹
        </button>
        <span aria-live="polite" className={s.count}>
          {index + 1} / {photos.length}
        </span>
        <button type="button" onClick={() => go(1)} aria-label="Next photo">
          ›
        </button>
        <span className={s.div} aria-hidden="true" />
        <button type="button" onClick={onClose} aria-label="Close photo viewer" autoFocus>
          ✕
        </button>
      </Glass>
    </dialog>
  );
}
