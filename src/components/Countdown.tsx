import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { eventStart } from '../lib/date';
import { Glass } from '../glass/Glass';
import s from './Countdown.module.css';
import { useEnglish } from '../lib/lang';
import { now } from '../lib/now';
import { nextRite, onWeddingDays, rites } from '../lib/programme';
import { useReducedMotion } from '../motion/useReducedMotion';

const UNITS = [
  { key: 'd', km: 'ថ្ងៃ', en: 'Days' },
  { key: 'h', km: 'ម៉ោង', en: 'Hours' },
  { key: 'm', km: 'នាទី', en: 'Minutes' },
  { key: 's', km: 'វិនាទី', en: 'Seconds' },
] as const;

function parts(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}

/* The reel runs 9→0 twice; a digit sits on the first run. Counting down moves
   it forward along the reel; a wrap (0 → 9, 0 → 5 …) rolls on into the second
   run, then snaps back to the first without a transition. */
const REEL = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
const at = (pos: number) => `translate3d(0, ${(-pos * 100) / REEL.length}%, 0)`;

function Digit({ d, still }: { d: number; still: boolean }) {
  const reel = useRef<HTMLSpanElement>(null);
  const shown = useRef(d);
  useLayoutEffect(() => {
    const el = reel.current;
    if (!el) return;
    const from = shown.current;
    shown.current = d;
    const home = 9 - d;
    let pending = true;
    const snap = () => {
      if (!pending) return;
      pending = false;
      el.style.transition = 'none';
      el.style.transform = at(home);
      void el.offsetHeight;
      el.style.transition = '';
    };
    if (from === d || still) return snap();
    el.style.transform = at(d > from ? home + 10 : home);
    if (d <= from) return;
    const timer = window.setTimeout(snap, 900);
    el.addEventListener('transitionend', snap, { once: true });
    return () => {
      clearTimeout(timer);
      el.removeEventListener('transitionend', snap);
      snap(); // never leave a reel parked on its second run
    };
  }, [d, still]);
  return (
    <span className={s.digit}>
      <span ref={reel} className={s.reel} style={{ transform: at(9 - d) }}>
        {REEL.map((n, i) => (
          <span key={i}>{n}</span>
        ))}
      </span>
    </span>
  );
}

/** Two or more digits on rolling reels; keyed from the right so a reel keeps its place. */
function Value({ n, still }: { n: number; still: boolean }) {
  const digits = String(n).padStart(2, '0').split('');
  return (
    <span className={s.value} aria-hidden="true">
      {digits.map((c, i) => (
        <Digit key={digits.length - i} d={Number(c)} still={still} />
      ))}
    </span>
  );
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

/**
 * Isolated so its once-a-second update never re-renders the surrounding section.
 * On the wedding days it counts down to the next rite of the programme instead.
 * Honours the `?now=` QA override (lib/now.ts).
 */
export function Countdown() {
  const EN = useEnglish();
  const still = useReducedMotion();
  const target = eventStart().getTime();
  const [t, setT] = useState(now);
  useEffect(() => {
    let id = 0;
    const tick = () => {
      setT(now());
      id = window.setTimeout(tick, 1000 - (now() % 1000));
    };
    id = window.setTimeout(tick, 1000 - (now() % 1000));
    return () => clearTimeout(id);
  }, []);

  const live = onWeddingDays(t);
  const next = live ? nextRite(t) : null;
  // After the last rite of the programme (or, without readable times, after the event start).
  if (!next && (target <= t || (live && rites.length > 0))) {
    return (
      <Glass className={s.panel}>
        <p className={s.done}>
          <span lang="km">ពិធីមង្គលការបានចាប់ផ្ដើមហើយ</span>
          {EN && <span lang="en">The celebration has begun</span>}
        </p>
      </Glass>
    );
  }

  if (next) {
    const p = parts(next.start - t);
    const h = p.d * 24 + p.h;
    const units = [
      { key: 'h', km: UNITS[1].km, en: UNITS[1].en, v: h },
      { key: 'm', km: UNITS[2].km, en: UNITS[2].en, v: p.m },
      { key: 's', km: UNITS[3].km, en: UNITS[3].en, v: p.s },
    ];
    return (
      <Glass
        className={`${s.panel} ${s.next}`}
        role="timer"
        aria-label={`Next: ${next.title.en}, in ${h ? `${plural(h, 'hour')} and ` : ''}${plural(p.m, 'minute')}`}
      >
        <p className={s.nextHead} aria-hidden="true">
          <span className={s.nextLabel}>
            <span lang="km">បន្ទាប់</span>
            {EN && <span lang="en">Next</span>}
          </span>
          <span lang="km" className={s.nextKm}>
            {next.title.km}
          </span>
          {EN && (
            <span lang="en" className={s.nextEn}>
              {next.title.en}
            </span>
          )}
        </p>
        {units.map((u, i) => (
          <div key={u.key} className={s.unit}>
            {i > 0 && <span className={s.rule} aria-hidden="true" />}
            <Value n={u.v} still={still} />
            <span className={s.label} aria-hidden="true">
              <span lang="km">{u.km}</span>
              {EN && <span lang="en">{u.en}</span>}
            </span>
          </div>
        ))}
      </Glass>
    );
  }

  const p = parts(target - t);
  return (
    <Glass className={s.panel} role="timer" aria-label={`${p.d} days, ${p.h} hours and ${p.m} minutes until the wedding`}>
      {UNITS.map((u, i) => (
        <div key={u.key} className={s.unit}>
          {i > 0 && <span className={s.rule} aria-hidden="true" />}
          <Value n={p[u.key]} still={still} />
          <span className={s.label} aria-hidden="true">
            <span lang="km">{u.km}</span>
            {EN && <span lang="en">{u.en}</span>}
          </span>
        </div>
      ))}
    </Glass>
  );
}
