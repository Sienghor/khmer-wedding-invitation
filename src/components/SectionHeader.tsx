import { Pediment } from '../ornaments/Pediment';
import { OrnamentDivider } from '../ornaments/OrnamentDivider';
import type { Tone } from '../ornaments/Ornament';
import { Reveal } from '../motion/Reveal';
import { useEnglish } from '../lib/lang';
import s from './SectionHeader.module.css';

/**
 * Section opening. Main sections (crown="pediment") are crowned like a Banteay
 * Srei doorway with a superposed fronton (KH-PED-01); the others take a lighter
 * lotus-and-kbach divider, so the fronton stays special instead of repeating.
 */
export function SectionHeader({
  km,
  en,
  tone = 'gold',
  crown = 'divider',
  id,
}: {
  km: string;
  en: string;
  tone?: Tone;
  crown?: 'pediment' | 'divider';
  id: string;
}) {
  const EN = useEnglish();
  return (
    <header className={s.header} data-tone={tone} data-crown={crown}>
      {crown === 'pediment' ? (
        <Reveal variant="draw" className={s.crown}>
          <Pediment width="100%" tiers={2} tone={tone} draw />
        </Reveal>
      ) : (
        <Reveal variant="draw" className={s.divider}>
          <OrnamentDivider tone={tone} width={200} />
        </Reveal>
      )}
      <Reveal as="h2" i={1} id={id} className={s.title}>
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
