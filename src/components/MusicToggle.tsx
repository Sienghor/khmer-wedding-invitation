import { useEffect, useRef, useState } from 'react';
import { Glass } from '../glass/Glass';
import { music, useMusicPlaying } from '../lib/music';
import { wedding } from '../config/wedding';
import s from './MusicToggle.module.css';

/**
 * Floating music button (top right). While playing it shows moving bars; the
 * song title slides out beside it for a few seconds each time playback starts.
 */
export function MusicToggle() {
  const playing = useMusicPlaying();
  const [showTitle, setShowTitle] = useState(false);
  const timer = useRef(0);

  // Guests who skipped the opening: start with their first tap anywhere.
  useEffect(() => music.armFirstInteraction(), []);

  useEffect(() => {
    if (!playing) return;
    setShowTitle(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShowTitle(false), 4500);
    return () => clearTimeout(timer.current);
  }, [playing]);

  if (!music.available()) return null;
  const { title, artist } = wedding.music;
  return (
    <div className={s.wrap} data-title={showTitle && playing ? 'shown' : undefined}>
      <p className={s.title} aria-hidden="true">
        <span lang="km">{title}</span>
        <span lang="km" className={s.artist}>
          {artist}
        </span>
      </p>
      <Glass
        as="button"
        type="button"
        tone="dark"
        className={s.btn}
        onClick={() => music.toggle()}
        aria-pressed={playing}
        aria-label={playing ? `Pause music: ${title}, ${artist}` : `Play music: ${title}, ${artist}`}
        data-music-toggle
        data-playing={playing || undefined}
      >
        <svg viewBox="0 0 24 24" className={s.icon} aria-hidden="true">
          {[5, 9.5, 14, 18.5].map((x, i) => (
            <rect key={x} x={x - 1.1} y={6} width={2.2} height={12} rx={1.1} className={s.bar} style={{ animationDelay: `${-i * 0.27}s` }} />
          ))}
          <path d="M3.5 20.5 20.5 3.5" className={s.slash} />
        </svg>
      </Glass>
    </div>
  );
}
