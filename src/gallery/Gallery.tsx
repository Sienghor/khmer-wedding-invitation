import { useCallback, useState } from 'react';
import { galleryIds, getPhoto } from '../config/photos';
import { Reveal } from '../motion/Reveal';
import { Tilt3D } from '../motion/Tilt3D';
import { PhotoFrame } from './PhotoFrame';
import { Lightbox } from './Lightbox';
import s from './Gallery.module.css';

/**
 * Editorial masonry gallery (CSS columns). Photos keep their own aspect
 * ratio and stack without gaps, so any mix of shapes composes cleanly.
 */
export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const photos = galleryIds.map(getPhoto);
  const close = useCallback(() => setOpen(null), []);
  return (
    <>
      <ul className={s.grid} aria-label="Pre-wedding gallery">
        {photos.map((p, i) => (
          <Reveal as="li" key={p.id} variant="scale" i={i % 4} className={s.item}>
            <button type="button" className={s.tile} onClick={() => setOpen(i)}>
              <span className="visually-hidden">
                Open photo {i + 1} of {photos.length}
              </span>
              <Tilt3D max={5}>
                <PhotoFrame photo={p} className={s.photo} sizes="(min-width: 900px) 33vw, 50vw" />
              </Tilt3D>
            </button>
          </Reveal>
        ))}
      </ul>
      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}
