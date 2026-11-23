import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { wedding } from '../config/wedding';
import { Glass } from '../glass/Glass';
import { Colonnette } from '../ornaments/Colonnette';
import { Lintel } from '../ornaments/Lintel';
import { LotusRosette } from '../ornaments/LotusRosette';
import { DOOR, DOOR_ASPECT, DOOR_TOTAL_H, PED_BOX, PED_TIERS } from '../three/doorwayGeometry';
import { Pediment } from '../ornaments/Pediment';
import { shouldUse3D } from '../three/capability';
import type { DoorwayHandle } from '../three/Doorway3D';
import { prefersReducedMotion } from '../motion/useReducedMotion';
import { formatEventDate } from '../lib/date';
import { readGuest } from '../lib/guest';
import { Txt } from '../lib/text';
import s from './Opening.module.css';
import { music } from '../lib/music';

const Doorway3D = lazy(() => import('../three/Doorway3D'));

type Phase = 'assembling' | 'named' | 'ready' | 'leaving';

/** Percentages that place SVG parts and HTML overlays on the same doorway as the 3D scene. */
const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const layout = {
  pedTop: pct(PED_BOX.top, DOOR_TOTAL_H),
  pedW: pct(PED_BOX.w, DOOR.lintelW),
  lintelTop: pct(PED_BOX.top, DOOR_TOTAL_H),
  lintelH: pct(DOOR.lintelH, DOOR_TOTAL_H),
  openingTop: pct(PED_BOX.top + DOOR.lintelH, DOOR_TOTAL_H),
  columnTop: pct(PED_BOX.top + DOOR.lintelH, DOOR_TOTAL_H),
  columnH: pct(DOOR.columnH, DOOR_TOTAL_H),
  // The 2D colonnette's elevation is 2·1.45·17 wide per 400 tall (see Colonnette.tsx).
  columnW: pct(DOOR.columnH * ((2 * 1.45 * 17) / 400), DOOR.lintelW),
  columnLeft: pct(DOOR.lintelW / 2 - DOOR.columnX, DOOR.lintelW),
  openingInset: pct(DOOR.lintelW / 2 - DOOR.columnX + DOOR.columnR * 1.6, DOOR.lintelW),
  thresholdH: pct(DOOR.threshold, DOOR_TOTAL_H),
};

/**
 * 01 · Ceremonial opening.
 * Background light rises → the doorway assembles (colonnettes rise, lintel
 * settles) → raking light crosses the lintel → names appear in the opening →
 * the guest is greeted by name → "Open" passes through the doorway.
 */
export function Opening({ onOpened }: { onOpened: () => void }) {
  const [use3D, setUse3D] = useState(shouldUse3D);
  const [phase, setPhase] = useState<Phase>('assembling');
  const frameRef = useRef<HTMLDivElement>(null);
  const door = useRef<DoorwayHandle>(null);
  const button = useRef<HTMLButtonElement>(null);
  const guest = readGuest();
  const date = formatEventDate();
  const { couple } = wedding;
  const reduced = prefersReducedMotion();

  // The choreography clock starts when the doorway is ready: immediately for the
  // SVG doorway, or when the lazily-loaded 3D scene renders its first frame.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  useEffect(() => {
    document.body.classList.add('is-locked');
    return () => document.body.classList.remove('is-locked');
  }, []);
  useEffect(() => {
    if (!use3D) setStartedAt((t) => t ?? performance.now());
    // Safety net: if 3D has not started within 4 s, fall back to the SVG doorway.
    const guard = use3D ? setTimeout(() => setStartedAt((t) => (t === null ? (setUse3D(false), performance.now()) : t)), 4000) : 0;
    return () => clearTimeout(guard);
  }, [use3D]);
  useEffect(() => {
    if (startedAt === null) return;
    const t1 = setTimeout(() => setPhase((p) => (p === 'assembling' ? 'named' : p)), reduced ? 0 : 2500);
    const t2 = setTimeout(() => setPhase((p) => (p === 'named' ? 'ready' : p)), reduced ? 0 : 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [startedAt, reduced]);

  useEffect(() => {
    if (phase === 'ready') button.current?.focus({ preventScroll: true });
  }, [phase]);

  const onReady = useCallback(() => setStartedAt((t) => t ?? performance.now()), []);
  const onError = useCallback(() => setUse3D(false), []);

  const open = async () => {
    if (phase === 'leaving') return;
    // Must run inside the tap itself: browsers only allow sound after a gesture.
    music.startFromGesture();
    setPhase('leaving');
    const minimum = new Promise((r) => setTimeout(r, reduced ? 0 : 1300));
    await Promise.all([use3D && door.current ? door.current.open() : Promise.resolve(), minimum]);
    onOpened();
  };

  return (
    <section className={s.gate} data-phase={phase} data-mode={use3D ? '3d' : 'svg'} aria-labelledby="opening-title">
      <div className={s.backdrop} aria-hidden="true" />
      {use3D && (
        <Suspense fallback={null}>
          <Doorway3D frameRef={frameRef} handle={door} onReady={onReady} onError={onError} className={s.canvas} />
        </Suspense>
      )}

      <div className={s.layout}>
        <header className={s.top}>
          <h1 id="opening-title" className={s.title}>
            <span lang="km" className="km-display">
              {wedding.invitation.heading.km}
            </span>
            {/* The welcome page always keeps English, smaller, under the Khmer. */}
            <span lang="en" className={s.titleEn}>
              The Wedding Celebration
            </span>
          </h1>
        </header>

        <div className={s.stage}>
          <div ref={frameRef} className={s.frame} style={{ aspectRatio: String(DOOR_ASPECT), height: `min(100cqh, calc(100cqw / ${DOOR_ASPECT.toFixed(4)}), 760px)` }}>
            {!use3D && (
              <div className={s.svgDoor} aria-hidden="true">
                <div className={s.svgPediment} style={{ width: layout.pedW }}>
                  <Pediment width="100%" tiers={PED_TIERS} stone />
                </div>
                <div className={s.svgLintel} style={{ top: layout.lintelTop, height: layout.lintelH }}>
                  <Lintel tone="gold" relief sweep={!reduced} />
                </div>
                {(['left', 'right'] as const).map((side) => (
                  <div
                    key={side}
                    className={s.svgColumn}
                    data-side={side}
                    style={{ top: layout.columnTop, height: layout.columnH, width: layout.columnW, [side]: `calc(${layout.columnLeft} - ${layout.columnW} / 2)` }}
                  >
                    <Colonnette style={{ width: '100%', height: '100%' }} />
                  </div>
                ))}
                <div className={s.svgThreshold} style={{ height: layout.thresholdH }} />
              </div>
            )}

            <div className={s.opening} style={{ top: layout.openingTop, bottom: layout.thresholdH, left: layout.openingInset, right: layout.openingInset }}>
              <div className={s.names}>
                <span className={s.nameEn}>
                  <Txt>{couple.groom.name.en}</Txt>
                </span>
                <span lang="km" className={`km-display ${s.nameKm}`}>
                  <Txt>{couple.groom.name.km}</Txt>
                </span>
                <span className={s.amp} aria-hidden="true">
                  <LotusRosette size={26} tone="light" />
                </span>
                <span className="visually-hidden">and</span>
                <span className={s.nameEn}>
                  <Txt>{couple.bride.name.en}</Txt>
                </span>
                <span lang="km" className={`km-display ${s.nameKm}`}>
                  <Txt>{couple.bride.name.km}</Txt>
                </span>
              </div>
              <p className={s.date} data-placeholder={wedding.event.dateIsPlaceholder || undefined}>
                {date.short}
              </p>
            </div>
          </div>
        </div>

        <footer className={s.bottom}>
          <p className={s.greeting}>
            <span lang="km">សូមគោរពអញ្ជើញ</span>
            <span className={s.guest} lang={guest.personalised ? undefined : 'km'}>
              {guest.km}
            </span>
            {!guest.personalised && (
              <span lang="en" className={s.guestEn}>
                {guest.en}
              </span>
            )}
          </p>
          <Glass as="button" ref={button as React.Ref<HTMLElement | null>} type="button" className={s.openBtn} onClick={open} tone="dark" data-open-invitation>
            <span lang="km">បើកសំបុត្រ</span>
            <span lang="en" className={s.openEn}>
              Open Invitation
            </span>
          </Glass>
        </footer>
      </div>
      <div className={s.wash} aria-hidden="true" />
    </section>
  );
}
