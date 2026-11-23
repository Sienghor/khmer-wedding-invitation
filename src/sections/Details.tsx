import { wedding } from '../config/wedding';
import { Bi } from '../components/Bi';
import { EnglishContext, englishIn } from '../lib/lang';
import { Countdown } from '../components/Countdown';
import { SectionHeader } from '../components/SectionHeader';
import { Lintel } from '../ornaments/Lintel';
import { LotusPetalBand } from '../ornaments/LotusPetalBand';
import { LotusRosette } from '../ornaments/LotusRosette';
import { Reveal } from '../motion/Reveal';
import { formatEventDate } from '../lib/date';
import { googleCalendarUrl, downloadIcs } from '../lib/calendar';
import { mapsUrl } from '../lib/maps';
import s from './Details.module.css';

/** 03 · Wedding details: date, countdown, venue and map, dress code, notes. */
export function Details() {
  const { event } = wedding;
  const date = formatEventDate();
  const ph = event.dateIsPlaceholder;
  const maps = mapsUrl();
  // Practical details stay bilingual (display.englishSections) so non-Khmer readers can find their way.
  const EN = englishIn('details');
  return (
    <EnglishContext.Provider value={EN}>
      <section className={s.section} aria-labelledby="details-title" id="details">
        <LotusPetalBand height={20} tone="light" className={s.bandTop} />
        <div className={`${s.lintelBg} parallax`} style={{ ['--depth' as string]: '60px' }} aria-hidden="true">
          <Lintel tone="light" />
        </div>

        <div className={s.inner}>
          <SectionHeader km="ព័ត៌មានពិធី" en="Wedding Details" tone="light" crown="pediment" id="details-title" />

          <Reveal className={s.date} data-placeholder={ph || undefined} title={ph ? 'Placeholder date: set event.start in src/config/wedding.ts' : undefined}>
            <span className={s.month}>{date.month}</span>
            <span className={s.dayRow}>
              <span className={s.rule} />
              <span className={s.day}>{date.day}</span>
              <span className={s.rule} />
            </span>
            <span className={s.year}>{date.year}</span>
            <span lang="km" className={s.dateKm}>
              {date.km}
            </span>
            <span className={s.time} data-placeholder={event.timeIsPlaceholder || undefined} title={event.timeIsPlaceholder ? 'Placeholder time: set event.start in src/config/wedding.ts' : undefined}>
              {event.timeIsPlaceholder ? <span className="ph">[ម៉ោង · Time]</span> : date.time}
            </span>
            {ph && <span className={s.phNote}>Date to be confirmed</span>}
          </Reveal>

          <Reveal i={1} className={s.countdown}>
            <Countdown />
          </Reveal>

          <div className={s.cards}>
            <Reveal className={s.card} i={0}>
              <LotusRosette size={30} tone="light" />
              <h3 className={s.cardTitle}>
                <span lang="km">ទីកន្លែង</span>
                {EN && <span lang="en">Venue</span>}
              </h3>
              <Bi value={event.venue.name} kmClass={s.venueKm} enClass={s.venueEn} />
              <Bi value={event.venue.address} kmClass={s.small} enClass={s.smallEn} />
              <div className={s.actions}>
                {maps ? (
                  <a className={s.btn} href={maps} target="_blank" rel="noreferrer">
                    <span lang="km">មើលផែនទី</span> · Directions
                  </a>
                ) : (
                  <span className={`${s.btn} ${s.btnDisabled}`} title="Set event.venue.maps in src/config/wedding.ts">
                    <span lang="km">ផែនទី</span> · <span className="ph">Map link</span>
                  </span>
                )}
              </div>
            </Reveal>

            <Reveal className={s.card} i={1}>
              <LotusRosette size={30} tone="light" />
              <h3 className={s.cardTitle}>
                <span lang="km">សម្លៀកបំពាក់</span>
                {EN && <span lang="en">Dress Code</span>}
              </h3>
              <Bi value={event.dressCode} kmClass={s.small} enClass={s.smallEn} />
            </Reveal>

            <Reveal className={s.card} i={2}>
              <LotusRosette size={30} tone="light" />
              <h3 className={s.cardTitle}>
                <span lang="km">ព័ត៌មានសំខាន់</span>
                {EN && <span lang="en">Good to Know</span>}
              </h3>
              <ul className={s.notes}>
                {event.notes.map((n, i) => (
                  <li key={i}>
                    <Bi value={n} as="span" kmClass={s.small} enClass={s.smallEn} />
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal className={s.calendar}>
            <a className={s.btn} href={googleCalendarUrl()} target="_blank" rel="noreferrer">
              Google Calendar
            </a>
            <button type="button" className={s.btn} onClick={downloadIcs}>
              <span lang="km">បញ្ចូលក្នុងប្រតិទិន</span> · Apple / Outlook (.ics)
            </button>
          </Reveal>
        </div>
        <LotusPetalBand height={20} tone="light" className={s.bandBottom} />
      </section>
    </EnglishContext.Provider>
  );
}
