import { useMemo, useState } from 'react';
import { wedding } from '../config/wedding';
import { photos } from '../config/photos';

/** Development-only reminder of how many placeholders remain. Never rendered in production builds. */
export function DevBanner() {
  const [hidden, setHidden] = useState(false);
  const counts = useMemo(() => {
    // With English off (display.english), placeholders in `en` fields are never shown, so they don't count.
    const json = JSON.stringify(wedding, (k, v) => (k === 'en' && !wedding.display.english ? undefined : v));
    const text = json.match(/\[[^\]"]+\]/g)?.length ?? 0;
    const pics = photos.filter((p) => !p.src).length;
    return { text, pics, date: wedding.event.dateIsPlaceholder || wedding.event.timeIsPlaceholder };
  }, []);
  if (hidden || (!counts.text && !counts.pics && !counts.date)) return null;
  return (
    <div
      role="note"
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        maxWidth: 'calc(100vw - 84px)',
        zIndex: 90,
        font: '12px/1.4 ui-monospace, monospace',
        background: 'rgb(36 32 28 / .88)',
        color: '#f6f0e5',
        padding: '6px 10px',
        borderRadius: 8,
      }}
    >
      DEV · {counts.text} text placeholders · {counts.pics} photos pending{counts.date ? ' · date/time is placeholder' : ''} ·{' '}
      <a href="?heritage" style={{ color: '#d5b77a' }}>
        heritage
      </a>{' '}
      <button onClick={() => setHidden(true)} style={{ background: 'none', border: 0, color: '#d5b77a', cursor: 'pointer' }} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
