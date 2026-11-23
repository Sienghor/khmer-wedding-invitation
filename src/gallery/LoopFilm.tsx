import { useEffect, useRef, useState } from 'react';
import { mediaVideos } from '../config/media.generated';
import { prefersReducedMotion } from '../motion/useReducedMotion';
import s from './LoopFilm.module.css';

/**
 * Silent looping clip. Loads nothing until near the viewport; plays only while
 * visible; pauses off-screen. Under reduced motion it shows the poster with a
 * play button, so motion starts only on request.
 */
export function LoopFilm({ media, label }: { media: string; label: string }) {
  const v = mediaVideos[media];
  const ref = useRef<HTMLVideoElement>(null);
  const [manual] = useState(prefersReducedMotion);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || manual) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.preload = 'auto';
          el.play().catch(() => undefined);
        } else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [manual]);

  if (!v) return null;
  return (
    <div className={s.film} style={{ aspectRatio: String(v.aspect) }}>
      <video
        ref={ref}
        className={s.video}
        src={v.src}
        poster={v.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {manual && !playing && (
        <button type="button" className={s.play} onClick={() => ref.current?.play()} aria-label={`Play: ${label}`}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}
