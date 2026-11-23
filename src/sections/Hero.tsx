import { wedding } from '../config/wedding';
import { PhotoFrame } from '../gallery/PhotoFrame';
import { Lintel } from '../ornaments/Lintel';
import { SRALAO_ASPECT } from '../ornaments/geometry/lintel';
import { LazyScene } from '../three/LazyScene';
import { LotusPetalBand } from '../ornaments/LotusPetalBand';
import { LotusRosette } from '../ornaments/LotusRosette';
import { Pediment } from '../ornaments/Pediment';
import { VineBand } from '../ornaments/VineBand';
import { Reveal } from '../motion/Reveal';
import { Tilt3D } from '../motion/Tilt3D';
import { formatEventDate } from '../lib/date';
import { Txt } from '../lib/text';
import s from './Hero.module.css';

/**
 * Threshold: the first view after passing through the doorway. The lintel
 * (KH-LIN-01) now hangs above the couple's portrait, so the journey continues
 * from the opening scene (rendered in 3D where supported). Lintel and portrait drift at different depths.
 * The names animate on mount (not on intersection): they are in the first view.
 */
export function Hero() {
  const { couple, event } = wedding;
  const date = formatEventDate();
  return (
    <section className={s.hero} aria-label="The couple">
      <div className={s.portal}>
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
        <p className={`${s.en} ${s.enter}`} style={{ animationDelay: '600ms' }}>
          <Txt>{couple.groom.name.en}</Txt>
          <span className={s.amp} aria-hidden="true">
            &amp;
          </span>
          <span className="visually-hidden"> and </span>
          <Txt>{couple.bride.name.en}</Txt>
        </p>
        <p lang="km" className={`km-display ${s.km} ${s.enter}`} style={{ animationDelay: '750ms' }}>
          <Txt>{couple.groom.name.km}</Txt> <LotusRosette size={18} className={s.inlineRosette} /> <Txt>{couple.bride.name.km}</Txt>
        </p>
        <p className={`${s.date} ${s.enter}`} style={{ animationDelay: '900ms' }} data-placeholder={event.dateIsPlaceholder || undefined}>
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
