import { wedding, type Bi } from '../config/wedding';
import { EVENT_OFFSET } from './now';

const HOUR = 3_600_000;
/** How long the last rite of a day is treated as "now", unless the event's own end falls on that day. */
const LAST_RITE_MS = 2 * HOUR;
const eventEnd = Date.parse(wedding.event.end);

/** The last rite runs to the event's end (e.g. the reception until 21:00) when that end is later the same day. */
const lastRiteEnd = (start: number, base: number) =>
  !Number.isNaN(eventEnd) && eventEnd > start && eventEnd < base + 24 * HOUR ? eventEnd : start + LAST_RITE_MS;

/** "4:00 PM", "16:00", "9 AM" → minutes after midnight; null if no clock time can be read. */
export function parseClock(text: string): number | null {
  const m = /(\d{1,2})(?:[:.](\d{2}))?\s*([AaPp])\.?\s*[Mm]?\.?/.exec(text) ?? /(\d{1,2})[:.](\d{2})/.exec(text);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const ap = m[3]?.toLowerCase();
  if (ap) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (ap === 'p' ? 12 : 0);
  }
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export interface Rite {
  /** Index of the day in wedding.schedule, and of the item within the day. */
  day: number;
  item: number;
  title: Bi;
  /** Start and end in ms (end: next rite of the same day; the last runs to event.end on the event's day, else 2 h). */
  start: number;
  end: number;
}

const dayStart = (date: string) => Date.parse(`${date}T00:00:00${EVENT_OFFSET}`);

/** Every rite whose start time can be read, in order. Unreadable times never become "now". */
export const rites: Rite[] = wedding.schedule.flatMap((d, day) => {
  const base = dayStart(d.date);
  if (Number.isNaN(base)) return [];
  const timed = d.items
    .map((it, item) => ({ item, title: it.title, mins: parseClock(it.time.en) }))
    .filter((r): r is { item: number; title: Bi; mins: number } => r.mins !== null);
  return timed.map((r, i) => {
    const start = base + r.mins * 60_000;
    const next = timed[i + 1];
    return { day, item: r.item, title: r.title, start, end: next ? base + next.mins * 60_000 : lastRiteEnd(start, base) };
  });
});

const days = wedding.schedule.map((d) => dayStart(d.date)).filter((t) => !Number.isNaN(t));
const firstDay = Math.min(...days);
const afterLastDay = Math.max(...days) + 24 * HOUR;

/** True from midnight of the first wedding day to midnight after the last (Phnom Penh time). */
export const onWeddingDays = (t: number) => days.length > 0 && t >= firstDay && t < afterLastDay;

export type RiteState = 'past' | 'now' | 'upcoming';

/** State of schedule item [day][item] at time t, or null when nothing should change (not a wedding day, or no readable time). */
export function riteState(t: number, day: number, item: number): RiteState | null {
  if (!onWeddingDays(t)) return null;
  const r = rites.find((x) => x.day === day && x.item === item);
  if (!r) return null;
  return t >= r.end ? 'past' : t >= r.start ? 'now' : 'upcoming';
}

/** The next rite still to start, or null after the last one. */
export const nextRite = (t: number): Rite | null => rites.find((r) => r.start > t) ?? null;
