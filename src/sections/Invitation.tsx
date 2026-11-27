import { wedding } from '../config/wedding';
import { Bi } from '../components/Bi';
import { SectionHeader } from '../components/SectionHeader';
import { CeremonialFrame } from '../ornaments/CeremonialFrame';
import { RomdoulFlower } from '../ornaments/RomdoulFlower';
import { PhotoFrame } from '../gallery/PhotoFrame';
import { WallTapestry } from '../ornaments/WallTapestry';
import { Reveal } from '../motion/Reveal';
import { Txt } from '../lib/text';
import { EN } from '../lib/lang';
import s from './Invitation.module.css';

/** 02 · Formal invitation: parents, the formal message, bride & groom. */
export function Invitation() {
  const { parents, invitation, couple } = wedding;
  return (
    <section className={s.section} aria-labelledby="invitation-title" id="invitation">
      <div className="wall-tapestry">
        <WallTapestry />
      </div>
      <SectionHeader km="សំបុត្រអញ្ជើញ" en="The Invitation" id="invitation-title" rhythm="answer" />

      <Reveal className={s.card}>
        <CeremonialFrame>
          <div className={s.parents}>
            {[parents.groom, parents.bride].map((side, i) => (
              <Reveal key={i} variant="fade" at={0.6 + i * 0.9} className={s.side}>
                <p className={s.sideLabel}>
                  <span lang="km">{side.label.km}</span>
                  {EN && <span lang="en">{side.label.en}</span>}
                </p>
                <Bi value={side.father} kmClass={s.parentKm} enClass={s.parentEn} />
                <Bi value={side.mother} kmClass={s.parentKm} enClass={s.parentEn} />
              </Reveal>
            ))}
          </div>

          <div className={s.message}>
            <Reveal as="p" variant="mask" lang="km" className={s.heading}>
              {invitation.heading.km}
            </Reveal>
            <Reveal as="p" variant="fade" at={0.8} lang="km" className={s.msgKm}>
              <Txt>{invitation.message.km}</Txt>
            </Reveal>
            {EN && (
              <Reveal as="p" variant="fade" at={1.4} lang="en" className={s.msgEn}>
                <Txt>{invitation.message.en}</Txt>
              </Reveal>
            )}
          </div>
        </CeremonialFrame>
      </Reveal>

      <div className={s.couple}>
        <div className={s.person}>
          <div className="parallax" style={{ ['--depth' as string]: '18px' }}>
            <Reveal variant="image" className={s.portraitWrap}>
              <PhotoFrame id="groom" className={s.portrait} sizes="(min-width: 900px) 400px, 42vw" />
            </Reveal>
          </div>
          <Reveal as="p" variant="fade" at={1} className={s.role}>
            <span lang="km">{couple.groom.role.km}</span>
            {EN && <span lang="en">{couple.groom.role.en}</span>}
          </Reveal>
          <Reveal as="h3" variant="mask" at={1.4} className={s.name}>
            <span lang="km" className="km-display">
              <Txt>{couple.groom.name.km}</Txt>
            </span>
            <span lang="en">
              <Txt>{couple.groom.name.en}</Txt>
            </span>
          </Reveal>
        </div>
        <Reveal variant="fade" className={s.amp} at={2} aria-hidden="true">
          <RomdoulFlower size={40} />
          <span>&amp;</span>
        </Reveal>
        <div className={s.person}>
          <div className="parallax" style={{ ['--depth' as string]: '30px' }}>
            <Reveal variant="image" at={0.6} className={s.portraitWrap}>
              <PhotoFrame id="bride" className={s.portrait} sizes="(min-width: 900px) 400px, 42vw" />
            </Reveal>
          </div>
          <Reveal as="p" variant="fade" at={1.6} className={s.role}>
            <span lang="km">{couple.bride.role.km}</span>
            {EN && <span lang="en">{couple.bride.role.en}</span>}
          </Reveal>
          <Reveal as="h3" variant="mask" at={2} className={s.name}>
            <span lang="km" className="km-display">
              <Txt>{couple.bride.name.km}</Txt>
            </span>
            <span lang="en">
              <Txt>{couple.bride.name.en}</Txt>
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
