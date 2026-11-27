import { useCallback, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { galleryIds, getPhoto } from '../config/photos';
import { Reveal } from '../motion/Reveal';
import { prefersReducedMotion } from '../motion/useReducedMotion';
import { PhotoFrame } from './PhotoFrame';
import { Lightbox, LIGHTBOX_PHOTO } from './Lightbox';
import s from './Gallery.module.css';

type VTDoc = Document & { startViewTransition?: (cb: () => unknown) => { ready: Promise<void>; finished: Promise<void> } };

/** Wait (briefly) for the lightbox photo to decode, so the morph lands on a sharp image. */
function photoReady(timeout = 350) {
  const img = document.querySelector<HTMLImageElement>('dialog[open] img');
  if (!img) return Promise.resolve();
  const decoded = img.complete ? Promise.resolve() : img.decode().catch(() => undefined);
  return Promise.race([decoded, new Promise((r) => setTimeout(r, timeout))]);
}

function onScreen(el: Element) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight && r.width > 0;
}

/**
 * Editorial masonry gallery (CSS columns). Photos keep their own aspect
 * ratio and stack without gaps, so any mix of shapes composes cleanly.
 * Each tile opens from an inset window as it scrolls in; tapping one grows
 * that photograph into the viewer (shared-element View Transition) and
 * closing shrinks it back into its tile. Without the API it simply opens.
 */
export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const photos = galleryIds.map(getPhoto);
  const tiles = useRef<(HTMLElement | null)[]>([]);
  const openRef = useRef(open);
  openRef.current = open;

  const figure = (i: number | null) => (i === null ? null : (tiles.current[i]?.querySelector('figure') ?? null));
  const canMorph = () => !!(document as VTDoc).startViewTransition && !prefersReducedMotion();

  const show = useCallback((i: number) => {
    const fig = figure(i);
    if (!canMorph() || !fig) return setOpen(i);
    fig.style.viewTransitionName = LIGHTBOX_PHOTO;
    const t = (document as VTDoc).startViewTransition!(async () => {
      fig.style.viewTransitionName = '';
      flushSync(() => setOpen(i));
      await photoReady();
    });
    // A newer transition (e.g. an arrow key mid-morph) skips this one: its `ready` rejects, which is expected.
    t.ready.catch(() => undefined);
    t.finished.catch(() => undefined).finally(() => (fig.style.viewTransitionName = ''));
  }, []);

  const close = useCallback(() => {
    const fig = figure(openRef.current);
    if (!canMorph()) return setOpen(null);
    const morph = fig && onScreen(fig) ? fig : null;
    const t = (document as VTDoc).startViewTransition!(() => {
      flushSync(() => setOpen(null));
      if (morph) morph.style.viewTransitionName = LIGHTBOX_PHOTO;
    });
    t.ready.catch(() => undefined);
    t.finished.catch(() => undefined).finally(() => morph && (morph.style.viewTransitionName = ''));
  }, []);

  return (
    <>
      <ul className={s.grid} aria-label="Pre-wedding gallery">
        {photos.map((p, i) => (
          <li key={p.id} className={s.item}>
            <button type="button" className={s.tile} onClick={() => show(i)} ref={(el) => void (tiles.current[i] = el)}>
              <span className="visually-hidden">
                Open photo {i + 1} of {photos.length}
              </span>
              {/* Columns sit side by side: offset them slightly so a row never lands in lockstep. */}
              <Reveal as="span" variant="image" at={[0, 0.9, 0.45][i % 3]} className={s.reveal}>
                <PhotoFrame photo={p} className={s.photo} sizes="(min-width: 900px) 33vw, 50vw" />
              </Reveal>
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}
