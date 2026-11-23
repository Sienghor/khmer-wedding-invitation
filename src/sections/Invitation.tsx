import { wedding } from '../config/wedding';
import { Bi } from '../components/Bi';
import { SectionHeader } from '../components/SectionHeader';
import { CeremonialFrame } from '../ornaments/CeremonialFrame';
import { LotusRosette } from '../ornaments/LotusRosette';
import { PhotoFrame } from '../gallery/PhotoFrame';
import { WallTapestry } from '../ornaments/WallTapestry';
import { Reveal } from '../motion/Reveal';
import { Tilt3D } from '../motion/Tilt3D';
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
      <SectionHeader km="សំបុត្រអញ្ជើញ" en="The Invitation" id="invitation-title" />

      <Reveal variant="scale" className={s.card}>
        <Tilt3D max={2.5}>
        <CeremonialFrame>
          <div className={s.parents}>
            {[parents.groom, parents.bride].map((side, i) => (
              <Reveal key={i} i={i} className={s.side}>
                <p className={s.sideLabel}>
                  <span lang="km">{side.label.km}</span>
                  {EN && <span lang="en">{side.label.en}</span>}
                </p>
                <Bi value={side.father} kmClass={s.parentKm} enClass={s.parentEn} />
                <Bi value={side.mother} kmClass={s.parentKm} enClass={s.parentEn} />
              </Reveal>
            ))}
          </div>

          <Reveal className={s.message} i={2}>
            <p lang="km" className={s.heading}>
              {invitation.heading.km}
            </p>
            <p lang="km" className={s.msgKm}>
              <Txt>{invitation.message.km}</Txt>
            </p>
            {EN && (
              <p lang="en" className={s.msgEn}>
                <Txt>{invitation.message.en}</Txt>
              </p>
            )}
          </Reveal>
        </CeremonialFrame>
        </Tilt3D>
      </Reveal>

      <div className={s.couple}>
        <Reveal className={s.person} i={0}>
          <Tilt3D className="parallax" style={{ ['--depth' as string]: '18px' }}>
            <PhotoFrame id="groom" className={s.portrait} sizes="(min-width: 900px) 400px, 42vw" />
          </Tilt3D>
          <p className={s.role}>
            <span lang="km">{couple.groom.role.km}</span>
            {EN && <span lang="en">{couple.groom.role.en}</span>}
          </p>
          <h3 className={s.name}>
            <span lang="km" className="km-display">
              <Txt>{couple.groom.name.km}</Txt>
            </span>
            <span lang="en">
              <Txt>{couple.groom.name.en}</Txt>
            </span>
          </h3>
        </Reveal>
        <Reveal variant="fade" className={s.amp} i={1} aria-hidden="true">
          <LotusRosette size={40} />
          <span>&amp;</span>
        </Reveal>
        <Reveal className={s.person} i={2}>
          <Tilt3D className="parallax" style={{ ['--depth' as string]: '30px' }}>
            <PhotoFrame id="bride" className={s.portrait} sizes="(min-width: 900px) 400px, 42vw" />
          </Tilt3D>
          <p className={s.role}>
            <span lang="km">{couple.bride.role.km}</span>
            {EN && <span lang="en">{couple.bride.role.en}</span>}
          </p>
          <h3 className={s.name}>
            <span lang="km" className="km-display">
              <Txt>{couple.bride.name.km}</Txt>
            </span>
            <span lang="en">
              <Txt>{couple.bride.name.en}</Txt>
            </span>
          </h3>
        </Reveal>
      </div>
    </section>
  );
}
