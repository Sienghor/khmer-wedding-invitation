import { useCallback } from 'react';
import { wedding } from '../config/wedding';
import { SectionHeader } from '../components/SectionHeader';
import { LotusRosette } from '../ornaments/LotusRosette';
import { VineBand } from '../ornaments/VineBand';
import { Reveal } from '../motion/Reveal';
import { Txt } from '../lib/text';
import s from './Schedule.module.css';
import { EN } from '../lib/lang';
import { formatEventDate } from '../lib/date';
import { useMinute } from '../lib/now';
import { riteState } from '../lib/programme';

/** Midday in Cambodia on that day, so the weekday never shifts with the guest's time zone. */
const dayDate = (iso: string) => formatEventDate(new Date(`${iso}T12:00:00+07:00`));

/*
 * Fallback for browsers without scroll-driven animations: one shared observer
 * marks each rite once it is in view; the CSS then blooms the rosette and
 * brings in the time, then the title. (Where view() timelines exist, the CSS
 * ties the same motion to the scroll position instead and ignores this.)
 */
let io: IntersectionObserver | null = null;
function arrive(el: HTMLElement | null) {
  if (!el) return;
  if (typeof IntersectionObserver === 'undefined') {
    el.dataset.arrived = 'true';
    return;
  }
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.arrived = 'true';
          io!.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -25% 0px' },
  );
  io.observe(el);
}

/**
 * 05 · Ceremony programme, one group per day. The spine is a Banteay Srei
 * pilaster of foliated scrolls (KH-VIN-01), grown by scroll where scroll-driven
 * animations are supported; each lotus rosette (KH-LOT-02) blooms as the
 * spine reaches it. On the wedding days the programme is live: past rites
 * dim and the current one glows with a "now" tag (see lib/programme.ts).
 */
export function Schedule() {
  const t = useMinute();
  const ref = useCallback(arrive, []);
  return (
    <section className={s.section} aria-labelledby="schedule-title" id="schedule">
      <SectionHeader km="កម្មវិធីពិធី" en="Ceremony Programme" id="schedule-title" />
      <div className={s.wrap}>
        <div className={s.spine} aria-hidden="true">
          <VineBand orientation="vertical" size={20} />
        </div>
        {wedding.schedule.map((day, d) => (
          <div key={day.date} className={s.day}>
            <Reveal as="h3" className={s.dayTitle} variant="fade">
              <span lang="km">{dayDate(day.date).km}</span>
              {EN && <span lang="en">{dayDate(day.date).en}</span>}
            </Reveal>
            <ol className={s.list}>
              {day.items.map((item, i) => {
                const state = riteState(t, d, i);
                return (
                  <li
                    key={i}
                    ref={ref}
                    className={s.item}
                    data-state={state ?? undefined}
                    aria-current={state === 'now' ? 'time' : undefined}
                  >
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
                      {state === 'now' && (
                        <span className={s.nowTag}>
                          <span lang="km">ឥឡូវនេះ</span>
                          {EN && <span lang="en">Now</span>}
                        </span>
                      )}
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
                  </li>
                );
              })}
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
