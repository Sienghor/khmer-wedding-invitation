import { useContext } from 'react';
import { wedding } from '../config/wedding';
import { PhotoFrame } from '../gallery/PhotoFrame';
import { Lintel } from '../ornaments/Lintel';
import { SRALAO_ASPECT } from '../ornaments/geometry/lintel';
import { LazyScene } from '../three/LazyScene';
import { LotusPetalBand } from '../ornaments/LotusPetalBand';
import { RomdoulFlower } from '../ornaments/RomdoulFlower';
import { Pediment } from '../ornaments/Pediment';
import { VineBand } from '../ornaments/VineBand';
import { Reveal } from '../motion/Reveal';
import { Tilt3D } from '../motion/Tilt3D';
import { formatEventDate } from '../lib/date';
import { Txt } from '../lib/text';
import { EntranceContext } from '../three/openedContext';
import s from './Hero.module.css';

/**
 * Threshold: the first view after passing through the doorway. The lintel
 * (KH-LIN-01) now hangs above the couple's portrait, so the journey continues
 * from the opening scene (rendered in 3D where supported). Lintel and portrait drift at different depths.
 * The names animate on mount (not on intersection): they are in the first view.
 *
 * Nothing plays behind the gate: the portal remounts when the guest passes
 * through, so its reveals start as the wash clears. When the browser supports
 * view transitions, the names are carried from the doorway into place (see
 * App.tsx) and a raking light crosses them once they land.
 */
export function Hero() {
  const { couple, event } = wedding;
  const date = formatEventDate();
  const entrance = useContext(EntranceContext);
  return (
    <section className={s.hero} aria-label="The couple" data-entrance={entrance}>
      <div className={s.portal} key={entrance === 'gated' ? 'gated' : 'open'}>
      <div className={`${s.lintel} parallax`} style={{ ['--depth' as string]: '-40px' }}>
        {/* Banteay Srei portal: superposed fronton (KH-PED-01) above the lintel. */}
        <Reveal variant="draw" delay={50} className={s.pediment}>
          <Pediment width="100%" tiers={2} stone draw />
        </Reveal>
        <Reveal variant="draw" delay={150}>
          {/* The same lintel the guest walked under, now in 3D; it turns toward the pointer or with scroll. */}
          <LazyScene kind="lintel" bleed="12%" style={{ aspectRatio: String(SRALAO_ASPECT) }} fallback={<Lintel relief draw />} />
        </Reveal>
      </div>
      <div className={s.doorway}>
        {/* Pilasters of foliated scrolls (KH-VIN-01) flank the doorway, as at Banteay Srei. */}
        <Reveal variant="fade" delay={500} className={s.pilaster} aria-hidden="true">
          <VineBand orientation="vertical" size={22} />
        </Reveal>
        <Reveal variant="unveil" className={`${s.photo} parallax`} style={{ ['--depth' as string]: '24px' }} delay={350}>
          <Tilt3D max={6}>
            <PhotoFrame id="hero" priority sizes="(min-width: 900px) 420px, 78vw" />
          </Tilt3D>
        </Reveal>
        <Reveal variant="fade" delay={500} className={s.pilaster} aria-hidden="true">
          <VineBand orientation="vertical" size={22} />
        </Reveal>
      </div>
      </div>
      <div className={s.names}>
        <p className={`${s.en} ${s.line}`}>
          <span className={s.groomEn}>
            <Txt>{couple.groom.name.en}</Txt>
          </span>
          <span className={s.amp} aria-hidden="true">
            &amp;
          </span>
          <span className="visually-hidden"> and </span>
          <span className={s.brideEn}>
            <Txt>{couple.bride.name.en}</Txt>
          </span>
        </p>
        <p lang="km" className={`km-display ${s.km} ${s.line}`}>
          <span className={s.groomKm}>
            <Txt>{couple.groom.name.km}</Txt>
          </span>{' '}
          <RomdoulFlower size={18} className={s.inlineRosette} />{' '}
          <span className={s.brideKm}>
            <Txt>{couple.bride.name.km}</Txt>
          </span>
        </p>
        <p className={`${s.date} ${s.line}`} data-placeholder={event.dateIsPlaceholder || undefined}>
          {date.short}
        </p>
      </div>
      <a href="#invitation" className={s.cue}>
        <span lang="km">រំកិលចុះក្រោម</span>
        <span className={s.cueLine} aria-hidden="true" />
        <span className="visually-hidden">Scroll to the invitation</span>
      </a>
      <LotusPetalBand height={16} className={s.band} />
    </section>
  );
}
