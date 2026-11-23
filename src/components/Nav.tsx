import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Glass } from '../glass/Glass';
import { EN } from '../lib/lang';
import s from './Nav.module.css';

const ITEMS = [
  { id: 'invitation', km: 'អញ្ជើញ', en: 'Invitation' },
  { id: 'details', km: 'ព័ត៌មាន', en: 'Details' },
  { id: 'story', km: 'រូបភាព', en: 'Photos' },
  { id: 'schedule', km: 'កម្មវិធី', en: 'Programme' },
  { id: 'blessings', km: 'ជូនពរ', en: 'Blessings' },
] as const;

/** Sections with dark grounds: the nav switches to dark glass over them. */
const DARK = new Set(['details', 'blessings', 'closing']);

/**
 * Floating liquid-glass navigation: bottom on phones (thumb reach), top on desktop.
 *
 * One highlight pill slides to the active tab. When a tab is tapped, the pill
 * goes straight to it and stays there while the page scrolls (instead of
 * flickering through every section passed on the way).
 */
export function Nav() {
  /** Section currently in view (from scrolling). */
  const [seen, setSeen] = useState<string>('invitation');
  /** Tab the guest tapped; holds the highlight until the scroll settles. */
  const [target, setTarget] = useState<string | null>(null);
  const active = target ?? seen;

  const list = useRef<HTMLElement | null>(null);
  const links = useRef(new Map<string, HTMLAnchorElement>());
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setSeen(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    [...ITEMS.map((i) => i.id), 'closing'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Release the tapped tab once scrolling stops (scrollend where supported, otherwise a quiet period).
  useEffect(() => {
    if (!target) return;
    let quiet = 0;
    const release = () => setTarget(null);
    const onScroll = () => {
      clearTimeout(quiet);
      quiet = window.setTimeout(release, 180);
    };
    const fallback = window.setTimeout(release, 4000);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', release);
    return () => {
      clearTimeout(quiet);
      clearTimeout(fallback);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', release);
    };
  }, [target]);

  // Move the pill under the active tab; hidden over sections without a tab (the closing).
  const measure = useCallback(() => {
    const a = links.current.get(active);
    if (!a || !list.current) return setPill(null);
    setPill({ x: a.offsetLeft, w: a.offsetWidth });
  }, [active]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (list.current) ro.observe(list.current);
    return () => ro.disconnect();
  }, [measure]);

  const ground = DARK.has(seen) ? 'dark' : 'light';
  return (
    <nav className={s.wrap} aria-label="Sections">
      <Glass as="ul" ref={list} className={s.nav} tone={ground} data-ground={ground}>
        <li
          aria-hidden="true"
          className={s.pill}
          data-shown={pill ? '' : undefined}
          style={pill ? { transform: `translateX(${pill.x}px)`, width: pill.w } : undefined}
        />
        {ITEMS.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              ref={(el) => {
                if (el) links.current.set(i.id, el);
                else links.current.delete(i.id);
              }}
              className={s.link}
              aria-current={active === i.id ? 'true' : undefined}
              onClick={() => setTarget(i.id)}
            >
              <span lang="km" className={s.km}>
                {i.km}
              </span>
              {EN && (
                <span lang="en" className={s.en}>
                  {i.en}
                </span>
              )}
            </a>
          </li>
        ))}
      </Glass>
    </nav>
  );
}
