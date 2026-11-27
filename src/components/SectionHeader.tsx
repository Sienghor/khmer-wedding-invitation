import { Pediment } from '../ornaments/Pediment';
import { OrnamentDivider } from '../ornaments/OrnamentDivider';
import type { Tone } from '../ornaments/Ornament';
import { Reveal } from '../motion/Reveal';
import { useEnglish } from '../lib/lang';
import s from './SectionHeader.module.css';

/**
 * How a header opens, so five sections don't open identically.
 *  - procession: the ornament draws first, the title follows it up.
 *  - together:   ornament and title arrive as one gesture.
 *  - answer:     the title rises first, the ornament draws above it after.
 */
export type HeaderRhythm = 'procession' | 'together' | 'answer';
const RHYTHMS: HeaderRhythm[] = ['together', 'answer', 'procession'];
/** Offsets in stagger steps: [ornament, title]. */
const OFFSETS: Record<HeaderRhythm, [number, number]> = {
  procession: [0, 1.6],
  together: [0, 0.3],
  answer: [1.4, 0],
};

/** Stable per-section pick, so the same section always opens the same way. */
function pick(id: string): HeaderRhythm {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return RHYTHMS[Math.abs(h) % RHYTHMS.length];
}

/**
 * Section opening. Main sections (crown="pediment") are crowned like a Banteay
 * Srei doorway with a superposed fronton (KH-PED-01); the others take a lighter
 * lotus-and-kbach divider, so the fronton stays special instead of repeating.
 * The ornament draws with the scroll; the title lines rise out of a mask.
 */
export function SectionHeader({
  km,
  en,
  tone = 'gold',
  crown = 'divider',
  rhythm,
  id,
}: {
  km: string;
  en: string;
  tone?: Tone;
  crown?: 'pediment' | 'divider';
  rhythm?: HeaderRhythm;
  id: string;
}) {
  const EN = useEnglish();
  const r = rhythm ?? (crown === 'pediment' ? 'procession' : pick(id));
  const [ornAt, titleAt] = OFFSETS[r];
  return (
    <header className={s.header} data-tone={tone} data-crown={crown} data-rhythm={r}>
      {crown === 'pediment' ? (
        <Reveal variant="draw" at={ornAt} className={s.crown}>
          <Pediment width="100%" tiers={2} tone={tone} draw />
        </Reveal>
      ) : (
        <Reveal variant="draw" at={ornAt} className={s.divider}>
          <OrnamentDivider tone={tone} width={200} />
        </Reveal>
      )}
      <Reveal as="h2" variant="mask" at={titleAt} id={id} className={s.title}>
        <span lang="km" className={`km-display ${s.km}`}>
          {km}
        </span>
        {EN && (
          <span lang="en" className={s.en}>
            {en}
          </span>
        )}
      </Reveal>
    </header>
  );
}
