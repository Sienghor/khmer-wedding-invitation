import { useEffect, useState } from 'react';
import { wedding } from '../config/wedding';

/** The wedding's UTC offset, read from the configured start (Cambodia: +07:00, no daylight saving). */
export const EVENT_OFFSET = /[+-]\d\d:\d\d$/.exec(wedding.event.start)?.[0] ?? '+07:00';

/**
 * QA override: `?now=2027-01-08T10:40` pretends the page was opened at that
 * moment in Phnom Penh time (an explicit `Z` or `+hh:mm` is honoured as written).
 * The clock then runs on from there, so countdowns keep ticking.
 */
function readOverride(): number | null {
  if (typeof location === 'undefined') return null;
  const raw = new URLSearchParams(location.search).get('now');
  if (!raw) return null;
  let iso = raw.trim().replace(' ', 'T');
  if (!iso.includes('T')) iso += 'T00:00';
  if (!/([zZ]|[+-]\d\d:?\d\d)$/.test(iso)) iso += EVENT_OFFSET;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

const override = readOverride();
const loadedAt = Date.now();

/** Current time in ms: the real clock, or the `?now=` override advancing in real time. */
export const now = (): number => (override === null ? Date.now() : override + (Date.now() - loadedAt));

/** `now()` that re-renders at most once a minute, on the minute. */
export function useMinute(): number {
  const [t, setT] = useState(now);
  useEffect(() => {
    let id = 0;
    const tick = () => {
      setT(now());
      id = window.setTimeout(tick, 60_000 - (now() % 60_000) + 50);
    };
    id = window.setTimeout(tick, 60_000 - (now() % 60_000) + 50);
    return () => clearTimeout(id);
  }, []);
  return t;
}
