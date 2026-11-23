import { wedding } from '../config/wedding';
import { SectionHeader } from '../components/SectionHeader';
import { LotusRosette } from '../ornaments/LotusRosette';
import { VineBand } from '../ornaments/VineBand';
import { Reveal } from '../motion/Reveal';
import { Txt } from '../lib/text';
import s from './Schedule.module.css';
import { EN } from '../lib/lang';
import { formatEventDate } from '../lib/date';

/** Midday in Cambodia on that day, so the weekday never shifts with the guest's time zone. */
const dayDate = (iso: string) => formatEventDate(new Date(`${iso}T12:00:00+07:00`));

/**
 * 05 · Ceremony programme, one group per day. The spine is a Banteay Srei
 * pilaster of foliated scrolls (KH-VIN-01), grown by scroll where scroll-driven
 * animations are supported, threading lotus rosettes (KH-LOT-02).
 */
export function Schedule() {
  return (
    <section className={s.section} aria-labelledby="schedule-title" id="schedule">
      <SectionHeader km="កម្មវិធីពិធី" en="Ceremony Programme" id="schedule-title" />
      <div className={s.wrap}>
        <div className={s.spine} aria-hidden="true">
          <VineBand orientation="vertical" size={20} />
        </div>
        {wedding.schedule.map((day) => (
          <div key={day.date} className={s.day}>
            <Reveal as="h3" className={s.dayTitle} i={0}>
              <span lang="km">{dayDate(day.date).km}</span>
              {EN && <span lang="en">{dayDate(day.date).en}</span>}
            </Reveal>
            <ol className={s.list}>
              {day.items.map((item, i) => (
                <Reveal as="li" key={i} className={s.item} i={0}>
                  <span className={s.node} aria-hidden="true">
                    <LotusRosette size={30} />
                  </span>
                  <p className={s.time}>
                    <span lang="km">
                      <Txt>{item.time.km}</Txt>
                    </span>
                    {EN && (
                      <span lang="en">
                        <Txt>{item.time.en}</Txt>
                      </span>
                    )}
                  </p>
                  <div className={s.body}>
                    <h4 className={s.title}>
                      <span lang="km">{item.title.km}</span>
                      {EN && <span lang="en">{item.title.en}</span>}
                    </h4>
                    {item.description && (
                      <p className={s.desc}>
                        <span lang="km">
                          <Txt>{item.description.km}</Txt>
                        </span>
                        {EN && (
                          <>
                            {' '}
                            <span lang="en">
                              <Txt>{item.description.en}</Txt>
                            </span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <p className={s.note}>
        <span lang="km">លំដាប់ពិធីអាចប្រែប្រួលតាមការកំណត់របស់ក្រុមគ្រួសារ</span>
        {EN && <span lang="en">The order of rites may be adjusted by the families.</span>}
      </p>
    </section>
  );
}
