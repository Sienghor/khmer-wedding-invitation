import { useRef, useState } from 'react';
import { wedding } from '../config/wedding';
import { Bi } from '../components/Bi';
import { EnglishContext, englishIn } from '../lib/lang';
import { Countdown } from '../components/Countdown';
import { SectionHeader } from '../components/SectionHeader';
import { Lintel } from '../ornaments/Lintel';
import { LotusPetalBand } from '../ornaments/LotusPetalBand';
import { LotusRosette } from '../ornaments/LotusRosette';
import { RomdoulFlower } from '../ornaments/RomdoulFlower';
import { Reveal } from '../motion/Reveal';
import { formatEventDate } from '../lib/date';
import { googleCalendarUrl, downloadIcs } from '../lib/calendar';
import { mapsUrl } from '../lib/maps';
import s from './Details.module.css';

const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 03 · Wedding details: date, countdown, venue and map, dress code, calendar.
 *
 * Adding the date to a calendar presses a lotus seal (KH-LOT-02) onto the date.
 * We cannot know whether the guest then saved the event, so the button only
 * says the calendar was opened. Nothing is persisted.
 */
export function Details() {
  const { event } = wedding;
  const section = useRef<HTMLElement>(null);
  const [opened, setOpened] = useState<{ google: boolean; ics: boolean }>({ google: false, ics: false });
  const [stamp, setStamp] = useState(0);

  function seal(which: 'google' | 'ics') {
    setOpened((o) => ({ ...o, [which]: true }));
    setStamp((n) => n + 1);
    const tile = section.current?.querySelector<HTMLElement>(`.${s.date}`);
    if (!tile || reducedMotion()) return;
    // Lift, hold while the seal descends, then settle as it presses on. No overshoot.
    tile.animate(
      [
        { translate: '0 0', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        { translate: '0 -6px', offset: 0.3 },
        { translate: '0 -6px', offset: 0.56, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
        { translate: '0 0', offset: 0.7 },
        { translate: '0 0' },
      ],
      { duration: 900 },
    );
  }

  const date = formatEventDate();
  const ph = event.dateIsPlaceholder;
  const maps = mapsUrl();
  // Practical details stay bilingual (display.englishSections) so non-Khmer readers can find their way.
  const EN = englishIn('details');
  const openedLabel = (
    <>
      <span aria-hidden="true">✓</span>
      <span lang="km">បានបើកប្រតិទិន</span>
      {EN && ' · Calendar opened'}
    </>
  );
  return (
    <EnglishContext.Provider value={EN}>
      <section ref={section} className={s.section} aria-labelledby="details-title" id="details">
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
              <span className={s.day}>
                {date.day}
                {stamp > 0 && (
                  <span key={stamp} className={s.seal}>
                    <RomdoulFlower size={48} tone="gold" />
                  </span>
                )}
              </span>
              <span className={s.rule} />
            </span>
            <span className={s.year}>{date.year}</span>
            <span lang="km" className={s.dateKm}>
              {date.km}
            </span>
            <span className={s.time} data-placeholder={event.timeIsPlaceholder || undefined} title={event.timeIsPlaceholder ? 'Placeholder time: set event.start in src/config/wedding.ts' : undefined}>
              {event.timeIsPlaceholder ? (
                <span className="ph">[ម៉ោង · Time]</span>
              ) : (
                <>
                  <span lang="km" className={s.timeKm}>
                    {event.label.km} · {date.timeKm}
                  </span>
                  {EN && (
                    <span lang="en" className={s.timeEn}>
                      {event.label.en} · {date.timeEn}
                    </span>
                  )}
                </>
              )}
            </span>
            {ph && <span className={s.phNote}>Date to be confirmed</span>}
          </Reveal>

          {/* Calendar actions sit under the date they add, so the seal lands where the guest is looking. */}
          <Reveal className={s.calendar}>
            <a className={s.btn} data-opened={opened.google || undefined} href={googleCalendarUrl()} target="_blank" rel="noreferrer" onClick={() => seal('google')}>
              {opened.google ? openedLabel : 'Google Calendar'}
            </a>
            <button
              type="button"
              className={s.btn}
              data-opened={opened.ics || undefined}
              onClick={() => {
                downloadIcs();
                seal('ics');
              }}
            >
              {opened.ics ? (
                openedLabel
              ) : (
                <>
                  <span lang="km">បញ្ចូលក្នុងប្រតិទិន</span> · Apple / Outlook (.ics)
                </>
              )}
            </button>
            <span className="visually-hidden" role="status">
              {opened.google || opened.ics ? (EN ? 'បានបើកប្រតិទិន · Calendar opened' : 'បានបើកប្រតិទិន') : ''}
            </span>
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
          </div>

        </div>
        <LotusPetalBand height={20} tone="light" className={s.bandBottom} />
      </section>
    </EnglishContext.Provider>
  );
}
