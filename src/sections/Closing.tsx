import { wedding } from '../config/wedding';
import { TowerQuincunx } from '../ornaments/TowerQuincunx';
import { BayonTower } from '../ornaments/BayonTower';
import { NagaBalustrade } from '../ornaments/NagaBalustrade';
import { LotusPetalBand } from '../ornaments/LotusPetalBand';
import { OrnamentDivider } from '../ornaments/OrnamentDivider';
import { EN } from '../lib/lang';
import { Reveal } from '../motion/Reveal';
import { LazyScene } from '../three/LazyScene';
import { Txt } from '../lib/text';
import s from './Closing.module.css';

/**
 * 07 · Closing. The journey that began at a temple doorway ends before the
 * sanctuary: Angkor Wat's quincunx of lotus-bud towers (KH-TWR-01) rises out
 * of the dusk, outer towers first, above the naga causeway (KH-NAG-02).
 * On capable devices this is a 3D scene the camera orbits as the guest scrolls.
 * Above the thanks, a Bayon face tower (KH-BAY-01): faces that "symbolize
 * compassion", looking to the four directions, as a closing blessing.
 */
export function Closing({ onReplay }: { onReplay: () => void }) {
  const { closing } = wedding;
  return (
    <section className={s.section} aria-labelledby="closing-title" id="closing">
      <div className={s.text}>
        <Reveal variant="scale" className={s.bayon}>
          <BayonTower width="100%" />
        </Reveal>
        <Reveal as="h2" id="closing-title" className={s.heading}>
          <span lang="km" className="km-display">
            {closing.heading.km}
          </span>
          {EN && <span lang="en">{closing.heading.en}</span>}
        </Reveal>
        <Reveal i={1} className={s.message}>
          <p lang="km">{closing.message.km}</p>
          {EN && (
            <p lang="en" className={s.messageEn}>
              {closing.message.en}
            </p>
          )}
        </Reveal>
        <Reveal variant="draw" i={2}>
          <OrnamentDivider tone="light" width={220} />
        </Reveal>
        <Reveal i={3} className={s.signature}>
          <span lang="km">
            <Txt>{closing.signature.km}</Txt>
          </span>
          <span lang="en">
            <Txt>{closing.signature.en}</Txt>
          </span>
        </Reveal>
      </div>

      <Reveal variant="fade" className={s.scene}>
        <LazyScene
          kind="temple"
          className={s.temple}
          fallback={
            <div className={s.svgScene}>
              <TowerQuincunx className={s.towers} />
              <NagaBalustrade tone="light" className={s.causeway} />
              <LotusPetalBand height={18} tone="light" className={s.base} />
            </div>
          }
        />
      </Reveal>

      <footer className={s.footer}>
        <button type="button" className={s.replay} onClick={onReplay}>
          <span lang="km">មើលការបើកសំបុត្រម្ដងទៀត</span>
          {EN && ' · Replay opening'}
        </button>
      </footer>
    </section>
  );
}
