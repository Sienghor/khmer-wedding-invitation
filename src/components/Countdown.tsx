import { useEffect, useState } from 'react';
import { eventStart } from '../lib/date';
import { Glass } from '../glass/Glass';
import s from './Countdown.module.css';
import { useEnglish } from '../lib/lang';

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

/** Isolated so its once-a-second update never re-renders the surrounding section. */
export function Countdown() {
  const EN = useEnglish();
  const target = eventStart().getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let id = 0;
    const tick = () => {
      setNow(Date.now());
      id = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    id = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => clearTimeout(id);
  }, []);
  const left = target - now;
  const p = parts(left);
  if (left <= 0) {
    return (
      <Glass className={s.panel}>
        <p className={s.done}>
          <span lang="km">ពិធីមង្គលការបានចាប់ផ្ដើមហើយ</span>
          {EN && <span lang="en">The celebration has begun</span>}
        </p>
      </Glass>
    );
  }
  return (
    <Glass className={s.panel} role="timer" aria-label={`${p.d} days, ${p.h} hours and ${p.m} minutes until the wedding`}>
      {UNITS.map((u, i) => (
        <div key={u.key} className={s.unit}>
          {i > 0 && <span className={s.rule} aria-hidden="true" />}
          <span className={s.value} key={p[u.key]} aria-hidden="true">
            {String(p[u.key]).padStart(2, '0')}
          </span>
          <span className={s.label} aria-hidden="true">
            <span lang="km">{u.km}</span>
            {EN && <span lang="en">{u.en}</span>}
          </span>
        </div>
      ))}
    </Glass>
  );
}
