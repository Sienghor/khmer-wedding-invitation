import { useState, type CSSProperties } from 'react';
import { ASPECT, getPhoto, type Photo } from '../config/photos';
import { LotusRosette } from '../ornaments/LotusRosette';
import s from './PhotoFrame.module.css';

/**
 * A photo slot with a fixed aspect ratio, so there is zero layout shift
 * before, during or after loading.
 *  - src null      → elegant skeleton (shimmer + rosette mark + caption)
 *  - src loading   → skeleton beneath, image fades in on decode
 *  - src error     → falls back to the skeleton, never a broken-image icon
 *  - instant       → no fade/settle on load (the lightbox, where a View
 *                    Transition already carries the photo in)
 */
export function PhotoFrame({
  id,
  photo: given,
  className,
  style,
  sizes,
  priority = false,
  rounded = true,
  instant = false,
}: {
  id?: string;
  photo?: Photo;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
  instant?: boolean;
}) {
  const photo = given ?? getPhoto(id!);
  const [state, setState] = useState<'idle' | 'loaded' | 'error'>('idle');
  const showImg = photo.src && state !== 'error';
  return (
    <figure
      className={`${s.frame} ${rounded ? s.rounded : ''} ${className ?? ''}`}
      style={{ aspectRatio: String(photo.aspect ?? ASPECT[photo.shape]), ...style }}
      data-state={photo.src ? state : 'empty'}
      data-photo-id={photo.id}
      data-instant={instant || undefined}
    >
      {photo.lqip && <div className={s.lqip} style={{ backgroundImage: `url("${photo.lqip}")` }} aria-hidden="true" />}
      <div className={s.skeleton} aria-hidden="true" data-hidden={photo.lqip ? true : undefined}>
        <LotusRosette size={34} tone="gold" className={s.mark} />
        {!photo.src && <span className={s.label}>Photo coming soon</span>}
      </div>
      {showImg && (
        <img
          className={s.img}
          src={photo.src!}
          srcSet={photo.srcSet}
          sizes={sizes ?? photo.sizes}
          alt={photo.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          style={{ objectPosition: photo.focal ?? '50% 40%' }}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
        />
      )}
      {!photo.src && <span className="visually-hidden">{photo.alt}: photograph not yet available</span>}
    </figure>
  );
}
